# Find your grow v1.1: review build

Implements the corrected 2026-11-14 handoff. The existing PR #55 is repurposed as the single implementation PR. No merge or deployment is authorized.

## What is implemented

Eight unique real-photo crop choices, three spaces, microgreen crop choice, conditional setup choice, shareable result URLs, Back and editable answer chips, browser Back/Forward, one product CTA, quieter required-supply links, honest crop-switch and unavailable states, original decorative garden SVG, reduced motion, a usable non-JavaScript guide link, and local Inter/EB Garamond fonts. No timers withhold results. No prices, ratings, value badges, fabricated scans, or email gates.

Homepage crop photographs use Commons/CC sources and existing licensed photographs. New files and rights metadata are in `src/finder-photo-sources.json`; the site's photo credits identify originals, authors and licenses. All derivative photographs retain their source licenses. Current production logo is preserved. Product pictures are actual product photography, not generated packaging. The reference boards are not shipped as UI images.

## Source conflicts resolved in the implementation

- v1.1 overrides the original waiting screen and repeated Not sure button.
- Use named Grow / Space / Setup stages, never a universal tap count.
- Not sure + dim + basics follows v2.1's broccoli route, and explicitly says which crop was chosen.
- Lettuce/herbs/Not sure + dim + kit do not promise an unnamed AeroGarden seed mix. They show an explicit unavailable/adjustment screen, offering basics or a confirmed-identity basil kit. No silent crop switch.
- Mature salad greens/radish roots + dim require an explicit crop-change choice before microgreens. Tomato + dim also requires consent to change crop.
- Microgreens + balcony offers guides or a crop/space change, without a kit purchase.
- Pea shoots do not get a spurious complete-kit question; the selected seed uses separate tray supplies.
- DIY microgreens use separate drained and solid **1010** trays. They are not described or drawn as 1020. The Alpas kit's manufacturer lists **8.8 × 5.5 in** trays, and its own fit disclosure uses that size.
- Dim microgreen kits require a separate lamp. The included contents do not claim a built-in light.
- SANSI B0CHDBY2PD replaces the GooingTop primary using the matrix's approved backup: its catalog photo and listing identity are accessible, unlike the weak primary thumbnail.
- Neutral product identity and a benefit replace unsupported “best value” claims.

## Product/photo checks and release limits

The private review build is **not release-ready**. `node scripts/check_finder.js --release` deliberately fails while these checks remain open. The normal build/test commands pass; they are not publication approval.

Amazon direct pages were not available for many ASINs during this task. Accessible search-service copies confirmed white Click & Grow B01MRVMKQH including three basil pods, broccoli seed B00W2FAPF6 in the 1 lb bag, Genovese basil B07VRJVJ9F, and the 12-variety herb collection B003BM42R6. Those copies are dated before this task, so they do not establish current stock. The source matrix supplies the other candidate ASIN/photo pairings. No stock or delivery claim is shown.

The Alpas manufacturer page links its coco-coir kit photograph directly to B0CQPQKTFC and confirms radish/broccoli seeds, two tray sets and growing medium, without a lamp:
https://alpaslife.com/microgreen-products/
https://alpaslife.com/wp-content/uploads/2024/10/new-main-coco-coir-kit.jpg

The Rambo seed photograph comes from Country Creek's own product page. Its 16 oz Amazon variation still needs verification:
https://www.organic-heirloom-seed.com/products/rambo-radish-sprouting-seed-non-gmo-country-creek-brand-rambo-radish-sprouts-garden-planting-cooking-soup-emergency-food-storage-vegetable-gardening-juicing

The Verdana supporting photo is the retailer's actual 10 lb package photograph, with UPC 040232359095. Cross-check that UPC against the Amazon variation and obtain display rights before release:
https://famousmicrogreens.com/verdana-coconut-fiber-potting-mix-10-lb-compressed-block-brick-coco-coir-coco-peat-coir-pith-alternative-to-peat-moss-soilless-growing-medium-low-ec-optimum-ph-high-expansion/

**Tomato cage conflict:** original matrix calls B0CR7KSCG3 a 2-pack; an external listing identifies it as a 4-pack. Exact Amazon pack/photo identity is unconfirmed. The product is marked `unverified`, so tomato result pages show an unavailable/adjustment screen instead of a partially verified basket. Do not silently change the pack.

**Image delivery:** The old brief's SiteStripe image assumption was not adopted as current policy. Current official Amazon program policies require permitted API/feed use and limit image-link caching. Existing hard-coded CDN URLs are candidate review imagery, not evidence of an approved API integration. All new catalog items have `imageUseApproved: false` and `availabilityVerified: false` until current publication checks are completed. Manufacturer/retailer photos also need an appropriate reuse basis. Do not publish the preview catalog unchanged.
https://affiliate-program.amazon.com/help/operating/policies

**Before release:** verify exact current ASIN variants and all required supplies; validate tray nesting/dimensions; resolve cage pack conflict; provide an authorized image-delivery method or licensed originals; verify seeds included in any newly enabled countertop garden; ensure the correct fuller Amazon disclosure is present near purchase content, beyond the short top-line disclosure; review actual screenshots; then obtain Ryan's separate merge/deployment approval. The implementation does not assume every requested crop has an available complete kit.

Fit illustrations are explicitly illustrative, not true-to-scale drawings. No unverified appliance dimension is printed.

## Validation

`python scripts/build_site.py` runs the existing site checks and regenerates static outputs. `node scripts/check_finder.js` exhausts 60 completed combinations, including 45 product-route decisions and 15 crop-switch/unavailable decisions, plus partial/invalid input, required-light, no-extra-kit, 1010 tray-pair, affiliate-tag and image-existence checks. The UI additionally refuses any product route containing an unverified required supply. Responsive screenshots are captured from the real implementation in a 390px iframe and the desktop viewport, not from the design boards. Preview harness and screenshots are excluded from the published source.
