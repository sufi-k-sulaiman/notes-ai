import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Edge TTS voices (best ones)
const VOICES = {
    "en-US-AriaNeural": "Female (US) - Natural & Warm (Default)",
    "en-US-GuyNeural": "Male (US)",
    "en-GB-SoniaNeural": "Female (UK)",
    "en-GB-RyanNeural": "Male (UK)",
    "en-AU-NatashaNeural": "Female (Australia)",
};

// Main Edge-TTS function using WebSocket streaming (from your script)
async function textToSpeechEdge(text, voice) {
    const url = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
    
    // Escape XML chars
    const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${escapedText}</voice></speak>`;

    const connectionId = crypto.randomUUID().replace(/-/g, "");
    const requestId = crypto.randomUUID().replace(/-/g, "");
    
    const connectMsg = `X-RequestId:${connectionId}\r\nPath:speech.config\r\nContent-Type:application/json; charset=utf-8\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;

    const ttsMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;

    const ws = new WebSocket(url + "?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4");
    const chunks = [];

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error("Timeout after 30s"));
        }, 30000);

        ws.onopen = () => {
            ws.send(connectMsg);
            ws.send(ttsMsg);
        };

        ws.onmessage = async (msg) => {
            if (typeof msg.data === "string") {
                // Check for turn.end to know when done
                if (msg.data.includes("Path:turn.end")) {
                    clearTimeout(timeout);
                    ws.close();
                }
            } else if (msg.data instanceof Blob) {
                // Binary audio data from Blob
                const buf = await msg.data.arrayBuffer();
                const data = new Uint8Array(buf);
                
                // Find header end (after \r\n\r\n)
                let headerEnd = -1;
                for (let i = 0; i < data.length - 3; i++) {
                    if (data[i] === 0x0D && data[i+1] === 0x0A && data[i+2] === 0x0D && data[i+3] === 0x0A) {
                        headerEnd = i + 4;
                        break;
                    }
                }
                if (headerEnd > 0 && headerEnd < data.length) {
                    chunks.push(data.slice(headerEnd));
                }
            } else if (msg.data instanceof ArrayBuffer) {
                // Binary audio data from ArrayBuffer
                const data = new Uint8Array(msg.data);
                
                let headerEnd = -1;
                for (let i = 0; i < data.length - 3; i++) {
                    if (data[i] === 0x0D && data[i+1] === 0x0A && data[i+2] === 0x0D && data[i+3] === 0x0A) {
                        headerEnd = i + 4;
                        break;
                    }
                }
                if (headerEnd > 0 && headerEnd < data.length) {
                    chunks.push(data.slice(headerEnd));
                }
            }
        };

        ws.onerror = (e) => {
            clearTimeout(timeout);
            reject(new Error("WebSocket error"));
        };

        ws.onclose = () => {
            clearTimeout(timeout);
            if (chunks.length === 0) {
                reject(new Error("No audio received"));
                return;
            }
            
            // Combine all chunks
            const fullAudio = new Uint8Array(chunks.reduce((acc, v) => acc + v.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                fullAudio.set(chunk, offset);
                offset += chunk.length;
            }
            
            resolve(fullAudio);
        };
    });
}

// Generate silence for pauses (MP3 silent frames)
function generateSilence(ms) {
    const frames = Math.ceil(ms / 26);
    const frame = new Uint8Array([0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const result = new Uint8Array(frames * frame.length);
    for (let i = 0; i < frames; i++) {
        result.set(frame, i * frame.length);
    }
    return result;
}

function toBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { text, voice = "en-US-AriaNeural", pauseMs = 800 } = body;

        if (!text || text.trim().length === 0) {
            return Response.json({ error: "No text provided" }, { status: 400 });
        }

        // Split into paragraphs
        const paragraphs = text.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p.length > 0);
        
        if (paragraphs.length === 0) {
            return Response.json({ error: "No paragraphs found" }, { status: 400 });
        }

        console.log(`Generating ${paragraphs.length} paragraphs with voice ${voice}...`);

        const segments = [];
        const silence = generateSilence(pauseMs);

        for (let i = 0; i < paragraphs.length; i++) {
            console.log(`Paragraph ${i + 1}/${paragraphs.length}...`);
            const audio = await textToSpeechEdge(paragraphs[i], voice);
            segments.push(audio);
            
            // Add silence between paragraphs (not after last)
            if (i < paragraphs.length - 1) {
                segments.push(silence);
            }
        }

        // Combine all segments
        const totalSize = segments.reduce((acc, seg) => acc + seg.length, 0);
        const fullAudio = new Uint8Array(totalSize);
        let offset = 0;
        for (const seg of segments) {
            fullAudio.set(seg, offset);
            offset += seg.length;
        }

        console.log(`Done! Generated ${totalSize} bytes of MP3 audio.`);

        return Response.json({
            audio: toBase64(fullAudio),
            format: "mp3",
            voice,
            paragraphs: paragraphs.length,
            bytes: totalSize
        });

    } catch (error) {
        console.error("TTS Error:", error.message);
        return Response.json({ error: error.message || "TTS generation failed" }, { status: 500 });
    }
});