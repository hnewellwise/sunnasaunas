# One-off migration: Squarespace blog JSON (migration/snapshot/json/en/the-circle/*.json)
# -> src/content/circle/en/<slug>.md, with images pointing at src/assets/images/.
# Usage: python3 -I scripts/lib/port-posts.py   (overwrites the EN post files)
import json, re, glob, html, datetime, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from html2md import html2md

imap = json.load(open('migration/image-map.json'))
def local(url):
    u = html.unescape(url).split('?')[0]
    for cand in (u, u.replace('~', '%7E'), u.replace('%7E', '~')):
        if cand in imap: return imap[cand]
    raise SystemExit(f'image not in snapshot: {u}')

IMG_REL = '../../../assets/images/'
def q(s): return json.dumps(s or '', ensure_ascii=False)

def convert_body(body):
    out = []
    body = re.sub(r'<(style|script)[^>]*>.*?</\1>', '', body, flags=re.S)
    # Walk top-level blocks in order.
    for chunk in re.split(r'(?=<div class="sqs-block )', body)[1:]:
        if 'sqs-html-content' in chunk:
            m = re.search(r'<div class="sqs-html-content"[^>]*>(.*)', chunk, re.S)
            inner = m.group(1)
            inner = re.sub(r'(</div>\s*)+$', '', inner.strip())
            md = html2md(re.sub(r' (class|style|data-[\w-]+)="[^"]*"', '', inner))
            if md: out.append(md)
        tags = re.findall(r'<img [^>]*?data-src="[^"]+"[^>]*>', chunk)
        if tags:
            caps = [html2md(c) for c in re.findall(r'<figcaption[^>]*>(.*?)</figcaption>', chunk, re.S)]
            seen, md_imgs = [], []
            for tag in tags:
                name = local(re.search(r'data-src="([^"]+)"', tag).group(1))
                if name in seen: continue
                seen.append(name)
                alt = html.unescape((re.search(r'alt="([^"]*)"', tag) or [None, ''])[1]).strip()
                md_imgs.append(f'![{alt}]({IMG_REL}{name})')
            # A gallery block becomes one paragraph of images, laid out as a thumbnail row by CSS.
            out.append('\n'.join(md_imgs))
            if caps and caps[0]:
                out.append(f'*{caps[0].strip("*").strip()}*')
    return '\n\n'.join(out).strip() + '\n'

for f in sorted(glob.glob('migration/snapshot/json/en/the-circle/*.json')):
    it = json.load(open(f))['item']
    slug = it['urlId']
    pub = datetime.datetime.fromtimestamp(it['publishOn'] / 1000, datetime.UTC).date().isoformat()
    seo = (it.get('seoData') or {})
    desc = seo.get('seoDescription') or html2md(it.get('excerpt') or '')
    hero = local(it['assetUrl'])
    body = convert_body(it.get('body') or '')
    # heroImage is the listing thumbnail (Squarespace assetUrl); the post page shows only the body.
    fm = [
        '---',
        f'title: {q(it["title"])}',
        f'seoTitle: {q(seo.get("seoTitle") or (it["title"] + " — Sunna"))}',
        f'description: {q(re.sub(r"\s+", " ", desc).strip())}',
        f'translationKey: {slug}',
        'translationStatus: source',
        f'pubDate: {pub}',
        f'heroImage: {IMG_REL}{hero}',
        'heroAlt: ""',
        '---',
        '',
    ]
    open(f'src/content/circle/en/{slug}.md', 'w').write('\n'.join(fm) + body)
    print(slug, len(body), 'chars')
