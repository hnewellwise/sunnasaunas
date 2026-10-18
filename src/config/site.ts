import type { Locale } from '../i18n/config';

export const site = {
  name: 'Sunna',
  url: 'https://www.sunnasaunas.com',
  email: 'hello@sunnasaunas.com',
  instagram: 'https://www.instagram.com/sunnasauna',
  // TODO(build): confirm WhatsApp number from the live site / owner.
  whatsapp: null as string | null,
  gaMeasurementId: 'G-39VL06CT4Y',
  defaultOgImage: '/og-image.jpg',

  /**
   * Hosted OpnForm (opnform.com) form slugs per locale. Create the forms in OpnForm
   * (one per language, or one form reused), then paste the slug from the share URL
   * https://opnform.com/forms/<slug>. null = show the email fallback instead.
   */
  opnform: {
    en: null,
    pt: null,
    fr: null,
    es: null,
  } as Record<Locale, string | null>,
};
