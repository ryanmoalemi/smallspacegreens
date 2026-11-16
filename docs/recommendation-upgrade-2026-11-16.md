# Recommendation usefulness upgrade

Both designs share the same 30 valid routes. The four 3.2-second reveal stages are unchanged.

## Shipped behavior

- Two concise benefits on standard product cards; three on the two starter kits.
- Relevant sourced Reddit experience beside the primary purchase decision, with context identifying the crop/method or exact garden.
- An available-room question only for uncertain indoor beginners, where the answer changes the recommendation: narrow sunny window to a small broccoli tray kit; roomier sunny space to lettuce pots; narrow dim counter to a basil garden with built-in light; roomier dim space to a microgreen kit plus standing light.
- Uncertain beginners now receive one or two purchases where suitable, replacing the five-item dim-space default.
- Smart Pot single 5-gallon container replaces the five-pack in the tomato starter list. Espoma AP8 8qt replaces 16qt for the two-pot starter list, using Espoma's qualified typical-pot filling estimate.
- A single-basil-packet alternative to the 12-variety herb collection.
- Unresolved Bootstrap drained/solid tray listings removed from active recommendations. ALPAS provides two small nested tray sets, coir for two plantings, a mister, and one packet each of radish and broccoli. Pea seed is separate. Repeat growers can choose kit plus bulk seed; later coir refills are optional, not duplicated in the starter list.
- Clear ownership-adjusted purchase counts and one useful alternative where there is a materially different setup. This compares contents and number of items, not prices or guaranteed savings.
- Container dimensions, qualified harvest expectations, realistic small-harvest scale, daily care, and three starting actions are inside the result. No growing-guide exits.
- Static pages and old bookmarks use the current recommendations. Both variants support the room question and direct alternative links.

## Amazon prices: decision checked 2026-11-16

Official policy: https://affiliate-program.amazon.com/help/operating/policies

Participation Requirements section 2 permits product prices/availability only in an Amazon-served link or obtained through Creators API/PA API under its license. API content has refresh/cache rules; price displays refreshed less often than hourly need a date/time stamp, plus the required price/availability disclaimer. The current supported integration is Creators API:
https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation

This GitHub Pages app has no approved Amazon price feed. No manually copied prices, approximate Amazon totals, ratings, availability promises or inferred savings were added. Buttons continue to say "Check price on Amazon." Exact setup totals remain dependent on an approved feed and server-side credentials, appropriate timestamps/disclaimers, offer-variant matching, quantity math, stale-data suppression and ownership filtering. No credentials should be put in frontend JavaScript.

## Sources and unresolved measurements

Product identity, benefits, fit and crop timing sources are recorded in `src/finder.json`; Reddit records are in `data/reviews/evidence.json`.

- ALPAS: https://alpaslife.com/microgreen-products/ — 8.8 × 5.5 in tray sets and two starter plantings. Pea use is a practical tray/medium recommendation, not an ALPAS promise that pea seed is included.
- Smart Pot B002JUOWB2: exact Amazon RC5 listing, one 5-gallon pot, 12 in diameter × 9.5 in high. No stock claim.
- Espoma AP8 B002Y04TK6: exact Amazon 8qt single bag plus https://www.espoma.com/espoma-item-data-sheet/ and https://www.espoma.com/product/espoma-organic-potting-soil-mix/ . Four dry quarts is a typical 8-inch-pot estimate; actual Melphoe internal capacity is unpublished.
- MetryGrow B0D7CMRZT8: brand https://linktr.ee/metrygrow and supplier dimension diagram https://m.media-amazon.com/images/S/aplus-media-library-service-media/7a51d292-6a73-4e39-8ba0-71d1f0543b82.__CR0,0,970,600_PT0_SX970_V1___.jpg — panel 13.6 × 7.7 in, stand advertised 4–72 in. Base width/depth remains unverified. The site does not equate its 2 × 2 ft illumination rating with physical fit.
- Tiny Tim: Seed Needs' maturity baseline is unclear. Display uses a clearly labeled cultivar estimate from Hudson Valley (45 days after transplant), plus seed-starting time, rather than falsely labeling 45 days as sowing-to-harvest.
- General harvest ranges are estimates for suitable conditions, not tested results from this site. We have not performed physical test grows or published fabricated yields/photos.

## Validation

- Full site build and release checks.
- 30 valid recommendation journeys with identical A/B logic.
- 1,000 malformed/old URL recovery states.
- 98 current static states and 60 current static result pages; additional legacy bookmarks retained.
- 120 shopping/ownership scenarios, including alternative counts, skip/restore, data completeness, no duplicate coir, no unresolved tray ASINs in active plans, and preserved reveal timing.
- Live browser checks recorded after publication in the release follow-up.
