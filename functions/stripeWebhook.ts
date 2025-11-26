import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));
        const base44 = createClientFromRequest(req);
        
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                Deno.env.get("STRIPE_WEBHOOK_SECRET")
            );
        } catch (err) {
            return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout completed:', session.id);
                // Add your logic here - e.g., update user subscription status
                break;

            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                break;

            case 'customer.subscription.created':
                const newSubscription = event.data.object;
                console.log('Subscription created:', newSubscription.id);
                break;

            case 'customer.subscription.updated':
                const updatedSubscription = event.data.object;
                console.log('Subscription updated:', updatedSubscription.id);
                break;

            case 'customer.subscription.deleted':
                const canceledSubscription = event.data.object;
                console.log('Subscription canceled:', canceledSubscription.id);
                break;

            case 'invoice.paid':
                const paidInvoice = event.data.object;
                console.log('Invoice paid:', paidInvoice.id);
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object;
                console.log('Invoice payment failed:', failedInvoice.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ received: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});