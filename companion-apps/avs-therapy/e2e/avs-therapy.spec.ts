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

  // Accept ethics pledge
  const pledgeCheckbox = page.locator('input[type="checkbox"]');
  await expect(pledgeCheckbox).toBeVisible({ timeout: 10000 });
  await pledgeCheckbox.check();

  // Click Accept & Continue
  const acceptBtn = page.locator('button', { hasText: 'Accept & Continue' });
  await expect(acceptBtn).toBeVisible({ timeout: 10000 });
  await acceptBtn.click();
  
  // 3. Click Skip assessment
  const skipBtn = page.locator('button', { hasText: 'Skip assessment' });
  await expect(skipBtn).toBeVisible({ timeout: 10000 });
  await skipBtn.click();

  // 4. Cycle theme to Spark Mode (since it resets to light on boot for clinical safety)
  const themeBtn = page.locator('button[aria-label="Toggle Theme"]');
  await expect(themeBtn).toBeVisible({ timeout: 10000 });
  await themeBtn.click(); // light -> dark
  await themeBtn.click(); // dark -> spark
}

test.describe('Dual-Use AVS Therapy Component', () => {
  test.beforeEach(async ({ page }) => {
    // Prevent the walkthrough tour from launching automatically, and default to the Spark theme
    await page.addInitScript(() => {
      window.localStorage.setItem('pg_tour_seen', '1');
      window.localStorage.setItem('pocket_gull_theme', 'spark');
      window.localStorage.setItem('pg_mock_clinician', '1');
      // Disable service worker during tests so Playwright can intercept API requests
      try {
        const mockSW = {
          register: () => Promise.reject(new Error('Service worker disabled for testing')),
          addEventListener: () => {},
          removeEventListener: () => {},
          getRegistration: () => Promise.resolve(undefined),
          getRegistrations: () => Promise.resolve([]),
          controller: null,
          ready: new Promise(() => {})
        };
        Object.defineProperty(navigator, 'serviceWorker', {
          get() { return mockSW; },
          configurable: true
        });
      } catch (e) {
        console.error('Failed to disable service worker:', e);
      }
    });
  });

  test('should render the clinical dashboard by default', async ({ page }) => {
    await page.goto('/');
    
    // Bypass secure splash
    await bypassSecureSplash(page);

    // Wait for the AVS Biometric Neuro-Therapy text to ensure component loaded
    await expect(page.locator('text=AVS Biometric Neuro-Therapy')).toBeVisible({ timeout: 15000 });
    
    // Check for clinician-specific UI elements
    await expect(page.locator('text=Practitioner Target Goals')).toBeVisible();
    await expect(page.locator('text=AVS Clinical Disclaimer')).toBeVisible();
  });

  test('should toggle to patient waiting view', async ({ page }) => {
    await page.goto('/');

    // Bypass secure splash
    await bypassSecureSplash(page);

    // Switch to Patient View Mode
    // The toggle is in the header, let's find the button containing "Patient Waiting"
    const patientWaitingBtn = page.locator('button', { hasText: 'Patient Waiting' });
    await patientWaitingBtn.click();
    
    // Wait for the Patient UI to appear
    await expect(page.locator('text=Welcome to your Session')).toBeVisible({ timeout: 10000 });
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
