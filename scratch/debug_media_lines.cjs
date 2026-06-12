const fs = require('fs');

const logPath = 'C:\\Users\\gemini\\..\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
// Wait, the correct path is C:\Users\philg\...
const correctedPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(correctedPath, 'utf8');

const lines = content.trim().split('\n');
lines.forEach((line, lineNum) => {
  if (line.includes('media__')) {
    console.log(`\n--- Line ${lineNum} ---`);
    console.log(line.substring(0, 1000));
  }
});
