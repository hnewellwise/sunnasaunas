#!/usr/bin/env node
/**
 * Snapshot the live Squarespace site into migration/snapshot/ so the rebuild has a
 * frozen reference even after Squarespace is cancelled.
 *
 *   html/<path>.html   rendered page
 *   json/<path>.json   Squarespace ?format=json payload (structured content, blog bodies)
 *   images/<uuid>/<f>  original-resolution images from images.squarespace-cdn.com
 *   pages.json         title / description / canonical / og:image per URL
 *   images.json        CDN URL -> local path manifest
 *
 * Re-runnable: existing files are skipped. Usage: npm run scrape [-- --force]
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://www.sunnasaunas.com';
const OUT = new URL('../migration/snapshot/', import.meta.url).pathname;
const FORCE = process.argv.includes('--force');
// Squarespace URLs not in the sitemap that still resolve and should be covered.
const EXTRA_PATHS = ['/', '/portuguese'];

const exists = (p) => access(p).then(() => true, () => false);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&mdash;/g, '—');

async function get(url, as = 'text') {
  for (let attempt = 1; attempt <= 3; attempt++) {
    // Without an explicit Accept the CDN transcodes images to WebP; ask for the original format.
    const accept = as === 'buffer' ? 'image/jpeg,image/png,image/gif,image/x-icon,image/*;q=0.5' : '*/*';
    const res = await fetch(url, { headers: { 'user-agent': 'sunna-migration-snapshot/1.0', accept } });
    if (res.ok) return as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text();
    if (res.status === 404) return null;
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  throw new Error(`GET ${url} failed`);
}

async function save(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

async function pool(items, size, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

const fileFor = (path, ext) => join(OUT, ext, (path === '/' ? '/index' : path) + '.' + ext);

const meta = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]) : null;
};

const sitemap = await get(`${ORIGIN}/sitemap.xml`);
const paths = [...new Set([
  ...EXTRA_PATHS,
  ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
])];
await save(new URL('../migration/old-urls.txt', import.meta.url).pathname, paths.join('\n') + '\n');
console.log(`${paths.length} URLs`);

const pages = {};
const imageUrls = new Set();
const CDN = /https?:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^\s"'<>)\\?&]+/g;

await pool(paths, 4, async (path) => {
  const htmlFile = fileFor(path, 'html');
  const jsonFile = fileFor(path, 'json');
  const html = !FORCE && (await exists(htmlFile)) ? await readFile(htmlFile, 'utf8') : await get(ORIGIN + path);
  if (!html) return console.warn(`404 ${path}`);
  await save(htmlFile, html);

  let json = !FORCE && (await exists(jsonFile)) ? await readFile(jsonFile, 'utf8') : await get(`${ORIGIN}${path}?format=json-pretty`);
  if (json) await save(jsonFile, json);

  pages[path] = {
    title: meta(html, /<title>([^<]*)<\/title>/),
    description: meta(html, /<meta name="description" content="([^"]*)"/),
    canonical: meta(html, /<link rel="canonical" href="([^"]*)"/),
    ogImage: meta(html, /<meta property="og:image" content="([^"]*)"/),
  };
  for (const src of [html, json ?? '']) for (const m of src.matchAll(CDN)) imageUrls.add(m[0]);
  console.log(`ok ${path}`);
});

await save(join(OUT, 'pages.json'), JSON.stringify(Object.fromEntries(Object.entries(pages).sort()), null, 2));

const manifest = {};
await pool([...imageUrls], 6, async (url) => {
  const [, , , , , , uuid, ...rest] = url.split('/');
  const name = decodeURIComponent(rest.join('_') || 'image').replace(/[^\w.\-]+/g, '_');
  const local = join('images', uuid, name);
  manifest[url] = local;
  const dest = join(OUT, local);
  if (!FORCE && (await exists(dest))) return;
  const buf = await get(`${url}?format=original`, 'buffer');
  if (buf) await save(dest, buf);
});
await save(join(OUT, 'images.json'), JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2));
console.log(`${Object.keys(manifest).length} images`);
