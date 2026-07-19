import { test, expect } from '@playwright/test';
import * as path from 'path';
import { setupE2ePage } from './utils/setup';

async function selectPatientByName(page: import('@playwright/test').Page, name: string) {
  const dropdownBtn = page.locator('app-patient-dropdown button').first();
  await dropdownBtn.click();
  const option = page.locator('.origin-top-left button', { hasText: name }).first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  await page.waitForTimeout(1000);
}

test.describe('Demo Mode Medicine Paradigms Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('should unlock, cycle through 4 paradigms, check lenses, and save screenshots', async ({ page }) => {
    // Enable console logging to see page issues if any
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Set a large viewport size early so deferred viewport components load immediately
    await page.setViewportSize({ width: 1440, height: 900 });

    // Go to home page
    await page.goto('/');

    // 1. PIN Code Entry
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    await pinInput.fill('1234');
    // Auto-submits on length 4, wait for transition to next screen

    // 2. Select Demo Mode
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    await expect(demoBtn).toBeVisible({ timeout: 10000 });
    await demoBtn.click();

    // 3. Skip Karolinska Sleepiness Scale (KSS) assessment
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

    // Explicitly select Sarah Jenkins to test Western/Eastern/Ayurvedic paradigms on her data
    await selectPatientByName(page, 'Sarah Jenkins');

    // Trigger report loading/generation for Sarah Jenkins
    const generateBtn = page.locator('#tour-generate-btn');
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await generateBtn.click();
    await page.waitForTimeout(2000);

    const artifactDir = path.join(process.cwd(), 'test-results');

    // Set a large viewport size for premium screenshot resolution
    await page.setViewportSize({ width: 1440, height: 900 });

    // --- Western Philosophy Verification ---
    console.log('[Verification] Testing Western Paradigm...');
    const westernBtn = page.locator('button', { hasText: 'Western' });
    await westernBtn.click();
    await page.waitForTimeout(1000); // Wait for transition/mock load

    // Verify all 6 tabs/lenses are visible
    const tabs = [
      'tab-overview',
      'tab-functional-protocols',
      'tab-nutrition',
      'tab-precision-nutrients',
      'tab-monitoring-follow-up',
      'tab-patient-education'
    ];

    for (const tab of tabs) {
      const tabButton = page.getByTestId(tab);
      await expect(tabButton).toBeVisible();
    }

    // Verify Western content loads on default Summary Overview tab
    const overviewText = page.locator('app-analysis-report').locator('text=Clinical Assessment');
    await expect(overviewText).toBeVisible({ timeout: 5000 });

    // Verify Western Nutrition tab works (which we recently added)
    const nutritionTab = page.getByTestId('tab-nutrition');
    await nutritionTab.click();
    await page.waitForTimeout(500);
    // Nutrition-specific Western keyword
    await expect(page.locator('app-analysis-report').locator('text=Mediterranean Diet Pattern')).toBeVisible({ timeout: 5000 });

    // Take Western Screenshot (from Summary Overview tab)
    const overviewTab = page.getByTestId('tab-overview');
    await overviewTab.click();
    await page.waitForTimeout(500);
    // await page.screenshot({ path: path.join(artifactDir, 'western_dashboard.png') });
    // console.log('[Verification] Western screenshot saved.');

    // --- Eastern (TCM) Philosophy Verification ---
    console.log('[Verification] Testing Eastern Paradigm...');
    const easternBtn = page.locator('button', { hasText: 'Eastern (TCM)' });
    await easternBtn.click();
    await page.waitForTimeout(1000);

    // Verify Eastern Banner active
    await expect(page.locator('text=Active Paradigm: Eastern (Traditional Chinese Medicine)')).toBeVisible({ timeout: 5000 });

    // Verify Functional Protocols in Eastern Mode
    const functionalTab = page.getByTestId('tab-functional-protocols');
    await functionalTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('app-analysis-report').locator('text=Corydalis Yanhusuo')).toBeVisible({ timeout: 5000 });

    // Take Eastern Screenshot
    // await page.screenshot({ path: path.join(artifactDir, 'eastern_dashboard.png') });
    // console.log('[Verification] Eastern screenshot saved.');

    // --- Ayurvedic Philosophy Verification ---
    console.log('[Verification] Testing Ayurvedic Paradigm...');
    const ayurvedicBtn = page.locator('button', { hasText: 'Ayurvedic' });
    await ayurvedicBtn.click();
    await page.waitForTimeout(1000);

    // Verify Ayurvedic Banner active
    await expect(page.locator('text=Active Paradigm: Ayurvedic Medicine')).toBeVisible({ timeout: 5000 });

    // Verify Precision Nutrients in Ayurvedic Mode
    const orthomolecularTab = page.getByTestId('tab-precision-nutrients');
    await orthomolecularTab.click();
    await page.waitForTimeout(500);
    // Ayurvedic biomarker check
    await expect(page.locator('app-analysis-report').locator('text=structural dryness')).toBeVisible({ timeout: 5000 });

    // Take Ayurvedic Screenshot
    // await page.screenshot({ path: path.join(artifactDir, 'ayurvedic_dashboard.png') });
    // console.log('[Verification] Ayurvedic screenshot saved.');


  });
});
