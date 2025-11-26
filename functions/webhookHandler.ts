import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get webhook data
        const url = new URL(req.url);
        const source = url.searchParams.get('source') || 'unknown';
        const secret = url.searchParams.get('secret');
        
        // Optional: Verify webhook secret
        const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
        if (expectedSecret && secret !== expectedSecret) {
            return Response.json({ error: 'Invalid webhook secret' }, { status: 401 });
        }

        // Parse the incoming payload
        let payload;
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            payload = Object.fromEntries(formData);
        } else {
            payload = await req.text();
        }

        // Log the webhook (you can store this in an entity if needed)
        console.log(`Webhook received from ${source}:`, JSON.stringify(payload));

        // Get useful headers
        const headers = {
            'content-type': contentType,
            'user-agent': req.headers.get('user-agent'),
            'x-forwarded-for': req.headers.get('x-forwarded-for'),
        };

        // You can add custom logic here based on source
        switch (source) {
            case 'github':
                // Handle GitHub webhooks
                const event = req.headers.get('x-github-event');
                console.log(`GitHub event: ${event}`);
                break;

            case 'zapier':
                // Handle Zapier webhooks
                break;

            case 'custom':
                // Handle custom webhooks
                break;

            default:
                // Generic handler
                break;
        }

        // Return success
        return Response.json({ 
            success: true, 
            message: 'Webhook received',
            source,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});