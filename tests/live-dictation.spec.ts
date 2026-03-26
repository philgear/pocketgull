import { test, expect } from '@playwright/test';

test.describe('Live Dictation Modal', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Initial Load
    await page.goto('/');
    await expect(page.locator('app-root')).toBeVisible();

    // First unlock the biometric PIN if it exists
    const pinInput = page.getByPlaceholder('1234');
    // Using a fast timeout to check if PIN is present without waiting 30s
    try {
      if (await pinInput.isVisible({ timeout: 1000 })) {
        await pinInput.fill('1234');
        await pinInput.press('Enter');
      }
    } catch (e) {}

    // Bypass Splash Screen by clicking Demo Mode
    const demoBtn = page.locator('text=Demo Mode').first();
    try {
      if (await demoBtn.isVisible({ timeout: 1000 })) {
        await demoBtn.click();
      }
    } catch(e) {}
    
    // Wait for the animation to complete
    await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
    await page.setViewportSize({ width: 1440, height: 900 });

    // Open directory and select a patient safely
    const directoryToggle = page.getByRole('button', { name: 'Toggle Patient Directory' }).first();
    await directoryToggle.click();
    
    const patientCard = page.locator('text=Emma Clark').first();
    await expect(patientCard).toBeVisible();
    await patientCard.click();

    // Wait for the Medical Summary to settle
    const currentVisitHeading = page.getByRole('heading', { name: 'Current Visit / Chief Complaint' });
    await expect(currentVisitHeading).toBeVisible();
  });

  test('can open dictation modal, type text, and insert into chart', async ({ page }) => {
    // 1. Locate and click the dictation button next to Current Visit / Chief Complaint
    const dictateBtn = page.getByRole('button', { name: 'Dictate Visit Note' }).first();
    await expect(dictateBtn).toBeVisible();
    await dictateBtn.click();

    // 2. Verify Dictation Modal appears
    const modalHeading = page.getByRole('heading', { name: 'Voice Dictation' });
    await expect(modalHeading).toBeVisible();

    // Verify it is listening (Pause button should be visible)
    const pauseBtn = page.getByRole('button', { name: 'Pause' });
    await expect(pauseBtn).toBeVisible();
    
    // 3. Pause listening to avoid microphone permission issues in CI if applicable
    await pauseBtn.click();
    
    // Ensure the button changed to Resume
    const resumeBtn = page.getByRole('button', { name: 'Resume' });
    await expect(resumeBtn).toBeVisible();

    // 4. Type text manually into the dictation textarea
    const dictationTextarea = page.getByPlaceholder('Start speaking or type here...');
    await expect(dictationTextarea).toBeVisible();
    
    const testDictationText = 'Patient reports mild headaches persisting for the last 3 days. No fever, no nausea.';
    await dictationTextarea.fill(testDictationText);

    // 5. Click "Insert Text"
    const insertBtn = page.getByRole('button', { name: 'Insert Text' });
    await expect(insertBtn).toBeVisible();
    await insertBtn.click();

    // Modal should close
    await expect(modalHeading).not.toBeVisible();

    // 6. Verify the text was inserted into the target text area on the medical summary
    // The textarea in the medical summary next to Dictate button
    // It's a pocket-gull-input type="textarea" inside medical-summary
    const summaryTextarea = page.locator('app-medical-summary').locator('textarea').first();
    await expect(summaryTextarea).toBeVisible();
    await expect(summaryTextarea).toHaveValue(testDictationText);
  });

});
