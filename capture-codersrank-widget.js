const puppeteer = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');

// CodersRank's summary widget loads language icons from
// icon-widget.codersrank.io, which currently serves broken images.
// Serve the displayed badge icons from checked-in SVGs when capturing the PNG.
// This only affects screenshot generation, not the live CodersRank API data.
const iconDir = path.join(__dirname, 'codersrank-icons');
const iconFiles = {
  java: 'java.svg',
  'c#': 'csharp.svg',
  csharp: 'csharp.svg',
  react: 'react.svg',
  reactjs: 'react.svg',
};
const iconContents = Object.fromEntries(
  Object.entries(iconFiles).map(([name, filename]) => [
    name,
    fs.readFileSync(path.join(iconDir, filename), 'utf8'),
  ]),
);

// Generic, local SVG for any future badge with a different language name.
function fallbackIcon(label) {
  const initials = label.replace(/[^a-z0-9+#]/gi, '').slice(0, 3).toUpperCase() || 'DEV';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#263447"/><text x="64" y="68" font-size="40" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle" dominant-baseline="middle" fill="#ffffff">${initials}</text></svg>`;
}

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
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 860, height: 800 });

    // Puppeteer can respond with SVG bytes even when the widget uses a closed
    // shadow root. No DOM mutation or external icon server is required.
    await page.setRequestInterception(true);
    let replacedIcons = 0;
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.hostname === 'icon-widget.codersrank.io' && url.pathname.startsWith('/api/')) {
        let language = '';
        try {
          language = decodeURIComponent(url.pathname.slice(5)).trim().toLowerCase();
        } catch (error) {
          console.warn('Could not decode badge language:', error.message);
        }
        const svg = iconContents[language] || fallbackIcon(language);
        replacedIcons += 1;
        request.respond({
          status: 200,
          contentType: 'image/svg+xml',
          headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
          body: svg,
        }).catch(error => console.error('Failed to serve CodersRank icon:', error));
      } else {
        request.continue().catch(error => console.error('Request continuation failed:', error));
      }
    });

    const workspace = process.env.WORKSPACE_PATH || __dirname;
    const filePath = `file://${path.join(workspace, 'codersrank-widget.html')}`;
    await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 60000 });

    const pageHeight = await page.evaluate(() => document.documentElement.offsetHeight);
    const clipHeight = Math.round(pageHeight);
    if (clipHeight <= 0) throw new Error('CodersRank widget did not render a visible page');

    await page.screenshot({
      path: 'codersrank-widget.png',
      clip: { x: 0, y: 0, width: 860, height: clipHeight },
    });
    console.log(`Screenshot captured; supplied ${replacedIcons} CodersRank language icons locally.`);
  } finally {
    await browser.close();
  }
})();
