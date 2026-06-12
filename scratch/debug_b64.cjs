const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const startIdx = 358235;
console.log('Excerpt (5000 characters):');
console.log(content.substring(startIdx + 1500, startIdx + 6500));
