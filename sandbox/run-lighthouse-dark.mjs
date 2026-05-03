import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';

async function run() {
  const port = (new URL(browser.wsEndpoint())).port;
  
  // Navigate to give the app a chance to load
  const page = await browser.newPage();
  await page.goto('http://localhost:4200');
  
  // Set the theme in localStorage to dark
  await page.evaluate(() => {
    localStorage.setItem('pocket_gull_theme', 'dark');
  });
  
  // Optionally click the "Try Demo" to ensure we test the main UI
  try {
    const demoClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
      if (demoBtn) {
        demoBtn.click();
        return true;
      }
      return false;
    });
    if (demoClicked) {
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  } catch (e) {}

  // Run Lighthouse on the same browser instance
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility'],
    port
  };
  
  const runnerResult = await lighthouse('http://localhost:4200', options);

  // `.report` is the HTML report as a string
  const reportJson = runnerResult.report;
  fs.writeFileSync('lighthouse_dark.json', reportJson);

  console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
  console.log('Accessibility score was', runnerResult.lhr.categories.accessibility.score * 100);

  await browser.close();
}

async function start() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--remote-debugging-port=9222'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['accessibility'],
      port: 9222,
      disableStorageReset: true // DON'T clear localStorage
    };
    
    // Navigate using puppeteer to set localStorage
    const page = await browser.newPage();
    await page.goto('http://localhost:4200');
    await page.evaluate(() => {
      localStorage.setItem('pocket_gull_theme', 'dark');
    });
    // Click demo
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
        if (demoBtn) demoBtn.click();
    });
    await new Promise(r => setTimeout(r, 4000));
    
    // Force dark mode via emulation in case Lighthouse resets it
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    
    const runnerResult = await lighthouse('http://localhost:4200', options);
    fs.writeFileSync('lighthouse_dark.json', runnerResult.report);
    console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100);
    await browser.close();
}
start();
