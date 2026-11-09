#!/usr/bin/env python3
"""Build 1200x630 share images from self-hosted photos or a plain card."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "og"
PHOTOS = ROOT / "assets" / "photos"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_SM = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# filename, photo or None, title
PAGES = [
    ("home", "pea-shoots-counter.jpg", "Grow fresh greens without a yard"),
    ("guides", "trays-broccoli-radish.jpg", "Growing guides"),
    ("calculator", None, "Microgreens seed calculator"),
    ("apartment", "trays-broccoli-radish.jpg", "Your first microgreens tray"),
    ("cost", "sunflower-small-tray.jpg", "Kit or DIY: compare the costs"),
    ("density", None, "Seed density by crop and tray"),
    ("pea-radish", "pea-shoots-counter.jpg", "Pea shoots or radish microgreens"),
    ("windowsill", "basil-by-window.jpg", "Windowsill microgreens"),
    ("seed-starting", "basil-by-window.jpg", "Start seeds in an apartment"),
    ("watering", None, "Bottom watering, step by step"),
    ("balcony", "lettuce-in-pot.jpg", "A balcony salad in containers"),
    ("about", None, "About Small Space Greens"),
    ("contact", None, "Contact Ryan Moalemi"),
    ("privacy", None, "Privacy policy"),
    ("affiliate", None, "Affiliate disclosure"),
    ("editorial", None, "How these guides are made"),
    ("gear", "sunflower-small-tray.jpg", "Gear and comparisons"),
    ("checklist", "trays-broccoli-radish.jpg", "First-tray checklist"),
    ("not-found", None, "Page not found"),
]


def cover(src: Path, w: int, h: int) -> Image.Image:
    im = Image.open(src).convert("RGB")
    scale = max(w / im.width, h / im.height)
    resized = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - w) // 2
    top = (resized.height - h) // 2
    return resized.crop((left, top, left + w, top + h))


def card(photo: str | None, title: str) -> Image.Image:
    w, h = 1200, 630
    if photo:
        base = cover(PHOTOS / photo, w, h)
        shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(shade)
        d.rectangle((0, 390, w, h), fill=(23, 56, 42, 220))
        base = Image.alpha_composite(base.convert("RGBA"), shade).convert("RGB")
    else:
        base = Image.new("RGB", (w, h), (23, 56, 42))
        d = ImageDraw.Draw(base)
        d.rectangle((0, 0, 18, h), fill=(196, 165, 116))
    draw = ImageDraw.Draw(base)
    font = ImageFont.truetype(FONT, 54 if photo else 64)
    small = ImageFont.truetype(FONT_SM, 28)
    draw.text((48, 48 if not photo else 430), "Small Space Greens", font=small, fill=(243, 240, 232))
    # wrap title
    words = title.split()
    lines = []
    current = ""
    for word in words:
        trial = word if not current else current + " " + word
        if draw.textlength(trial, font=font) < 1080:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    y = 100 if not photo else 480
    for line in lines[:3]:
        draw.text((48, y), line, font=font, fill=(255, 253, 248))
        y += 68
    return base


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, photo, title in PAGES:
        image = card(photo, title)
        path = OUT / f"{name}.jpg"
        image.save(path, "JPEG", quality=82, optimize=True)
        print(path.name, image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
