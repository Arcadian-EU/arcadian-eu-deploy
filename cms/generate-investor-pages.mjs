import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';
import {languageMenu, refreshSiteLanguages} from './site-languages.mjs';

const root = new URL('../static-site/', import.meta.url);
const release = 'investors-20261015-v14';
const roadmapAsOf = '2026-10-15';
// Company split follows the owner's approved August 2026 chronology.
const companySplitMonth = '2026-08';
// Calendar anchors are the starts of the displayed periods, not promised completion dates.
const roadmapDates = ['2025-03-01', '2026-08-01', '2026-10-01', '2027-01-01', '2027-04-01', '2028-01-01', '2029-01-01'];
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
// Identity, portrait and contacts match the homepage. Team/scope: owner, 2026-10-15.
// KBO/BCE and employer registration are separate planned steps:
// https://business.belgium.be/start-a-business/register-your-business/register-as-a-company
// Career dates: founder's LinkedIn, read 2026-10-15. Collaborations: owner statement.
// KBO confirms identity; it does not establish the commercial relationship.
// Radiance's Schoten entity was confirmed by the owner after the register lookup.
// Suren Electro belongs to the TRADE-PASS period, as clarified by the owner.
// EUR account and exact beneficiary name supplied/confirmed by the owner, 2026-10-15.
const bankDetails = {beneficiary: 'ARCADIAN Sp. z o.o.', iban: 'LT263250099245830416', bic: 'REVOLT21'};
// Approximate turnover and actual/planned status supplied by the owner, 2026-10-15.
const turnover = [
  {company: 'TRADE-PASS Sp.z.o.o.', period: '2025–2026', amount: 150000, planned: false},
  {company: 'TRADE-PASS Sp.z.o.o.', period: '2026–2027', amount: 250000, planned: false},
  {company: 'ARCADIAN Sp.z.o.o.', period: '2027–2028', amount: 500000, planned: true},
];
const collaborators = [
  ['Suren Electro BV', '0747730537', 'SUREN ELECTRO BV'],
  ['Cleys BV', '0471821955', 'CLEYS BV'],
  ['Radiance Belgium NV', '0536830662', 'RADIANCE BELGIUM NV'],
];
const corporateLinkedIn = 'https://www.linkedin.com/company/arcadian-eu/';
const companyLinks = text => collaborators.reduce((html, [name, number, legalName]) => html.replaceAll(name, `<a href="https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=${number}" target="_blank" rel="noopener noreferrer" title="KBO · ${legalName} · ${number}">${name}</a>`), esc(text));
const copy = {
  en: {
    prefix: '', name: 'Investors', title: 'Construction expertise. Our own software.',
    description: 'Construction work in Belgium and Werfvolt, our software developed in-house for our own teams. Explore ARCADIAN’s experience, team and development plans.',
    eyebrow: 'ARCADIAN / FOR INVESTORS', hero: 'Construction expertise.', heroAccent: 'Our own software.',
    lead: 'We deliver construction work in Belgium and develop Werfvolt in-house — software shaped by the daily work of our own teams.',
    services: ['Facades & roofs', 'Electrical & plumbing design', 'Electrical installation & PV', 'Werfvolt · in-house software'],
    work: 'Our work', gallery: 'Completed work is in our gallery. Project drawings will be added.',
    contact: 'Partnership enquiries', roadmapLink: 'Roadmap', teamLink: 'Team',
    teamTitle: 'Current delivery team', teamDate: 'As of 15 October 2026',
    team: [['2', 'Engineers'], ['5', 'Facade specialists'], ['4', 'Electricians'], ['2', 'Roofers']],
    teamPartners: 'Plumbing · subcontractor partners',
    roadmapLabel: 'THE ROADMAP', roadmapTitle: 'Experience. Next steps.', roadmapNote: 'Planned dates. Timing may change.', nowLabel: 'NOW',
    splitLabel: 'Separate paths', forkLabel: 'Trade-Pass follows a separate path. Arcadian continues along this roadmap.',
    turnoverTitle: 'Turnover · EUR', turnoverNote: 'Approximate figures supplied by the founder.', turnoverActual: 'Achieved', turnoverPlanned: 'Planned',
    history: [
      ['MAR 2025 – AUG 2026', 'Construction', 'TRADE-PASS Sp. z o.o.', 'Construction operations under Trade-Pass, including collaboration with Suren Electro BV.'],
      ['AUG 2026', '', '', ''],
    ],
    stages: [
      ['2026 / Q4', 'Current', 'ARCADIAN Sp. z o.o.', 'Current collaboration with Cleys BV and Radiance Belgium NV.'],
      ['2027 / Q1', 'Planned', 'Belgian employer', 'KBO/BCE registration and employer registration with RSZ/ONSS.'],
      ['2027 / Q2', 'Planned', 'Complete renovation', 'Take on the full scope: building systems, plumbing, roofs, facades and finishes.'],
      ['2028', 'Planned', 'Land acquisition', 'Acquire land for a development project.'],
      ['2029', 'Planned', 'Build. Sell.', 'Build the property and sell the completed asset.'],
    ],
    founderRole: 'Founder · Design & delivery',
    founderBio: 'I design electrical and plumbing systems and take responsibility for project delivery.',
    investmentLabel: 'PARTNERSHIP', investmentTitle: 'A conversation about partnership',
    investmentText: 'We agree the project, funding, responsibilities and terms in a signed contract.',
    emailLabel: 'Email', whatsappLabel: 'WhatsApp',
    companyLabel: 'Polish limited liability company', addressCountry: 'Poland',
    accountLabel: 'EUR account', beneficiaryLabel: 'Beneficiary', accountNote: 'Transfers under a signed agreement.', skip: 'Skip to content',
  },
  nl: {
    prefix: 'nl/', name: 'Investeerders', title: 'Bouwexpertise. Onze eigen software.',
    description: 'Bouwwerkzaamheden in België en Werfvolt, software die we zelf ontwikkelen voor onze eigen teams. Ontdek de ervaring, het team en de plannen van ARCADIAN.',
    eyebrow: 'ARCADIAN / VOOR INVESTEERDERS', hero: 'Bouwexpertise.', heroAccent: 'Onze eigen software.',
    lead: 'We voeren bouwwerkzaamheden uit in België en ontwikkelen zelf Werfvolt — software die voortkomt uit het dagelijkse werk van onze eigen teams.',
    services: ['Gevels & daken', 'Elektrisch & sanitair ontwerp', 'Elektrische installaties & PV', 'Werfvolt · eigen software'],
    work: 'Onze werken', gallery: 'Uitgevoerde werken staan in onze galerij. Projecttekeningen volgen.',
    contact: 'Samenwerking bespreken', roadmapLink: 'Roadmap', teamLink: 'Team',
    teamTitle: 'Huidige uitvoeringsploeg', teamDate: 'Stand op 15 oktober 2026',
    team: [['2', 'Ingenieurs'], ['5', 'Gevelwerkers'], ['4', 'Elektriciens'], ['2', 'Dakwerkers']],
    teamPartners: 'Sanitair · onderaannemers',
    roadmapLabel: 'DE ROADMAP', roadmapTitle: 'Ervaring. Volgende stappen.', roadmapNote: 'Geplande termijnen. Timing kan wijzigen.', nowLabel: 'NU',
    splitLabel: 'Eigen trajecten', forkLabel: 'Trade-Pass volgt een eigen koers. Arcadian gaat verder volgens deze roadmap.',
    turnoverTitle: 'Omzet · EUR', turnoverNote: 'Benaderende cijfers verstrekt door de oprichter.', turnoverActual: 'Gerealiseerd', turnoverPlanned: 'Gepland',
    history: [
      ['MRT 2025 – AUG 2026', 'Bouwactiviteiten', 'TRADE-PASS Sp. z o.o.', 'Bouwwerkzaamheden binnen Trade-Pass, met onder meer een samenwerking met Suren Electro BV.'],
      ['AUG 2026', '', '', ''],
    ],
    stages: [
      ['2026 / Q4', 'Huidig', 'ARCADIAN Sp. z o.o.', 'Huidige samenwerking met Cleys BV en Radiance Belgium NV.'],
      ['2027 / Q1', 'Gepland', 'Belgische werkgever', 'Inschrijving in de KBO/BCE en registratie als werkgever bij de RSZ/ONSS.'],
      ['2027 / Q2', 'Gepland', 'Totaalrenovatie', 'Het volledige werkpakket opnemen: installaties, sanitair, daken, gevels en afwerking.'],
      ['2028', 'Gepland', 'Grond kopen', 'Grond aankopen voor een bouwproject.'],
      ['2029', 'Gepland', 'Bouwen. Verkopen.', 'Het pand bouwen en het afgewerkte vastgoed verkopen.'],
    ],
    founderRole: 'Oprichter · Ontwerp & uitvoering',
    founderBio: 'Ik ontwerp elektrische en sanitaire systemen en neem de verantwoordelijkheid voor de projectuitvoering.',
    investmentLabel: 'SAMENWERKING', investmentTitle: 'Een gesprek over samenwerking',
    investmentText: 'We leggen het project, de financiering, verantwoordelijkheden en voorwaarden vast in een ondertekend contract.',
    emailLabel: 'E-mail', whatsappLabel: 'WhatsApp',
    companyLabel: 'Poolse vennootschap met beperkte aansprakelijkheid', addressCountry: 'Polen',
    accountLabel: 'EUR-rekening', beneficiaryLabel: 'Begunstigde', accountNote: 'Overschrijvingen op basis van een ondertekende overeenkomst.', skip: 'Naar de inhoud',
  },
  pl: {
    prefix: 'pl/', name: 'Inwestorzy', title: 'Doświadczenie budowlane. Własne oprogramowanie.',
    description: 'Prace budowlane w Belgii i Werfvolt — oprogramowanie tworzone przez nas dla własnych zespołów. Poznaj doświadczenie, zespół i plany rozwoju ARCADIAN.',
    eyebrow: 'ARCADIAN / DLA INWESTORÓW', hero: 'Doświadczenie budowlane.', heroAccent: 'Własne oprogramowanie.',
    lead: 'Realizujemy prace budowlane w Belgii i sami tworzymy Werfvolt — oprogramowanie wynikające z codziennej pracy naszych własnych zespołów.',
    services: ['Elewacje i dachy', 'Projekty elektryczne i sanitarne', 'Montaż elektryki i PV', 'Werfvolt · własne oprogramowanie'],
    work: 'Nasze prace', gallery: 'Zrealizowane prace są w naszej galerii. Rysunki projektowe dodamy później.',
    contact: 'Rozmowa o współpracy', roadmapLink: 'Plan rozwoju', teamLink: 'Zespół',
    teamTitle: 'Obecny zespół wykonawczy', teamDate: 'Stan na 15 października 2026',
    team: [['2', 'Inżynierów'], ['5', 'Fachowców od elewacji'], ['4', 'Elektryków'], ['2', 'Dekarzy']],
    teamPartners: 'Instalacje sanitarne · podwykonawcy',
    roadmapLabel: 'PLAN ROZWOJU', roadmapTitle: 'Doświadczenie. Kolejne etapy.', roadmapNote: 'Planowane terminy. Harmonogram może się zmienić.', nowLabel: 'TERAZ',
    splitLabel: 'Osobne kierunki', forkLabel: 'Trade-Pass podąża osobną drogą. Arcadian kontynuuje rozwój zgodnie z tym planem.',
    turnoverTitle: 'Obrót · EUR', turnoverNote: 'Przybliżone kwoty podane przez założyciela.', turnoverActual: 'Osiągnięty', turnoverPlanned: 'Planowany',
    history: [
      ['III 2025 – VIII 2026', 'Budownictwo', 'TRADE-PASS Sp. z o.o.', 'Działalność budowlana w ramach Trade-Pass, w tym współpraca z Suren Electro BV.'],
      ['VIII 2026', '', '', ''],
    ],
    stages: [
      ['2026 / Q4', 'Obecnie', 'ARCADIAN Sp. z o.o.', 'Obecnie współpracujemy z Cleys BV i Radiance Belgium NV.'],
      ['2027 / Q1', 'Planowane', 'Pracodawca w Belgii', 'Wpis do KBO/BCE i rejestracja jako pracodawca w RSZ/ONSS.'],
      ['2027 / Q2', 'Planowane', 'Kompleksowe remonty', 'Pełny zakres prac: instalacje sanitarne i elektryczne, dachy, elewacje oraz wykończenie.'],
      ['2028', 'Planowane', 'Zakup gruntu', 'Zakup gruntu pod projekt budowlany.'],
      ['2029', 'Planowane', 'Budowa. Sprzedaż.', 'Budowa nieruchomości i sprzedaż gotowego obiektu.'],
    ],
    founderRole: 'Założyciel · Projektowanie i realizacja',
    founderBio: 'Projektuję instalacje elektryczne i sanitarne oraz odpowiadam za realizację projektu.',
    investmentLabel: 'WSPÓŁPRACA', investmentTitle: 'Porozmawiajmy o współpracy',
    investmentText: 'Projekt, finansowanie, odpowiedzialność i warunki ustalamy w podpisanej umowie.',
    emailLabel: 'E-mail', whatsappLabel: 'WhatsApp',
    companyLabel: 'Polska spółka z ograniczoną odpowiedzialnością', addressCountry: 'Polska',
    accountLabel: 'Rachunek EUR', beneficiaryLabel: 'Odbiorca', accountNote: 'Przelewy na podstawie podpisanej umowy.', skip: 'Przejdź do treści',
  },
};

