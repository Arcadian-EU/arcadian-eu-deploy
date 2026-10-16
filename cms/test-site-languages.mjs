import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {refreshSiteLanguages} from './site-languages.mjs';

// Regression: a Dutch-only service must not advertise nonexistent translations.
const fixture = await mkdtemp(join(tmpdir(), 'arcadian-language-test-'));
try {
  for (const route of ['', 'nl/', 'de/', 'pl/', 'nl/gevelwerken/']) {
    await mkdir(join(fixture, route), {recursive:true});
    await writeFile(join(fixture, route, 'index.html'), `<!doctype html><html lang="nl"><head><link rel="canonical" href="https://arcadian-eu.com/${route}"></head><body><div class="lang"></div></body></html>`);
  }
  const root = pathToFileURL(fixture + '/');
  await refreshSiteLanguages(root);
  const service = await readFile(join(fixture, 'nl/gevelwerken/index.html'), 'utf8');
  assert.match(service, /hreflang="nl" href="https:\/\/arcadian-eu.com\/nl\/gevelwerken\/"/);
  assert.match(service, /hreflang="x-default" href="https:\/\/arcadian-eu.com\/nl\/gevelwerken\/"/);
  assert.doesNotMatch(service, /hreflang="(?:en|de|pl)"/);
  assert.doesNotMatch(service, /href="\/(?:de|pl)?\/?gevelwerken\/"/);
  const sitemap = await readFile(join(fixture, 'sitemap.xml'), 'utf8');
  assert.equal([...sitemap.matchAll(/<url>/g)].length, 5);
  assert.equal([...sitemap.matchAll(/gevelwerken\//g)].length, 1);
  const home = await readFile(join(fixture, 'index.html'), 'utf8');
  for (const code of ['en','nl','de','pl']) assert.match(home, new RegExp(`hreflang="${code}"`));
  await refreshSiteLanguages(root);
  assert.equal(await readFile(join(fixture, 'nl/gevelwerken/index.html'), 'utf8'), service);
  assert.equal(await readFile(join(fixture, 'sitemap.xml'), 'utf8'), sitemap);
  console.log('PASS: existing translations, Dutch-only service, truthful sitemap, idempotent generation.');
} finally { await rm(fixture, {recursive:true,force:true}); }
