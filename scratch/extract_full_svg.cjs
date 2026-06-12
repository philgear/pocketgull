const fs = require('fs');
const logPath = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.system_generated\\logs\\transcript.jsonl';
const outPath = 'c:\\Users\\philg\\Pocketgull\\pocketgull\\scratch\\extracted_full_logo.svg';

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.trim().split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('USER_INPUT') && line.includes('9061.61')) {
    console.log(`--- Line ${i} has SVG ---`);
    const start = line.indexOf('<svg');
    const end = line.indexOf('</svg>') + 6;
    if (start !== -1 && end !== -1) {
      let svg = line.substring(start, end);
      // Clean JSON escaping
      svg = svg.replace(/\\r/g, '')
               .replace(/\\n/g, '\n')
               .replace(/\\"/g, '"')
               .replace(/\\\\/g, '\\');
      fs.writeFileSync(outPath, svg);
      console.log('Successfully saved to:', outPath);
      console.log('File size:', fs.statSync(outPath).size);
      break;
    }
  }
}
