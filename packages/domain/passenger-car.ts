// Explicit declarations for the public preview. Never substitute invented masses
// or seat counts in the stored vehicle profile or in a supplier request.
export type CarAnswers = Record<string, string>;
export function validateCarAnswers(answers: CarAnswers, countries: string[]) {
  const errors: Record<string, string> = {};
  if (answers.standard !== 'yes') errors['car-standard'] = 'Confirmă tipul autoturismului sau revino la alegerea vehiculului.';
  if (countries.includes('HU') && !['up-to-7', '8-or-9'].includes(answers.seats)) errors['car-seats'] = 'Verifică numărul de locuri din talon, inclusiv șoferul.';
  if (countries.includes('SI') && !['2A', '2B'].includes(answers.slovenia)) errors['car-slovenia'] = 'Verifică încadrarea modelului la DARS înainte de a continua.';
  if (countries.includes('CZ') && !['standard', 'natural-gas', 'plugin', 'electric', 'hydrogen'].includes(answers.fuel)) errors['car-fuel'] = 'Alege propulsia autoturismului pentru Cehia.';
  if (countries.includes('CZ') && answers.fuel === 'plugin' && !['up-to-50', 'over-50'].includes(answers.co2)) errors['car-co2'] = 'Verifică emisiile CO₂ din documentele vehiculului.';
  return errors;
}
export function carCategoryHints(answers: CarAnswers, countries: string[]) {
  if (Object.keys(validateCarAnswers(answers, countries)).length) return [];
  const hints = ['Autoturism M1/M1G, maximum 3,5 t, 4 roți — confirmat de tine'];
  if (countries.includes('HU')) hints.push(answers.seats === 'up-to-7' ? 'Ungaria: D1 · maximum 7 locuri, inclusiv șoferul' : 'Ungaria: D2 · 8 sau 9 locuri, inclusiv șoferul');
  if (countries.includes('SI')) hints.push('Slovenia: clasa ' + answers.slovenia + ' declarată; confirmare finală DARS / emitent');
  if (countries.includes('CZ')) hints.push(['electric', 'hydrogen'].includes(answers.fuel) ? 'Cehia: verifică scutirea și notificarea necesară înainte de circulație; nu este acordată automat.' : 'Cehia: tariful se verifică în funcție de propulsie și, dacă este cazul, de emisiile CO₂.');
  return hints;
}
