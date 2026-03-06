const fs = require('fs');
const path = '/home/phil/Coding/Understory/Understory/src/components/voice-assistant.component.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    private _appendModel(md: string) {
        const richMediaRegex = /\\`\\`\\`rich-media\\s*([\\s\\S]*?)\\`\\`\\`/i;
        const match = md.match(richMediaRegex);
        let richCards: RichMediaCard[] | undefined;
        let cleanMd = md;

        if (match) {
            cleanMd = md.replace(richMediaRegex, '').trim();
            try {
                const parsed = JSON.parse(match[1].trim());
                const rawCards: Array<{ kind: string; query: string; severity?: string; afflictionHighlight?: string; particles?: boolean }> = parsed.cards ?? [];
                richCards = rawCards
                    .filter(c => ['model-3d', 'image-gallery', 'pubmed-refs', 'phil-image'].includes(c.kind))
                    .map(c => ({
                        kind: c.kind as any,
                        query: c.query,
                        severity: c.severity as any,
                        afflictionHighlight: c.afflictionHighlight,
                        particles: c.particles,
                        loading: true
                    }));
            } catch { /* malformed JSON — ignore block */ }
        }`;

const replacement = `    private _appendModel(md: string) {
        let richCards: RichMediaCard[] | undefined;
        let cleanMd = md;

        const fencedRegex = /\\`\\`\\`(?:rich-media|json)?\\s*(\\{[\\s\\S]*?"cards"\\s*:[\\s\\S]*?\\})\\s*\\`\\`\\`/i;
        const rawRegex = /(\\{[\\s\\S]*?"cards"\\s*:[\\s\\S]*?\\})/i;
        
        let match = md.match(fencedRegex);
        let jsonStr = '';

        if (match) {
            jsonStr = match[1];
            cleanMd = md.replace(match[0], '').trim();
        } else {
            match = md.match(rawRegex);
            if (match) {
                jsonStr = match[1];
                cleanMd = md.replace(match[0], '').trim();
            }
        }

        if (jsonStr) {
            try {
                const parsed = JSON.parse(jsonStr.trim());
                const rawCards: Array<{ kind: string; query: string; severity?: string; afflictionHighlight?: string; particles?: boolean }> = parsed.cards ?? [];
                richCards = rawCards
                    .filter(c => ['model-3d', 'image-gallery', 'pubmed-refs', 'phil-image'].includes(c.kind))
                    .map(c => ({
                        kind: c.kind as any,
                        query: c.query,
                        severity: c.severity as any,
                        afflictionHighlight: c.afflictionHighlight,
                        particles: c.particles,
                        loading: true
                    }));
            } catch { /* malformed JSON — ignore block */ }
        }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched successfully!");
} else {
    console.log("Target not found!");
}
