const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.trim().split('\n');
const line = lines[273];
console.log('--- Line 273 End Content ---');
console.log(line.substring(line.indexOf('ThirdsCrop(') - 50));
