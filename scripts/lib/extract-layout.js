// Evaluated in the page: describes each Squarespace section and its blocks
// (position as % of viewport width, pixel offsets/heights, text HTML, images, buttons).
(() => {
  const W = innerWidth;
  const clean = (h) => h.replace(/\s+/g, ' ').replace(/ (class|style|data-[\w-]+|id)="[^"]*"/g, '').trim();
  const src = (img) => img && (img.dataset.src || img.currentSrc || img.src || '').split('?')[0];
  const sections = [...document.querySelectorAll('section.page-section')].filter((s) => !s.closest('footer')).map((s) => {
    const r = s.getBoundingClientRect();
    const top = r.top + scrollY;
    const bgEl = s.querySelector('.section-background');
    const blocks = [...s.querySelectorAll('.fe-block, .sqs-block')]
      .filter((b) => !b.parentElement.closest('.fe-block, .sqs-block'))
      .map((b) => {
        const br = b.getBoundingClientRect();
        const inner = b.matches('.sqs-block') ? b : b.querySelector('.sqs-block') || b;
        const type = (inner.className.match(/sqs-block-([\w-]+)/) || [])[1] || 'unknown';
        const img = b.querySelector('img');
        const btn = b.querySelector('a.sqs-block-button-element, a.btn');
        const html = b.querySelector('.sqs-html-content');
        const imgs = [...b.querySelectorAll('img')].map(src);
        return {
          type,
          x: Math.round((br.left / W) * 100), w: Math.round((br.width / W) * 100),
          y: Math.round(br.top + scrollY - top), h: Math.round(br.height),
          img: img ? src(img) : undefined, imgs: imgs.length > 1 ? imgs : undefined, alt: img?.alt || undefined,
          fit: img ? getComputedStyle(img).objectFit : undefined,
          btn: btn ? { text: btn.textContent.trim(), href: btn.getAttribute('href'), kind: (btn.className.match(/--(primary|secondary|tertiary)/) || [])[1], size: (btn.className.match(/--(small|medium|large)/) || [])[1] } : undefined,
          html: html ? clean(html.innerHTML) : ['image', 'button', 'spacer', 'horizontalrule'].includes(type) ? undefined : clean(b.innerText).slice(0, 3000),
        };
      });
    const listItems = [...s.querySelectorAll('li.list-item')].map((li) => ({
      title: li.querySelector('.list-item-content__title')?.innerText,
      desc: li.querySelector('.list-item-content__description')?.innerHTML && clean(li.querySelector('.list-item-content__description').innerHTML),
      img: src(li.querySelector('img')),
      btn: li.querySelector('a') ? { text: li.querySelector('a').innerText.trim(), href: li.querySelector('a').getAttribute('href') } : undefined,
    }));
    const gallery = [...new Set([...s.querySelectorAll('[class*="gallery"] img')].map(src))];
    return {
      theme: s.dataset.sectionTheme || 'default', height: Math.round(r.height),
      bg: bgEl ? getComputedStyle(bgEl).backgroundColor : undefined,
      bgImg: src(s.querySelector('.section-background img')),
      kind: (s.className.match(/user-items-list-section|gallery-section|collection-content|blog/g) || []).join(' ') || undefined,
      blocks: blocks.length ? blocks : undefined,
      listHeading: s.querySelector('.list-section-title')?.innerText,
      listItems: listItems.length ? listItems : undefined,
      gallery: gallery.length ? gallery : undefined,
      text: !blocks.length && !listItems.length ? clean(s.innerText).slice(0, 4000) : undefined,
    };
  });
  return { url: location.pathname, width: W, sections };
})()
