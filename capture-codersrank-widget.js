const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const filePath = `file://${process.env.WORKSPACE_PATH}/codersrank-widget.html`;
  await page.goto(filePath, {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'codersrank-widget.png'});
  await browser.close();
})();
