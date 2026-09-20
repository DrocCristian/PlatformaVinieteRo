# Vignexo — stadiu și activare
Actualizat: 19 septembrie 2026. Operator comunicat: EvaMaria Shop SRL, România.
Acest document este un inventar tehnic; nu certifică pregătirea juridică sau comercială.

## Disponibil în această versiune
- Designul aprobat, nouă destinații și perioade de călătorie; catalog comercial blocat.
- Cont, profil, vehicule, călătorii persistente și arhivare.
- Diagnostic server cu coduri de suport și rezultate parțiale de emitere; vezi [operational-diagnostics.md](operational-diagnostics.md).
- Suport în cont, răspuns administrativ auditat, preferințe de notificare.
- Export personal JSON paginat, inclusiv comenzile și documentele de test; cerere de ștergere gestionată prin suport.
- Autentificare TOTP; administrare cu rol validat din app_metadata și aal2. Un client nu își poate acorda rol prin user_metadata.
- Comenzi de test, webhook Stripe cu verificarea semnăturii, tranzacție de înregistrare a plății, coadă persistentă și un singur job per articol.
- Nouă simulatoare de furnizor; succes/refuz/răspuns incert, stări parțiale, fără reemitere automată după întrerupere. Documentele sunt text de simulare, fără valoare de vinietă.
- Manifest și pagină offline pentru paginile publice; service worker-ul nu stochează date autentificate.
- Structuri separate pentru abonamente și mandate de reînnoire; activarea și debitarea nu sunt implementate.

## Activarea e-mailului
După activarea OX App Suite: creare contact@vignexo.com, confirmarea serverului/portului/TLS SMTP, a limitelor și a permisiunii de utilizare tranzacțională; DNS MX/SPF/DKIM/DMARC potrivit instrucțiunilor furnizorului. Nu ghici valorile DNS.
Configurează Supabase SMTP fără a publica parola; testează înregistrarea, confirmarea, resetarea parolei și livrarea către furnizori diferiți. Confirmarea emailului rămâne activă. Nu echivala plata serviciului OX cu existența cutiei poștale.

## Stripe sandbox — necesar înainte de testul integral de plată
Conectorul disponibil a identificat numai contul live Cristian Droc; nu a fost folosit pentru încasări.
Configurează un sandbox/test al operatorului, apoi variabile server:
COMMERCE_MODE=test; SUPABASE_SERVICE_ROLE_KEY; STRIPE_SECRET_KEY cu prefix sk_test_; STRIPE_WEBHOOK_SECRET; ISSUANCE_WORKER_SECRET aleator.
Nu folosi prefix NEXT_PUBLIC și nu comite cheile. Conturile obișnuite nu necesită cheia service-role.
Webhook: POST /api/stripe/webhook, evenimente checkout.session.completed și checkout.session.async_payment_succeeded.
Worker: POST /api/internal/issuance, Authorization: Bearer secret. Configurează un scheduler securizat, apoi verifică funcționarea lui înainte de a expune testarea.
Pagina /cont/testare oferă două produse fictive de câte 1 EUR; Austria selectabilă succes/refuz/timeout, Ungaria succes.
După fiecare plată: verifică ordinul, rulează worker-ul, rejucă webhook-ul, confirmă o singură emitere per articol. Testează SCA, anulare, plată întârziată, semnătură invalidă și timeout.
Orice cheie live este refuzată. Baza de date acceptă exclusiv environment=test și furnizori mock. Activarea comercială necesită o implementare și migrare revizuită separat.

## Administrare
Rolurile app_metadata.vignexo_role: superadmin, support, accounting. Atribuirea se face exclusiv printr-un canal administrativ de încredere, pentru un cont identificat de beneficiar.
Nu a fost atribuit automat niciun rol unui utilizator real.
Utilizatorul configurează autentificatorul în /cont/securitate. Administrarea verifică rolul și aal2 la fiecare pagină/acțiune; RLS impune aceeași regulă.
Support: solicitări și vizualizare comenzi. Accounting: comenzi și CSV. Superadmin: ambele, plus drept de citire audit.
CSV este limitat la ultimele 10.000 de comenzi; ecranul la 100. Auditul și jurnalul plăților nu sunt modificabile de client.
Informările Supabase privind absența politicilor pe payment_events și issuance_jobs sunt intenționate: numai service_role are acces.

## Ce nu este încă finalizat — independent de simpla activare SMTP
- Contracte de distribuție, documentații API, acreditări și medii sandbox ale furnizorilor pentru fiecare țară.
- Catalog comercial versionat, categorii/eligibilitate, fusuri orare, durate, tarife, taxe speciale, corecții și rambursări confirmate contractual.
- Emitere reală, documente oficiale, reconciliere cu furnizorul, anulare/rambursare autorizată, solduri preplătite și contabilitate.
- Checkout pentru oaspeți și revendicare securizată a comenzilor prin e-mail; integrarea finală a coșului comercial.
- Prețuri și beneficii aprobate pentru abonamente; debitare periodică, anulare și reînnoiri automate cu consimțământ și tratarea SCA.
- Furnizor și buget pentru rutare/geocodare; harta actuală selectează țări și nu certifică taxarea unui traseu rutier.
- Traducerea integrală DE/EN; preferința de limbă salvată nu înseamnă interfață tradusă.
- Notificări programate de expirare, livrarea documentelor prin email, flux de ștergere complet și politici de retenție aprobate.
- Datele complete ale firmei: CUI, registrul comerțului, sediu, reprezentant și date de contact.
- Termeni finali, informare GDPR, politica de rambursare pe țară, fiscalitate și relația contractuală cu procesatorii, revizuite de specialiști.
- Procedură de recuperare administrativă MFA, alerte operaționale externe și monitorizare reală în browser, restaurare backup verificată și test de încărcare.

Activarea emailului rezolvă livrarea mesajelor, nu autorizează vânzarea vinietelor.

## Verificare tehnică a versiunii
Build Next.js 16.3.5 / React 19.3.0 / Node 24, TypeScript și ESLint: reușite în containerul existent. 17 teste unitare, 12 scenarii E2E și 2 scenarii offline reușite. Flux autentificat real cu utilizator tehnic temporar: călătorie, suport, preferințe, export, TOTP, refuz acces administrativ fără rol, afișare mobilă și deconectare. Testele SQL au verificat izolarea proprietarului, MFA, rolurile, auditul și deduplicarea notificărilor de plată. Contul tehnic a fost eliminat după teste. Nu s-a făcut încă o plată prin Stripe Checkout și nu s-a emis nicio vinietă reală.
