# Product catalog

This file is the shared record of every product card on the site: the display name, brand, variant, size, destination URL, and image treatment.

`products.json` was audited on 12 November 2026 (America/Los_Angeles). Listing names, ASINs, and affiliate URLs follow the checks already recorded on 10 November 2026.

## Image treatments

- `official`: a merchant-permitted product photograph (currently LetPot promotional images).
- `licensed-exact`: a third-party licensed photograph of the same product type (currently the coir brick used for the Verdana coir brick).
- `crop`: a licensed photograph of the named crop. It identifies the crop, not the merchant packet. Use this only for seed and collection cards.
- `amazon`: the main product photograph from that ASIN's Amazon listing, stored in `image.image_embed` as an `m.media-amazon.com` URL. The photograph is hotlinked, never downloaded or rehosted, and is wrapped in the tagged associate link (`smallspaceg04-20`). Future Amazon picks always use this treatment.
- `neutral`: a typographic card. Use this only when no permitted exact product photograph, including a listing main image, is available.
- `image_embed`: the hotlinked Amazon listing photo URL for `amazon` cards, or a Creators API URL when that is in use. Amazon images are never downloaded or rehosted.

Awin affiliates may use product images from the advertiser's Awin data feed. This build does not include a True Leaf feed file, so True Leaf seed cards keep a correctly identified crop photograph until a feed image can replace it.

## What changed on 12 November 2026

Typographic cards for named Amazon products were replaced with that ASIN's own Amazon listing photograph, except Etekcity 0.1 g scale (B08BPTXK4L), which stays typographic because the listing is currently unavailable and no main product photograph was found. Crop photos on seed and collection cards, official LetPot photos, and the licensed Verdana coir brick photograph are unchanged.
