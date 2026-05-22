import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const port = process.env.PORT || 4200;
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle0' });
  const content = await page.content();
  if (content.includes('process is not defined')) {
    console.error('Data failed to load.');
    process.exit(1);
  }
  console.log('App loaded without ReferenceError.');
  await browser.close();
})();
