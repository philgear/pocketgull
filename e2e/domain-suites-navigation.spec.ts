import { test, expect } from '@playwright/test';

test.describe('10-Dimensional Master Domain Suites E2E Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev app
    await page.goto('http://localhost:4200/', { waitUntil: 'domcontentloaded' });
  });

  test('should display 10-Dimensional Master Paradigm Synthesizer & navigate all 10 domain suites', async ({ page }) => {
    // Wait for main container or bypass splash screen if visible
    const bypassBtn = page.locator('button:has-text("Enter Application"), button:has-text("Bypass"), button:has-text("Skip")').first();
    if (await bypassBtn.isVisible().catch(() => false)) {
      await bypassBtn.click();
    }

    // Verify Master Paradigm Synthesizer Card is rendered
    const synthesizerHeader = page.locator('h3:has-text("10-Dimensional Master Paradigm Health Vector")');
    await expect(synthesizerHeader).toBeVisible({ timeout: 15000 });

    // Define all 10 Domain Suite tab names to test
    const suites = [
      'Biomedical & Diagnostic',
      'Therapeutics & Botanical',
      'Nutritional & Metabolic',
      'Kinetic & Recovery',
      'Turing Formal Logic',
      'Nobel Evidence Engine',
      'AAAS Science Breakthroughs',
      'Lasker & Breakthrough',
      'Eastern TCM Jing-Luo',
      'Ayurvedic Tridosha'
    ];

    for (const suiteName of suites) {
      const tabButton = page.locator(`button:has-text("${suiteName}")`).first();
      await expect(tabButton).toBeVisible();
      await tabButton.click();
      await page.waitForTimeout(200);
    }
  });
});
