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

        const { action, assistant_id, thread_id, message, instructions, name, model = "gpt-4o" } = await req.json();

        let result;

        switch (action) {
            case 'create_assistant':
                result = await openai.beta.assistants.create({
                    name: name || 'My Assistant',
                    instructions: instructions || 'You are a helpful assistant.',
                    model,
                });
                break;

            case 'create_thread':
                result = await openai.beta.threads.create();
                break;

            case 'add_message':
                result = await openai.beta.threads.messages.create(thread_id, {
                    role: 'user',
                    content: message,
                });
                break;

            case 'run':
                const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
                    assistant_id,
                });
                
                if (run.status === 'completed') {
                    const messages = await openai.beta.threads.messages.list(thread_id);
                    result = {
                        status: run.status,
                        messages: messages.data,
                    };
                } else {
                    result = { status: run.status };
                }
                break;

            case 'list_messages':
                const msgs = await openai.beta.threads.messages.list(thread_id);
                result = { messages: msgs.data };
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});