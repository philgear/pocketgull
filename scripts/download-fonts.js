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
        const filename = path.basename(url);
        const localPath = path.join(fontsDir, filename);
        
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
