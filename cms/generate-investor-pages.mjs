import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';

// Strategy is deliberately distinct from a funded project or a realised return.
// External examples are references only; the photograph is Arcadian's facade work.
const root = new URL('../static-site/', import.meta.url);
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const sources = {
  flanders: 'https://www.vlaanderen.be/een-huis-of-appartement-kopen/renovatieverplichting-voor-residentiele-gebouwen',
  eu: 'https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-buildings/energy-performance-buildings-directive_en',
  ekla: 'https://www.revive.be/project/ekla/',
  matexi: 'https://www.matexi.be/en/about-matexi/reference-projects',
  bordeaux: 'https://www.lacatonvassal.com/index.php?idp=80',
};
const copy = {
  en: {
    prefix: '', name: 'Investors', title: 'Construction expertise. A foundation for property.',
    description: 'Arcadian investment strategy: from electrical, roofing and facade works to complete renovation and, subsequently, property acquisition, development and sale in Belgium.',
    eyebrow: 'ARCADIAN / INVESTMENT & DEVELOPMENT', hero: 'From the worksite', heroAccent: 'to the whole property.',
    lead: 'We work in electrical installations, roofing and facades. Our next step is complete renovation. Our longer-term ambition is to acquire, renovate or build, and sell property in Belgium.',
    discuss: 'Discuss a partnership', explore: 'Explore the strategy', portfolio: 'View our work',
    facts: [['Belgium', 'Target market'], ['Renovation', 'Next stage'], ['Project by project', 'Proposed investment approach']],
    photoAlt: 'Timber facade structure being installed on a commercial building, from the Arcadian work portfolio.',
    photoCaption: 'From our work portfolio · facade installation', photoNote: 'Arcadian’s scope shown here is facade work, not ownership or development of the building.',
    jump: 'On this page', jumps: ['The progression', 'Investment approach', 'Project economics', 'European references', 'Contact'],
    pathLabel: '01 / THE PROGRESSION', pathTitle: 'Build capability before taking on more capital.',
    pathIntro: 'The strategy expands from trades we know into responsibility for an entire property. Each step needs its own delivery evidence.',
    stages: [
      ['Current activity', 'Specialist works', 'Electrical installations, roofing and facades. This is the operational base for the next stage.', 'Evidence: work portfolio and agreed scopes.'],
      ['Next stage', 'Complete renovation', 'Coordinate the building envelope, services and finishes under one project plan, with defined responsibilities for every trade.', 'Gate: a costed pilot, delivery team and acceptance criteria.'],
      ['Longer-term ambition', 'Acquire. Develop. Sell.', 'Buy a property or site, renovate or build, complete the technical and legal handover, then sell the finished asset.', 'Gate: proven delivery, acquisition due diligence, funding and a supported exit.'],
    ],
    whyLabel: '02 / THE OPPORTUNITY', whyTitle: 'Existing buildings. Work that changes their usefulness.',
    whyIntro: 'Our investment thesis is to create value through the physical improvement of a property: its envelope, installations, layout and quality of use. A purchase has to make sense before relying on market growth.',
    why: [
      ['The envelope', 'Roof and facade condition affect water ingress, insulation and the durability of the work that follows.'],
      ['The installations', 'Electrical systems and coordinated building services are part of a property’s practical usability and handover.'],
      ['The whole building', 'Complete renovation brings these scopes together. It also adds coordination, permitting and budget risk that must be priced.'],
    ],
    policyTitle: 'A regional market, with regional rules.',
    policy: 'Flanders requires many new owners of homes with EPC label E or F to achieve at least label D within six years of transfer. Exceptions apply. Brussels and Wallonia have separate rules; every property needs its own assessment.',
    policyLink: 'Flemish government · renovation obligation', euText: 'The EU’s revised buildings directive supports the wider shift towards better energy performance. It is context for the strategy, not a guarantee of demand or a property valuation.', euLink: 'European Commission · buildings directive',
    modelLabel: '03 / INVESTMENT APPROACH', modelTitle: 'Start with one property. Make the decision inspectable.',
    modelIntro: 'We are open to discussions with capital partners and property owners about a defined renovation pilot. The proposed approach is to agree the asset, work and decision rights before committing funds.',
    roles: [
      ['Arcadian', 'Define and price the execution scope, organise delivery and document progress. Appoint qualified designers and specialist partners where required.'],
      ['Capital or property partner', 'Bring project capital or a suitable property, review the investment case and agree the financing, governance and exit terms.'],
      ['Independent specialists', 'Check valuation, title, permits, taxes, insurance and technical assumptions. Their responsibilities are defined for the specific project.'],
    ],
    controlsTitle: 'Terms to settle before funding',
    controls: ['A defined asset, project budget, contingency and funding schedule.', 'A legal structure, potentially a dedicated project company, with agreed responsibilities and reporting.', 'Milestone-based funding, change approvals, investor decision rights and any security.', 'Separate disclosure of construction fees, financing costs and the allocation of any profit or loss.'],
    modelNote: 'These are proposed working principles. No investment amount, return, security package or project vehicle is being offered on this page.',
    economicsLabel: '04 / PROJECT ECONOMICS', economicsTitle: 'Work back to a defensible purchase price.',
    economicsIntro: 'For a selected property, work back from a conservative sale appraisal and include the complete cost of getting there.',
    equationTop: 'Conservative sale proceeds', equationLines: ['− acquisition taxes, notary and transaction costs', '− renovation or construction, design and permits', '− finance, holding, insurance and selling costs', '− contingency and required project margin'], equationBottom: '= maximum supportable purchase price',
    equationNote: 'An appraisal framework, not a valuation or a return forecast. Tax treatment and all costs require project-specific verification.',
    dossierTitle: 'What a project dossier should contain', dossier: ['Property, title, condition, energy assessment and permit position.', 'Comparable sales, independent appraisal and identified buyer market.', 'Trade-by-trade scope, quotations, contingency and programme.', 'Monthly cash flow, funding sources, fees, taxes and decision rights.', 'Base and downside cases, exit route and the consequences of a delayed sale.'],
    stressTitle: 'Test the downside together', stress: [['−10%', 'sale proceeds'], ['+15%', 'works budget'], ['+6 months', 'holding period']], stressNote: 'Illustrative stress assumptions to test separately and in combination. They are neither forecasts nor acceptance thresholds.',
    risksTitle: 'Risks the model must carry', risks: [['Hidden defects', 'Survey structure, moisture, asbestos and ground conditions; budget for unresolved findings.'], ['Permits & delivery', 'Check planning, co-ownership and approvals before relying on the programme. Define responsibilities and change control.'], ['Sale & financing', 'Allow for cost overruns, interest and slower sales. A rental or refinancing alternative requires its own viable case.']],
    proofLabel: '05 / EXECUTION & EVIDENCE', proofTitle: 'Construction is the business. Software supports the work.',
    proofIntro: 'Our portfolio shows electrical and facade work and installation stages. It is the evidence for our current scope; completed property-development cycles are a future milestone.',
    proofLink: 'Explore the Arcadian portfolio', teamLink: 'Meet the team',
    digitalTitle: 'A digital layer with a defined role', digital: 'Arcadian develops Werfvolt for construction administration and uses Arcadian CI on macOS and iPhone for software operations and website analytics. These tools support visibility; investor reporting must still reconcile contracts, invoices, progress and cash.',
    digitalNote: 'Website traffic is not investment demand. Software activity is not construction revenue or a completed property sale.',
    referenceLabel: '06 / EUROPEAN REFERENCES', referenceTitle: 'Established approaches. Lessons for a smaller first step.',
    referenceIntro: 'Independent examples of renovation and redevelopment. These are not Arcadian projects, partners or financial comparables.',
    cases: [
      ['BRUSSELS, BELGIUM', 'Ekla / Revive', 'Revive redeveloped a former brewery site opposite Brussels West Station into a mixed-use residential project.', 'Lesson for our strategy: assess transport, local demand and the final use alongside the building works.', sources.ekla],
      ['ANTWERP, BELGIUM', '’t Groen Kwartier / Matexi', 'The former military hospital site was transformed into a neighbourhood combining homes, other uses and a car-free park. Matexi lists the project period as 2003–2017.', 'Lesson: adaptive reuse requires a coherent plan and patient phasing; the full cycle can be long.', sources.matexi],
      ['BORDEAUX, FRANCE', 'Grand Parc / Lacaton & Vassal, Druot, Hutin', 'The transformation of 530 occupied homes retained the existing structures and added winter gardens and balconies.', 'Lesson: assess what can be retained before choosing demolition. This social-housing project is not a resale-return benchmark.', sources.bordeaux],
    ], source: 'Read the original project source',
    contactLabel: '07 / NEXT STEP', contactTitle: 'A concrete property. A clear scope. A serious discussion.',
    contactIntro: 'If you have a property in Belgium or want to discuss funding a renovation pilot, contact us with the location, current condition, intended use and your role in the project.',
    contactNote: 'The first discussion should establish fit and missing information. Investment terms follow only after assessment of a specific project.', phone: 'Call Arcadian', form: 'Use our contact form',
    disclaimer: 'This page describes a business strategy for discussion. It is not a public offering or investment advice. Property investment is illiquid and capital can be lost. Any transaction requires its own due diligence and signed agreements.',
  },
  nl: {
    prefix: 'nl/', name: 'Investeerders', title: 'Bouwexpertise. De basis voor vastgoed.',
    description: 'De investeringsstrategie van Arcadian: van elektriciteit, dak- en gevelwerken naar totaalrenovatie en vervolgens aankoop, ontwikkeling en verkoop van vastgoed in België.',
    eyebrow: 'ARCADIAN / INVESTERING & ONTWIKKELING', hero: 'Van de werf', heroAccent: 'naar het volledige pand.',
    lead: 'Wij werken aan elektrische installaties, daken en gevels. De volgende stap is totaalrenovatie. Op langere termijn willen we vastgoed in België aankopen, renoveren of bouwen, en verkopen.',
    discuss: 'Bespreek een samenwerking', explore: 'Bekijk de strategie', portfolio: 'Bekijk onze werken',
    facts: [['België', 'Doelmarkt'], ['Totaalrenovatie', 'Volgende stap'], ['Per project', 'Voorgestelde investeringsaanpak']],
    photoAlt: 'Montage van een houten gevelconstructie op een bedrijfsgebouw, uit het werkportfolio van Arcadian.',
    photoCaption: 'Uit ons werkportfolio · gevelmontage', photoNote: 'Het getoonde werk van Arcadian betreft de gevel, niet het eigendom of de ontwikkeling van het gebouw.',
    jump: 'Op deze pagina', jumps: ['De stappen', 'Investeringsaanpak', 'Projecteconomie', 'Europese referenties', 'Contact'],
    pathLabel: '01 / DE STAPPEN', pathTitle: 'Eerst de capaciteit. Dan meer kapitaal.',
    pathIntro: 'De strategie vertrekt van onze vakgebieden en groeit naar verantwoordelijkheid voor een volledig pand. Elke stap vraagt eigen bewijs van uitvoering.',
    stages: [
      ['Huidige activiteit', 'Gespecialiseerde werken', 'Elektrische installaties, dak- en gevelwerken. Dit vormt de operationele basis voor de volgende stap.', 'Bewijs: werkportfolio en afgesproken opdrachten.'],
      ['Volgende stap', 'Totaalrenovatie', 'Gebouwschil, technieken en afwerking coördineren binnen één projectplan, met duidelijke verantwoordelijkheden per vakgebied.', 'Voorwaarde: een begrote pilot, uitvoeringsteam en oplevercriteria.'],
      ['Ambitie op langere termijn', 'Aankopen. Ontwikkelen. Verkopen.', 'Een pand of terrein kopen, renoveren of bouwen, de technische en juridische oplevering afronden en het afgewerkte vastgoed verkopen.', 'Voorwaarde: bewezen uitvoering, aankooponderzoek, financiering en een onderbouwde verkoopstrategie.'],
    ],
    whyLabel: '02 / DE OPPORTUNITEIT', whyTitle: 'Bestaande gebouwen. Werken die hun gebruik verbeteren.',
    whyIntro: 'Onze investeringsthese is waarde creëren door een pand fysiek te verbeteren: de schil, installaties, indeling en gebruikskwaliteit. De aankoop moet verantwoord zijn zonder op marktgroei te rekenen.',
    why: [['De gebouwschil', 'De staat van dak en gevel beïnvloedt waterinfiltratie, isolatie en de duurzaamheid van de volgende werkzaamheden.'], ['De installaties', 'Elektrische installaties en goed afgestemde technieken dragen bij aan de bruikbaarheid en oplevering van een pand.'], ['Het volledige gebouw', 'Totaalrenovatie verbindt deze onderdelen. Ze brengt ook coördinatie-, vergunnings- en budgetrisico’s mee die in de begroting thuishoren.']],
    policyTitle: 'Een regionale markt, met regionale regels.', policy: 'In Vlaanderen moeten veel nieuwe eigenaars van woningen met EPC-label E of F binnen zes jaar na overdracht minstens label D behalen. Er gelden uitzonderingen. Brussel en Wallonië hebben eigen regels; elk pand vraagt een afzonderlijke beoordeling.', policyLink: 'Vlaamse overheid · renovatieverplichting', euText: 'De herziene Europese gebouwenrichtlijn ondersteunt de bredere omslag naar betere energieprestaties. Ze biedt context voor de strategie, geen garantie op vraag of vastgoedwaarde.', euLink: 'Europese Commissie · gebouwenrichtlijn',
    modelLabel: '03 / INVESTERINGSAANPAK', modelTitle: 'Begin met één pand. Maak de beslissing toetsbaar.',
    modelIntro: 'We staan open voor gesprekken met kapitaalpartners en vastgoedeigenaars over een afgebakende renovatiepilot. Ons voorstel: eerst overeenstemming over het pand, de werken en de beslissingsrechten, dan de financiering.',
    roles: [['Arcadian', 'De uitvoering afbakenen en begroten, de werkzaamheden organiseren en de voortgang documenteren. Waar nodig bevoegde ontwerpers en gespecialiseerde partners inschakelen.'], ['Kapitaal- of vastgoedpartner', 'Projectkapitaal of een geschikt pand inbrengen, de investeringscase beoordelen en financiering, bestuur en verkoopvoorwaarden afspreken.'], ['Onafhankelijke specialisten', 'Waardering, eigendomstitel, vergunningen, belastingen, verzekeringen en technische aannames toetsen. Hun verantwoordelijkheden worden per project vastgelegd.']],
    controlsTitle: 'Afspraken vóór financiering', controls: ['Een afgebakend pand, projectbudget, reserve en financieringsplanning.', 'Een juridische structuur, eventueel een afzonderlijke projectvennootschap, met afgesproken taken en rapportage.', 'Financiering per mijlpaal, goedkeuring van wijzigingen, beslissingsrechten en eventuele zekerheden.', 'Afzonderlijke vermelding van bouwvergoedingen, financieringskosten en de verdeling van winst of verlies.'],
    modelNote: 'Dit zijn voorgestelde werkprincipes. Deze pagina biedt geen investeringsbedrag, rendement, zekerhedenpakket of projectvennootschap aan.',
    economicsLabel: '04 / PROJECTECONOMIE', economicsTitle: 'De aankoopprijs volgt uit de berekening.', economicsIntro: 'Reken voor een geselecteerd pand terug vanuit een voorzichtige verkoopraming. Neem alle kosten tot en met de verkoop mee.',
    equationTop: 'Voorzichtige verkoopopbrengst', equationLines: ['− aankoopbelastingen, notaris- en transactiekosten', '− renovatie of bouw, ontwerp en vergunningen', '− financiering, bezit, verzekering en verkoopkosten', '− reserve en vereiste projectmarge'], equationBottom: '= maximaal verantwoorde aankoopprijs', equationNote: 'Een beoordelingskader, geen waardering of rendementsprognose. Fiscaliteit en kosten moeten per project worden gecontroleerd.',
    dossierTitle: 'Wat een projectdossier moet bevatten', dossier: ['Pand, eigendomstitel, toestand, energiebeoordeling en vergunningssituatie.', 'Vergelijkbare verkopen, onafhankelijke waardering en beoogde kopersmarkt.', 'Werkomschrijving per vakgebied, offertes, reserve en planning.', 'Maandelijkse kasstroom, financieringsbronnen, vergoedingen, belastingen en beslissingsrechten.', 'Basis- en tegenvallerscenario’s, verkoopstrategie en gevolgen van een latere verkoop.'],
    stressTitle: 'Toets ook de gecombineerde tegenvaller', stress: [['−10%', 'verkoopopbrengst'], ['+15%', 'werkbudget'], ['+6 maanden', 'bezitsduur']], stressNote: 'Illustratieve stressaannames, afzonderlijk en gecombineerd te toetsen. Geen prognoses of aanvaardingsdrempels.',
    risksTitle: 'Risico’s die in het model thuishoren', risks: [['Verborgen gebreken', 'Onderzoek constructie, vocht, asbest en bodem. Begroot onopgeloste bevindingen.'], ['Vergunningen & uitvoering', 'Controleer bestemming, mede-eigendom en goedkeuringen vóór u op de planning rekent. Leg taken en wijzigingsbeheer vast.'], ['Verkoop & financiering', 'Houd rekening met meerkosten, rente en tragere verkoop. Verhuur of herfinanciering vraagt een eigen haalbare businesscase.']],
    proofLabel: '05 / UITVOERING & BEWIJS', proofTitle: 'De bouw is de activiteit. Software ondersteunt het werk.', proofIntro: 'Ons portfolio toont elektrische werken, gevelwerken en montagefasen. Het onderbouwt onze huidige werkzaamheden; afgeronde vastgoedontwikkelingen zijn een toekomstige mijlpaal.', proofLink: 'Bekijk het werkportfolio van Arcadian', teamLink: 'Maak kennis met het team',
    digitalTitle: 'Een digitale laag met een duidelijke rol', digital: 'Arcadian ontwikkelt Werfvolt voor bouwadministratie en gebruikt Arcadian CI op macOS en iPhone voor softwarebeheer en websiteanalyse. Deze tools geven inzicht; investeerdersrapportage moet nog steeds aansluiten op contracten, facturen, voortgang en kasstromen.', digitalNote: 'Websiteverkeer is geen investeringsvraag. Softwaregebruik is geen bouwomzet of afgeronde vastgoedverkoop.',
    referenceLabel: '06 / EUROPESE REFERENTIES', referenceTitle: 'Bestaande aanpakken. Lessen voor een kleinere eerste stap.', referenceIntro: 'Onafhankelijke voorbeelden van renovatie en herontwikkeling. Dit zijn geen projecten, partners of financiële vergelijkingspunten van Arcadian.',
    cases: [['BRUSSEL, BELGIË', 'Ekla / Revive', 'Revive ontwikkelde een voormalige brouwerijsite tegenover het Weststation tot een woonproject met gemengde functies.', 'Les voor onze strategie: beoordeel bereikbaarheid, lokale vraag en eindgebruik samen met de bouwwerken.', sources.ekla], ['ANTWERPEN, BELGIË', '’t Groen Kwartier / Matexi', 'De voormalige militaire ziekenhuissite werd een buurt met woningen, andere functies en een autovrij park. Matexi vermeldt de projectperiode 2003–2017.', 'Les: herbestemming vraagt een samenhangend plan en geduldige fasering; de volledige cyclus kan lang zijn.', sources.matexi], ['BORDEAUX, FRANKRIJK', 'Grand Parc / Lacaton & Vassal, Druot, Hutin', 'Bij de transformatie van 530 bewoonde woningen bleven de bestaande structuren behouden en werden wintertuinen en balkons toegevoegd.', 'Les: onderzoek behoud vóór u voor sloop kiest. Dit sociale woonproject is geen referentie voor verkooprendement.', sources.bordeaux]], source: 'Bekijk de oorspronkelijke projectbron',
    contactLabel: '07 / VOLGENDE STAP', contactTitle: 'Een concreet pand. Een duidelijke opdracht. Een serieus gesprek.', contactIntro: 'Heeft u vastgoed in België of wilt u de financiering van een renovatiepilot bespreken? Neem contact op met de locatie, huidige toestand, het beoogde gebruik en uw rol in het project.', contactNote: 'Het eerste gesprek dient om de aansluiting en ontbrekende informatie vast te stellen. Investeringsvoorwaarden volgen pas na beoordeling van een specifiek project.', phone: 'Bel Arcadian', form: 'Gebruik ons contactformulier', disclaimer: 'Deze pagina beschrijft een bedrijfsstrategie ter bespreking. Ze is geen openbaar aanbod of beleggingsadvies. Vastgoedinvesteringen zijn illiquide en kapitaal kan verloren gaan. Elke transactie vereist eigen onderzoek en ondertekende overeenkomsten.',
  },
  pl: {
    prefix: 'pl/', name: 'Inwestorzy', title: 'Kompetencje budowlane. Podstawa dla nieruchomości.',
    description: 'Strategia inwestycyjna Arcadian: od instalacji elektrycznych, dachów i elewacji do kompleksowych remontów, a następnie zakupu, realizacji i sprzedaży nieruchomości w Belgii.',
    eyebrow: 'ARCADIAN / INWESTYCJE I NIERUCHOMOŚCI', hero: 'Od prac na budowie', heroAccent: 'do całej nieruchomości.',
    lead: 'Wykonujemy instalacje elektryczne, dachy i elewacje. Kolejny etap to kompleksowe remonty. W dłuższej perspektywie chcemy kupować nieruchomości w Belgii, remontować je lub budować, a następnie sprzedawać.',
    discuss: 'Porozmawiajmy o współpracy', explore: 'Poznaj strategię', portfolio: 'Zobacz nasze prace', facts: [['Belgia', 'Rynek docelowy'], ['Kompleksowe remonty', 'Kolejny etap'], ['Projekt po projekcie', 'Proponowane podejście inwestycyjne']],
    photoAlt: 'Montaż drewnianej konstrukcji elewacji budynku komercyjnego, z portfolio prac Arcadian.', photoCaption: 'Z naszego portfolio · montaż elewacji', photoNote: 'Pokazany zakres Arcadian dotyczy elewacji, nie własności ani realizacji deweloperskiej całego budynku.',
    jump: 'Na tej stronie', jumps: ['Etapy rozwoju', 'Model współpracy', 'Ekonomika projektu', 'Przykłady europejskie', 'Kontakt'],
    pathLabel: '01 / ETAPY ROZWOJU', pathTitle: 'Najpierw zdolność realizacji. Potem większy kapitał.', pathIntro: 'Strategia wychodzi od znanych nam specjalizacji i prowadzi do odpowiedzialności za całą nieruchomość. Każdy etap wymaga własnych dowodów wykonania.',
    stages: [['Obecna działalność', 'Prace specjalistyczne', 'Instalacje elektryczne, dachy i elewacje. To baza operacyjna kolejnego etapu.', 'Dowody: portfolio prac i uzgodnione zakresy.'], ['Kolejny etap', 'Kompleksowy remont', 'Koordynacja przegród budynku, instalacji i wykończenia w jednym planie, z określoną odpowiedzialnością każdej branży.', 'Warunek: wyceniony pilotaż, zespół i kryteria odbioru.'], ['Ambicja długoterminowa', 'Kupno. Realizacja. Sprzedaż.', 'Zakup nieruchomości lub działki, remont albo budowa, odbiór techniczny i formalny, a następnie sprzedaż gotowego obiektu.', 'Warunek: sprawdzona realizacja, badanie zakupu, finansowanie i uzasadniony plan sprzedaży.']],
    whyLabel: '02 / POTENCJAŁ', whyTitle: 'Istniejące budynki. Prace, które poprawiają ich użyteczność.', whyIntro: 'Nasza teza inwestycyjna zakłada tworzenie wartości przez fizyczną poprawę nieruchomości: jej przegród, instalacji, układu i jakości użytkowania. Zakup musi być uzasadniony bez liczenia na wzrost rynku.',
    why: [['Przegrody budynku', 'Stan dachu i elewacji wpływa na przenikanie wody, izolację i trwałość kolejnych prac.'], ['Instalacje', 'Instalacje elektryczne i skoordynowane systemy budynku wpływają na jego użyteczność oraz odbiór.'], ['Cały budynek', 'Kompleksowy remont łączy te zakresy. Dodaje również ryzyko koordynacji, pozwoleń i budżetu, które trzeba wycenić.']],
    policyTitle: 'Rynek regionalny. Regionalne przepisy.', policy: 'We Flandrii wielu nowych właścicieli mieszkań i domów z etykietą EPC E lub F musi uzyskać co najmniej etykietę D w ciągu sześciu lat od przeniesienia własności. Istnieją wyjątki. Bruksela i Walonia mają odrębne zasady; każdy obiekt wymaga własnej oceny.', policyLink: 'Władze Flandrii · obowiązek renowacji', euText: 'Zmieniona unijna dyrektywa budynkowa wspiera szerszy kierunek poprawy efektywności energetycznej. To kontekst strategii, nie gwarancja popytu ani wartości nieruchomości.', euLink: 'Komisja Europejska · dyrektywa budynkowa',
    modelLabel: '03 / MODEL WSPÓŁPRACY', modelTitle: 'Zacznijmy od jednej nieruchomości i sprawdzalnej decyzji.', modelIntro: 'Jesteśmy otwarci na rozmowy z partnerami kapitałowymi i właścicielami o określonym pilotażu remontowym. Proponujemy uzgodnić obiekt, zakres prac i prawa decyzyjne przed zaangażowaniem środków.',
    roles: [['Arcadian', 'Określenie i wycena zakresu wykonawczego, organizacja prac oraz dokumentowanie postępu. Zaangażowanie uprawnionych projektantów i specjalistów tam, gdzie są potrzebni.'], ['Partner kapitałowy lub właściciel', 'Wniesienie kapitału projektowego albo odpowiedniej nieruchomości, ocena inwestycji i uzgodnienie finansowania, nadzoru oraz warunków wyjścia.'], ['Niezależni specjaliści', 'Weryfikacja wyceny, tytułu prawnego, pozwoleń, podatków, ubezpieczeń i założeń technicznych. Odpowiedzialność określona dla danego projektu.']],
    controlsTitle: 'Ustalenia przed finansowaniem', controls: ['Określony obiekt, budżet projektu, rezerwa i harmonogram finansowania.', 'Struktura prawna, ewentualnie osobna spółka projektowa, z uzgodnionymi zadaniami i raportowaniem.', 'Finansowanie według etapów, zatwierdzanie zmian, prawa decyzyjne i ewentualne zabezpieczenia.', 'Oddzielne wskazanie wynagrodzenia za prace, kosztów finansowania oraz podziału zysku lub straty.'], modelNote: 'To proponowane zasady współpracy. Na tej stronie nie oferujemy określonej kwoty inwestycji, stopy zwrotu, pakietu zabezpieczeń ani spółki projektowej.',
    economicsLabel: '04 / EKONOMIKA PROJEKTU', economicsTitle: 'Cena zakupu wynika z kalkulacji.', economicsIntro: 'Dla wybranego obiektu liczymy wstecz od ostrożnej wyceny sprzedaży, uwzględniając wszystkie koszty aż do realizacji transakcji.', equationTop: 'Ostrożnie oszacowane wpływy ze sprzedaży', equationLines: ['− podatki zakupowe, notariusz i koszty transakcji', '− remont lub budowa, projekt i pozwolenia', '− finansowanie, utrzymanie, ubezpieczenie i sprzedaż', '− rezerwa i wymagana marża projektu'], equationBottom: '= maksymalna uzasadniona cena zakupu', equationNote: 'Ramy oceny, nie wycena ani prognoza zwrotu. Podatki i koszty wymagają weryfikacji dla konkretnego projektu.',
    dossierTitle: 'Co powinna zawierać dokumentacja projektu', dossier: ['Obiekt, tytuł prawny, stan techniczny, ocena energetyczna i sytuacja pozwoleń.', 'Porównywalne transakcje, niezależna wycena i określony rynek nabywców.', 'Zakres każdej branży, oferty, rezerwa i harmonogram.', 'Miesięczne przepływy pieniężne, źródła finansowania, opłaty, podatki i prawa decyzyjne.', 'Scenariusz bazowy i negatywny, sposób wyjścia oraz skutki późniejszej sprzedaży.'],
    stressTitle: 'Sprawdźmy łączne skutki pogorszenia warunków', stress: [['−10%', 'wpływów ze sprzedaży'], ['+15%', 'budżetu prac'], ['+6 miesięcy', 'okresu utrzymania']], stressNote: 'Przykładowe założenia testu odporności, osobno i łącznie. Nie są prognozą ani progiem akceptacji.', risksTitle: 'Ryzyka, które musi uwzględniać model', risks: [['Ukryte wady', 'Badanie konstrukcji, wilgoci, azbestu i gruntu; rezerwa na nierozstrzygnięte kwestie.'], ['Pozwolenia i realizacja', 'Sprawdzenie przeznaczenia, współwłasności i zgód przed przyjęciem harmonogramu. Określenie odpowiedzialności i zatwierdzania zmian.'], ['Sprzedaż i finansowanie', 'Uwzględnienie przekroczeń kosztów, odsetek i wolniejszej sprzedaży. Najem albo refinansowanie wymagają odrębnego, opłacalnego planu.']],
    proofLabel: '05 / REALIZACJA I DOWODY', proofTitle: 'Budownictwo jest działalnością. Oprogramowanie wspiera pracę.', proofIntro: 'Nasze portfolio pokazuje prace elektryczne, elewacje i etapy montażu. Potwierdza obecny zakres działalności; zakończone cykle deweloperskie są przyszłym etapem.', proofLink: 'Zobacz portfolio Arcadian', teamLink: 'Poznaj zespół', digitalTitle: 'Narzędzia cyfrowe z określoną rolą', digital: 'Arcadian rozwija Werfvolt do administracji budowlanej i używa Arcadian CI na macOS oraz iPhonie do obsługi oprogramowania i analityki stron. Narzędzia zapewniają wgląd; raporty dla inwestorów nadal muszą odpowiadać umowom, fakturom, postępowi i przepływom pieniężnym.', digitalNote: 'Ruch na stronie nie oznacza popytu inwestycyjnego. Aktywność oprogramowania nie jest przychodem budowlanym ani sprzedażą nieruchomości.',
    referenceLabel: '06 / PRZYKŁADY EUROPEJSKIE', referenceTitle: 'Sprawdzone podejścia. Wnioski dla mniejszego pierwszego kroku.', referenceIntro: 'Niezależne przykłady remontów i przekształceń. Nie są to projekty, partnerzy ani finansowe punkty odniesienia Arcadian.',
    cases: [['BRUKSELA, BELGIA', 'Ekla / Revive', 'Revive przekształciło teren dawnego browaru naprzeciwko Dworca Zachodniego w projekt mieszkaniowy o mieszanych funkcjach.', 'Wniosek dla naszej strategii: oceniać transport, lokalny popyt i docelowe użytkowanie razem z pracami budowlanymi.', sources.ekla], ['ANTWERPIA, BELGIA', '’t Groen Kwartier / Matexi', 'Teren dawnego szpitala wojskowego stał się dzielnicą z mieszkaniami, innymi funkcjami i parkiem bez ruchu samochodowego. Matexi wskazuje okres realizacji 2003–2017.', 'Wniosek: adaptacja wymaga spójnego planu i cierpliwego etapowania; pełny cykl może być długi.', sources.matexi], ['BORDEAUX, FRANCJA', 'Grand Parc / Lacaton & Vassal, Druot, Hutin', 'Przekształcenie 530 zamieszkanych lokali zachowało istniejące konstrukcje i dodało ogrody zimowe oraz balkony.', 'Wniosek: ocenić możliwości zachowania budynku przed rozbiórką. To mieszkalnictwo społeczne, nie wzorzec zwrotu z odsprzedaży.', sources.bordeaux]], source: 'Zobacz oryginalne źródło projektu',
    contactLabel: '07 / KOLEJNY KROK', contactTitle: 'Konkretny obiekt. Jasny zakres. Rzeczowa rozmowa.', contactIntro: 'Masz nieruchomość w Belgii lub chcesz porozmawiać o finansowaniu pilotażu remontowego? Prześlij lokalizację, obecny stan, docelowe użytkowanie i swoją rolę w projekcie.', contactNote: 'Pierwsza rozmowa służy ustaleniu dopasowania i brakujących danych. Warunki inwestycji dopiero po ocenie konkretnego projektu.', phone: 'Zadzwoń do Arcadian', form: 'Użyj formularza kontaktowego', disclaimer: 'Strona przedstawia strategię biznesową do dyskusji. Nie stanowi oferty publicznej ani porady inwestycyjnej. Inwestycje w nieruchomości są niepłynne i mogą prowadzić do utraty kapitału. Każda transakcja wymaga własnego badania i podpisanych umów.',
  },
};

