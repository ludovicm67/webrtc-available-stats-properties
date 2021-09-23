const { chromium, firefox } = require("playwright");

const browsers = [
  {
    name: "Chromium",
    browser: chromium,
    options: {
      headless: true,
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
    permissions: ["camera", "microphone"],
  },
  {
    name: "Firefox",
    browser: firefox,
    options: {
      headless: true,
      firefoxUserPrefs: {
        "media.navigator.streams.fake": true,
        "media.navigator.permission.disabled": true,
      },
    },
    permissions: [],
  },
];

module.exports = browsers;
