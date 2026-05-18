import { test, expect } from '@playwright/test';

test.describe('Dual-Use AVS Therapy Component', () => {
  test('should render the clinical dashboard by default', async ({ page }) => {
    await page.goto('/');

    // Switch to Spark theme if necessary
    await page.locator('text=Origami').click().catch(() => {}); // In case it's on Origami
    await page.locator('text=Spark').click();

    // Wait for the Clinical Protocol Generator button to ensure component loaded
    await expect(page.locator('text=Clinical Protocol Generator')).toBeVisible();
    
    // Check for clinician-specific UI elements
    await expect(page.locator('text=Neuro-Physiological Baselines')).toBeVisible();
    await expect(page.locator('text=Clinical Safety & Constraints')).toBeVisible();
  });

  test('should toggle to patient waiting view', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Spark theme if necessary
    await page.locator('text=Origami').click().catch(() => {}); // In case it's on Origami
    await page.locator('text=Spark').click();

    // Switch to Patient View Mode
    // The toggle is in the header, let's find the button containing "Patient Waiting"
    const patientWaitingBtn = page.locator('button', { hasText: 'Patient Waiting' });
    await patientWaitingBtn.click();
    
    // Wait for the Patient UI to appear
    await expect(page.locator('text=Welcome to your Session')).toBeVisible();
    await expect(page.locator('text=Your clinician is preparing your chart.')).toBeVisible();
    
    // Check that clinician-specific controls are no longer visible
    await expect(page.locator('text=Neuro-Physiological Baselines')).toBeHidden();
    
    // Check that the pulsing core is visible
    const pulseCore = page.locator('.avs-pulsing-glow');
    await expect(pulseCore.first()).toBeVisible();
    
    // Interact with patient UI
    const startRelaxBtn = page.locator('button', { hasText: 'Start Relaxation' });
    await startRelaxBtn.click();
    
    // Check for pause button indicating it started
    await expect(page.locator('button', { hasText: 'Pause Relaxation' })).toBeVisible();
  });
});