const jumpIds = ['progression', 'approach', 'economics', 'references', 'partnership'];
const heading = (label, title, intro = '') => `<div class="inv-heading"><span class="eyebrow">${esc(label)}</span><h2>${esc(title)}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}</div>`;
const list = items => `<ul class="inv-list">${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const articles = (items, className = '') => items.map(([title, text]) => `<article class="${className}"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('');

for (const [locale, c] of Object.entries(copy)) {
  const home = await readFile(new URL(`${c.prefix}index.html`, root), 'utf8');
  let nav = home.match(/<nav\b[^>]*id="site-nav"[\s\S]*?<\/nav>/)[0];
  nav = nav.replace(/<div class="nav-links"[\s\S]*?<\/div>/, `<div class="nav-links" id="nav-links"><a href="/${c.prefix}gallery/">${esc(c.portfolio)}</a><a href="#progression">${esc(c.jumps[0])}</a><a href="#approach">${esc(c.jumps[1])}</a><a href="/${c.prefix}investors/" class="active" aria-current="page">${esc(c.name)}</a></div>`);
  nav = nav.replace(/<div class="lang">[\s\S]*?<\/div>/, `<div class="lang">${Object.entries(copy).map(([key, value]) => `<a href="/${value.prefix}investors/" lang="${key}" aria-label="${{en: 'English', nl: 'Nederlands', pl: 'Polski'}[key]}"${key === locale ? ' class="on" aria-current="page"' : ''}>${key.toUpperCase()}</a>`).join('')}</div>`);
  nav = nav.replace(/<a class="btn btn-copper btn-sm"[^>]*>[\s\S]*?<\/a>/, `<a class="btn btn-copper btn-sm" href="#partnership">${esc(c.discuss)}</a>`);
  nav = nav.replace('id="site-nav"', 'id="site-nav" aria-label="ARCADIAN"');
  nav = nav.replace('aria-controls="nav-links"', 'aria-controls="nav-links" aria-expanded="false"');
  let footer = home.match(/<footer\b[\s\S]*?<\/footer>/)[0];
  footer = footer.replaceAll('href="/investors/"', `href="/${c.prefix}investors/"`);
  const path = `/${c.prefix}investors/`;
  const email = 'mailto:info@arcadian-eu.com?subject=' + encodeURIComponent('Arcadian | ' + c.name + ' | Belgium property partnership');
  const main = `
  <main id="main-content" class="main">
    <header class="inv-hero">
      <div class="inv-wrap inv-hero-grid">
        <div class="inv-hero-copy"><span class="eyebrow on-dark">${esc(c.eyebrow)}</span>
          <h1>${esc(c.hero)}<br><span>${esc(c.heroAccent)}</span></h1>
          <p class="inv-lead">${esc(c.lead)}</p>
          <div class="inv-actions"><a class="btn btn-copper" href="#partnership">${esc(c.discuss)} <span aria-hidden="true">↗</span></a><a class="inv-text-link" href="#progression">${esc(c.explore)} <span aria-hidden="true">↓</span></a></div>
          <dl class="inv-facts">${c.facts.map(([value, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
        </div>
        <figure class="inv-hero-media"><img src="/assets/img/investors/arcadian-facade.webp" alt="${esc(c.photoAlt)}" width="1200" height="1600" fetchpriority="high"><figcaption><span>${esc(c.photoCaption)}</span><small>${esc(c.photoNote)}</small></figcaption></figure>
      </div>
    </header>
    <nav class="inv-jump" aria-label="${esc(c.jump)}"><div class="inv-wrap">${c.jumps.map((label, i) => `<a href="#${jumpIds[i]}">${esc(label)} <span aria-hidden="true">↘</span></a>`).join('')}</div></nav>
    <section id="progression" class="inv-section"><div class="inv-wrap">${heading(c.pathLabel, c.pathTitle, c.pathIntro)}
      <ol class="inv-stages">${c.stages.map(([status, title, text, gate], i) => `<li><span class="inv-stage-number" aria-hidden="true">0${i + 1}</span><span class="inv-status${i === 0 ? ' is-current' : ''}">${esc(status)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="inv-gate">${esc(gate)}</div></li>`).join('')}</ol>
    </div></section>
    <section class="inv-section inv-white"><div class="inv-wrap">${heading(c.whyLabel, c.whyTitle, c.whyIntro)}<div class="inv-columns">${articles(c.why)}</div>
      <aside class="inv-policy" aria-label="${esc(c.policyTitle)}"><div><h3>${esc(c.policyTitle)}</h3><p>${esc(c.policy)}</p><a href="${sources.flanders}" target="_blank" rel="noopener noreferrer">${esc(c.policyLink)} ↗</a></div><div><p>${esc(c.euText)}</p><a href="${sources.eu}" target="_blank" rel="noopener noreferrer">${esc(c.euLink)} ↗</a></div></aside>
    </div></section>
    <section id="approach" class="inv-section"><div class="inv-wrap">${heading(c.modelLabel, c.modelTitle, c.modelIntro)}
      <div class="inv-role-rows">${c.roles.map(([role, text], i) => `<article><span class="inv-row-index" aria-hidden="true">0${i + 1}</span><h3>${esc(role)}</h3><p>${esc(text)}</p></article>`).join('')}</div>
      <div class="inv-controls"><h3>${esc(c.controlsTitle)}</h3>${list(c.controls)}</div><p class="inv-note">${esc(c.modelNote)}</p>
    </div></section>
    <section id="economics" class="inv-section inv-dark"><div class="inv-wrap">${heading(c.economicsLabel, c.economicsTitle, c.economicsIntro)}
      <div class="inv-economics-grid"><div class="inv-equation"><p class="inv-equation-top">${esc(c.equationTop)}</p>${c.equationLines.map(line => `<p>${esc(line)}</p>`).join('')}<p class="inv-equation-result">${esc(c.equationBottom)}</p><small>${esc(c.equationNote)}</small></div><div class="inv-dossier"><h3>${esc(c.dossierTitle)}</h3>${list(c.dossier)}</div></div>
      <div class="inv-stress"><h3>${esc(c.stressTitle)}</h3><dl>${c.stress.map(([value, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p class="inv-note">${esc(c.stressNote)}</p></div>
      <div class="inv-risks"><h3>${esc(c.risksTitle)}</h3><div class="inv-columns">${articles(c.risks)}</div></div>
    </div></section>
    <section class="inv-section inv-white"><div class="inv-wrap inv-proof-grid"><div>${heading(c.proofLabel, c.proofTitle, c.proofIntro)}<div class="inv-actions"><a class="btn btn-copper" href="/${c.prefix}gallery/">${esc(c.proofLink)} ↗</a><a class="inv-text-link" href="/${c.prefix}#team">${esc(c.teamLink)} ↗</a></div></div><aside class="inv-digital" aria-label="${esc(c.digitalTitle)}"><span class="inv-monogram" aria-hidden="true">A / CI</span><h3>${esc(c.digitalTitle)}</h3><p>${esc(c.digital)}</p><p class="inv-note">${esc(c.digitalNote)}</p></aside></div></section>
    <section id="references" class="inv-section"><div class="inv-wrap">${heading(c.referenceLabel, c.referenceTitle, c.referenceIntro)}<div class="inv-cases">${c.cases.map(([location, title, text, lesson, url]) => `<article><span class="eyebrow">${esc(location)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><p class="inv-case-lesson">${esc(lesson)}</p><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(c.source)} ↗</a></article>`).join('')}</div></div></section>
    <section id="partnership" class="inv-section inv-contact"><div class="inv-wrap"><div class="inv-contact-grid"><div>${heading(c.contactLabel, c.contactTitle, c.contactIntro)}<p class="inv-note">${esc(c.contactNote)}</p></div><div class="inv-contact-actions"><a class="inv-email" href="${esc(email)}">info@arcadian-eu.com <span aria-hidden="true">↗</span></a><a href="tel:+32466495409" aria-label="${esc(c.phone)} +32 466 495 409">+32&nbsp;466&nbsp;495&nbsp;409</a><a href="/${c.prefix}#contact">${esc(c.form)} ↗</a></div></div><p class="inv-disclaimer">${esc(c.disclaimer)}</p></div></section>
  </main>`;
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(c.title)} | ARCADIAN</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="theme-color" content="#0b1020">
  <meta name="arcadian-release" content="investors-20261014-v1">
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
  <link href="/assets/css/investors.css?v=investors-20261014-v1" rel="stylesheet">
</head>
<body class="index-page investor-page">
  <a class="inv-skip" href="#main-content">${esc(c.explore)}</a>
  ${nav}
${main}
${footer}
  <script src="/assets/js/arcadian.js?v=ae92cf41a42ff6243383db607a632ca00095facf"></script>
  <script src="/assets/js/investors.js?v=investors-20261014-v1"></script>
  <script src="/assets/js/cookie-preferences.js?v=ae92cf41a42ff6243383db607a632ca00095facf"></script>
  <script src="/assets/js/wv-beacon.js" defer></script>
</body>
</html>
`;
  const destination = new URL(`${c.prefix}investors/`, root);
  await mkdir(destination, {recursive: true});
  await writeFile(new URL('index.html', destination), html);
}

// Keep the existing site navigation in its selected language. Do not rewrite
// language-switch links, which deliberately lead to the other translations.
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
console.log('Generated investor strategy in EN, NL and PL.');
