import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = await req.json();
        
        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
        }

        // Truncate text if too long (ElevenLabs has limits)
        const maxChars = 5000;
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

        // Call ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: truncatedText,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('ElevenLabs error:', error);
            return Response.json({ error: 'Failed to generate speech: ' + error }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();
        
        // Return as base64 encoded JSON for easier frontend handling
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        
        return Response.json({ 
            audio: base64Audio,
            contentType: 'audio/mpeg'
        });
    } catch (error) {
        console.error('TTS Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});