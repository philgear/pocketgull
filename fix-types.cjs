const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllTsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllTsFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts') && !filePath.includes('.d.ts')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const tsFiles = getAllTsFiles(srcDir);

const interfacesToRename = [
  'PatientState', 'PatientVitals', 'Patient', 'BodyPartIssue', 'Bookmark',
  'DiagnosticScan', 'BiometricEntry', 'ClinicalNote', 'ChecklistItem',
  'ShoppingListItem', 'DraftSummaryItem', 'VerificationIssue', 'DynamicMarker',
  'AiProviderConfig', 'SummaryNode', 'SummaryNodeItem', 'ReportSection',
  'ParsedTranscriptEntry', 'DicomStudy'
];

let totalReplacedFiles = 0;
for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const name of interfacesToRename) {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        if (regex.test(content)) {
            // Only replace if it's not already prefixed with I
            // Wait, \b matches boundary, but if the text is IPatientState, \b doesn't match P, it matches I.
            // So \bPatientState\b won't match IPatientState. That's perfect.
            content = content.replace(regex, `I${name}`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        totalReplacedFiles++;
    }
}

console.log(`Updated ${totalReplacedFiles} files with new type prefixes.`);
