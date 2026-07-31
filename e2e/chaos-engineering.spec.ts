import { test, expect } from '@playwright/test';
import { setupE2ePage, enterDemoMode } from './utils/setup';
import * as path from 'path';

test.describe('Pocket-Gull Chaos Engineering & Resilience Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);

    // Intercept clinical changes check
    await page.route('**/api/ai/changes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ significant: true })
      });
    });

    // Intercept report metrics flow
    await page.route('**/api/ai/metrics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ complexity: 4, stability: 8, certainty: 9 })
      });
    });

    // Intercept browser-side verification calls to Gemini API
    await page.route('**/generativelanguage.googleapis.com/v1beta/models/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({ status: 'verified', issues: [] })
                  }
                ]
              }
            }
          ]
        })
      });
    });

    // Set up local storage and mock browser configurations
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_mock_clinician', '1');
      window.localStorage.setItem('pg_data_consent_v1', 'true');
      window.localStorage.setItem('GEMINI_API_KEY', 'AIzaMockKeyForTestingChaos12345');
      window.sessionStorage.setItem('pg_session_onboarded', '1');
      (window as any).GEMINI_API_KEY = 'AIzaMockKeyForTestingChaos12345';

      // Disable service worker during E2E tests
      try {
        const mockSW = {
          register: () => Promise.reject(new Error('Service worker disabled for testing')),
          addEventListener: () => {},
          removeEventListener: () => {},
          getRegistration: () => Promise.resolve(undefined),
          getRegistrations: () => Promise.resolve([]),
          controller: null,
          ready: new Promise(() => {})
        };
        Object.defineProperty(navigator, 'serviceWorker', {
          get() { return mockSW; },
          configurable: true
        });
      } catch (e) {
        console.error('Failed to disable service worker:', e);
      }
    });
  });

  test('PIN code entry bypasses secure splash screen and loads dashboard', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);

    // Dashboard should load directly
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    const analysisReportEl = page.locator('app-analysis-report');
    await expect(analysisReportEl).toBeVisible({ timeout: 10000 });
    await rosterResponsePromise;
    await page.waitForTimeout(500);
  });

  test('Resilience - App offline override simulates offline banner & warns user', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // 2. Click the System Status indicator in the navbar to simulate offline mode
    const statusIndicator = page.locator('span:has-text("System Ready")');
    await expect(statusIndicator).toBeVisible({ timeout: 10000 });
    await statusIndicator.click();

    // 3. Verify the offline banner is displayed
    const offlineBanner = page.locator('text=You are currently offline. Certain AI features and cloud sync may be disabled.');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // 4. Verify system status indicator changes text
    const offlineIndicator = page.locator('span:has-text("System Offline")');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // 5. Try triggering report generation while offline (when no local inference is set)
    // Clear cache first using the trash can / clear cache button if present
    const clearCacheBtn = page.locator('button[aria-label="Clear AI Cache"]');
    if (await clearCacheBtn.isVisible().catch(() => false)) {
      await clearCacheBtn.click();
    }

    const generateBtn = page.locator('#tour-generate-btn button');
    await expect(page.locator('h1:has-text("Phil Gear")')).toBeVisible({ timeout: 15000 });
    await expect(generateBtn).toBeVisible({ timeout: 5000 });
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // 6. Verify that an offline system error alert is shown in the analysis report container
    const errorAlert = page.locator('text=You are currently offline and no local inference endpoint is available.');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });

    // 7. Toggle offline simulation back to online
    await offlineIndicator.click();
    await expect(offlineBanner).not.toBeVisible();
    await expect(page.locator('span:has-text("System Ready")')).toBeVisible();
  });

  test('Chaos - API stream returning 500 Internal Error should display graceful error', async ({ page }) => {
    // Intercept /api/ai/stream to return a 500 server error
    await page.route('**/api/ai/stream', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Inference request failed on model server' })
      });
    });

    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // Clear Cache to trigger fresh generation if button is visible
    const clearCacheBtn = page.locator('button[aria-label="Clear AI Cache"]');
    if (await clearCacheBtn.isVisible().catch(() => false)) {
      await clearCacheBtn.click();
    }

    // Trigger Generation
    const generateBtn = page.locator('#tour-generate-btn button');
    await expect(page.locator('h1:has-text("Phil Gear")')).toBeVisible({ timeout: 15000 });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // The individual lens should load the failure gracefully
    // Our ClinicalIntelligenceService sets: newReport[lens] = '### Error\nAn error occurred in this section: ...'
    // Verify that the error message is visible under the active report lens
    const errorText = page.locator('text=An error occurred in this section');
    await expect(errorText).toBeVisible({ timeout: 15000 });
  });

  test('Chaos - Latency Injection displays loading indicator and resolves successfully', async ({ page }) => {
    let mockText = '### Clinical Assessment\nHighly delayed diagnostic report is here.';
    
    // Intercept /api/ai/stream and inject a 3000ms delay
    await page.route('**/api/ai/stream', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: `data: {"candidates":[{"content":{"parts":[{"text": ${JSON.stringify(mockText)} }]}}]}\n\ndata: [DONE]\n\n`
      });
    });

    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await rosterResponsePromise;
    await page.waitForTimeout(500);

    // Clear Cache if present
    const clearCacheBtn = page.locator('button[aria-label="Clear AI Cache"]');
    if (await clearCacheBtn.isVisible().catch(() => false)) {
      await clearCacheBtn.click();
    }

    // Trigger Generation
    const generateBtn = page.locator('#tour-generate-btn button');
    await expect(page.locator('h1:has-text("Phil Gear")')).toBeVisible({ timeout: 15000 });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled({ timeout: 15000 });
    await generateBtn.click();

    // Verify loading indicator is shown immediately
    const loadingText = page.locator('text=Processing Comprehensive Analysis');
    await expect(loadingText).toBeVisible({ timeout: 3000 });

    // Verify loading text resolves and content becomes visible after the delay
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    const reportText = page.locator('text=Highly delayed diagnostic report');
    await expect(reportText).toBeVisible({ timeout: 10000 });
  });

  test('Resilience - Voice Assistant WebSocket connection failure handled gracefully', async ({ page }) => {
    const rosterResponsePromise = page.waitForResponse('**/api/patients', { timeout: 15000 }).catch(() => null);
    await enterDemoMode(page);
    await rosterResponsePromise;

    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('app-analysis-report')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1:has-text("Phil Gear")')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // Toggle Voice Assistant Panel
    const agentToggle = page.locator('button[aria-label="Toggle Live Agent"]');
    await expect(agentToggle).toBeVisible();
    await agentToggle.click();

    // Verify connection error message
    const errorBanner = page.locator('text=Failed to connect to Live Interface.');
    await expect(errorBanner).toBeVisible({ timeout: 15000 });

    // The microphone button should be disabled due to the connection error
    const micBtn = page.locator('button[title="Start/Stop Voice Capture"]');
    await expect(micBtn).toBeDisabled({ timeout: 5000 });
  });
});
