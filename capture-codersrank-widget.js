const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://${{ github.workspace }}/codersrank-widget.html', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'codersrank-widget.png'});
  await browser.close();
})();
