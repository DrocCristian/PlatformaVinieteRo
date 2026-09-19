# Conturi și vehicule

Supabase proiect voimvxapeosiijpdjvok. Migrarea customer_accounts creează profiles și vehicles cu RLS, politici SELECT/INSERT/UPDATE doar pentru proprietar și drepturi pe coloane. Nu există acces anonim, DELETE sau posibilitate de transfer al proprietarului. Arhivarea este reversibilă. Autentificarea folosește exclusiv publishable key și cookie HttpOnly; nicio cheie administrativă în aplicație. Toate acțiunile verifică utilizatorul prin getUser; rutele de cont sunt dinamice și private/no-store.

## Configurare e-mail necesară înainte de validarea înregistrării

Configurat și verificat în dashboard: Site URL http://127.0.0.1:3000 și redirecturi exacte:
- http://127.0.0.1:3000/auth/callback
- http://127.0.0.1:3000/auth/callback?next=/cont/parola

APP_URL trebuie să corespundă originii accesate. Pentru publicare se folosește HTTPS și domeniul final; fără wildcard. Păstrează confirmarea e-mail activată. Configurează SMTP pentru livrare către clienți; serviciul implicit poate limita destinatarii și frecvența. Fluxul PKCE presupune deschiderea linkului în același browser în care a fost inițiat.

Dashboardul a fost autentificat de utilizator. Site URL și cele două callbackuri au fost salvate și verificate. SMTP personalizat este dezactivat; se folosește serviciul implicit. Livrarea către utilizatori reali și recuperarea prin e-mail nu au fost încă testate. Nu se trimite e-mail de test fără un destinatar autorizat.

## Teste

SQL tests/database/account-rls.sql rulează în tranzacție cu ROLLBACK și utilizatori temporari: owner SELECT, interdicție INSERT/SELECT/UPDATE între utilizatori, interdicție mutare proprietar și acces anon, arhivare/restaurare. Nu lasă utilizatori sau date persistente. Testele de browser verifică redirectarea vizitatorilor, navigația formularelor și callback invalid. Testele unitare verifică datele și redirecționările. Autentificarea cu e-mail livrat și recuperarea completă rămân de validat după setările URL/SMTP.

## Verificare integrată

Un cont tehnic temporar a verificat autentificarea reală, profilul, salvarea persistentă a vehiculului, arhivarea, restaurarea, cookie-urile HttpOnly și deconectarea. Sesiunea a fost închisă și contul cu datele sale a fost eliminat după test. Nu s-a trimis niciun e-mail. Cele 6 scenarii desktop/mobil au trecut pe build-ul de producție; 7 teste unitare și verificările SQL RLS au trecut. Cache-Control private/no-store a fost verificat pe producție.
