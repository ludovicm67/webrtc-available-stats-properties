const browsers = require('./browsers');

const waitSeconds = async (seconds) => {
  await new Promise(r => setTimeout(r, seconds * 1000));
}

const url = 'https://webrtc-local-test.ludovicm67.fr/';

const runBrowser = async (browser) => {
  const instance = await browser.browser.launch(browser.options);
  const page = await instance.newPage({permissions: browser.permissions});
  await page.goto(url);
  await waitSeconds(5);
  const stats = await page.evaluate(() => JSON.stringify(getStatsProperties()));
  const version = instance.version();
  await instance.close();

  return {
    name: browser.name,
    version,
    stats,
  };
}

(async () => {
  const results = await Promise.all(browsers.map(browser => runBrowser(browser)));
  console.log(results);
})();
