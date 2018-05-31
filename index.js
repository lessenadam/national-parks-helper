const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const moment = require('moment');
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: 'parksbookinghelper@yahoo.com',
    pass: 'J2j@8tYMYl'
  }
});

// laura@kassovic.com
const mailOptions = {
  from: 'parksbookinghelper@yahoo.com',
  to: 'lessena@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

//
// lower, upper https://www.recreation.gov/camping/upper-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70925, north https://www.recreation.gov/camping/north-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70927
//

const campgrounds = {
  lower: {
    url: 'https://www.recreation.gov/camping/lower-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70928',
    name: 'Lower Pines',
  },
  upper: {
    url: 'https://www.recreation.gov/camping/upper-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70925',
    name: 'Upper Pines',
  },
  north: {
    url: 'https://www.recreation.gov/camping/north-pines/r/campgroundDetails.do?contractCode=NRSO&parkId=70927',
    name: 'North Pines',
  },
  test: {
    url: 'https://www.recreation.gov/camping/sycamore-grove-red-bluff-campground/r/campgroundDetails.do?contractCode=NRSO&parkId=75545',
    name: 'mendo',
  }
}

async function run({url, name} = {}) {
  console.log('doing your camp site bidding...')
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

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
  const countAvailableSites = await page.evaluate(() => {
    const siteNodes = document.querySelectorAll('.siteDetAv');
    const sites = Array.from(siteNodes);
    const availableSites = sites.filter((siteEl) => siteEl.innerHTML === 'available');
    return availableSites.length;
  });

  await browser.close();
  console.log('browser closed successfully');
  return {
    name,
    url,
    countAvailableSites,
  };
}

Promise.all([
  run(campgrounds.lower),
  run(campgrounds.upper),
  run(campgrounds.north),
  run(campgrounds.test)
]).then((results) => {
    const timeText = `Date/time checked: ${moment().format('MMMM Do YYYY, h:mm:ss a')}\n`;
    let subject, text;

  const [lowerResults, upperResults, northResults] = results;
  if (lowerResults.countAvailableSites === 0 && upperResults.countAvailableSites === 0 && northResults.countAvailableSites === 0) {
    // no sites availabel anywhere
    subject = 'No sites available :('
    text = `No sites available at ${lowerResults.name}, ${upperResults.name}, ${northResults.name}.`
  } else {
    // SITES AVAILABLE
    subject = 'YOSEMITE CAMPSITES AVAILABLE!!!';
    // map the results into lines of text
    const textElements = results.map((result) => {
      // if results count availabel sites > 0
      if (result.countAvailableSites > 0) {
        return `${result.name} has ${result.countAvailableSites} sites available!! :)))\nclick on this ${result.url} now to book!`;
      } else {
        return `${result.name} doesn't have any sites available :(`
      }
    });
    text = textElements.join('\n');
  }
  mailOptions.text = `${timeText}\n${text}`;
  mailOptions.subject = subject;
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}).catch(err => console.log('Error:', err));
