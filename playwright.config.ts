import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, 'e2e'),
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/src/**', '**/node_modules/**', '**/tmp/**', '**/.venv/**'],
  outputDir: path.resolve(__dirname, 'tmp/playwright-results'),
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4000',
    trace: 'off',
    bypassCSP: true,
    permissions: ['microphone'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
    env: {
      PORT: '4000',
      NODE_ENV: 'production',
    },
  },
});
