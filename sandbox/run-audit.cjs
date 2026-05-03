const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const fs = require('fs');

(async () => {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--window-size=1280,1024']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  
  console.log('Loading app...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
  
  console.log('Clicking "Try Demo"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent && b.textContent.includes('Try Demo'));
    if (demoBtn) demoBtn.click();
  });
  
  // Wait for data generation
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Forcing Dark Mode...');
  // Force adding 'dark' strictly to the HTML root
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  
  // Wait for transitions and renders
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Running axe-core analysis...');
  const results = await new AxePuppeteer(page)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
    
  console.log(`\nFound ${results.violations.length} violations in Dark Mode.\n`);
  
  let report = '# WCAG Dark Mode Audit Results\n\n';
  report += `**Total Violations:** ${results.violations.length}\n\n`;
  
  results.violations.forEach((v, i) => {
    report += `### ${i+1}. ${v.id} (${v.impact})\n`;
    report += `**Description:** ${v.description}\n\n`;
    report += `**Help:** [Learn more](${v.helpUrl})\n\n`;
    report += `**Affected Nodes (${v.nodes.length}):**\n`;
    v.nodes.slice(0, 3).forEach(n => {
       report += `- \`${n.html}\`\n  - *${n.failureSummary}*\n`;
    });
    if (v.nodes.length > 3) {
      report += `- ...and ${v.nodes.length - 3} more.\n`;
    }
    report += '\n---\n\n';
  });
  
  fs.writeFileSync('C:\\Users\\philg\\.gemini\\antigravity\\brain\\c5706165-a2bd-41b8-9f1c-c92d41842d17\\wcag_audit_report.md', report);
  console.log('Saved detailed report to artifacts.');
  
  await browser.close();
})();
