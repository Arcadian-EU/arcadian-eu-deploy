import {calculateFacade, finishes, allowsInsulation, allowsAluminium, PRICE_FACTOR} from './facade-pricing.js';
import {facadeVatScenarios} from './facade-vat.js';
const form = document.querySelector('#facade-calculator');
const enquiry = document.querySelector('#facade-enquiry-form');
const byId = id => document.getElementById(id);
const format = value => new Intl.NumberFormat('nl-BE',{style:'currency',currency:'EUR'}).format(value);
let result = null;
const read = () => Object.fromEntries(Array.from(form.elements).filter(el => el.name).map(el => [el.name, el.type === 'number' || el.name === 'thickness' ? (el.value === '' ? NaN : Number(el.value)) : el.value]));
function adapt() {
  const p = read();
  const insulation = allowsInsulation(p.finish);
  byId('fac-insulation').hidden = !insulation;
  byId('fac-no-insulation').hidden = insulation;
  byId('fac-thickness').disabled = !insulation;
  if (!insulation) p.thickness = 0;
  byId('fac-aluminium').disabled = !allowsAluminium(p);
  byId('fac-stone').disabled = p.building === 'new';
  byId('fac-plinth').querySelector('option[value="finish"]').disabled = p.finish.startsWith('brick_');
  if (p.finish.startsWith('brick_') && p.plinth === 'finish') byId('fac-plinth').value = 'stone';
  byId('fac-plinth-length').disabled = byId('fac-plinth').value === 'none';
  byId('fac-net').max = byId('fac-gross').value || '1000';
  document.querySelectorAll('[data-finish]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.finish === p.finish)));
}
function showError(error) {
  result = null;
  byId('fac-error').textContent = error;
  byId('fac-error').hidden = false;
  byId('fac-result-values').hidden = true;
  byId('fac-result-empty').hidden = false;
  byId('facade-enquiry').hidden = true;
}
function render() {
  try {
    result = calculateFacade(read());
    byId('fac-error').hidden = true;
    byId('fac-result-empty').hidden = true;
    byId('fac-result-values').hidden = false;
    byId('facade-enquiry').hidden = false;
    const p = result.project;
    byId('fac-selection').textContent = `${finishes[p.finish]} · ${p.gross} m² totaal · ${p.net} m² zonder openingen${p.thickness ? ` · ${p.thickness} cm isolatie` : ''}`;
    const taxes = facadeVatScenarios(result.arcadianBeforePremium, p.building);
    byId('fac-total').textContent = taxes.map(tax => format(tax.total)).join(' – ');
    byId('fac-vat-caption').textContent = `${taxes.length > 1 ? 'Inclusief 6–21% btw' : 'Inclusief 21% btw'} · vóór eventuele premies`;
    const lines = [
      ['Gevel, materiaal en plaatsing (excl. btw)', result.arcadianFacade],
      ...result.extraLines.map(line => [`${line.label} · ${line.quantity} m`, Math.round(line.quantity * line.rate * PRICE_FACTOR * 100) / 100]),
      ['Subtotaal excl. btw', result.arcadianBeforePremium],
      ...taxes.map(tax => [`${tax.rate}% btw${tax.rate === 6 ? ' (als je voldoet aan de voorwaarden)' : ''}`, tax.vat]),
    ];
    byId('fac-breakdown').replaceChildren(...lines.map(([label,value]) => {
      const row = document.createElement('div');
      if (label === 'Subtotaal excl. btw') row.className = 'fac-subtotal';
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = format(value);
      row.append(dt,dd); return row;
    }));
    composeMessage();
  } catch (e) {showError(e.message);}
}
function composeMessage() {
  if (!result) return;
  const p = result.project;
  const taxes = facadeVatScenarios(result.arcadianBeforePremium, p.building);
  const consumerRange = taxes.map(tax => format(tax.total)).join(' – ');
  const fields = [
    'ARCADIAN | Gevelaanvraag | prijsmodel 2026-10-15',
    `${p.building === 'new' ? 'Nieuwbouw' : 'Renovatie'}; ${finishes[p.finish]}; isolatie ${p.thickness} cm`,
    `Oppervlakte inclusief openingen: ${p.gross} m²; exclusief: ${p.net} m²; hoogte: ${p.height} m`,
    `Plint: ${p.plinth}, ${p.plinthLength} m; aluminium vensterbanken: ${p.aluminium} m; arduin: ${p.stone} m`,
    `Rekenbasis excl. btw vóór premies: ${format(result.arcadianBeforePremium)}. Werfkosten te bevestigen.`,
    ...taxes.map(tax => `Bij ${tax.rate}% btw: ${format(tax.vat)} btw; ${format(tax.total)} incl. btw.`),
    '6% btw is alleen van toepassing als aan de wettelijke voorwaarden is voldaan. Definitieve prijs en btw in de offerte.',
    `Postcode/gemeente: ${byId('facade-postcode').value.trim()}`,
    `Bron (door klant): ${byId('facade-source').value || 'Niet opgegeven'}`,
    `Gewenste uitvoeringsperiode: ${byId('facade-timing').value.trim() || 'Nog te bespreken'}`,
  ];
  const params = new URLSearchParams(location.search);
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_content']) {
    const value = params.get(key);
    if (value) fields.push(`${key}: ${value.replace(/[\r\n\x00-\x1f]/g,' ').slice(0,100)}`);
  }
  const notes = enquiry.querySelector('[data-facade-notes]').value.trim();
  if (notes) fields.push(`Extra informatie: ${notes}`);
  byId('facade-message').value = fields.join('\n');
  byId('fac-whatsapp').href = `https://wa.me/32466495409?text=${encodeURIComponent(`Dag ARCADIAN, ik wil mijn gevelproject bespreken: ${finishes[p.finish]}, ${p.gross} m², isolatie ${p.thickness} cm. Voorlopige indicatie ${consumerRange} incl. btw, vóór premies; btw en werfkosten te bevestigen.`)}`;
}
form.addEventListener('input', () => {adapt(); render();});
form.addEventListener('change', () => {adapt(); render();});
const calculate = () => {adapt(); render();};
byId('fac-calculate').addEventListener('click', event => {event.preventDefault(); calculate();});
form.addEventListener('submit', event => {event.preventDefault(); calculate();});
enquiry.addEventListener('input', composeMessage);
enquiry.addEventListener('change', composeMessage);
enquiry.addEventListener('submit', event => {
  if (!result || !form.checkValidity()) {event.preventDefault();event.stopImmediatePropagation();showError('Controleer eerst je berekening.');form.scrollIntoView({block:'start'});return;}
  composeMessage();
}, true);
byId('fac-reset').addEventListener('click', () => {form.reset();result=null;adapt();byId('fac-result-values').hidden=true;byId('fac-result-empty').hidden=false;byId('facade-enquiry').hidden=true;byId('fac-error').hidden=true;byId('fac-building').focus();});
adapt();

document.querySelectorAll('[data-finish]').forEach(button => button.addEventListener('click', () => {
  byId('fac-finish').value = button.dataset.finish;
  calculate();
  document.getElementById('calculator').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}));
