const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '.');

const EXCLUDE_INTERFACES = new Set(['Window', 'ProcessEnv', 'Array', 'String', 'Object']);

function getAllTsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.gemini' || file === '.git') continue;
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

// 1. Find all interface names
const interfaces = new Set();
// Match any capitalized interface
const interfaceRegex = /\binterface\s+([A-Z][a-zA-Z0-9_]*)\b/g;

for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
        const name = match[1];
        if (!EXCLUDE_INTERFACES.has(name)) {
           interfaces.add(name);
        }
    }
}

// 2. Filter out interfaces that are ALREADY correctly prefixed with 'I'
const interfacesToRename = Array.from(interfaces).filter(name => {
    // If it starts with 'I' and the second letter is also uppercase (e.g., IPatient),
    // it is already correctly formatted. Skip it.
    if (name.startsWith('I') && name.length > 1 && name[1] === name[1].toUpperCase()) {
        return false;
    }
    return true; // Keep everything else (e.g. Item -> needs to be IItem)
});

// Sort by length descending to avoid partial matches (e.g., matching 'Note' before 'ClinicalNote')
interfacesToRename.sort((a, b) => b.length - a.length);

console.log(`Found ${interfacesToRename.length} interfaces to rename:`, interfacesToRename);

// 3. Perform the replacements
let totalReplacedFiles = 0;
for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const name of interfacesToRename) {
        // Look for the interface usage as a whole word.
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        if (regex.test(content)) {
            // Only replace if the match is NOT part of a string literal or something obvious,
            // but in TS \b is usually sufficient for type references.
            content = content.replace(regex, `I${name}`);
            changed = true;
        }
    }

    // Also fix the observable
    if (content.includes('generateReportStream(')) {
        content = content.replace(/\bgenerateReportStream\(/g, 'generateReportStream$(');
        changed = true;
    }
    if (content.includes('generateReportStream:')) {
         content = content.replace(/\bgenerateReportStream:/g, 'generateReportStream$:');
         changed = true;
    }


    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        totalReplacedFiles++;
    }
}

console.log(`Updated ${totalReplacedFiles} files.`);
