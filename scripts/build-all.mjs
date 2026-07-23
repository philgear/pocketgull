import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(rootDir, 'docs/study');

const cleanEnv = { ...process.env };
delete cleanEnv.INIT_CWD;
delete cleanEnv.npm_config_local_prefix;
delete cleanEnv.npm_package_json;
delete cleanEnv.NPM_PREFIX;

console.log('Building Astro study docs with isolated env...');
execSync('npx astro build', {
  cwd: docsDir,
  env: cleanEnv,
  stdio: 'inherit'
});

console.log('Building Angular SSR app...');
execSync('npx ng build', {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
