const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    'https://www.recreation.gov/camping/lower-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70928'
  );
  // await page.screenshot({ path: 'landing-page.png' });
  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    }),
    page.click('#btn_book_now_id')
  ]);
  // await page.screenshot({ path: 'book-now-page.png' });
  await page.click('#mobiShowSearchForm');
  // await page.screenshot({ path: 'avanced-filter-page.png' });

  const arrivalHandle = await page.$('input#arrivalDate');
  await page.evaluate(arrival => {
    arrival.value = 'Thu Jun 21 2018';
    arrival.dispatchEvent(new Event('change'));
  }, arrivalHandle);
  // await arrivalHandle.screenshot({ path: 'arrival-filled.png' });
  // id = id1529564400000
  const departHandle = await page.$('input#departureDate');
  await page.evaluate(depart => {
    console.log('this doesnt work');
    depart.value = 'Thu Jun 24 2018';
    depart.dispatchEvent(new Event('change'));
  }, departHandle);
  // id = id1529823600000
  // await departHandle.screenshot({ path: 'depart-filled.png' });

  // page.on('request', request => {
  //   if (request.url().indexOf('www.recreation.gov/campsiteSearch.do') > 0) {
  //     console.log('Method:', request.method());
  //     console.log('URL:', request.url());
  //     console.log('Post data:', request.postData());
  //     console.log('Headers:', request.headers());
  //   }
  // });
  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    }),
    page.click('#filter')
  ]);
  // await page.screenshot({ path: 'form-submitted.png' });

  //
  // Failure case = class with alternativeSuggestion or msg warning "No suitable availability shown"
  //
  //
  // Success case = class siteDetAv, "available" as opposed to "not available"
  //
  console.log('GET MY RESULTS!');
  const sites = await page.$$eval('.siteDetAv', res => res);
  const availableSites = sites.filter(
    siteEl => siteEl.textContent === 'available'
  );

  console.log('number sites:', sites.length);
  if (availableSites.length === 0) {
    console.log('no sites available :(');
  } else {
    console.log(`${availableSites.length} sites available!! :)))`);
  }

  await browser.close();
  console.log('browser closed successfully');
}

run().catch(err => console.log('Error:', err));
