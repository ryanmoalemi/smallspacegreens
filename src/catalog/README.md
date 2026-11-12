# Product catalog

This file is the shared record of every product card on the site: the display name, brand, variant, size, destination URL, and image treatment.

`products.json` was audited on 12 November 2026 (America/Los_Angeles). Listing names, ASINs, and affiliate URLs follow the checks already recorded on 10 November 2026. This pass does not change those destinations.

## Image treatments

- `official`: a merchant-permitted product photograph (currently LetPot promotional images).
- `licensed-exact`: a third-party licensed photograph of the same product type (currently the coir brick used for the Verdana coir brick).
- `crop`: a licensed photograph of the named crop. It identifies the crop, not the merchant packet. Use this only for seed and collection cards.
- `neutral`: a typographic card. Used when no permitted exact product photograph is available.
- `image_embed`: reserved for an Amazon-served Creators API image URL. Amazon images are never downloaded or rehosted.

Awin affiliates may use product images from the advertiser's Awin data feed. This build does not include a True Leaf feed file, so True Leaf seed cards keep a correctly identified crop photograph until a feed image can replace it.

## What changed in this audit

Misleading stand-in photographs (a coir brick for Espoma seed starter, herb scissors for Fiskars 5 in scissors, greenhouse pea shoots for the Spongease kit, plated microgreens for the Mizuna ceramic kit, nursery or crop photographs for named trays and other kits) were removed. Those named retail products now use typographic cards unless a permitted exact photograph exists.
