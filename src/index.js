const { chromium, firefox } = require('playwright');

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

  const browsers = [
    {
      name: 'chromium',
      browser: chromium,
      options: {
        headless: true,
        args: [
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream'
        ],
      },
      permissions: ['camera', 'microphone'],
    },
    {
      name: 'firefox',
      browser: firefox,
      options: {
        headless: true,
        firefoxUserPrefs: {
          'media.navigator.streams.fake': true,
          'media.navigator.permission.disabled': true,
        }
      },
      permissions: [],
    },
  ];

  const results = await Promise.all(browsers.map(browser => runBrowser(browser)));
  console.log(results);
})();
