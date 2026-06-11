import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\philg\\.gemini\\antigravity\\brain\\570fd06c-7ef2-4cb3-ae50-5c67ea3c651c\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(transcriptPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  const lineLower = line.toLowerCase();
  if (lineLower.includes('smiley') || lineLower.includes('gesture') || lineLower.includes('canvas')) {
    try {
      const data = JSON.parse(line);
      console.log(`--- MATCH AT LINE ${lineNum} ---`);
      console.log(`Type: ${data.type || 'unknown'}`);
      console.log(`Source: ${data.source || 'unknown'}`);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          console.log(`  Tool: ${tc.name}`);
          if (tc.name === 'replace_file_content' || tc.name === 'write_to_file' || tc.name === 'multi_replace_file_content') {
            console.log("  Args:", JSON.stringify(tc.args, null, 2).substring(0, 1500));
          }
        }
      }
      if (data.content && (data.content.includes('class ') || data.content.includes('canvas') || data.content.includes('template') || data.content.includes('smiley'))) {
        console.log(`  Content (truncated): ${data.content.substring(0, 1000)}`);
      }
    } catch (e) {
      console.log(`[Line ${lineNum}] Non-JSON or parse error: ${line.substring(0, 200)}`);
    }
  }
});

rl.on('close', () => {
  console.log('Finished parsing.');
});
