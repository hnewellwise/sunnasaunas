import type { ButtonData } from '../Button.astro';

/**
 * Section building blocks for marketing pages. Each page's content file lists its sections in
 * order (frontmatter `sections:`); src/components/sections/Sections.astro renders them.
 * Copy fields (`body`, `items[].body`) are Markdown; `heading` is inline Markdown where a
 * newline becomes a line break. Images are filenames in src/assets/images/.
 * Links use `page:<PageKey>` so they localize (see src/lib/links.ts).
 */
export type Theme = 'cream' | 'sage' | 'clay' | 'olive';
export type ImageShape = 'rounded' | 'oval' | 'square' | 'circle';

export type Img = { src: string; alt?: string };

type Base = { id?: string; theme?: Theme; pad?: 'sm' | 'md' | 'lg' };

export type HeroSection = Base & { type: 'hero'; image: Img; heading: string };

export type IntroSection = Base & { type: 'intro'; icon?: Img; heading: string; buttons?: ButtonData[] };

export type SplitSection = Base & {
  type: 'split';
  heading?: string;
  level?: 1 | 2 | 3 | 4;
  body?: string;
  /** Rendered as a separate column instead of an image (e.g. page intro: heading left, text right). */
  aside?: string;
  image?: Img;
  imageShape?: ImageShape;
  imageSide?: 'left' | 'right';
  imageSize?: 'sm' | 'md' | 'lg';
  /** Crop ratio (width / height) of the image block, as cropped on Squarespace. */
  imageAspect?: number;
  imageAspectMobile?: number;
  buttons?: ButtonData[];
  accordion?: { title: string; body: string }[];
  /** Small caption block under the image column (contact page). */
  imageNote?: string;
  /** Embed a form under the copy column. */
  form?: 'contact' | 'quote';
  /** Curved bottom edge (The Circle header). */
  curve?: boolean;
};

export type CollageSection = Base & { type: 'collage'; heading: string; images: Img[] };

export type CardsSection = Base & {
  type: 'cards';
  variant: 'round' | 'overlay';
  heading?: string;
  items: { title: string; body?: string; image: Img; link?: ButtonData }[];
  button?: ButtonData;
};

export type LatestPostsSection = Base & { type: 'latestPosts'; heading: string; body?: string; label: string };

export type BannerSection = Base & { type: 'banner'; image: Img };

export type CtaSection = Base & {
  type: 'cta';
  heading: string;
  body?: string;
  button: ButtonData;
  image?: Img;
  imageAspect?: number;
  imageAspectMobile?: number;
};

export type StackSection = Base & {
  type: 'stack';
  blocks: (
    | { body: string }
    | { divider: true }
    | { button: ButtonData }
    | { table: { head: string[]; rows: string[][] } }
  )[];
};

export type GallerySection = Base & { type: 'gallery'; images: Img[]; layout?: 'grid' | 'masonry' };

export type FormSection = Base & { type: 'form'; form: 'contact' | 'quote'; heading?: string; body?: string };

/** Renders a content collection listing at this position (blog list / portfolio grid). */
export type CollectionSection = Base & { type: 'collection'; collection: 'circle' | 'work' };

export type Section =
  | HeroSection
  | IntroSection
  | SplitSection
  | CollageSection
  | CardsSection
  | LatestPostsSection
  | BannerSection
  | CtaSection
  | StackSection
  | GallerySection
  | FormSection
  | CollectionSection;
