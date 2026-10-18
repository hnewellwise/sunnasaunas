# Squarespace → Cloudflare migration runbook

Current state (checked 2026-10-18):

| Thing | Where it is now |
| --- | --- |
| Registrar | Spaceship (renews 2027-03-07) |
| DNS | Spaceship nameservers (`launch1/2.spaceship.net`) |
| Website | Squarespace (`www` CNAME → `ext-cust.squarespace.com`, apex A → 198.185.159.144/145, 198.49.23.144/145) |
| Email | Spacemail (MX `mx1/mx2.spacemail.com`, SPF, DKIM selector `spacemail`, DMARC `p=none`) |
| Analytics | GA4 `G-39VL06CT4Y` (carried over in `src/components/Analytics.astro`) |
| Search Console | Verified by DNS TXT `google-site-verification=EqRt…` (must be copied, see Phase 2) |

Canonical host stays **`https://www.sunnasaunas.com`**. English URLs stay **identical** (`/en/<slug>`).

---

## Phase 1: Build and stage (no live impact)

1. Finish the replica (see `CLAUDE.md`, "Build brief").
2. `npm run build && npm run check:redirects` locally against `npm run preview` (wrangler dev).
3. Create the Worker: in the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**, pick `hnewellwise/sunnasaunas`.
   - Build command: `npm run build` · Deploy command: `npx wrangler deploy`
   - Non-production branch builds get preview URLs. For a preview that shows all languages, set the build variable `PREVIEW_ALL_LOCALES=true` on preview builds only.
4. Check the `*.workers.dev` URL:
   - `npm run check:redirects -- https://sunnasaunas.<account>.workers.dev` must be all ✓
   - Side-by-side visual check of every page against Squarespace (desktop + mobile).
   - The contact form submits and the OpnForm notification email arrives.

## Phase 2: Move DNS to Cloudflare (still serving Squarespace)

Do this a day or more before cutover. Nothing visible changes and email must keep working.

1. Cloudflare dashboard → **Add a domain** → `sunnasaunas.com` → Free plan. Let it scan records.
2. **Check that the scan imported every record**, especially:
   - `MX 0 mx1.spacemail.com`, `MX 0 mx2.spacemail.com`
   - `TXT @ v=spf1 include:spf.spacemail.com ~all`
   - `TXT spacemail._domainkey …` (DKIM, copy the full value from Spaceship)
   - `TXT _dmarc v=DMARC1; p=none; fo=1`
   - `TXT @ google-site-verification=EqRtAWE9azE0aM0p5R3UmLwuI3y_7NWVQk_qMddENGI`
   - `www CNAME ext-cust.squarespace.com` and the four apex A records → set to **DNS only (grey cloud)** for now so Squarespace's SSL keeps working.
   - Any records in the Spaceship DNS panel that a scan can't see (open the panel and compare line by line).
3. At Spaceship → Domain → Nameservers, switch to the two Cloudflare nameservers it gives you.
4. Wait for "Active" in Cloudflare. Then check email both ways and run `dig MX sunnasaunas.com`.

## Phase 3: Cutover (about 15 minutes, reversible)

1. In `wrangler.jsonc` uncomment the `routes` block (custom domains for `www` and apex). If DNS records still point at Squarespace, delete those first (`www` CNAME + apex A records). Wrangler/Cloudflare creates the Worker custom-domain records.
2. Deploy (push to `main`, or `npm run deploy`).
3. Apex → www: Cloudflare **Rules → Redirect Rules →** "Redirect from root to WWW" template (301, preserve path + query). Without it, `sunnasaunas.com/x` would serve a duplicate.
4. SSL/TLS → Edge Certificates: **Always Use HTTPS** on and **HSTS** on (Squarespace sent `max-age=15552000`, so keep at least that).
5. Verify:
   - `npm run check:redirects -- https://www.sunnasaunas.com` must be all ✓
   - `curl -I https://sunnasaunas.com/en/about` → 301 to `https://www.sunnasaunas.com/en/about`
   - View source on home: canonical, hreflang, GA tag present.

**Rollback:** remove the Worker custom domains and restore the `www` CNAME (`ext-cust.squarespace.com`, grey cloud) plus the apex A records. Squarespace serves again within minutes. That's why Squarespace stays paid until Phase 4 is done.

## Phase 4: SEO follow-through

1. Search Console: add `https://www.sunnasaunas.com/sitemap-index.xml` and remove the old `/sitemap.xml` (it 301s anyway). URL-inspect home + 3 key pages → Request indexing.
2. Watch **Pages → Not indexed** and **404s** daily for 2 weeks. Add any stray Squarespace URLs to `public/_redirects` (they also appear in Cloudflare analytics as 404s).
3. Update the Google Business Profile, Instagram bio and any directories if they link to `/en/home` or other redirected URLs.
4. After about 2 weeks clean: **cancel Squarespace**. Before cancelling, run `npm run scrape -- --force` one last time and export Squarespace data (Settings → Import/Export, plus any form submissions/contacts).

