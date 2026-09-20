# Audit Vignexo — cumpărare pentru autoturisme

Data: 20 septembrie 2026. Domeniu: fluxul public de cumpărare pentru autoturisme, nouă țări, formulare, încadrare, produse, valabilitate, previzualizare și limite comerciale. Nu este o certificare juridică, un audit de securitate exhaustiv sau o confirmare a accesului la API-uri.

## Concluzie

Formularul anterior confunda datele necesare încadrării cu datele care trebuie tastate de fiecare client. Nu există o justificare pentru a solicita universal J, F.1, F.2 și S.1 unui autoturism obișnuit, indiferent de țările selectate. Simplificarea este posibilă prin declarații explicite, păstrând verificarea emitentului înainte de ofertă.

Fluxul simplificat implementat în această revizie privește autoturismele fără remorcă, în formularul public. Nu completează automat mase, categorii sau număr de locuri în baza de date. Profilurile salvate, ansamblurile și celelalte tipuri rămân în fluxul tehnic existent; adaptarea profilurilor salvate necesită și persistența declarațiilor, cu validare pe server.

## Matrice de cerințe pentru interfață

| Țară | Încadrare pentru autoturism | Întrebări în plus față de număr, țară, produs și început | Limite înainte de vânzare |
|---|---|---|---|
| Austria | Vinietă pentru vehicul în regimul de maximum 3,5 t masă maximă tehnic admisibilă | Confirmarea pragului F.1; nu patru câmpuri numerice obligatorii | Excepții de tranziție, canal de distribuție, activare la 18 zile pentru anumite produse B2C și taxe de sector |
| Ungaria | Pentru M1/M1G ≤3,5 t: D1 până la 7 locuri, D2 pentru 8–9 locuri, inclusiv șoferul | Alegere simplă «maximum 7» / «8 sau 9»; răspunsul necunoscut cere verificare | Produsele județene/regionale nu sunt incluse; D2 cu remorcă are alte cerințe |
| România | Categoria autoturismului trebuie diferențiată de marfă/autobuz | VIN numai după selectarea țării; politica curentă îl cere conservator în previzualizare | Obligația exactă VIN depinde de produs/canal; nu am demonstrat că orice produs de o zi îl cere. Regimul de la data activării și viitoarea ofertă trebuie reverificate |
| Bulgaria | Produs pentru vehicul ≤3,5 t | Fără locuri, norme EURO sau VIN obligatoriu pentru autoturismul standard | Ansamblul poate cere produs pentru remorcă. Limitele exacte de activare, fusul și disponibilitatea se confirmă prin emitent |
| Cehia | Patru roți și masă de maximum 3,5 t | Propulsie prin opțiuni; CO₂ numai pentru plug-in | GPL nu se confundă cu gazul natural. Scutirea electric/hidrogen pentru numere străine cere notificare prealabilă; formularul nu o acordă |
| Slovacia | Regim vinietă ≤3,5 t și excepție M1 indiferent de masă | Pentru autoturismul standard fără remorcă nu cerem F.2 sau locuri | M1 peste 3,5 t se verifică separat, nu se declară automat vehicul cu taxă kilometrică. Remorca O1/O2 peste pragul ansamblului se verifică separat |
| Slovenia | Clasa 2A / 2B; există modele de transport persoane care sunt 2B | Alegerea clasei după verificarea modelului DARS; nu obligăm clientul să introducă milimetri | Nu folosim înălțimea totală a mașinii. Variantele constructive și lista DARS se verifică înainte de emitere |
| Elveția | Vinietă în regimul ușor, anuală cu perioadă fixă | Fără locuri, EURO sau VIN universal în fluxul standard | Remorca eligibilă are vinietă proprie; fără produse inventate de o zi/lună |
| Moldova | Vinietă pentru autoturism neînmatriculat în Moldova | VIN și, în integrarea finală, datele titularului cerute de operator | Numerele MD sunt respinse în acest flux. Datele clientului, șederea cumulată și produsul peste 180 zile se confirmă separat |

Confirmarea comună M1/M1G + F.1 ≤3.500 kg + patru roți definește domeniul simplificat al aplicației, nu o regulă universală care ar exclude toate celelalte vehicule de la vinietă. Vehiculele din afara acestui domeniu folosesc verificarea separată.

## Constatări și rezolvare

