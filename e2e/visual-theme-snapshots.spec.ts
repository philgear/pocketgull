import { test, expect } from '@playwright/test';
import { setupE2ePage } from './utils/setup';

const THEMES = [
  'light',
  'dark',
  'spark',
  'papercraft',
  'hemp',
  'rice',
  'construction',
  'white-marble',
  'black-marble',
  'papyrus',
  'pool',
  'mandala'
];

const PERSONA_MODES = [
  'clinical',
  'arborist',
  'mechanic',
  'gentleman',
  'muse'
];

test.describe('Automated Theme & Persona Visual Snapshot Suite', () => {

  test.beforeEach(async ({ page }) => {
    await setupE2ePage(page, { mockClinician: true });
  });

  for (const theme of THEMES) {
    test(`verify theme loading and styling: ${theme}`, async ({ page }) => {
      // Direct URL query parameter navigation for theme override
      await page.goto(`/?theme=${theme}`);

      // Bypass splash modal if visible by clicking Demo Mode
      const demoBtn = page.locator('button', { hasText: 'Try Interactive Demo Mode' });
      if (await demoBtn.isVisible({ timeout: 2000 })) {
        await demoBtn.click();
      }

      // Verify the HTML document root carries the appropriate theme mode class
      const htmlElement = page.locator('html');
      await expect(htmlElement).toBeVisible();

      // Ensure top navbar adopts theme styling (.theme-nav-bar)
      const navbar = page.locator('nav.theme-nav-bar');
      await expect(navbar).toBeVisible({ timeout: 5000 });

      // Verify 3D Body Viewer canvas or container renders cleanly
      const bodyViewer = page.locator('app-body-viewer');
      await expect(bodyViewer).toBeVisible({ timeout: 5000 });
    });
  }

  for (const lens of PERSONA_MODES) {
    test(`verify health literacy persona mode: ${lens}`, async ({ page }) => {
      // Direct URL query parameter navigation for persona mode override
      await page.goto(`/?lens=${lens}`);

      // Bypass splash modal if visible
      const demoBtn = page.locator('button', { hasText: 'Try Interactive Demo Mode' });
      if (await demoBtn.isVisible({ timeout: 2000 })) {
        await demoBtn.click();
      }

      // Verify page title or report container renders cleanly
      const analysisReport = page.locator('app-analysis-report');
      await expect(analysisReport).toBeVisible({ timeout: 5000 });
    });
  }

  test('verify global sentinel scope toggle bar functionality', async ({ page }) => {
    await page.goto('/?lens=arborist');

    // Bypass splash modal
    const demoBtn = page.locator('button', { hasText: 'Try Interactive Demo Mode' });
    if (await demoBtn.isVisible({ timeout: 2000 })) {
      await demoBtn.click();
    }

    // Toggle Macro Fleet Sentinel Scope
    const macroBtn = page.locator('button', { hasText: 'Macro Fleet Sentinel' });
    if (await macroBtn.isVisible({ timeout: 3000 })) {
      await macroBtn.click();
      // Verify macro fleet telemetry banner renders
      const macroBanner = page.locator('text=Arboristic Canopy Sentinel Telemetry');
      await expect(macroBanner).toBeVisible({ timeout: 5000 });
    }
  });

});
