/* eslint-disable no-console */
const reloads = 2;

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const randomWait = async () => {
  const wait = Math.random() * 30 * 1000;
  await timeout(wait);
}

const checkParksSite = async ({id, page}) => {
  await randomWait();
  console.warn(`Worker ${id} is starting`);
  await page.goto('https://www.recreation.gov/camping/campgrounds/232450');
  await randomWait();

  for (let index = 0; index < reloads; index++) {
    console.log(`Worker ${id} reloading the page`, index + 1);
    await page.reload();
    await randomWait();
  }

  await page.screenshot({path: `screenshots/worker_${id}_test.png`});

  console.warn('Worker has finished', id);
};

exports.checkParksSite = checkParksSite;
