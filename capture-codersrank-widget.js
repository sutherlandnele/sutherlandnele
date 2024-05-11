const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = `file://${process.env.WORKSPACE_PATH}/codersrank-widget.html`;
  console.log(filePath);
  await page.goto(filePath, {waitUntil: 'networkidle0', timeout: 60000}); // 60 seconds
  await page.screenshot({path: 'codersrank-widget.png'});
  await browser.close();
})();
