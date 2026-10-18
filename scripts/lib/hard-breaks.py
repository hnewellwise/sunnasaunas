# Make single newlines inside Markdown paragraphs explicit hard breaks (two trailing spaces),
# so Squarespace <br> line breaks survive Astro's Markdown processor. Frontmatter is untouched.
# Consecutive image lines (gallery rows) and lines before list items/headings are left alone.
# Usage: python3 -I scripts/lib/hard-breaks.py <file.md>...
import sys

def fix(text):
    head, body = '', text
    if text.startswith('---\n'):
        fm_end = text.index('\n---\n', 4)
        head, body = text[:fm_end + 5], text[fm_end + 5:]
    lines = body.split('\n')
    for i in range(len(lines) - 1):
        cur, nxt = lines[i], lines[i + 1]
        if not cur.strip() or not nxt.strip() or cur.endswith('  '):
            continue
        if cur.lstrip().startswith(('![', '#')) or nxt.lstrip().startswith(('- ', '#', '![', '* ')) or nxt.startswith(('1.', '|')):
            continue
        lines[i] = cur + '  '
    return head + '\n'.join(lines)

if __name__ == '__main__':
    for f in sys.argv[1:]:
        src = open(f).read()
        out = fix(src)
        if out != src:
            open(f, 'w').write(out)
            print('updated', f)
