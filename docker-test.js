/* eslint-disable no-console */
const puppeteer = require('puppeteer');
// gotta figure everything out

const reloads = 2;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
  });
  await page.goto('https://www.recreation.gov/camping/campgrounds/232450');

  for (let i = 0; i < reloads; i++) {
    console.log('Reloading the page', i + 1);
    await page.reload({waitUntil: ['networkidle0', 'domcontentloaded']});
  }

  await page.screenshot({path: 'screenshots/test.png'});

  await browser.close();
})();