copy.de = {
  prefix: 'de/', name: 'Investoren', title: 'Baukompetenz. Unsere eigene Software.',
  description: 'Bauarbeiten in Belgien und Werfvolt, unsere selbst entwickelte Software für die eigenen Teams. Lernen Sie Erfahrung, Team und Entwicklungspläne von ARCADIAN kennen.',
  eyebrow: 'ARCADIAN / FÜR INVESTOREN', hero: 'Baukompetenz.', heroAccent: 'Unsere eigene Software.',
  lead: 'Wir führen Bauarbeiten in Belgien aus und entwickeln Werfvolt selbst — Software, die aus der täglichen Arbeit unserer eigenen Teams entsteht.',
  services: ['Fassaden & Dächer', 'Elektro- und Sanitärplanung', 'Elektroinstallation & PV', 'Werfvolt · eigene Software'],
  work: 'Unsere Arbeiten', gallery: 'Ausgeführte Arbeiten stehen in unserer Galerie. Projektzeichnungen folgen.',
  contact: 'Partnerschaft besprechen', roadmapLink: 'Entwicklungsplan', teamLink: 'Team',
  teamTitle: 'Aktuelles Ausführungsteam', teamDate: 'Stand: 15. Oktober 2026',
  team: [['2', 'Ingenieure'], ['5', 'Fassadenfachkräfte'], ['4', 'Elektriker'], ['2', 'Dachdecker']],
  teamPartners: 'Sanitärarbeiten · Nachunternehmer',
  roadmapLabel: 'ENTWICKLUNGSPLAN', roadmapTitle: 'Erfahrung. Nächste Schritte.', roadmapNote: 'Geplante Termine. Der Zeitplan kann sich ändern.', nowLabel: 'JETZT',
  splitLabel: 'Getrennte Wege', forkLabel: 'Trade-Pass geht einen eigenen Weg. Arcadian setzt diesen Entwicklungsplan fort.',
  turnoverTitle: 'Umsatz · EUR', turnoverNote: 'Ungefähre Angaben des Gründers.', turnoverActual: 'Erzielt', turnoverPlanned: 'Geplant',
  history: [
    ['MÄR 2025 – AUG 2026', 'Bautätigkeit', 'TRADE-PASS Sp. z o.o.', 'Bautätigkeit unter Trade-Pass, einschließlich der Zusammenarbeit mit Suren Electro BV.'],
    ['AUG 2026', '', '', ''],
  ],
  stages: [
    ['2026 / Q4', 'Aktuell', 'ARCADIAN Sp. z o.o.', 'Aktuelle Zusammenarbeit mit Cleys BV und Radiance Belgium NV.'],
    ['2027 / Q1', 'Geplant', 'Arbeitgeber in Belgien', 'Eintragung in die KBO/BCE und Arbeitgeberregistrierung bei RSZ/ONSS.'],
    ['2027 / Q2', 'Geplant', 'Komplettsanierung', 'Den gesamten Leistungsumfang übernehmen: Gebäudetechnik, Sanitär, Dächer, Fassaden und Ausbau.'],
    ['2028', 'Geplant', 'Grundstückskauf', 'Ein Grundstück für ein Bauprojekt erwerben.'],
    ['2029', 'Geplant', 'Bauen. Verkaufen.', 'Die Immobilie bauen und das fertige Objekt verkaufen.'],
  ],
  founderRole: 'Gründer · Planung und Ausführung',
  founderBio: 'Ich plane Elektro- und Sanitäranlagen und verantworte die Projektabwicklung.',
  investmentLabel: 'ZUSAMMENARBEIT', investmentTitle: 'Ein Gespräch über Partnerschaft',
  investmentText: 'Projekt, Finanzierung, Verantwortlichkeiten und Bedingungen vereinbaren wir in einem unterzeichneten Vertrag.',
  emailLabel: 'E-Mail', whatsappLabel: 'WhatsApp', companyLabel: 'Polnische Gesellschaft mit beschränkter Haftung', addressCountry: 'Polen',
  accountLabel: 'EUR-Konto', beneficiaryLabel: 'Empfänger', accountNote: 'Überweisungen auf Grundlage eines unterzeichneten Vertrags.', skip: 'Zum Inhalt',
};

