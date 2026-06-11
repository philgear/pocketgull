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
    if (lineLower.includes('smiley') || lineLower.includes('gesture') || lineLower.includes('canvas')) {
      try {
        const data = JSON.parse(line);
        // Only print if it's from a different conversation (not the current one to save output length)
        if (dirName === '168840e4-6298-43fd-9b54-d5d5e360d6e1') continue;
        
        console.log(`[${dirName}:${lineNum}] Type: ${data.type || 'unknown'}`);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            if (tc.name === 'replace_file_content' || tc.name === 'write_to_file' || tc.name === 'multi_replace_file_content') {
              console.log(`  Tool: ${tc.name} on ${tc.args.TargetFile || tc.args.Target}`);
              console.log("  Content:", JSON.stringify(tc.args).substring(0, 1000));
            }
          }
        }
        if (data.content && (data.content.includes('class ') || data.content.includes('canvas') || data.content.includes('smiley'))) {
          console.log(`  Content (truncated): ${data.content.substring(0, 500)}`);
        }
      } catch (e) {
        // Ignore parse errors
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
