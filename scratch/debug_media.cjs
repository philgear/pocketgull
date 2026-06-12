const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.trim().split('\n');
lines.forEach((line, lineNum) => {
  if (line.includes('1781242308295') || line.includes('1781242601594')) {
    console.log(`\n--- Line ${lineNum} ---`);
    console.log(line.substring(0, 1000));
  }
});
