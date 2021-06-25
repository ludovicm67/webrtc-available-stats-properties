# WebRTC Available Stats Properties

List all available properties per browser for `getStats()`.

## Add a new browser

1. Go to https://webrtc-local-test.ludovicm67.fr/
2. Open console, and execute `copy(JSON.stringify(getStatsProperties()))` (or you can use BrowserStack to get the value of `JSON.stringify(getStatsProperties())`)
3. In the `index.html` file, add the content in the `data` object with a new key
4. You can add more details about the device using the `devices` object
