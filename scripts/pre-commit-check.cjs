const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Shift-Left Pre-Commit Validation...\n');

// Helper to run commands and print output/errors nicely
function runCommand(command, description) {
  console.log(`🔹 Running: ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed.\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed.\n`);
    return false;
  }
}

// Check 1: TypeScript compilation check
const lintPassed = runCommand('npm run lint', 'TypeScript compilation and linting check');
if (!lintPassed) {
  process.exit(1);
}

// Check 2: Unit tests check
const testsPassed = runCommand('npx vitest run', 'Vitest unit tests execution');
if (!testsPassed) {
  process.exit(1);
}

// Check 3: Markdown image path validation
console.log('🔹 Running: Markdown Image Reference validation...');
let mdFilesCount = 0;
let errorsCount = 0;

// Resolve appDataDir artifact path
const userProfile = process.env.USERPROFILE || process.env.HOME || '';
const brainDir = path.join(userProfile, '.gemini', 'antigravity', 'brain');

// Collect all markdown files from the workspace and active brain folder
const filesToCheck = [];

function walkDir(dir, filter, list) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Avoid traversing node_modules and dot-directories
      if (file !== 'node_modules' && !file.startsWith('.') && file !== 'dist') {
        walkDir(filePath, filter, list);
      }
    } else if (filePath.endsWith(filter)) {
      list.push(filePath);
    }
  }
}

// Add current brain conversation markdown files (if any exist)
if (fs.existsSync(brainDir)) {
  const conversations = fs.readdirSync(brainDir);
  for (const conv of conversations) {
    const convPath = path.join(brainDir, conv);
    if (fs.statSync(convPath).isDirectory() && !conv.startsWith('.')) {
      walkDir(convPath, '.md', filesToCheck);
    }
  }
}

// Add files modified in Git (staged or unstaged markdown files)
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const lines = gitStatus.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      const parts = line.trim().split(/\s+/);
      const filePath = parts[parts.length - 1];
      if (filePath.endsWith('.md') && fs.existsSync(filePath)) {
        filesToCheck.push(path.resolve(filePath));
      }
    }
  }
} catch (e) {
  // Not a git repo or git not installed, fallback to walkthrough.md
  const localWalkthrough = path.resolve('walkthrough.md');
  if (fs.existsSync(localWalkthrough)) {
    filesToCheck.push(localWalkthrough);
  }
}

// Remove duplicates
const uniqueFilesToCheck = [...new Set(filesToCheck)];

// Validate each markdown file
for (const file of uniqueFilesToCheck) {

  mdFilesCount++;
  const content = fs.readFileSync(file, 'utf8');
  // Regular expression to match markdown image tags: ![alt](path)
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const altText = match[1];
    const imgPath = match[2];

    // Skip web URLs
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      continue;
    }

    let cleanImgPath = imgPath;
    if (imgPath.startsWith('file://')) {
      cleanImgPath = imgPath.slice(7);
    }

    let resolvedPath;
    if (path.isAbsolute(cleanImgPath) || cleanImgPath.startsWith('C:/') || cleanImgPath.startsWith('c:/')) {
      resolvedPath = cleanImgPath;
    } else if (cleanImgPath.startsWith('/')) {
      // Starts with slash, check Windows absolute drive mapping
      const driveLetterMatch = cleanImgPath.match(/^\/([a-zA-Z]):/);
      if (driveLetterMatch) {
        // e.g. /C:/path -> C:/path
        resolvedPath = cleanImgPath.slice(1);
      } else {
        // Treat as relative to the drive root
        resolvedPath = path.resolve('/', cleanImgPath);
      }
    } else {
      // Relative path to the markdown file's directory
      resolvedPath = path.resolve(path.dirname(file), cleanImgPath);
    }

    // Normalized file path for check
    const normalizedPath = path.normalize(resolvedPath);

    // Validation checks
    if (cleanImgPath.startsWith('/C:/') || cleanImgPath.startsWith('/c:/')) {
      console.error(`⚠️  [${path.basename(file)}]: Image path "${imgPath}" contains invalid leading slash on Windows drive letter. Use "C:/..." instead.`);
      errorsCount++;
    } else if (!fs.existsSync(normalizedPath)) {
      console.error(`⚠️  [${path.basename(file)}]: Image file not found at: "${normalizedPath}" (referenced as "${imgPath}")`);
      errorsCount++;
    }
  }
}

