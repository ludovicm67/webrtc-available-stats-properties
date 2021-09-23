const fs = require("fs");
const browsers = require("./browsers");

const waitSeconds = async (seconds) => {
  await new Promise((r) => setTimeout(r, seconds * 1000));
};

const url = "https://webrtc-local-test.ludovicm67.fr/";
const generatedDirectory = "./public";

const runBrowser = async (browser) => {
  const instance = await browser.browser.launch(browser.options);
  const page = await instance.newPage({ permissions: browser.permissions });
  await page.goto(url);
  await waitSeconds(3);
  const stats = await page.evaluate(() => JSON.stringify(getStatsProperties()));
  const version = instance.version();
  await instance.close();

  return {
    name: browser.name,
    version,
    stats,
  };
};

const deviceKeyFromResult = (r) => {
  return `${r.name}${r.version}`
    .toLocaleLowerCase()
    .replace(/ /g, "")
    .replace(/\./g, "");
};

const deviceFromResult = (r) => {
  return {
    browser: {
      name: r.name,
      version: r.version,
    },
  };
};

(async () => {
  const results = await Promise.all(
    browsers.map((browser) => runBrowser(browser))
  );

  // create devices list
  const devices = {};
  const data = {};
  results.forEach((r) => {
    const key = deviceKeyFromResult(r);
    devices[`${key}`] = deviceFromResult(r);
    data[`${key}`] = JSON.parse(r.stats);
  });

  // create generated files
  if (!fs.existsSync(`${generatedDirectory}/data`)) {
    fs.mkdirSync(`${generatedDirectory}/data`, { recursive: true });
  }
  fs.createReadStream("index.html").pipe(
    fs.createWriteStream(`${generatedDirectory}/index.html`)
  );
  const devicesStream = fs.createWriteStream(
    `${generatedDirectory}/data/devices.js`
  );
  const dataStream = fs.createWriteStream(`${generatedDirectory}/data/data.js`);
  devicesStream.write(`const devices = ${JSON.stringify(devices)};`);
  dataStream.write(`const data = ${JSON.stringify(data)};`);
  devicesStream.end();
  dataStream.end();

  // print results in the console
  console.log(results);
})();
