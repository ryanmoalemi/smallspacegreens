# Find your grow v1.1 launch checks

Ryan authorized launch on November 14, 2026, with review afterward. PR #55 contains the implementation and conservative launch corrections.

## Recommendations

The 60 complete answer combinations resolve to 41 product routes and 19 explicit adjustment/unavailable routes. The release test enumerates the products actually reachable from those routes, not unused catalog candidates.

- Full-size tomatoes are withheld because the required cage pack size could not be confirmed. The dim-space route explains the sunlight limitation. Sunny/balcony routes explain the need for room, strong sun and support, with a guide or explicit lettuce alternative.
- Lettuce and herb countertop-kit paths do not assume the contents of an unnamed AeroGarden seed kit. Visitors can choose seed supplies or explicitly switch to the basil kit. Old shared kit URLs still return an adjustment screen.
- Salad greens and root radishes in dim spaces require a visitor-approved change to microgreens; no crop is silently substituted.
- Microgreens on balconies route to indoor/alternative-crop guidance.
- Pea shoots use their own seed and separate supplies. The unnecessary kit question is removed for both sunny and dim spaces.
- Dim tray kits require a separate light. The Alpas kit includes seed, medium and trays, not a lamp. Basil Smart Garden 3 includes its lamp and three basil pods, with no unrelated pots/soil added.
- DIY tray supplies are drained and solid 1010 trays, not a mislabeled 1020 tray. Visitors are told to confirm nesting and outside dimensions. Fit illustrations are explicitly not true to scale.
- Supporting light guidance requires following the fixture's actual coverage/distance instructions; a dim room by itself is not enough light.

## Product identity evidence and limits

ASIN/name pairings are grounded in the supplied November 13 v2.1 recommendation matrix. Accessible Amazon copies and the Click & Grow and Alpas manufacturer pages were cross-checked November 14. Several Amazon pages could not be fetched; these records are not live stock checks. Product identity evidence is in src/finder.json. No stock, delivery, price, star-rating, review-count or best-value claim is published. Users are told to check the exact pack, included items and availability on Amazon before buying.

Primary sources:
https://www.clickandgrow.com/products/the-smart-garden-3
https://alpaslife.com/microgreen-products/
https://www.amazon.com/dp/B00W2FAPF6
https://www.amazon.com/dp/B07VRJVJ9F
https://www.amazon.com/dp/B003BM42R6
https://www.amazon.com/dp/B0DCSH7T1R
https://www.amazon.com/dp/B078WY9Z7Q
https://www.amazon.com/dp/B07QNSSN81
https://www.amazon.com/dp/B0CHDBY2PD

## Photography correction for public release

The preview's Amazon/manufacturer/retailer product-image hotlinks had no confirmed reuse basis. They are removed from the new finder. All visible finder photos now use already licensed local crop/supply photography, with a visible caption explicitly saying the crop or supply type is shown, not the merchandise/packaging. Product names and links remain separate from these illustrations. The primary result layout and photography remain, but these are not presented as exact-product photos.

New crop source records are in src/finder-photo-sources.json; all existing photographers and licenses are on /photo-credits/. Release validation checks each active photo file and corresponding credit anchor. Authorized exact-product photographs can replace the illustrative ones later. Existing unrelated guide pages and their image delivery were not audited as part of this homepage launch.

## Checks

- python scripts/build_site.py: existing static-site build, affiliate, duplicate-photo, contrast/text-size, and content checks.
- node scripts/check_finder.js --release: 60 route combinations, invalid/partial inputs, required lights, tray components, affiliate tag, and 16 reachable product records with source evidence and correctly captioned local photos.
- No artificial waits, email gate or scan claims.
- Prior browser review confirmed 390px grid fits through pixel 783 without horizontal overflow, navigation, edit chips, browser Back and all three sample result layouts. Launch changes are checked in the browser again before release.

The release gate is updated to validate the narrower public launch contract: product identity evidence and licensed illustrative photography, no unsupported availability claims, and withheld uncertain recommendations. It does not mark unavailable live-stock checks or missing exact-product image permissions as completed.
