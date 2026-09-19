# Vignexo — vehicule, remorci și calculul unei curse

Revizie: 20 septembrie 2026. Document de implementare și verificare preliminară, nu autorizare comercială. Regulile nu constituie un catalog de produse vandabile.

## Funcționalitate

- Profil reutilizabil în cont: tip vehicul, categoria J, masele F.1/F.2, locurile S.1, axe, norma Euro, clasa CO₂, înălțime la axa față și remorcă separată.
- Pragul include exact 3.500 kg. Masa tehnică și masa autorizată se păstrează separat. Nu se deduce categoria legală numai din greutatea selectată.
- Datele necunoscute rămân necunoscute. Vehiculele vechi nu primesc greutăți fictive.
- Editare vehicul, alegere vehicul salvat pentru cursă, origine/destinație și interval de călătorie. La salvare se păstrează o copie a datelor vehiculului; editarea ulterioară nu rescrie istoricul.
- Originea și destinația sunt momentan texte negeocodate. Nu reprezintă un traseu calculat, țări traversate sau ofertă.
- Totalul indisponibil este null, niciodată zero. Nu se activează plăți, emitere sau comenzi reale.
- Formularul public are aceleași câmpuri în cele zece limbi. Interfața contului rămâne în română.
- Verificările de țară sunt orientative, pentru intervalul 20.09–31.12.2026; alte date cer reverificare. Intervalele de valabilitate comerciale, scutirile și clasificarea finală trebuie validate de emitent înainte de orice ofertă.

## Matrice de verificare

| Țară | Regula implementată preliminar | Verificări rămase înaintea unei oferte |
|---|---|---|
| Austria | F.1 până la 3.500 kg: vinietă; remorca nu produce o vinietă separată. Peste prag: GO-Maut. | Vehiculele cu F.1 > 3.500 și F.2 ≤ 3.500 sunt blocate pentru verificarea derogării tranzitorii; necesită istoricul înmatriculării/reducerii masei. Tronsoane speciale și sectoare exceptate din ruta efectivă. |
| Ungaria | D1 pentru M1/M1G, cel mult 7 locuri, masa relevantă ≤ 3.500 kg; remorca inclusă. D2 poate necesita U pentru remorcă. Marfa/autobuzele grele: HU-GO. | Din 2026 autorulotele grele revin în sistemul e-vignette. Confirmare documente/categorie și produs U; clasa HU-GO, axe, emisii și tarif pe rută. |
| România | Marfa > 3.500 kg: separare după data de 1 octombrie 2026; cursa care traversează schimbarea rămâne pentru verificare. | Confirmare operațională CNAIR și catalog valabil la data cursei; tarife/categorii, norma Euro, axe, poduri, mixed transport și scutiri. Niciun tarif TollRo hardcodat. |
| Bulgaria | Vehicul ușor și remorcă: pragul ansamblului peste 3.500 kg indică produs separat pentru remorcă. Vehicul greu: BG Toll. | Autorulotele rămân explicit în verificare; confirmare produs, documente, mase și tarife de la operator. |
| Cehia | F.2 până la 3.500 kg: vinietă pentru vehicul, fără produs separat pentru remorcă; peste prag: MYTO CZ. | Propulsie, emisii, scutiri/notificări pentru vehicule străine, clasă tarifară grea, traseu. |
| Slovacia | M1 are regim de vinietă inclusiv peste prag. Ansamblul M1/N1 cu remorcă O1/O2 poate necesita vinietă de remorcă dacă suma maselor tehnice depășește 3.500 kg. | Categorii neclare sau remorci în afara O1/O2: verificare obligatorie. Alte vehicule grele: eMyto. |
| Slovenia | ≤ 3.500 kg: 2A/2B; autorulota are tratament 2A. Remorca nu schimbă pragul vehiculului tractor. Peste prag: DarsGo. | Lista DARS a modelelor măsurate prevalează; exact 1.300 mm se trimite la verificare. Karawanken și sectoare exceptate trebuie recunoscute în rută. |
| Elveția | Vinietă pentru vehicul și separat pentru remorca ușoară; vehiculele grele intră în LSVA/PSVA în funcție de utilizare. | Remorca grea și excepțiile ansamblului nu sunt clasificate automat. Confirmare tip vehicul și taxe grele. |
| Republica Moldova | Regim distinct pentru vehicule străine; remorcile și vehiculele comerciale necesită categoria fiscală. | Nu se inventează produs separat pentru remorcă și nu se deduce gratuitatea pentru înmatriculare MD. Confirmare categorie/autorizații/ședere/circulație. |

