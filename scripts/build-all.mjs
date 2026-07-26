import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(rootDir, 'docs/study');

const cleanEnv = {
  ...process.env,
  NODE_ENV: 'production',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder-key-for-build',
  VITE_PUBLIC_API_URL: process.env.VITE_PUBLIC_API_URL || 'http://127.0.0.1:4000',
  ASTRO_TELEMETRY_DISABLED: '1'
};
delete cleanEnv.INIT_CWD;
delete cleanEnv.npm_config_local_prefix;
delete cleanEnv.npm_package_json;
delete cleanEnv.NPM_PREFIX;

console.log('Building Astro study docs with isolated env...');
execSync('npx astro build --root .', {
  cwd: docsDir,
  env: cleanEnv,
  stdio: 'inherit'
});

console.log('Building Angular SSR app...');
execSync('node node_modules/@angular/cli/bin/ng.js build', {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
