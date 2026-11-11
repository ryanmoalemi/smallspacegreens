"""Approved supply links for guide pages.

Amazon rows use https://www.amazon.com/dp/ASIN?tag=smallspaceg04-20.
Microgreen seed rows use the approved True Leaf Market collection.
The LetPot garden uses the approved LPH-Air Awin link, not Amazon.
"""

from __future__ import annotations

from pathlib import Path

AMAZON_TAG = "smallspaceg04-20"
AMAZON_DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases."
TRUELEAF_SEED = (
    "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328"
    "&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fmicro-greens-planting-seed"
)
LETPOT_AIR = (
    "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328"
    "&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Flph-air-indoor-hydroponic-gardening-system"
)
SEED_LABEL = "See microgreens seed"
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


def amazon(asin: str, item: str, note: str) -> dict:
    return {"kind": "amazon", "asin": asin, "item": item, "note": note, "label": AMAZON_LABEL}


def seed(item: str, note: str) -> dict:
    return {"kind": "trueleaf", "item": item, "note": note, "label": SEED_LABEL, "url": TRUELEAF_SEED}


def letpot_air(item: str, note: str) -> dict:
    return {"kind": "letpot", "item": item, "note": note, "label": AIR_LABEL, "url": LETPOT_AIR}


# Names follow the live listing title and brand line checked on 2026-11-10.
# Notes stay with this site's method. They do not add a price, rating, or stock claim.

BF_1020_HOLES = "Bootstrap Farmer extra-strength 1020 trays, 10 pack, black, with holes"
BF_1020_SOLID = "Bootstrap Farmer shallow 1020 trays, no holes, extra strength, white, 5 pack"
BF_1010_HOLES = "Bootstrap Farmer 1010 trays with holes, 10 pack, 1.25 in shallow"
ESPOMA_SEED = "Espoma organic seed starter premium potting mix, 16 qt"
HEMP = "terrafibre hemp growing mats, 10 by 20 in, 10 pack"
SCALE = "Etekcity 0.1 g food scale with bowl"
SCISSORS = "Fiskars 5 in herb scissors with sheath"
MISTER = "AORAKI mister spray bottle for plants"
KIT_SPONGE = "Spongease microgreens grow kit: 3 trays, 3 seed packs, and 3 quarts coco coir"
TRAY_1010_SOLID_10 = "5GallonBucketHydro 1010 trays, no drain holes, 10 pack"
COCO = "Verdana coco coir brick, 10 lb compressed"
SANSI_CLIP = "SANSI 10W clip-on grow light, 1 pack, dimmable, with a timer"
KIT_BUDDY = "Plant Buddy bamboo microgreens kit, 15 by 7 in, with coir, spray bottle, and radish seed"
KIT_GREEN = "GreenEase microgreens starter kit: 10 jute pads, three 10 by 10 trays, and 3 seed packs"
KIT_SUN = "SunBlaster microgreen kit with trays, heat mat, vented domes, coco coir, spray bottle, and pruner"
TRAY_1010_SOLID_5 = "Living Whole Foods 1010 trays, no drain holes, 5 pack"
KIT_MIZUNA = "mizuna microgreens kit with 2 ceramic trays, coconut coir, and seeds"
SANSI_BULB = "SANSI LED grow light bulb, A17, E26 base, 10W"
HEAT_SILL = "AC Infinity SUNCORE A1 seedling heat mat, 3 by 20 in"
KIT_CELLS = "Bootstrap Farmer extra-strength seed starter kit, 2 pack: 1020 tray, humidity dome, and 50-cell plug tray"
SUNPACK = "SUNPACK 1020 tray with no drain holes, humidity dome, and 72-cell insert, 1 set"
TRAY_DEEP = "TO Plastics heavy duty 1020 trays with holes, 10 pack"
DOMES = "MIDASHYDRO seed starter trays and humidity domes, 3 pack, listed with no holes"
MIRACLE = "Miracle-Gro seed starting potting mix, 8 qt"
HEAT_1020 = "Earth Start seed starter heat mat, 10 by 20.75 in"
POTS_8 = "Melphoe 8 in pots with drainage and saucer, 2 pack"
POTS_8_10 = "D'vine Dev ceramic pots with saucers, 8 in and 10 in, 2 pack"
RAIL = "Bloem deck balcony rail planter, 24 in, terra cotta"
ESPOMA_POT = "Espoma organic potting mix for indoor and outdoor containers, 16 qt"
LETTUCE = "Burpee Buttercrunch lettuce seeds, 500 seeds"
BAGS = "VIVOSUN 5 gallon fabric grow bags with handles, 5 pack"
RADISH = "Radish microgreen seed"
RADISH_SMALL = "Radish microgreen seed for a small tray"
PEA = "Pea microgreen seed"
PEA_HALF = "Pea microgreen seed for a half tray"
BROCCOLI = "Broccoli microgreen seed"
MIXED_SEED = "Mixed microgreens seed"
AIR = "LetPot LPH-Air 10-pod indoor garden"

