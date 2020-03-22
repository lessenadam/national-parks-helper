/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const helper = require('./park-website');
const WORKERS = 4;
const MAX_BOOKED_SITES = 2;

const bookedSites = [];
const shouldBookSite = () => bookedSites.length < MAX_BOOKED_SITES;
const handleBookedSite = siteId => bookedSites.push(siteId);

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
    const logger = status => console.warn(`Worker ${i} ${status}`);
    const webPromise = helper
      .checkParksSite({id: i, page, logger, shouldBookSite, handleBookedSite})
      .catch(e => console.warn(`Worker ${i} hit an error`, e));
    promises.push(webPromise);
  }
  const TIMER = 'Worker test';
  console.time(TIMER);
  await Promise.all(promises);
  console.timeEnd(TIMER);
  console.warn(bookedSites);
  await browser.close();
})();
