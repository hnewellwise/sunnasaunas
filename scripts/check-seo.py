# Compare built pages' <title>/<meta description>/canonical with the live Squarespace snapshot,
# and check every internal href/src in dist/ resolves. Run after `npm run build`:
#   python3 -I scripts/check-seo.py
import json, re, os, glob, html, urllib.parse, sys
live = json.load(open('migration/snapshot/pages.json'))
NEW_PATH = {'/en/home': '/en', '/privacy-policy': '/en/privacy-policy', '/': '/en'}
issues = 0
print('--- SEO parity with Squarespace (title / description / canonical)')
for old, m in sorted(live.items()):
    if old == '/portuguese': continue
    np = NEW_PATH.get(old, old); f = f'dist{np}.html'
    if not os.path.exists(f): print('MISSING', np); issues += 1; continue
    s = open(f).read()
    grab = lambda pat: html.unescape((re.search(pat, s) or [None, ''])[1])
    t, d, c = grab(r'<title>(.*?)</title>'), grab(r'<meta name="description" content="([^"]*)"'), grab(r'<link rel="canonical" href="([^"]*)"')
    notes = []
    if t != m['title']: notes.append(f'title {m["title"]!r} -> {t!r}')
    if m['description'] and d.strip() != m['description'].strip(): notes.append('description changed')
    if not d: notes.append('EMPTY description'); issues += 1
    if c != 'https://www.sunnasaunas.com' + np: notes.append('canonical ' + c); issues += 1
    print(('ok   ' if not notes else 'note ') + np, '; '.join(notes))
print('--- internal links')
pages = {('/' + os.path.relpath(f, 'dist'))[:-5] for f in glob.glob('dist/**/*.html', recursive=True)}
files = {'/' + os.path.relpath(f, 'dist') for f in glob.glob('dist/**/*', recursive=True) if os.path.isfile(f)}
bad = set()
for f in glob.glob('dist/**/*.html', recursive=True):
    for h in re.findall(r'(?:href|src)="(/[^"#?]*)', open(f).read()):
        h = urllib.parse.unquote(h)
        if h in pages or h in files or h.rstrip('/') in pages: continue
        bad.add((h, f))
for b in sorted(bad): print('  broken', b)
print(f'{len(bad)} broken internal links')
sys.exit(1 if issues or bad else 0)
