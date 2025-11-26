import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import twilio from 'npm:twilio';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

        const client = twilio(accountSid, authToken);

        const { action, to, body, media_url, template_sid, template_variables } = await req.json();

        let result;

        switch (action) {
            case 'send_message':
                result = await client.messages.create({
                    body,
                    from: `whatsapp:${twilioNumber}`,
                    to: `whatsapp:${to}`,
                });
                break;

            case 'send_media':
                result = await client.messages.create({
                    body,
                    from: `whatsapp:${twilioNumber}`,
                    to: `whatsapp:${to}`,
                    mediaUrl: [media_url],
                });
                break;

            case 'send_template':
                result = await client.messages.create({
                    from: `whatsapp:${twilioNumber}`,
                    to: `whatsapp:${to}`,
                    contentSid: template_sid,
                    contentVariables: JSON.stringify(template_variables),
                });
                break;

            case 'list_messages':
                result = await client.messages.list({
                    from: `whatsapp:${twilioNumber}`,
                    limit: 50,
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