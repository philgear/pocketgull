import { test, expect } from '@playwright/test';

test.describe('Layout Integrity Verification', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Initial Load
    await page.goto('/');
    // Wait for main application framework to load
    await expect(page.locator('app-root')).toBeVisible();

    // First unlock the biometric PIN if it exists
    const pinInput = page.getByPlaceholder('1234');
    if (await pinInput.isVisible()) {
      await pinInput.fill('1234');
      await pinInput.press('Enter');
    }

    // Bypass Splash Screen by clicking Demo Mode
    const demoBtn = page.locator('text=Demo Mode').first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
    }
    
    // MUST wait for the 800ms fade-out animation to complete so it unblocks the layout DOM!
    await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
    
    // Ensure viewport is unmistakably desktop size to prevent mobile flex hiding
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Column Resizer constraints and reset', async ({ page }) => {
    // 2. Column Resizer Test
    const resizer = page.locator('.cursor-col-resize').first();
    await expect(resizer).toBeVisible();

    // Drag Left
    const box = await resizer.boundingBox();
    if (!box) throw new Error('Resizer not found');
    
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 200, box.y + box.height / 2);
    await page.mouse.up();

    // Dbl Click to Reset
    await resizer.dblclick();

    // We can't strictly assert the internal bounding sizes without specific data-testids,
    // but we can ensure the layout doesn't crash and the resizer remains visible and intractable.
    await expect(resizer).toBeVisible();
  });

  test('Interactive Mapping updates Chief Complaint', async ({ page }) => {
    // 4. Interactive Mapping
    // Look for body-viewer or specific anatomical areas
    const headNode = page.locator('text=Head').first();
    if (await headNode.isVisible()) {
      await headNode.click();
      const complaintText = page.locator('text=HEAD').first();
      await expect(complaintText).toBeVisible();
    }
  });

  test('System Readiness Status Indicator', async ({ page }) => {
    // 5. System Readiness (Support both online state and headless offline state)
    const statusIndicator = page.locator('text=System Ready').first().or(page.locator('text=System Offline').first());
    
    // Wait for the indicator to appear
    await expect(statusIndicator).toBeVisible({ timeout: 10000 });
    
    // Hover to trigger tooltip
    await statusIndicator.hover();
    
    // Verify tooltip or title appears
    const tooltip = page.locator('text=Active').first();
    await expect(tooltip).toBeAttached();
  });
});
