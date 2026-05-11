const fs = require('fs');
const path = require('path');

const angularRoot = path.join(__dirname, '../src');
const flutterRoot = path.join(__dirname, '../pocketgull_flutter/lib');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function extractBaseName(filename) {
  // e.g. medical-chart.component.ts -> medical chart
  // e.g. medical_chart_widget.dart -> medical chart
  let base = path.basename(filename);
  base = base.replace(/\.(component|service|directive|pipe)\.ts$/, '');
  base = base.replace(/\.(dart|ts)$/, '');
  base = base.replace(/_(widget|screen|bloc)$/, '');
  base = base.replace(/(-|_)/g, ' ');
  return base.toLowerCase().trim();
}

const angularFiles = [
  ...getFiles(path.join(angularRoot, 'components')),
  ...getFiles(path.join(angularRoot, 'services')),
  ...getFiles(path.join(angularRoot, 'directives')),
  ...getFiles(path.join(angularRoot, 'pipes')),
].filter(f => !f.endsWith('.spec.ts'));

const flutterFiles = [
  ...getFiles(path.join(flutterRoot, 'widgets')),
  ...getFiles(path.join(flutterRoot, 'screens')),
  ...getFiles(path.join(flutterRoot, 'services')),
  ...getFiles(path.join(flutterRoot, 'blocs')),
];

const angularMap = new Map();
angularFiles.forEach(f => {
  const base = extractBaseName(f);
  if (!angularMap.has(base)) angularMap.set(base, []);
  angularMap.get(base).push(path.relative(path.join(__dirname, '..'), f));
});

const flutterMap = new Map();
flutterFiles.forEach(f => {
  const base = extractBaseName(f);
  if (!flutterMap.has(base)) flutterMap.set(base, []);
  flutterMap.get(base).push(path.relative(path.join(__dirname, '..'), f));
});

const allKeys = new Set([...angularMap.keys(), ...flutterMap.keys()]);
const sortedKeys = Array.from(allKeys).sort();

let markdown = '# Feature Parity Matrix\n\n';
markdown += 'This document maps the components and services from the live Angular site to the new Flutter migration to track feature parity.\n\n';
markdown += '| Feature / Base Name | Angular (Live) | Flutter (Migration) | Status |\n';
markdown += '| :--- | :--- | :--- | :--- |\n';

let matchCount = 0;
let missingFlutterCount = 0;
let flutterOnlyCount = 0;

for (const key of sortedKeys) {
  const angFiles = angularMap.get(key) || [];
  const fltFiles = flutterMap.get(key) || [];
  
  let status = '✅ Parity';
  if (angFiles.length > 0 && fltFiles.length === 0) {
    status = '❌ Missing in Flutter';
    missingFlutterCount++;
  } else if (angFiles.length === 0 && fltFiles.length > 0) {
    status = '⚠️ Flutter Only';
    flutterOnlyCount++;
  } else {
    matchCount++;
  }

  const angStr = angFiles.map(f => `\`${f}\``).join('<br>');
  const fltStr = fltFiles.map(f => `\`${f}\``).join('<br>');
  
  markdown += `| **${key}** | ${angStr || '-'} | ${fltStr || '-'} | ${status} |\n`;
}

markdown += '\n## Summary\n';
markdown += `- **Matched Features**: ${matchCount}\n`;
markdown += `- **Missing in Flutter (Needs Migration)**: ${missingFlutterCount}\n`;
markdown += `- **Flutter Only (New Features/Architecture)**: ${flutterOnlyCount}\n`;

const outputPath = path.join(__dirname, '../parity_matrix.md');
fs.writeFileSync(outputPath, markdown);

console.log(`Parity matrix generated successfully at ${outputPath}`);
