import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Demo Mode Medicine Paradigms Verification', () => {
  test.beforeEach(async ({ page }) => {
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

  test('should unlock, cycle through 4 paradigms, check lenses, and save screenshots', async ({ page }) => {
    // Enable console logging to see page issues if any
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Go to home page
    await page.goto('/');

    // 1. PIN Code Entry
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    await pinInput.fill('1234');
    await pinInput.press('Enter');

    // 2. Select Demo Mode
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    await expect(demoBtn).toBeVisible({ timeout: 10000 });
    await demoBtn.click();

    // 3. Accept Ethics Pledge
    const pledgeCheckbox = page.locator('input[type="checkbox"]');
    await expect(pledgeCheckbox).toBeVisible({ timeout: 10000 });
    await pledgeCheckbox.check();

    // Click Accept & Continue
    const acceptBtn = page.locator('button', { hasText: 'Accept & Continue' });
    await expect(acceptBtn).toBeVisible({ timeout: 10000 });
    await acceptBtn.click();

    // 4. Skip Karolinska Sleepiness Scale (KSS) assessment
    const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
    await expect(skipBtn).toBeVisible({ timeout: 10000 });
    await skipBtn.click();

    // 5. Verify Main Viewport loads
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    
    // Wait for initial analysis container content to render
    const analysisReportEl = page.locator('app-analysis-report');
    await expect(analysisReportEl).toBeVisible({ timeout: 10000 });

    const artifactDir = 'C:/Users/philg/.gemini/antigravity/brain/168840e4-6298-43fd-9b54-d5d5e360d6e1';

    // Set a large viewport size for premium screenshot resolution
    await page.setViewportSize({ width: 1440, height: 900 });

    // --- Western Philosophy Verification ---
    console.log('[Verification] Testing Western Paradigm...');
    const westernBtn = page.locator('button', { hasText: 'Western' });
    await westernBtn.click();
    await page.waitForTimeout(1000); // Wait for transition/mock load

    // Verify all 6 tabs/lenses are visible
    const tabs = [
      'Overview',
      'Functional Protocols',
      'Nutrition',
      'Orthomolecular Profiling',
      'Monitoring & Follow-up',
      'Patient Education'
    ];

    for (const tab of tabs) {
      const tabButton = page.locator('button', { hasText: tab });
      await expect(tabButton).toBeVisible();
    }

    // Verify Western content loads on default Summary Overview tab
    const overviewText = page.locator('app-analysis-report').locator('text=Clinical Assessment');
    await expect(overviewText).toBeVisible({ timeout: 5000 });

    // Verify Western Nutrition tab works (which we recently added)
    const nutritionTab = page.locator('button', { hasText: 'Nutrition' });
    await nutritionTab.click();
    await page.waitForTimeout(500);
    // Nutrition-specific Western keyword
    await expect(page.locator('app-analysis-report').locator('text=Mediterranean Diet Pattern')).toBeVisible({ timeout: 5000 });

    // Take Western Screenshot (from Summary Overview tab)
    const overviewTab = page.locator('button', { hasText: 'Overview' });
    await overviewTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'western_dashboard.png'), fullPage: true });
    console.log('[Verification] Western screenshot saved.');

    // --- Eastern (TCM) Philosophy Verification ---
    console.log('[Verification] Testing Eastern Paradigm...');
    const easternBtn = page.locator('button', { hasText: 'Eastern (TCM)' });
    await easternBtn.click();
    await page.waitForTimeout(1000);

    // Verify Eastern Banner active
    await expect(page.locator('text=Active Paradigm: Eastern (Traditional Chinese Medicine)')).toBeVisible({ timeout: 5000 });

    // Verify Functional Protocols in Eastern Mode
    const functionalTab = page.locator('button', { hasText: 'Functional Protocols' });
    await functionalTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('app-analysis-report').locator('text=Corydalis Yanhusuo')).toBeVisible({ timeout: 5000 });

    // Take Eastern Screenshot
    await page.screenshot({ path: path.join(artifactDir, 'eastern_dashboard.png'), fullPage: true });
    console.log('[Verification] Eastern screenshot saved.');

    // --- Ayurvedic Philosophy Verification ---
    console.log('[Verification] Testing Ayurvedic Paradigm...');
    const ayurvedicBtn = page.locator('button', { hasText: 'Ayurvedic' });
    await ayurvedicBtn.click();
    await page.waitForTimeout(1000);

    // Verify Ayurvedic Banner active
    await expect(page.locator('text=Active Paradigm: Ayurvedic Medicine')).toBeVisible({ timeout: 5000 });

    // Verify Orthomolecular Profiling in Ayurvedic Mode
    const orthomolecularTab = page.locator('button', { hasText: 'Orthomolecular Profiling' });
    await orthomolecularTab.click();
    await page.waitForTimeout(500);
    // Ayurvedic biomarker check
    await expect(page.locator('app-analysis-report').locator('text=structural dryness')).toBeVisible({ timeout: 5000 });

    // Take Ayurvedic Screenshot
    await page.screenshot({ path: path.join(artifactDir, 'ayurvedic_dashboard.png'), fullPage: true });
    console.log('[Verification] Ayurvedic screenshot saved.');

    // --- Grow Thy Self Philosophy Verification ---
    console.log('[Verification] Testing Grow Thy Self Paradigm...');
    const growThyselfBtn = page.locator('button', { hasText: 'Grow Thy Self' });
    await growThyselfBtn.click();
    await page.waitForTimeout(1000);

    // Verify Grow Thy Self Banner active
    await expect(page.locator('text=Active Paradigm: Grow Thy Self (Preventive & Longevity)')).toBeVisible({ timeout: 5000 });

    // Verify Nutrition in Grow Thy Self Mode
    await nutritionTab.click();
    await page.waitForTimeout(500);
    // Grow Thy Self longevity nutrition check
    await expect(page.locator('app-analysis-report').locator('text=Sirtuin-1 activation')).toBeVisible({ timeout: 5000 });

    // Take Grow Thy Self Screenshot
    await page.screenshot({ path: path.join(artifactDir, 'grow_thy_self_dashboard.png'), fullPage: true });
    console.log('[Verification] Grow Thy Self screenshot saved.');
  });
});
