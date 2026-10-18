#!/usr/bin/env node
/**
 * Verify every URL from the Squarespace sitemap (migration/old-urls.txt) resolves on the
 * new site: either 200 directly, or permanent redirect(s) ending in 200.
 *
 *   npm run check:redirects                         # against `wrangler dev` (localhost:8787)
 *   npm run check:redirects -- https://sunnasaunas.<account>.workers.dev
 *   npm run check:redirects -- https://www.sunnasaunas.com   # after cutover
 */
import { readFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'http://localhost:8787').replace(/\/$/, '');
const paths = (await readFile(new URL('../migration/old-urls.txt', import.meta.url), 'utf8'))
  .split('\n')
  .filter(Boolean);

let failures = 0;
for (const path of paths) {
  let url = base + path;
  const hops = [];
  let status;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { redirect: 'manual' });
    status = res.status;
    if (status < 300 || status >= 400) break;
    hops.push(status);
    url = new URL(res.headers.get('location'), url).href;
  }
  const temporary = hops.some((s) => s !== 301 && s !== 308);
  // /portuguese is intentionally 302 until the PT site is published.
  const ok = status === 200 && (!temporary || path === '/portuguese');
  if (!ok) failures++;
  const chain = hops.length ? `${hops.join(' → ')} → ` : '';
  console.log(`${ok ? '✓' : '✗'} ${path}  ${chain}${status}  ${hops.length ? url.replace(base, '') : ''}`);
}

console.log(`\n${paths.length - failures}/${paths.length} OK`);
process.exit(failures ? 1 : 0);
