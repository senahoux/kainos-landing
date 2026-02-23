// Vercel Serverless Function — retrieves Stripe session data for tracking
// GET /api/stripe-session?session_id=...
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { session_id } = req.query;

    if (!session_id || typeof session_id !== "string") {
        console.error("[stripe-session] Received invalid session_id:", session_id);
        return res.status(400).json({ error: "Missing or invalid session_id" });
    }

    try {
        console.log("[stripe-session] Fetching Stripe session:", session_id);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            console.warn("[stripe-session] Session not found:", session_id);
            return res.status(404).json({ error: "Session not found" });
        }

        console.log("[stripe-session] Session retrieved:", {
            id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency
        });

        // Return only the data needed for tracking to keep it lightweight and secure
        return res.status(200).json({
            value: (session.amount_total || 0) / 100, // Stripe uses cents
            currency: (session.currency || "BRL").toUpperCase(),
            session_id: session.id,
            payment_status: session.payment_status
        });
    } catch (err) {
        console.error("[stripe-session] Stripe error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
