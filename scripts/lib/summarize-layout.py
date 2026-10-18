# Print a compact summary of a captured Squarespace layout JSON: python3 -I scripts/lib/summarize-layout.py <file.json> [maxhtml]
import json, sys
d = json.load(open(sys.argv[1])); mx = int(sys.argv[2]) if len(sys.argv) > 2 else 400
for i, s in enumerate(d['sections']):
    print(f"## S{i} theme={s['theme']} h={s['height']} bg={s.get('bg')} bgImg={(s.get('bgImg') or '').split('/')[-1]} kind={s.get('kind')}")
    for b in sorted(s.get('blocks') or [], key=lambda b: (b['y'], b['x'])):
        img = (b.get('img') or '').split('/')[-1]
        imgs = f" +{len(b['imgs'])}imgs" if b.get('imgs') else ''
        btn = f" BTN[{b['btn']['text']}→{b['btn']['href']} {b['btn'].get('kind')}]" if b.get('btn') else ''
        print(f"  x{b['x']} w{b['w']} y{b['y']} h{b['h']} {b['type'][:10]} {img}{imgs}{btn} {(b.get('html') or '')[:mx]}")
    if s.get('listItems'): print('  LIST', s.get('listHeading'), json.dumps(s['listItems'])[:mx*3])
    if s.get('gallery'): print('  GALLERY', len(s['gallery']), [g.split('/')[-1] for g in s['gallery']][:30])
    if s.get('text'): print('  TEXT', s['text'][:mx*3])
