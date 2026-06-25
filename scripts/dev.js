import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const serverBundle = join(rootDir, 'dist', 'server', 'server.mjs');

console.log('[Dev Runner] Initializing PocketGull Development Environment...');

if (!existsSync(serverBundle)) {
  console.log('[Dev Runner] Server bundle not found. Building application first (this may take a minute)...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  build.on('close', (code) => {
    if (code === 0) {
      startServers();
    } else {
      console.error('[Dev Runner] Build failed. Cannot start dev environment.');
      process.exit(1);
    }
  });
} else {
  startServers();
}

function startServers() {
  console.log('[Dev Runner] Starting Angular Client Dev Server (port 4200)...');
  const client = spawn('npx', ['ng', 'serve'], { stdio: 'inherit', shell: true });

  console.log('[Dev Runner] Starting PocketGull Backend Server (port 4000)...');
  const backend = spawn('node', [serverBundle], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '4000' }
  });

  const cleanup = () => {
    console.log('\n[Dev Runner] Stopping development servers...');
    try { client.kill('SIGINT'); } catch (e) {}
    try { backend.kill('SIGINT'); } catch (e) {}
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
