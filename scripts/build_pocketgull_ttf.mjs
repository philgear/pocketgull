import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/fonts/google_fonts_submission/ofl/pocketgull');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function main() {
  console.log('📦 Fetching PocketGull primary TTF font binary...');

  const fontUrl = 'https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004Hao.ttf';
  const parsedUrl = new URL(fontUrl);
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'fonts.gstatic.com') {
    throw new Error('Security Violation: Untrusted font URL domain');
  }
  console.log(`Downloading font binary from: ${fontUrl}`);

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) {
    throw new Error(`Failed to download font file: ${fontRes.statusText}`);
  }

  const buffer = Buffer.from(await fontRes.arrayBuffer());
  const targetFile = path.join(targetDir, 'PocketGull-Bold.ttf');
  fs.writeFileSync(targetFile, buffer);

  console.log(`✅ Successfully generated ${targetFile} (${buffer.length} bytes)`);
}

main().catch(console.error);
