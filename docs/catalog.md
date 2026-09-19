# Catalog și perioade de călătorie

- /catalog prezintă separat cele nouă țări. Toate sunt în pregătire; nu există produse sau tarife fictive în catalogul public.
- Planificatorul cere intrarea și ieșirea din fiecare țară selectată. Validează datele calendaristice, începutul în trecut și ordinea intervalului.
- Datele sunt zile calendaristice ale călătoriei, nu perioade de valabilitate a vinietelor. Activarea, fusul orar și eligibilitatea produsului necesită reguli distincte verificate.
- Schimbarea vehiculului, perioadei sau selecției de țări invalidează confirmarea anterioară. Datele rămân temporare în memoria paginii.
- packages/domain/quote.ts este un contract intern pentru viitoarele adaptoare. Folosește sume întregi în unități monetare minore și respinge duplicate, monede diferite, prețuri invalide, oferte expirate și amestecul test/live. Nu este un endpoint de plată și nu validează singur o comandă.
- Produsele simulate există exclusiv în testele unitare. Niciun furnizor nu este conectat și nicio comandă nu este emisă.
- Urmează adaptorul furnizorului autorizat, catalog server-side versionat, verificarea eligibilității pe țară și salvarea ofertei/comenzii înainte de Stripe.

## Medii existente

Aplicația publicată: https://vinietaeuropeana.netlify.app. Variabilele APP_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY și NODE_VERSION sunt configurate în contextul Production, toate scope-urile Netlify. Supabase Site URL indică domeniul public; allowlist include callbackurile exacte locale și publice, inclusiv recuperarea parolei. Confirmarea e-mail este activă; SMTP personalizat rămâne de configurat.