1. **P2 — prea multe câmpuri obligatorii pentru orice autoturism.** Corectat în fluxul public fără remorcă: o confirmare comună și întrebări condiționale HU/SI/CZ. Nu există precompletări fictive de 3.500 kg ori 5/7 locuri.
2. **P2 — categoria Ungariei nu era explicată la rezumat.** Adăugat D1 versus D2 pentru autoturismul confirmat, în funcție de intervalul locurilor.
3. **P2 — câmpul liber de propulsie permitea descrieri ambigue.** Înlocuit în fluxul simplificat cu opțiuni; plug-in cere interval CO₂; scutirile sunt marcate de verificat.
4. **P2 — Slovenia cerea o măsurătoare tuturor utilizatorilor.** Înlocuit cu alegerea clasei, îndrumare către DARS și opțiune «nu sunt sigur», care nu permite confirmarea unei categorii inventate.
5. **P3 — VIN încărca primul pas chiar pentru țări care nu îl folosesc.** Mutat sub detalii opționale, solicitat vizibil după țările relevante. Dacă țara este selectată din hartă, VIN-ul necompletat nu blochează primul pas.
6. **P3 — linkul BG trimitea la un produs de remorcă.** Înlocuit cu pagina oficială de selectare a produsului.
7. **Deschis — VIN România.** Cerința exactă pe durată/canal trebuie stabilită cu furnizorul. Manualul oficial al partenerilor descrie validare DRPCIV/RAR pentru numere RO și perioade de minimum 30 zile, dar nu justifică eliminarea arbitrară a câmpului din toate celelalte cereri.
8. **Deschis — datele titularului pentru Moldova.** Ghidul oficial conține date suplimentare clientului. Nu colectăm preventiv acte sau identificatori sensibili într-un demo fără emitere; contractul/API-ul trebuie să stabilească minimul necesar.
9. **Deschis — profiluri salvate.** Acestea folosesc în continuare datele existente din cont și verificarea serverului. Declarațiile publice nu sunt trimise drept date tehnice verificate către comanda comună.
10. **Deschis — traduceri.** Noile întrebări tehnice sunt în română, marcate `lang=ro`, cu avertisment în celelalte limbi. Înainte de lansarea comercială, trebuie traduse și validate în toate limbile.
11. **Deschis — Figma.** Skill-ul a fost citit, însă instrumentele Figma nu sunt expuse în această sesiune. Niciun fișier Figma nu a fost creat; reconectarea a fost solicitată. Designul implementat local este provizoriu și nu este prezentat drept rezultat Figma.

## Produse, valabilitate și plată

Au fost revizuite duratele separate pe țară: AT 1/10 zile, 2 luni, anuală; HU 1/10 zile, lună, anuală națională; RO 1/10/30/60 zile, 12 luni; BG 24 ore/weekend/7 zile/lună/3 luni/12 luni; CZ 1/10/30 zile/an; SK 1/10/30/365 zile; SI 7 zile/lună/an; CH numai anuală fixă; MD 7/15/30/90/180 zile pentru fluxul vizat. Acesta este un catalog de cercetare, nu un catalog autorizat de vânzare.

Calendarul existent afișează estimări și păstrează limitele neconfirmate ca atare. Fereastra maximă de cumpărare în avans, activarea în aceeași zi, ora efectivă, modificările legislative și produsul/versiunea anuală trebuie validate de furnizor pe server. Datele îndepărtate folosite în testele UI nu sunt o promisiune că acel produs poate fi cumpărat astăzi.

Checkout-ul rămâne dezactivat, totalul nu este fabricat, notificarea este opțională și nebifată, iar factura este descrisă ca funcționalitate comercială în pregătire. Nu se pretinde că salvarea selecției, plata ori o estimare echivalează cu emiterea vinietei.

## Surse primare consultate

- AT: https://shop.asfinag.at/en/products/digital-vignette/ ; https://help.asfinag.at/en/vignette-and-section-tolls/vignette/
- HU: https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-arak ; https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates
- RO: https://legislatie.just.ro/Public/DetaliiDocument/310825 ; https://erovinieta.ro/vignettes-partners/anonymous/descarcareManualUtilizare.html (manual operațional, nu confirmare a contractului viitor)
- BG: https://web.bgtoll.bg/ ; https://web.bgtoll.bg/Evignette/Create?vignetteTypeID=28 (observat ca produs de remorcă, nu recomandat ca intrare autoturism)
- CZ: https://edalnice.gov.cz/en ; https://edalnice.gov.cz/en/exemption ; https://edalnice.gov.cz/files/EN_Payment_conditions.pdf
- SK: https://eznamka.sk/en/evignettes/types-and-prices
- SI: https://evinjeta.dars.si/en ; https://www.dars.si/Content/doc/seznam%20izmerjenih%20vozil/Seznam%20izmerjenih%20vozil_The%20list%20of%20measured%20vehicles.pdf (documentul public accesibil indică valabil din 2021; lista/modelul curent trebuie confirmate la emitere)
- CH: https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase
- MD: https://evinieta.gov.md/Home/Legislation ; https://evinieta.gov.md/Home/DisplayPDF/Vinieta%20Ghidul%20utilizatorului

## Design pregătit pentru Figma

Păstrăm bleumarinul și turcoazul Vignexo, formularul pe o coloană pe mobil, inputuri de minimum 16px și controale de minimum 48px. Cardul «Doar detaliile care contează» conține confirmarea comună; fiecare întrebare suplimentară are țara deasupra ei și o explicație scurtă. Erorile sunt asociate câmpului și focalizate. Rezumatul arată declarațiile folosite la încadrare. Nu se refac fundalul sau identitatea vizuală aprobate.

## Verificări

Verificări în containerul existent: 95 teste unitare trecute, 58 teste Playwright desktop/mobil trecute, TypeScript, ESLint și build final trecute. Capturile la 1440 × 1000 și 390 × 844 au fost inspectate vizual. Au fost testate HU 8–9 locuri, CZ plug-in/electric, SI incert, VIN condițional, resetarea declarațiilor, remorci și vehicule grele. Nu a fost testată emiterea reală și nici nu este activată. Modificările actualizează numai ramura de previzualizare; nu se activează plăți și nu se modifică Supabase.
