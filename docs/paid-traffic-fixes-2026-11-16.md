# Paid traffic fixes, November 16, 2026

Applied to both presentations. The four 3.2-second loading stages, approved Reddit copy, automatic transition and finale animation are preserved. No loading-time experiment was started.

## Implemented

- Finder-only headers and footer links no longer send visitors to guides. Separate editorial pages remain available outside the finder.
- Result quotes require explicit approval, crop and space matching, microgreen subtype matching where applicable, and product exclusions. The radish-thinning excerpt appears only for garden radishes. New source-checked excerpts cover all 28 valid routes, including pea shoots, microgreens under lights, herbs, and the exact Click & Grow 3 model. Advice is labeled as a tip; early product experiences and lighting context are retained. No irrelevant substitute quote is shown when coverage is absent.
- Starting plans use two included 8-inch pots instead of three. Tomato soil explicitly requires two 16-quart bags for one 5-gallon grow bag. Quantities and confirmed pack details appear beside buying actions.
- Supply explanations are shorter; optional growing details expand on demand. Visitors can mark supplies already owned, which removes their buying action and updates the shopping count. Choices persist for the tab session.
- A single 650 g Nutrifield coir brick replaces the oversized 10 lb default. The original Verdana record and supplied image are retained but not recommended as a beginner essential.
- MetryGrow 48W standing light replaces the SANSI single-pot clip light. The brand advertises a 2 x 2 ft footprint and supplier diagrams confirm the stand/base/controller. The starting layout is one tray or two 8-inch pots, centered beneath it. This is a fit inference based on published footprint, not an independently measured PPFD or growth claim. Follow manufacturer instructions for height and brightness; no numeric distance is invented.
- Sunny-window choices identify crop-specific light needs.
- Owner-supplied exact photos now appear for tomato seed, radish microgreen seed, ALPAS kit, pots and soil. Supplied window boxes and fertilizer are correctly tagged optional extras. Seven window boxes are not mandatory for a two-pot starter.
- Both variants emit the same entry/start/answer/reveal/result/Amazon-click event names, with a variant field. QA visits using `qa=1` and preview hosts do not initialize GA4 or send finder events. An outbound Amazon click is not recorded as a purchase.

## Evidence for replacement products

- Nutrifield 650 g brick: https://www.nutrifield.com/p/cocobrick and https://www.amazon.com/dp/B093CKN811
- MetryGrow 48W model/2 x 2 ft footprint: https://linktr.ee/metrygrow, first product link resolves to https://www.amazon.com/dp/B0D7CMRZT8
- Included stand/base/control supplier diagram: https://m.media-amazon.com/images/S/aplus-media-library-service-media/2665040d-c812-4192-9a45-d126144e4cda.__CR0,0,970,600_PT0_SX970_V1___.jpg
- ALPAS kit contents: https://alpaslife.com/microgreen-products/
- Indoor herbs: https://yardandgarden.extension.iastate.edu/how-to/growing-herbs-indoors
- Lettuce sunlight: https://www.extension.umd.edu/resource/growing-lettuce-home-garden
- Other listed pack details: owner-supplied Amazon screenshots and accessible exact-ASIN listings. No current price, stock or rating claims are published.

## Still requiring external confirmation

1. Drained tray B07NKSKMCN: exact current Amazon pack quantity. Secondary sources say ten; this was not promoted to a verified count.
2. Solid tray B07MYNVP8G: exact current Amazon pack quantity. The pair concept is manufacturer-supported, but both exact variants still need owner confirmation. No smaller soil-compatible Amazon pair was primary-verified. Cards say to select/check matching pack sizes; the starter plan uses one tray of each type.
3. Optional exact counts/weights for lettuce B00YO5TZ26, pea B06XWGTV57 and salad collection B0D1LL6CG6. Generic packet/bag/collection labels remain rather than guessed sizes.
4. GA4 event receipt and ad-account conversion configuration need account-side verification. No ad pixel ID or ad-platform account was supplied. Campaign spend and profitable earnings per visitor cannot be verified by code tests.
5. Current Amazon sellers, stock, delivery and checkout completion were not certified. Do not present this release as independently verified inventory.

## Validation

- 28 valid recommendation routes; A/B parity.
- 1,000 incomplete, invalid and legacy state combinations.
- 90 supported static states and 56 result pages; legacy pages built too.
- Dedicated regression checks for guide exits, crop-specific quotes, pack labels, quantity rules, small coir replacement, light replacement, unchanged loading time and owned-supply persistence/undo.
- All 20 displayed product photo sources returned images or exist as local supplied assets.
- Local preview browser access was blocked by the browser URL policy. Static and logic verification completed before publication; live checks recorded separately after publication.
