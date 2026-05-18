import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:4200/search.html', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded, evaluating search...');
  await page.evaluate(() => {
    window.postMessage({
        type: 'EXECUTE_SEARCH',
        query: 'magnesium deficiency'
    }, '*');
  });

  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
