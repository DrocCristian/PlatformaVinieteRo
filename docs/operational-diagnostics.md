# Diagnostic operațional Vignexo

Implementat la 20 septembrie 2026. Plățile și emiterea rămân exclusiv în sandbox.

## Ce se înregistrează

Serverul scrie câte un obiect JSON per operație finalizată: event=operation_finished, schema_version=1, operation, outcome, code, request_id (UUID generat intern), duration_ms, timestamp, environment, deployment, commerce_mode.

Operații: autentificare/înregistrare/recuperare/sesiune/callback; salvare profil, vehicul, călătorie, traseu, preferințe și solicitări de suport; arhivare; creare Checkout test; webhook Stripe; lot și element de emitere. onRequestError înregistrează erorile de server gestionate de Next.js. Dacă Next furnizează un digest numeric, acesta este disponibil și pe pagina de eroare a contului.

Câmpurile suplimentare permise sunt doar coduri de furnizor enumerate explicit, status HTTP 400–599, digest numeric, tip de rută enumerat și contoare numerice limitate. Nu se copiază în aceste evenimente e-mailuri, parole, numere de înmatriculare, identificatori de utilizator/comandă/Stripe, documente, URL-uri, antete, corpuri de cereri, mesaje sau stack-uri. Această garanție privește logurile introduse aici; logurile native ale platformei și furnizorilor au politici separate.

request_id nu este preluat din cererea clientului. Nu identifică o persoană sau o sesiune și nu corelează automat operații între servicii. Formularele cu ActionState afișează codul la erori operaționale. Checkout afișează referința UUID validată, iar API-urile și callbackul returnează X-Request-ID. Răspunsurile nu se cachează.

duration_ms măsoară doar intervalul operației instrumentate, nu LCP sau durata completă a navigării. Evenimentul server.request pornește în hookul de eroare: durata lui nu reprezintă durata cererii. Nu există încă monitorizare a performanței reale din browser.

## Investigarea unei probleme

1. Solicitați codul suport și ora aproximativă, fără parolă sau date de card.
2. În Netlify, deschideți proiectul vinietaeuropeana și logurile funcției server Next.js pentru deploy-ul activ.
3. Căutați UUID-ul în request_id sau codul numeric în digest. Verificați operation, outcome și code.
4. outcome=invalid indică date respinse; denied poate indica autentificare/semnătură refuzată; pending indică o etapă încă neconfirmată; error indică o problemă tehnică. Pentru emitere, provider_rejected este un refuz de business, nu o defecțiune a serverului.
5. configuration_missing cu HTTP 503 este normal cât timp sandboxul comercial nu are toate variabilele necesare.

Verificați politica efectivă de retenție și acces din planul Netlify. Această implementare nu adaugă arhivare persistentă, dashboard extern sau alerte automate prin e-mail.

## Stripe test

Semnătura se verifică pe corpul original al cererii. Evenimentele live sunt respinse. Confirmarea plății păstrează tranzacția SQL care verifică sesiunea, suma, moneda și mediul, plus deduplicarea evenimentului.

payment_confirmed indică acceptarea evenimentului de funcția SQL; payment_duplicate indică un ID de eveniment deja cunoscut. Logurile reprezintă încercări de procesare și nu trebuie folosite ca registru financiar sau număr de plăți unice. Registrul din baza de date rămâne sursa de adevăr.

checkout_expired și payment_failed sunt doar observații pentru evenimente semnate de test; nu modifică starea comenzii și nu programează emiterea. Abandonarea checkoutului, rambursările și reconcilierea completă nu sunt implementate prin această etapă.

Erorile de persistență întorc HTTP 500, astfel încât Stripe să poată reîncerca. Nu există chei comerciale noi sau activare de plăți reale.

## Emitere

Răspunsul lotului include claimed, completed, failed, manualReview, rejected și requestId.
completed înseamnă rezultat salvat, inclusiv refuz ori necesitate de verificare manuală; nu înseamnă că toate vinietele au fost emise.

O eroare tehnică la un element nu oprește restul lotului. Dacă failed > 0, endpointul întoarce HTTP 500 și partial_failure. Un lot gol ori cu refuzuri salvate poate întoarce 200. Fiecare element are propriul eveniment de diagnostic fără identificatorul comenzii.

