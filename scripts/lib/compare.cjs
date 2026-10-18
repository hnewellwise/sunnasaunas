// Side-by-side live|local comparison strips: node scripts/lib/compare.cjs <name> <desktop|mobile> <outPrefix> [colWidth]
// Reads migration/capture/{live,local}/<view>/<name>.png, writes <outPrefix>-N.jpg chunks.
const sharp = require('sharp');
const [, , name, view = 'desktop', prefix, colW = view === 'desktop' ? 520 : 260] = process.argv;
(async () => {
  const cols = await Promise.all(['live', 'local'].map(async (src) => {
    const buf = await sharp(`migration/capture/${src}/${view}/${name}.png`).resize(+colW).png().toBuffer();
    return { buf, meta: await sharp(buf).metadata() };
  }));
  const H = Math.max(...cols.map((c) => c.meta.height));
  const W = +colW * 2 + 12;
  const img = sharp({ create: { width: W, height: H, channels: 3, background: '#ff00ff' } })
    .composite(cols.map((c, i) => ({ input: c.buf, left: i * (+colW + 12), top: 0 })));
  const full = await img.png().toBuffer();
  const chunk = view === 'desktop' ? 1100 : 1400;
  const n = Math.ceil(H / chunk);
  for (let i = 0; i < n; i++) {
    const top = i * chunk;
    await sharp(full).extract({ left: 0, top, width: W, height: Math.min(chunk, H - top) }).jpeg({ quality: 65 }).toFile(`${prefix}-${i}.jpg`);
  }
  console.log(`${name} ${view}: ${n} chunks`);
})();
