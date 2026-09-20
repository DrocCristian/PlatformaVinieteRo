# Implementarea designului Figma Vignexo

Referință: https://www.figma.com/design/J1tEpMjn42V1dHQlzcaqoN?node-id=4-2
Bază: `preview/unified-vignette-purchase`, commit `86ee5cb`.

Pagina publică și `/cumpara/demo` folosesc layoutul simplificat în trei pași: vehicul, țări și durate, verificare. Culorile bleumarin/cyan, cardurile, marca exportată din Figma și fontul Arimo sunt incluse local. Pe desktop, rezumatul rămâne lateral; pe mobil, se deschide la cerere pentru a evita repetarea tuturor datelor sub formular.

Declarația de autoturism precede țările. Întrebările pentru Ungaria, Cehia și Slovenia sunt afișate în cardurile lor. Câmpurile funcționale rămân vizibile pentru completare, în locul stărilor demonstrative din prototip. VIN-ul, excepția de serie veche, ora Bulgariei, anul produselor anuale, remorcile și vehiculele grele folosesc validările existente. Selecțiile și notificarea se păstrează în sesiunea paginii, iar confirmarea se resetează după editare. Trimiterea implicită a formularului la verificare nu poate avansa la un pas inexistent.

Plățile și emiterea rămân dezactivate. Nu sunt modificate contractele API, baza de date, tarifele sau configurația comercială. Întrebările tehnice păstrează explicațiile în română, marcate cu `lang="ro"`; traducerile existente și selectorul de limbi rămân disponibile.

Verificări locale:
- TypeScript, ESLint și build Next.js.
- 95 de teste unitare; verificarea traducerilor repetată după ajustarea finală.
- 52 de cazuri Playwright distincte pe desktop și mobil: flux, țări, VIN, remorci, vehicule grele, catalog, flotă demonstrativă, traduceri, responsive și randare server.
- Capturi vizuale ale celor trei pași; fără depășire orizontală la 360, 390, 768 și 1440 px.

Testele pentru vechiul fundal și hartă au fost înlocuite cu verificarea randării formularului în HTML și a absenței descărcării acelor resurse pe pagina simplificată.
