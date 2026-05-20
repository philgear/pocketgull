import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import fs from 'fs';

async function runAdvancedAudits() {
    console.log('Starting advanced accessibility sweeps...');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--remote-debugging-port=9222'] });
    const page = await browser.newPage();
    
    // Setup for deeper state testing
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    
    console.log('\n--- 1. Axe-core Deep Scan (Demo Mode / Active State) ---');
    // Enable demo mode to populate the UI with actual patient data and interactive elements
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
        if (demoBtn) demoBtn.click();
    });
    
    // Wait for the UI to fully build the demo patient
    await new Promise(r => setTimeout(r, 4000));
    
    // Wait for the specific AI insight cards to render
    try {
      await page.waitForSelector('.prose', { timeout: 5000 });
    } catch(e) {
      console.log('Timeout waiting for AI summary to render, continuing anyway...');
    }

    // Run Axe specifically targeting the loaded patient dashboard
    const results = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
      
    console.log(`Axe-core found ${results.violations.length} violations in the active Dashboard state.`);
    if (results.violations.length > 0) {
        results.violations.forEach(v => {
            console.log(`\nRule: ${v.id} (${v.impact})`);
            console.log(`Help: ${v.help}`);
            v.nodes.forEach(n => console.log(`  Target: ${n.target.join(', ')}`));
        });
    }

    console.log('\n--- 2. Keyboard Navigation Traversal Audit ---');
    // Reload cleanly to test tab flow
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    
    const focusableElements = await page.evaluate(() => {
        const nodes = document.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
        return Array.from(nodes).map(n => ({
            tag: n.tagName.toLowerCase(),
            text: n.innerText?.substring(0, 30).replace(/\n/g, ' ') || n.value?.substring(0, 30) || n.getAttribute('aria-label') || 'unnamed element',
            tabIndex: n.getAttribute('tabindex')
        }));
    });
    
    console.log(`Found ${focusableElements.length} naturally focusable elements on the landing screen.`);
    // We want to ensure no element has a positive tabindex (which breaks natural DOM flow)
    const positiveTabIndex = focusableElements.filter(el => {
        const ti = parseInt(el.tabIndex);
        return !isNaN(ti) && ti > 0;
    });
    
    if (positiveTabIndex.length > 0) {
        console.log('WARNING: Elements found with positive tabindex (WCAG 2.4.3 violation risk):', positiveTabIndex);
    } else {
        console.log('SUCCESS: Natural DOM order maintained (no positive tabindex attributes found).');
    }

    // Simulate Tab presses to verify focus changes
    const tabCounts = Math.min(focusableElements.length + 5, 20); // Test up to 20 tabs
    const focusTrail = [];
    
    for (let i = 0; i < tabCounts; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => {
            const active = document.activeElement;
            if (!active || active === document.body) return null;
            return active.tagName.toLowerCase() + (active.id ? '#' + active.id : '') + (active.className ? '.' + active.className.split(' ').join('.') : '');
        });
        if (activeElement) {
            focusTrail.push(activeElement);
        }
    }
    
    console.log(`Simulated ${tabCounts} Tab keystrokes. Last 5 focused elements:`);
    focusTrail.slice(-5).forEach((el, i) => console.log(`  ${focusTrail.length - 5 + i + 1}. ${el}`));
    
    // Check if focus got trapped on the body (meaning we tabbed out or hit a trap)
    const finalFocusBody = await page.evaluate(() => document.activeElement === document.body);
    if (finalFocusBody) {
        console.log('Note: Focus eventually returned to document body (expected if tabbing past end of page).');
    } else {
         console.log('Note: Focus remained within interactive elements.');
    }

    await browser.close();
}

runAdvancedAudits().catch(console.error);
