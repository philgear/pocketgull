import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';

async function start() {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--remote-debugging-port=9222'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['accessibility'],
      port: 9222,
      disableStorageReset: true
    };
    
    console.log('Navigating to https://pocketgall.app');
    const page = await browser.newPage();
    await page.goto('https://pocketgall.app', { waitUntil: 'networkidle2' });
    
    console.log('Setting dark theme...');
    await page.evaluate(() => {
      localStorage.setItem('pocket_gull_theme', 'dark');
    });
    
    console.log('Clicking Try Demo...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
        if (demoBtn) demoBtn.click();
    });
    
    console.log('Waiting for load...');
    await new Promise(r => setTimeout(r, 4000));
    
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    
    console.log('Running Lighthouse...');
    const runnerResult = await lighthouse('https://pocketgall.app', options);
    
    fs.writeFileSync('lighthouse_wcag_live.json', runnerResult.report);
    console.log('\n--- RESULTS ---');
    console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100);
    
    // Check for specific WCAG violations
    const audits = runnerResult.lhr.audits;
    const failedAudits = Object.values(audits).filter(a => a.score !== null && a.score < 1 && a.details && a.details.type === 'table');
    
    if (failedAudits.length > 0) {
        console.log('\n--- WCAG Violations Found ---');
        failedAudits.forEach(audit => {
            console.log(`\nRule: ${audit.title} (${audit.id})`);
            console.log(`Description: ${audit.description}`);
            if (audit.details && audit.details.items) {
                audit.details.items.forEach((item, i) => {
                    console.log(`  Issue ${i+1}:`, item.node ? item.node.snippet : item);
                });
            }
        });
    } else {
        console.log('\nNo WCAG violations found! Perfect accessibility score.');
    }
    
    await browser.close();
}

start().catch(console.error);
