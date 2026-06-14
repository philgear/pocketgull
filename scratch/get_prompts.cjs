const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.trim().split('\n');
lines.forEach((line, lineNum) => {
  if (line.includes('generate_image')) {
    const idx = line.indexOf('generate_image');
    // print 1000 characters around the call
    console.log(`\n--- Line ${lineNum} match ---`);
    console.log(line.substring(Math.max(0, idx - 100), Math.min(line.length, idx + 1200)));
  }
});
