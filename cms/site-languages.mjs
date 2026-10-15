import {readFile, writeFile, readdir} from 'node:fs/promises';

export const siteLanguages = [
  {code: 'en', prefix: '', label: 'English'},
  {code: 'nl', prefix: 'nl/', label: 'Nederlands'},
  {code: 'de', prefix: 'de/', label: 'Deutsch'},
  {code: 'pl', prefix: 'pl/', label: 'Polski'},
];

export const languageMenu = (route, active) => `<div class="lang">${siteLanguages.map(language => `<a href="/${language.prefix}${route}" lang="${language.code}" aria-label="${language.label}"${language.code === active ? ' class="on" aria-current="page"' : ''}>${language.code.toUpperCase()}</a>`).join('')}</div>`;

export async function refreshSiteLanguages(root) {
  const routes = new Set();
  async function visit(directory, prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      if (['assets', 'dist'].includes(entry.name) || entry.name.startsWith('.')) continue;
      const path = prefix + entry.name;
      const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) { await visit(file, path + '/'); continue; }
      if (entry.name !== 'index.html') continue;
      const language = siteLanguages.find(item => item.prefix && path.startsWith(item.prefix)) || siteLanguages[0];
      const route = path.slice(language.prefix.length).replace(/index\.html$/, '');
      routes.add(route);
      let html = await readFile(file, 'utf8');
      html = html.replace(/Sp\.\s*z\.?\s*o\.o\.?/g, 'Sp.z.o.o.');
      html = html.replace(/<div class="lang">[\s\S]*?<\/div>/g, languageMenu(route, language.code));
      html = html.replace(/\/assets\/js\/(content|pdf-preview|contact-form)\.js(?:\?v=[^"'\s>]*)?/g, '/assets/js/$1.js?v=languages-20261015');
      html = html.replace(/\/assets\/css\/(arcadian|content)\.css(?:\?v=[^"'\s>]*)?/g, '/assets/css/$1.css?v=languages-20261015');
      if (html.includes('data-content-page="gallery"')) {
        html = html.replace(/\/assets\/js\/(content|pdf-preview)\.js\?v=[^"'\s>]*/g, '/assets/js/$1.js?v=portfolio-20261015');
        html = html.replace(/\/assets\/css\/content\.css\?v=[^"'\s>]*/g, '/assets/css/content.css?v=portfolio-20261015');
      }
      html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, '');
      const alternates = siteLanguages.map(item => `\n  <link rel="alternate" hreflang="${item.code}" href="https://arcadian-eu.com/${item.prefix}${route}">`).join('') + `\n  <link rel="alternate" hreflang="x-default" href="https://arcadian-eu.com/${route}">`;
      html = html.replace(/<link rel="canonical"[^>]+>/, match => match + alternates);
      await writeFile(file, html);
    }
  }
  await visit(root);
  const urls = [...routes].sort().flatMap(route => siteLanguages.map(language => `  <url><loc>https://arcadian-eu.com/${language.prefix}${route}</loc><lastmod>2026-10-15</lastmod></url>`));
  await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}
