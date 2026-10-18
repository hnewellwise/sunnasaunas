import type { ImageMetadata } from 'astro';

/**
 * Original site images live in src/assets/images/ (copied unmodified from the Squarespace
 * snapshot, see migration/image-map.json). Content files reference them by filename.
 * The glob is lazy so only images a page actually uses end up in the build.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.{jpg,jpeg,png,webp,gif}');

export async function loadImage(name: string): Promise<ImageMetadata> {
  const loader = files[`/src/assets/images/${name}`];
  if (!loader) throw new Error(`Unknown image "${name}" (expected in src/assets/images/)`);
  return (await loader()).default;
}
