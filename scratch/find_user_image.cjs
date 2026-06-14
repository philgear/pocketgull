const fs = require('fs');
const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.trim().split('\n');

let count = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (line.includes('USER_INPUT') || line.includes('USER_EXPLICIT')) {
    console.log(`--- User input line ${i} ---`);
    console.log(line.substring(0, 1000));
    const mediaMatch = line.match(/"media_[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)"/g);
    if (mediaMatch) {
      console.log('Media matches:', mediaMatch);
    }
    count++;
    if (count > 5) break;
  }
}
