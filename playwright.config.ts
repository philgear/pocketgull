import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, 'e2e'),
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/src/**', '**/node_modules/**'],
  outputDir: path.resolve(__dirname, 'tmp/playwright-results'),
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:4000',
    trace: 'on-first-retry',
    bypassCSP: true,
    permissions: ['microphone'],
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
          ],
        },
      },
    },
  ],
  webServer: {
    command: 'npx cross-env PORT=4000 GEMINI_API_KEY="" SKIP_HEALTHCARE_PROVISION=true node dist/server/server.mjs',
    url: process.env['BASE_URL'] || 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
