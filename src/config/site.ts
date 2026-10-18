import type { Locale } from '../i18n/config';

export const site = {
  name: 'Sunna',
  url: 'https://www.sunnasaunas.com',
  email: 'hello@sunnasaunas.com',
  instagram: 'https://www.instagram.com/sunnasauna',
  // TODO(build): confirm WhatsApp number from the live site / owner.
  whatsapp: null as string | null,
  gaMeasurementId: 'G-39VL06CT4Y',
  defaultOgImage: '/og-image.png',

  /**
   * Hosted OpnForm (opnform.com) form slugs, per form and locale. The Squarespace site had two
   * forms: "contact" (Get In Touch) and "quote" (Purchase A Sauna, on /saunas-for-sale).
   * Create them in OpnForm, then paste the slug from the share URL https://opnform.com/forms/<slug>.
   * A missing locale falls back to the English form; null everywhere = email fallback.
   */
  opnform: {
    contact: { en: null, pt: null, fr: null, es: null },
    quote: { en: null, pt: null, fr: null, es: null },
  } as Record<'contact' | 'quote', Record<Locale, string | null>>,
};
