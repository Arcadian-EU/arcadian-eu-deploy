// Consumer budget scenarios; eligibility for the reduced rate is confirmed in the quote.
const cents = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function facadeVatScenarios(base, building) {
  if (!Number.isFinite(base) || base < 0 || !['new','renovation'].includes(building)) throw new RangeError('Ongeldige btw-berekening.');
  return (building === 'renovation' ? [6,21] : [21]).map(rate => {
    const vat = cents(base * rate / 100);
    return {rate, vat, total:cents(base + vat)};
  });
}
