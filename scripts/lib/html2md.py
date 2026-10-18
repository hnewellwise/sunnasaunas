# Minimal Squarespace rich-text HTML -> Markdown for migrating copy (p, strong/em, br, ul/ol, a, h1-4).
import html as H, re, sys, json

def html2md(s):
    s = s.replace('&nbsp;', ' ')
    s = re.sub(r'</?span[^>]*>|</?div[^>]*>', '', s)
    s = re.sub(r'<(strong|b)>\s*</\1>', '', s)
    s = re.sub(r'<(strong|b)>(.*?)</\1>', lambda m: f"**{m.group(2).strip()}**" + (' ' if m.group(2).endswith(' ') else ''), s, flags=re.S)
    s = re.sub(r'<(em|i)>(.*?)</\1>', r'*\2*', s, flags=re.S)
    s = re.sub(r'<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'<h([1-4])>(.*?)</h\1>', lambda m: '#' * int(m.group(1)) + ' ' + m.group(2).strip() + '\n\n', s, flags=re.S)
    s = re.sub(r'<li>\s*(?:<p>)?(.*?)(?:</p>)?\s*</li>', lambda m: '- ' + m.group(1).strip().replace('\n', '  \n  ') + '\n', s, flags=re.S)
    s = re.sub(r'</?(ul|ol)>', '\n', s)
    s = re.sub(r'<p>(.*?)</p>', lambda m: m.group(1).strip() + '\n\n', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = H.unescape(s)
    s = re.sub(r'\*\*\s*\*\*', '', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()

if __name__ == '__main__':
    d = json.load(open(sys.argv[1]))
    imap = json.load(open('migration/image-map.json'))
    def img(u):
        if not u: return ''
        u2 = u.split('?')[0]
        return imap.get(u2) or imap.get(u2.replace('%7E', '~')) or ('?' + u2.split('/')[-1])
    for i, sec in enumerate(d['sections']):
        print(f"\n## S{i} theme={sec['theme']} bgImg={img(sec.get('bgImg'))} kind={sec.get('kind')}")
        for b in sorted(sec.get('blocks') or [], key=lambda b: (b['y'], b['x'])):
            head = f"  -- x{b['x']} w{b['w']} y{b['y']} h{b['h']}"
            if b.get('img'): print(head, 'IMG', img(b['img']), f"alt={b.get('alt')!r}" if b.get('alt') else '')
            elif b.get('btn'): print(head, 'BTN', b['btn'])
            elif b.get('html'): print(head, 'TEXT\n' + '\n'.join('     ' + l for l in html2md(b['html']).split('\n')))
        if sec.get('listItems'):
            print('  LIST', sec.get('listHeading'))
            for li in sec['listItems']: print('    *', li['title'], '|', html2md(li.get('desc') or ''), '|', img(li.get('img')), '|', li.get('btn'))
        if sec.get('gallery'): print('  GALLERY', [img(g) for g in sec['gallery']])
        if sec.get('text'): print('  TEXT', sec['text'][:300])
