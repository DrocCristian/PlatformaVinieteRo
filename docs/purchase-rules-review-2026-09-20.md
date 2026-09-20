# Formular unic: reguli și limite

Revizie: 20 septembrie 2026. Paginile publice și demonstrația folosesc aceeași componentă de cumpărare. Nicio modificare a COMMERCE_MODE, contractelor, credențialelor sau bazei de date.

## Interfață și validare

- Vehicul → țări și produse → verificare. Fără date de intrare/ieșire pentru un produs cu durată fixă.
- Număr, țară, VIN conform regulilor de previzualizare existente; datele din talon apar după țările alese.
- Câmpuri obligatorii publice: categorie, F.1, F.2; locuri pentru HU/RO/MD; înălțime axă față pentru SI; propulsie și roți pentru CZ; axe și EURO pentru încadrare grea; categorie și mase distincte pentru remorcă.
- Erorile sunt legate de câmp și focalizate. F.2 > F.1, mase nevalide, categoria incompatibilă și remorcile O1/O2 cu mase necorespunzătoare sunt respinse.
- Vehiculele salvate pot păstra o ciornă incompletă: interfața avertizează, iar serverul calculează `technicalReview` din profilul deținut de utilizator, nu din date tehnice pretinse de client. Ciorna nu este ofertă și nu autorizează plata.
- Produsele de autoturism nu sunt oferite profilurilor grele/alte categorii. Ruta este numai cerere de verificare, nu distanță taxabilă.
- Confirmarea se resetează la revenire sau schimbarea selecției. Notificările sunt nebifate implicit.

## Valabilitate estimată, nu emitere

| Țară | Calcul local | Ce rămâne de confirmat |
|---|---|---|
| AT | Zi, 10 zile, 2 luni calendaristice, sfârșit anual fix | Canalul de distribuție, așteptarea de 18 zile, momentul efectiv al activării |
| HU | Zi, 10 zile, lună calendaristică, sfârșit anual fix | D1/D2/U, produse regionale neincluse, momentul emiterii |
| RO | 1/10/30/60 zile incluzând începutul | Expirarea produsului de 12 luni și regimul la data activării, tranziția legală, VIN conform canalului |
| BG | 7 zile, sfârșitul weekendului | 24 ore cu fus/DST și început efectiv; limitele lunare/trimestriale/anuale prin ofertă |
| CZ | Zi, 10/30 zile, an calendaristic până în ziua anterioară aniversării | Categoria, propulsia, scutirile și fereastra de cumpărare |
| SK | Zi, 10/30/365 zile | Categoria M1 și remorca O1/O2, numărul de produse |
| SI | Săptămână, lună/an până la aceeași dată inclusiv, limitat la ultima zi a lunii | Lista DARS pentru 2A/2B, excepții și eventuale prelungiri pentru produse existente |
| CH | Sfârșit fix 31 ianuarie după anul produsului | Începutul efectiv după cumpărare și produsul separat al remorcii |
| MD | 7/15/30/90/180 zile incluzând începutul | Încadrarea, șederea cumulată peste 180 zile și alte categorii |

Calendarul folosește UTC numai pentru aritmetica datelor, fără a converti datele calendaristice în instanțe de emitere. Interfața identifică fusul țării. Pentru limite neconfirmate afișează „De confirmat de emitent”, fără a inventa ora finală. O dată anuală de circulație este o dată solicitată, nu începutul istoric al vinietei. Nu se garantează acoperire retroactivă. În producția comercială sunt obligatorii instanțele de început/sfârșit returnate de furnizor și verificarea lor pe server înainte de plată.

## Surse consultate

- Austria: https://www.asfinag.at/en/toll/vignette/digital-vignette/ și https://shop.asfinag.at/en/products/digital-vignette/2-month-vignette/
- Ungaria: https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates
- România: https://legislatie.just.ro/Public/DetaliiDocument/310825 și https://legislatie.just.ro/Public/DetaliiDocumentAfis/280935
- Bulgaria: https://web.bgtoll.bg/Evignette/Create?vignetteTypeID=28 și condițiile operatorului de vânzare UBB, aplicabile din 03.02.2026: https://ubb.bg/downloads/Document/397/en/General-Terms-e-Vignette-via-UBB-Mobile-EN-vsila-03022026_2.pdf
- Cehia: https://edalnice.gov.cz/files/EN_Payment_conditions.pdf, secțiunea IV (an, nu presupunere universală de 365 zile).
- Slovacia: https://eznamka.sk/en/evignettes/types-and-prices
- Slovenia: https://evinjeta.dars.si/en și https://pisrs.si/api/uradni-list/objava/u2024102.pdf
- Elveția: https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase
- Moldova: https://evinieta.gov.md/Home/Legislation și https://www.sfs.md/ro/ordinele-de-baze-de-date-de-generalizare/832
- Informare consumator: https://legislatie.just.ro/Public/DetaliiDocument/254147 (OUG 34/2014).

Ghidul PDF furnizat de utilizator este document de lucru, nu autoritate normativă. Nu a fost copiat ca termeni contractuali.

## Document comercial

`/conditii-cumparare` identifică firma pe baza datelor furnizate, explică previzualizarea, prețul defalcat, plata versus emitere, retragerea, corectările, facturile, notificările și reclamațiile. Este etichetat ca versiune de lucru, noindex, fără a cere o acceptare contractuală fictivă.

Rămân înainte de vânzare: contract/rol pentru fiecare furnizor, API și oferte reale, activare e-mail, informare finală GDPR și retenție, proceduri și termene de rambursare, validare fiscală și RO e-Factura, revizuire juridică și probe de emitere. Abonamentele nu sunt oferite. Nu se pretinde statut oficial.
