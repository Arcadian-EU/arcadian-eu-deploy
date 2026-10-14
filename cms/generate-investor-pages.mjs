import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';

const root = new URL('../static-site/', import.meta.url);
const release = 'investors-20261015-v5';
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
// Identity, portrait and contacts match the homepage. Team/scope: owner, 2026-10-15.
// KBO/BCE and employer registration are separate planned steps:
// https://business.belgium.be/start-a-business/register-your-business/register-as-a-company
// Career dates: founder's LinkedIn, read 2026-10-15. Collaborations: owner statement.
// KBO confirms identity; it does not establish the commercial relationship.
// Radiance's Schoten entity was confirmed by the owner after the register lookup.
const collaborators = [
  ['Suren Electro', '0747730537', 'SUREN ELECTRO BV'],
  ['Cleys', '0471821955', 'CLEYS BV'],
  ['Radiance Energy', '0536830662', 'RADIANCE BELGIUM NV'],
];
const companyLinks = text => collaborators.reduce((html, [name, number, legalName]) => html.replaceAll(name, `<a href="https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=${number}" target="_blank" rel="noopener noreferrer" title="KBO · ${legalName} · ${number}">${name}</a>`), esc(text));
const copy = {
  en: {
    prefix: '', name: 'Investors', title: 'Electrical design. Construction expertise.',
    description: 'Electrical and plumbing design, electrical installation, PV systems, facades and roofs. Next steps: renovation and property development in Belgium.',
    eyebrow: 'ARCADIAN / FOR INVESTORS', hero: 'Electrical design.', heroAccent: 'Construction expertise.',
    lead: 'We design electrical and plumbing systems. We install electrical and PV systems, complete facades and roofs, and deliver plumbing with subcontractor partners.',
    services: ['Electrical & plumbing design', 'Electrical installation & PV', 'Complete facades & roofs', 'Plumbing with partner teams'],
    work: 'Our work', gallery: 'Completed work is in our gallery. Project drawings will be added.',
    photoAlt: 'Facade installation from the Arcadian work portfolio.', photoCaption: 'Arcadian portfolio · facade installation',
    contact: 'Contact the founder', roadmapLink: 'Roadmap', teamLink: 'Team',
    teamTitle: 'Current delivery team', teamDate: 'As of 15 October 2026',
    team: [['5', 'Facade specialists'], ['3', 'Electricians'], ['2', 'Roofers'], ['6', 'Plumbers · subcontractors']],
    roadmapLabel: 'THE ROADMAP', roadmapTitle: 'Experience. Next steps.', roadmapNote: 'Planned dates. Timing may change.',
    history: [
      ['MAR 2025 – AUG 2026', 'Co-founder', 'TRADE-PASS', 'Co-founded the business and helped develop it. Concluded the role in August 2026 following an ownership transition.'],
      ['AUG 2026', 'Founder', 'ARCADIAN', 'Founder & Managing Director from August 2026. Electrical design, installation and project delivery in Europe.'],
    ],
    stages: [
      ['2026 / Q4', 'Current', 'Arcadian today', 'Earlier work with Suren Electro. Current collaboration with Cleys and Radiance Energy.'],
      ['2027 / Q1', 'Planned', 'Belgian employer', 'KBO/BCE registration and employer registration with RSZ/ONSS.'],
      ['2027 / Q2', 'Planned', 'Complete renovation', 'Take on the full scope: building systems, plumbing, roofs, facades and finishes.'],
      ['2028', 'Planned', 'Land acquisition', 'Acquire land for a development project.'],
      ['2029', 'Planned', 'Build. Sell.', 'Build the property and sell the completed asset.'],
    ],
    founderRole: 'Founder · Design & delivery',
    founderBio: 'I design electrical and plumbing systems and take responsibility for project delivery. Contact me directly.',
    investmentLabel: 'PARTNERSHIP', investmentTitle: 'Interested in investing?',
    investmentText: 'We agree the project, funding, responsibilities and terms in a signed contract.',
    emailLabel: 'Email', whatsappLabel: 'WhatsApp',
    companyLabel: 'Polish limited liability company', addressCountry: 'Poland',
    accountLabel: 'EUR account', testLabel: 'TEST DETAILS', accountNote: 'Placeholder only. Not for transfers.', skip: 'Skip to content',
  },
  nl: {
    prefix: 'nl/', name: 'Investeerders', title: 'Elektrisch ontwerp. Bouwexpertise.',
    description: 'Ontwerp van elektriciteit en sanitair, elektrische installaties, PV, gevels en daken. Volgende stappen: totaalrenovatie en vastgoedontwikkeling in België.',
    eyebrow: 'ARCADIAN / VOOR INVESTEERDERS', hero: 'Elektrisch ontwerp.', heroAccent: 'Bouwexpertise.',
    lead: 'We ontwerpen elektrische en sanitaire systemen. We plaatsen elektrische en PV-installaties, werken gevels en daken volledig af en voeren sanitair uit met onderaannemers.',
    services: ['Elektrisch & sanitair ontwerp', 'Elektrische installaties & PV', 'Volledige gevel- & dakwerken', 'Sanitair met partnerploegen'],
    work: 'Onze werken', gallery: 'Uitgevoerde werken staan in onze galerij. Projecttekeningen volgen.',
    photoAlt: 'Gevelmontage uit het werkportfolio van Arcadian.', photoCaption: 'Arcadian portfolio · gevelmontage',
    contact: 'Contacteer de oprichter', roadmapLink: 'Roadmap', teamLink: 'Team',
    teamTitle: 'Huidige uitvoeringsploeg', teamDate: 'Stand op 15 oktober 2026',
    team: [['5', 'Gevelwerkers'], ['3', 'Elektriciens'], ['2', 'Dakwerkers'], ['6', 'Loodgieters · onderaannemers']],
    roadmapLabel: 'DE ROADMAP', roadmapTitle: 'Ervaring. Volgende stappen.', roadmapNote: 'Geplande termijnen. Timing kan wijzigen.',
    history: [
      ['MRT 2025 – AUG 2026', 'Medeoprichter', 'TRADE-PASS', 'Het bedrijf mee opgericht en ontwikkeld. De rol in augustus 2026 afgerond na een wijziging in de eigendomsstructuur.'],
      ['AUG 2026', 'Oprichter', 'ARCADIAN', 'Oprichter en algemeen directeur sinds augustus 2026. Elektrisch ontwerp, installaties en projectuitvoering in Europa.'],
    ],
    stages: [
      ['2026 / Q4', 'Huidig', 'Arcadian vandaag', 'Eerder werk met Suren Electro. Huidige samenwerking met Cleys en Radiance Energy.'],
      ['2027 / Q1', 'Gepland', 'Belgische werkgever', 'Inschrijving in de KBO/BCE en registratie als werkgever bij de RSZ/ONSS.'],
      ['2027 / Q2', 'Gepland', 'Totaalrenovatie', 'Het volledige werkpakket opnemen: installaties, sanitair, daken, gevels en afwerking.'],
      ['2028', 'Gepland', 'Grond kopen', 'Grond aankopen voor een bouwproject.'],
      ['2029', 'Gepland', 'Bouwen. Verkopen.', 'Het pand bouwen en het afgewerkte vastgoed verkopen.'],
    ],
    founderRole: 'Oprichter · Ontwerp & uitvoering',
    founderBio: 'Ik ontwerp elektrische en sanitaire systemen en neem de verantwoordelijkheid voor de projectuitvoering. Contacteer mij rechtstreeks.',
    investmentLabel: 'SAMENWERKING', investmentTitle: 'Interesse om te investeren?',
    investmentText: 'We leggen het project, de financiering, verantwoordelijkheden en voorwaarden vast in een ondertekend contract.',
    emailLabel: 'E-mail', whatsappLabel: 'WhatsApp',
    companyLabel: 'Poolse vennootschap met beperkte aansprakelijkheid', addressCountry: 'Polen',
    accountLabel: 'EUR-rekening', testLabel: 'TESTGEGEVENS', accountNote: 'Tijdelijke voorbeeldgegevens. Niet voor overschrijvingen.', skip: 'Naar de inhoud',
  },
  pl: {
    prefix: 'pl/', name: 'Inwestorzy', title: 'Projekty elektryczne. Doświadczenie budowlane.',
    description: 'Projekty instalacji elektrycznych i sanitarnych, montaż elektryki, PV, elewacje i dachy. Kolejne etapy: kompleksowe remonty i rozwój nieruchomości w Belgii.',
    eyebrow: 'ARCADIAN / DLA INWESTORÓW', hero: 'Projekty elektryczne.', heroAccent: 'Doświadczenie budowlane.',
    lead: 'Projektujemy instalacje elektryczne i sanitarne. Montujemy elektrykę i systemy PV, wykonujemy całe elewacje i dachy, a prace sanitarne realizujemy z podwykonawcami.',
    services: ['Projekty elektryczne i sanitarne', 'Montaż elektryki i PV', 'Kompletne elewacje i dachy', 'Instalacje sanitarne z partnerami'],
    work: 'Nasze prace', gallery: 'Zrealizowane prace są w naszej galerii. Rysunki projektowe dodamy później.',
    photoAlt: 'Montaż elewacji z portfolio prac Arcadian.', photoCaption: 'Portfolio Arcadian · montaż elewacji',
    contact: 'Kontakt z założycielem', roadmapLink: 'Plan rozwoju', teamLink: 'Zespół',
    teamTitle: 'Obecny zespół wykonawczy', teamDate: 'Stan na 15 października 2026',
    team: [['5', 'Fachowców od elewacji'], ['3', 'Elektryków'], ['2', 'Dekarzy'], ['6', 'Hydraulików · podwykonawcy']],
    roadmapLabel: 'PLAN ROZWOJU', roadmapTitle: 'Doświadczenie. Kolejne etapy.', roadmapNote: 'Planowane terminy. Harmonogram może się zmienić.',
    history: [
      ['III 2025 – VIII 2026', 'Współzałożyciel', 'TRADE-PASS', 'Współtworzenie i rozwój firmy. Zakończenie roli w sierpniu 2026 po zmianie struktury właścicielskiej.'],
      ['VIII 2026', 'Założyciel', 'ARCADIAN', 'Założyciel i dyrektor zarządzający od sierpnia 2026. Projekty elektryczne, montaż i realizacja projektów w Europie.'],
    ],
    stages: [
      ['2026 / Q4', 'Obecnie', 'Arcadian dziś', 'Wcześniejsza współpraca z Suren Electro. Obecnie współpracujemy z Cleys i Radiance Energy.'],
      ['2027 / Q1', 'Planowane', 'Pracodawca w Belgii', 'Wpis do KBO/BCE i rejestracja jako pracodawca w RSZ/ONSS.'],
      ['2027 / Q2', 'Planowane', 'Kompleksowe remonty', 'Pełny zakres prac: instalacje sanitarne i elektryczne, dachy, elewacje oraz wykończenie.'],
      ['2028', 'Planowane', 'Zakup gruntu', 'Zakup gruntu pod projekt budowlany.'],
      ['2029', 'Planowane', 'Budowa. Sprzedaż.', 'Budowa nieruchomości i sprzedaż gotowego obiektu.'],
    ],
    founderRole: 'Założyciel · Projektowanie i realizacja',
    founderBio: 'Projektuję instalacje elektryczne i sanitarne oraz odpowiadam za realizację projektu. Skontaktuj się ze mną bezpośrednio.',
    investmentLabel: 'WSPÓŁPRACA', investmentTitle: 'Chcesz zainwestować?',
    investmentText: 'Projekt, finansowanie, odpowiedzialność i warunki ustalamy w podpisanej umowie.',
    emailLabel: 'E-mail', whatsappLabel: 'WhatsApp',
    companyLabel: 'Polska spółka z ograniczoną odpowiedzialnością', addressCountry: 'Polska',
    accountLabel: 'Rachunek EUR', testLabel: 'DANE TESTOWE', accountNote: 'Tymczasowy przykład. Nie do przelewów.', skip: 'Przejdź do treści',
  },
};

