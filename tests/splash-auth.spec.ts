import { test, expect } from '@playwright/test';

test.describe('Secure Splash Authentication', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept and discard any server-injected API key so the UI falls back to the manual entry config flow
    await page.addInitScript(() => {
      Object.defineProperty(window, 'GEMINI_API_KEY', {
        value: undefined,
        writable: false,
        configurable: true
      });
    });

    await page.goto('/');
    // Wait for the app-root to attach
    await expect(page.locator('app-root')).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Rejects invalid PIN and displays error', async ({ page }) => {
    const pinInput = page.getByPlaceholder('1234');
    await expect(pinInput).toBeVisible();

    // Fill an invalid PIN
    await pinInput.fill('9999');
    await pinInput.press('Enter');

    // Expect the error message to appear
    const errorMsg = page.locator('text=Invalid Access Code.');
    await expect(errorMsg).toBeVisible();
  });

  test('Accepts valid PIN and reveals API Configuration', async ({ page }) => {
    const pinInput = page.getByPlaceholder('1234');
    await expect(pinInput).toBeVisible();

    // Fill the valid PIN
    await pinInput.fill('1234');
    await pinInput.press('Enter');

    // Expected transition to the API Key form
    // The "Resume Session" / "Idle Timeout" text should disappear, replaced by "Enter Gemini API Key"
    const apiKeyInput = page.getByPlaceholder('Enter Gemini API Key (AIza...)');
    await expect(apiKeyInput).toBeVisible();
    
    // Check that the initialized system button is disabled when empty
    const initBtn = page.locator('button[type="submit"]', { hasText: 'Initialize System' });
    await expect(initBtn).toBeDisabled();

    // Fill it out to enable it
    await apiKeyInput.fill('test-key-123');
    await expect(initBtn).toBeEnabled();
  });

  test('Demo Mode successfully dismisses the splash screen', async ({ page }) => {
    // Unlock first
    const pinInput = page.getByPlaceholder('1234');
    await pinInput.fill('1234');
    await pinInput.press('Enter');

    // Click Demo Mode
    const demoBtn = page.locator('text=Demo Mode');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // The splash screen should animate out and vanish
    await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
  });
});
