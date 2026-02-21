// Vercel Serverless Function — Stripe webhook handler
// POST /api/stripe-webhook
//
// Raw body is collected manually from the Node.js stream before any parsing
// so that Stripe signature verification receives the exact bytes.
//
// User-ID resolution priority (per event):
//   1. session.client_reference_id
//   2. session.metadata.user_id
//   3. Email → lookup profiles.id in Supabase (mandatory fallback for landing flow)
//
// HTTP semantics:
//   200 — event processed and written to DB, OR event type not handled
//   400 — bad request / signature failure (Stripe will retry)
//   500 — user not found by any strategy, or Supabase write failed
//         (Stripe will retry, which is what we want until data is consistent)

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ─── Raw body collector ────────────────────────────────────────────────────────
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

// ─── Safe date converter ──────────────────────────────────────────────────────
// Accepts unix seconds (number), ISO string, or null/undefined.
// Always returns ISO string or null — never throws.
function toIso(value) {
    if (value == null) return null;
    try {
        // Unix seconds (Stripe always sends this as a number)
        if (typeof value === "number") return new Date(value * 1000).toISOString();
        // Already a string — validate it
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
        return null;
    }
}

// ─── User-ID resolver ─────────────────────────────────────────────────────────
/**
 * Returns { userId, source } where source is one of:
 *   "client_reference_id" | "metadata" | "email"
 *
 * Returns { userId: null, source: null, error } when resolution fails.
 * The caller must return HTTP 500 in that case so Stripe retries.
 */
