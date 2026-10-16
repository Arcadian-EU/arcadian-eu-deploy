// Independently implemented from observed public pricing facts, 15 October 2026.
// Reference details and unresolved VAT/inclusion questions: docs/facades/research.html.
// Owner decision: match the reference before premiums; no price discount.
export const PRICE_FACTOR = 1;
export const finishes = {
  crepi: 'Crepi', cork_direct: 'Spuitkurk op bestaande ondergrond',
  cork_layer: 'Spuitkurk op uitvlakkingslaag',
  brick_ungrouted: 'Steenstrips, niet gevoegd', brick_grouted: 'Steenstrips, gevoegd',
  lime: 'Kaleien',
};
export const allowsInsulation = finish => !['cork_direct', 'lime'].includes(finish);
export const allowsAluminium = p => p.building === 'renovation' && (p.thickness > 0 || p.finish === 'lime');
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateFacade(input) {
  const p = {...input};
  const check = (ok, message) => {if (!ok) throw new RangeError(message);};
  check(['new', 'renovation'].includes(p.building), 'Kies nieuwbouw of renovatie.');
  check(Object.hasOwn(finishes, p.finish), 'Kies een afwerking.');
  for (const [key, min, max] of [['gross',1,1000], ['net',1,1000], ['height',1,25], ['thickness',0,30], ['plinthLength',0,100], ['aluminium',0,50], ['stone',0,50]]) {
    check(Number.isInteger(p[key]) && p[key] >= min && p[key] <= max, 'Controleer de afmetingen: gebruik gehele getallen binnen het bereik.');
  }
  check(p.net <= p.gross, 'De oppervlakte zonder ramen mag niet groter zijn dan de totale gevel.');
  check(p.thickness === 0 || (p.thickness >= 4 && p.thickness % 2 === 0), 'Kies een isolatiedikte van 4 tot 30 cm, per 2 cm.');
  check(['none','stone','finish'].includes(p.plinth), 'Kies een plintafwerking.');
  if (!allowsInsulation(p.finish)) p.thickness = 0;
  if (!allowsAluminium(p)) p.aluminium = 0;
  if (p.building === 'new') p.stone = 0;
  if (p.plinth === 'none') p.plinthLength = 0;
  if (p.finish.startsWith('brick_') && p.plinth === 'finish') p.plinth = 'stone';
  check(p.plinth === 'none' || p.plinthLength >= 1, 'Vul de lengte van de plint in.');

  const insulated = p.thickness > 0;
  const brick = p.finish.startsWith('brick_');
  const regular = !brick && p.finish !== 'lime';
  let rate;
  if (p.finish === 'crepi') rate = insulated ? 135 + (p.thickness >= 10 ? p.thickness : 0) : 100;
  else if (p.finish === 'cork_direct') rate = 90;
  else if (p.finish === 'cork_layer') rate = insulated ? 160 + (p.thickness >= 10 ? Math.ceil((p.thickness - 10) / 2) * 2 : 0) : 120;
  else if (brick) rate = (insulated ? 235 + (p.thickness >= 10 ? p.thickness : 0) : 200) + (p.finish === 'brick_grouted' ? 20 : 0);
  else rate = 75;
  if (regular && p.gross > 250) rate -= 2;
  if (!regular && p.net > 150) rate *= 0.95;
  if (regular && p.building === 'renovation') rate += 2;
  if (p.height > 10) rate += 5;
  const threshold = brick ? 100 : p.finish === 'lime' ? 75 : 50;
  const smallProject = (regular ? p.gross : p.net) < threshold ? 1200 : 0;
  const facade = rate * p.gross + smallProject;
  const plinthRate = p.plinth === 'none' ? 0 : p.plinth === 'stone' ? 110 : insulated ? 60 : 50;
  const extraLines = [
    {label: 'Gevelplint', quantity: p.plinthLength, rate: plinthRate},
    {label: 'Aluminium vensterbanken', quantity: p.aluminium, rate: 130},
    {label: 'Arduinen vensterbanken', quantity: p.stone, rate: 250},
  ].filter(line => line.quantity > 0);
  const extras = extraLines.reduce((sum,line) => sum + line.quantity * line.rate, 0);
  // Reference premium is recorded for parity only. Never promise eligibility or
  // present this old automatic deduction as an Arcadian subsidy.
  const referencePremium = p.building === 'renovation' && insulated && p.thickness >= 10 ? Math.min(p.net * 22, 2250) : 0;
  const floorAdjustment = Math.max(0, 10000 - (facade + extras - referencePremium));
  const referenceBeforePremium = facade + extras + floorAdjustment;
  const referenceTotal = referenceBeforePremium - referencePremium;
  return {
    project: p, rate, facade, smallProject, plinthRate, extraLines, extras,
    floorAdjustment, referencePremium, referenceBeforePremium, referenceTotal,
    arcadianBeforePremium: money(referenceBeforePremium * PRICE_FACTOR),
    arcadianFacade: money((facade + floorAdjustment) * PRICE_FACTOR),
    arcadianExtras: money(extras * PRICE_FACTOR),
  };
}