for (const [locale, c] of Object.entries(copy)) {
  // Keep each explanatory block within the owner's requested 180 characters.
  for (const text of [c.description, c.lead, c.gallery, c.teamPartners, c.roadmapNote, c.turnoverNote, c.founderBio, c.investmentText, c.accountNote, ...c.history.map(stage => stage[3]), ...c.stages.map(stage => stage[3])]) {
    if ([...text].length > 180) throw new Error(`${locale}: block exceeds 180 characters (${[...text].length}): ${text}`);
  }
  const home = await readFile(new URL(`${c.prefix}index.html`, root), 'utf8');
  let nav = home.match(/<nav\b[^>]*id="site-nav"[\s\S]*?<\/nav>/)[0];
  nav = nav.replace(/<div class="nav-links"[\s\S]*?<\/div>/, `<div class="nav-links" id="nav-links"><a href="#expertise">${esc(c.work)}</a><a href="#team">${esc(c.teamLink)}</a><a href="#roadmap">${esc(c.roadmapLink)}</a><a href="/${c.prefix}investors/" class="active" aria-current="page">${esc(c.name)}</a></div>`);
  nav = nav.replace(/<div class="lang">[\s\S]*?<\/div>/, languageMenu('investors/', locale));
  nav = nav.replace(/<a class="btn btn-copper btn-sm"[^>]*>[\s\S]*?<\/a>/, `<a class="btn btn-copper btn-sm inv-enquiry" href="#partnership">${esc(c.contact)}</a>`);
  nav = nav.replace('id="site-nav"', 'id="site-nav" aria-label="ARCADIAN"');
  nav = nav.replace('aria-controls="nav-links"', 'aria-controls="nav-links" aria-expanded="false"');
  let footer = home.match(/<footer\b[\s\S]*?<\/footer>/)[0];
  footer = footer.replaceAll('href="/investors/"', `href="/${c.prefix}investors/"`);
  const path = `/${c.prefix}investors/`;
  const email = 'mailto:info@arcadian-eu.com?subject=' + encodeURIComponent('Arcadian | Investment partnership');
  const timeline = [...c.history, ...c.stages].map(([date, status, title, text], i) => {
    const isSplit = roadmapDates[i].startsWith(companySplitMonth);
    const classes = [i < c.history.length ? 'is-past' : i === c.history.length ? 'is-current' : '', isSplit ? 'is-split' : ''].filter(Boolean).join(' ');
    const splitMarker = isSplit ? `<div class="inv-split-marker" role="note" aria-label="${esc(c.splitLabel)}: ${esc(date)}"><span class="inv-now-label">${esc(c.splitLabel)}<time datetime="${companySplitMonth}">${esc(date)}</time></span><span class="inv-now-arrow" aria-hidden="true"></span></div>` : '';
    const splitInline = isSplit ? `<span class="inv-split-inline" aria-hidden="true">${esc(c.splitLabel)} · <time datetime="${companySplitMonth}">${esc(date)}</time></span>` : '';
    const nowInline = i === c.history.length ? `<span class="inv-now-inline" aria-hidden="true">${esc(c.nowLabel)} · <time datetime="${roadmapAsOf}">15.10.2026</time></span>` : '';
    const companyFork = isSplit ? `<div class="inv-company-fork" role="img" aria-label="${esc(c.forkLabel)}"><svg class="inv-fork-horizontal" viewBox="0 0 172 90" preserveAspectRatio="none" aria-hidden="true"><path class="inv-fork-main" d="M0 0H142M136 -4L142 0L136 4"/><path class="inv-fork-separate" d="M0 0C0 28 28 46 50 46H142M136 42L142 46L136 50"/></svg><svg class="inv-fork-vertical" viewBox="0 0 240 76" aria-hidden="true"><path class="inv-fork-main" d="M0 -26V68M-4 62L0 68L4 62"/><path class="inv-fork-separate" d="M0 -26C0 -6 20 30 46 30H210M204 26L210 30L204 34"/></svg><span class="inv-path-main" aria-hidden="true">ARCADIAN</span><span class="inv-path-separate" aria-hidden="true">TRADE-PASS</span></div>` : '';
    const stageCopy = isSplit
      ? `<div class="inv-stage-copy inv-fork-copy"><span class="inv-stage-date">${esc(date)}</span>${splitInline}${nowInline}${companyFork}</div>`
      : `<div class="inv-stage-copy"><span class="inv-stage-date">${esc(date)}</span>${nowInline}<span class="inv-status">${esc(status)}</span><h3>${esc(title)}</h3><p>${companyLinks(text)}</p></div>`;
    return `<li data-roadmap-date="${roadmapDates[i]}"${classes ? ` class="${classes}"` : ''}><span class="inv-wire" aria-hidden="true"></span><span class="inv-milestone" aria-hidden="true"></span>${splitMarker}${stageCopy}</li>`;
  }).join('');
  const main = `
  <main id="main-content" class="main">
    <header id="expertise" class="inv-hero">
      <div class="inv-wrap">
        <div class="inv-hero-copy"><span class="eyebrow">${esc(c.eyebrow)}</span>
          <h1>${esc(c.hero)}<br><span>${esc(c.heroAccent)}</span></h1>
          <p class="inv-lead">${esc(c.lead)}</p>
          <ul class="inv-services">${c.services.map(text => `<li>${esc(text)}</li>`).join('')}</ul>
          <div class="inv-actions"><a class="btn btn-copper inv-enquiry" href="#partnership">${esc(c.contact)} <span aria-hidden="true">↗</span></a><a class="inv-text-link" href="#roadmap">${esc(c.roadmapLink)} <span aria-hidden="true">↓</span></a></div>
          <p class="inv-gallery-note">${esc(c.gallery)}</p>
        </div>
      </div>
      <section id="team" class="inv-team inv-wrap" aria-labelledby="team-title">
        <div class="inv-team-heading"><h2 id="team-title">${esc(c.teamTitle)}</h2><time datetime="2026-10-15">${esc(c.teamDate)}</time></div>
        <dl>${c.team.map(([count, role]) => `<div><dt>${esc(role)}</dt><dd>${esc(count)}</dd></div>`).join('')}</dl>
        <p class="inv-team-partners">${esc(c.teamPartners)}</p>
      </section>
    </header>
    <section id="roadmap" class="inv-roadmap inv-section blueprint" aria-labelledby="roadmap-title"><div class="inv-wrap">
      <div class="inv-section-heading"><span class="eyebrow">${esc(c.roadmapLabel)}</span><h2 id="roadmap-title">${esc(c.roadmapTitle)}</h2></div>
      <div class="inv-track-heading"><span>2025 — 2029</span><a href="${corporateLinkedIn}" target="_blank" rel="noopener noreferrer" aria-label="ARCADIAN · LinkedIn">ARCADIAN · LinkedIn <span aria-hidden="true">↗</span></a></div>
      <div class="inv-roadmap-track">
        <ol class="inv-timeline" aria-label="${esc(c.roadmapTitle)}">${timeline}</ol>
        <div class="inv-now" role="note" aria-label="${esc(c.nowLabel)}: 15.10.2026" data-now-label="${esc(c.nowLabel)}" hidden><span class="inv-now-label">${esc(c.nowLabel)}<time datetime="${roadmapAsOf}">15.10.2026</time></span><span class="inv-now-arrow" aria-hidden="true"></span></div>
      </div>
      <p class="inv-note">${esc(c.roadmapNote)}</p>
      <section class="inv-turnover" aria-labelledby="turnover-title">
        <div class="inv-turnover-heading"><h3 id="turnover-title">${esc(c.turnoverTitle)}</h3><p>${esc(c.turnoverNote)}</p></div>
        <dl>${turnover.map(item => `<div${item.planned ? ' class="is-planned"' : ''}><dt><span class="inv-turnover-company">${esc(item.company)}</span><span class="inv-turnover-period">${esc(item.period)}</span><span class="inv-turnover-status">${esc(item.planned ? c.turnoverPlanned : c.turnoverActual)}</span></dt><dd>≈ ${esc(new Intl.NumberFormat({en: 'en-IE', nl: 'nl-BE', de: 'de-DE', pl: 'pl-PL'}[locale], {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(item.amount))}</dd></div>`).join('')}</dl>
      </section>
    </div></section>
    <section id="partnership" class="inv-contact inv-section" aria-labelledby="partnership-title"><div class="inv-wrap">
      <div class="inv-contact-grid">
        <article class="inv-founder"><span class="av"><img src="/assets/img/team/tony-k.png?v=ae92cf41a42ff6243383db607a632ca00095facf" alt="TONY K." width="800" height="800" loading="lazy"></span><div><h2>TONY K.</h2><span class="inv-founder-role">${esc(c.founderRole)}</span><p>${esc(c.founderBio)}</p><a class="inv-text-link" href="https://www.linkedin.com/in/tony-k-52657a164/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div></article>
        <div class="inv-investment"><span class="eyebrow">${esc(c.investmentLabel)}</span><h2 id="partnership-title">${esc(c.investmentTitle)}</h2><p>${esc(c.investmentText)}</p><div class="inv-contact-links"><a href="${esc(email)}"><span>${esc(c.emailLabel)}</span>info@arcadian-eu.com <span aria-hidden="true">↗</span></a><a href="https://wa.me/32466495409" target="_blank" rel="noopener noreferrer"><span>${esc(c.whatsappLabel)}</span>+32 466 495 409 <span aria-hidden="true">↗</span></a></div></div>
      </div>
      <div class="inv-company-grid">
        <div class="inv-company"><h3>ARCADIAN Sp. z o.o.</h3><p>${esc(c.companyLabel)}</p><address>ul. Ostrobramska 101/4, 04-041 Warszawa, ${esc(c.addressCountry)}</address><dl><div><dt>KRS</dt><dd>0001242523</dd></div><div><dt>VAT EU</dt><dd>PL1133202795</dd></div><div><dt>REGON</dt><dd>544816335</dd></div></dl></div>
        <div class="inv-account"><div class="inv-account-heading"><h3>${esc(c.accountLabel)}</h3></div><dl class="inv-bank-details"><div><dt>${esc(c.beneficiaryLabel)}</dt><dd>${esc(bankDetails.beneficiary)}</dd></div><div><dt>IBAN</dt><dd><code>${esc(bankDetails.iban.match(/.{1,4}/g).join(' '))}</code></dd></div><div><dt>BIC</dt><dd><code>${esc(bankDetails.bic)}</code></dd></div></dl><p>${esc(c.accountNote)}</p></div>
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
  <meta property="og:locale" content="${{en: 'en_GB', nl: 'nl_BE', de: 'de_DE', pl: 'pl_PL'}[locale]}">
  <meta property="og:image" content="https://arcadian-eu.com/assets/img/about/arcadian-logo.png">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">
  <meta property="og:image:alt" content="ARCADIAN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(c.title)} | ARCADIAN">
  <meta name="twitter:description" content="${esc(c.description)}">
  <meta name="twitter:image" content="https://arcadian-eu.com/assets/img/about/arcadian-logo.png">
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
    const locale = relative.startsWith('nl/') ? 'nl' : relative.startsWith('de/') ? 'de' : relative.startsWith('pl/') ? 'pl' : 'en';
    if (locale === 'en') continue;
    const original = await readFile(file, 'utf8');
    const updated = original.replace(/<div class="(?:nav-links|ft-col)"[^>]*>[\s\S]*?<\/div>/g, block => block.replaceAll('href="/investors/"', `href="/${locale}/investors/"`));
    if (updated !== original) await writeFile(file, updated);
  }
}
await localizeLinks(root);
await refreshSiteLanguages(root);
console.log('Generated concise investor roadmap and EN, NL, DE, PL language menus; explanatory blocks <= 180 characters.');
