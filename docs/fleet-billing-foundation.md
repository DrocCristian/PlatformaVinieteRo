# Vignexo Business — specificație și registru juridic de implementare

Data cercetării: 20 septembrie 2026. Implementare locală pe ramura feat/fleet-billing-foundation.
Stare: schelet funcțional de cont de firmă și prototip vizual; nu este o platformă comercială autorizată.

## Cerința confirmată

Firma selectează una sau mai multe mașini, comandă produsele necesare și plătește imediat comanda. Nu se solicită credit comercial sau facturare cu plată ulterioară. Se dorește o factură comună pentru mașinile incluse, în măsura în care același emitent poate factura legal produsele respective. Clientul descarcă documentele și rapoartele oricând: pe vehicul, mai multe vehicule sau întreaga firmă, pe interval ales, jumătate de lună, lună sau an. Perioada raportului nu stabilește termenul emiterii facturii.

## Decizii pentru cod

1. Cumpărătorul este firma, iar numerele vehiculelor identifică pozițiile/anexele. Nu se generează implicit câte o factură per vehicul.
2. O singură plată și o singură factură sunt concepte diferite. Contractul poate impune documente de la furnizori diferiți. Gruparea propusă este cumpărător + emitent + monedă, după validarea tratamentului fiscal.
3. Descărcarea documentului păstrează seria/numărul. O poziție facturată nu este eligibilă pentru o a doua factură; corecțiile vor avea document distinct și referință la original.
4. Rapoartele centralizează înregistrările și corecțiile; nu produc obligații fiscale și nu sunt denumite facturi. Monedele nu sunt adunate într-un total fără curs documentat.
5. Nu se presupune că toate taxele rutiere au TVA identic sau că statutul românesc de neplătitor TVA elimină obligațiile transfrontaliere.
6. Datele vehiculului și ale remorcii se păstrează distinct. Pentru semiremorci nu se însumează automat masele F.1/F.2. F.3 și clasificarea legală a ansamblului se verifică în regula țării.
7. O regulă parțială, contract lipsă, model fiscal necunoscut sau integrare necertificată blochează checkout-ul produsului afectat.
8. Succesul plății nu înseamnă emitere. Contractul de integrare va defini confirmarea, verificarea după timeout, idempotency, emiterea parțială și rambursările.

## Analiza juridică — ce s-a verificat și ce rămâne deschis

Această cercetare identifică reguli de arhitectură și surse oficiale. Nu reprezintă analiza integrală, consolidată, articol cu articol, a celor nouă jurisdicții. Nicio țară nu a fost marcată ca aprobată pentru vânzare. Contractele furnizorilor și interpretările fiscale necesare nu au fost primite.

### Facturare și centralizare

