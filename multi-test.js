/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const test = require('./docker-test');
const WORKERS = 8;
(async () => {
  const browser = await puppeteer.launch();

  const promises = [];
  for (let i = 0; i < WORKERS; i++) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 900,
      deviceScaleFactor: 1,
    });
    page.setDefaultNavigationTimeout(30 * 1000);
    const testRun = test
      .checkParksSite({page, id: i})
      .catch(e => console.warn(`Worker ${i} hit an error`, e));
    promises.push(testRun);
  }
  const TIMER = 'Worker test';
  console.time(TIMER);
  await Promise.all(promises);
  console.timeEnd(TIMER);
  await browser.close();
})();
