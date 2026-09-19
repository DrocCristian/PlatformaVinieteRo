# Vignexo

Prima fază: aplicație locală Next.js 16 / React 19 / TypeScript / Turbopack.

## Rulare în containerul existent

```powershell
docker exec -w /workspace platformavinietero-dev-20260919 npm ci
docker exec -w /workspace platformavinietero-dev-20260919 npm run dev
```

Containerul nu are porturi publicate. Într-un al doilea terminal pe gazdă, din repository:

```powershell
node scripts/local-preview.mjs
```

Deschide http://127.0.0.1:3000. Relay-ul este exclusiv local; serverul și compilarea rulează în container. Nu recrea containerul.

## Verificări (în /workspace, în container)

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
`npm run test:e2e` cu serverul pe portul 3000 și Chromium instalat pentru Playwright.

## Stadiu exact

- Pagina responsive, selecție manuală pentru nouă țări, formular vehicul și reconfirmare.
- Planificatorul păstrează date temporare. Pagina de cont salvează profilul și vehiculele în Supabase.
- Nicio ofertă, perioadă sau preț inventat; achizițiile sunt blocate.
- Supabase integrat: conturi, profil și vehicule persistente, cu RLS. Vezi docs/accounts.md pentru configurarea e-mailului.
- Spațiu client cu călătorii, suport, preferințe, export de date și autentificare TOTP. Administrare pe roluri cu MFA și audit.
- RO implementat; DE și EN rămân de implementat.
- Stripe test, webhook verificat și coadă persistentă pentru nouă conectori simulați. Configurarea testului integral este încă necesară. Abonamentele și mandatele sunt separate și neactivate.
- Validarea numărului auto este doar sintactică pentru previzualizare, nu validare juridică sau de eligibilitate.

## Condiții pentru activare

Reguli independente și versionate pe țară; contracte și API-uri autorizate; catalog verificat; RLS și autentificare; Stripe exclusiv test până la acceptare; idempotentă persistentă; teste și revizuire înainte de publicare. Nicio țară nu este activă comercial.

Erorile mici se corectează autonom. Erorile majore se discută cu beneficiarul. Nu se publică în GitHub înainte de compatibilitate, build și teste.

## Verificare inițială

Au trecut 4 teste unitare și 2 scenarii E2E (desktop și mobil), lint și TypeScript.
Browserul Chromium și bibliotecile sale sunt izolate în container. Pentru sesiunea curentă:

```sh
LD_LIBRARY_PATH=/tmp/viniete-libs/usr/lib/x86_64-linux-gnu:/tmp/viniete-libs/lib/x86_64-linux-gnu FONTCONFIG_FILE=/home/node/.config/fontconfig/fonts.conf npm run test:e2e
```

La recrearea mediului, bibliotecile Chromium trebuie pregătite din nou. Nu recrea containerul existent pentru acest motiv.

## Design inspirat din macheta aprobată

Fundal alpin generat, interfață bleumarin, panou alb și previzualizare mobilă. Harta MapLibre folosește frontiere Natural Earth locale; permite selecția țărilor, fără calcul de traseu ori taxe. Workerul MapLibre este copiat automat prin predev/prebuild; fișierele generate nu se versionează.

## Stadiul curent și activarea

Vezi docs/launch-readiness.md pentru funcțiile disponibile și lista explicită a lucrărilor rămase, inclusiv cele care nu depind de e-mail. Vezi docs/country-review.md pentru sursele și verificările pe țări. Platforma nu este finalizată pentru lansare comercială.
