import { z } from 'zod';
export const registrationCountries = ['RO','AT','HU','BG','CZ','SK','SI','CH','MD','DE','FR','IT'] as const;
export const credentialsSchema = z.object({
 email: z.email('Introdu o adresă de e-mail validă.').max(254),
 password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere.').max(128, 'Parola este prea lungă.')
});
export const vehicleSchema = z.object({
 plate: z.string().trim().toUpperCase().transform(s=>s.replace(/[\s-]+/g,'')).pipe(z.string().regex(/^[A-Z0-9]{2,12}$/, 'Introdu între 2 și 12 litere sau cifre.')),
 registration_country: z.enum(registrationCountries),
 label: z.string().trim().max(60, 'Denumirea poate avea cel mult 60 de caractere.')
});
export function safeReturnPath(value: string | null): string {
 return value === '/cont/parola' ? value : '/cont';
}
export type ActionState = { error?: string; success?: string; reference?: string };
