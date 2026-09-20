# Integrarea cumpărării cu contul și flota

## Implementat
- `/cumpara`: acces autentificat, vehicule personale sau firma selectată.
- VIN modern și excepție explicită pentru seria unui vehicul vechi; datele existente fără VIN rămân compatibile.
- Editarea VIN-ului și datelor tehnice pentru vehiculele flotei.
- Produse și date independente pentru fiecare vehicul, grupate într-o singură ciornă.
- Recitirea vehiculelor pe server, verificarea firmei/proprietarului, respingerea vehiculelor arhivate, străine sau duplicate și a remorcilor reutilizate.
- Preferință de notificare pe vehicul, nebifată implicit, păstrată în ciornă; nu pornește trimiterea e-mailurilor.
- Datele tehnice necunoscute trimit la verificare separată. Masele tractorului și semiremorcii nu se însumează automat.
- `/cumpara/flota-demo`: demonstrație cu date fictive, fără salvare pe server.
- `/cumpara/demo?lang=de` și celelalte limbi ale site-ului: formularul principal localizat, selector într-un singur meniu cu steaguri. Notele juridice detaliate ale prototipului sunt încă în română, marcate explicit; sursele oficiale sunt accesibile. Contul și formularul comenzii comune sunt în română.

## Activare
`PURCHASE_WORKSPACE_ENABLED` și `FLEET_WORKSPACE_ENABLED` controlează funcțiile serverului. În Netlify Deploy Preview sunt activate la build; în producție rămân false dacă nu sunt activate explicit. Acestea sunt flaguri publice de disponibilitate, nu secrete și nu înlocuiesc autentificarea/RLS.

Migrarea `fleet_billing_foundation` este necesară înainte de `purchase_workspace`. Modificările sunt aditive. Tabelele financiare nu permit scrierea din conturile clienților. Ciornele nu reprezintă oferte, plăți sau viniete.

## Verificare
Testele PostgreSQL se rulează într-un container temporar fără rețea și fără porturi expuse. Acoperă izolarea a două conturi și firme, interdicția modificării stării financiare, cheile externe și accesul anonim. Testele acțiunii serverului verifică identitatea recitită, redirecționarea la autentificare, limitele de payload și mesajele fără detalii private.

## Rămâne înaintea lansării comerciale
Contracte și API-uri, fișe juridice aprobate pe produs, rutare reală pentru vehicule grele și restricții, oferte semnate/versionate, prețuri și comisioane, plată/emitere cu reconciliere și rambursări, facturare fiscală/RO e-Factura unde este aplicabilă, e-mail operațional. Traducerea juridică finală necesită verificare înainte de vânzare.

Nu există prețuri inventate, încasări reale sau emitere fiscală în acest modul. Main nu este modificat prin publicarea previzualizării.

## Starea bazei de date
Migrațiile 20260920120806_fleet_billing_foundation și 20260920120817_purchase_workspace au fost aplicate în proiectul voimvxapeosiijpdjvok. Verificarea remote confirmă RLS, refuzul accesului anonim și imposibilitatea modificării statusului de către clienți. Advisorul nu a adăugat avertizări pentru noile tabele; avertizarea preexistentă privind verificarea parolelor compromise rămâne în configurația Auth.

Testul purchase-rls.sql a trecut și în proiectul Supabase remote, într-o tranzacție încheiată cu ROLLBACK; nu au rămas conturi sau comenzi de test.

Exportul privat din cont include și noile ciorne, flota și documentele accesibile utilizatorului prin RLS.
