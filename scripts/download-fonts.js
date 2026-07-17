import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontsDir = path.resolve(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

// We want Inter and Cinzel fonts
const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap';

async function main() {
    console.log("Fetching fonts CSS from Google Fonts...");
    const res = await fetch(googleFontsUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch fonts CSS: ${res.statusText}`);
    }
    let cssText = await res.text();
    
    // Find all url(...) in the css text
    const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/s\/[^\)]+)\)/g;
    let match;
    const urls = [];
    while ((match = urlRegex.exec(cssText)) !== null) {
        urls.push(match[1]);
    }
    
    console.log(`Found ${urls.length} font files to download.`);
    
    // Download each font file
    const urlToLocalMap = new Map();
    for (const url of urls) {
        // CodeQL Security Hardening: Enforce trusted Google Fonts domains whitelist
        if (!url.startsWith('https://fonts.gstatic.com/s/')) {
            throw new Error(`Security Exception: Untrusted font URL target: ${url}`);
        }

        const filename = path.basename(url);
        // CodeQL Security Hardening: Sanitize filename to alphanumeric and safe delimiters
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
            throw new Error(`Security Exception: Invalid filename format: ${filename}`);
        }
        
        const localPath = path.resolve(fontsDir, filename);
        // CodeQL Security Hardening: Path traversal containment check
        if (!localPath.startsWith(fontsDir)) {
            throw new Error(`Security Exception: Path traversal attempt detected: ${localPath}`);
        }
        
        console.log(`Downloading ${filename}...`);
        const fontRes = await fetch(url);
        if (!fontRes.ok) {
            throw new Error(`Failed to download font: ${url}`);
        }
        const buffer = await fontRes.arrayBuffer();
        fs.writeFileSync(localPath, Buffer.from(buffer));
        
        urlToLocalMap.set(url, `/fonts/${filename}`);
    }
    
    // Replace the URLs in the CSS text
    let localCssText = cssText;
    for (const [remoteUrl, localUrl] of urlToLocalMap.entries()) {
        localCssText = localCssText.replaceAll(remoteUrl, localUrl);
    }
    
    // Write the local CSS to public/fonts/fonts.css
    fs.writeFileSync(path.join(fontsDir, 'fonts.css'), localCssText);
    console.log("Fonts CSS written to public/fonts/fonts.css");
}

main().catch(console.error);
