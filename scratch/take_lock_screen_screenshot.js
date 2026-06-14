import { chromium } from '@playwright/test';
import * as path from 'path';

async function run() {
  const artifactDir = 'C:/Users/philg/.gemini/antigravity/brain/168840e4-6298-43fd-9b54-d5d5e360d6e1';
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  // Clear mock settings or set clinician to bypass to lock screen
  await context.addInitScript(() => {
    window.localStorage.setItem('pg_tour_seen', '1');
    window.localStorage.setItem('pg_mock_clinician', '1');
  });

  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:4200...');
  await page.goto('http://localhost:4200');

  console.log('Waiting for gesture canvas lock screen to render...');
  const canvas = page.locator('canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 });

  // Wait a moment for stable rendering
  await page.waitForTimeout(2000);

  const screenshotPath = path.join(artifactDir, 'lock_screen.png');
  console.log(`Taking screenshot of lock screen to: ${screenshotPath}`);
  await page.screenshot({ path: screenshotPath });

  console.log('Lock screen screenshot taken successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during lock screen capture:', err);
  process.exit(1);
});
