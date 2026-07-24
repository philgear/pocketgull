import { spawnSync } from 'child_process';
import path from 'path';

const projectDir = 'c:/Users/philg/Pocketgull/pocketgull';
const cliPath = path.join(projectDir, 'node_modules/@playwright/test/cli.js');
const configPath = path.join(projectDir, 'playwright.config.ts');
const specPath = process.argv[2] || 'e2e/emergency-mode.spec.ts';

console.log(`Executing Playwright E2E test in ${projectDir}...`);
const res = spawnSync(process.execPath, [cliPath, 'test', '--config=' + configPath, specPath], {
  cwd: projectDir,
  stdio: 'inherit',
  env: { ...process.env, BASE_URL: 'http://localhost:4000' }
});

process.exit(res.status ?? 0);