async function resolveUserId(directId, metadata, email) {
    // 1. client_reference_id (set when user was already logged in)
    if (directId) {
        console.log(`[webhook] user_id resolved via client_reference_id: ${directId}`);
        return { userId: directId, source: "client_reference_id" };
    }

    // 2. metadata.user_id (belt-and-suspenders copy of the same value)
    const metaId = metadata?.user_id;
    if (metaId) {
        console.log(`[webhook] user_id resolved via metadata: ${metaId}`);
        return { userId: metaId, source: "metadata" };
    }

    // 3. Email fallback — mandatory for landing flow where user pays before signing up
    if (!email) {
        console.error("[webhook] resolveUserId: no client_reference_id, no metadata, no email — cannot resolve");
        return { userId: null, source: null, error: "no_email_available" };
    }

    console.log(`[webhook] resolving user_id by email: ${email}`);
    const { data: profile, error: dbError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (dbError) {
        console.error(`[webhook] profiles lookup error for email ${email}:`, dbError.message);
        return { userId: null, source: null, error: "db_error", detail: dbError.message };
    }

    if (!profile) {
        console.error(`[webhook] profile_not_found_for_email: ${email}`);
        return { userId: null, source: null, error: "profile_not_found_for_email", email };
    }

    console.log(`[webhook] user_id resolved via email (${email}): ${profile.id}`);
    return { userId: profile.id, source: "email" };
}

// ─── profiles.is_premium sync ─────────────────────────────────────────────────
async function setProfilePremium(userId, isPremium) {
    if (!userId) return;
    const { error } = await supabase
        .from("profiles")
        .update({ is_premium: isPremium })
        .eq("id", userId);
    if (error) {
        console.error(`[webhook] profiles.is_premium=${isPremium} failed for ${userId}:`, error.message);
    } else {
        console.log(`[webhook] profiles.is_premium=${isPremium} for user_id: ${userId}`);
    }
}

// ─── Subscription ID extractor ───────────────────────────────────────────────
// Stripe's schema changed: in invoice.paid the subscription lives under
// invoice.parent.subscription_details.subscription (not invoice.subscription).
// This helper tries all known paths and returns the string sub_… id or null.
function getSubscriptionId(obj) {
    const candidates = [
        // checkout.session.completed
        obj?.subscription,
        // invoice.paid (new Stripe schema, 2025+)
        obj?.parent?.subscription_details?.subscription,
        // invoice.paid (fallback: line items)
        obj?.lines?.data?.[0]?.parent?.subscription_item_details?.subscription,
    ];
    for (const c of candidates) {
        if (!c) continue;
        if (typeof c === "string" && c.startsWith("sub_")) return c;
        if (typeof c === "object" && c.id) return c.id;
    }
    return null;
}

// ─── Subscription upsert (merge-safe) ────────────────────────────────────────
// Fetches existing row for user_id first, then merges — only overwrites
// a column if the new value is truthy. This prevents a webhook event
// that lacks subscriptionId from nulling out a previously written sub ID.
async function upsertSubscription(userId, fields) {
    // 1. Fetch existing row so we can merge
    const { data: existing } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id, current_period_end, stripe_customer_id, price_id, customer_email")
        .eq("user_id", userId)
        .maybeSingle();

    // 2. Merge: only overwrite if new value is truthy
    const merged = {
        user_id: userId,
        updated_at: new Date().toISOString(),
        status: fields.status,  // always update status
        stripe_customer_id: fields.stripe_customer_id || existing?.stripe_customer_id || null,
        stripe_subscription_id: fields.stripe_subscription_id || existing?.stripe_subscription_id || null,
        current_period_end: fields.current_period_end || existing?.current_period_end || null,
        price_id: fields.price_id || existing?.price_id || null,
        customer_email: fields.customer_email || existing?.customer_email || null,
    };

    console.log(`[webhook] upsert | user_id: ${userId} | status: ${merged.status} | sub: ${merged.stripe_subscription_id} | period_end: ${merged.current_period_end}`);

    const { error } = await supabase
        .from("subscriptions")
        .upsert(merged, { onConflict: "user_id" });

    if (error) {
        console.error(`[webhook] upsert FAILED | user_id: ${userId} | code: ${error.code} | detail: ${error.details} | msg: ${error.message}`);
        return { ok: false, detail: `${error.message} (${error.code})` };
    }

    console.log(`[webhook] upsert OK | user_id: ${userId}`);
    return { ok: true };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, reason: "method_not_allowed" });
    }

    if (!WEBHOOK_SECRET) {
        console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
        return res.status(500).json({ ok: false, reason: "webhook_secret_not_configured" });
    }

    let rawBody;
    try {
        rawBody = await getRawBody(req);
    } catch (err) {
        console.error("[webhook] failed to read raw body:", err.message);
        return res.status(400).json({ ok: false, reason: "cannot_read_body" });
    }

    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
    } catch (err) {
        console.error("[webhook] signature verification failed:", err.message);
        return res.status(400).json({ ok: false, reason: "signature_failed", detail: err.message });
    }

    console.log(`[webhook] event received: ${event.type} | id: ${event.id}`);

    try {
        switch (event.type) {
            case "checkout.session.completed":
                return await handleCheckoutCompleted(event.data.object, res);
            case "invoice.paid":
                return await handleInvoicePaid(event.data.object, res);
            case "invoice.payment_failed":
                return await handleInvoicePaymentFailed(event.data.object, res);
            case "customer.subscription.deleted":
                return await handleSubscriptionDeleted(event.data.object, res);
            default:
                console.log(`[webhook] unhandled event type: ${event.type} — returning 200`);
                return res.status(200).json({ ok: true, reason: "event_not_handled" });
        }
    } catch (err) {
        console.error(`[webhook] unhandled exception in ${event.type}:`, err.message);
        return res.status(500).json({ ok: false, reason: "internal_error", detail: err.message });
    }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session, res) {
    const email =
        session.customer_details?.email ||
        session.customer_email ||
        null;

    // Use helper to handle string, expanded object, or new Stripe schema paths
    const subscriptionId = getSubscriptionId(session);

    console.log(`[webhook] checkout.session.completed | customer: ${session.customer} | sub: ${subscriptionId} | email: ${email}`);

    const { userId, source, error, ...extra } = await resolveUserId(
        session.client_reference_id,
        session.metadata,
        email
    );

    if (!userId) {
        return res.status(500).json({ ok: false, reason: error, ...extra });
    }

    // Fetch subscription details from Stripe
    let priceId = null;
    let currentPeriodEnd = null;
    if (subscriptionId) {
        try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            priceId = sub.items.data[0]?.price?.id || null;
            currentPeriodEnd = sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null;
        } catch (err) {
            console.error("[webhook] failed to retrieve subscription:", err.message);
        }
    }

    console.log(`[webhook] pre-upsert | user_id: ${userId} | source: ${source} | sub: ${subscriptionId} | period_end: ${currentPeriodEnd}`);

    const result = await upsertSubscription(userId, {
        stripe_customer_id: session.customer || null,
        stripe_subscription_id: subscriptionId,
        status: "active",
        price_id: priceId,
        current_period_end: currentPeriodEnd,
        customer_email: email,
    });

    if (!result.ok) {
        return res.status(500).json({ received: true, ok: false, reason: "supabase_upsert_failed", details: result.detail });
    }

    await setProfilePremium(userId, true);
    return res.status(200).json({ received: true, ok: true, user_id: userId, source });
}

