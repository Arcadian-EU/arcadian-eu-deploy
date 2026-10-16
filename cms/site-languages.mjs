import {readFile, writeFile, readdir} from 'node:fs/promises';

export const siteLanguages = [
  {code: 'en', prefix: '', label: 'English'},
  {code: 'nl', prefix: 'nl/', label: 'Nederlands'},
  {code: 'de', prefix: 'de/', label: 'Deutsch'},
  {code: 'pl', prefix: 'pl/', label: 'Polski'},
];

export const languageMenu = (route, active, available = siteLanguages) => `<div class="lang">${available.map(language => `<a href="/${language.prefix}${route}" lang="${language.code}" aria-label="${language.label}"${language.code === active ? ' class="on" aria-current="page"' : ''}>${language.code.toUpperCase()}</a>`).join('')}</div>`;

export async function refreshSiteLanguages(root) {
  // A service can launch in one language. Advertise only translations that exist.
  const pages = [];
  const routes = new Map();
  let previousSitemap = '';
  try { previousSitemap = await readFile(new URL('sitemap.xml', root), 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const lastModified = new Map([...previousSitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)].map(match => [match[1], match[2]]));
  async function visit(directory, prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      if (['assets', 'dist'].includes(entry.name) || entry.name.startsWith('.')) continue;
      const path = prefix + entry.name;
      const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) { await visit(file, path + '/'); continue; }
      if (entry.name !== 'index.html') continue;
      const language = siteLanguages.find(item => item.prefix && path.startsWith(item.prefix)) || siteLanguages[0];
      const route = path.slice(language.prefix.length).replace(/index\.html$/, '');
      if (!routes.has(route)) routes.set(route, []);
      routes.get(route).push(language);
      pages.push({file, language, route});
    }
  }
  await visit(root);
  for (const {file, language, route} of pages) {
      const available = siteLanguages.filter(item => routes.get(route).some(existing => existing.code === item.code));
      let html = await readFile(file, 'utf8');
      html = html.replace(/Sp\.\s*z\.?\s*o\.o\.?/g, 'Sp.z.o.o.');
      html = html.replace(/<div class="lang">[\s\S]*?<\/div>/g, languageMenu(route, language.code, available));
      html = html.replace(/\/assets\/js\/(content|pdf-preview|contact-form)\.js(?:\?v=[^"'\s>]*)?/g, '/assets/js/$1.js?v=languages-20261015');
      html = html.replace(/\/assets\/css\/(arcadian|content)\.css(?:\?v=[^"'\s>]*)?/g, '/assets/css/$1.css?v=languages-20261015');
      if (/data-content-page="(?:gallery|documents|cooperation)"/.test(html)) {
        html = html.replace(/\/assets\/js\/(content|pdf-preview)\.js\?v=[^"'\s>]*/g, '/assets/js/$1.js?v=projects-rates-20261015b');
        html = html.replace(/\/assets\/css\/content\.css\?v=[^"'\s>]*/g, '/assets/css/content.css?v=projects-rates-20261015b');
      }
      html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">/g, '');
      const defaultLanguage = available.find(item => item.code === 'en') || available[0];
      const alternates = available.map(item => `\n  <link rel="alternate" hreflang="${item.code}" href="https://arcadian-eu.com/${item.prefix}${route}">`).join('') + `\n  <link rel="alternate" hreflang="x-default" href="https://arcadian-eu.com/${defaultLanguage.prefix}${route}">`;
      html = html.replace(/<link rel="canonical"[^>]+>/, match => match + alternates);
      await writeFile(file, html);
  }
  const urls = [...routes.keys()].sort().flatMap(route => siteLanguages.filter(language => routes.get(route).some(existing => existing.code === language.code)).map(language => {
    const url = `https://arcadian-eu.com/${language.prefix}${route}`;
    return `  <url><loc>${url}</loc><lastmod>${lastModified.get(url) || new Date().toISOString().slice(0, 10)}</lastmod></url>`;
  }));
  await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
}
