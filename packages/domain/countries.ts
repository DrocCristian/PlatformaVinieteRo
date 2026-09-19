export const countries = [
  { code: 'AT', name: 'Austria', note: 'Vinietă digitală' },
  { code: 'HU', name: 'Ungaria', note: 'Vinietă electronică' },
  { code: 'RO', name: 'România', note: 'Rovinietă electronică' },
  { code: 'BG', name: 'Bulgaria', note: 'Vinietă electronică' },
  { code: 'CZ', name: 'Cehia', note: 'Vinietă electronică' },
  { code: 'SK', name: 'Slovacia', note: 'Vinietă electronică' },
  { code: 'SI', name: 'Slovenia', note: 'Vinietă electronică' },
  { code: 'CH', name: 'Elveția', note: 'Vinietă electronică' },
  { code: 'MD', name: 'Republica Moldova', note: 'Vinietă electronică' },
] as const;
export type CountryCode = typeof countries[number]['code'];
export function toggleCountry(selected: CountryCode[], code: CountryCode): CountryCode[] {
  return selected.includes(code) ? selected.filter(item => item !== code) : [...selected, code];
}
// Formatting only. Country-specific legal validation is a separate, pending layer.
export function normalizePlate(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]+/g, '');
}
export function isPreviewPlateValid(input: string): boolean {
  return /^[A-Z0-9]{2,12}$/.test(normalizePlate(input));
}
