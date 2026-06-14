import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Mobile Sub-Navbar Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept config endpoint to return empty API key so splash screen shows Demo Mode
    await page.route('**/api/config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ apiKey: '' })
      });
    });

    // Intercept hardware telemetry to prevent 500 error warnings
    await page.route('**/api/hardware/telemetry', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          gpus: [],
          cpuName: 'Mock CPU',
          cpuLoadPercent: 12,
          systemMemoryUsedGb: 4.5,
          systemMemoryTotalGb: 16.0
        })
      });
    });

    // Prevent the walkthrough tour from launching automatically on load
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pg_mock_clinician', '1');
      
      // Disable service worker during tests so Playwright can run smoothly
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

  test('should layout correctly on 360px screen and take nav screenshots', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });

    // Go to home page
    await page.goto('/');

    // 1. PIN Code Entry
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    await pinInput.fill('1234');
    await page.waitForTimeout(300);

    // 2. Select Demo Mode
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    await expect(demoBtn).toBeVisible({ timeout: 10000 });
    await demoBtn.click();

    // 3. Skip KSS
    const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
    await expect(skipBtn).toBeVisible({ timeout: 10000 });
    await skipBtn.click();

    // 4. Accept Ethics Pledge
    const pledgeCheckbox = page.locator('input[type="checkbox"]');
    await expect(pledgeCheckbox).toBeVisible({ timeout: 10000 });
    await pledgeCheckbox.check();

    // Click Accept & Enter System
    const acceptBtn = page.locator('button', { hasText: 'Accept & Enter System' });
    await expect(acceptBtn).toBeVisible({ timeout: 10000 });
    await acceptBtn.click();

    // 5. Verify Main Viewport loads
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    
    // Wait for initial analysis container content to render
    const analysisReportEl = page.locator('app-analysis-report');
    await expect(analysisReportEl).toBeVisible({ timeout: 10000 });

    // Take screenshot of the sub-navbar
    // The sub-navbar contains id="tour-patient-dropdown"
    const subNavbar = page.locator('nav').filter({ has: page.locator('#tour-patient-dropdown') });
    await expect(subNavbar).toBeVisible();

    const artifactDir = 'C:/Users/philg/.gemini/antigravity-ide/brain/0fc781ba-7a56-4df7-a6e9-b99f15e47748';
    
    // Take mobile nav screenshot
    await subNavbar.screenshot({ path: path.join(artifactDir, 'mobile_nav_layout.png') });
    console.log('[Verification] Mobile nav screenshot saved.');

    // Toggle patient dropdown and verify it fits within viewport
    const patientBtn = page.locator('app-patient-dropdown button').first();
    await patientBtn.click();
    await page.waitForTimeout(500);

    // Take mobile dropdown screenshot
    const dropdownMenu = page.locator('app-patient-dropdown .origin-top-left');
    await expect(dropdownMenu).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, 'mobile_nav_dropdown.png') });
    console.log('[Verification] Mobile nav dropdown screenshot saved.');
  });
});
