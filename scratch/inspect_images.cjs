const fs = require('fs');
const path = require('path');

const tempDir = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\\.tempmediaStorage';
const parentDir = 'C:\\Users\\philg\\.gemini\\antigravity-ide\\brain\\69122f21-8d14-4a5c-b7ea-9f087ae4a43f';

function getPngDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // PNG signature is 8 bytes. IHDR chunk starts at offset 8.
    // Length (4 bytes), Chunk Type 'IHDR' (4 bytes), Width (4 bytes), Height (4 bytes)
    const width = buffer.readInt32BE(16);
    const height = buffer.readInt32BE(20);
    return { width, height, type: 'PNG' };
  } catch (e) {
    return null;
  }
}

function getJpgDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    let offset = 2; // skip SOI
    while (offset < buffer.length) {
      const marker = buffer.readUInt16BE(offset);
      const length = buffer.readUInt16BE(offset + 2);
      if (marker === 0xFFC0 || marker === 0xFFC2) { // SOF0 or SOF2
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height, type: 'JPG' };
      }
      offset += length + 2;
    }
  } catch (e) {}
  return null;
}

function inspectFile(filePath) {
  const stats = fs.statSync(filePath);
  let dim = getPngDimensions(filePath) || getJpgDimensions(filePath);
  return {
    name: path.basename(filePath),
    size: stats.size,
    dimensions: dim ? `${dim.width}x${dim.height} (${dim.type})` : 'Unknown'
  };
}

console.log('--- Parent Directory Images ---');
fs.readdirSync(parentDir).forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    console.log(inspectFile(path.join(parentDir, file)));
  }
});

console.log('\n--- Temp Media Storage ---');
fs.readdirSync(tempDir).forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    console.log(inspectFile(path.join(tempDir, file)));
  }
});
