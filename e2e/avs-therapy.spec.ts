import { test, expect } from '@playwright/test';

async function bypassSecureSplash(page: any) {
  // 1. Enter PIN
  const pinInput = page.locator('input[placeholder="1234"]');
  await expect(pinInput).toBeVisible({ timeout: 10000 });
  await pinInput.fill('1234');
  await pinInput.press('Enter');
  
  // 2. Click Demo Mode
  const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
  await expect(demoBtn).toBeVisible({ timeout: 10000 });
  await demoBtn.click();
  
  // 3. Click Skip assessment
  const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
  await expect(skipBtn).toBeVisible({ timeout: 10000 });
  await skipBtn.click();
}

test.describe('Dual-Use AVS Therapy Component', () => {
<<<<<<< Updated upstream
  test.beforeEach(async ({ page }) => {
    // Prevent the walkthrough tour from launching automatically, and default to the Spark theme
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pocket_gull_theme', 'spark');
    });
    
=======
  test('should render the clinical dashboard by default', async ({ page, context }) => {
    // Set theme to spark in localStorage before navigation so the AVS component loads
    await context.addInitScript(() => {
      window.localStorage.setItem('pocket_gull_theme', 'spark');
    });
>>>>>>> Stashed changes
    await page.goto('/');
    
    // Unlock using PIN code 1234
    const pinInput = page.locator('input[placeholder="1234"]');
    await expect(pinInput).toBeVisible({ timeout: 5000 });
    await pinInput.fill('1234');
    await pinInput.press('Enter');
    
    // Bypass auth to enter main clinical dashboard (using our new secure Mock SSO or Demo mode)
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    await expect(demoBtn).toBeVisible({ timeout: 5000 });
    await demoBtn.click();

<<<<<<< Updated upstream
    // Dismiss the Karolinska Sleepiness Scale (KSS) assessment to enter the system
    const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
    await skipBtn.click();
  });

  test('should render the clinical dashboard by default', async ({ page }) => {
    // Wait for the Generate Protocol button to ensure component loaded
    await expect(page.locator('text=Generate Protocol')).toBeVisible();
=======
    // Bypass secure splash
    await bypassSecureSplash(page);

    // Wait for the AVS Biometric Neuro-Therapy text to ensure component loaded
    await expect(page.locator('text=AVS Biometric Neuro-Therapy')).toBeVisible();
>>>>>>> Stashed changes
    
    // Check for clinician-specific UI elements
    await expect(page.locator('text=Practitioner Target Goals')).toBeVisible();
    await expect(page.locator('text=AVS Clinical Disclaimer')).toBeVisible();
  });

<<<<<<< Updated upstream
  test('should toggle to patient waiting view', async ({ page }) => {
=======
  test('should toggle to patient waiting view', async ({ page, context }) => {
    // Set theme to spark in localStorage before navigation
    await context.addInitScript(() => {
      window.localStorage.setItem('pocket_gull_theme', 'spark');
    });
    await page.goto('/');

    // Bypass secure splash
    await bypassSecureSplash(page);

>>>>>>> Stashed changes
    // Switch to Patient View Mode
    // The toggle is in the header, let's find the button containing "Patient Waiting"
    const patientWaitingBtn = page.locator('button', { hasText: 'Patient Waiting' });
    await patientWaitingBtn.click();
    
    // Wait for the Patient UI to appear
    await expect(page.locator('text=Welcome to your Session')).toBeVisible();
    await expect(page.locator('text=Your clinician is preparing your chart.')).toBeVisible();
    
    // Check that clinician-specific controls are no longer visible
    await expect(page.locator('text=Practitioner Target Goals')).toBeHidden();
    
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

