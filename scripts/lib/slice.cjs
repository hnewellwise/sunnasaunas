// Slice a tall full-page screenshot into chunks for review: node scripts/lib/slice.cjs <png> <outPrefix> [chunk=1800] [width=720]
const sharp = require('sharp');
const [, , file, prefix, chunk = 1800, width = 720] = process.argv;
(async () => {
  const m = await sharp(file).metadata();
  const n = Math.ceil(m.height / chunk);
  for (let i = 0; i < n; i++) {
    const top = i * chunk;
    await sharp(file).extract({ left: 0, top, width: m.width, height: Math.min(+chunk, m.height - top) }).resize(+width).jpeg({ quality: 70 }).toFile(`${prefix}-${i}.jpg`);
  }
  console.log(`${m.width}x${m.height} -> ${n}`);
})();
