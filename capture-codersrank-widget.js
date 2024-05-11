const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Optionally set the viewport to the desired dimensions
  await page.setViewport({ width: 1280, height: 800 });

  const filePath = `file://${process.env.WORKSPACE_PATH}/codersrank-widget.html`;
  console.log(filePath);
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 60000 }); // 60 seconds

  // Evaluate the full height of the page
  const pageHeight = await page.evaluate(() => document.documentElement.offsetHeight);

  // Capture only 37% of the page height
  const clipHeight = Math.round(pageHeight * 0.37);

  await page.screenshot({
    path: 'codersrank-widget.png',
    clip: {
      x: 0,
      y: 0,
      width: 1280, // Match viewport width or adjust as necessary
      height: clipHeight
    }
  });

  await browser.close();
})();
