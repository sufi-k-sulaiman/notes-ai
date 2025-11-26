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

        const { text, texts, model = "text-embedding-3-small" } = await req.json();

        const input = texts || [text];

        const response = await openai.embeddings.create({
            model,
            input,
        });

        return Response.json({ 
            embeddings: response.data.map(d => d.embedding),
            usage: response.usage
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});