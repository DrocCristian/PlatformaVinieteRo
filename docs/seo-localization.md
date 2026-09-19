# Localized public pages and launch indexing

Public pages: Romanian at / and /catalog; Hungarian at /hu and /hu/catalog; German at /de and /de/catalog; Italian at /it and /it/catalog; Russian at /ru and /ru/catalog; Polish at /pl and /pl/catalog; Bulgarian at /bg and /bg/catalog; Czech at /cs and /cs/catalog; Slovak at /sk and /sk/catalog; Greek at /el and /el/catalog.

The German translation serves Austria and Germany, with de, de-AT and de-DE alternate annotations pointing to the same German URL. These are audiences, not new vignette products. The nine-destination catalog has not changed.

Each page has a self-referencing canonical on https://vignexo.com and reciprocal language alternatives, including x-default to Romanian. The sitemap at /sitemap.xml contains exactly these twenty real pages, with no accounts, authentication, APIs, fragment URLs or fictional products. Dates are not fabricated.

The sitemap is prepared in advance. PUBLIC_INDEXING_ENABLED defaults to false. Until launch the pages remain noindex, nofollow, and robots.txt does not advertise the sitemap. Allow crawling of public pages so crawlers can read noindex. Merely postponing Search Console submission does not prevent indexing.

After API integration, product/legal review and explicit launch approval: set PUBLIC_INDEXING_ENABLED=true in the production build environment, rebuild/deploy, verify public pages are indexable, verify private/auth pages still inherit noindex, then submit https://vignexo.com/sitemap.xml in Search Console. Do not submit the staging noindex URLs now.

Translations cover public home, planner (including validation), map labels and catalog. The account and authentication interface remains Romanian, clearly indicated on the localized account link, and is excluded from the sitemap. Native-language editorial review remains appropriate before commercial launch.

Only the active language dictionary is passed to client components. Language-switch links disable automatic prefetch to avoid downloading all ten versions. No third-party translation service, geolocation redirects or extra map library is loaded. A lang attribute on the public content container identifies its language; the global shell and account area remain Romanian.

References:
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
