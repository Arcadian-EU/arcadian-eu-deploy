(async function () {
  'use strict';
  const scriptURL = document.currentScript.src;
  const root = document.querySelector('[data-content-page]');
  if (!root) return;
  const locale = ['en', 'nl', 'de', 'pl'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
  const messages = {
    en: {all: 'All work', finishing: 'Finishing & renovation', facades: 'Facades', electrical: 'Electrical', loading: 'Loading…', unavailable: 'The portfolio is temporarily unavailable. Please contact us for project references.', empty: 'Project photographs will appear here after publication.', emptyRates: 'Contact us for current opportunities and cooperation terms.', more: 'Show more', photos: 'View photographs', close: 'Close', previous: 'Previous photograph', next: 'Next photograph', of: 'of', employee: 'Employee', independent: 'Independent specialist', crew: 'Independent crew', ownVehicle: 'Own vehicle', ownTools: 'Own tools', payroll_gross: 'Salary before deductions', invoice_ex_vat: 'Invoice, excluding VAT', hour_person: 'hour / person', day_person: 'day / person', hour_crew: 'hour / crew', m2: 'm²', m: 'metre', unit: 'unit', fixed: 'agreed scope', from: 'from'},
    pl: {all: 'Wszystkie prace', finishing: 'Wykończenia i renowacje', facades: 'Elewacje', electrical: 'Elektryka', loading: 'Ładowanie…', unavailable: 'Portfolio jest chwilowo niedostępne. Skontaktuj się z nami w sprawie realizacji.', empty: 'Zdjęcia realizacji pojawią się tutaj po publikacji.', emptyRates: 'Skontaktuj się z nami, aby poznać aktualne możliwości i warunki współpracy.', more: 'Pokaż więcej', photos: 'Zobacz zdjęcia', close: 'Zamknij', previous: 'Poprzednie zdjęcie', next: 'Następne zdjęcie', of: 'z', employee: 'Pracownik etatowy', independent: 'Samodzielny specjalista', crew: 'Samodzielna brygada', ownVehicle: 'Własny samochód', ownTools: 'Własne narzędzia', payroll_gross: 'Wynagrodzenie brutto', invoice_ex_vat: 'Faktura, bez VAT', hour_person: 'godzina / osoba', day_person: 'dzień / osoba', hour_crew: 'godzina / brygada', m2: 'm²', m: 'metr', unit: 'jednostka', fixed: 'uzgodniony zakres', from: 'od'},
    nl: {all: 'Alle werken', finishing: 'Afwerking & renovatie', facades: 'Gevels', electrical: 'Elektriciteit', loading: 'Laden…', unavailable: 'Het portfolio is tijdelijk niet beschikbaar. Neem contact op voor projectreferenties.', empty: 'Projectfoto’s verschijnen hier na publicatie.', emptyRates: 'Neem contact op voor actuele mogelijkheden en samenwerkingsvoorwaarden.', more: 'Meer tonen', photos: 'Foto’s bekijken', close: 'Sluiten', previous: 'Vorige foto', next: 'Volgende foto', of: 'van', employee: 'Werknemer', independent: 'Zelfstandig specialist', crew: 'Zelfstandige ploeg', ownVehicle: 'Eigen voertuig', ownTools: 'Eigen gereedschap', payroll_gross: 'Brutoloon', invoice_ex_vat: 'Factuur, exclusief btw', hour_person: 'uur / persoon', day_person: 'dag / persoon', hour_crew: 'uur / ploeg', m2: 'm²', m: 'meter', unit: 'eenheid', fixed: 'afgesproken omvang', from: 'vanaf'},
  };
  messages.de = {all: 'Alle Arbeiten', finishing: 'Ausbau und Sanierung', facades: 'Fassaden', electrical: 'Elektrotechnik', loading: 'Wird geladen…', unavailable: 'Das Portfolio ist vorübergehend nicht verfügbar. Bitte kontaktieren Sie uns für Projektreferenzen.', empty: 'Projektfotos erscheinen hier nach ihrer Veröffentlichung.', emptyRates: 'Kontaktieren Sie uns zu aktuellen Möglichkeiten und Bedingungen der Zusammenarbeit.', more: 'Mehr anzeigen', photos: 'Fotos ansehen', close: 'Schließen', previous: 'Vorheriges Foto', next: 'Nächstes Foto', of: 'von', employee: 'Mitarbeiter', independent: 'Selbstständige Fachkraft', crew: 'Selbstständiges Team', ownVehicle: 'Eigenes Fahrzeug', ownTools: 'Eigenes Werkzeug', payroll_gross: 'Bruttogehalt', invoice_ex_vat: 'Rechnung ohne Umsatzsteuer', hour_person: 'Stunde / Person', day_person: 'Tag / Person', hour_crew: 'Stunde / Team', m2: 'm²', m: 'Meter', unit: 'Einheit', fixed: 'vereinbarter Umfang', from: 'ab'};
  const t = messages[locale];
  Object.assign(t, {
    en: {subcontractors: 'Subcontractor crews', viewPDF: 'View PDF', downloadPDF: 'Download PDF', pages: 'pages', effective: 'Effective from', documentsUnavailable: 'Rate documents are temporarily unavailable. Please contact Arcadian.'},
    pl: {subcontractors: 'Brygady podwykonawcze', viewPDF: 'Przeglądaj PDF', downloadPDF: 'Pobierz PDF', pages: 'str.', effective: 'Obowiązuje od', documentsUnavailable: 'Dokumenty z cennikami są chwilowo niedostępne. Skontaktuj się z Arcadian.'},
    nl: {subcontractors: 'Onderaannemersploegen', viewPDF: 'Bekijk PDF', downloadPDF: 'Download PDF', pages: 'pagina’s', effective: 'Geldig vanaf', documentsUnavailable: 'Tariefdocumenten zijn tijdelijk niet beschikbaar. Neem contact op met Arcadian.'},
    de: {subcontractors: 'Nachunternehmerteams', viewPDF: 'PDF ansehen', downloadPDF: 'PDF herunterladen', pages: 'Seiten', effective: 'Gültig ab', documentsUnavailable: 'Die Preisblätter sind vorübergehend nicht verfügbar. Bitte kontaktieren Sie Arcadian.'},
  }[locale]);
  const plural = new Intl.PluralRules(locale);
  const photoWords = {en: {one: 'photo', other: 'photos'}, nl: {one: 'foto', other: 'foto’s'}, de: {one: 'Foto', other: 'Fotos'}, pl: {one: 'zdjęcie', few: 'zdjęcia', many: 'zdjęć', other: 'zdjęcia'}}[locale];
  const status = root.querySelector('[data-content-status]');
  const list = root.querySelector('[data-content-list]');
  const more = root.querySelector('[data-content-more]');
  const type = root.dataset.contentPage;
  if (type === 'cooperation') return;
  const caseStudies = type === 'gallery' ? (await import(new URL('project-cases.js', scriptURL))).caseStudies : {};
  const workerRateSheet = type === 'documents' ? (await import(new URL('worker-rate-sheet.js', scriptURL))).workerRateSheet : null;
  const isDocument = type === 'documents';
  const isRate = type === 'rates' || isDocument;
  let cms;
  try {
    cms = new URL(window.ARCADIAN_CMS_URL);
    if (cms.protocol !== 'https:' && !(cms.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(cms.hostname))) throw new Error('Invalid CMS endpoint.');
    if (cms.username || cms.password || cms.search || cms.hash) throw new Error('Invalid CMS endpoint.');
  } catch (_) {
    status.textContent = isRate ? t.emptyRates : t.empty;
    return;
  }
  // Exact-source fallbacks for the current published portfolio; edited/new CMS copy stays intact.
  const germanPortfolio = {
    'Electrical distribution & cable management': 'Elektroverteilung und Kabelführung',
    'Distribution-cabinet wiring, terminal connections and cable containment. Overall views followed by installation details.': 'Verdrahtung von Verteilerschränken, Klemmenanschlüsse und Kabelführung. Gesamtansichten und anschließende Montagedetails.',
    'Commercial facade installation': 'Fassadenmontage an einem Gewerbegebäude',
    'External timber facade structure on a commercial building. Building views and installation work at height.': 'Äußere Holzfassadenkonstruktion an einem Gewerbegebäude. Gebäudeansichten und Montagearbeiten in der Höhe.',
    'Commercial lighting & cable routes': 'Beleuchtung und Kabeltrassen in Gewerberäumen',
    'Linear lighting, overhead cable containment and service routes in commercial interiors. Views from installation stages.': 'Lineare Beleuchtung, abgehängte Kabeltrassen und Leitungswege in Gewerberäumen. Einblicke in die Montagephasen.',
    'Residential distribution board': 'Elektroverteiler im Wohngebäude',
    'Circuit protection, control modules and structured internal wiring. Assembly and installation views.': 'Stromkreisabsicherung, Steuermodule und strukturierte interne Verdrahtung. Ansichten von Aufbau und Installation.',
    'Electrical metering room': 'Elektrozählerraum',
    'Grouped electricity meters, incoming cables and cable trays in a technical room. Overall and connection views.': 'Gruppierte Stromzähler, Zuleitungen und Kabeltrassen in einem Technikraum. Gesamtansichten und Anschlussdetails.',
    'Underground cable infrastructure': 'Unterirdische Kabelinfrastruktur',
    'Cable ducts and service routes on a commercial construction site. Installation views before backfilling.': 'Kabelschutzrohre und Leitungswege auf einer Gewerbebaustelle. Montageansichten vor dem Verfüllen.',
    'Light brick facade': 'Helle Ziegelfassade',
    'Light brick masonry, full-height glazing and the junction beneath a concrete canopy.': 'Helles Ziegelmauerwerk, raumhohe Verglasung und Anschluss unter einem Betonvordach.',
    'Terrace waterproofing': 'Terrassenabdichtung',
    'Terrace membrane, wall upstands and corner junctions during installation. General view and construction details.': 'Abdichtungsbahn, Wandanschlüsse und Eckanschlüsse einer Terrasse während der Ausführung. Gesamtansicht und Konstruktionsdetails.',
    'Assembled distribution board with circuit protection and control modules.': 'Montierter Verteiler mit Stromkreisabsicherung und Steuermodulen.',
    'Cable entry and containment above the electrical equipment.': 'Kabeleinführung und Kabelführung über der elektrischen Ausrüstung.',
    'Cable-duct installation along the site service route.': 'Verlegung von Kabelschutzrohren entlang der Leitungstrasse auf der Baustelle.',
    'Close-up of the wall junction.': 'Detailansicht des Wandanschlusses.',
    'Commercial building with the external timber facade structure during construction.': 'Gewerbegebäude mit äußerer Holzfassadenkonstruktion während der Bauarbeiten.',
    'Corner and parapet junction.': 'Eck- und Attikaanschluss.',
    'Distribution cabinet: organised conductor routing and terminal connections.': 'Verteilerschrank: geordnete Leiterführung und Klemmenanschlüsse.',
    'Distribution-board installation and internal wiring.': 'Montage und interne Verdrahtung eines Elektroverteilers.',
    'Electrical equipment and vertical cable routes in the technical room.': 'Elektrische Ausrüstung und vertikale Kabeltrassen im Technikraum.',
    'Facade and full-height glazing.': 'Fassade und raumhohe Verglasung.',
    'Facade installation using an elevating work platform.': 'Fassadenmontage mit einer Hubarbeitsbühne.',
    'General view of the side facade.': 'Gesamtansicht der Seitenfassade.',
    'Glazing beneath the concrete canopy.': 'Verglasung unter dem Betonvordach.',
    'Grouped electricity meters and vertical cable routes.': 'Gruppierte Stromzähler und vertikale Kabeltrassen.',
    'Installation detail at the external timber structure.': 'Montagedetail an der äußeren Holzkonstruktion.',
    'Internal cable management and connection detail.': 'Interne Kabelführung und Anschlussdetail.',
    'Lighting and service routes around the structural columns.': 'Beleuchtung und Leitungswege um die Tragstützen.',
    'Lighting and service-route detail beside the window.': 'Detail von Beleuchtung und Leitungsweg neben dem Fenster.',
    'Linear lighting and overhead services: general interior view.': 'Lineare Beleuchtung und Deckeninstallationen: Gesamtansicht des Innenraums.',
    'Linear luminaires and overhead cable containment.': 'Lineare Leuchten und abgehängte Kabelführung.',
    'Masonry junction beneath the canopy.': 'Mauerwerksanschluss unter dem Vordach.',
    'Membrane at the end wall.': 'Abdichtungsbahn an der Abschlusswand.',
    'Overall view of the building and the construction site.': 'Gesamtansicht von Gebäude und Baustelle.',
    'Overall view of the metering installation and cable containment.': 'Gesamtansicht der Zähleranlage und Kabelführung.',
    'Overall view of the open distribution cabinet.': 'Gesamtansicht des geöffneten Verteilerschranks.',
    'Terminal blocks and conductor routing inside the cabinet.': 'Klemmenblöcke und Leiterführung im Schrank.',
    'Underground service routes during installation.': 'Unterirdische Leitungswege während der Verlegung.',
  };
  const translatePortfolio = value => locale === 'de' ? germanPortfolio[value] || value : value;
  Object.assign(germanPortfolio, {
    'Rendered residential facades': 'Verputzte Wohnhausfassaden',
    'Selected residential facade work: smooth render, window reveals, entrance details and rainwater junctions. Overall views and finishing details from different projects.': 'Ausgewählte Fassadenarbeiten an Wohngebäuden: glatter Putz, Fensterlaibungen, Eingangsdetails und Regenwasseranschlüsse. Gesamtansichten und Ausführungsdetails verschiedener Projekte.',
    'Timber cladding & facade insulation': 'Holzverkleidung und Fassadendämmung',
    'Timber-clad gable and facade insulation during renovation. Overall view and installation detail from the same building.': 'Holzverkleideter Giebel und Fassadendämmung während einer Sanierung. Gesamtansicht und Montagedetail desselben Gebäudes.',
    'Commercial electrical design': 'Elektroplanung für Gewerbegebäude',
    'Selected drawing excerpts: workshop power layout, cable routes and single-line diagrams for distribution boards. Circuit protection, cable sizing and equipment connections.': 'Ausgewählte Zeichnungsausschnitte: Werkstatt-Stromversorgungsplan, Kabelwege und einpolige Schaltpläne der Verteiler. Stromkreisabsicherung, Kabeldimensionierung und Geräteanschlüsse.',
    'Lighting, controls & power design': 'Licht-, Steuerungs- und Stromversorgungsplanung',
    'Selected drawing excerpts: DALI lighting and control groups, socket-outlet layouts and the main single-line diagram. Coordinated plans and circuit references.': 'Ausgewählte Zeichnungsausschnitte: DALI-Beleuchtung und Steuergruppen, Steckdosenpläne und der Hauptstromlaufplan. Abgestimmte Pläne und Stromkreisreferenzen.',
    'Smooth rendered facade, large glazing and external stair junctions.': 'Glatt verputzte Fassade, große Verglasung und Anschlüsse der Außentreppe.',
    'Rendered street facade with recessed entrance and window reveals.': 'Verputzte Straßenfassade mit zurückgesetztem Eingang und Fensterlaibungen.',
    'Rear facade: render finish, openings and plinth junction.': 'Rückfassade: Putzoberfläche, Öffnungen und Sockelanschluss.',
    'Rendered entrance facade between existing brick elevations.': 'Verputzte Eingangsfassade zwischen bestehenden Ziegelfassaden.',
    'Coloured render, roof edge and rainwater downpipe junction.': 'Farbiger Putz, Dachrand und Regenfallrohranschluss.',
    'Overall view of the timber-clad gable and renovated facade.': 'Gesamtansicht des holzverkleideten Giebels und der sanierten Fassade.',
    'Facade insulation and timber cladding during installation.': 'Fassadendämmung und Holzverkleidung während der Montage.',
    'Workshop power and cable routes': 'Stromversorgung und Kabelwege der Werkstatt',
    'Main distribution: circuits and protection': 'Hauptverteilung: Stromkreise und Schutz',
    'Distribution: equipment and auxiliary services': 'Verteilung: Geräte und Nebenanlagen',
    'DALI lighting layout and control groups': 'DALI-Beleuchtungsplan und Steuergruppen',
    'Socket outlets and power distribution layout': 'Steckdosen- und Stromversorgungsplan',
    'Single-line diagram: distribution and protection': 'Einpoliger Schaltplan: Verteilung und Schutz',
  });
  const portfolioLabels = {
    en: {design: 'Electrical design', drawings: 'drawings', view: 'View drawing set', download: 'Download PDF', open: 'View album', sheets: '3 sheets'},
    nl: {design: 'Elektrisch ontwerp', drawings: 'tekeningen', view: 'Tekeningen bekijken', download: 'PDF downloaden', open: 'Album bekijken', sheets: '3 bladen'},
    pl: {design: 'Projektowanie elektryczne', drawings: 'rysunki', view: 'Zobacz rysunki', download: 'Pobierz PDF', open: 'Zobacz album', sheets: '3 arkusze'},
    de: {design: 'Elektroplanung', drawings: 'Zeichnungen', view: 'Zeichnungen ansehen', download: 'PDF herunterladen', open: 'Album ansehen', sheets: '3 Blätter'},
  }[locale];
  const drawingSets = {
    'f3bf65da-eba8-50fd-8721-08cbfdc13ef9': '/assets/portfolio/commercial-electrical-design.pdf',
    'a12be92a-3a72-5f9a-923e-796b9a03c3d0': '/assets/portfolio/lighting-power-design.pdf',
  };
  const projectLabels = {
    en: {open: 'View project', installation: 'On site', documentation: 'Plans & diagrams', before: 'Before', during: 'Installation', result: 'Result', selected: 'Project documentation', enlarge: 'Enlarge photograph', drawing: 'View PDF', credit: 'Drawing by', photos: 'Installation photographs'},
    nl: {open: 'Project bekijken', installation: 'Op de werf', documentation: 'Plannen & schema’s', before: 'Vooraf', during: 'Uitvoering', result: 'Resultaat', selected: 'Projectdocumentatie', enlarge: 'Foto vergroten', drawing: 'PDF bekijken', credit: 'Tekening van', photos: 'Foto’s van de installatie'},
    de: {open: 'Projekt ansehen', installation: 'Auf der Baustelle', documentation: 'Pläne & Schaltbilder', before: 'Vorher', during: 'Ausführung', result: 'Ergebnis', selected: 'Projektdokumentation', enlarge: 'Foto vergrößern', drawing: 'PDF ansehen', credit: 'Zeichnung von', photos: 'Fotos der Installation'},
    pl: {open: 'Zobacz projekt', installation: 'Na budowie', documentation: 'Plany i schematy', before: 'Przed pracami', during: 'Montaż', result: 'Efekt', selected: 'Dokumentacja projektu', enlarge: 'Powiększ zdjęcie', drawing: 'Zobacz PDF', credit: 'Autor rysunku', photos: 'Zdjęcia instalacji'},
  }[locale];
  const drawingWords = {en: {one: 'drawing', other: 'drawings'}, nl: {one: 'tekening', other: 'tekeningen'}, de: {one: 'Zeichnung', other: 'Zeichnungen'}, pl: {one: 'rysunek', few: 'rysunki', many: 'rysunków', other: 'rysunku'}}[locale];
  const count = (amount, words) => `${amount} ${words[plural.select(amount)] || words.other}`;
  const text = (row, field) => {
    const copy = caseStudies[row.id]?.copy;
    const fallback = copy?.en[field] === row[field] ? copy[locale]?.[field] : undefined;
    return String((locale !== 'en' && row[`${field}_${locale}`]) || fallback || translatePortfolio(row[field]) || '');
  };
  const photoCaption = (project, photo) => {
    const study = caseStudies[project.id];
    const copy = study?.captions[photo.id];
    const caption = (copy?.en === photo.description && copy[locale]) || text(photo, 'description') || text(project, 'title');
    const stage = study?.stages?.find(item => item.photos.includes(photo.id));
    return stage ? `${projectLabels[stage.key]} / ${caption}` : caption;
  };
  const element = (tag, className, value) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  };
  if (isDocument) {
    list.classList.add('document-grid');
    const intro = element('div', 'documents-intro');
    intro.lang = locale === 'de' ? 'de' : 'en';
    intro.append(element('h2', '', locale === 'de' ? 'Aktuelle Preisblätter' : 'Current rate sheets'), element('p', '', locale === 'de' ? 'Die Hauptfassung ist auf Englisch. Übersetzungen sind als separate Anlagen verfügbar.' : 'English is the main version. Translations are available as separate attachments.'));
    status.before(intro);
  }
  const fileId = (id) => typeof id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id);
  const asset = (id, size) => new URL(`api/images/${id}/?size=${size}`, cms.href.replace(/\/?$/, '/')).href;
  const message = (value) => {status.textContent = value; status.hidden = !value;};
  let controller;
  let page = 1;
  let sector = root.dataset.contentSector || new URLSearchParams(location.search).get('sector') || '';
  if (!['finishing', 'facades', 'electrical', ...(isDocument ? ['subcontractors'] : [])].includes(sector)) sector = '';

  function projectCard(project) {
    const card = element('article', 'work-card');
    const drawingURL = drawingSets[project.id];
    const study = caseStudies[project.id];
    const documents = study?.documents || [];
    if (drawingURL) card.classList.add('work-card--drawing');
    const photographs = (project.photos || []).filter((file) => file && fileId(file.id));
    if (photographs.length) {
      const open = element('button', 'work-photo');
      open.type = 'button';
      open.setAttribute('aria-label', `${study ? projectLabels.open : drawingURL ? portfolioLabels.design : t.photos}: ${text(project, 'title')}`);
      open.setAttribute('aria-haspopup', 'dialog');
      const photo = study?.coverPhotos?.map(id => photographs.find(item => item.id === id)).find(Boolean) || photographs[0];
      const image = element('img');
      image.src = asset(photo.id, 'card');
      image.srcset = `${asset(photo.id, 'small')} 480w, ${asset(photo.id, 'card')} 960w`;
      image.sizes = '(max-width: 620px) 100vw, (max-width: 960px) 50vw, 33vw';
      image.alt = photoCaption(project, photo);
      image.width = 960; image.height = 720;
      image.loading = 'lazy'; image.decoding = 'async';
      open.append(image);
      open.append(element('span', 'work-count', count(photographs.length, drawingURL ? drawingWords : photoWords)));
      open.addEventListener('click', event => openProject(project, photographs, event.currentTarget));
      card.append(open);
    }
    const body = element('div', 'work-body');
    body.append(element('span', 'eyebrow', drawingURL ? portfolioLabels.design : t[project.category] || ''), element('h2', '', text(project, 'title')));
    const meta = [project.location, project.completed_year].filter(Boolean).join(' · ');
    if (meta) body.append(element('p', 'work-meta', meta));
    body.append(element('p', 'work-description', text(project, 'description')));
    const actions = element('div', 'work-actions');
    if (study) {
      const open = element('button', 'work-open', `${projectLabels.open} →`);
      open.type = 'button';
      open.setAttribute('aria-haspopup', 'dialog');
      open.addEventListener('click', event => openProject(project, photographs, event.currentTarget));
      actions.append(open);
      if (documents.length) {
        const download = element('a', 'work-download', 'PDF ↓');
        download.href = documents[0].url;
        download.download = `${study.key}-drawings.pdf`;
        download.setAttribute('aria-label', `${portfolioLabels.download}: ${text(project, 'title')}`);
        actions.append(download);
      }
    } else if (drawingURL) {
      const view = element('button', 'work-open', `${portfolioLabels.view} →`);
      view.type = 'button';
      view.setAttribute('aria-haspopup', 'dialog');
      view.addEventListener('click', event => window.ARCADIAN_PDF_PREVIEW.open({url: new URL(drawingURL, location.origin).href, title: text(project, 'title'), meta: `PDF · ${portfolioLabels.sheets}`, language: locale}, event.currentTarget));
      const download = element('a', 'work-download', 'PDF ↓');
      download.href = drawingURL;
      download.download = drawingURL.split('/').pop();
      download.setAttribute('aria-label', `${portfolioLabels.download}: ${text(project, 'title')}`);
      actions.append(view, download);
    } else if (photographs.length) {
      const open = element('button', 'work-open', `${portfolioLabels.open} →`);
      open.type = 'button';
      open.setAttribute('aria-haspopup', 'dialog');
      open.addEventListener('click', event => openProject(project, photographs, event.currentTarget));
      actions.append(open);
    }
    body.append(actions);
    card.append(body);
    return card;
  }

  function openProject(project, photographs, trigger) {
    const study = caseStudies[project.id] || {};
    const drawingsOnly = Boolean(drawingSets[project.id]);
    const documents = study.documents || (drawingsOnly ? [{url:drawingSets[project.id],pageCount:photographs.length,previews:[]}] : []);
    const dialog = element('dialog', 'project-dialog');
    dialog.setAttribute('aria-labelledby', 'project-detail-title');
    const header = element('div', 'project-header');
    const heading = element('div');
    heading.append(element('span', 'eyebrow', t[project.category] || ''));
    const title = element('h2', '', text(project, 'title'));
    title.id = 'project-detail-title';
    const meta = [study.reference, project.location].filter(Boolean).join(' · ');
    heading.append(title);
    if (meta) heading.append(element('p', 'work-meta', meta));
    const close = element('button', 'project-close', `${t.close} ×`);
    close.type = 'button';
    close.autofocus = true;
    close.addEventListener('click', () => dialog.close());
    header.append(heading, close);
    const intro = element('p', 'project-intro', text(project, 'description'));
    const photoCount = element('h3', 'project-section-title', count(photographs.length, drawingsOnly ? drawingWords : photoWords));
    const photosPanel = element('div', 'project-photos');
    const docsPanel = element('div', 'project-panel project-documents');
    photographs.forEach((photo, index) => {
      const figure = element('figure', 'project-figure');
      const open = element('button', 'project-photo');
      open.type = 'button';
      open.setAttribute('aria-label', `${drawingsOnly ? projectLabels.drawing : projectLabels.enlarge}: ${photoCaption(project, photo)}`);
      open.setAttribute('aria-haspopup', 'dialog');
      const image = element('img');
      image.src = asset(photo.id, 'card');
      image.srcset = `${asset(photo.id, 'small')} 480w, ${asset(photo.id, 'card')} 960w`;
      image.sizes = '(max-width: 720px) 50vw, 25vw';
      image.alt = photoCaption(project, photo);
      image.width = photo.width; image.height = photo.height;
      image.loading = 'lazy'; image.decoding = 'async';
      open.append(image, element('span', 'project-enlarge', '↗'));
      open.addEventListener('click', event => drawingsOnly ? window.ARCADIAN_PDF_PREVIEW.open({url:new URL(drawingSets[project.id],location.origin).href,title:text(project,'title'),meta:`PDF · ${count(photographs.length,drawingWords)}`,language:locale,initialPage:index+1},event.currentTarget) : openPhotos(project, photographs, index));
      const caption = element('figcaption', '', `${String(index + 1).padStart(2, '0')} / ${photoCaption(project, photo)}`);
      caption.title = photoCaption(project, photo);
      figure.append(open, caption);
      photosPanel.append(figure);
    });
    for (const document of documents) {
      const summary = element('div', 'project-document-summary');
      const info = element('div');
      info.append(element('span', 'eyebrow', projectLabels.selected), element('p', 'work-meta', `PDF · ${count(document.pageCount, drawingWords)}`));
      if (document.credit) info.append(element('p', 'project-credit', `${projectLabels.credit}: ${document.credit}`));
      const actions = element('div', 'project-document-actions');
      const previewPDF = (event, initialPage = 1) => window.ARCADIAN_PDF_PREVIEW.open({url: new URL(document.url, location.origin).href, title: text(project, 'title'), meta: `PDF · ${count(document.pageCount, drawingWords)}`, language: locale, initialPage}, event.currentTarget);
      const view = element('button', 'btn btn-copper', projectLabels.drawing);
      view.type = 'button';
      view.setAttribute('aria-haspopup', 'dialog');
      view.addEventListener('click', previewPDF);
      const download = element('a', 'work-download', `${portfolioLabels.download} ↓`);
      download.href = document.url; download.download = `${study.key || 'project'}-drawings.pdf`;
      actions.append(view, download); summary.append(info, actions); docsPanel.append(summary);
      const previews = element('div', 'project-drawing-grid');
      document.previews.forEach((preview, index) => {
        const figure = element('figure', 'project-figure');
        const open = element('button', 'project-drawing');
        open.type = 'button';
        const caption = preview.caption[locale] || preview.caption.en;
        open.setAttribute('aria-label', `${projectLabels.drawing}: ${caption}`);
        open.setAttribute('aria-haspopup', 'dialog');
        const image = element('img');
        image.src = preview.url; image.alt = caption; image.loading = 'lazy';
        open.append(image, element('span', 'project-enlarge', '↗'));
        open.addEventListener('click', event => previewPDF(event, index + 1));
        figure.append(open, element('figcaption', '', `${String(index + 1).padStart(2, '0')} / ${caption}`));
        previews.append(figure);
      });
      if (document.previews.length) docsPanel.append(previews);
    }
    dialog.append(header, intro, photoCount, photosPanel);
    if (documents.length) dialog.append(docsPanel);
    document.body.append(dialog);
    const overflow = {html: document.documentElement.style.overflow, body: document.body.style.overflow};
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = overflow.html;
      document.body.style.overflow = overflow.body;
      dialog.remove();
      if (trigger?.isConnected) trigger.focus({preventScroll: true});
    }, {once: true});
    dialog.showModal();
    document.documentElement.style.overflow = document.body.style.overflow = 'hidden';
  }

  function openPhotos(project, photographs, initial = 0) {
    const dialog = root.querySelector('[data-photo-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('[data-photo-caption]');
    const position = dialog.querySelector('[data-photo-position]');
    const previous = dialog.querySelector('[data-photo-previous]');
    const next = dialog.querySelector('[data-photo-next]');
    let selected = initial;
    function show() {
      image.src = asset(photographs[selected].id, 'large');
      image.alt = photoCaption(project, photographs[selected]);
      caption.textContent = photoCaption(project, photographs[selected]);
      position.textContent = `${selected + 1} ${t.of} ${photographs.length}`;
      previous.disabled = selected === 0;
      next.disabled = selected === photographs.length - 1;
    }
    previous.onclick = () => {if (selected > 0) {selected--; show();}};
    next.onclick = () => {if (selected < photographs.length - 1) {selected++; show();}};
    dialog.onkeydown = (event) => {
      if (event.key === 'ArrowLeft') {event.preventDefault(); previous.onclick();}
      if (event.key === 'ArrowRight') {event.preventDefault(); next.onclick();}
    };
    dialog.querySelector('[data-photo-close]').onclick = () => dialog.close();
    dialog.onclose = () => {image.removeAttribute('src');};
    show(); dialog.showModal();
  }

  function rateCard(rate) {
    const card = element('article', 'rate-card');
    card.append(element('span', 'eyebrow', t[rate.worker_type] || ''), element('h2', '', text(rate, 'title')));
    const low = Number(rate.amount_from);
    const high = rate.amount_to == null ? null : Number(rate.amount_to);
    const number = new Intl.NumberFormat(locale, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    let amount = `${number.format(low)} EUR`;
    if (high !== null && high !== low) amount = `${number.format(low)}–${number.format(high)} EUR`;
    card.append(element('p', 'rate-amount', amount), element('p', 'rate-basis', `${t[rate.unit] || ''} · ${t[rate.basis] || ''}`));
    const tags = element('div', 'rate-tags');
    tags.append(element('span', '', t[rate.category] || ''));
    if (rate.own_vehicle) tags.append(element('span', '', t.ownVehicle));
    if (rate.own_tools) tags.append(element('span', '', t.ownTools));
    card.append(tags, element('p', 'work-description', text(rate, 'description')));
    return card;
  }

  function documentCard(row) {
    if (!fileId(row.id)) throw new Error('Invalid document identifier.');
    const workerSheet = row.id === workerRateSheet?.id ? workerRateSheet : null;
    if (workerSheet) row = {...row, ...workerSheet.document};
    const card = element('article', 'document-card');
    card.lang = locale === 'de' ? 'de' : 'en';
    const main = element('div', 'document-main');
    const kicker = element('div', 'document-kicker');
    kicker.append(element('span', 'eyebrow', row.category === 'subcontractors' ? (locale === 'de' ? 'Für selbstständige Auftragnehmer' : 'For independent contractors') : (locale === 'de' ? 'Für Mitarbeitende' : 'For workers')), element('span', 'primary-language', locale === 'de' ? 'Englisch' : 'English'));
    const heading = element('h2');
    const titleButton = element('button', 'document-title-button', row.title || 'Rate sheet');
    titleButton.lang = 'en';
    titleButton.type = 'button';
    titleButton.setAttribute('aria-haspopup', 'dialog');
    heading.append(titleButton);
    heading.id = 'document-title-' + row.id;
    card.setAttribute('aria-labelledby', heading.id);
    main.append(kicker, heading);
    if (row.description) { const description = element('p', 'work-description', row.description); description.lang = 'en'; main.append(description); }
    const metadata = file => {
      let value = `${Number(file.page_count)} ${locale === 'de' ? 'Seiten' : 'pages'} · ${new Intl.NumberFormat(locale === 'de' ? 'de' : 'en', {maximumFractionDigits: 0}).format(Math.ceil(Number(file.file_bytes) / 1024))} KB`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(row.effective_date || '')) {
        const date = new Date(`${row.effective_date}T12:00:00Z`);
        if (!Number.isNaN(date.getTime())) value += ` · ${new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {day: 'numeric', month: 'long', year: 'numeric'}).format(date)}`;
      }
      return value;
    };
    const meta = metadata(row);
    const file = element('div', 'document-file');
    const icon = element('i', 'bi bi-file-earmark-text');
    icon.setAttribute('aria-hidden', 'true');
    const fileInfo = element('div');
    fileInfo.append(element('strong', '', locale === 'de' ? 'Englisches Preisblatt' : 'English rate sheet'), element('span', 'document-meta', meta));
    file.append(icon, fileInfo); main.append(file);
    const actions = element('div', 'document-actions');
    const documentURL = workerSheet ? new URL(workerSheet.files.en, location.origin).href : new URL(`api/documents/${row.id}/`, cms.href.replace(/\/?$/, '/')).href;
    const view = element('button', 'btn btn-copper', locale === 'de' ? 'Englisches PDF ansehen' : 'View English PDF');
    view.type = 'button';
    view.setAttribute('aria-haspopup', 'dialog');
    const openPreview = event => window.ARCADIAN_PDF_PREVIEW.open({url: documentURL, title: row.title || 'Rate sheet', meta, language: 'en'}, event.currentTarget);
    view.addEventListener('click', openPreview);
    titleButton.addEventListener('click', openPreview);
    const download = element('a', 'btn btn-outline', locale === 'de' ? 'Herunterladen' : 'Download');
    download.href = `${documentURL}?download=1`;
    if (workerSheet) download.download = workerSheet.files.en.split('/').pop();
    actions.append(view, download); main.append(actions); card.append(main);
    const languages = {nl: 'Nederlands', de: 'Deutsch', pl: 'Polski', ru: 'Русский'};
    const translations = Object.keys(languages).flatMap(language => Array.isArray(row.translations) ? row.translations.filter(item => item.language === language) : []);
    if (translations.length) {
      card.classList.add('has-translations');
      const sidebar = element('aside', 'document-languages');
      sidebar.setAttribute('aria-label', `${row.title || 'Rate sheet'}: ${locale === 'de' ? 'weitere Sprachen' : 'additional languages'}`);
      sidebar.append(element('h3', '', locale === 'de' ? 'Weitere Sprachen' : 'Other languages'), element('p', '', locale === 'de' ? 'Übersetzte PDF-Anlagen' : 'Translated PDF attachments'));
      const files = element('div', 'translation-files');
      for (const item of translations) {
        const attachment = element('div', 'translation-file');
        const translationURL = new URL(workerSheet ? workerSheet.files[item.language] : documentURL, location.origin);
        if (!workerSheet) translationURL.searchParams.set('language', item.language);
        const previewURL = translationURL.href;
        const preview = element('button', 'translation-preview');
        preview.type = 'button';
        preview.setAttribute('aria-haspopup', 'dialog');
        preview.setAttribute('aria-label', `${locale === 'de' ? 'PDF ansehen' : 'View PDF'}: ${languages[item.language]}`);
        preview.addEventListener('click', event => window.ARCADIAN_PDF_PREVIEW.open({url: previewURL, title: `${row.title || 'Rate sheet'} — ${languages[item.language]}`, meta: metadata(item), language: item.language}, event.currentTarget));
        const symbol = element('i', 'bi bi-file-earmark-text'); symbol.setAttribute('aria-hidden', 'true');
        const label = element('span', '', languages[item.language]);
        label.lang = item.language;
        const details = element('small', '', `PDF · ${Number(item.page_count)} ${locale === 'de' ? 'Seiten' : 'pages'}`); details.lang = locale === 'de' ? 'de' : 'en';
        label.append(details);
        preview.append(symbol, label);
        const download = element('a', 'translation-download file-arrow', '↓');
        translationURL.searchParams.set('download', '1');
        download.href = translationURL.href;
        if (workerSheet) download.download = workerSheet.files[item.language].split('/').pop();
        download.setAttribute('aria-label', locale === 'de' ? `PDF herunterladen: ${languages[item.language]}` : `Download ${languages[item.language]} PDF`);
        download.title = locale === 'de' ? `PDF herunterladen: ${languages[item.language]}` : `Download ${languages[item.language]} PDF`;
        attachment.append(preview, download); files.append(attachment);
      }
      sidebar.append(files); card.append(sidebar);
    }
    return card;
  }

  async function load(reset) {
    if (controller) controller.abort();
    controller = new AbortController();
    const active = controller;
    if (reset) {page = 1; list.replaceChildren();}
    more.hidden = true;
    message(t.loading);
    const route = isDocument ? 'documents' : type === 'rates' ? 'rates' : 'projects';
    const endpoint = new URL(`api/${route}/`, cms.href.replace(/\/?$/, '/'));
    endpoint.searchParams.set('page', page);
    if (sector) endpoint.searchParams.set('category', sector);
    try {
      const response = await fetch(endpoint, {signal: active.signal, credentials: 'omit', cache: 'no-store'});
      if (!response.ok) throw new Error('Content unavailable.');
      const result = await response.json();
      if (!Array.isArray(result.data)) throw new Error('Invalid content response.');
      // B2B scope and prices are agreed individually; public PDFs are for workers.
      const rows = isDocument ? result.data.filter(row => row.category !== 'subcontractors') : result.data;
      for (const row of rows) list.append(isDocument ? documentCard(row) : type === 'rates' ? rateCard(row) : projectCard(row));
      message(list.childElementCount ? '' : isRate ? t.emptyRates : t.empty);
      more.hidden = result.has_more !== true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        message(isRate ? t.documentsUnavailable : t.unavailable);
        more.hidden = true;
      }
    }
  }
  for (const button of root.querySelectorAll('[data-sector]')) {
    button.setAttribute('aria-pressed', String(button.dataset.sector === sector));
    button.addEventListener('click', () => {
      sector = button.dataset.sector;
      for (const item of root.querySelectorAll('[data-sector]')) item.setAttribute('aria-pressed', String(item === button));
      const url = new URL(location.href);
      if (sector) url.searchParams.set('sector', sector); else url.searchParams.delete('sector');
      history.replaceState(null, '', url);
      load(true);
    });
  }
  more.addEventListener('click', () => {page++; load(false);});
  load(true);
})();
