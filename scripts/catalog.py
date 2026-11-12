"""Shared product catalog: names, URLs, variants, sizes, and image treatments."""

from __future__ import annotations

import json
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
    if slug.startswith("letpot-") or slug.startswith("plain-") or slug == "alfalfa-jar":
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
