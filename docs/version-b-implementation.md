# Product Finder Version B

## Isolation and experiment model

A remains the existing homepage at `/`. B is a separate `/product-finder/` route. No redirect, random assignment, traffic allocation, price feed or purchase-tracking claims are introduced. Shared `finder-core.js` and `finder-data.js` provide the same verified merchandise and affiliate tag `smallspaceg04-20`. This is a full-experience comparison: B changes question order, light/location specificity, copy and card layout. It is not a pure color test.

B events use the existing GA property and include `variant: B`: entry, start, answer, question completion, result view and affiliate click. Results are deduplicated for the same answers during the page session. Local preview does not send B events. Clicks are not purchases. Root page events and markup are unchanged.

## Mapping and constraints

B asks Light, Space and Food, then adds microgreen flavor or Kit/Basics when required. Progress uses named stages, with no false fixed question total. Food is single-select, using the same supported catalog on all devices. A fresh entry has no selected answers. Next is disabled until an answer is selected.

Lots of sun means 6+ direct hours. Some sun means 4 to 6 direct hours, adjusted from the concept's 3-hour lower bound for conservative crop eligibility. Low light means under 4 hours and only offers indoor locations, where the shared setup supplies a light. Indoor locations with less than full sun map conservatively to A's dim/light-supplemented setup. A partially sunny balcony only offers leaf/root crop setups. Tomatoes only appear for Lots of sun plus Balcony/Patio. The one-windowsill option means room for a single 8-inch pot; large bags, tray setups, mixed separate herb pots and countertop kits are withheld there.

Cards are components of one setup, not competing alternatives: one primary crop/kit, then each required container, medium, tray or light. No irrelevant third product is added for visual symmetry. No screenshot ratings, review counts, fabricated match percentages, fake scans or forced delays are used.

## Visual implementation

Follows the supplied photo-rich B references: bold sans-serif desktop hero, heavy Roboto Slab mobile entry, real garden photography, cream paper checklist with live text, 40/60 desktop panels, selected photo controls, yellow shopping CTAs, deep-green quiz CTAs, pale-green results and compact mobile product rows. Required growing conditions and affiliate disclosure add natural height beyond the flattened concept. The exact generated garden composite is replaced by real Pexels photography; generated product concept pictures are not shipped.

A distinct mobile Space screen completes the missing reference state. Incompatible choices are hidden instead of returning no-product screens. Start over and Back from the first mobile question to entry clear answers. Back within questions and Change answers allow editing. Earlier changes clear dependent answers and stale results.

## Real photo and font sources

- `assets/finder-b/balcony-hero.webp`: Michał Robak, Pexels photo 27393767, https://www.pexels.com/photo/tomatoes-in-pots-on-a-balcony-27393767/ . Used as garden hero/result band and full-sun option. Source JPEG was resized/compressed to WebP, with CSS cropping. Downloaded from the source page's OG image at 1200x627; original high-resolution download was unavailable.
- `assets/finder-b/tomato-garden.webp`: Eva Bronzini, Pexels photo 5501510, https://www.pexels.com/photo/a-growing-tomato-plant-5501510/ . Real rustic greenhouse tomato detail, used decoratively under mobile entry. WebP conversion, 1200x627.
- Both above use the Pexels license, checked at https://www.pexels.com/license/ . They illustrate gardening, not the exact merchandise or guaranteed outcomes. Simple source links are in B's footer.
- Existing option/crop photos use the current site's local assets and source records on `/photo-credits/`.
- Exact merchandise photos and identity evidence are reused from the shared catalog, with the owner's existing demo authorization. This does not claim independent license verification or current stock.
- Roboto Slab 800: Google Fonts CSS source, https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap . Actual TTF kept as `.ttf`; Apache license from Google Fonts' `apache/robotoslab/LICENSE.txt` accompanies it. Inter reuses the existing local font.

## Validation

- A's root HTML, stylesheet, JS engine, catalog and finder code are byte-identical to the baseline commit. Only the build script adds an isolated B build.
- 51 B leaf paths match the shared engine's product and required-supply decisions. 5,000 incomplete/invalid inputs recover to usable questions. A's 28 paths and 1,000 recovery cases still pass.
- Browser: all 51 B paths on desktop and all 51 on 390px mobile, 102 journeys, with expected choice sets, product ASINs, affiliate attributes, mobile Back and fresh resets. All 18 product photos were observed loading.
- Entry and long-name tomato results checked at 1536, 1440, 1280, 1024, 768, 390, 360 and 320px, with no overflowing controls.
- A 320px preview with 200% computed text/line-height scaling found a small footer bleed and menu overflow; both were fixed and all six state checks then passed. This is a text-scaling stress test, not a substitute for every browser's native text-zoom implementation.
- Keyboard controls, selected check states, visible focus, menu toggle, Back, saved URL recovery and reset are implemented. CSS supports reduced motion. Native OS screen readers and every physical mobile browser were not tested.

Screenshots are actual browser renders, not package mockups.
