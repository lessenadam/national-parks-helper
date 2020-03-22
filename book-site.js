/* eslint-disable no-console */
// const reloads = 2;

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const TABLE_ROW_SELECTOR = '#availability-table tbody tr';
const BOOK_NOW_SELECTOR =
  '.rec-campground-availability-book-now button.sarsa-button-primary';
const ALREADY_BOOKED_BUTTON_SELECTOR =
  '.booking-modal button[aria-label="Continue Shopping"]';

const attemptBookSite = async ({
  id,
  logger,
  page,
  shouldBookSite,
  handleBookedSite,
}) => {
  // FIND AN AVAILABLE SITE
  let sites = await page.$$(TABLE_ROW_SELECTOR);
  // randomize the starting point
  const startIndex = Math.floor(Math.random() * sites.length);
  logger(`starting at site ${startIndex}`);
  let availableSite;
  for (
    let currentIndex = startIndex, i = 0;
    i < sites.length;
    i++, currentIndex === sites.length - 1 ? (currentIndex = 0) : currentIndex++
  ) {
    // CHECK IF SITE IS AVAILABLE
    const td1 = await (await (await sites[currentIndex].$(
      'td:nth-child(3)'
    )).getProperty('className')).jsonValue();
    const td2 = await (await (await sites[currentIndex].$(
      'td:nth-child(4)'
    )).getProperty('className')).jsonValue();
    const td3 = await (await (await sites[currentIndex].$(
      'td:nth-child(5)'
    )).getProperty('className')).jsonValue();
    const td4 = await (await (await sites[currentIndex].$(
      'td:nth-child(6)'
    )).getProperty('className')).jsonValue();
    const avail = [td1, td2, td3, td4].every(
      className => className === 'available'
    );
    if (avail) {
      logger(`found available at index ${currentIndex}`);
      availableSite = sites[currentIndex];
      // SCROLL HTML TO THE TOP
      await page.evaluate(() => {
        const html = document.querySelector('html');
        html.scrollHeight = 0;
      });

      await availableSite.screenshot({
        path: `screenshots/worker_${id}_avail-site.png`,
      });
      // SELECT THE SITE FOR 3 NIGHTS
      const start = await availableSite.$('td:nth-child(3)');
      const end = await availableSite.$('td:nth-child(6)');
      await start.click();
      await end.click();

      // NEED TO HANDLE ALREADY SELECTED SITE
      if (!shouldBookSite()) {
        logger('stopping - max sites booked');
        return {shouldReload: false};
      }
      await page.click(BOOK_NOW_SELECTOR);
      await timeout(5000);
      const url = page.url();
      console.warn('url', url);
      if (url.includes('orderdetails')) {
        handleBookedSite(currentIndex);
        await page.screenshot({path: `screenshots/worker_${id}_test.png`});
        logger('has finished');
        return {shouldReload: false};
      }
      const alreadyBookedButton = await page.$(ALREADY_BOOKED_BUTTON_SELECTOR);
      if (alreadyBookedButton) {
        await alreadyBookedButton.click();
      }
    }
    logger(`continuing to index ${currentIndex + 1}`);
  }

  // TAKE SOME ACTION IF NOT AVAILABLE
  console.warn('no site');
  return {shouldReload: true};
};

exports.attemptBookSite = attemptBookSite;