AIR_NOTE = (
    "LetPot describes the LPH-Air as a 10-pod indoor garden with full-spectrum LED lights, "
    "light settings you can control from the app, automatic water circulation, and adjustable height."
)

SHOP_PAGES: dict[str, dict] = {
    "checklist": {
        "heading": "Supplies for this list",
        "lead": "These match the steps above. This site has not used them. Confirm the variant and the current price on the seller page.",
        "rows": [
            amazon("B06XZFLY9P", BF_1020_HOLES, "A drained 10 by 20 in growing tray for the nested pair."),
            amazon("B07DT72V6H", BF_1020_SOLID, "A solid catch tray. Nest the tray with holes inside it."),
            seed(RADISH, "A first-crop option. Utah State's 10 by 20 in radish rate is 42 g. Check the bag weight."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Soilless seed-starting mix for a fill about 1 to 1.5 inches deep."),
            amazon("B0758LHRNR", HEMP, "A 10 by 20 in mat, listed as fitting 1020 trays. Use one only if the method calls for a mat."),
            amazon("B08BPTXK4L", SCALE, "Weigh the dry grams from the calculator before any soak."),
            amazon("B07FV7TZVH", SCISSORS, "A short pair for a cut above the mix."),
            amazon("B0BHX5C38P", MISTER, "Mist at sowing, then switch to bottom watering."),
        ],
    },
    "apartment": {
        "heading": "Supplies for a first tray",
        "lead": "Examples for the list above. This site has not used them.",
        "rows": [
            amazon("B07KRMP93C", KIT_SPONGE, "Trays, seed, and coir in one kit."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "A smaller tray when a 10 by 20 in flat does not fit."),
            amazon("B07MYNVP8G", TRAY_1010_SOLID_10, "A solid 1010 tray under the one with holes."),
            seed(MIXED_SEED, "Seed for edible microgreens, including several crops. Check each bag weight."),
            amazon("B07QNSSN81", COCO, "A soilless coir brick. Not garden soil."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp if the window falls short."),
            amazon("B07FV7TZVH", SCISSORS, "A short pair for a cut above the mix."),
            amazon("B08BPTXK4L", SCALE, "Weigh seed dry before sowing or soaking."),
        ],
    },
    "cost": {
        "heading": "Kits and tray supplies to price",
        "lead": "Options for the comparison above, not a ranking. Prices are not listed here. This site has not used these products. Enter the price you would actually pay.",
        "rows": [
            amazon("B07KRMP93C", KIT_SPONGE, "A small kit with trays, loose seed, and coir, so a later planting is ordinary seed and coir."),
            amazon("B087RQWPBK", KIT_BUDDY, "A 15 by 7 in counter kit. A smaller footprint than a 1020."),
            amazon("B07D7JDST2", KIT_GREEN, "Pads, 10 by 10 trays, and seed. Later plantings are pads and seed."),
            amazon("B0F2W7RNCC", KIT_SUN, "A fuller kit: trays, heat mat, vented domes, coir, a spray bottle, and a pruner."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "A reusable DIY growing tray. Later plantings are seed and medium."),
            amazon("B07DT72V6H", BF_1020_SOLID, "The matching solid tray for that DIY pair."),
            seed(MIXED_SEED, "Loose seed for the DIY route. A kit and a bag of seed are different purchases."),
            letpot_air(AIR, AIR_NOTE),
        ],
    },
    "density": {
        "heading": "A scale, trays, and seed",
        "lead": "The rates above are dry grams. This site has not used these products. On True Leaf Market, check the bag weight against the rate. Confirm other prices on the seller page.",
        "rows": [
            amazon("B08BPTXK4L", SCALE, "Reads to 0.1 g, which is what a small tray needs."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The 10 by 20 in reference tray in the rate table."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The half-area 10 by 10 in example."),
            amazon("B00VOEQTPG", TRAY_1010_SOLID_5, "A solid 1010 tray, in a 5 pack, under the tray with holes."),
            seed(RADISH, "Utah State's radish rate is 42 g on a 10 by 20 in tray. Check the bag weight."),
            seed(PEA, "Pea is 150 g on a 10 by 20 in tray, weighed dry before the soak."),
            seed(BROCCOLI, "Broccoli in that table is 28 g on a 10 by 20 in tray."),
            seed(MIXED_SEED, "Several calculator crops from one collection. Match each bag to its rate."),
        ],
    },
    "pea": {
        "heading": "Trays and seed for this comparison",
        "lead": "Radish at 42 g with no presoak, and pea at 150 g after a soak, on the same 10 by 20 in tray. Seed links go to True Leaf Market's microgreens collection. Check the bag weight there. This site has not used these products.",
        "rows": [
            seed(RADISH, "For the 42 g radish rate on a 10 by 20 in tray. Check that the bag covers it."),
            seed(RADISH_SMALL, "A 10 by 10 in tray is about 21 g of radish. A 5 by 5 in tray is about 5 g."),
            seed(PEA, "The full-tray pea rate is 150 g, weighed dry, then soaked."),
            seed(PEA_HALF, "A half tray is about 75 g of pea, dry, before the soak."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The shared 10 by 20 in growing tray in the table above."),
            amazon("B07DT72V6H", BF_1020_SOLID, "A catch tray for either crop. Do not mix pea and radish in one tray."),
            amazon("B08BPTXK4L", SCALE, "Weigh pea dry, then soak."),
        ],
    },
    "windowsill": {
        "heading": "Supplies that fit a sill",
        "lead": "A 5 by 5 or 10 by 10 in tray often fits when a 10 by 20 in flat does not. Add a lamp only if stems lean or stay pale. This site has not used these products.",
        "rows": [
            amazon("B0DGF8Z1Z6", KIT_MIZUNA, "Two ceramic trays with coir and seeds, for a kitchen sill."),
            amazon("B07D7JDST2", KIT_GREEN, "Three 10 by 10 in trays, the size this guide names as a common sill fit."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "A reusable 10 by 10 in growing tray."),
            amazon("B00VOEQTPG", TRAY_1010_SOLID_5, "A solid half-size tray so water does not drip on the sill."),
            seed(RADISH_SMALL, "Radish is the suggested first sill crop. A 1-tray test needs less than a full 1020."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp with a timer for the add-a-lamp step."),
            amazon("B0D1XJ3H19", SANSI_BULB, "A 10W plant bulb if you already have an E26 desk or clamp lamp."),
            amazon("B08KTXTNR7", HEAT_SILL, "A 3 by 20 in seedling heat mat, if you germinate off a cold pane."),
        ],
    },
    "seed-starting": {
        "heading": "Supplies for indoor transplants",
        "lead": "These are for transplants, not a microgreens harvest. Sterile mix, pots with holes, and light close to the leaves. This site has not used these products.",
        "rows": [
            amazon("B075PV83JQ", KIT_CELLS, "A cell-tray set: 1020 tray, humidity dome, and 50-cell insert, two of each."),
            amazon("B089KDN3HS", SUNPACK, "One set: solid 1020, humidity dome, and a 72-cell insert."),
            amazon("B07YXGFGZ4", TRAY_DEEP, "Heavy duty 1020 trays with holes, 10 pack, for cell inserts."),
            amazon("B0981WC6ZW", DOMES, "Three humidity domes with trays. The listing says those trays have no holes."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Soilless seed-starting mix. Do not use garden soil."),
            amazon("B001W8U2NY", MIRACLE, "A conventional seed-starting mix, 8 qt, if you are not buying the organic bag."),
            amazon("B010BVRMIA", HEAT_1020, "A 10 by 20.75 in heat mat under a 1020 for warm germination."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp with a timer, for a long day close to the leaves."),
        ],
    },
    "bottom": {
        "heading": "Trays and medium for this method",
        "lead": "Nest a tray with holes in a tray without holes, add a shallow layer of water, then pour off the extra. This site has not used these products.",
        "rows": [
            amazon("B06XZFLY9P", BF_1020_HOLES, "The drained growing tray."),
            amazon("B07DT72V6H", BF_1020_SOLID, "The solid reservoir. Check that it nests with the growing tray you choose."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The same method at half size, if a 1020 does not fit."),
            amazon("B07MYNVP8G", TRAY_1010_SOLID_10, "A solid 1010 reservoir, 10 pack."),
            amazon("B07QNSSN81", COCO, "Coir for the soilless fill. Utah State's example uses about 2 cups of water in a 1020."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Seed-starting mix for the 1 to 1.5 inch fill, instead of coir."),
            amazon("B0BHX5C38P", MISTER, "Mist the surface at sowing, then switch to bottom water."),
            amazon("B089KDN3HS", SUNPACK, "A solid 1020 in a one-set kit, with a dome if the crop's method calls for a cover."),
        ],
    },
    "balcony": {
        "heading": "Pots and mix for these layouts",
        "lead": "Layout A is two 8 in pots of lettuce plus a small herb pot. Layout B adds a 10 in pot if you have about 4 hours of sun. Every pot needs a hole. This site has not used these products. Check balcony load before adding wet mix.",
        "rows": [
            amazon("B0DCSH7T1R", POTS_8, "Two 8 in pots with drainage and a saucer, for one lettuce each."),
            amazon("B07W31GG31", POTS_8_10, "An 8 in pot and a 10 in pot, both with saucers, for Layout B."),
            amazon("B007WQBDVA", RAIL, "A 24 in rail planter, listed for flat rails about 3.75 or 5.75 in wide, about 4 gallons. Confirm the rail and the building rules."),
            amazon("B078WY9Z7Q", ESPOMA_POT, "Container mix for herbs and vegetables, 16 qt. Not ground soil."),
            amazon("B078GVDB1D", LETTUCE, "Buttercrunch lettuce, listed as 500 seeds, for the lettuce in an 8 in pot."),
            amazon("B00TF9E6XE", BAGS, "A 5 gallon fabric bag, 5 pack. Larger than the 8 in lettuce pot. Weigh that against the load warning."),
            amazon("B07FV7TZVH", SCISSORS, "A short pair for cut-and-come-again lettuce and herbs."),
        ],
    },
    "gear": {
        "heading": "Example supplies for these lists",
        "lead": "One example for each line on the lists above. A kit, reusable trays, or a container you own are still different approaches. This site has not used these products.",
        "rows": [
            amazon("B07KRMP93C", KIT_SPONGE, "A ready-to-sow kit with trays, seed, and coir."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "A reusable growing tray with holes."),
            amazon("B07DT72V6H", BF_1020_SOLID, "The matching solid tray."),
            seed(MIXED_SEED, "Loose seed for the reusable-tray path. Check the bag against your crop."),
            amazon("B01N38GBTM", ESPOMA_SEED, "Soilless mix for a DIY tray or a reused food container."),
            amazon("B08BPTXK4L", SCALE, "The scale the list already asks you to use for loose seed."),
            amazon("B07FV7TZVH", SCISSORS, "Harvest scissors the kit and DIY lists both include."),
            amazon("B0CHDBY2PD", SANSI_CLIP, "A clip-on lamp for the question about whether your spot needs a light."),
        ],
    },
    "calculator": {
        "heading": "A scale, trays, and seed",
        "lead": "The result is a dry gram weight. These are ways to measure it, hold it, and buy seed that can cover it. This site has not used these products. Check bag weight on True Leaf Market.",
        "rows": [
            amazon("B08BPTXK4L", SCALE, "Turns the gram result into a measured sowing."),
            amazon("B06XZFLY9P", BF_1020_HOLES, "The tool's default 10 by 20 in tray."),
            amazon("B07NKSKMCN", BF_1010_HOLES, "The tool's 10 by 10 in preset."),
            seed(RADISH, "The radish rate is 42 g on a 10 by 20 in tray. Check the bag weight."),
            seed(PEA, "The pea rate is 150 g on a 10 by 20 in tray, dry, before soaking."),
            seed(BROCCOLI, "The broccoli rate is 28 g on a 10 by 20 in tray."),
            seed(MIXED_SEED, "Several crops in the tool, from one seed collection."),
        ],
    },
}


def row_url(row: dict) -> str:
    if row["kind"] == "amazon":
        return amazon_url(row["asin"])
    return row["url"]


# Example photos. stand_in means the picture is the closest real product type, not that exact item.
SUPPLY_IMAGES = {
    "pepper-trays": ("Nursery cell trays in black flats", "Furkan Akkurt", "https://commons.wikimedia.org/wiki/File:Pepper_and_tomato_seedling_trays_at_Bo%C4%9Fazi%C3%A7i_University_2026.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "Cell trays in nursery flats. Closest photo for a holed seed tray.", False),
    "farm-trays": ("Seed trays at a nursery", "Judgefloro", "https://commons.wikimedia.org/wiki/File:5670Farm_Ready_Seedling_Facility_East_West_Seed_Philippines_20.jpg", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "Nursery seed trays. Stand-in where the listing is a solid tray or a heat mat.", True),
    "lufa": ("Pea shoots in long greenhouse trays", "Lufa Farms", "https://commons.wikimedia.org/wiki/File:Lufa_Farms_Microgreens_in_Trays.jpg", "CC BY-SA 2.0", "https://creativecommons.org/licenses/by-sa/2.0/", "Greenhouse trays. Stand-in for a home kit or a half tray of pea.", True),
    "sunflower": ("Sunflower microgreens in a small clear tray", "Pannet", "https://commons.wikimedia.org/wiki/File:Sunflower_microgreens_02.jpg", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/", "A small tray of microgreens. Stand-in for a small or solid tray and for a bamboo kit.", True),
    "mixed": ("Small green leaves and pink stems in a clear container", "Stacy Spensley", "https://commons.wikimedia.org/wiki/File:11_microgreens.jpg", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/", "Mixed small greens. Stand-in for a seed mix or a small radish tray.", True),
    "radish": ("A young chonggak radish seedling", "이태수", "https://commons.wikimedia.org/wiki/File:Sprouting_chonggakmu(chonggak_radish).jpg", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/", "A radish seedling. Stand-in for radish seed, and for a heat mat on the seed-starting page.", True),
    "pea-sack": ("Sprouted garden peas in a cloth sack", "Yarzaryeni", "https://commons.wikimedia.org/wiki/File:Garden_pea_sprouts.jpg", "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0/", "Sprouted peas. Stand-in for a bag of pea seed.", True),
    "pea-shoots": ("Snow pea shoots in a container on a counter", "Daderot", "https://commons.wikimedia.org/wiki/File:Snow_pea_shoots_-_Massachusetts.jpg", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "Pea shoots in a container. Stand-in for a small holed tray and for a deep 1020.", True),
    "broccoli": ("A dense stand of small green sprouts", "Julie Gibbons", "https://commons.wikimedia.org/wiki/File:Broccoli_sprouts.jpg", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/", "Broccoli sprouts, as titled by the photographer.", False),
    "basil": ("Young basil seedlings beside a window", "Jon Eben Field", "https://commons.wikimedia.org/wiki/File:Pot_of_basil_sprouts_(Ocimum_basilicum)_-_20050422.jpg", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/", "Seedlings by a window. Stand-in for a dome kit and for the full SunBlaster kit.", True),
    "lettuce-pot": ("Leaf lettuce growing in a container", "Netha Hussain", "https://commons.wikimedia.org/wiki/File:Leaf_lettuce_plant_in_a_pot_10.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "Container lettuce. Stand-in for the LetPot garden and for buttercrunch seed.", True),
    "basil-mosaic": ("Basil in a mosaic pot by a window", "Personal Creations", "https://commons.wikimedia.org/wiki/File:Chalkboard_Plant_Stake_Basil_in_a_window_(14889072919).jpg", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/", "A second pot. Stand-in for the 8 and 10 in ceramic pot pair.", True),
    "lettuce-leaves": ("Frilly green lettuce leaves, close up", "Leon Brooks", "https://commons.wikimedia.org/wiki/File:Hydroponic_lettuce_leaves_green.jpg", "Public domain", "https://commons.wikimedia.org/wiki/File:Hydroponic_lettuce_leaves_green.jpg", "Lettuce leaves. Stand-in for mixed microgreen seed on the setup page, where the mixed-greens photo is already used.", True),
    "promix": ("A bag of Pro-Mix potting soil", "Unknown", "https://commons.wikimedia.org/wiki/File:Pro-Mix_Potting_Soil.jpg", "Public domain", "https://commons.wikimedia.org/wiki/File:Pro-Mix_Potting_Soil.jpg", "A potting-mix bag. Stand-in for Espoma potting mix and Miracle-Gro mix.", True),
    "coir-pile": ("Loose coco coir", "Victor M. Vicente Selvas", "https://commons.wikimedia.org/wiki/File:Horticulture_coir1310.JPG", "Public domain", "https://commons.wikimedia.org/wiki/File:Horticulture_coir1310.JPG", "Loose coir. Stand-in for seed-starting mix.", True),
    "coco-brick": ("A compressed brick of coco coir", "MatiasMiika", "https://commons.wikimedia.org/wiki/File:Brick_of_coco_coir.JPG", "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0/", "A coir brick.", False),
    "coir-fiber": ("Loose coconut coir fiber", "Fotokannan", "https://commons.wikimedia.org/wiki/File:Coir_fibery.jpg", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0/", "Coir fiber. Stand-in for a hemp grow mat.", True),
    "scale": ("A digital kitchen scale on a counter", "Ser Amantio di Nicolao", "https://commons.wikimedia.org/wiki/File:Escali_digital_kitchen_scale.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "A digital kitchen scale. Not the Etekcity model.", True),
    "scissors": ("Herb scissors on a white background", "Raimond Spekking", "https://commons.wikimedia.org/wiki/File:Kr%C3%A4uterschere-0836.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "Herb scissors. Not the Fiskars model.", True),
    "spray": ("A plastic bottle with a hose spray head", "Rlsheehan", "https://commons.wikimedia.org/wiki/File:Plastic_bottle_with_hose_spray_attachment.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "A spray bottle. Stand-in for a plant mister.", True),
    "grow-light": ("Potted plants under a grow light", "Asdfjrjjj", "https://commons.wikimedia.org/wiki/File:Potted_plants_succulents_under_grow_light_Nov_2016.jpg", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "Plants under a grow light. Stand-in for a clip-on lamp.", True),
    "led-bulb": ("An LED light bulb", "Tommaso.sansone91", "https://commons.wikimedia.org/wiki/File:Led_light_bulb_-_led_lamp_2.png", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "An LED bulb. Stand-in for a plant bulb.", True),
    "ceramic": ("A leafy plant in a ceramic pot", "W.carter", "https://commons.wikimedia.org/wiki/File:Plectranthus_verticillatus_in_a_ceramic_pot.jpg", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "A ceramic pot. Stand-in for the ceramic microgreens kit and for 8 in pots.", True),
    "windowbox": ("A planted window box", "litchick_1", "https://commons.wikimedia.org/wiki/File:2009_windowbox_2463967211.jpg", "CC BY-SA 2.0", "https://creativecommons.org/licenses/by-sa/2.0/", "A window box. Stand-in for a balcony rail planter.", True),
    "grow-bag": ("A plant growing in a fabric grow bag", "Clintacc", "https://commons.wikimedia.org/wiki/File:Brinjal_plant_with_fruits_in_grow_bag.jpg", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "A fabric grow bag with a plant. Stand-in for empty grow bags.", True),
}

ITEM_IMAGE = {
    BF_1020_HOLES: "pepper-trays",
    BF_1020_SOLID: "farm-trays",
    BF_1010_HOLES: "pea-shoots",
    TRAY_1010_SOLID_10: "sunflower",
    TRAY_1010_SOLID_5: "sunflower",
    ESPOMA_SEED: "coir-pile",
    HEMP: "coir-fiber",
    SCALE: "scale",
    SCISSORS: "scissors",
    MISTER: "spray",
    KIT_SPONGE: "lufa",
    COCO: "coco-brick",
    SANSI_CLIP: "grow-light",
    KIT_BUDDY: "sunflower",
    KIT_GREEN: "mixed",
    KIT_SUN: "basil",
    KIT_MIZUNA: "ceramic",
    SANSI_BULB: "led-bulb",
    HEAT_SILL: "farm-trays",
    KIT_CELLS: "pepper-trays",
    SUNPACK: "farm-trays",
    TRAY_DEEP: "pea-shoots",
    DOMES: "basil",
    MIRACLE: "promix",
    HEAT_1020: "radish",
    POTS_8: "ceramic",
    POTS_8_10: "basil-mosaic",
    RAIL: "windowbox",
    ESPOMA_POT: "promix",
    LETTUCE: "lettuce-pot",
    BAGS: "grow-bag",
    RADISH: "radish",
    RADISH_SMALL: "mixed",
    PEA: "pea-sack",
    PEA_HALF: "lufa",
    BROCCOLI: "broccoli",
    MIXED_SEED: "mixed",
    AIR: "lettuce-pot",
}

# Same photo cannot appear twice on /gear/, which already uses the mixed-greens file.
PAGE_IMAGE = {
    "gear": {MIXED_SEED: "lettuce-leaves"},
    "windowsill": {RADISH_SMALL: "broccoli"},
    "density": {BF_1010_HOLES: "lufa"},
    "calculator": {BF_1010_HOLES: "sunflower"},
    "cost": {KIT_GREEN: "broccoli"},
    "bottom": {SUNPACK: "basil"},
}

BUTTON = {"amazon": "View on Amazon", "trueleaf": "See at True Leaf", "letpot": "See at LetPot"}


def image_for(key: str, item: str) -> str:
    slug = PAGE_IMAGE.get(key, {}).get(item, ITEM_IMAGE[item])
    if slug not in SUPPLY_IMAGES:
        raise SystemExit(f"No supply photo for {item}")
    return slug


def render_shop(key: str) -> str:
    page = SHOP_PAGES[key]
    rows = page["rows"]
    if len(rows) < 3:
        raise SystemExit(f"{key} shop table needs at least 3 rows")
    has_amazon = any(row["kind"] == "amazon" for row in rows)
    disclosure = "We earn a commission if you buy through these links, at no extra cost to you."
    if has_amazon:
        disclosure = f"{disclosure} {AMAZON_DISCLOSURE}"
    seen = []
    cards = []
    for row in rows:
        slug = image_for(key, row["item"])
        photo_dir = Path(__file__).resolve().parents[1] / "assets" / "products"
        if not (photo_dir / f"supply-{slug}-600.webp").is_file() or not (photo_dir / f"supply-{slug}-300.webp").is_file():
            raise SystemExit(f"Missing supply photo files for {slug}")
        if slug in seen:
            raise SystemExit(f"{key} repeats supply photo {slug}")
        seen.append(slug)
        alt, author, _source, _license, _license_url, _note, _stand_in = SUPPLY_IMAGES[slug]
        src = f"/assets/products/supply-{slug}-600.webp"
        srcset = f"/assets/products/supply-{slug}-300.webp 300w, /assets/products/supply-{slug}-600.webp 600w"
        cards.append(
            '<li class="pick">'
            '<figure class="pick-media">'
            f'<img src="{src}" srcset="{srcset}" '
            'sizes="(min-width: 1024px) 240px, (min-width: 720px) 30vw, 46vw" '
            'width="600" height="600" loading="lazy" decoding="async" '
            f'alt="{esc(alt)}">'
            f'<figcaption class="pick-credit">Example photo · Credit: '
            f'<a href="/photo-credits/#supply-{slug}">{esc(author)}</a></figcaption>'
            "</figure>"
            f'<h3 class="pick-name">{esc(row["item"])}</h3>'
            f'<p class="pick-why">{esc(row["note"])}</p>'
            f'<a class="pick-cta" href="{esc(row_url(row))}" rel="sponsored nofollow noopener" target="_blank">'
            f'{BUTTON[row["kind"]]}<span class="sr-only"> (opens in a new tab)</span></a>'
            "</li>"
        )
    return (
        '<section class="picks" id="matching-supplies">'
        f"<h2>{esc(page['heading'])}</h2>"
        f'<p class="affiliate-disclosure">{esc(disclosure)}</p>'
        f'<p class="picks-lead">{esc(page["lead"])}</p>'
        '<ul class="pick-grid" role="list">'
        + "".join(cards)
        + "</ul></section>"
    )


def supply_credit_html() -> str:
    blocks = []
    for slug, (alt, author, source, license_name, license_url, note, _stand_in) in SUPPLY_IMAGES.items():
        src = f"/assets/products/supply-{slug}-600.webp"
        blocks.append(
            f'<section class="photo-credit-entry" id="supply-{slug}">'
            f'<img src="{src}" width="600" height="600" alt="{esc(alt)}" loading="lazy" decoding="async">'
            "<div>"
            f"<h2>{esc(alt)}</h2>"
            f'<p><strong>Photographer:</strong> <a href="{esc(source)}">{esc(author)}</a>.</p>'
            f'<p><strong>Original:</strong> <a href="{esc(source)}">Wikimedia Commons</a>.</p>'
            f'<p><strong>License:</strong> <a href="{esc(license_url)}">{esc(license_name)}</a>.</p>'
            f"<p><strong>Image use:</strong> {esc(note)} Square crop for a product card. Example photo, not the listed product.</p>"
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
