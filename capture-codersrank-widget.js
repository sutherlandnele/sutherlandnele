const puppeteer = require('puppeteer');

(async () => {
  // GitHub-hosted Ubuntu runners restrict Chrome user namespaces.
  // Use the reduced-sandbox mode only in ephemeral GitHub Actions runners.
  // Do not pass GitHub write credentials into this browser job.
  const browser = await puppeteer.launch({
    headless: true,
    args: process.env.GITHUB_ACTIONS === 'true'
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : [],
  });
  const page = await browser.newPage();

  // Optionally set the viewport to the desired dimensions
  await page.setViewport({ width: 860, height: 800 });

  const filePath = `file://${process.env.WORKSPACE_PATH}/codersrank-widget.html`;
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 60000 }); // 60 seconds

  // Evaluate the full height of the page
  const pageHeight = await page.evaluate(() => document.documentElement.offsetHeight);

  // Capture only 37% of the page height
  const clipHeight = Math.round(pageHeight * 1);

  await page.screenshot({
    path: 'codersrank-widget.png',
    clip: {
      x: 0,
      y: 0,
      width: 860, // Match viewport width or adjust as necessary
      height: clipHeight
    }
  });

  await browser.close();
})();
