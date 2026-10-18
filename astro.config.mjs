// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical host is www, matching the Squarespace site Google has indexed.
export const SITE = 'https://www.sunnasaunas.com';

export default defineConfig({
  site: SITE,
  // Squarespace URLs have no trailing slash. `format: 'file'` emits /en/about.html,
  // which Cloudflare serves at /en/about (html_handling: auto-trailing-slash).
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    // Only built locales are emitted, so unpublished drafts never reach the sitemap.
    // hreflang alternates are declared per page in <head> (translated slugs differ).
    sitemap(),
  ],
  image: {
    responsiveStyles: true,
  },
});