async function handleInvoicePaid(invoice, res) {
    let email = invoice.customer_email || null;

    // Use helper: tries invoice.parent.subscription_details.subscription first (new Stripe schema)
    const subscriptionId = getSubscriptionId(invoice);

    // If email missing on invoice, fetch from Stripe customer
    if (!email && invoice.customer) {
        try {
            const customer = await stripe.customers.retrieve(invoice.customer);
            email = customer.email || null;
        } catch (err) {
            console.error("[webhook] invoice.paid: failed to retrieve customer email:", err.message);
        }
    }

    console.log(`[webhook] invoice.paid | customer: ${invoice.customer} | sub: ${subscriptionId} | email: ${email}`);

    const { userId, source, error, ...extra } = await resolveUserId(null, null, email);

    if (!userId) {
        return res.status(500).json({ ok: false, reason: error, ...extra });
    }

    let currentPeriodEnd = null;
    if (subscriptionId) {
        try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            currentPeriodEnd = sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null;
        } catch (err) {
            console.error("[webhook] invoice.paid: failed to retrieve subscription:", err.message);
        }
    }

    console.log(`[webhook] pre-upsert | user_id: ${userId} | source: ${source} | sub: ${subscriptionId} | period_end: ${currentPeriodEnd}`);

    const result = await upsertSubscription(userId, {
        stripe_customer_id: invoice.customer || null,
        stripe_subscription_id: subscriptionId,
        status: "active",
        current_period_end: currentPeriodEnd,
        customer_email: email,
    });

    if (!result.ok) {
        return res.status(500).json({ received: true, ok: false, reason: "supabase_upsert_failed", details: result.detail });
    }

    await setProfilePremium(userId, true);
    return res.status(200).json({ received: true, ok: true, user_id: userId, source });
}

async function handleInvoicePaymentFailed(invoice, res) {
    let email = invoice.customer_email || null;

    if (!email && invoice.customer) {
        try {
            const customer = await stripe.customers.retrieve(invoice.customer);
            email = customer.email || null;
        } catch (err) {
            console.error("[webhook] invoice.payment_failed: failed to retrieve customer:", err.message);
        }
    }

    console.log(`[webhook] invoice.payment_failed | customer: ${invoice.customer} | sub: ${invoice.subscription} | email: ${email}`);

    const { userId, source, error, ...extra } = await resolveUserId(null, null, email);

    if (!userId) {
        return res.status(500).json({ ok: false, reason: error, ...extra });
    }

    const result = await upsertSubscription(userId, {
        stripe_customer_id: invoice.customer,
        stripe_subscription_id: invoice.subscription,
        status: "past_due",
        customer_email: email,
    });

    if (!result.ok) {
        return res.status(500).json({ received: true, ok: false, reason: "supabase_upsert_failed", details: result.detail });
    }

    await setProfilePremium(userId, false);
    return res.status(200).json({ ok: true, user_id: userId, source });
}

async function handleSubscriptionDeleted(subscription, res) {
    // For subscription.deleted we look up by stripe_subscription_id in our DB
    // then derive the user_id from there — no email needed.
    const stripeSubscriptionId = subscription.id;

    console.log(`[webhook] customer.subscription.deleted | sub: ${stripeSubscriptionId}`);

    const { data: row, error: lookupError } = await supabase
        .from("subscriptions")
        .select("user_id, customer_email")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle();

    if (lookupError) {
        console.error("[webhook] subscription.deleted: DB lookup failed:", lookupError.message);
        return res.status(500).json({ ok: false, reason: "db_lookup_failed" });
    }

    if (!row) {
        // Subscription not in our DB yet — nothing to cancel
        console.warn(`[webhook] subscription.deleted: sub ${stripeSubscriptionId} not found in DB, skipping`);
        return res.status(200).json({ ok: true, reason: "subscription_not_in_db" });
    }

    const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) {
        console.error("[webhook] subscription.deleted: update failed:", error.message);
        return res.status(500).json({ ok: false, reason: "supabase_update_failed" });
    }

    console.log(`[webhook] subscription.deleted → status=canceled for sub: ${stripeSubscriptionId}`);
    await setProfilePremium(row.user_id, false);
    return res.status(200).json({ ok: true, user_id: row.user_id });
}
