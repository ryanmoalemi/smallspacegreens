"""Shared product catalog: names, URLs, variants, sizes, and image treatments."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "src" / "catalog" / "products.json"
PHOTO_DIR = ROOT / "assets" / "products"


def load_catalog() -> dict:
    if not CATALOG_PATH.is_file():
        raise SystemExit(f"Missing product catalog: {CATALOG_PATH}")
    return json.loads(CATALOG_PATH.read_text())


def products() -> dict[str, dict]:
    return load_catalog()["products"]


def by_id(product_id: str) -> dict:
    catalog = products()
    if product_id not in catalog:
        raise SystemExit(f"Unknown catalog product: {product_id}")
    return catalog[product_id]


def by_asin(asin: str) -> dict | None:
    matches = [p for p in products().values() if p.get("asin") == asin]
    if len(matches) > 1:
        raise SystemExit(f"ASIN {asin} maps to more than one catalog product")
    return matches[0] if matches else None


def by_name(name: str) -> dict | None:
    matches = [p for p in products().values() if p["name"] == name]
    if not matches:
        return None
    if len(matches) == 1:
        return matches[0]
    # Prefer shop-row products (amazon / trueleaf seed rows) over collection aliases.
    preferred = [p for p in matches if p["id"] not in {"tl-kits-home", "tl-kits", "tl-seed-collection"}]
    if len(preferred) == 1:
        return preferred[0]
    raise SystemExit(f"Product name {name!r} is not unique in the catalog")


def photo_stem(slug: str) -> str:
    if slug.startswith(("letpot-", "plain-", "hm-", "pa-")) or slug == "alfalfa-jar":
        return slug
    return f"supply-{slug}"


def photo_paths(slug: str) -> tuple[Path, Path]:
    stem = photo_stem(slug)
    return PHOTO_DIR / f"{stem}-300.webp", PHOTO_DIR / f"{stem}-600.webp"


def require_photo_files(slug: str) -> str:
    small, large = photo_paths(slug)
    if not small.is_file() or not large.is_file():
        raise SystemExit(f"Missing product image files for {slug}")
    return photo_stem(slug)


def image_srcset(slug: str) -> tuple[str, str]:
    stem = require_photo_files(slug)
    src = f"/assets/products/{stem}-600.webp"
    srcset = f"/assets/products/{stem}-300.webp 300w, /assets/products/{stem}-600.webp 600w"
    return src, srcset


AMAZON_IMAGE_RE = re.compile(
    r"^https://m\.media-amazon\.com/images/I/[A-Za-z0-9+\-]+(?:\._[A-Za-z0-9,_+\-]+)?\.(?:jpg|jpeg|png|webp)$"
)
_IMAGE_ID_RE = re.compile(
    r"^https://m\.media-amazon\.com/images/I/([A-Za-z0-9+\-]+)(?:\._[A-Za-z0-9,_+\-]+)?(\.(?:jpg|jpeg|png|webp))$"
)


def is_amazon_photo_url(url: str) -> bool:
    return bool(url and AMAZON_IMAGE_RE.match(url))


def amazon_srcset(url: str) -> tuple[str, str]:
    """Return a large src and a 300/600/1500 srcset from a listing CDN URL. Never download the file."""
    if not url or not AMAZON_IMAGE_RE.match(url):
        raise SystemExit(f"Amazon image URL is not a listing CDN photo: {url}")
    match = _IMAGE_ID_RE.match(url)
    if not match:
        raise SystemExit(f"Cannot parse Amazon image URL: {url}")
    image_id, ext = match.group(1), match.group(2)
    def sized(width: int) -> str:
        return f"https://m.media-amazon.com/images/I/{image_id}._AC_SL{width}_{ext}"
    src = sized(1500)
    srcset = f"{sized(300)} 300w, {sized(600)} 600w, {src} 1500w"
    return src, srcset


def validate_amazon_photos() -> None:
    """Future Amazon picks must ship with a listing photo unless a missing image is recorded."""
    for product in products().values():
        if product.get("merchant") != "Amazon":
            continue
        image = product.get("image") or {}
        treatment = image.get("treatment")
        if treatment in {"crop", "licensed-exact", "official"}:
            continue
        embed = image.get("image_embed")
        if treatment == "amazon":
            if not is_amazon_photo_url(embed or ""):
                raise SystemExit(f"{product['id']} is an Amazon pick without a valid listing photo URL")
            continue
        if treatment == "neutral":
            if embed:
                raise SystemExit(f"{product['id']} has a typographic card but also an Amazon photo URL")
            continue
        raise SystemExit(f"{product['id']} is an Amazon pick with unsupported image treatment {treatment!r}")
