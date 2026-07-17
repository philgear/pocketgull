import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { setupE2ePage } from './utils/setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/** Helper to select a patient by name from the dropdown */
async function selectPatientByName(page: import('@playwright/test').Page, name: string) {
  // Click patient dropdown
  const dropdownBtn = page.locator('app-patient-dropdown button').first();
  await dropdownBtn.click();

  const option = page.locator('.origin-top-left button', { hasText: name }).first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();

  // Wait for selection to load
  await page.waitForTimeout(1000);
}

test.describe('Clinical Risk Alerts UI Transitions', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should dynamically transition clinical risk levels for Phil Gear', async ({ page }) => {
    // 1. Setup & Login
    await enterDemoMode(page);
    await selectPatientByName(page, 'Phil Gear');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Verify Initial State (Phil Gear default is low risk)
    const initialRiskCard = page.locator('text=Clinical Triage Risk');
    await expect(initialRiskCard).toBeVisible({ timeout: 10000 });
    
    // Assert Low Risk badge is visible initially
    const lowRiskBadge = page.locator('text=Low Risk');
    await expect(lowRiskBadge).toBeVisible({ timeout: 10000 });

    // 3. Simulate Acute Patient Deterioration (Tachycardia + Hypoxia + Hypertension)
    const bpInput = page.locator('#vitals-bp input');
    const hrInput = page.locator('#vitals-hr input');
    const spo2Input = page.locator('#vitals-spo2 input');

    await expect(bpInput).toBeVisible();
    await expect(hrInput).toBeVisible();
    await expect(spo2Input).toBeVisible();

    // Fill high-risk vitals
    await bpInput.fill('145/95');
    await bpInput.blur();
    
    await hrInput.fill('110');
    await hrInput.blur();

    await spo2Input.fill('91');
    await spo2Input.blur();

    // 4. Assert Transition to Critical Risk & Contributing Factors
    // Expect the Critical Risk badge to show (with blinking animations)
    const criticalRiskBadge = page.locator('text=Critical Risk');
    await expect(criticalRiskBadge).toBeVisible({ timeout: 15000 });

    // Check that contributing factors are rendered in the list
    const hypoxiaFactor = page.locator('text=Hypoxia detected');
    await expect(hypoxiaFactor).toBeVisible({ timeout: 10000 });

    const myocardialWorkloadFactor = page.locator('text=High Myocardial Workload');
    await expect(myocardialWorkloadFactor).toBeVisible({ timeout: 10000 });

    const sbpDeviationFactor = page.locator('text=Systolic BP out of baseline');
    await expect(sbpDeviationFactor).toBeVisible({ timeout: 10000 });

    // 5. Verify Autonomic Recovery (Resets back to normal)
    await bpInput.fill('120/80');
    await bpInput.blur();

    await hrInput.fill('72');
    await hrInput.blur();

    await spo2Input.fill('98');
    await spo2Input.blur();

    // Verify it drops back down to Low Risk
    await expect(lowRiskBadge).toBeVisible({ timeout: 15000 });
    console.log('[PASS] Phil Gear: Low -> Critical -> Low Risk transitions verified.');
  });

  test('should verify triage scoring and containment indicators for CDC Sentinel', async ({ page }) => {
    // 1. Setup & Login
    await enterDemoMode(page);
    await selectPatientByName(page, 'CDC Sentinel');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Verify CDC Sentinel is loaded and has a triage panel
    const patientHeaderName = page.locator('h1', { hasText: 'CDC Sentinel' }).first();
    await expect(patientHeaderName).toBeVisible({ timeout: 10000 });

    const initialRiskCard = page.locator('text=Clinical Triage Risk');
    await expect(initialRiskCard).toBeVisible({ timeout: 10000 });

    // Since CDC Sentinel has RPP > 12000 and SBP > 140 at baseline, expect those flagged
    const workloadFactor = page.locator('text=High Myocardial Workload');
    await expect(workloadFactor).toBeVisible({ timeout: 10000 });

    const sbpFactor = page.locator('text=Systolic BP out of baseline');
    await expect(sbpFactor).toBeVisible({ timeout: 10000 });

    // Escalating CDC Sentinel to Critical Risk (severe deterioration)
    const bpInput = page.locator('#vitals-bp input');
    const hrInput = page.locator('#vitals-hr input');
    const spo2Input = page.locator('#vitals-spo2 input');

    await bpInput.fill('180/110'); // Severe hypertension
    await bpInput.blur();
    
    await hrInput.fill('125'); // Severe tachycardia
    await hrInput.blur();

    await spo2Input.fill('86'); // Critical hypoxia
    await spo2Input.blur();

    // Expect the Critical Risk badge to show (with pulsing indicators)
    const criticalRiskBadge = page.locator('text=Critical Risk');
    await expect(criticalRiskBadge).toBeVisible({ timeout: 15000 });

    // Verify factors list matches the acute presentation (Hypoxia should now be present)
    const hypoxiaFactor = page.locator('text=Hypoxia detected');
    await expect(hypoxiaFactor).toBeVisible({ timeout: 10000 });
    await expect(workloadFactor).toBeVisible({ timeout: 10000 });

    console.log('[PASS] CDC Sentinel: Outbreak triage risk escalation verified.');
  });
});
