/* eslint-disable */

const puppeteer = require('puppeteer');
const ProgressBar = require('progress');

const RUNS = 20;

const getNewPage = async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://jakearchibald.github.io/service-worker-benchmark/', {
    timeout: 60000,
    waitUntil: 'load',
  });
  return page;
};

const initializeServiceWorker = async (page) => {
  await page.click('body > div.controls > button:nth-child(6)');
  while (true) {
    await page.waitFor(2000);
    if ('cached-fetch.js active' === await page.$eval('.sw-status', el => el.innerText)) {
      break;
    }
  }
  return page;
};

const experiment = async () => {
  const environments = [
    {
      enableServiceWorker: true,
    },
    {
      enableServiceWorker: false,
    },
  ];
  while (environments.length) {
    const {
      enableServiceWorker,
    } = environments.shift();
    // { headless: false } is needed for window.chrome.loadTimes()
    const browser = await puppeteer.launch({ headless: false });
    const firstPage = await getNewPage(browser);
    if (enableServiceWorker) {
      await initializeServiceWorker(firstPage);
    }
    firstPage.close();
    const bar = new ProgressBar(`Testing (${
      enableServiceWorker ? 'w/ service worker' : 'w/o service worker'
    }): [:bar]`, { total: RUNS });
  
    const tests = Array(RUNS).fill(true);
    const results = [];
    while (tests.shift()) {
      const page = await getNewPage(browser);
      results.push(await page.evaluate(() => {
        const { loadEventEnd, navigationStart } = window.performance.timing;
        // Credit: https://developers.google.com/web/showcase/2016/service-worker-perf#capturing_time_to_first_paint
        const navStart = window.performance.timing.navigationStart;
        const fpTime = window.chrome.loadTimes().firstPaintTime * 1000;
        return {
          firstPaint: fpTime - navStart,
          pageLoad: loadEventEnd - navigationStart,
        };
      }));
      await page.close();
      bar.tick();
    }
    ['pageLoad', 'firstPaint'].forEach((key) => {
      const values = results.map(r => r[key]);
      console.log(`[${key}] Min: ${Math.min.apply(null, values)}ms. Max: ${Math.max.apply(null, values)}ms. Average: ${
        values.reduce((prev, curr) => prev + curr, 0) / values.length
      }ms`);
    })
    await browser.close();
  }

};

experiment().catch(console.error);
