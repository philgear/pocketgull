import https from 'https';
import fs from 'fs';
import crypto from 'crypto';

const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
const apiKey = keyMatch ? keyMatch[1] : null;

const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`,
    method: 'GET',
    headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
        'Sec-WebSocket-Version': '13',
        'Origin': 'https://pocketgull.app',
        'Referer': 'https://pocketgull.app/'
    }
};

const req = https.request(options);

req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('WebSocket Upgraded! Status:', res.statusCode);
    
    // WebSocket requires masking from client to server. We will encode a basic text frame.
    function sendTextFrame(text) {
        const payload = Buffer.from(text);
        const header = Buffer.alloc(6);
        header[0] = 129; // FIN + Text frame
        header[1] = 128 + payload.length; // Masked + very small length (<126)
        const mask = crypto.randomBytes(4);
        mask.copy(header, 2);
        const maskedPayload = Buffer.alloc(payload.length);
        for(let i=0; i<payload.length; i++) maskedPayload[i] = payload[i] ^ mask[i % 4];
        socket.write(Buffer.concat([header, maskedPayload]));
    }
    
    // 1. Send Setup
    sendTextFrame(JSON.stringify({
        setup: {
            model: "models/gemini-2.0-flash-exp",
            systemInstruction: { parts: [{ text: "You are a test." }] },
            generationConfig: { responseModalities: ["AUDIO"] }
        }
    }));
    
    socket.on('data', (data) => {
        // Very basic frame parsing (assumes single unfragmented frame < 126 bytes for setupComplete)
        if (data.length > 2) {
            const payloadLength = data[1] & 127;
            if (payloadLength < 126) {
                const payload = data.subarray(2, 2 + payloadLength).toString('utf8');
                console.log("RX:", payload);
                if (payload.includes('setupComplete')) {
                    sendTextFrame(JSON.stringify({
                        clientContent: {
                            turns: [{ role: "user", parts: [{ text: "Hello" }] }],
                            turnComplete: true
                        }
                    }));
                }
            } else if (payloadLength === 126) {
                const extendedLength = data.readUInt16BE(2);
                const payload = data.subarray(4, 4 + extendedLength).toString('utf8');
                console.log("RX extended:", payload);
            } else {
                console.log("RX partial/huge frame...", data.length, "bytes");
            }
        }
    });
});

req.on('response', (res) => {
    console.log(`Failed to upgrade. HTTP ${res.statusCode}: ${res.statusMessage}`);
    res.on('data', d => console.log(d.toString()));
});

req.end();
