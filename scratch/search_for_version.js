import fs from 'fs';
import path from 'path';
import readline from 'readline';

const brainDir = 'C:\\Users\\philg\\.gemini\\antigravity\\brain';

async function searchFile(filePath, dirName) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    const lineLower = line.toLowerCase();
    if (lineLower.includes('0.10.0') || lineLower.includes('gesture-based clinical unlock')) {
      try {
        const data = JSON.parse(line);
        console.log(`[FOUND IN ${dirName}:${lineNum}] type: ${data.type || 'unknown'}`);
        if (data.content) console.log("  Content preview:", data.content.substring(0, 300));
        if (data.tool_calls) console.log("  Tool calls:", JSON.stringify(data.tool_calls).substring(0, 300));
      } catch (e) {
        // console.log(`[FOUND IN ${dirName}:${lineNum}] parse error`);
      }
    }
  }
}

async function run() {
  const dirs = fs.readdirSync(brainDir);
  for (const dir of dirs) {
    if (dir === 'tempmediaStorage') continue;
    const fullPath = path.join(brainDir, dir, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(fullPath)) {
      await searchFile(fullPath, dir);
    }
  }
  console.log('Search complete.');
}

run().catch(console.error);
