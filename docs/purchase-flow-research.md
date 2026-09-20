# Vignexo — flux simplificat și condiții de lansare

Verificat la 20 septembrie 2026. Cercetare de produs și schelet UX, nu certificare juridică, autorizație de revânzare sau catalog comercial. Pagina nouă: `/cumpara/demo`, în română; producția și fluxurile traduse existente nu sunt înlocuite încă.

## Decizie de integrare

Păstrăm PR #1 în stadiu draft și validăm în Deploy Preview. Se poate construi acum interfața, modelul cererii și validările fără API. Activarea comercială se face separat, pe produs/țară, după contract, reguli fiscale, integrare și teste de emitere. Nu presupunem dreptul de a adăuga un comision: condițiile comerciale ale operatorului trebuie verificate.

## Fluxul propus

1. Număr, țară de înmatriculare, tip vehicul, VIN când este cerut; remorcă identificată separat. Seriile nestandard ale vehiculelor vechi merg la verificare.
2. Selectare țări într-un singur grup cu steaguri. Fiecare țară are durata sa și data de început; ora locală și anul produsului apar numai când sunt relevante. Datele tehnice se dezvăluie progresiv.
3. Rezumat comun, notificare de expirare opțională și nebifată implicit, confirmare explicită. Fără ofertă completă nu există total și nu se poate plăti.

Interfața folosește Arial (fontul proiectului), bleumarin pentru text, verde-lime pentru acțiunea principală, fundal luminos și formulare de minimum 16 px. Nu încarcă imagini mari proprii. Figma: skill-urile au fost identificate, dar niciun instrument Figma nu este disponibil în sesiune; nu s-a creat/modificat un fișier Figma.

## Matrice orientativă pentru vehicule ușoare

