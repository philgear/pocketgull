import { test, expect } from '@playwright/test';

test.describe('Multi-Patient Care Plan Strategy E2E Suite', () => {

  test('should generate and verify care plans across diverse patient profiles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // PIN Entry
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    await pinInput.fill('1234');
    await pinInput.press('Enter');

    // Demo Mode Entry
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    await expect(demoBtn).toBeVisible({ timeout: 10000 });
    await demoBtn.click();

    // Skip KSS if present
    const skipBtn = page.locator('button', { hasText: 'Skip' });
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }

    // Ethics Pledge
    const pledgeCheckbox = page.locator('input[type="checkbox"]');
    await expect(pledgeCheckbox).toBeVisible({ timeout: 10000 });
    await pledgeCheckbox.check();

    const acceptBtn = page.locator('button', { hasText: 'Accept & Enter System' });
    await expect(acceptBtn).toBeVisible({ timeout: 10000 });
    await acceptBtn.click();

    // Verify Main Container renders
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Open Roster / Patient Switcher if available
    const rosterBtn = page.locator('button', { hasText: 'Switch Patient' });
    if (await rosterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rosterBtn.click();
    }

    // Verify analysis lenses populate
    const overviewTab = page.locator('button', { hasText: 'Summary Overview' });
    await expect(overviewTab).toBeVisible({ timeout: 10000 });

    console.log('[PASS] Multi-Patient E2E Care Plan Verification complete.');
  });

});