Elementele eșuate păstrează lease-ul existent și ajung în fluxul existent de verificare manuală. Nu se reemite automat o vinietă cu rezultat incert; sunt păstrate cheile de idempotency și funcțiile SQL existente.

## PostHog și limite

Proiectul EU Default project, ID 279270, este asociat Vignexo pentru diagnostic exclusiv în Deploy Previews, cu autorizarea utilizatorului. Înaintea asocierii nu existau evenimente colectate sau domenii configurate. Autocapture, session replay, excepțiile automate, console logs și performance capture sunt dezactivate în proiect; eliminarea IP-urilor este activă.

`vignexo_preview_operation` este un eveniment operațional explicit trimis de server prin Capture API. Nu există SDK în browser, cookies PostHog, pageviews sau identificare persoane. Payloadul este reconstruit dintr-o listă închisă: application, environment, schema_version, synthetic, operation, outcome, code și duration_ms. Nici request_id, digest, provider_code, IP, URL, query, mesaje, stack-uri sau obiecte brute nu sunt trimise. `$process_person_profile=false`, `$geoip_disable=true`. Identificatorul fix `vignexo-preview-server` reprezintă serviciul: numărul de utilizatori/sesiuni din aceste evenimente NU are semnificație.

Aceste evenimente nu sunt integrarea completă Error Tracking și nu generează stack-uri de excepții. Nu măsoară comportamentul browserului, abandonul sau disponibilitatea externă a site-ului. SMTP și conexiunile comerciale rămân separate.

Activarea cere simultan build cu `CONTEXT=deploy-preview`, `POSTHOG_DIAGNOSTICS_ENABLED=true`, proiectul `279270`, token de proiect și host EU `https://eu.i.posthog.com`. Variabilele POSTHOG sunt configurate numai în contextul Netlify Deploy Previews; nu sunt expuse prin NEXT_PUBLIC sau next.config. Gate-ul de build este false în producție, branch deploy și local, inclusiv dacă variabilele runtime există. Dezactivare rapidă: POSTHOG_DIAGNOSTICS_ENABLED=false în preview și redeploy.

Trimiterea este programată prin Next.js `after()`, după răspuns, cu timeout 2 secunde, fără retry, redirecționări sau cookies. Defecțiunile colectării nu modifică rezultatul operației; în logul serverului apare numai un mesaj fix. Colectarea este best-effort, fără coadă persistentă. Eșecurile de înregistrare a callbackului în afara unui request sunt ignorate.

Test sintetic explicit: într-un mediu controlat cu variabilele de preview, `node scripts/verify-posthog.ts` trimite o operație server.request/completed cu synthetic=true. Nu este rulat automat la build sau startup. Un răspuns HTTP reușit nu dovedește ingestia: confirmați evenimentul în proiectul EU 279270. Pentru integrarea `after()` pe deploy, accesați `/auth/callback` fără cod: rezultatul așteptat este auth.callback/callback_missing fără transmiterea URL-ului. Excludeți synthetic=true din analizele operaționale.

Documentație: https://posthog.com/docs/api/capture și https://nextjs.org/docs/app/api-reference/functions/after.

## Validare

Testele unitare verifică filtrarea datelor, izolarea eșecurilor de logare, referințele, protecțiile Stripe și rezultatele parțiale de emitere. Testele de endpoint execută codul real al rutelor cu dependințe izolate și fără apeluri către Stripe/Supabase. Testele Playwright verifică răspunsurile neconfigurate și redirectul callbackului, inclusiv antete și referințe.
Aceste teste nu înlocuiesc un checkout integrat cu contul Stripe și furnizori activați.

Documentație primară:
- https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://docs.stripe.com/webhooks

Rezultat verificare 20.09.2026: 50 teste unitare reușite; din cele 52 scenarii Playwright, 50 au trecut inițial, iar cele două verificări ale antetului callback au trecut după corecție. Retestarea celor 8 scenarii de autentificare și diagnostic a trecut integral pe build-ul final. TypeScript, ESLint și build Next.js reușite în container. Testele au identificat și corectat suprascrierea antetului no-referrer al callbackului de către regula generală.
