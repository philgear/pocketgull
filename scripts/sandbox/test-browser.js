import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.toString()}`);
  });
  page.on('requestfailed', req => {
    errors.push(`Request Failed: ${req.url()} (${req.failure()?.errorText || 'unknown'})`);
  });
  page.on('response', res => {
    if (res.status() >= 400) {
      errors.push(`HTTP Error ${res.status()}: ${res.url()}`);
    }
  });

  const port = process.env.PORT || 4200;
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle0' });

  if (errors.length > 0) {
    console.log('Found errors:', errors);
    process.exit(1);
  } else {
    console.log('No console errors found. App loaded successfully!');
    process.exit(0);
  }
  await browser.close();
})();
