# Sunna (sunnasaunas.com)

Mobile sauna + ice bath hire in Portugal. This repo is the Astro rebuild that replaces the
Squarespace site. Cutover steps live in `MIGRATION.md`.

## Stack

- Astro 7, static output, `build.format: 'file'` + `trailingSlash: 'never'` (URLs have no trailing slash, matching Squarespace)
- Cloudflare Workers static assets (`wrangler.jsonc`), with redirects in `public/_redirects` and headers in `public/_headers`
- Content as Markdown in `src/content/`, editable via GitHub
- Forms: OpnForm, rendered natively from its schema at build time and posted to its API (`src/lib/opnform.ts`, `src/components/OpnForm.astro`, slugs in `src/config/site.ts`); falls back to the iframe embed
- Node ≥ 22.12. Agents: run the dev server with `astro dev --background` (`astro dev stop|status|logs`)

```
npm run dev               # astro dev
npm run build             # production build (published locales only)
npm run preview           # wrangler dev on :8787, serves dist/ with _redirects/_headers
npm run check:redirects   # every old Squarespace URL must 200 or 301→200
npm run scrape            # re-snapshot the live Squarespace site into migration/snapshot/
PREVIEW_ALL_LOCALES=true npm run build   # include draft PT/FR/ES (noindexed)
python3 -I scripts/check-seo.py          # after a build: titles/descriptions/canonicals vs Squarespace + broken links
node scripts/check-translations.mjs      # translated files mirror the English layout
scripts/preview-capture.sh [--only /en,/en/about]   # rebuild, serve, screenshot into migration/capture/local
node scripts/capture.mjs live            # screenshots + layout JSON of the live Squarespace site
node scripts/lib/compare.cjs en/home desktop <outPrefix>   # live|local side-by-side strips
```

## How routing works

- **All URLs come from `src/i18n/routes.ts`** (`pageSlugs`, `pathFor`). Never hardcode a path.
- One router: `src/pages/[lang]/[...slug].astro` generates every localized page, collection index and entry. Its `getStaticPaths` is hoisted, so helpers it uses must be imported or defined inside it.
- Every locale is prefixed: `/en`, `/pt`, `/fr`, `/es`. English slugs must stay identical to Squarespace.
- `publishedLocales` in `src/i18n/config.ts` controls what is built. Unpublished locales are noindexed and show a draft banner even in preview builds.
- hreflang alternates are emitted in `<head>` (`Seo.astro`), not the sitemap, because translated slugs differ.

## Templates (how pages are built)

Everything renders through `src/layouts/BaseLayout.astro` (header, footer, SEO head, analytics) and one of three templates:

| Template | Used for | To add one |
| --- | --- | --- |
| `src/views/Page.astro` | Home, How It Works, For Events, Ice Bath, Buy a Sauna, Contact, Privacy, and the blog / Our Work index pages | Add a page key + slugs in `src/i18n/routes.ts`, then `src/content/pages/<lang>/<key>.md` listing its sections |
| `src/views/CirclePost.astro` | Every blog post | Add `src/content/circle/<lang>/<slug>.md` |
| `src/views/WorkEntry.astro` | Every case study (gallery + lightbox) | Add `src/content/work/<lang>/<slug>.md` with a `gallery:` list |

Marketing pages are an ordered list of **sections** in frontmatter (`sections:`), rendered by `src/components/sections/Sections.astro`. Types and every option are documented in `src/components/sections/types.ts`: `hero`, `intro`, `split` (text + image, the workhorse), `collage`, `cards`, `latestPosts`, `banner`, `cta`, `stack`, `gallery`, `form`, `collection`. Copy fields are Markdown; links use `page:<key>` so they localize. The easiest way to make a new page is to copy a similar one (e.g. `iceBath.md` for a service page).

Layout fields (`height`, `imageAspect`, `imageSize`, ...) were measured from the live Squarespace site; `height` mirrors Squarespace's small/medium/large sections.

## Where things live

| What | Where |
| --- | --- |
| Page copy + section list per language | `src/content/pages/<lang>/<pageKey>.md` |
| Blog ("The Circle") | `src/content/circle/<lang>/<slug>.md` |
| Case studies ("Our Work") | `src/content/work/<lang>/<slug>.md` |
| Section components | `src/components/sections/` |
| Images (originals from Squarespace) | `src/assets/images/` (map of CDN URL → file: `migration/image-map.json`); focal points in `src/lib/focal.ts` |
| Logo, favicon source | `src/assets/brand/` |
| Design tokens (colours, type scale) | `src/styles/global.css` |
| Nav/footer/UI strings | `src/i18n/ui.ts` |
| Business details, GA ID, OpnForm slugs | `src/config/site.ts` |
| Squarespace reference snapshot | `migration/snapshot/` (`html/`, `json/`, `pages.json`, `images.json`; `images/` is gitignored, run `npm run scrape`) |
| Live/local screenshots | `migration/capture/` (gitignored) |

Content conventions:
- `translationKey` links translations (EN slug for posts; PageKey for pages). Lookups use it, not file ids, because the glob loader lowercases ids.
- `translationStatus`: `source` (EN), `machine-draft` (Claude translation), `reviewed` (native-checked).
- Keep `seoTitle` equal to the live Squarespace `<title>` for EN unless deliberately improving it.
- Images: only original files (owner's photos, Squarespace originals). **Never generate, redraw or recreate images, logos or icons**; any substitute must be flagged to the owner first. Section copy references images by filename in `src/assets/images/`; Markdown bodies use relative paths. Never hotlink `images.squarespace-cdn.com`: it dies when Squarespace is cancelled.
- Post bodies: Squarespace `<br>` line breaks are explicit Markdown hard breaks (two trailing spaces); Astro 7's default Markdown processor (Sätteri) does not run remark plugins.

## Status (2026-10-18)

Preview: https://sunnasaunas.harry-b68.workers.dev (Workers Builds, branch `astro-migration`; moves to `main` after sign-off). Next steps and the owner's sign-off checklist: `MIGRATION.md`.

Done: replica of every page (desktop + mobile measured against live), 5 posts, 4 case studies, redirects, SEO parity, PT/FR/ES drafts of everything (`machine-draft`, unpublished). Open items for the owner are listed in `MIGRATION.md` → "Flagged for owner".

Scripts used for the migration (kept for reproducibility): `scripts/scrape-squarespace.mjs`, `scripts/lib/port-posts.py` (blog JSON → Markdown, overwrites EN posts), `scripts/lib/html2md.py`, `scripts/lib/hard-breaks.py`.
