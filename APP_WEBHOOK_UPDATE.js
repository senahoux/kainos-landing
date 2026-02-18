// api/webhook.js — UPDATED for retrocompatibility
// Handles two flows:
//   1. App flow (client_reference_id = user_id) — unchanged
//   2. Landing flow (no client_reference_id) — uses customer_email as fallback
//
// PASTE THIS INTO YOUR APP REPO at api/webhook.js
// Replace the existing file entirely.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role to bypass RLS
);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription);
    }

    return res.status(200).json({ received: true });
};

async function handleCheckoutCompleted(session) {
    const userId = session.client_reference_id || null; // null for landing flow
    const customerEmail = session.customer_email || session.customer_details?.email || null;
    const stripeCustomerId = session.customer;
    const stripeSubscriptionId = session.subscription;

    if (!stripeSubscriptionId) {
        console.log('No subscription in session, skipping.');
        return;
    }

    // Fetch full subscription from Stripe to get period end and price
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const priceId = stripeSub.items.data[0]?.price?.id || null;
    const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();

    if (userId) {
        // ── FLOW 1: App flow — user was logged in when they subscribed ──
        // Upsert by user_id (existing behavior, unchanged)
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                status: 'active',
                price_id: priceId,
                current_period_end: currentPeriodEnd,
                customer_email: customerEmail,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) console.error('Supabase upsert (user_id) error:', error);
        else console.log('Subscription linked by user_id:', userId);

    } else if (customerEmail) {
        // ── FLOW 2: Landing flow — user paid before logging in ──
        // Insert with null user_id; the DB trigger will link it on first Google login
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: null,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                status: 'active',
                price_id: priceId,
                current_period_end: currentPeriodEnd,
                customer_email: customerEmail,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'customer_email' }); // partial unique index: WHERE user_id IS NULL

        if (error) console.error('Supabase upsert (email fallback) error:', error);
        else console.log('Subscription saved by email (pending link):', customerEmail);

    } else {
        console.error('No user_id or email in session — cannot save subscription.');
    }
}

async function handleSubscriptionChange(subscription) {
    const stripeSubscriptionId = subscription.id;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) console.error('Supabase update (subscription change) error:', error);
    else console.log('Subscription status updated:', stripeSubscriptionId, '->', status);
}
