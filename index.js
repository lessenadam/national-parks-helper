const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const lowerPinesUrl =
    'https://www.recreation.gov/camping/lower-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70928';

  await page.goto(lowerPinesUrl);

  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    }),
    page.click('#btn_book_now_id')
  ]);

  await page.click('#mobiShowSearchForm');
  //
  // Fill in the arrival and departure dates
  //
  const arrivalHandle = await page.$('input#arrivalDate');
  await page.evaluate(arrival => {
    arrival.value = 'Thu Jun 21 2018';
    arrival.dispatchEvent(new Event('change'));
  }, arrivalHandle);

  const departHandle = await page.$('input#departureDate');
  await page.evaluate(depart => {
    depart.value = 'Thu Jun 24 2018';
    depart.dispatchEvent(new Event('change'));
  }, departHandle);

  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    }),
    page.click('#filter')
  ]);

  //
  // when getting the availability results, there is a message attached to
  // each site with class "siteDetAv", which will have the text "available" if open
  // for the given date range
  //
  const sites = await page.$$eval('.siteDetAv', res => res);
  const availableSites = sites.filter(
    siteEl => siteEl.textContent === 'available'
  );

  console.log('RESULTS:');
  console.log('number sites on page:', sites.length);
  if (availableSites.length === 0) {
    console.log('no sites available :(');
  } else {
    console.log(`${availableSites.length} sites available!! :)))`);
  }

  await browser.close();
  console.log('browser closed successfully');
}

run().catch(err => console.log('Error:', err));
