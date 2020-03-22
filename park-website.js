/* eslint-disable no-console */
// const reloads = 2;

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const TABLE_ROW_SELECTOR = '#availability-table tbody tr';

const USERNAME = 'lessena@gmail.com';
const PASS = '3zD!MqC3R3';
const USERNAME_SELECTOR = '#rec-acct-sign-in-email-address';
const PASS_SELECTOR = '#rec-acct-sign-in-password';
const LOGIN_SELECTOR = 'form button';
const TO_LOGIN_SELECTOR = '.nav-header-button[aria-label="Log In"]';
const DATE_PICKER_SELECTOR = '#single-date-picker-1';
const BOOK_NOW_SELECTOR =
  '.rec-campground-availability-book-now button.sarsa-button-primary';
const TARGET_DATE = '08/01/2020';
const ALREADY_BOOKED_BUTTON_SELECTOR =
  '.booking-modal button[aria-label="Continue Shopping"]';

const randomWait = async () => {
  const wait = Math.random() * 45 * 1000;
  await timeout(wait);
};

const LOWER_PINES = 'https://www.recreation.gov/camping/campgrounds/232450';
const TEST_CAMPGROUND =
  'https://www.recreation.gov/camping/campgrounds/234633/availability';

const checkParksSite = async ({id, page}) => {
  const logger = status => console.warn(`Worker ${id} ${status}`);
  logger('is starting');
  await page.goto(TEST_CAMPGROUND);

  // START LOGIN
  logger('is logging in');
  await page.click(TO_LOGIN_SELECTOR);
  await page.type(USERNAME_SELECTOR, USERNAME);
  await page.type(PASS_SELECTOR, PASS);
  await page.click(LOGIN_SELECTOR);

  // TODO: BETTER WAY TO validate login was successful? Should see name in top right...
  // await page.waitForFunction(
  //   selector => document.querySelector(selector),
  //   {},
  //   DATE_PICKER_SELECTOR
  // );
  await timeout(4000);
  // FINISH LOGIN

  // FILL IN THE TARGET START DATE
  const datePicker = await page.$(DATE_PICKER_SELECTOR);
  await datePicker.click({clickCount: 3});
  await datePicker.type(TARGET_DATE, {delay: 30});

  // WAIT FOR TABLE TO REFRESH
  await page.waitForFunction(
    selector =>
      document.querySelectorAll(selector) &&
      document.querySelectorAll(selector).length > 10,
    {},
    TABLE_ROW_SELECTOR
  );

  // FIND AN AVAILABLE SITE
  let sites = await page.$$(TABLE_ROW_SELECTOR);
  let availableSite;
  for (let i = 0; i < sites.length; i++) {
    // CHECK IF SITE IS AVAILABLE
    const td1 = await (await (await sites[i].$('td:nth-child(3)')).getProperty(
      'className'
    )).jsonValue();
    const td2 = await (await (await sites[i].$('td:nth-child(4)')).getProperty(
      'className'
    )).jsonValue();
    const td3 = await (await (await sites[i].$('td:nth-child(5)')).getProperty(
      'className'
    )).jsonValue();
    const td4 = await (await (await sites[i].$('td:nth-child(6)')).getProperty(
      'className'
    )).jsonValue();
    const avail = [td1, td2, td3, td4].every(
      className => className === 'available'
    );
    if (avail) {
      logger(`found available at index ${i}`);
      availableSite = sites[i];
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
      await page.click(BOOK_NOW_SELECTOR);
      await timeout(5000);
      const url = page.url();
      console.warn('url', url);
      if (url.includes('orderdetails')) {
        await page.screenshot({path: `screenshots/worker_${id}_test.png`});
        logger('has finished');
        return;
      }
      const alreadyBookedButton = await page.$(ALREADY_BOOKED_BUTTON_SELECTOR);
      if (alreadyBookedButton) {
        await alreadyBookedButton.click();
      }
    }
    logger(`continuing to index ${i + 1}`);
  }

  // TAKE SOME ACTION IF NOT AVAILABLE
  console.warn('no site');
  await page.screenshot({path: `screenshots/worker_${id}_test.png`});
};

exports.checkParksSite = checkParksSite;
