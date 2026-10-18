/**
 * Focal points set on Squarespace (data-image-focal-point), applied as object-position so
 * cropped images frame the same subject. Images not listed are centred.
 */
const focal: Record<string, string> = {
  '20251002-121855.jpg': '21.8% 64%',
  '20251005-193412.jpg': '62.6% 62.4%',
  '20251108-132436.jpg': '49.5% 67.2%',
  '2560-1707-max.jpg': '60.1% 53.6%',
  'harvia-m3.jpg': '51.1% 75.2%',
  'img-3025.jpeg': '50% 34.4%',
  'img-3096.jpeg': '48.8% 27.2%',
  'unsplash-image-heasjbblc0m.jpg': '50.3% 66.4%',
};

export const focalFor = (name: string) => focal[name.split('/').pop() ?? name];
