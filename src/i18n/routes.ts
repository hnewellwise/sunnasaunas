import { builtLocales, type Locale } from './config';

/**
 * Single source of truth for localized URLs. Every page key maps to its slug per locale.
 * English slugs MUST stay identical to the Squarespace URLs (/en/<slug>) so nothing
 * indexed changes. Translated slugs are free to change until that locale is published;
 * after that, any change needs a 301 in public/_redirects.
 */
export const pageSlugs = {
  home: { en: '', pt: '', fr: '', es: '' },
  about: { en: 'about', pt: 'sobre', fr: 'a-propos', es: 'sobre-nosotros' },
  forEvents: { en: 'for-events', pt: 'para-eventos', fr: 'pour-evenements', es: 'para-eventos' },
  iceBath: { en: 'ice-bath', pt: 'banho-de-gelo', fr: 'bain-de-glace', es: 'bano-de-hielo' },
  saunasForSale: { en: 'saunas-for-sale', pt: 'saunas-a-venda', fr: 'saunas-a-vendre', es: 'saunas-en-venta' },
  contact: { en: 'contact', pt: 'contacto', fr: 'contact', es: 'contacto' },
  privacy: {
    en: 'privacy-policy',
    pt: 'politica-de-privacidade',
    fr: 'politique-de-confidentialite',
    es: 'politica-de-privacidad',
  },
  // Collection index pages; entries live at <collection slug>/<entry slug>.
  circle: { en: 'the-circle', pt: 'the-circle', fr: 'the-circle', es: 'the-circle' },
  work: { en: 'our-work', pt: 'o-nosso-trabalho', fr: 'nos-realisations', es: 'nuestro-trabajo' },
} satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof pageSlugs;

export function pathFor(key: PageKey, lang: Locale, entrySlug?: string): string {
  const parts = [lang, pageSlugs[key][lang], entrySlug].filter(Boolean);
  return '/' + parts.join('/');
}

export type Alternate = { lang: Locale; href: string };

/**
 * Alternates for hreflang + the language switcher: built locales that actually have
 * this page. Pass `entrySlugs` for collection entries (only locales with a translation).
 */
export function alternatesFor(
  key: PageKey,
  opts: { available?: Locale[]; entrySlugs?: Partial<Record<Locale, string>> } = {},
): Alternate[] {
  const { available, entrySlugs } = opts;
  return builtLocales
    .filter((lang) => !available || available.includes(lang))
    .filter((lang) => !entrySlugs || entrySlugs[lang])
    .map((lang) => ({ lang, href: pathFor(key, lang, entrySlugs?.[lang]) }));
}
