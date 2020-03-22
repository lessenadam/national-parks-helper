/* eslint-disable no-console */
const attempts = 3;
const {attemptBookSite} = require('./book-site');

// const TARGET_DATE = '03/23/2020';
const TARGET_DATE = '08/01/2020';
const LOWER_PINES = 'https://www.recreation.gov/camping/campgrounds/232450';
const TEST_CAMPGROUND =
  'https://www.recreation.gov/camping/campgrounds/234633/availability';


const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const TABLE_ROW_SELECTOR = '#availability-table tbody tr';
const USERNAME = 'lessena@gmail.com';
const PASS = '3zD!MqC3R3';
const USERNAME_SELECTOR = '#rec-acct-sign-in-email-address';
const PASS_SELECTOR = '#rec-acct-sign-in-password';
const LOGIN_SELECTOR = 'form button';
const TO_LOGIN_SELECTOR = '.nav-header-button[aria-label="Log In"]';
const DATE_PICKER_SELECTOR = '#single-date-picker-1';

const randomWait = async () => {
  const wait = Math.random() * 45 * 1000;
  await timeout(wait);
};

const checkParksSite = async ({
  id,
  logger,
  page,
  shouldBookSite,
  handleBookedSite,
}) => {
  await randomWait();
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

  for (let i = 0; i < attempts; i++) {
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

    const {shouldReload} = await attemptBookSite({
      id,
      logger,
      page,
      shouldBookSite,
      handleBookedSite,
    });
    if (!shouldReload) {
      return;
    }
    // TAKE SOME ACTION IF NOT AVAILABLE
    logger(`no sites. attempt ${i}`);
    await page.reload();
  }

  logger('out of reloads');
};

exports.checkParksSite = checkParksSite;
