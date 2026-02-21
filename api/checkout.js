// Vercel Serverless Function — creates a Stripe Checkout session
// POST /api/checkout  { priceId: string, userId?: string }
//
// userId is optional: sent by the frontend if the user is already logged in
// (e.g. returned to the landing page while authenticated). When present it
// is stored in client_reference_id AND metadata.user_id so the webhook can
// reliably link the subscription to the Supabase user without needing a lookup.
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Server-side allowlist of LIVE price IDs ──────────────────────────────────
// Never trust the frontend — validate against this set before charging the user.
const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY || "price_1T31owLdVnAwm3JUlovYdaik";
const PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY || "price_1T31pcLdVnAwm3JUOBahIxyv";
const ALLOWED_PRICE_IDS = new Set([PRICE_ID_MONTHLY, PRICE_ID_YEARLY]);

export default async function handler(req, res) {
    // CORS headers — restrict to your own domain in production if desired
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { priceId, userId } = req.body;

    // ── Validate price ID against server-side allowlist ─────────────────────
    if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
        console.warn(`[checkout] Rejected invalid priceId: ${priceId}`);
        return res.status(400).json({ error: "Invalid priceId" });
    }

    const landingBase = process.env.LANDING_BASE_URL || "http://localhost:5173";

    try {
        const sessionParams = {
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${landingBase}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${landingBase}/cancel`,

        };

        // If the frontend supplied a logged-in user ID, attach it in two ways:
        //   1. client_reference_id  — dedicated Stripe field, easy to query in dashboard
        //   2. metadata.user_id     — belt-and-suspenders, survives edge cases
        if (userId && typeof userId === "string" && userId.length > 0) {
            sessionParams.client_reference_id = userId;
            sessionParams.metadata = { user_id: userId };
            console.log(`[checkout] Session tied to user_id: ${userId}`);
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        console.log(`[checkout] Session created: ${session.id} | priceId: ${priceId}`);
        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("[checkout] Stripe error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