- Directiva TVA 2006/112/CE, art. 223, reglementează facturile centralizatoare în condițiile prevăzute de lege; alegerea unui raport anual nu conferă dreptul de a amâna toate facturile până la sfârșitul anului. Pagina consolidată consultată este din 2020 și nu este folosită pentru calculul automat al termenelor din 2026. [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2006/112/2020-01-01)
- Codul fiscal român, art. 319 alin. (16), (17) și (20), trebuie verificat în forma în vigoare pentru termen, centralizare și conținut. Normele ANAF consultate explică legătura centralizării cu documentele justificative, însă versiunea disponibilă este istorică. În cod nu a fost activat un algoritm fiscal bazat pe acea versiune. [Norme ANAF](https://static.anaf.ro/static/10/Anaf/legislatie/HG_1_2016_norme%20CF.pdf)
- OUG 120/2021, forma consolidată afișată la 1 iunie 2026, art. 10 alin. (7) și art. 10¹ alin. (2¹): termenul general consultat pentru transmitere este de 5 zile lucrătoare, cu raportare și la termenul legal de emitere. Aplicabilitatea, excepțiile și încadrarea operațiunii trebuie determinate separat. Factura electronică este XML structurat; un PDF nu este echivalentul întregului flux RO e-Factura. Schema rezervă stări separate pentru evaluare, transmitere și acceptare. [Portal Legislativ](https://legislatie.just.ro/Public/DetaliiDocument/247243)
- Înainte de activare: contabilul confirmă pentru fiecare produs rolul Vignexo (revânzător/agent), emitentul, locul prestării, TVA/exceptare, obligațiile de înregistrare, comisionul, avansurile, corecțiile, cursul valutar, seriile, termenele și RO e-Factura. Lipsa TVA în România nu este o regulă globală pentru toate produsele.

### Protecția clientului și date

- Pentru consumatori, OUG 34/2014 conține cerințe de informare și condiții pentru începerea serviciilor în perioada de retragere. Nu se extinde automat regimul B2B asupra cumpărătorilor persoane fizice; nici simpla existență a unui cont de firmă nu justifică clasificarea unei achiziții personale ca B2B. [Act oficial](https://legislatie.just.ro/Public/DetaliiDocument/158913)
- GDPR art. 5 și 25: minimizarea datelor și protecția prin proiectare. Firma vede numai propria flotă/documentație; rapoartele nu sunt publice. Nu se introduce localizarea șoferului sau colectarea documentelor de identitate în acest schelet. Sunt necesare politici de retenție pe scop, contracte cu procesatorii și fluxuri de acces/ștergere care respectă păstrarea documentelor contabile. [Comisia Europeană](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)

## Matrice de țări — toate în așteptare pentru lansare

| Țară | Bază verificată / sursă | Ce trebuie închis înainte de activare |
|---|---|---|
| AT | [Mautordnung, pagina curentă indică versiunea 87 din 1.1.2026](https://www.asfinag.at/maut-vignette/mautordnung/); [ANB, secțiunile 5, 8, 14](https://shop.asfinag.at/de/infoseiten/allgemeine-nutzungsbedingungen/) | Regim B2B/B2C, activare, derogări tranzitorii de masă, axe remorcă, GO-Maut, permisiunea/modelul de revânzare și excepțiile exacte. |
| HU | [HU-GO](https://www.hu-go.hu/); [categoria J5](https://hu-go.hu/articles/article/j5-toll-category) | Clasificare D1/D2/U vs HU-GO, axe ansamblu, emisii, canal de declarare, drept de distribuție și documente fiscale. |
| RO | [Portal CNAIR TollRo](https://portal.etoll.ro/) | Forma consolidată a Legii 226/2023 și modificările, data efectivă/tranziția, masa relevantă, convențiile distincte și tarifarea pentru data călătoriei. Nu activăm producția doar pe baza datei hardcodate în clasificatorul preliminar existent. |
| BG | [Condiții BG Toll, route pass](https://web.bgtoll.bg/Content/tc/termsandconditions.html?languageCultureName=en-GB) | Legea drumurilor/normele actuale, praguri/axe/remorci, rută și moment de valabilitate, API, contract și document fiscal. |
| CZ | [MYTO CZ — vehicule taxabile](https://myto.gov.cz/en/charged-vehicles/vehicles-subject-to-toll-payment) | Legea și normele actuale, categoria/masele, emisii și clasa CO₂, dispozitiv/serviciu acceptat, integrare distinctă față de eDalnice. |
| SK | [eZnamka — legislație, inclusiv Legea 488/2013](https://eznamka.sk/en/evignettes/legislation) | Reguli M1/N1/O1/O2, sistemul eMyto pentru vehicule grele, legea și norma actuală pentru acesta. Accesul direct la pagina eMyto nu a fost disponibil în verificarea web. |
| SI | [Guvern — taxare/DarsGo](https://www.gov.si/teme/cestnina/) | Legea/normele curente, clase 2A/2B, DarsGo/axe, Karavanke separat, condiții pentru distribuție și dispozitive. |
| CH | [BAZG — LSVA/PSVA](https://www.bazg.admin.ch/de/schwerverkehrsabgabe-lsva-psva-schweiz); [FAQ e-vinietă](https://www.bazg.admin.ch/de/faq-vignette-und-e-vignette-erwerb) | BAZG precizează că nu are parteneri oficiali de distribuție pentru e-vinietă; nu afișăm acest statut. Confirmăm cumpărarea în numele clientului, automatizarea permisă, LSVA/PSVA și rolul remorcii. |
| MD | [e-Vinieta FAQ, punctele 1–6](https://evinieta.gov.md/Home/FAQ) | Camioanele/remorcile și tractoarele/semiremorcile sunt menționate explicit; validăm categoria fiscală, înmatricularea străină, autorizațiile/scutirile, acordul și canalul tehnic. |

Pentru fiecare produs, registrul final trebuie să conțină act/articol, versiune, interval de aplicare, sursa oficială, categoria, F.1/F.2/F.3 relevante, axe, EURO/CO₂, remorcă, rețeaua taxabilă, fus orar, valabilitate, dovada emiterii, anulare/corecție, taxe permise, emitent fiscal și responsabilul verificării. Nici o pagină FAQ și nici un răspuns comercial nu înlocuiesc această fișă.

## Ce conține codul realizat

- /cont/firma: creare/editare date firmă, mai multe firme separate pe proprietar.
- Vehicule de flotă: autoturism, autoutilitară, camion, cap tractor, remorcă, semiremorcă; date tehnice de bază cu valori necunoscute explicite.
- Ciornă comună pentru maximum 100 de vehicule; țări/perioadă comună, remorcă alocată vehiculului, fotografie a datelor firmei și configurației în momentul salvării.
- Domain billing planner: grupează poziții compatibile fără a emite facturi și respinge poziții deja facturate.
- Registru financiar în unități monetare întregi, corecții cu semn negativ, documente cu emitent separat și referință fiscală, chei de deduplicare.
- Raport CSV privat pe firmă/vehicul/perioadă; protecție împotriva formulelor în foile de calcul; limită explicită de 1.000 de poziții.
- Migrare cu RLS, acces numai pentru proprietarul firmei, chei externe compuse pentru prevenirea amestecului de firme. Clientul nu poate scrie în registrul financiar sau modifica facturi.
- /flote/demo: demonstrație interactivă cu date fictive, fără autentificare și fără transmitere de date.
- Activare cont real condiționată de FLEET_WORKSPACE_ENABLED; implicit false. Migrarea nu a fost aplicată la Supabase remote, iar codul nu a fost publicat.

## Ce nu este încă implementat sau confirmat

Nu există emitere fiscală reală, XML/ANAF, PDF fiscal, sincronizare facturi, checkout real multi-vehicul, furnizori live, invitații pentru angajați/contabili, programare automată a rapoartelor, notificări, import CSV de flotă sau rute conforme pentru camioane. Formularul salvează ciorne, nu comenzi plătite. Raportul exportă înregistrări postate de un viitor conector contabil; nu transformă ciorne în cheltuieli. Afisarea vehiculelor are o limită explicită, fără a pretinde suport pentru flote nelimitate.

Rutele pentru camioane trebuie să țină cont ulterior de înălțime, lățime, lungime, masă/axe, ADR, restricții locale și temporare; această extensie nu este un navigator pentru camioane.

## Următoarele etape concrete

1. Confirmarea modelului fiscal cu contabilul și a canalelor cu furnizorii. Stabilirea documentului comun posibil pentru fiecare combinație de produse.
2. Finalizarea fișelor juridice pe produs și testelor de limite/valabilitate; conectarea la catalogul oficial.
3. Integrarea contabilă cu numerotare atomică, facturi imutabile, corecții, XML și confirmările RO e-Factura unde se aplică. Calculul termenelor folosește calendarul legal relevant, nu numai luni–vineri.
4. Checkout multi-vehicul cu prețuri pe server, idempotency, confirmare de plată, emitere pe poziție, soluționarea eșecurilor și reconciliere.
5. Aplicarea migrației în mediul de test al proiectului, verificare reală autentificată, apoi roluri de echipă, exporturi voluminoase și rapoarte programate.
6. Publicare numai după aceste validări. Demonstrația locală nu este o certificare juridică sau fiscală.

## Acceptanță

Douăzeci de mașini ale aceleiași firme pot forma o comandă și, dacă emitentul/modelul permit, o factură cu 20 de poziții/anexă. O a doua descărcare păstrează factura. Un raport anual nu refacturează nimic. O mașină a altei firme nu poate fi accesată prin schimbarea ID-ului. O plată confirmată cu emitere incompletă nu apare ca flotă complet acoperită. Produsul neaprobat nu poate deveni plătibil prin modificarea datelor din browser.
