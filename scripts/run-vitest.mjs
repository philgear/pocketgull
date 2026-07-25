import { spawnSync } from 'child_process';
import path from 'path';

const projectDir = 'c:/Users/philg/Pocketgull/pocketgull';
const cliPath = path.join(projectDir, 'node_modules/vitest/vitest.mjs');
const configPath = path.join(projectDir, 'vitest.config.ts');

console.log(`Executing Vitest in ${projectDir}...`);
const res = spawnSync(process.execPath, [cliPath, 'run', '--config=' + configPath], {
  cwd: projectDir,
  stdio: 'inherit'
});

process.exit(res.status ?? 0);
