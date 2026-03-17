import WsClient from 'ws';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
const apiKey = keyMatch ? keyMatch[1] : null;

const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

console.log("Connecting using WsClient...");
const ws = new WsClient(url, {
    headers: {
        'Origin': 'https://pocketgull.app',
        'Referer': 'https://pocketgull.app/'
    }
});

ws.on('open', () => {
    console.log("WebSocket opened. Sending setup...");
    const setupMsg = {
        setup: {
            model: 'models/gemini-2.0-flash-exp',
            systemInstruction: { parts: [{ text: "You are a helpful assistant." }] },
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
                }
            }
        }
    };
    ws.send(JSON.stringify(setupMsg));
});

ws.on('message', (data) => {
    console.log("RX:", data.toString());
    const parsed = JSON.parse(data.toString());
    if (parsed.setupComplete) {
        console.log("Setup complete! Sending test text message...");
        const textMsg = {
            clientContent: {
                turns: [{ role: "user", parts: [{ text: "Hello" }] }],
                turnComplete: true
            }
        };
        ws.send(JSON.stringify(textMsg));
    }
});

ws.on('close', (code, reason) => console.log(`Closed: ${code} ${reason}`));
ws.on('error', (err) => console.error(err));
