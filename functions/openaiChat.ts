import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OpenAi"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, model = "gpt-4o", temperature = 0.7, max_tokens = 2000 } = await req.json();

        const response = await openai.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens,
        });

        return Response.json({ 
            content: response.choices[0].message.content,
            usage: response.usage
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});