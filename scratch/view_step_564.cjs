const fs = require('fs');
const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.trim().split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (line.includes('"step_index":564')) {
    console.log(JSON.stringify(JSON.parse(line), null, 2));
    break;
  }
}
