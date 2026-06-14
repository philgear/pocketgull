const fs = require('fs');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');

const lines = content.trim().split('\n');
const lineObj = JSON.parse(lines[273]);
const toolCall = lineObj.tool_calls[0];
let psScript = toolCall.args.CommandLine;

// Unescape everything
if (psScript.startsWith('"') && psScript.endsWith('"')) {
  try {
    psScript = JSON.parse(psScript);
  } catch (e) {}
}

// Replace literal \n with actual newlines if JSON.parse didn't do it
const cleanScript = psScript.replace(/\\n/g, '\n').replace(/\\"/g, '"');

const linesArray = cleanScript.split('\n');
console.log(`Total lines: ${linesArray.length}`);
linesArray.forEach((line, i) => {
  console.log(`${i + 1}: ${line}`);
});
