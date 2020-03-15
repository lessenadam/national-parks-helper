/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const helper = require('./park-website');
const WORKERS = 3;

(async () => {
  // const browser = await puppeteer.launch({devtools: true});
  const browser = await puppeteer.launch();

  const promises = [];
  for (let i = 0; i < WORKERS; i++) {
    const context = await browser.createIncognitoBrowserContext();
    // Create a new page in a pristine context.
    const page = await context.newPage();
    await page.setViewport({
      width: 1200,
      height: 900,
      deviceScaleFactor: 1,
    });
    const webPromise = helper
      .checkParksSite({page, id: i})
      .catch(e => console.warn(`Worker ${i} hit an error`, e));
    promises.push(webPromise);
  }
  const TIMER = 'Worker test';
  console.time(TIMER);
  await Promise.all(promises);
  console.timeEnd(TIMER);
  await browser.close();
})();