console.log(`📊 Scanned ${mdFilesCount} markdown files.`);
if (errorsCount > 0) {
  console.error(`❌ Markdown validation failed with ${errorsCount} path error(s).\n`);
  process.exit(1);
}
console.log('✅ Markdown image path validation passed.\n');

// Check 4: Secret / Credential Leak Scanning
console.log('🔹 Running: Secret / Credential Leak check...');
let secretsCount = 0;
const secretPatterns = [
  { name: 'Google/Gemini API Key', regex: /AIzaSy[A-Za-z0-9_-]{33}/g },
  { name: 'Generic Private Key Header', regex: /-----BEGIN [A-Z0-9_-]+ PRIVATE KEY-----/g },
  { name: 'AWS Access Key ID', regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/g },
  { name: 'Generic Password/Key Assignment', regex: /(api[-_]?key|secret[-_]?key|password|db[-_]?pass)\s*[:=]\s*['"`][a-zA-Z0-9_\-*!@#%^&()]{16,}['"`]/gi }
];

// Gather files modified/staged in git to scan for secrets
const filesToScanSecrets = [];
try {
  const gitStaged = execSync('git diff --cached --name-only --diff-filter=d', { encoding: 'utf8' });
  gitStaged.split('\n').forEach(f => {
    if (f.trim() && fs.existsSync(f.trim())) {
      filesToScanSecrets.push(path.resolve(f.trim()));
    }
  });

  // Also scan unstaged modified files as a safety net
  const gitUnstaged = execSync('git diff --name-only --diff-filter=d', { encoding: 'utf8' });
  gitUnstaged.split('\n').forEach(f => {
    if (f.trim() && fs.existsSync(f.trim()) && !filesToScanSecrets.includes(path.resolve(f.trim()))) {
      filesToScanSecrets.push(path.resolve(f.trim()));
    }
  });
} catch (e) {
  // Git not installed or not a repository, fallback to scanning files in src/
  walkDir(path.resolve('src'), '.ts', filesToScanSecrets);
  walkDir(path.resolve('src'), '.html', filesToScanSecrets);
}

// Binary files extensions to skip
const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.sqlite', '.db', '.keystore', '.jks', '.lock'];

for (const file of filesToScanSecrets) {
  const ext = path.extname(file).toLowerCase();
  if (skipExtensions.includes(ext)) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) {
    let match;
    // Reset regex lastIndex
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(content)) !== null) {
      // Exclude matches in pre-commit-check.cjs itself or configuration test templates
      if (file === __filename || file.includes('pre-commit-check') || file.includes('.spec.')) {
        continue;
      }
      
      // Exclude placeholder mock keys used in tests (e.g. fake keys starting with standard prefixes but filled with dummy text)
      const matchedString = match[0];
      if (
        matchedString.includes('fake_') ||
        matchedString.includes('mock_') ||
        matchedString.includes('dummy_') ||
        matchedString.includes('test_') ||
        matchedString.includes('placeholder')
      ) {
        continue;
      }


      console.error(`❌  [${path.basename(file)}]: CRITICAL SECRET LEAK DETECTED! Found matching pattern for ${pattern.name} ("${matchedString.slice(0, 10)}...")`);
      secretsCount++;
    }
  }
}

if (secretsCount > 0) {
  console.error(`\n❌ Secret scan failed. Found ${secretsCount} security risk(s). Commit aborted!`);
  console.error('⚠️  Please remove the exposed secret keys or credentials, use environment variables (.env), and try committing again.\n');
  process.exit(1);
} else {
  console.log('✅ Secret / Credential Leak check passed.\n');
}

// Check 5: Python PHI / PII & Secret Compliance Scan
const pythonScannerPassed = runCommand('python3 scripts/phi_compliance_scanner.py', 'Python HIPAA/PII and Compliance Scan');
if (!pythonScannerPassed) {
  process.exit(1);
}

console.log('\n🎉 All pre-commit validation checks passed successfully. Safe to commit!\n');
process.exit(0);

