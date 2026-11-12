#!/usr/bin/env python3
"""Regenerate typographic product tiles from src/catalog/products.json."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import catalog

PAPER = (250, 249, 245)
SAGE = (233, 238, 223)
FOREST = (35, 77, 57)
MUTED = (83, 96, 86)
INTER = "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf"
NEWS = "/usr/share/fonts/truetype/sand-box/google/Newsreader/Newsreader-VariableFont_opsz,wght.ttf"
DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path: str, size: int):
    try:
        return ImageFont.truetype(path, size=size)
    except Exception:
        return ImageFont.truetype(DEJAVU, size=size)


def wrap_text(draw, text, font_obj, max_width):
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if draw.textlength(trial, font=font_obj) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines or [text]


def make_tile(path: Path, name: str, brand: str | None, size_px: int) -> None:
    im = Image.new("RGB", (size_px, size_px), PAPER)
    draw = ImageDraw.Draw(im)
    margin = int(size_px * 0.08)
    draw.rounded_rectangle(
        [margin, margin, size_px - margin, size_px - margin],
        radius=int(size_px * 0.04),
        outline=FOREST,
        width=max(2, size_px // 200),
        fill=SAGE,
    )
    name_size = int(size_px * 0.09)
    brand_size = int(size_px * 0.045)
    name_font = font(NEWS, name_size)
    brand_font = font(INTER, brand_size)
    max_w = size_px - 2 * margin - int(size_px * 0.08)
    lines = wrap_text(draw, name, name_font, max_w)
    while len(lines) > 4 and name_size > 16:
        name_size -= 2
        name_font = font(NEWS, name_size)
        lines = wrap_text(draw, name, name_font, max_w)
    line_h = int(name_size * 1.2)
    brand_h = int(brand_size * 1.4) if brand else 0
    total_h = len(lines) * line_h + brand_h
    y = (size_px - total_h) // 2
    if brand:
        width = draw.textlength(brand, font=brand_font)
        draw.text(((size_px - width) / 2, y), brand, font=brand_font, fill=MUTED)
        y += brand_h
    for line in lines:
        width = draw.textlength(line, font=name_font)
        draw.text(((size_px - width) / 2, y), line, font=name_font, fill=FOREST)
        y += line_h
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=86, method=6)


def main() -> int:
    written = 0
    for product in catalog.products().values():
        image = product["image"]
        if image["treatment"] != "neutral":
            continue
        for size in (300, 600):
            dest = catalog.PHOTO_DIR / f"{image['slug']}-{size}.webp"
            make_tile(dest, product["name"], product.get("brand"), size)
            written += 1
    print(f"wrote {written} typographic tiles")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
