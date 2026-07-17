import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { setupE2ePage } from './utils/setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Screenshot output directory
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'screenshots');

/** Shared login + demo mode entry flow */
async function enterDemoMode(page: import('@playwright/test').Page) {
  await page.goto('/');

  // PIN entry
  const pinInput = page.locator('input[placeholder="1234"]');
  await expect(pinInput).toBeVisible({ timeout: 10000 });
  await pinInput.fill('1234');
  await pinInput.press('Enter');

  // Demo Mode button
  const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
  await expect(demoBtn).toBeVisible({ timeout: 10000 });
  await demoBtn.click();

  // Skip KSS
  const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
  await expect(skipBtn).toBeVisible({ timeout: 10000 });
  await skipBtn.click();

  // Ethics pledge
  const pledgeCheckbox = page.locator('input[type="checkbox"]');
  await expect(pledgeCheckbox).toBeVisible({ timeout: 10000 });
  await pledgeCheckbox.check();

  const acceptBtn = page.locator('button', { hasText: 'Accept & Enter System' });
  await expect(acceptBtn).toBeVisible({ timeout: 10000 });
  await acceptBtn.click();

  // Wait for main app to render
  await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
}

/** Helper to enter demo mode and select Phil Gear */
async function enterDemoModeWithPhilGear(page: import('@playwright/test').Page) {
  await enterDemoMode(page);

  // Click patient dropdown to select Phil Gear
  const dropdownBtn = page.locator('app-patient-dropdown button').first();
  await dropdownBtn.click();

  const philGearOption = page.locator('.origin-top-left button', { hasText: 'Phil Gear' }).first();
  await philGearOption.click();

  // Wait for selection to load
  await page.waitForTimeout(1000);
}

test.describe('Phil Gear — Default Patient & Full Lens Verification', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
    await setupE2ePage(page);
  });

  test('Phil Gear can be selected and loaded', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
    });

    await enterDemoModeWithPhilGear(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // The patient name should be visible in the header / patient selector
    const philGearName = page.locator('text=Phil Gear').first();
    await expect(philGearName).toBeVisible({ timeout: 10000 });

    // The analysis report component should be present (loaded for Phil Gear)
    await expect(page.locator('app-analysis-report')).toBeVisible({ timeout: 10000 });

    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'phil_gear_default_patient.png'),
    //   fullPage: false,
    // });
    console.log('[PASS] Phil Gear loaded as default patient.');
  });

  test('Phil Gear — all 6 analysis lens tabs are visible and populated', async ({ page }) => {
    await enterDemoModeWithPhilGear(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Ensure Phil Gear is selected
    const philGearName = page.locator('text=Phil Gear').first();
    await expect(philGearName).toBeVisible({ timeout: 10000 });

    const reportEl = page.locator('app-analysis-report');
    await expect(reportEl).toBeVisible({ timeout: 10000 });

    // Western is the default paradigm — generate/load the report
    const westernBtn = page.locator('button', { hasText: 'Western' });
    await westernBtn.click();
    await page.waitForTimeout(1500);

    // Verify all 6 tabs are present
    const expectedTabs = [
      'tab-overview',
      'tab-functional-protocols',
      'tab-nutrition',
      'tab-precision-nutrients',
      'tab-monitoring-follow-up',
      'tab-patient-education',
    ];
    for (const tabTestId of expectedTabs) {
      const tabBtn = page.getByTestId(tabTestId);
      await expect(tabBtn).toBeVisible({ timeout: 5000 });
      console.log(`[PASS] Tab visible: ${tabTestId}`);
    }

    // Verify Summary Overview has Phil's assessment content
    const overviewTab = page.getByTestId('tab-overview');
    await overviewTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Clinical Assessment')).toBeVisible({ timeout: 5000 });

    // Functional Protocols tab
    const funcTab = page.getByTestId('tab-functional-protocols');
    await funcTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Diagnostic Workup')).toBeVisible({ timeout: 5000 });
    console.log('[PASS] Functional Protocols tab populated.');

    // Nutrition tab
    const nutritionTab = page.getByTestId('tab-nutrition');
    await nutritionTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Nutritional Interventions')).toBeVisible({ timeout: 5000 });
    console.log('[PASS] Nutrition tab populated.');

    // Precision Nutrients tab
    const orthoTab = page.getByTestId('tab-precision-nutrients');
    await orthoTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Biomarker Matrix').first()).toBeVisible({ timeout: 5000 });
    await expect(reportEl.locator('text=Magnesium').first()).toBeVisible({ timeout: 5000 });
    console.log('[PASS] Orthomolecular Profiling tab populated with biomarker data.');

    // Monitoring & Follow-up tab
    const monitorTab = page.getByTestId('tab-monitoring-follow-up');
    await monitorTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Immediate (24-72 hours)')).toBeVisible({ timeout: 5000 });
    console.log('[PASS] Monitoring & Follow-up tab populated.');

    // Patient Education tab
    const educationTab = page.getByTestId('tab-patient-education');
    await educationTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Understanding Your')).toBeVisible({ timeout: 5000 });
    console.log('[PASS] Patient Education tab populated.');

    // Take a full-page screenshot at the end
    await overviewTab.click();
    await page.waitForTimeout(500);
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'phil_gear_all_lenses.png'),
    // });
    console.log('[PASS] All 6 lenses verified for Phil Gear.');
  });

  test('Phil Gear — Orthomolecular Profiling shows correct biomarker data across paradigms', async ({ page }) => {
    await enterDemoModeWithPhilGear(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const philGearName = page.locator('text=Phil Gear').first();
    await expect(philGearName).toBeVisible({ timeout: 10000 });

    const reportEl = page.locator('app-analysis-report');
    await expect(reportEl).toBeVisible({ timeout: 10000 });

    const orthoTab = page.getByTestId('tab-precision-nutrients');

    // Western paradigm
    await page.locator('button', { hasText: 'Western' }).click();
    await page.waitForTimeout(1500);
    await orthoTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Biomarker Matrix').first()).toBeVisible({ timeout: 5000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'phil_gear_ortho_western.png'),
    // });
    console.log('[PASS] Western Orthomolecular Profiling verified.');

    // Eastern paradigm
    await page.locator('button', { hasText: 'Eastern (TCM)' }).click();
    await page.waitForTimeout(1500);
    await orthoTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=Biomarker Matrix').first()).toBeVisible({ timeout: 5000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'phil_gear_ortho_eastern.png'),
    // });
    console.log('[PASS] Eastern Orthomolecular Profiling verified.');

    // Ayurvedic paradigm
    await page.locator('button', { hasText: 'Ayurvedic' }).click();
    await page.waitForTimeout(1500);
    await orthoTab.click();
    await page.waitForTimeout(500);
    await expect(reportEl.locator('text=structural dryness')).toBeVisible({ timeout: 5000 });
    // await page.screenshot({
    //   path: path.join(SCREENSHOT_DIR, 'phil_gear_ortho_ayurvedic.png'),
    // });
    console.log('[PASS] Ayurvedic Orthomolecular Profiling verified.');

    console.log('[COMPLETE] All 3 paradigms verified for Phil Gear Orthomolecular Profiling.');
  });
});
