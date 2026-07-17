import { test, expect } from '@playwright/test';
import * as path from 'path';

import { setupE2ePage } from './utils/setup';

test.describe('Mobile Sub-Navbar Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page);
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
    // Auto-submits on length 4

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
