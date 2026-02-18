// Vercel Serverless Function — creates a Stripe Checkout session
// POST /api/checkout  { priceId: string }
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { priceId } = req.body;

    const VALID_PRICE_IDS = [
        process.env.STRIPE_PRICE_ID_MONTHLY,
        process.env.STRIPE_PRICE_ID_YEARLY,
    ];

    if (!priceId || !VALID_PRICE_IDS.includes(priceId)) {
        return res.status(400).json({ error: "Invalid priceId" });
    }

    const landingBase = process.env.LANDING_BASE_URL || "http://localhost:5173";

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            // customer_creation ensures we always get a customer object with email
            customer_creation: "always",
            success_url: `${landingBase}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${landingBase}/cancel`,
            // NOTE: client_reference_id is intentionally NOT set here.
            // The webhook will use customer_email as the fallback key.
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("Stripe checkout error:", err);
        return res.status(500).json({ error: err.message });
    }
}
