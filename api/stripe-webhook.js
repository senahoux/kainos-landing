// Vercel Serverless Function — Stripe webhook handler
// POST /api/stripe-webhook
//
// IMPORTANT: This function reads the raw request body BEFORE any JSON parse
// because Stripe's signature verification requires the exact bytes sent by Stripe.
// Vercel buffers the body in the readable stream; we collect it manually.
//
// Events handled:
//   checkout.session.completed  → upsert subscription as active
//   invoice.paid                → confirm subscription active (renewal)
//   invoice.payment_failed      → set status past_due
//   customer.subscription.deleted → cancel subscription

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service-role key to bypass RLS and write from server side
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ─── Raw body collector ────────────────────────────────────────────────────────
// Vercel gives us a Node.js IncomingMessage (readable stream).
// We must collect the bytes ourselves — do NOT call res.json() or body-parsers
// before this, or the stream will be consumed and verification will fail.
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!WEBHOOK_SECRET) {
        console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
        return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // 1. Collect raw bytes
    let rawBody;
    try {
        rawBody = await getRawBody(req);
    } catch (err) {
        console.error("[webhook] Failed to read raw body:", err.message);
        return res.status(400).send("Could not read request body");
    }

    // 2. Verify Stripe signature
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
    } catch (err) {
        console.error("[webhook] Signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 3. Route events
    console.log(`[webhook] Received event: ${event.type} (${event.id})`);

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object);
                break;
            case "invoice.paid":
                await handleInvoicePaid(event.data.object);
                break;
            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event.data.object);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`[webhook] Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        // Log the error but return 200 to avoid Stripe retrying indefinitely
        // for bugs on our side — re-throw only for transient errors if needed.
        console.error(`[webhook] Handler error for ${event.type}:`, err.message);
    }

    return res.status(200).json({ received: true });
}

// ─── Event handlers ───────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 * Fired once after a successful checkout. We upsert the subscription record.
 *
 * User identification priority:
 *   1. session.client_reference_id  — set when user was logged in before checkout
 *   2. session.metadata.user_id     — same value, belt-and-suspenders copy
 *   3. customer_email               — landing flow: user pays before creating account
 */
async function handleCheckoutCompleted(session) {
    const userId =
        session.client_reference_id ||
        session.metadata?.user_id ||
        null;
    const customerEmail =
        session.customer_email ||
        session.customer_details?.email ||
        null;
    const stripeCustomerId = session.customer;
    const stripeSubscriptionId = session.subscription;

    if (!stripeSubscriptionId) {
        console.warn("[webhook] checkout.session.completed: no subscription ID, skipping");
        return;
    }

    // Fetch full subscription for current_period_end and price
    let priceId = null;
    let currentPeriodEnd = null;
    try {
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        priceId = stripeSub.items.data[0]?.price?.id || null;
        currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
    } catch (err) {
        console.error("[webhook] Failed to retrieve subscription from Stripe:", err.message);
    }

    const payload = {
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
        price_id: priceId,
        current_period_end: currentPeriodEnd,
        customer_email: customerEmail,
        updated_at: new Date().toISOString(),
    };

    if (userId) {
        // Flow 1: User was logged in — link directly by user_id
        const { error } = await supabase
            .from("subscriptions")
            .upsert({ ...payload, user_id: userId }, { onConflict: "user_id" });

        if (error) {
            console.error("[webhook] DB upsert by user_id failed:", error.message);
        } else {
            console.log(`[webhook] Subscription linked to user_id: ${userId}`);
        }
    } else if (customerEmail) {
        // Flow 2: Landing page flow — user pays before creating account.
        // Save with null user_id; a DB trigger will link it on first Google login.
        const { error } = await supabase
            .from("subscriptions")
            .upsert(
                { ...payload, user_id: null },
                { onConflict: "customer_email" } // partial unique index WHERE user_id IS NULL
            );

        if (error) {
            console.error("[webhook] DB upsert by email failed:", error.message);
        } else {
            console.log(`[webhook] Subscription saved by email (pending link): ${customerEmail}`);
        }
    } else {
        console.error("[webhook] checkout.session.completed: no user_id or email — cannot save subscription");
    }
}

/**
 * invoice.paid
 * Fires on every successful renewal. Keeps status = active and updates period end.
 */
async function handleInvoicePaid(invoice) {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    let currentPeriodEnd = null;
    try {
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
    } catch (err) {
        console.error("[webhook] invoice.paid: failed to retrieve subscription:", err.message);
    }

    const { error } = await supabase
        .from("subscriptions")
        .update({
            status: "active",
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) {
        console.error("[webhook] invoice.paid DB update failed:", error.message);
    } else {
        console.log(`[webhook] invoice.paid → status=active for sub: ${stripeSubscriptionId}`);
    }
}

/**
 * invoice.payment_failed
 * Payment failed (e.g. expired card). Move to past_due; user retains access
 * temporarily (Stripe will retry) — app can show a warning banner.
 */
async function handleInvoicePaymentFailed(invoice) {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const { error } = await supabase
        .from("subscriptions")
        .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) {
        console.error("[webhook] invoice.payment_failed DB update failed:", error.message);
    } else {
        console.log(`[webhook] invoice.payment_failed → status=past_due for sub: ${stripeSubscriptionId}`);
    }
}

/**
 * customer.subscription.deleted
 * Subscription was cancelled (immediately or at period end).
 * Sets status = canceled. App gates access by checking status.
 */
async function handleSubscriptionDeleted(subscription) {
    const stripeSubscriptionId = subscription.id;

    const { error } = await supabase
        .from("subscriptions")
        .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", stripeSubscriptionId);

    if (error) {
        console.error("[webhook] subscription.deleted DB update failed:", error.message);
    } else {
        console.log(`[webhook] subscription.deleted → status=canceled for sub: ${stripeSubscriptionId}`);
    }
}
