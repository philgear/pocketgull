import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateComplexity(node) {
    let complexity = 1;
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.IfStatement:
            case ts.SyntaxKind.CatchClause:
            case ts.SyntaxKind.ConditionalExpression:
            case ts.SyntaxKind.ForStatement:
            case ts.SyntaxKind.ForInStatement:
            case ts.SyntaxKind.ForOfStatement:
            case ts.SyntaxKind.WhileStatement:
            case ts.SyntaxKind.DoStatement:
            case ts.SyntaxKind.CaseClause:
            case ts.SyntaxKind.QuestionQuestionToken: // ??
            case ts.SyntaxKind.AmpersandAmpersandToken: // &&
            case ts.SyntaxKind.BarBarToken: // ||
                complexity++;
                break;
        }
        ts.forEachChild(node, visit);
    }
    visit(node);
    return complexity;
}

function processDir(dir) {
    let files = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory() && !fullPath.includes('node_modules')) {
            files = files.concat(processDir(fullPath));
        } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.spec.ts')) {
            files.push(fullPath);
        }
    });
    return files;
}

let topFunctions = [];

const srcDir = path.join(__dirname, '..', 'src');
processDir(srcDir).forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    
    function visitSource(node) {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
            const complexity = calculateComplexity(node);
            let name = 'Anonymous/Callback';
            if (node.name && ts.isIdentifier(node.name)) {
                name = node.name.text;
            } else if (node.parent && ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
                name = node.parent.name.text;
            } else if (node.parent && ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name)) {
                name = node.parent.name.text;
            }
            
            if (complexity > 5) {
                topFunctions.push({ 
                    file: path.relative(srcDir, file).replace(/\\/g, '/'), 
                    name, 
                    complexity 
                });
            }
        }
        ts.forEachChild(node, visitSource);
    }
    visitSource(sourceFile);
});

topFunctions.sort((a, b) => b.complexity - a.complexity);

console.log("===== CYCLOMATIC COMPLEXITY AUDIT =====");
if (topFunctions.length === 0) {
    console.log("No strictly complex functions found! Excellent architectural discipline.");
} else {
    console.log("Functions with Complexity > 5:\n");
    topFunctions.slice(0, 15).forEach(f => {
        console.log(`[Score: ${f.complexity}] ${f.file} -> ${f.name}()`);
    });
}
console.log("\n(Score 1-5: Simple | Score 6-10: Moderate | Score 11+: High Complexity)");
console.log("=========================================");
