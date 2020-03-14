/* eslint-disable no-console */
const {Cluster} = require('puppeteer-cluster');
const test = require('./docker-test');

const TIMER = 'Cluster test';

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
  });

  await cluster.task(test.checkParksSite2);
  console.time(TIMER);

  cluster.queue('https://www.recreation.gov/camping/campgrounds/232450');
  cluster.queue('https://www.recreation.gov/camping/campgrounds/232450');
  cluster.queue('https://www.recreation.gov/camping/campgrounds/232450');
  // many more pages

  await cluster.idle();
  await cluster.close();
  console.timeEnd(TIMER);
})();
