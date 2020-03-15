/* eslint-disable no-console */
// const reloads = 2;

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const TABLE_ROW_SELECTOR = '#availability-table tbody tr';

// const randomWait = async () => {
//   const wait = Math.random() * 30 * 1000;
//   await timeout(wait);
// };

const LOWER_PINES = 'https://www.recreation.gov/camping/campgrounds/232450';
const TEST_CAMPGROUND =
  'https://www.recreation.gov/camping/campgrounds/234633/availability';

const checkParksSite = async ({id, page}) => {
  console.warn(`Worker ${id} is starting`);
  await page.goto(TEST_CAMPGROUND);

  const datePicker = await page.$('#single-date-picker-1');
  await datePicker.click({clickCount: 3});
  await datePicker.type('07/24/2020', {delay: 30});

  // need to wait
  await page.waitForFunction(
    selector =>
      document.querySelectorAll(selector) &&
      document.querySelectorAll(selector).length > 10,
    {},
    TABLE_ROW_SELECTOR
  );
  // await timeout(4000);

  const sites = await page.$$(TABLE_ROW_SELECTOR);

  const availableSite = sites.find(async row => {
    const avail = await row.evaluate(node => {
      const td1 = node.querySelector('td:nth-child(3)');
      const td2 = node.querySelector('td:nth-child(4)');
      const td3 = node.querySelector('td:nth-child(5)');
      const td4 = node.querySelector('td:nth-child(6)');
      return [td1, td2, td3, td4].every(cell =>
        cell.classList.contains('available')
      );
    });
    return avail;
  });

  if (!availableSite) {
    console.warn('no site');
    await page.screenshot({path: `screenshots/worker_${id}_test.png`});
    return;
  }

  const start = await page.$('td:nth-child(3)');
  const end = await page.$('td:nth-child(6)');
  await start.click();
  await end.click();

  await page.screenshot({path: `screenshots/worker_${id}_test.png`});

  console.warn('Worker has finished', id);
};

exports.checkParksSite = checkParksSite;