for (const [locale, c] of Object.entries(copy)) {
  // Keep each explanatory block within the owner's requested 180 characters.
  for (const text of [c.description, c.lead, c.gallery, c.roadmapNote, c.founderBio, c.investmentText, c.accountNote, ...c.history.map(stage => stage[3]), ...c.stages.map(stage => stage[3])]) {
    if ([...text].length > 180) throw new Error(`${locale}: block exceeds 180 characters (${[...text].length}): ${text}`);
  }
  const home = await readFile(new URL(`${c.prefix}index.html`, root), 'utf8');
  let nav = home.match(/<nav\b[^>]*id="site-nav"[\s\S]*?<\/nav>/)[0];
  nav = nav.replace(/<div class="nav-links"[\s\S]*?<\/div>/, `<div class="nav-links" id="nav-links"><a href="#expertise">${esc(c.work)}</a><a href="#team">${esc(c.teamLink)}</a><a href="#roadmap">${esc(c.roadmapLink)}</a><a href="/${c.prefix}investors/" class="active" aria-current="page">${esc(c.name)}</a></div>`);
  nav = nav.replace(/<div class="lang">[\s\S]*?<\/div>/, `<div class="lang">${Object.entries(copy).map(([key, value]) => `<a href="/${value.prefix}investors/" lang="${key}" aria-label="${{en: 'English', nl: 'Nederlands', pl: 'Polski'}[key]}"${key === locale ? ' class="on" aria-current="page"' : ''}>${key.toUpperCase()}</a>`).join('')}</div>`);
  nav = nav.replace(/<a class="btn btn-copper btn-sm"[^>]*>[\s\S]*?<\/a>/, `<a class="btn btn-copper btn-sm" href="#partnership">${esc(c.contact)}</a>`);
  nav = nav.replace('id="site-nav"', 'id="site-nav" aria-label="ARCADIAN"');
  nav = nav.replace('aria-controls="nav-links"', 'aria-controls="nav-links" aria-expanded="false"');
  let footer = home.match(/<footer\b[\s\S]*?<\/footer>/)[0];
  footer = footer.replaceAll('href="/investors/"', `href="/${c.prefix}investors/"`);
  const path = `/${c.prefix}investors/`;
  const email = 'mailto:info@arcadian-eu.com?subject=' + encodeURIComponent('Arcadian | Investment partnership');
  const main = `
  <main id="main-content" class="main">
    <header id="expertise" class="inv-hero">
      <div class="inv-wrap inv-hero-grid">
        <div><span class="eyebrow">${esc(c.eyebrow)}</span>
          <h1>${esc(c.hero)}<br><span>${esc(c.heroAccent)}</span></h1>
          <p class="inv-lead">${esc(c.lead)}</p>
          <ul class="inv-services">${c.services.map(text => `<li>${esc(text)}</li>`).join('')}</ul>
          <div class="inv-actions"><a class="btn btn-copper" href="#partnership">${esc(c.contact)} <span aria-hidden="true">↗</span></a><a class="inv-text-link" href="#roadmap">${esc(c.roadmapLink)} <span aria-hidden="true">↓</span></a></div>
          <p class="inv-gallery-note">${esc(c.gallery)}</p>
        </div>
        <figure class="inv-hero-media"><img src="/assets/img/investors/arcadian-facade.webp" alt="${esc(c.photoAlt)}" width="1200" height="1600" fetchpriority="high"><figcaption>${esc(c.photoCaption)}</figcaption></figure>
      </div>
      <section id="team" class="inv-team inv-wrap" aria-labelledby="team-title">
        <div class="inv-team-heading"><h2 id="team-title">${esc(c.teamTitle)}</h2><time datetime="2026-10-15">${esc(c.teamDate)}</time></div>
        <dl>${c.team.map(([count, role]) => `<div><dt>${esc(role)}</dt><dd>${esc(count)}</dd></div>`).join('')}</dl>
      </section>
    </header>
    <section id="roadmap" class="inv-roadmap inv-section blueprint" aria-labelledby="roadmap-title"><div class="inv-wrap">
      <div class="inv-section-heading"><span class="eyebrow">${esc(c.roadmapLabel)}</span><h2 id="roadmap-title">${esc(c.roadmapTitle)}</h2></div>
      <div class="inv-track-heading"><span>2025 — 2029</span><a href="https://www.linkedin.com/in/tony-k-52657a164/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div>
      <ol class="inv-timeline" aria-label="${esc(c.roadmapTitle)}">${[...c.history, ...c.stages].map(([date, status, title, text], i) => `<li${i < c.history.length ? ' class="is-past"' : i === c.history.length ? ' class="is-current"' : ''}><span class="inv-wire" aria-hidden="true"></span><span class="inv-milestone" aria-hidden="true"></span><div class="inv-stage-copy"><span class="inv-stage-date">${esc(date)}</span><span class="inv-status">${esc(status)}</span><h3>${esc(title)}</h3><p>${i === c.history.length ? companyLinks(text) : esc(text)}</p></div></li>`).join('')}</ol>
      <p class="inv-note">${esc(c.roadmapNote)}</p>
    </div></section>
    <section id="partnership" class="inv-contact inv-section" aria-labelledby="partnership-title"><div class="inv-wrap">
      <div class="inv-contact-grid">
        <article class="inv-founder"><img src="/assets/img/team/tony-k.png?v=ae92cf41a42ff6243383db607a632ca00095facf" alt="TONY K." width="800" height="800" loading="lazy"><div><h2>TONY K.</h2><span class="inv-founder-role">${esc(c.founderRole)}</span><p>${esc(c.founderBio)}</p><a class="inv-text-link" href="https://www.linkedin.com/in/tony-k-52657a164/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div></article>
        <div class="inv-investment"><span class="eyebrow">${esc(c.investmentLabel)}</span><h2 id="partnership-title">${esc(c.investmentTitle)}</h2><p>${esc(c.investmentText)}</p><div class="inv-contact-links"><a href="${esc(email)}"><span>${esc(c.emailLabel)}</span>info@arcadian-eu.com <span aria-hidden="true">↗</span></a><a href="https://wa.me/32466495409" target="_blank" rel="noopener noreferrer"><span>${esc(c.whatsappLabel)}</span>+32 466 495 409 <span aria-hidden="true">↗</span></a></div></div>
      </div>
      <div class="inv-company-grid">
        <div class="inv-company"><h3>ARCADIAN Sp. z o.o.</h3><p>${esc(c.companyLabel)}</p><address>ul. Ostrobramska 101/4, 04-041 Warszawa, ${esc(c.addressCountry)}</address><dl><div><dt>KRS</dt><dd>0001242523</dd></div><div><dt>VAT EU</dt><dd>PL1133202795</dd></div><div><dt>REGON</dt><dd>544816335</dd></div></dl></div>
        <div class="inv-account"><div class="inv-account-heading"><h3>${esc(c.accountLabel)}</h3><span>${esc(c.testLabel)}</span></div><code>0000 0000 0000 0000 0000 0000</code><p>${esc(c.accountNote)}</p></div>
      </div>
    </div></section>
  </main>`;
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(c.title)} | ARCADIAN</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="theme-color" content="#0b1020">
  <meta name="arcadian-release" content="${release}">
  <link rel="canonical" href="https://arcadian-eu.com${path}">
