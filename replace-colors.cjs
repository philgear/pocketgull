const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

// Function to recursively find files
function findFiles(dir, extArray, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, extArray, fileList);
        } else if (extArray.some(ext => file.endsWith(ext))) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// Map generic color to brand color using word boundaries
const replaceMap = [
    { regex: /\b(text|bg|border|ring|fill|stroke|shadow|outline|divide|from|via|to|hover:text|hover:bg|focus:ring|focus:border|active:bg|dark:bg|dark:text|dark:border|dark:ring|dark:hover:bg|dark:hover:text)-blue-([0-9]{2,3}(?:\/[0-9]+)?)\b/g, replace: '$1-brand-blue-$2' },
    { regex: /\b(text|bg|border|ring|fill|stroke|shadow|outline|divide|from|via|to|hover:text|hover:bg|focus:ring|focus:border|active:bg|dark:bg|dark:text|dark:border|dark:ring|dark:hover:bg|dark:hover:text)-green-([0-9]{2,3}(?:\/[0-9]+)?)\b/g, replace: '$1-brand-green-$2' },
    { regex: /\b(text|bg|border|ring|fill|stroke|shadow|outline|divide|from|via|to|hover:text|hover:bg|focus:ring|focus:border|active:bg|dark:bg|dark:text|dark:border|dark:ring|dark:hover:bg|dark:hover:text)-red-([0-9]{2,3}(?:\/[0-9]+)?)\b/g, replace: '$1-brand-red-$2' },
    { regex: /\b(text|bg|border|ring|fill|stroke|shadow|outline|divide|from|via|to|hover:text|hover:bg|focus:ring|focus:border|active:bg|dark:bg|dark:text|dark:border|dark:ring|dark:hover:bg|dark:hover:text)-(?:yellow|orange)-([0-9]{2,3}(?:\/[0-9]+)?)\b/g, replace: '$1-brand-amber-$2' },
];

const genericRegex = /\b([a-z0-9:-]+)-(blue|green|red|yellow|orange)-([0-9]{2,3}(?:\/[0-9]+)?)\b/g;

const targetFiles = findFiles(SRC_DIR, ['.ts', '.html']);
let filesChanged = 0;

for (const file of targetFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Instead of exhaustive prefix listing, let's use a more general regex that captures prefixes (like hover:bg, md:text)
    // Tailwind classes are composed of optional modifiers followed by the core utility class.
    // e.g., md:hover:bg-blue-500
    
    let newContent = content.replace(genericRegex, (match, prefix, color, shade) => {
        let brandColor = color;
        if (color === 'yellow' || color === 'orange') brandColor = 'amber';
        return `${prefix}-brand-${brandColor}-${shade}`;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        filesChanged++;
        console.log(`Updated colors in: ${path.relative(__dirname, file)}`);
    }
}

console.log(`\nColor audit replacement complete: Modified ${filesChanged} files.`);
