# Sunna (sunnasaunas.com)

Mobile sauna + ice bath hire in Portugal. This repo is the Astro rebuild that replaces the
Squarespace site. Cutover steps live in `MIGRATION.md`.

## Stack

- Astro 7, static output, `build.format: 'file'` + `trailingSlash: 'never'` (URLs have no trailing slash, matching Squarespace)
- Cloudflare Workers static assets (`wrangler.jsonc`), with redirects in `public/_redirects` and headers in `public/_headers`
- Content as Markdown in `src/content/`, editable via GitHub
- Contact form: hosted OpnForm embed (`src/components/OpnForm.astro`, slugs in `src/config/site.ts`)
- Node ≥ 22.12. Agents: run the dev server with `astro dev --background` (`astro dev stop|status|logs`)

```
npm run dev               # astro dev
npm run build             # production build (published locales only)
npm run preview           # wrangler dev on :8787, serves dist/ with _redirects/_headers
npm run check:redirects   # every old Squarespace URL must 200 or 301→200
npm run scrape            # re-snapshot the live Squarespace site into migration/snapshot/
PREVIEW_ALL_LOCALES=true npm run build   # include draft PT/FR/ES (noindexed)
```

## How routing works

- **All URLs come from `src/i18n/routes.ts`** (`pageSlugs`, `pathFor`). Never hardcode a path.
- One router: `src/pages/[lang]/[...slug].astro` generates every localized page, collection index and entry. Its `getStaticPaths` is hoisted, so helpers it uses must be imported or defined inside it.
- Every locale is prefixed: `/en`, `/pt`, `/fr`, `/es`. English slugs must stay identical to Squarespace.
- `publishedLocales` in `src/i18n/config.ts` controls what is built. Unpublished locales are noindexed and show a draft banner even in preview builds.
- hreflang alternates are emitted in `<head>` (`Seo.astro`), not the sitemap, because translated slugs differ.

## Where things live

| What | Where |
| --- | --- |
| Page markup (one per page) | `src/views/<Page>.astro` |
| Page copy per language | `src/content/pages/<lang>/<pageKey>.md` (structured copy in `sections:` frontmatter) |
| Blog ("The Circle") | `src/content/circle/<lang>/<slug>.md` |
| Case studies ("Our Work") | `src/content/work/<lang>/<slug>.md` |
| Nav/footer/UI strings | `src/i18n/ui.ts` |
| Business details, GA ID, OpnForm slugs | `src/config/site.ts` |
| Squarespace reference snapshot | `migration/snapshot/` (`html/`, `json/`, `pages.json`, `images.json`; `images/` is gitignored, run `npm run scrape`) |

Content conventions:
- `translationKey` links translations (EN slug for posts; PageKey for pages). Lookups use it, not file ids, because the glob loader lowercases ids.
- `translationStatus`: `source` (EN), `machine-draft` (Claude translation), `reviewed` (native-checked).
- Keep `seoTitle` equal to the live Squarespace `<title>` for EN unless deliberately improving it.
- Images: copy from `migration/snapshot/images/` into `src/assets/images/<area>/` with descriptive kebab-case names and reference them relatively from frontmatter/markdown so Astro optimises them. Never hotlink `images.squarespace-cdn.com`: it dies when Squarespace is cancelled.

## Build brief (the replica work)

Goal: a faithful replica of the live Squarespace site, then PT/FR/ES drafts. Look and content first; redesign comes after launch.

1. **Design tokens.** From `migration/snapshot/html/index.html` (inline `<style>`, Squarespace site CSS) extract colours, fonts (Poppins is visible; there is also a Typekit kit, so identify its families and self-host or swap for a Google Fonts equivalent), sizes, button and spacing styles into `src/styles/global.css`. Replace the `public/favicon.ico` placeholder and `og-image.jpg` with the real Sunna logo/OG image (`pages.json` → `ogImage`, from `static1.squarespace.com`).
2. **Header/footer.** Replicate the desktop nav and mobile overlay menu, logo, and footer.
3. **Pages.** For each `src/views/*.astro` (home, about, for-events, ice-bath, saunas-for-sale, contact, privacy, plus the the-circle and our-work indexes), rebuild section by section from the snapshot HTML. Put the copy in the page's content file and the markup/styles in the view. Use the WhatsApp/booking CTAs as on the live site (fill `site.whatsapp` if one exists).
4. **Blog + case studies.** Convert `item.body` HTML in `migration/snapshot/json/en/...json` to Markdown, fill `description` (most are empty on Squarespace, so write a ~150-char one), set `heroImage`, and for case studies fill `gallery`. Keep slugs unchanged.
5. **Contact.** The form is OpnForm (hosted). Until the owner creates the form and adds its slug in `site.opnform`, the page shows the email fallback. Mirror the live contact page's other content.
6. **Verify.** `npm run build`, `npx astro check`, `npm run preview` + `npm run check:redirects` all clean. Compare each page with the live site at 375px and 1440px.
7. **Translations.** Draft PT (pt-PT, European Portuguese, not Brazilian), FR and ES for every page, post and case study, plus `ui.ts`. Use the slugs in `routes.ts`; translate post slugs too. Mark everything `translationStatus: machine-draft`. Do **not** add them to `publishedLocales`. Build with `PREVIEW_ALL_LOCALES=true` to check them.

Open decisions for the owner (don't block on these, leave TODOs):
- Cookie consent for GA4 (Squarespace showed a banner) vs cookieless Cloudflare Web Analytics.
- OpnForm form slug(s), created by the owner on opnform.com.
- WhatsApp number, if the live site uses one.
