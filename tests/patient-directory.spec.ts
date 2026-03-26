import { test, expect } from '@playwright/test';

test.describe('Patient Directory & Management', () => {

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
    
    // Wait for the animation to complete
    await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
    
    // Ensure viewport is desktop size
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('can open patient directory and select a different patient', async ({ page }) => {
    // Open the directory if it's not already open
    const directoryToggle = page.getByLabel('Toggle Patient Directory');
    await expect(directoryToggle).toBeVisible();
    
    // Check if the directory heading is visible
    const rosterHeading = page.getByRole('heading', { name: 'Clinical Roster' });
    const isDirVisible = await rosterHeading.isVisible();
    if (!isDirVisible) {
      await directoryToggle.click();
    }
    await expect(rosterHeading).toBeVisible();

    // Click on a specific mock patient, e.g., "Sarah Jenkins"
    const patientName = 'Sarah Jenkins';
    const patientCard = page.locator(`text=${patientName}`).first();
    await expect(patientCard).toBeVisible();
    await patientCard.click();

    // Wait for the name to be reflected in the top bar
    const headerName = page.locator('h1', { hasText: patientName }).first();
    await expect(headerName).toBeVisible();
  });

  test('can open new patient form', async ({ page }) => {
    const directoryToggle = page.getByLabel('Toggle Patient Directory');
    const rosterHeading = page.getByRole('heading', { name: 'Clinical Roster' });
    const isDirVisible = await rosterHeading.isVisible();
    if (!isDirVisible) {
      await directoryToggle.click();
    }
    await expect(rosterHeading).toBeVisible();
    
    // Click 'New Patient' button
    const newPatientBtn = page.getByRole('button', { name: /New Patient/i }).first();
    await expect(newPatientBtn).toBeVisible();
    await newPatientBtn.click();

    // Verify the form appears (Create New Patient modal)
    const modalHeading = page.getByRole('heading', { name: 'Create New Patient' });
    await expect(modalHeading).toBeVisible();
    
    const nameInput = page.getByRole('textbox', { name: /Full Name/i }).or(page.locator('input[name="name"]'));
    await expect(nameInput).toBeVisible();
  });

});
