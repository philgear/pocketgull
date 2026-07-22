import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './tmp/playwright-results',
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
