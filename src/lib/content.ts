import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/config';
import type { PageKey } from '../i18n/routes';

type Localized = CollectionEntry<'circle' | 'work' | 'pages'>;

export const langOf = (entry: Localized) => entry.id.split('/')[0] as Locale;
export const slugOf = (entry: Localized) => entry.data.slug ?? entry.id.split('/').slice(1).join('/');

export async function entriesFor<C extends 'circle' | 'work'>(collection: C, lang: Locale) {
  const all = await getCollection(collection, (e) => langOf(e) === lang);
  const dateOf = (e: CollectionEntry<'circle' | 'work'>) =>
    'pubDate' in e.data ? e.data.pubDate : e.data.date;
  return all.sort((a, b) => dateOf(b).valueOf() - dateOf(a).valueOf());
}

/** Map of locale -> slug for every translation sharing this entry's translationKey. */
export async function translationSlugs(collection: 'circle' | 'work', translationKey: string) {
  const siblings = await getCollection(collection, (e) => e.data.translationKey === translationKey);
  return Object.fromEntries(siblings.map((e) => [langOf(e), slugOf(e)])) as Partial<Record<Locale, string>>;
}

/** Page copy is looked up by translationKey (= PageKey), not file id: glob ids are lowercased. */
export async function pageEntry(lang: Locale, key: PageKey) {
  const [entry] = await getCollection('pages', (e) => langOf(e) === lang && e.data.translationKey === key);
  return entry as CollectionEntry<'pages'> | undefined;
}
