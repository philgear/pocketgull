import { test, expect } from '@playwright/test';
import { setupE2ePage } from './utils/setup';

test.describe('Good Samaritan Emergency Mode E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await setupE2ePage(page);
  });

  test('should bypass authentication, trigger CPR metronome pacing, and return to lock screen on exit', async ({ page }) => {
    // 1. Setup & Navigate to lock screen
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Assert PIN entry is visible
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 10000 });

    // 2. Trigger Good Samaritan Emergency Bypass
    const emergencyBypassBtn = page.locator('button', { hasText: 'Good Samaritan Mode (Bypass)' });
    await expect(emergencyBypassBtn).toBeVisible({ timeout: 10000 });
    await emergencyBypassBtn.click();

    // 3. Assert transition to First Aid Mode (red pulsing badge/banner)
    const firstAidBadge = page.locator('text=First Aid Mode');
    await expect(firstAidBadge).toBeVisible({ timeout: 15000 });

    const offlineEmergencyTitle = page.locator('text=Offline Emergency First Aid Active');
    await expect(offlineEmergencyTitle).toBeVisible({ timeout: 10000 });

    // 4. Verify CPR Metronome Activation
    // Default is Adult (110 BPM)
    const cprButton = page.locator('button', { hasText: 'CPR Metronome (110 BPM)' });
    await expect(cprButton).toBeVisible({ timeout: 10000 });
    await cprButton.click();

    // After click, button should toggle state
    const stopButton = page.locator('button', { hasText: 'Stop Metronome' });
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // 5. Test Patient Demographic Selection (Pacing adjustment)
    // Select Infant demographic (should update pacing to 120 BPM)
    const infantBtn = page.locator('button', { hasText: 'Infant' });
    await expect(infantBtn).toBeVisible({ timeout: 5000 });
    await infantBtn.click();

    // Metronome should stop or update to 120 BPM label (when active, click toggles or stops.)
    // In code: toggleCprMetronome stops if active, otherwise starts.
    // Changing demographic doesn't stop it automatically, but reactive template updates button label.
    // Let's stop the metronome first.
    await stopButton.click();
    const infantBpmButton = page.locator('button', { hasText: 'CPR Metronome (120 BPM)' });
    await expect(infantBpmButton).toBeVisible({ timeout: 5000 });

    // Select Geriatric demographic
    const geriatricBtn = page.locator('button', { hasText: 'Geriatric' });
    await expect(geriatricBtn).toBeVisible({ timeout: 5000 });
    await geriatricBtn.click();

    const geriatricBpmButton = page.locator('button', { hasText: 'CPR Metronome (110 BPM)' });
    await expect(geriatricBpmButton).toBeVisible({ timeout: 5000 });

    // 6. Exit Emergency Mode and verify security relock
    const exitBtn = page.locator('button', { hasText: 'Exit Emergency Mode' });
    await expect(exitBtn).toBeVisible({ timeout: 5000 });
    await exitBtn.click();

    // Verify it returned to secure lock screen with pinInput visible
    await expect(pinInput).toBeVisible({ timeout: 10000 });
    console.log('[PASS] Good Samaritan Emergency Mode E2E transitions verified successfully.');
  });
});
