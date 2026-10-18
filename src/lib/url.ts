/** Public path of the current page. With build.format 'file', Astro.url.pathname ends in .html. */
export const publicPath = (url: URL) => url.pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
