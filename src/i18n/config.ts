export const locales = ['en', 'pt', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  en: { label: 'English', htmlLang: 'en', ogLocale: 'en_GB' },
  pt: { label: 'Português', htmlLang: 'pt-PT', ogLocale: 'pt_PT' },
  fr: { label: 'Français', htmlLang: 'fr', ogLocale: 'fr_FR' },
  es: { label: 'Español', htmlLang: 'es', ogLocale: 'es_ES' },
};

/**
 * Locales that are built and indexed in production.
 * PT/FR/ES are Claude-drafted translations awaiting native review: add a locale here
 * only once its content has been reviewed (translationStatus: reviewed).
 * Set PREVIEW_ALL_LOCALES=true to build every locale (noindexed) for review deploys.
 */
export const publishedLocales: Locale[] = ['en'];

export const builtLocales: Locale[] =
  import.meta.env.PREVIEW_ALL_LOCALES === 'true' ? [...locales] : publishedLocales;

export const isPublished = (lang: Locale) => publishedLocales.includes(lang);
