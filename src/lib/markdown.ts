import { marked } from 'marked';
import type { Locale } from '../i18n/config';
import { localizeHtml } from './links';

/** Render a markdown copy field from frontmatter, localizing `page:` links. */
export function md(text: string | undefined, lang: Locale): string {
  if (!text) return '';
  return localizeHtml(marked.parse(text, { async: false, breaks: true }) as string, lang);
}

/** Inline markdown (no wrapping <p>), for headings. Newlines become <br>. */
export function mdInline(text: string | undefined, lang: Locale): string {
  if (!text) return '';
  return localizeHtml(marked.parseInline(text.trim().replace(/\n/g, '<br>'), { async: false }) as string, lang);
}