Germania și Italia sunt acoperite doar ca semnale de verificare pentru tranzit, nu ca țări noi de vânzare a vinietelor: LKW-Maut și taxele italiene de traseu nu pot fi omise din total. Orice altă țară traversată, neacoperită de provider, trebuie să blocheze o ofertă prezentată drept completă.

## Surse primare consultate

- Austria: [ASFINAG — vinietă și derogarea tranzitorie](https://help.asfinag.at/en/vignette-and-section-tolls/vignette/).
- Ungaria: [categorii D1/D2/U](https://nemzetiutdij.hu/en/e-vignette/tolls/e-vignette-rates), [autorulote din 2026](https://nemzetiutdij.hu/en/news/as-of-january-all-rvs-will-be-part-of-the-e-vignette-system-in-hungary).
- România: [CNAIR / SETRE — calendarul aplicării](https://www.setre.gov.ro/), [Legea 226/2023, formă consolidată consultată](https://legislatie.just.ro/Public/DetaliiDocument/310825). Implementarea infrastructurii și începerea tarifării sunt date distincte.
- Bulgaria: [magazinul oficial — produs de remorcă](https://web.bgtoll.bg/), [condiții oficiale](https://web.bgtoll.bg/Content/tc/termsandconditions.html?languageCultureName=en-GB).
- Cehia: [eDalnice](https://edalnice.gov.cz/en), [Ministerul Transporturilor](https://md.gov.cz/Zivotni-situace/Dalnicni-kupony-a-mytne-Dalnicni-kupony-a-mytne/elektronicke-dalnicni-znamky?lang=en-GB).
- Slovacia: [NDS — vehicule și remorci](https://eznamka.sk/en/evignettes/types-and-prices).
- Slovenia: [DARS](https://evinjeta.dars.si/en), [Guvernul Sloveniei](https://www.gov.si/en/topics/tolls/), [lista vehiculelor măsurate](https://www.dars.si/Content/doc/seznam%20izmerjenih%20vozil/Seznam%20izmerjenih%20vozil_The%20list%20of%20measured%20vehicles.pdf).
- Elveția: [BAZG — întrebări frecvente](https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase), [taxe pentru vehicule grele](https://www.bazg.admin.ch/de/verkehrsabgaben).
- Moldova: [Administrația Națională a Drumurilor](https://evinieta.gov.md/Home/FAQ).
- Germania: [Toll Collect — pragul de 3,5 t](https://www.toll-collect.de/en/toll_collect/rund_um_die_maut/3_5_tonnen_maut/p1745_3_5_tonnen_maut.html).
- Italia: [Autostrade — calculul taxei](https://www.autostrade.it/en/servizi-al-cliente/pedaggio/come-si-calcola-il-pedaggio).

## Integrarea necesară pentru „de unde — până unde — cât plătesc”

Candidat de evaluat: [PTV Developer](https://www.ptvlogistics.com/en-us/products/ptv-developer). Include rutare pentru camioane și calcul de taxe. Accesul, costurile, licențierea și acoperirea exactă a celor nouă țări trebuie confirmate; estimarea PTV nu oferă dreptul de a emite o vinietă.

1. Acces API de geocodare/rutare, cheie stocată exclusiv pe server. Originea/destinația ambigue trebuie confirmate de utilizator. Pentru camioane trebuie completate și dimensiunile, masa de circulație și restricțiile de marfă cerute de provider; câmpurile curente nu sunt suficiente pentru navigație grea.
2. Rută reală cu toate țările, sectoarele taxabile, podurile și tunelurile; opriri, retur și date de tranzit. O dată finală a călătoriei nu descrie automat ruta returului.
3. Catalog autorizat per emitent, categorii și tarife cu dată de valabilitate, produse pentru remorcă, scutiri verificate și viniete deja deținute.
4. Optimizarea perioadelor numai pentru acoperirea confirmată; taxe separate fără dublare cu estimarea providerului. Monede, TVA și comision Vignexo afișate explicit.
5. Total calculat server-side din sume în unități monetare minime, ofertă cu expirare și identificator. Nicio sumă trimisă de browser nu autorizează plata.
6. Stripe test până la validarea contractelor, a ofertelor și a emiterii. Facturarea și e-Factura rămân o integrare distinctă.
7. Eșecuri, țări lipsă și tarife indisponibile => ofertă incompletă, fără plată. „Nu cunosc tariful” nu înseamnă „gratuit”.

## Verificare tehnică

Teste unitare pentru 3.499/3.500/3.501 kg, F.1/F.2, D1/D2/U, ansambluri, M1 Slovacia, schimbarea TollRo și total indisponibil. Teste tranzacționale RLS cu rollback pentru proprietar, alt cont și anonim. Profilurile sunt declarații ale utilizatorului și se revalidează la citire; nu reprezintă dovadă de eligibilitate.
