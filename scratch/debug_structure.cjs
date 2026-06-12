const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.trim().split('\n');
const lineObj = JSON.parse(lines[273]);
console.log('Keys of lineObj:', Object.keys(lineObj));
if (lineObj.tool_calls) {
  console.log('tool_calls keys:', lineObj.tool_calls.map(tc => Object.keys(tc)));
  console.log('tool_calls content:', JSON.stringify(lineObj.tool_calls, null, 2));
}