${Object.entries(copy).map(([key, value]) => `  <link rel="alternate" hreflang="${key}" href="https://arcadian-eu.com/${value.prefix}investors/">`).join('\n')}
  <link rel="alternate" hreflang="x-default" href="https://arcadian-eu.com/investors/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ARCADIAN">
  <meta property="og:title" content="${esc(c.title)} | ARCADIAN">
  <meta property="og:description" content="${esc(c.description)}">
  <meta property="og:url" content="https://arcadian-eu.com${path}">
  <meta property="og:locale" content="${{en: 'en_GB', nl: 'nl_BE', pl: 'pl_PL'}[locale]}">
  <meta property="og:image" content="https://arcadian-eu.com/assets/img/investors/arcadian-facade-card.webp">
  <meta property="og:image:width" content="960">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="${esc(c.photoAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(c.title)} | ARCADIAN">
  <meta name="twitter:description" content="${esc(c.description)}">
  <meta name="twitter:image" content="https://arcadian-eu.com/assets/img/investors/arcadian-facade-card.webp">
  <link href="/assets/img/icon.svg?v=stars-v2-20260913" rel="icon" type="image/svg+xml">
  <link href="/assets/css/arcadian.css?v=contacts-20261005" rel="stylesheet">
  <link href="/assets/css/legal-footer.css?v=ae92cf41a42ff6243383db607a632ca00095facf" rel="stylesheet">
  <link href="/assets/css/investors.css?v=${release}" rel="stylesheet">
