import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content files live at src/content/<collection>/<lang>/<slug>.md.
 * The entry id is "<lang>/<slug>"; the URL slug is the filename (or `slug` frontmatter).
 * `translationKey` links the same piece across languages (use the English slug).
 */
const translationStatus = z.enum(['source', 'machine-draft', 'reviewed']);

const shared = ({ image }: SchemaContext) => ({
  title: z.string(),
  description: z.string(),
  translationKey: z.string(),
  translationStatus: translationStatus.default('source'),
  slug: z.string().optional(),
  seoTitle: z.string().optional(),
  ogImage: image().optional(),
});

const circle = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/circle' }),
  schema: ({ image }) =>
    z.object({
      ...shared({ image }),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Sunna'),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      ...shared({ image }),
      date: z.coerce.date(),
      location: z.string().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string().default('') })).default([]),
    }),
});

/**
 * Copy for the static marketing pages. One file per page key per locale
 * (src/content/pages/<lang>/<pageKey>.md). Section copy goes in `sections` as free-form
 * YAML so each view can shape its own data; the markdown body is optional long-form copy.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      ...shared({ image }),
      sections: z.record(z.string(), z.any()).default({}),
    }),
});

export const collections = { circle, work, pages };
