const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const outDir = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\scratch';

const content = fs.readFileSync(logPath, 'utf8');

// Find all matches for /9j/4AAQ
let idx = 0;
let matchNum = 1;
while (true) {
  idx = content.indexOf('/9j/4AAQ', idx);
  if (idx === -1) break;
  
  // Find where the base64 string ends (usually a quote or newline in the JSON)
  let endIdx = -1;
  const quoteIdx = content.indexOf('"', idx);
  const newlineIdx = content.indexOf('\n', idx);
  const backslashQuoteIdx = content.indexOf('\\"', idx);
  
  if (quoteIdx !== -1 && (newlineIdx === -1 || quoteIdx < newlineIdx)) {
    endIdx = quoteIdx;
  } else {
    endIdx = newlineIdx;
  }
  
  if (endIdx === -1) {
    endIdx = content.length;
  }
  
  let b64 = content.substring(idx, endIdx);
  // Clean up any JSON escaped backslashes or newlines
  b64 = b64.replace(/\\r/g, '')
           .replace(/\\n/g, '')
           .replace(/\\"/g, '"')
           .replace(/\\\\/g, '\\')
           .trim();
  
  // If the string contains other characters not valid for base64, truncate at the first invalid char
  const cleanB64 = b64.split(/[^a-zA-Z0-9+/=]/)[0];
  
  try {
    const buffer = Buffer.from(cleanB64, 'base64');
    const outPath = path.join(outDir, `logo_extracted_${matchNum}.jpg`);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved logo_extracted_${matchNum}.jpg (Length: ${cleanB64.length} bytes, decoded: ${buffer.length})`);
  } catch (err) {
    console.error(`Error saving match ${matchNum}:`, err);
  }
  
  idx = endIdx + 1;
  matchNum++;
}