</head>
<body class="index-page investor-page">
  <a class="inv-skip" href="#main-content">${esc(c.skip)}</a>
  ${nav}
${main}
${footer}
  <script src="/assets/js/arcadian.js?v=ae92cf41a42ff6243383db607a632ca00095facf"></script>
  <script src="/assets/js/investors.js?v=${release}"></script>
  <script src="/assets/js/cookie-preferences.js?v=ae92cf41a42ff6243383db607a632ca00095facf"></script>
  <script src="/assets/js/wv-beacon.js" defer></script>
</body>
</html>
`;
  const destination = new URL(`${c.prefix}investors/`, root);
  await mkdir(destination, {recursive: true});
  await writeFile(new URL('index.html', destination), html);
}

// Keep the existing site navigation in its selected language.
async function localizeLinks(directory, prefix = '') {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    if (['assets', 'dist'].includes(entry.name) || entry.name.startsWith('.')) continue;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    const relative = prefix + entry.name;
    if (entry.isDirectory()) { await localizeLinks(file, relative + '/'); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const locale = relative.startsWith('nl/') ? 'nl' : relative.startsWith('pl/') ? 'pl' : 'en';
    if (locale === 'en') continue;
    const original = await readFile(file, 'utf8');
    const updated = original.replace(/<div class="(?:nav-links|ft-col)"[^>]*>[\s\S]*?<\/div>/g, block => block.replaceAll('href="/investors/"', `href="/${locale}/investors/"`));
    if (updated !== original) await writeFile(file, updated);
  }
}
await localizeLinks(root);
console.log('Generated concise investor roadmap in EN, NL and PL; explanatory blocks <= 180 characters.');
