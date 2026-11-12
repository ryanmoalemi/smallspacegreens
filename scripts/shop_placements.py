"""Approved supply links for guide pages.

Amazon rows use https://www.amazon.com/dp/ASIN?tag=smallspaceg04-20.
Microgreen seed rows use the approved True Leaf Market collection.
The LetPot garden uses the approved LPH-Air Awin link, not Amazon.
"""

from __future__ import annotations

from pathlib import Path

import catalog

AMAZON_TAG = "smallspaceg04-20"
AMAZON_DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases."
COMMISSION_SENTENCE = "We earn a commission from purchases through this page."
TRUELEAF_SEED = (
    "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328"
    "&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fmicro-greens-planting-seed"
)
TRUELEAF_RADISH = (
    "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328"
    "&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fradish-rambo-seeds"
)
TRUELEAF_PEA = (
    "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328"
    "&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fdun-pea-seeds"
)
LETPOT_AIR = (
    "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328"
    "&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Flph-air-indoor-hydroponic-gardening-system"
)
SEED_LABEL = "Browse microgreen seeds"
AIR_LABEL = "See LPH-Air at LetPot"
AMAZON_LABEL = "Check price on Amazon"


def esc(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def amazon_url(asin: str) -> str:
    if len(asin) != 10 or not asin.isalnum() or not asin.isupper():
        raise SystemExit(f"Bad ASIN {asin}")
    return f"https://www.amazon.com/dp/{asin}?tag={AMAZON_TAG}"


def routed(row: dict, routes: str) -> dict:
    """Tag a /gear/ example with the chooser routes (kit, tray, reuse) whose list it belongs to."""
    row["routes"] = routes
    return row


def amazon(asin: str, item: str, note: str) -> dict:
    return {"kind": "amazon", "asin": asin, "item": item, "note": note, "label": AMAZON_LABEL}


def seed(item: str, note: str) -> dict:
    return {"kind": "trueleaf", "item": item, "note": note, "label": SEED_LABEL, "url": TRUELEAF_SEED}


def seed_product(item: str, note: str, url: str, label: str) -> dict:
    return {"kind": "trueleaf", "item": item, "note": note, "label": label, "url": url}


def letpot_air(item: str, note: str) -> dict:
    return {"kind": "letpot", "item": item, "note": note, "label": AIR_LABEL, "url": LETPOT_AIR}


# Names follow the live listing title and brand line checked on 2026-11-10.
# Notes stay with this site's method. They do not add a price, rating, or stock claim.

BF_1020_HOLES = "1020 trays with holes"
BF_1020_SOLID = "1020 trays, no holes"
BF_1010_HOLES = "1010 trays with holes"
ESPOMA_SEED = "Espoma seed starter, 16 qt"
HEMP = "Hemp mats, 10 by 20 in"
SCALE = "Etekcity 0.1 g scale"
SCISSORS = "Fiskars 5 in scissors"
MISTER = "AORAKI plant mister"
KIT_SPONGE = "Spongease kit, 3 trays"
TRAY_1010_SOLID_10 = "1010 trays, no holes"
COCO = "Verdana coir brick, 10 lb"
SANSI_CLIP = "SANSI clip-on grow light"
KIT_BUDDY = "Plant Buddy bamboo kit"
KIT_GREEN = "GreenEase kit, 10 by 10 trays"
KIT_SUN = "SunBlaster kit with heat mat"
TRAY_1010_SOLID_5 = "1010 solid trays, 5 pack"
KIT_MIZUNA = "Mizuna kit, 2 ceramic trays"
SANSI_BULB = "SANSI 10W grow bulb"
HEAT_SILL = "AC Infinity mat, 3 by 20 in"
KIT_CELLS = "Seed starter kit with dome"
SUNPACK = "Tray, dome, and 72 cells"
TRAY_DEEP = "Heavy duty 1020 trays"
DOMES = "Trays with humidity domes"
MIRACLE = "Miracle-Gro seed mix, 8 qt"
HEAT_1020 = "Heat mat, 10 by 20 in"
POTS_8 = "8 in pots with saucers"
POTS_8_10 = "Ceramic pots, 8 and 10 in"
RAIL = "Bloem rail planter, 24 in"
ESPOMA_POT = "Espoma potting mix, 16 qt"
LETTUCE = "Buttercrunch lettuce seeds"
BAGS = "5 gal fabric grow bags"
RADISH = "Radish microgreen seed"
RADISH_SMALL = "Radish seed, small tray"
PEA = "Pea microgreen seed"
PEA_HALF = "Pea seed, half tray"
BROCCOLI = "Broccoli microgreen seed"
MIXED_SEED = "Mixed microgreens seed"
AIR = "LetPot LPH-Air, 10 pods"

AIR_NOTE = "A 10-pod garden with its own light."

SHOP_PAGES: dict[str, dict] = {
    "apartment": {
        "heading": "Supplies for a first tray",
        "lead": "",
        "rows": [
            amazon("B07KRMP93C", KIT_SPONGE, "Trays, seed, and coir in one kit."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "A smaller tray when a 1020 does not fit."),
            amazon("B07MYNVP8G", TRAY_1010_SOLID_10, "A solid 1010 tray under the one with holes."),
            seed(MIXED_SEED, "Several crops in one collection."),
            amazon("B07QNSSN81", COCO, "A soilless coir brick. Not garden soil."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp if the window falls short."),
            amazon("B07FV7TZVH", SCISSORS, "A short pair for a cut above the mix."),
            amazon("B08BPTXK4L", SCALE, "Weigh seed dry before sowing or soaking."),
        ],
    },
    "cost": {
        "heading": "Kits and tray supplies to price",
        "lead": "Enter the price you would actually pay.",
        "rows": [
            amazon("B07KRMP93C", KIT_SPONGE, "Trays, seed, and coir in one kit."),
            amazon("B087RQWPBK", KIT_BUDDY, "A 15 by 7 in counter kit."),
            amazon("B07D7JDST2", KIT_GREEN, "Pads, 10 by 10 trays, and seed."),
            amazon("B0F2W7RNCC", KIT_SUN, "Trays, a heat mat, and domes."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "A reusable tray for the DIY route."),
            amazon("B07DT72V6H", BF_1020_SOLID, "The matching solid tray for that DIY pair."),
            seed(MIXED_SEED, "Loose seed for the DIY route."),
            letpot_air(AIR, AIR_NOTE),
        ],
    },
    "density": {
        "heading": "A scale, trays, and seed",
        "lead": "The rates above are dry grams. On True Leaf Market, check the bag weight against the rate. Confirm other prices on the seller page.",
        "rows": [
            amazon("B08BPTXK4L", SCALE, "Reads to 0.1 g for a small tray."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The 10 by 20 in reference tray."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The half-area 10 by 10 in tray."),
            amazon("B00VOEQTPG", TRAY_1010_SOLID_5, "A solid tray under the one with holes."),
            seed(RADISH, "Radish is 42 g on a 1020."),
            seed(PEA, "Pea is 150 g on a 1020, weighed dry."),
            seed(BROCCOLI, "Broccoli is 28 g on a 1020."),
            seed(MIXED_SEED, "Several crops from one collection."),
        ],
    },
    "pea": {
        "heading": "Trays and seed for this comparison",
        "lead": "Radish at 42 g with no presoak, and pea at 150 g after a soak, on the same 10 by 20 in tray.",
        "rows": [
            seed_product(RADISH, "42 g on a 10 by 20 in tray. About 21 g on a 10 by 10.", TRUELEAF_RADISH, "See radish seed"),
            seed_product(PEA, "150 g on a 10 by 20 in tray. About 75 g on a 10 by 10. Weigh dry, then soak.", TRUELEAF_PEA, "See pea seed"),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The shared 10 by 20 in tray."),
            amazon("B07DT72V6H", BF_1020_SOLID, "A catch tray for either crop."),
            amazon("B08BPTXK4L", SCALE, "Weigh pea dry, then soak."),
        ],
    },
    "windowsill": {
        "heading": "Supplies that fit a sill",
        "lead": "A 5 by 5 or 10 by 10 in tray often fits when a 10 by 20 in flat does not. Add a lamp only if stems lean or stay pale.",
        "rows": [
            amazon("B0DGF8Z1Z6", KIT_MIZUNA, "Two ceramic trays with coir and seeds."),
            amazon("B07D7JDST2", KIT_GREEN, "Three 10 by 10 trays for a sill."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "A reusable 10 by 10 in growing tray."),
            amazon("B00VOEQTPG", TRAY_1010_SOLID_5, "A solid tray so the sill stays dry."),
            seed(RADISH_SMALL, "Radish for a first small tray."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp with a timer."),
            amazon("B0D1XJ3H19", SANSI_BULB, "A 10W bulb for a lamp you own."),
            amazon("B08KTXTNR7", HEAT_SILL, "A narrow mat for a cold sill."),
        ],
    },
    "seed-starting": {
        "heading": "Supplies for indoor transplants",
        "lead": "These are for transplants, not a microgreens harvest. Sterile mix, pots with holes, and light close to the leaves.",
        "rows": [
            amazon("B075PV83JQ", KIT_CELLS, "Tray, dome, and cells, two sets."),
            amazon("B089KDN3HS", SUNPACK, "A solid tray, dome, and 72 cells."),
            amazon("B07YXGFGZ4", TRAY_DEEP, "Trays with holes for cell inserts."),
            amazon("B0981WC6ZW", DOMES, "Three domes with trays."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Soilless mix. Not garden soil."),
            amazon("B001W8U2NY", MIRACLE, "A smaller conventional seed mix."),
            amazon("B010BVRMIA", HEAT_1020, "A heat mat sized for a 1020."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp near the leaves."),
        ],
    },
    "bottom": {
        "heading": "Trays and medium for this method",
        "lead": "Nest a tray with holes in a tray without holes, add a shallow layer of water, then pour off the extra.",
        "rows": [
            amazon("B06XZFLY9P", BF_1020_HOLES, "The drained growing tray."),
            amazon("B07DT72V6H", BF_1020_SOLID, "The solid tray that catches water."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The same method at half size."),
            amazon("B07MYNVP8G", TRAY_1010_SOLID_10, "A solid 1010 reservoir, 10 pack."),
            amazon("B07QNSSN81", COCO, "Coir for the soilless fill."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Mix for the 1 to 1.5 in fill."),
            amazon("B0BHX5C38P", MISTER, "Mist at sowing, then water below."),
            amazon("B089KDN3HS", SUNPACK, "A solid tray with a dome."),
        ],
    },
    "balcony": {
        "heading": "Pots and mix for these layouts",
        "lead": "Layout A is two 8 in pots of lettuce plus a small herb pot. Layout B adds a 10 in pot if you have about 4 hours of sun. Every pot needs a hole. Check balcony load before adding wet mix.",
        "rows": [
            amazon("B0DCSH7T1R", POTS_8, "Two pots with saucers, one lettuce each."),
            amazon("B07W31GG31", POTS_8_10, "An 8 in pot and a 10 in pot."),
            amazon("B007WQBDVA", RAIL, "A 24 in planter for a flat rail."),
            amazon("B078WY9Z7Q", ESPOMA_POT, "Container mix, not ground soil."),
            amazon("B078GVDB1D", LETTUCE, "Buttercrunch for an 8 in pot."),
            amazon("B00TF9E6XE", BAGS, "A larger bag than the 8 in pot."),
            amazon("B07FV7TZVH", SCISSORS, "For cut-and-come-again leaves."),
        ],
    },
    "gear": {
        "heading": "Supplies for this list",
        "lead": "",
        "chooser": True,
        "rows": [
            routed(amazon("B07KRMP93C", KIT_SPONGE, "A ready-to-sow kit with trays, seed, and coir."), "kit"),
            routed(amazon("B06XZFLY9P", BF_1020_HOLES, "A reusable growing tray with holes."), "tray"),
            routed(amazon("B07DT72V6H", BF_1020_SOLID, "The matching solid tray."), "tray"),
            routed(seed(MIXED_SEED, "Loose seed for a tray or a container."), "tray reuse"),
            routed(amazon("B01N38GBTM", ESPOMA_SEED, "Soilless mix for a tray or a container."), "tray reuse"),
            routed(amazon("B08BPTXK4L", SCALE, "For weighing loose seed."), "tray reuse"),
            routed(amazon("B07FV7TZVH", SCISSORS, "For a cut above the mix."), "kit tray reuse"),
            routed(amazon("B0CHDBY2PD", SANSI_CLIP, "If the window falls short."), "kit tray reuse"),
        ],
    },
    "calculator": {
        "heading": "A scale, trays, and seed",
        "lead": "The result is a dry gram weight. Check bag weight on True Leaf Market.",
        "rows": [
            amazon("B08BPTXK4L", SCALE, "Weighs the gram result."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The tool's default 10 by 20 in tray."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The tool's 10 by 10 in preset."),
            seed(RADISH, "Radish is 42 g on a 1020."),
            seed(PEA, "Pea is 150 g on a 1020, dry."),
            seed(BROCCOLI, "Broccoli is 28 g on a 1020."),
            seed(MIXED_SEED, "Several crops, one collection."),
        ],
    },
}


def row_url(row: dict) -> str:
    if row["kind"] == "amazon":
        return amazon_url(row["asin"])
    return row["url"]


# Image metadata for leftover affiliate-box slugs that are not a catalog product key.
# Catalog products are the source of truth for shop and placement cards.
BUTTON = {"amazon": "View on Amazon", "trueleaf": "See at True Leaf", "letpot": "See at LetPot"}

LEGACY_IMAGES = {
    "radish": {
        "treatment": "crop",
        "slug": "radish",
        "alt": "A young chonggak radish seedling",
        "author": "이태수",
        "source_url": "https://commons.wikimedia.org/wiki/File:Sprouting_chonggakmu(chonggak_radish).jpg",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "note": "A radish seedling. Identifies the crop, not a seed packet.",
        "credit_id": "supply-radish",
    },
}

EDITORIAL_IMAGES = {
    'pepper-trays': {
        'treatment': 'editorial',
        'slug': 'pepper-trays',
        'alt': 'Nursery cell trays in black flats',
        'author': 'Furkan Akkurt',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Pepper_and_tomato_seedling_trays_at_Bo%C4%9Fazi%C3%A7i_University_2026.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Cell trays in nursery flats. Closest photo for a holed seed tray.',
        'credit_id': 'supply-pepper-trays',
    },
    'farm-trays': {
        'treatment': 'editorial',
        'slug': 'farm-trays',
        'alt': 'Seed trays at a nursery',
        'author': 'Judgefloro',
        'source_url': 'https://commons.wikimedia.org/wiki/File:5670Farm_Ready_Seedling_Facility_East_West_Seed_Philippines_20.jpg',
        'license': 'CC0 1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'note': 'Nursery seed trays. Stand-in where the listing is a solid tray or a heat mat.',
        'credit_id': 'supply-farm-trays',
    },
    'lufa': {
        'treatment': 'editorial',
        'slug': 'lufa',
        'alt': 'Pea shoots in long greenhouse trays',
        'author': 'Lufa Farms',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Lufa_Farms_Microgreens_in_Trays.jpg',
        'license': 'CC BY-SA 2.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'note': 'Greenhouse trays. Editorial photo used in a guide. Not a photograph of a home kit or a half tray of pea.',
        'credit_id': 'supply-lufa',
    },
    'sunflower': {
        'treatment': 'editorial',
        'slug': 'sunflower',
        'alt': 'Sunflower microgreens in a small clear tray',
        'author': 'Pannet',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Sunflower_microgreens_02.jpg',
        'license': 'CC BY 4.0',
        'license_url': 'https://creativecommons.org/licenses/by/4.0/',
        'note': 'A small tray of microgreens. Editorial photo used in a guide. Not a photograph of a small or solid tray and for a bamboo kit.',
        'credit_id': 'supply-sunflower',
    },
    'mixed': {
        'treatment': 'editorial',
        'slug': 'mixed',
        'alt': 'Small green leaves and pink stems in a clear container',
        'author': 'Stacy Spensley',
        'source_url': 'https://commons.wikimedia.org/wiki/File:11_microgreens.jpg',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Mixed small greens. Editorial photo used in a guide. Not a photograph of a seed mix or a small radish tray.',
        'credit_id': 'supply-mixed',
    },
    'radish': {
        'treatment': 'editorial',
        'slug': 'radish',
        'alt': 'A young chonggak radish seedling',
        'author': '이태수',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Sprouting_chonggakmu(chonggak_radish).jpg',
        'license': 'CC BY 4.0',
        'license_url': 'https://creativecommons.org/licenses/by/4.0/',
        'note': 'A radish seedling. Editorial photo used in a guide. Not a photograph of radish seed, and for a heat mat on the seed-starting page.',
        'credit_id': 'supply-radish',
    },
    'pea-sack': {
        'treatment': 'editorial',
        'slug': 'pea-sack',
        'alt': 'Sprouted garden peas in a cloth sack',
        'author': 'Yarzaryeni',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Garden_pea_sprouts.jpg',
        'license': 'CC BY 3.0',
        'license_url': 'https://creativecommons.org/licenses/by/3.0/',
        'note': 'Sprouted peas. Editorial photo used in a guide. Not a photograph of a bag of pea seed.',
        'credit_id': 'supply-pea-sack',
    },
    'pea-shoots': {
        'treatment': 'editorial',
        'slug': 'pea-shoots',
        'alt': 'Snow pea shoots in a container on a counter',
        'author': 'Daderot',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Snow_pea_shoots_-_Massachusetts.jpg',
        'license': 'CC0 1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'note': 'Pea shoots in a container. Editorial photo used in a guide. Not a photograph of a small holed tray and for a deep 1020.',
        'credit_id': 'supply-pea-shoots',
    },
    'broccoli': {
        'treatment': 'editorial',
        'slug': 'broccoli',
        'alt': 'A dense stand of small green sprouts',
        'author': 'Julie Gibbons',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Broccoli_sprouts.jpg',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Broccoli sprouts, as titled by the photographer.',
        'credit_id': 'supply-broccoli',
    },
    'basil': {
        'treatment': 'editorial',
        'slug': 'basil',
        'alt': 'Young basil seedlings beside a window',
        'author': 'Jon Eben Field',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Pot_of_basil_sprouts_(Ocimum_basilicum)_-_20050422.jpg',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Seedlings by a window. Editorial photo used in a guide. Not a photograph of a dome kit and for the full SunBlaster kit.',
        'credit_id': 'supply-basil',
    },
    'lettuce-pot': {
        'treatment': 'editorial',
        'slug': 'lettuce-pot',
        'alt': 'Leaf lettuce growing in a container',
        'author': 'Netha Hussain',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Leaf_lettuce_plant_in_a_pot_10.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Container lettuce. Editorial photo used in a guide. Not a photograph of the LetPot garden and for buttercrunch seed.',
        'credit_id': 'supply-lettuce-pot',
    },
    'basil-mosaic': {
        'treatment': 'editorial',
        'slug': 'basil-mosaic',
        'alt': 'Basil in a mosaic pot by a window',
        'author': 'Personal Creations',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Chalkboard_Plant_Stake_Basil_in_a_window_(14889072919).jpg',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'A second pot. Editorial photo used in a guide. Not a photograph of the 8 and 10 in ceramic pot pair.',
        'credit_id': 'supply-basil-mosaic',
    },
    'lettuce-leaves': {
        'treatment': 'editorial',
        'slug': 'lettuce-leaves',
        'alt': 'Frilly green lettuce leaves, close up',
        'author': 'Leon Brooks',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Hydroponic_lettuce_leaves_green.jpg',
        'license': 'Public domain',
        'license_url': 'https://commons.wikimedia.org/wiki/File:Hydroponic_lettuce_leaves_green.jpg',
        'note': 'Lettuce leaves. Editorial photo used in a guide. Not a photograph of mixed microgreen seed on the setup page, where the mixed-greens photo is already used.',
        'credit_id': 'supply-lettuce-leaves',
    },
    'potting-soil': {
        'treatment': 'editorial',
        'slug': 'potting-soil',
        'alt': 'Potting mix with white perlite in a round pot',
        'author': 'Chris Radcliff',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Potting_soil.jpg',
        'license': 'CC BY-SA 2.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'note': 'Potting mix with perlite, color-corrected and cropped on Commons by Daniel Case. Editorial photo used in a guide. Not a photograph of bagged potting and seed-starting mix.',
        'credit_id': 'supply-potting-soil',
    },
    'coir-pile': {
        'treatment': 'editorial',
        'slug': 'coir-pile',
        'alt': 'A compressed brick of coco coir',
        'author': 'Victor M. Vicente Selvas',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Horticulture_coir1310.JPG',
        'license': 'Public domain',
        'license_url': 'https://commons.wikimedia.org/wiki/File:Horticulture_coir1310.JPG',
        'note': 'A dry, compressed coir brick before soaking. Editorial photo used in a guide. Not a photograph of seed-starting mix.',
        'credit_id': 'supply-coir-pile',
    },
    'coco-brick': {
        'treatment': 'editorial',
        'slug': 'coco-brick',
        'alt': 'A compressed brick of coco coir',
        'author': 'MatiasMiika',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Brick_of_coco_coir.JPG',
        'license': 'CC BY 3.0',
        'license_url': 'https://creativecommons.org/licenses/by/3.0/',
        'note': 'A coir brick.',
        'credit_id': 'supply-coco-brick',
    },
    'coir-fiber': {
        'treatment': 'editorial',
        'slug': 'coir-fiber',
        'alt': 'Loose coconut coir fiber',
        'author': 'Fotokannan',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Coir_fibery.jpg',
        'license': 'CC BY-SA 3.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/3.0/',
        'note': 'Coir fiber. Editorial photo used in a guide. Not a photograph of a hemp grow mat.',
        'credit_id': 'supply-coir-fiber',
    },
    'scale': {
        'treatment': 'editorial',
        'slug': 'scale',
        'alt': 'A plain digital pocket scale',
        'author': 'TBBSC',
        'source_url': 'https://commons.wikimedia.org/wiki/File:TBBSC_Digital_Scale.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'A plain digital pocket scale with no brand name on the face. Not the Etekcity model.',
        'credit_id': 'supply-scale',
    },
    'scissors': {
        'treatment': 'editorial',
        'slug': 'scissors',
        'alt': 'Herb scissors on a white background',
        'author': 'Raimond Spekking',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Kr%C3%A4uterschere-0836.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Herb scissors. Not the Fiskars model.',
        'credit_id': 'supply-scissors',
    },
    'spray': {
        'treatment': 'editorial',
        'slug': 'spray',
        'alt': 'A plastic bottle with a hose spray head',
        'author': 'Rlsheehan',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Plastic_bottle_with_hose_spray_attachment.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'A spray bottle. Editorial photo used in a guide. Not a photograph of a plant mister.',
        'credit_id': 'supply-spray',
    },
    'grow-light': {
        'treatment': 'editorial',
        'slug': 'grow-light',
        'alt': 'Potted plants under a grow light',
        'author': 'Asdfjrjjj',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Potted_plants_succulents_under_grow_light_Nov_2016.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Plants under a grow light. Editorial photo used in a guide. Not a photograph of a clip-on lamp.',
        'credit_id': 'supply-grow-light',
    },
    'led-bulb': {
        'treatment': 'editorial',
        'slug': 'led-bulb',
        'alt': 'An LED light bulb',
        'author': 'Dmitry G',
        'source_url': 'https://commons.wikimedia.org/wiki/File:PILA_9290013873.JPG',
        'license': 'CC BY-SA 3.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/3.0/',
        'note': 'A photographed LED bulb. Editorial photo used in a guide. Not a photograph of a plant bulb.',
        'credit_id': 'supply-led-bulb',
    },
    'ceramic': {
        'treatment': 'editorial',
        'slug': 'ceramic',
        'alt': 'A leafy plant in a ceramic pot',
        'author': 'W.carter',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Plectranthus_verticillatus_in_a_ceramic_pot.jpg',
        'license': 'CC0 1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'note': 'A ceramic pot. Editorial photo used in a guide. Not a photograph of the ceramic microgreens kit and for 8 in pots.',
        'credit_id': 'supply-ceramic',
    },
    'windowbox': {
        'treatment': 'editorial',
        'slug': 'windowbox',
        'alt': 'A planted window box',
        'author': 'litchick_1',
        'source_url': 'https://commons.wikimedia.org/wiki/File:2009_windowbox_2463967211.jpg',
        'license': 'CC BY-SA 2.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'note': 'A window box. Editorial photo used in a guide. Not a photograph of a balcony rail planter.',
        'credit_id': 'supply-windowbox',
    },
    'grow-bag': {
        'treatment': 'editorial',
        'slug': 'grow-bag',
        'alt': 'A plant growing in a fabric grow bag',
        'author': 'Clintacc',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Brinjal_plant_with_fruits_in_grow_bag.jpg',
        'license': 'CC0 1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'note': 'A fabric grow bag with a plant. Editorial photo used in a guide. Not a photograph of empty grow bags.',
        'credit_id': 'supply-grow-bag',
    },
    'dome-trays': {
        'treatment': 'editorial',
        'slug': 'dome-trays',
        'alt': 'Seedling cell trays on a rack, one under a clear humidity dome',
        'author': 'F. D. Richards',
        'source_url': 'https://www.flickr.com/photos/50697352@N00/4464904926',
        'license': 'CC BY-SA 2.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'note': 'Cell trays with a clear humidity dome, square crop. Editorial photo used in a guide. Not a photograph of trays sold with domes and cells.',
        'credit_id': 'supply-dome-trays',
    },
    'microgreens-tray': {
        'treatment': 'editorial',
        'slug': 'microgreens-tray',
        'alt': 'Young red and green microgreens in a small black tray',
        'author': 'Zenyrgarden',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Microgreen_growing.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Microgreens growing in a small tray, square crop. Editorial photo used in a guide. Not a photograph of a microgreens kit.',
        'credit_id': 'supply-microgreens-tray',
    },
    'radish-bowl': {
        'treatment': 'editorial',
        'slug': 'radish-bowl',
        'alt': 'Purple radish microgreens in a steel bowl',
        'author': 'jonny.hunter',
        'source_url': 'https://www.flickr.com/photos/51931594@N00/461461364',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Harvested purple-stemmed radish microgreens, enlarged from a 500 by 375 pixel original. Editorial photo used in a guide. Not a photograph of Rambo radish microgreen seed.',
        'credit_id': 'supply-radish-bowl',
    },
    'mixed-seed': {
        'treatment': 'editorial',
        'slug': 'mixed-seed',
        'alt': 'Mixed seeds just sprouting, in purple, tan and green',
        'author': 'Br3nda',
        'source_url': 'https://www.flickr.com/photos/36251685@N00/6778605865',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'A mix of seeds starting to sprout. Editorial photo used in a guide. Not a photograph of a mixed microgreens seed collection.',
        'credit_id': 'supply-mixed-seed',
    },
    'microgreens-plate': {
        'treatment': 'editorial',
        'slug': 'microgreens-plate',
        'alt': 'Green microgreens on a white ceramic plate',
        'author': 'apapac',
        'source_url': 'https://www.flickr.com/photos/146235256@N06/37037208672',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Microgreens on a ceramic plate. Editorial photo used in a guide. Not a photograph of a ceramic microgreens kit.',
        'credit_id': 'supply-microgreens-plate',
    },
    'microgreens-dense': {
        'treatment': 'editorial',
        'slug': 'microgreens-dense',
        'alt': 'A dense stand of young microgreens',
        'author': 'Rosmarie Voegtli',
        'source_url': 'https://www.flickr.com/photos/94212497@N00/51830064936',
        'license': 'CC BY 2.0',
        'license_url': 'https://creativecommons.org/licenses/by/2.0/',
        'note': 'Young microgreens growing close together. Editorial photo used in a guide. Not a photograph of a small counter kit.',
        'credit_id': 'supply-microgreens-dense',
    },
    'heat-propagator': {
        'treatment': 'editorial',
        'slug': 'heat-propagator',
        'alt': 'A heated seed tray with three clear domes and a thermostat',
        'author': 'Home Garden Labs',
        'source_url': 'https://www.flickr.com/photos/98760644@N06/15471637569',
        'license': 'CC BY-SA 2.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'note': 'An X-Stream heated propagator by Nutriculture, padded to a square on white. Editorial photo used in a guide. Not a photograph of a kit with trays, a heat mat, and domes.',
        'credit_id': 'supply-heat-propagator',
    },
    'electric-propagator': {
        'treatment': 'editorial',
        'slug': 'electric-propagator',
        'alt': 'Seedlings in cells under a clear lid on a heated base',
        'author': 'Simon Speed',
        'source_url': 'https://commons.wikimedia.org/wiki/File:ElectricPropagator.JPG',
        'license': 'CC0 1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'note': 'An electric propagator that warms seedlings from below. Closest licensed photo for a seedling heat mat.',
        'credit_id': 'supply-electric-propagator',
    },
    'home-microgreens': {
        'treatment': 'editorial',
        'slug': 'home-microgreens',
        'alt': 'Young microgreens in a small pot',
        'author': 'Zenyrgarden',
        'source_url': 'https://commons.wikimedia.org/wiki/File:Microgreen_in_a_pot.jpg',
        'license': 'CC BY-SA 4.0',
        'license_url': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'note': 'Microgreens in a small pot. Editorial photo used in a guide. Not a photograph of a home kit.',
        'credit_id': 'supply-home-microgreens',
    },
    'alfalfa-jar': {
        'treatment': 'editorial',
        'slug': 'alfalfa-jar',
        'alt': 'Alfalfa sprouts in a glass jar',
        'author': 'Sproutable',
        'source_url': 'https://commons.wikimedia.org/wiki/File:AlfalfaSproutsJar1.jpg',
        'license': 'Public domain',
        'license_url': 'https://commons.wikimedia.org/wiki/File:AlfalfaSproutsJar1.jpg',
        'note': 'A jar of sprouts. Editorial photo used in a guide. Not a photograph of sprouting seed, not microgreens.',
        'credit_id': 'supply-alfalfa-jar',
    },
    'letpot-mini': {
        'treatment': 'editorial',
        'slug': 'letpot-mini',
        'alt': 'LetPot LPH-Mini indoor garden',
        'author': 'LetPot',
        'source_url': 'https://letpot.com/products/mini-hydroponics-growing-system',
        'license': 'LetPot promotional materials',
        'license_url': 'https://letpot.com/products/mini-hydroponics-growing-system',
        'note': 'Official product photo, converted to WebP at the same aspect. Not cropped or recolored.',
        'credit_id': 'supply-letpot-mini',
    },
    'letpot-air': {
        'treatment': 'editorial',
        'slug': 'letpot-air',
        'alt': 'LetPot LPH-Air indoor garden',
        'author': 'LetPot',
        'source_url': 'https://letpot.com/products/lph-air-indoor-hydroponic-gardening-system',
        'license': 'LetPot promotional materials',
        'license_url': 'https://letpot.com/products/lph-air-indoor-hydroponic-gardening-system',
        'note': 'Official product photo, converted to WebP at the same aspect. Not cropped or recolored.',
        'credit_id': 'supply-letpot-air',
    },
    'letpot-se': {
        'treatment': 'editorial',
        'slug': 'letpot-se',
        'alt': 'LetPot LPH-SE indoor garden',
        'author': 'LetPot',
        'source_url': 'https://letpot.com/products/letpot-senior-12-pod-hydroponic-growing-system-with-app-control',
        'license': 'LetPot promotional materials',
        'license_url': 'https://letpot.com/products/letpot-senior-12-pod-hydroponic-growing-system-with-app-control',
        'note': 'Official product photo, converted to WebP at the same aspect. Not cropped or recolored.',
        'credit_id': 'supply-letpot-se',
    },
    'letpot-lite': {
        'treatment': 'editorial',
        'slug': 'letpot-lite',
        'alt': 'LetPot LPH-Lite indoor garden',
        'author': 'LetPot',
        'source_url': 'https://letpot.com/products/letpot-lph-lite-hydroponics-growing-system-12-pods',
        'license': 'LetPot promotional materials',
        'license_url': 'https://letpot.com/products/letpot-lph-lite-hydroponics-growing-system-12-pods',
        'note': 'Official product photo, converted to WebP at the same aspect. Not cropped or recolored.',
        'credit_id': 'supply-letpot-lite',
    },
    'letpot-max': {
        'treatment': 'editorial',
        'slug': 'letpot-max',
        'alt': 'LetPot LPH-Max indoor garden',
        'author': 'LetPot',
        'source_url': 'https://letpot.com/products/lph-max-21-pod-hydroponics-system-with-app-control',
        'license': 'LetPot promotional materials',
        'license_url': 'https://letpot.com/products/lph-max-21-pod-hydroponics-system-with-app-control',
        'note': 'Official product photo, converted to WebP at the same aspect. Not cropped or recolored.',
        'credit_id': 'supply-letpot-max',
    },
}


# Page-only image choices when two catalog products share a display name.
PAGE_PRODUCT = {}




def supply_image_tuple(slug: str):
    """Legacy (alt, author, source, license, license_url, note, stand_in) for older callers."""
    image = image_meta(slug)
    return (
        image["alt"],
        image.get("author") or "",
        image.get("source_url") or "",
        image.get("license") or "",
        image.get("license_url") or "",
        image.get("note") or "",
        image.get("treatment") not in {"official", "licensed-exact"},
    )


class _SupplyImages(dict):
    def __contains__(self, slug):
        try:
            image_meta(slug)
            return True
        except SystemExit:
            return False

    def __getitem__(self, slug):
        return supply_image_tuple(slug)

    def items(self):
        slugs = {p["image"]["slug"] for p in catalog.products().values()}
        slugs.update(LEGACY_IMAGES)
        return ((slug, self[slug]) for slug in sorted(slugs))

    def keys(self):
        return (slug for slug, _ in self.items())

    def values(self):
        return (row for _, row in self.items())


SUPPLY_IMAGES = _SupplyImages()


def product_for(key: str, row: dict) -> dict:
    if row.get("asin"):
        found = catalog.by_asin(row["asin"])
        if found:
            return found
    found = catalog.by_name(row["item"])
    if not found:
        raise SystemExit(f"No catalog product for {key} item {row['item']!r}")
    override = PAGE_PRODUCT.get(key, {}).get(row["item"])
    if override:
        return catalog.by_id(override)
    return found


def image_meta(slug: str) -> dict:
    for product in catalog.products().values():
        image = product["image"]
        if image["slug"] == slug:
            return image
    if slug in LEGACY_IMAGES:
        return LEGACY_IMAGES[slug]
    if slug in EDITORIAL_IMAGES:
        return EDITORIAL_IMAGES[slug]
    raise SystemExit(f"No image metadata for slug {slug}")


def image_for(key: str, item: str) -> str:
    # Kept for callers that only have a page key and item name.
    row = {"item": item}
    for candidate in SHOP_PAGES[key]["rows"]:
        if candidate["item"] == item:
            row = candidate
            break
    return product_for(key, row)["image"]["slug"]


def photo_stem(slug: str) -> str:
    return catalog.photo_stem(slug)


def render_shop(key: str) -> str:
    page = SHOP_PAGES[key]
    rows = page["rows"]
    if len(rows) < 3:
        raise SystemExit(f"{key} shop table needs at least 3 rows")
    seen = []
    cards = []
    for row in rows:
        product = product_for(key, row)
        image = product["image"]
        slug = image["slug"]
        stem = catalog.require_photo_files(slug)
        if slug in seen:
            raise SystemExit(f"{key} repeats supply photo {slug}")
        seen.append(slug)
        src = f"/assets/products/{stem}-600.webp"
        srcset = f"/assets/products/{stem}-300.webp 300w, /assets/products/{stem}-600.webp 600w"
        treatment = image["treatment"]
        official = treatment == "official"
        plain = treatment == "neutral"
        img_class = ' class="letpot-photo"' if official else (' class="plain-photo"' if plain else "")
        media_class = "pick-media"
        if official:
            media_class += " pick-media-letpot"
        if plain:
            media_class += " pick-media-plain"
        if official:
            caption = '<figcaption class="pick-credit">Photo: LetPot</figcaption>'
        elif plain:
            caption = ""
        else:
            credit_id = image.get("credit_id") or f"supply-{slug}"
            caption = (
                f'<figcaption class="pick-credit">Photo: '
                f'<a href="/photo-credits/#{esc(credit_id)}">{esc(image["author"])}</a></figcaption>'
            )
        button = BUTTON[row["kind"]] if row["kind"] == "amazon" else row["label"]
        routes_attr = f' data-routes="{esc(row["routes"])}"' if row.get("routes") else ""
        role = (product.get("fits") or {}).get("role") or ""
        role_attr = f' data-role="{esc(role)}"' if role else ""
        product_attr = f' data-product="{esc(product["id"])}"'
        cards.append(
            f'<li class="pick"{routes_attr}{product_attr}{role_attr}>'
            f'<figure class="{media_class}">'
            f'<img{img_class} src="{src}" srcset="{srcset}" '
            'sizes="(min-width: 1024px) 240px, (min-width: 720px) 30vw, 46vw" '
            'width="600" height="600" loading="lazy" decoding="async" '
            f'alt="{esc(image["alt"])}">'
            f"{caption}"
            "</figure>"
            f'<h3 class="pick-name">{esc(row["item"])}</h3>'
            f'<p class="pick-why">{esc(row["note"])}</p>'
            f'<a class="pick-cta" href="{esc(row_url(row))}" rel="sponsored nofollow noopener" target="_blank">'
            f'{esc(button)}<span class="sr-only"> (opens in a new tab)</span></a>'
            "</li>"
        )
    if page.get("chooser"):
        return (
            '<section class="picks route-picks" id="matching-supplies" aria-labelledby="matching-supplies-title">'
            f'<h3 id="matching-supplies-title">{esc(page["heading"])}</h3>'
            + (f'<p class="picks-lead">{esc(page["lead"])}</p>' if page["lead"] else "")
            +
            '<p class="route-picks-status" id="route-picks-status" role="status" hidden></p>'
            '<ul class="pick-grid" role="list">'
            + "".join(cards)
            + "</ul></section>"
        )
    return (
        '<section class="picks" id="matching-supplies">'
        f"<h2>{esc(page['heading'])}</h2>"
        + (f'<p class="picks-lead">{esc(page["lead"])}</p>' if page["lead"] else "")
        + '<ul class="pick-grid" role="list">'
        + "".join(cards)
        + "</ul></section>"
    )


def supply_credit_html() -> str:
    blocks = []
    seen: set[str] = set()
    records = []
    for product in catalog.products().values():
        image = product["image"]
        if image["treatment"] == "neutral":
            continue
        slug = image["slug"]
        if slug in seen:
            continue
        seen.add(slug)
        records.append(image)
    for image in list(LEGACY_IMAGES.values()) + list(EDITORIAL_IMAGES.values()):
        if image["slug"] not in seen:
            records.append(image)
            seen.add(image["slug"])
    for image in records:
        slug = image["slug"]
        stem = photo_stem(slug)
        official = image["treatment"] == "official"
        src = f"/assets/products/{stem}-600.webp"
        credit_id = image.get("credit_id") or f"supply-{slug}"
        if official:
            origin = "LetPot product page"
            use = f"{esc(image['note'])} Shown with the full frame on a light background."
        else:
            source = image["source_url"] or ""
            origin = "Flickr" if "flickr.com" in source else "Wikimedia Commons"
            use = esc(image["note"] or "")
        author = image["author"] or "Unknown"
        source = image["source_url"] or ""
        license_name = image["license"] or ""
        license_url = image["license_url"] or source
        blocks.append(
            f'<section class="photo-credit-entry" id="{esc(credit_id)}">'
            f'<img src="{src}" width="600" height="600" alt="{esc(image["alt"])}" loading="lazy" decoding="async">'
            "<div>"
            f'<h2>{esc(image["alt"])}</h2>'
            f'<p><strong>Photographer:</strong> <a href="{esc(source)}">{esc(author)}</a>.</p>'
            f'<p><strong>Original:</strong> <a href="{esc(source)}">{origin}</a>.</p>'
            f'<p><strong>License:</strong> <a href="{esc(license_url)}">{esc(license_name)}</a>.</p>'
            f"<p><strong>Image use:</strong> {use}</p>"
            "</div></section>"
        )
    return "\n".join(blocks)


def placement_counts() -> dict[str, dict[str, int]]:
    counts = {}
    for key, page in SHOP_PAGES.items():
        bucket = {"amazon": 0, "trueleaf": 0, "letpot": 0}
        for row in page["rows"]:
            bucket[row["kind"]] += 1
        counts[key] = bucket
    return counts
