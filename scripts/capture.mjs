#!/usr/bin/env node
/**
 * Full-page screenshots (and, for the live Squarespace site, a block-layout JSON) of every
 * URL in migration/old-urls.txt, using the locally installed Google Chrome.
 *
 *   node scripts/capture.mjs live                 # https://www.sunnasaunas.com -> migration/capture/live
 *   node scripts/capture.mjs local [baseUrl]      # default http://localhost:8787 -> migration/capture/local
 *   node scripts/capture.mjs local --only /en/about,/en
 */
import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const [mode = 'live', maybeBase] = process.argv.slice(2).filter((a) => !a.startsWith('--') && !a.includes(','));
const base = mode === 'live' ? 'https://www.sunnasaunas.com' : (maybeBase ?? 'http://localhost:8787');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1].split(',') : null;
const out = new URL(`../migration/capture/${mode}/`, import.meta.url).pathname;
const paths = (only ?? (await readFile(new URL('../migration/old-urls.txt', import.meta.url), 'utf8')).split('\n').filter(Boolean))
  .filter((p) => !['/', '/portuguese'].includes(p) || only);
const extract = await readFile(new URL('./lib/extract-layout.js', import.meta.url), 'utf8');

const HIDE = `*{animation:none!important;transition:none!important}
[class*="preFade"],[class*="preSlide"],[class*="preScale"],[class*="preClip"],[class*="preFlex"]{opacity:1!important;transform:none!important;clip-path:none!important}
.sqs-cookie-banner-v2,[class*="cookie-banner"],#onetrust-banner-sdk{display:none!important}`;

const browser = await chromium.launch({ channel: 'chrome' });
for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile' });
  const page = await ctx.newPage();
  for (const path of paths) {
    const name = path === '/' ? 'index' : path.replace(/^\//, '');
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.addStyleTag({ content: HIDE });
    // Trigger lazy-loaded images.
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const file = `${out}${label}/${name}.png`;
    await mkdir(dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: true });
    if (mode === 'live') {
      const layout = await page.evaluate(extract);
      const lf = `${out}layout/${label}/${name}.json`;
      await mkdir(dirname(lf), { recursive: true });
      await writeFile(lf, JSON.stringify(layout, null, 1));
    }
    console.log(`${label} ${path}`);
  }
  await ctx.close();
}
await browser.close();