| Țară | Produse în prototip | Aspect critic / sursă |
|---|---|---|
| Austria | 1 zi, 10 zile, 2 luni, anuală | Zi calendaristică; anuală pe an. Activarea la distanță pentru 2 luni/anuală depinde de canal și statut B2C/B2B. Regula de 18 zile nu se elimină automat. [ASFINAG](https://help.asfinag.at/en/vignette-and-section-tolls/) |
| Ungaria | 1 zi, 10 zile, 1 lună, anuală națională | D1/D2/U; nu confundăm săptămânala de 10 zile cu 7 zile. Produsele județene/M1 regională necesită selecție de acoperire și sunt excluse din prototip. [Operator](https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-arak) |
| România | 1, 10, 30, 60 zile, 12 luni | Categorii și regim valabile la data folosirii; podurile separate. [Legea 226/2023 consolidată consultată](https://legislatie.just.ro/Public/DetaliiDocument/310825) |
| Bulgaria | 24 ore, weekend, 7 zile, 1/3/12 luni | Ora de activare pentru produsul zilnic; weekend fix, nu 48h arbitrare. Lansarea zilnicei din 03.02.2026 este menționată de dezvoltatorul oficial. [Aplicația RIA](https://apps.apple.com/me/app/bgtoll/id1446451736), [condiții BG Toll](https://web.bgtoll.bg/Content/tc/termsandconditions.html?languageCultureName=en-GB) |
| Cehia | 1, 10, 30 zile, 1 an | Ziua expiră la miezul nopții; propulsia/scutirile influențează tariful. [eDalnice](https://edalnice.gov.cz/en) |
| Slovacia | 1, 10, 30, 365 zile | 365 zile distinct de anul calendaristic; M1/N1 și O1/O2 au reguli de ansamblu. [NDS](https://eznamka.sk/en/evignettes/types-and-prices) |
| Slovenia | 7 zile, 1 lună, 1 an | Clase 2A/2B confirmate în lista DARS. Motocicletele au alte produse. Excepțiile și extensiile istorice nu se aplică automat produselor noi. [DARS](https://evinjeta.dars.si/en) |
| Elveția | anuală | Interval 1 decembrie anul precedent–31 ianuarie anul următor; remorcă eligibilă separat. [BAZG](https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase) |
| Moldova | autoturisme: 7, 15, 30, 90, 180 zile | Vehicule străine, categoria fiscală 8703; șederile >180 zile au tratament distinct. Autoutilitarele nu preiau automat acest catalog. [Legislație publicată de operator](https://evinieta.gov.md/Home/Legislation) |

VIN: [formularul oficial Moldova](https://evinieta.gov.md/) cere Cod VIN; [descrierea aplicației CNAIR eTarife](https://play.google.com/store/apps/details?hl=ro&id=ro.cnair.eTarife) include seria de șasiu la emitere. Prototipul o solicită pentru RO/MD; excepțiile exacte și verificările din registre se stabilesc cu API-ul autorizat. Celelalte țări nu primesc o obligație VIN universală inventată.

## Remorci și vehicule grele

Nu există un singur prag universal aplicabil fiecărui ansamblu. F.1 și F.2 nu sunt interschimbabile, iar F.3 și sarcina pe șa nu se deduc prin simpla adunare a maselor capului tractor și semiremorcii.

- AT: GO-Maut, axe/emisii și distanță pe rețeaua taxată; dispozitiv acceptat și verificarea eventualelor derogări. [ASFINAG GO](https://www.go-maut.at/)
- HU: HU-GO pentru categoriile grele eligibile; verificare distinctă de e-matrica și U. [Operator](https://nemzetiutdij.hu/en/)
- RO: textul consultat prevede schimbarea spre TollRo pentru marfă >3,5 t la 01.10.2026. Cursa care traversează schimbarea nu se calculează cu un singur tarif presupus. [Lege](https://legislatie.just.ro/Public/DetaliiDocument/310825)
- BG: permisul de rută este legat de rută, momentul activării și categorie; nu o simplă vinietă de autoturism. [BG Toll](https://web.bgtoll.bg/Content/tc/termsandconditions.html?languageCultureName=en-GB)
- CZ: MYTO CZ utilizează distanța, masa, emisiile și axele; remorca poate modifica încadrarea din cursă. [MYTO CZ](https://myto.gov.cz/en/charged-vehicles/vehicles-subject-to-toll-payment)
- SK: catalogul de viniete explică separat M1 indiferent de masă și remorca O1/O2; eMyto diferențiază categorii de drum, CO₂, EURO, masă și axe; excepțiile M1 și M1/N1 + O1/O2 trebuie păstrate. [NDS](https://eznamka.sk/en/evignettes/types-and-prices), [eMyto](https://www.emyto.sk/en/charged-vehicles/vehicles-subject-to-toll-payment)
- SI: DarsGo cere înregistrare și dispozitiv, cu taxare pe tronsoane. [DarsGo](https://www.darsgo.si/)
- CH: LSVA/PSVA depind de vehicul și utilizare; o remorcă grea poate schimba obligațiile. [BAZG](https://www.bazg.admin.ch/en/transport-levies-and-road-traffic-law)
- MD: legea publicată include perioade și pentru camioane/autobuze; nu presupunem taxare kilometrică. Autorizațiile și sarcina pe axe necesită verificare. [Operator](https://evinieta.gov.md/Home/FAQ)

Germania și Italia nu sunt adăugate la cele nouă destinații de viniete doar pentru că există versiuni lingvistice. O eventuală extindere are nevoie de fluxuri distincte Toll Collect/concesionari.

## Contractul tehnic înainte de bani reali

- Catalog versionat al emitentului, categorie, moneda, perioade și acoperire; fără produse construite arbitrar din numărul de zile cerut.
- Data și ora finală autoritară, fus orar, DST, zile calendaristice vs 24h, luni calendaristice vs 30 zile, an vs 365 zile, fereastră de cumpărare anticipată, scutiri, retragere și activare imediată pe canalul aprobat.
- Cotație pe server pentru fiecare poziție, inclusiv remorca unde trebuie. Legare de vehicul/VIN, produs, dată, rută, versiune și termenul ofertei; schimbarea oricărui parametru invalidează cotația.
- Total în unități monetare întregi; nicio adunare directă EUR/HUF/CZK/CHF/RON. Conversia, TVA și comisionul se stabilesc explicit. Modulul existent calculateQuote respinge sume invalide, oferte expirate, furnizori neautorizați și monede mixte. Nu constituie singur integrarea comercială.
- Dacă lipsește o ofertă sau încadrarea, totalul rămâne necunoscut și plata blocată. Prototipul nu apelează Stripe.
- Taxele speciale, restricțiile de tonaj, gabarit, ADR, restricțiile temporale pentru camioane și permisele nu se deduc din vinietă. Ruta declarată nu reprezintă navigație autorizată.
- O factură comună numai pentru poziții fiscal compatibile; factura/raportul nu reprezintă dovadă de emitere a tuturor vinietelor.

## Limite intenționate ale acestei etape

Formular în memorie, fără salvare VIN sau cereri în baza de date, fără prețuri, fără calcul final de expirare, fără oferte/emitere/plăți. Datele tehnice sunt colectate pentru proiectarea fluxului, nu folosite drept clasificare certificată. Rămân de finalizat adaptarea pentru vehicule salvate și flote, traducerile noului formular, Figma, toate regulile de excepție și matricea legală/API înainte de lansare.


Pentru Bulgaria, durata de 24 ore și weekendul vineri 12:00–duminică 23:59, inclusiv achiziția sâmbătă/duminică fără retroactivitate, sunt descrise de [distribuitorul UBB, condiții actualizate 2026](https://ubb.bg/downloads/Document/397/en/General-Terms-e-Vignette-via-UBB-Mobile-EN-vsila-03022026_2.pdf). Condițiile propriului canal Vignexo vor fi verificate separat.
