import { readFile, writeFile, mkdir } from "fs/promises";
import { browsers } from "./browsers.js";

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

const copyFiles = async (filesToCopy, destination) => {
  for (const filename of filesToCopy) {
    const content = await readFile(filename);
    await writeFile(`${destination}/${filename}`, content);
  }
};

const main = async () => {
  const results = await Promise.all(
    browsers.map((browser) => runBrowser(browser))
  );

  // Create devices list
  const devices = {};
  const data = {};
  results.forEach((r) => {
    const key = deviceKeyFromResult(r);
    devices[`${key}`] = deviceFromResult(r);
    data[`${key}`] = JSON.parse(r.stats);
  });

  // Create directory where generated files will be created
  await mkdir(generatedDirectory, { recursive: true });

  // Copy static files
  await copyFiles(["index.html", "style.css"], generatedDirectory);

  // Create file for devices
  await writeFile(`${generatedDirectory}/data/devices.js`, `const devices = ${JSON.stringify(devices)};`);

  // Create file for data
  await writeFile(`${generatedDirectory}/data/data.js`, `const data = ${JSON.stringify(data)};`);

  // Update the index.html file to include the updated date

  /// Read the file content
  const indexPath = `${generatedDirectory}/index.html`;
  let content = await readFile(indexPath, 'utf8');

  /// Get current date and time in UTC
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months start at 0
  const year = now.getUTCFullYear();
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');

  /// Format the date as day/month/year hour:minute
  const formattedDate = ` - Last update: ${day}/${month}/${year} ${hours}:${minutes} (UTC)`;

  /// Replace the placeholder with the current date and time
  content = content.replace('<!-- LAST_UPDATE -->', formattedDate);

  /// Write the updated content back to the file
  await writeFile(indexPath, content);

  // Print results in the console
  console.log(results);
};

await main();
