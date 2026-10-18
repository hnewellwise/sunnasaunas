import { localeMeta, type Locale } from '../i18n/config';

/** Squarespace showed long dates on the home card ("29 January 2026") and dd/mm/yyyy on the blog list. */
export function formatDate(date: Date, lang: Locale, style: 'long' | 'numeric' = 'long'): string {
  const locale = lang === 'en' ? 'en-GB' : localeMeta[lang].htmlLang;
  return style === 'long'
    ? date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}