## Phase 5: Launch a language (PT / FR / ES)

1. Native review of `src/content/**/<lang>/*.md` and the `<lang>` block in `src/i18n/ui.ts`; set `translationStatus: reviewed`.
2. Add the locale to `publishedLocales` in `src/i18n/config.ts`.
3. For PT: change `/portuguese /en 302` to `/portuguese /pt 301` in `public/_redirects`.
4. Deploy, then confirm hreflang tags on EN pages now list the new language and the sitemap includes it.
5. Translated slugs become permanent at this point. Any later rename needs a 301.

## Known differences from Squarespace

- Trailing-slash URLs (`/en/about/`) redirect with **307** (Cloudflare static-assets behaviour), not 301. Squarespace never used trailing slashes, so nothing indexed is affected.
- `/` now redirects to `/en` (previously `/` served the home page with `/` as canonical). The 301 passes link equity; expect a short reshuffle of the home URL in Search Console.
- Blog RSS was `/en/the-circle?format=rss`. Query strings can't be redirected from `_redirects`; if RSS matters, add `src/pages/[lang]/the-circle/rss.xml.ts` and a Redirect Rule for the old URL.

## Flagged for owner

### Assets that are not untouched originals (approval needed)
- **Body font**: Squarespace used Adobe's *aktiv-grotesk*, which is licensed through Squarespace and can't be self-hosted. The new site uses **Inter** (free, self-hosted) as the closest substitute. Options: keep Inter, or add an Adobe Fonts web project and switch `--font-body` in `src/styles/global.css`. Headings use **Poppins**, the same font as before.
- **Favicon**: square crop + resize of the original Squarespace favicon PNG (`src/assets/brand/favicon-original.png` → `public/favicon*.png`, `apple-touch-icon.png`). Nothing redrawn.
- **Default social image** (`public/og-image.png`): the original clay logo PNG from Squarespace, unchanged. Per-page social images are 1200px JPEG resizes of the page's own photo.
- **Instagram icon**: the SVG Squarespace itself served (copied from the snapshot), unchanged.
- No AI-generated or recreated images anywhere; every photo in `src/assets/images/` is an unmodified original from the Squarespace CDN.

### Needs your action before launch
- **OpnForm**: create two forms on opnform.com and paste their slugs into `src/config/site.ts` → `opnform`:
  - `contact` (Get In Touch): First name*, Last name*, Email*, "Sign up for news and updates" checkbox, Phone, Message* ("Give us some detail about your request"), button "Submit".
  - `quote` (Purchase A Sauna, on /saunas-for-sale): the same, plus Country + Phone number, Your Location*, Message* ("If you already know the shape, size, oven type, windows then tell us here…"), button "Get A Quote".
  - Optional per-language versions (PT/FR/ES); otherwise the English form is embedded on every language. Until a slug is set the page shows "Email us at hello@sunnasaunas.com".
  - Export any past form submissions from Squarespace before cancelling.
- **Privacy policy** (all languages): copied verbatim from Squarespace (last updated 4/9/25). It says Google Analytics is the only third party; the new site also uses **OpnForm** (form data) and **Cloudflare** (hosting/CDN). Needs updating by you.
- **Cookie consent**: Squarespace showed a cookie banner; the new site loads GA4 without one. Under GDPR, choose either a consent banner (GA consent mode) or switch to cookieless Cloudflare Web Analytics (no banner needed). Until then consider this a launch blocker.
- **Translations**: 54 drafted files (PT pt-PT, FR, ES) are `machine-draft` and not published. Review, set `translationStatus: reviewed`, then follow Phase 5. `node scripts/check-translations.mjs` shows what's left.

### Content changes made during the migration (vs. Squarespace)
- Privacy page title "Privacy Policy 2 — Sunna" → "Privacy Policy — Sunna".
- Wrote meta descriptions where Squarespace had none: Our Work, Privacy, the four case studies, "The Perfect Sauna Routine For Beginners".
- Ice Bath page "Contact Us" button pointed at `/en/ice-bath#contact`, which didn't exist; it now goes to the contact page.
- Language menu: Squarespace's "English / Portuguese" nav folders became a real language switcher (shows only published languages).
- Not replicated on purpose: the Squarespace cookie banner, the `/cart` page (redirects home), and the tiny "How It Works" title on mobile (a Squarespace rendering bug).

### Worth a look (left as on the live site)
- Home page "Beato Innovation District Pop Up" advertises a **27–29 March** event that has passed.
- Existing copy typos kept verbatim: "ice top-ups,." (Ice Bath), "fits into you space" (Buy a Sauna), "Cancelation Policy", "physical and metal benefits" (post SEO description).
- Citation links in "How to Recover Faster…" carry `?utm_source=chatgpt.com`.
- Most images have no alt text (Squarespace had none). Adding descriptive alt text would help accessibility and image search.
