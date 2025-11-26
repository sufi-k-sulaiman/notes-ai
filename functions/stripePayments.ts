import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, amount, currency = 'usd', customer_email, payment_method_id, 
                description, metadata, success_url, cancel_url, line_items } = await req.json();

        let result;

        switch (action) {
            case 'create_payment_intent':
                result = await stripe.paymentIntents.create({
                    amount,
                    currency,
                    receipt_email: customer_email || user.email,
                    description,
                    metadata: { ...metadata, user_id: user.id },
                });
                break;

            case 'create_checkout_session':
                result = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items,
                    mode: 'payment',
                    success_url,
                    cancel_url,
                    customer_email: customer_email || user.email,
                    metadata: { ...metadata, user_id: user.id },
                });
                break;

            case 'create_customer':
                result = await stripe.customers.create({
                    email: customer_email || user.email,
                    metadata: { user_id: user.id },
                });
                break;

            case 'list_payments':
                result = await stripe.paymentIntents.list({
                    limit: 100,
                });
                break;

            case 'refund':
                const { payment_intent_id, refund_amount } = await req.json();
                result = await stripe.refunds.create({
                    payment_intent: payment_intent_id,
                    amount: refund_amount,
                });
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});