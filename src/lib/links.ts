import type { Locale } from '../i18n/config';
import { pathFor, pageSlugs, type PageKey } from '../i18n/routes';

/**
 * Links in content files are written as `page:<PageKey>` (e.g. `page:contact`) or
 * `page:<PageKey>/<entry-slug>` so they localize automatically. Anything else
 * (https://, mailto:, #anchor) is passed through untouched.
 */
export function resolveHref(href: string, lang: Locale): string {
  if (!href.startsWith('page:')) return href;
  const [key, ...rest] = href.slice(5).split('/');
  if (!(key in pageSlugs)) throw new Error(`Unknown page key in link "${href}"`);
  const [entry, hash] = rest.join('/').split('#');
  return pathFor(key as PageKey, lang, entry || undefined) + (hash ? `#${hash}` : '');
}

/** Rewrite page: links inside rendered HTML strings (used for rich-text copy in frontmatter). */
export function localizeHtml(html: string, lang: Locale): string {
  return html.replace(/href="(page:[^"]+)"/g, (_, h) => `href="${resolveHref(h, lang)}"`);
}
