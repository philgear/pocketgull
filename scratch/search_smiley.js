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
    if (line.toLowerCase().includes('smiley')) {
      console.log(`[${dirName}:${lineNum}] MATCH: ${line.substring(0, 300)}`);
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
