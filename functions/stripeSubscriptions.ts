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

        const { action, customer_id, price_id, subscription_id, success_url, cancel_url } = await req.json();

        let result;

        switch (action) {
            case 'create_subscription':
                result = await stripe.subscriptions.create({
                    customer: customer_id,
                    items: [{ price: price_id }],
                    metadata: { user_id: user.id },
                });
                break;

            case 'create_subscription_checkout':
                result = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{ price: price_id, quantity: 1 }],
                    mode: 'subscription',
                    success_url,
                    cancel_url,
                    customer_email: user.email,
                    metadata: { user_id: user.id },
                });
                break;

            case 'cancel_subscription':
                result = await stripe.subscriptions.cancel(subscription_id);
                break;

            case 'pause_subscription':
                result = await stripe.subscriptions.update(subscription_id, {
                    pause_collection: { behavior: 'mark_uncollectible' },
                });
                break;

            case 'resume_subscription':
                result = await stripe.subscriptions.update(subscription_id, {
                    pause_collection: '',
                });
                break;

            case 'get_subscription':
                result = await stripe.subscriptions.retrieve(subscription_id);
                break;

            case 'list_subscriptions':
                result = await stripe.subscriptions.list({
                    customer: customer_id,
                    limit: 100,
                });
                break;

            case 'create_billing_portal':
                result = await stripe.billingPortal.sessions.create({
                    customer: customer_id,
                    return_url: success_url,
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