#!/usr/bin/env python3
"""Build the Small Space Greens static site into the repository root."""

from __future__ import annotations

import json
import hashlib
import re
import subprocess
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

import shop_placements

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
INDEXNOW = "b4f866681f35e865697f0a735d534c00"
SITE = "https://smallspacegreens.com"
DATE = "2026-11-10"
DATE_LABEL = "November 10, 2026"
ORG_ID = f"{SITE}/#organization"
PERSON_ID = f"{SITE}/#ryan-moalemi"
SITE_ID = f"{SITE}/#website"

NAV = [
    ("Start here", f"{SITE}/guides/microgreens-in-a-small-apartment/", "/guides/microgreens-in-a-small-apartment/"),
    ("Growing guides", f"{SITE}/guides/", "/guides/"),
    ("Seed calculator", f"{SITE}/tools/microgreens-seed-calculator/", "/tools/microgreens-seed-calculator/"),
    ("About", f"{SITE}/about/", "/about/"),
    ("Find your setup ↗", f"{SITE}/gear/", "/gear/"),
]

BRAND_MARK = '<svg viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M20 43V15" stroke="currentColor" stroke-width="1.8"/><path d="M20 29C7 30 3 21 4 13c11 0 16 7 16 16Z" fill="currentColor"/><path d="M20 20C31 21 36 13 35 5c-11 0-15 7-15 15Z" fill="currentColor"/><path d="M7 43h26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
BRAND = BRAND_MARK + '<span class="brand-wordmark">small space<small>GREENS</small></span>'
ARROW_UP = '<svg class="arrow-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M5 4h11v11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_RIGHT = '<svg class="arrow-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def asset_version(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:12]

GUIDES = [
    {
        "slug": "microgreens-in-a-small-apartment",
        "title": "How to Grow Microgreens in an Apartment: Your First Tray",
        "description": "Start one edible microgreen tray in an apartment: crop, footprint, supplies, light, and a source-backed harvest window. Steps cite extension sources.",
        "h1": "How to grow microgreens in an apartment: your first tray",
        "dek": "Pick an edible crop, size the tray, and follow one published method. A lamp is optional until the window falls short.",
        "og": "apartment",
        "nav": "/guides/microgreens-in-a-small-apartment/",
    },
    {
        "slug": "gifts-for-indoor-gardeners",
        "title": "Gardening Gifts for Plant Lovers in Small Spaces",
        "description": "Gardening gifts for plant lovers and gardeners in a small space. Compare LetPot gardens, True Leaf seed and kits, and one windowsill kit. No prices here.",
        "h1": "Gardening gifts for plant lovers in small spaces",
        "dek": "Match a countertop garden, a bag of microgreen seed, or a small windowsill kit to the person and the space.",
        "og": "guides",
        "updated_label": "November 10, 2026",
    },
    {
        "slug": "microgreen-seeds-for-beginners",
        "title": "Microgreen Seeds for Beginners: Which to Buy First",
        "description": "Microgreen seeds for a first tray: radish, pea, broccoli, and sunflower from True Leaf Market, plus how a sprouting seed collection differs.",
        "h1": "Microgreen seeds for beginners: which to buy first",
        "dek": "Start with one named crop, match the bag to your tray, and do not confuse sprouting seed with microgreens.",
        "og": "density",
        "updated_label": "November 10, 2026",
    },
    {
        "slug": "microgreens-kit-vs-diy-cost",
        "title": "Microgreens Kit vs DIY: Compare Setup and Repeat Costs",
        "description": "Compare microgreens kits and DIY setups by what is included, space needed, upfront spending, and repeat costs. Choose the approach that fits your plans.",
        "h1": "Microgreens kit vs DIY: compare setup and repeat costs",
        "dek": "Compare the complete setup, refill costs, and daily work. Enter your prices to compare what you pay today and what the next planting needs.",
        "og": "cost",
    },
    {
        "slug": "microgreens-seed-density-per-tray",
        "title": "Microgreens Seed Density by Crop and Tray Size",
        "description": "Look up published microgreen seed rates by crop, see which figures are crop-specific, and scale them to your tray. The calculator uses the same rates.",
        "h1": "Microgreens seed density by crop and tray size",
        "dek": "Start with the crop and the tray. The calculator applies a published rate only when that rate is crop-specific.",
        "og": "density",
    },
    {
        "slug": "pea-vs-radish-microgreens",
        "title": "Pea Shoots vs Radish Microgreens: Which Should You Grow?",
        "description": "Choose between pea shoots and radish microgreens using published seed weight, soak time, harvest window, and flavor notes. Seed weights come from Utah State.",
        "h1": "Pea shoots vs radish microgreens: which should you grow?",
        "dek": "Radish is spicy and lighter on the scale. Pea is milder, soaked, and a much heavier sowing.",
        "og": "pea-radish",
    },
    {
        "slug": "windowsill-microgreens",
        "title": "Can You Grow Microgreens on a Windowsill? Light and Space",
        "description": "Decide whether your windowsill can grow a tray of microgreens, and when the published guidance says to add a lamp. Measure the sill and watch the stems.",
        "h1": "Can you grow microgreens on a windowsill?",
        "dek": "Measure the sill, watch the stems, and add light only if the plants lean or stay pale.",
        "og": "windowsill",
    },
    {
        "slug": "apartment-seed-starting",
        "title": "Starting Vegetable Seeds in an Apartment: Light and Timing",
        "description": "Raise vegetable transplants in an apartment for a balcony or garden, with light, timing, and crops you should not eat as microgreens. Check the cited sources.",
        "h1": "Starting vegetable seeds in an apartment",
        "dek": "These plants are transplants. They need more light and more weeks than a tray of microgreens.",
        "og": "seed-starting",
    },
    {
        "slug": "bottom-watering-trays",
        "title": "How to Bottom Water Microgreens and Seed Trays",
        "description": "Bottom water a microgreen or seed tray: which tray has holes, where the water goes, and when to pour the extra out. Then empty the solid tray.",
        "h1": "How to bottom water microgreens and seed trays",
        "dek": "Give roots water from below, let the mix absorb it, then pour out the extra.",
        "og": "watering",
    },
    {
        "slug": "balcony-salad-garden",
        "title": "Plan a Balcony Salad Garden: Containers, Light, and Layouts",
        "description": "Plan a balcony salad with container sizes, sun hours, drainage, and layouts that match the light you actually have. Match crops to the sun you get.",
        "h1": "Plan a balcony salad garden",
        "dek": "Choose salad crops for the sun you have, then match the containers to your space.",
        "og": "balcony",
    },
]


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.skip += 1
        if tag in {"p", "li", "h1", "h2", "h3", "br", "tr"}:
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag in {"script", "style"} and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def strip_tags(fragment: str) -> str:
    parser = TextExtractor()
    parser.feed(fragment)
    text = " ".join("".join(parser.parts).split())
    return text


def extract_faqs(fragment: str) -> list[dict[str, str]]:
    faqs = []
    for block in re.findall(r"<details>(.*?)</details>", fragment, flags=re.S):
        question = re.search(r"<summary>(.*?)</summary>", block, flags=re.S)
        answers = re.findall(r"<p>(.*?)</p>", block, flags=re.S)
        if not question or not answers:
            raise SystemExit("FAQ details block is missing a summary or paragraph")
        faqs.append(
            {
                "q": strip_tags(question.group(1)),
                "a": strip_tags(" ".join(answers)),
            }
        )
    return faqs


def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,])\s*", r"\1", css)
    return css.strip()


def esc(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


LIST_PHOTOS = json.loads((SRC / "list-photos.json").read_text())
GUIDE_PHOTOS = {
    "microgreens-in-a-small-apartment": "fenugreek",
    "gifts-for-indoor-gardeners": "lettuce",
    "microgreen-seeds-for-beginners": "scale",
    "microgreens-kit-vs-diy-cost": "sunflower",
    "microgreens-seed-density-per-tray": "seeds",
    "pea-vs-radish-microgreens": "peas",
    "windowsill-microgreens": "basil-window",
    "apartment-seed-starting": "sowing",
    "bottom-watering-trays": "tray",
    "balcony-salad-garden": "balcony",
}


def list_photo(key: str) -> str:
    photo = LIST_PHOTOS[key]
    if photo.get("src"):
        src = photo["src"]
        width, height = photo["width"], photo["height"]
        wide = ' list-photo-wide' if width >= height else ''
    else:
        src = f'/assets/photos/thumbs/{photo["thumbnail"]}'
        width, height = 320, 320
        wide = ''
    if photo.get("illustrative"):
        caption = (
            f'<figcaption class="photo-credit"><a href="/photo-credits/#{esc(photo["credit_id"])}">'
            'Illustrative photo (AI-generated)</a></figcaption>'
        )
    else:
        caption = (
            f'<figcaption class="photo-credit">Credit: <a href="/photo-credits/#{esc(photo["credit_id"])}">'
            f'{esc(photo["author"])}</a></figcaption>'
        )
    return (
        f'<figure class="list-photo{wide}" data-photo-key="{esc(key)}">'
        f'<img src="{esc(src)}" width="{width}" height="{height}" alt="{esc(photo["alt"])}" '
        'loading="lazy" decoding="async">'
        f'{caption}</figure>'
    )


def add_class(attrs: str, name: str) -> str:
    if re.search(r'\bclass="', attrs):
        return re.sub(r'\bclass="([^"]*)"', lambda m: f'class="{m.group(1)} {name}"', attrs, count=1)
    return attrs + f' class="{name}"'


def render_content_photos(html: str) -> str:
    """Give annotated editorial rows real photos without changing their controls."""
    html = re.sub(r'<!--PHOTO:([a-z-]+)-->', lambda m: list_photo(m.group(1)), html)

    def choice_photo(match: re.Match) -> str:
        photo = LIST_PHOTOS[match.group(1)]
        return f'<img class="choice-photo" src="/assets/photos/thumbs/{esc(photo["thumbnail"])}" width="320" height="320" alt="" loading="lazy" decoding="async">'

    def choice_credit(match: re.Match) -> str:
        photo = LIST_PHOTOS[match.group(1)]
        return f'<p class="photo-credit">Credit: <a href="/photo-credits/#{esc(photo["credit_id"])}">{esc(photo["author"])}</a></p>'

    html = re.sub(r'<!--CHOICE_PHOTO:([a-z-]+)-->', choice_photo, html)
    html = re.sub(r'<!--PHOTO_CREDIT:([a-z-]+)-->', choice_credit, html)

    def item(match: re.Match) -> str:
        attrs, key, content = match.groups()
        attrs = re.sub(r'\sdata-photo="[^"]+"', '', attrs)
        attrs = add_class(attrs, 'photo-list-item')
        attrs += ' role="listitem"'
        return f'<li{attrs}>{list_photo(key)}<div class="list-item-copy">{content}</div></li>'

    html = re.sub(r'<li([^>]*\bdata-photo="([^"]+)"[^>]*)>(.*?)</li>', item, html, flags=re.S)

    def photo_list(match: re.Match) -> str:
        tag, attrs, content = match.groups()
        if 'photo-list-item' in content:
            attrs = add_class(attrs, 'photo-list')
            if 'role=' not in attrs:
                attrs += ' role="list"'
            if tag == 'ol':
                number = 0

                def numbered(row: re.Match) -> str:
                    nonlocal number
                    number += 1
                    return row.group(0) + f'<span class="photo-step-number" aria-hidden="true">{number}</span>'

                content = re.sub(r'<li\b[^>]*>', numbered, content)
        return f'<{tag}{attrs}>{content}</{tag}>'

    html = re.sub(r'<(ul|ol)([^>]*)>(.*?)</\1>', photo_list, html, flags=re.S)

    def table_row(match: re.Match) -> str:
        attrs, key, content = match.groups()
        attrs = re.sub(r'\sdata-photo="[^"]+"', '', attrs)
        content = re.sub(
            r'<(td|th)([^>]*)>(.*?)</\1>',
            lambda cell: f'<{cell.group(1)}{add_class(cell.group(2), "photo-cell")}>'
            f'<div class="photo-cell-content">{list_photo(key)}<span>{cell.group(3)}</span></div></{cell.group(1)}>',
            content, count=1, flags=re.S,
        )
        return f'<tr{attrs}>{content}</tr>'

    return re.sub(r'<tr([^>]*\bdata-photo="([^"]+)"[^>]*)>(.*?)</tr>', table_row, html, flags=re.S)


class PhotoListAudit(HTMLParser):
    """Keep new editorial lists from silently reverting to text-only rows."""
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self) -> None:
        super().__init__()
        self.stack: list[dict] = []
        self.items: list[dict] = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        context = [node["tag"] for node in self.stack]
        is_source = any("sources" in node["attrs"].get("class", "").split() for node in self.stack)
        is_affiliate = any("affiliate-box" in node["attrs"].get("class", "").split() for node in self.stack)
        is_pick = any("pick-grid" in node["attrs"].get("class", "").split() for node in self.stack)
        # Seed charts are data bars (crop, grams, bar), not editorial lists.
        is_chart = any("seed-chart" in node["attrs"].get("class", "").split() for node in self.stack)
        node = {"tag": tag, "attrs": attrs}
        if tag == "li" and "main" in context and "nav" not in context and not is_source and not is_affiliate and not is_pick and not is_chart:
            node.update(photo=False, text=[])
            self.items.append(node)
        if tag == "img" and attrs.get("src", "").startswith("/assets/photos/"):
            for parent in self.stack:
                if "photo" in parent:
                    parent["photo"] = True
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        for node in self.stack:
            if "photo" in node:
                node["text"].append(data)


def content_image_key(src: str) -> str:
    """Same file name means the same photo, including a full image and its thumbnail."""
    path = src.split("?")[0].split("#")[0]
    name = Path(path).name.lower()
    if name in {"favicon.svg"}:
        return ""
    return name


def image_context(html: str, start: int) -> tuple[bool, bool]:
    """Whether an image sits in a small list photo, and whether that list is a numbered step."""
    figure_start = html.rfind("<figure", 0, start)
    in_list_photo = False
    if figure_start != -1 and "</figure>" not in html[figure_start:start]:
        if "list-photo" in html[figure_start:figure_start + 180]:
            in_list_photo = True
    ol_start = html.rfind("<ol", 0, start)
    in_step = False
    if ol_start != -1 and "</ol>" not in html[ol_start:start]:
        if re.search(r'class="[^"]*\b(?:steps|grow-steps)\b', html[ol_start:ol_start + 240]):
            in_step = True
    return in_list_photo, in_step


def removal_span(html: str, start: int, end: int) -> tuple[int, int]:
    figure_start = html.rfind("<figure", 0, start)
    figure_end = html.find("</figure>", end)
    if figure_start != -1 and figure_end != -1:
        between = html[figure_start:start]
        window = html[figure_start:figure_end + len("</figure>")]
        if "</figure>" not in between and "list-photo" in window:
            return figure_start, figure_end + len("</figure>")
    return start, end


def dedupe_content_images(html: str) -> str:
    """One photo file per page. A numbered step keeps the photo over an earlier list thumbnail."""
    found = []
    for match in re.finditer(r"<img\b[^>]*>", html):
        src_match = re.search(r'\bsrc="([^"]+)"', match.group(0))
        if not src_match:
            continue
        key = content_image_key(src_match.group(1))
        if not key:
            continue
        in_list_photo, in_step = image_context(html, match.start())
        found.append((key, match.start(), match.end(), in_list_photo, in_step))
    keeper: dict[str, int] = {}
    for index, (key, _start, _end, in_list_photo, in_step) in enumerate(found):
        if key not in keeper:
            keeper[key] = index
            continue
        kept = found[keeper[key]]
        kept_is_earlier_list = kept[3] and not kept[4]
        if in_step and kept_is_earlier_list:
            keeper[key] = index
    removals = []
    for index, (_key, start, end, _in_list_photo, _in_step) in enumerate(found):
        if keeper[_key] == index:
            continue
        removals.append(removal_span(html, start, end))
    for start, end in reversed(removals):
        html = html[:start] + html[end:]
    return html


def _hex_channels(hex_color: str) -> str:
    value = hex_color.lstrip("#")
    if len(value) == 3:
        value = "".join(channel * 2 for channel in value)
    return value


def _luminance(hex_color: str) -> float:
    value = _hex_channels(hex_color)
    red, green, blue = int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)

    def channel(component: int) -> float:
        scaled = component / 255
        if scaled <= 0.04045:
            return scaled / 12.92
        return ((scaled + 0.055) / 1.055) ** 2.4

    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)


def _contrast_ratio(foreground: str, background: str) -> float:
    lighter = max(_luminance(foreground), _luminance(background))
    darker = min(_luminance(foreground), _luminance(background))
    return (lighter + 0.05) / (darker + 0.05)


def _css_blocks(segment: str) -> dict[str, str]:
    blocks: dict[str, str] = {}
    cursor = 0
    while True:
        opening = segment.find("{", cursor)
        if opening < 0:
            return blocks
        closing = segment.find("}", opening)
        if closing < 0:
            raise SystemExit("contrast check found an unclosed CSS rule")
        for selector in segment[cursor:opening].split(","):
            selector = selector.strip()
            if selector and not selector.startswith("@"):
                blocks[selector] = segment[opening + 1 : closing]
        cursor = closing + 1


def _css_color(body: str, prop: str) -> str:
    match = re.search(rf"(?:^|;){prop}:([^;]+)", body)
    colors = re.findall(r"#[0-9a-fA-F]{6}", match.group(1) if match else "")
    if not colors:
        raise SystemExit(f"contrast check missing {prop} in '{body}'")
    return colors[-1].lower()


CHROME_SELECTOR = re.compile(r"\.(?:site-header|header-bar|brand|brand-wordmark|nav|nav-toggle|crumbs|site-footer|footer-[a-z-]+|copyright|skip)\b")


def check_chrome_text_size(css: str) -> None:
    """Fail the build when header, nav, breadcrumb, or footer text is set below 12px at any width."""
    failures = []
    for selector, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        selector = selector.strip()
        if selector.startswith("@") or not CHROME_SELECTOR.search(selector):
            continue
        for size in re.findall(r"(?:^|;)font-size:([\d.]+)px", body):
            if float(size) < 12:
                failures.append(f"{selector} font-size:{size}px")
    if failures:
        raise SystemExit("header, breadcrumb, or footer text under 12px:\n" + "\n".join(failures))


def check_card_contrast(css: str) -> None:
    """Fail the build when a product-card text pair drops below WCAG AA."""
    failures: list[str] = []

    def require(label: str, foreground: str, background: str, minimum: float = 4.5) -> None:
        ratio = _contrast_ratio(foreground, background)
        if ratio < minimum:
            failures.append(f"{label}: {foreground} on {background} is {ratio:.2f}, need {minimum:.1f}")

    root = re.search(r":root\{([^}]*)\}", css)
    if not root:
        raise SystemExit("contrast check missing :root colors")
    variables = dict(re.findall(r"(--[a-z0-9-]+):(#[0-9a-fA-F]{3,6})", root.group(1)))
    card = variables["--card"]
    require("light product name", variables["--ink"], card)
    require("light body and credit", variables["--muted"], card)
    require("light credit link", variables["--green-2"], card)
    require("light credit link hover", variables["--accent"], card)
    require("light badge", variables["--ink"], variables["--sage"])
    require("light stat label", variables["--muted"], variables["--sage"])
    require("light button", "#ffffff", variables["--green"])

    credit = re.search(r"\.pick-credit\{([^}]*)\}", css)
    credit_size = re.search(r"font-size:(\d+)px", credit.group(1) if credit else "")
    if not credit_size or int(credit_size.group(1)) < 12:
        failures.append("photo credit is smaller than 12px")

    seed_none = re.search(r"\.seed-grams-none\{([^}]*)\}", css)
    if not seed_none:
        raise SystemExit("contrast check missing seed chart styles")
    require("seed chart no-rate label", _css_color(seed_none.group(1), "color"), card)
    for selector in ("seed-chart-sub", "seed-detail", "seed-row"):
        size = re.search(rf"\.{selector}[^{{]*\{{[^}}]*font-size:(\d+)px", css)
        if not size or int(size.group(1)) < 12:
            failures.append(f"seed chart .{selector} text is smaller than 12px")

    dark_at = css.find("@media(prefers-color-scheme:dark){")
    if dark_at < 0:
        raise SystemExit("contrast check missing dark-mode card styles")
    depth = 0
    dark_end = dark_at
    for index, character in enumerate(css[dark_at:], dark_at):
        if character == "{":
            depth += 1
        elif character == "}":
            depth -= 1
            if depth == 0:
                dark_end = index
                break
    dark = _css_blocks(css[css.find("{", dark_at) + 1 : dark_end])
    card_bg = _css_color(dark[".pick"], "background")
    require("dark product name", _css_color(dark[".pick h3.pick-name"], "color"), card_bg)
    require("dark brand, body, and credit", _css_color(dark[".pick-brand"], "color"), card_bg)
    require("dark credit link", _css_color(dark[".pick-credit a"], "color"), card_bg)
    require("dark credit link hover", _css_color(dark[".pick-credit a:hover"], "color"), card_bg)
    require("dark badge", _css_color(dark[".pick-badge"], "color"), _css_color(dark[".pick-badge"], "background"))
    require("dark button", _css_color(dark[".pick-cta"], "color"), _css_color(dark[".pick-cta"], "background"))
    require("dark button hover", _css_color(dark[".pick-cta:hover"], "color"), _css_color(dark[".pick-cta:hover"], "background"))
    require("dark button focus", _css_color(dark[".pick-cta:focus-visible"], "color"), _css_color(dark[".pick-cta:focus-visible"], "background"))
    require("dark focus ring on card", _css_color(dark[".pick a:focus-visible"], "outline"), card_bg, 3.0)
    # LetPot photo panels keep their cream background in dark mode, so measure their
    # captions against that panel, not against the dark card.
    panel = re.search(r"(?:^|[},])\.pick-media-letpot[,{][^{]*\{([^}]*)\}", css[:dark_at])
    if not panel:
        raise SystemExit("contrast check missing the LetPot photo panel background")
    panel_bg = _css_color(panel.group(1), "background")
    require("light LetPot panel credit", variables["--muted"], panel_bg)
    require("dark LetPot panel credit", _css_color(dark[".pick-media-letpot .pick-credit"], "color"), panel_bg)
    require("dark LetPot panel credit link", _css_color(dark[".pick-media-letpot .pick-credit a"], "color"), panel_bg)
    require(
        "dark button focus ring",
        _css_color(dark[".pick a.pick-cta:focus-visible"], "box-shadow"),
        _css_color(dark[".pick-cta"], "background"),
        3.0,
    )
    if failures:
        raise SystemExit("card contrast check failed:\n" + "\n".join(failures))


def check_letpot_panels(document: str, label: str) -> None:
    """A LetPot photo needs the panel class that scopes its dark-mode caption color."""
    for figure in re.findall(r'<figure class="pick-media[^"]*">.*?</figure>', document, flags=re.S):
        if 'class="letpot-photo"' in figure and "pick-media-letpot" not in figure.split(">", 1)[0]:
            raise SystemExit(f"{label}: LetPot photo panel is missing pick-media-letpot")


def check_duplicate_images(document: str, label: str) -> None:
    seen: dict[str, str] = {}
    duplicates: list[str] = []
    for src in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', document):
        key = content_image_key(src)
        if not key:
            continue
        if key in seen:
            duplicates.append(key)
        else:
            seen[key] = src
    if duplicates:
        names = ", ".join(sorted(set(duplicates)))
        raise SystemExit(f"{label}: duplicate content images: {names}")


def check_photo_lists(document: str, label: str) -> int:
    audit = PhotoListAudit()
    audit.feed(document)
    missing = [" ".join("".join(item["text"]).split())[:100] for item in audit.items if not item["photo"]]
    if missing:
        raise SystemExit(f"{label}: editorial list rows missing photos: {missing}")
    if re.search(r'<!--(?:PHOTO|CHOICE_PHOTO|PHOTO_CREDIT):|\bdata-photo="', document):
        raise SystemExit(f"{label}: unresolved photo markup")
    return len(audit.items)


def crumbs_html(items: list[tuple[str, str]]) -> str:
    lis = []
    for name, url in items:
        path = url.replace(SITE, "") or "/"
        lis.append(f'<li><a href="{esc(path)}">{esc(name)}</a></li>')
    if lis:
        # Last crumb is the current page, not a link.
        name, _url = items[-1]
        lis[-1] = f"<li>{esc(name)}</li>"
    return "<nav class=\"crumbs\" aria-label=\"Breadcrumb\"><ol>" + "".join(lis) + "</ol></nav>"


def crumbs_ld(items: list[tuple[str, str]]) -> dict:
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": index + 1,
                "name": name,
                "item": url,
            }
            for index, (name, url) in enumerate(items)
        ],
    }


def base_graph() -> list[dict]:
    return [
        {
            "@type": "Organization",
            "@id": ORG_ID,
            "name": "Small Space Greens",
            "url": f"{SITE}/",
            "email": "ryan@smallspacegreens.com",
            "logo": {
                "@type": "ImageObject",
                "url": f"{SITE}/favicon.svg",
            },
        },
        {
            "@type": "WebSite",
            "@id": SITE_ID,
            "name": "Small Space Greens",
            "url": f"{SITE}/",
            "publisher": {"@id": ORG_ID},
            "inLanguage": "en",
        },
        {
            "@type": "Person",
            "@id": PERSON_ID,
            "name": "Ryan Moalemi",
            "email": "ryan@smallspacegreens.com",
            "url": f"{SITE}/about/",
            "jobTitle": "Author",
            "affiliation": {"@id": ORG_ID},
        },
    ]


def related_html(slug: str) -> str:
    links = {
        "microgreens-in-a-small-apartment": ["windowsill-microgreens", "microgreens-seed-density-per-tray", "bottom-watering-trays", "microgreens-kit-vs-diy-cost"],
        "gifts-for-indoor-gardeners": ["microgreens-in-a-small-apartment", "microgreens-kit-vs-diy-cost", "microgreens-seed-density-per-tray", "bottom-watering-trays"],
        "microgreen-seeds-for-beginners": ["microgreens-in-a-small-apartment", "microgreens-seed-density-per-tray", "windowsill-microgreens", "bottom-watering-trays"],
        "microgreens-kit-vs-diy-cost": ["microgreens-in-a-small-apartment", "microgreens-seed-density-per-tray", "pea-vs-radish-microgreens"],
        "microgreens-seed-density-per-tray": ["pea-vs-radish-microgreens", "microgreens-in-a-small-apartment", "microgreens-kit-vs-diy-cost"],
        "pea-vs-radish-microgreens": ["microgreens-seed-density-per-tray", "windowsill-microgreens", "microgreens-in-a-small-apartment"],
        "windowsill-microgreens": ["microgreens-in-a-small-apartment", "bottom-watering-trays", "apartment-seed-starting"],
        "apartment-seed-starting": ["bottom-watering-trays", "balcony-salad-garden", "windowsill-microgreens"],
        "bottom-watering-trays": ["microgreens-in-a-small-apartment", "apartment-seed-starting", "windowsill-microgreens"],
        "balcony-salad-garden": ["apartment-seed-starting", "windowsill-microgreens", "microgreens-in-a-small-apartment"],
    }
    by_slug = {guide["slug"]: guide for guide in GUIDES}
    items = []
    for item in links[slug]:
        guide = by_slug[item]
        items.append(
            f'<li data-photo="{GUIDE_PHOTOS[item]}"><a href="/guides/{item}/">{esc(guide["h1"])}</a><p>{esc(guide["dek"])}</p></li>'
        )
    calc = '<li data-photo="scale"><a href="/tools/microgreens-seed-calculator/">Microgreens seed calculator</a><p>Scale a published 10 by 20 inch rate to your tray and estimate seed cost.</p></li>'
    if slug in {"balcony-salad-garden", "apartment-seed-starting"}:
        calc = ""
    return "<h2>Related guides</h2><ul class=\"related-list\">" + calc + "".join(items) + "</ul>"


def git_times(path: Path) -> tuple[str, str]:
    """Author dates from git history: first commit, then latest commit."""
    result = subprocess.run(
        ["git", "log", "--follow", "--format=%aI", "--", str(path)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    dates = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if not dates:
        raise SystemExit(f"No git history for {path}")
    published, modified = dates[-1], dates[0]
    if datetime.fromisoformat(published) > datetime.fromisoformat(modified):
        published, modified = modified, published
    return published, modified


def image_size(path: Path) -> tuple[int, int] | None:
    try:
        from PIL import Image
    except ImportError:
        return None
    with Image.open(path) as im:
        return im.size


def page_share_image(html: str) -> tuple[str, int, int]:
    """Use a photo already on the page. Fall back to the existing default share image."""
    default_rel = "assets/og/home.jpg"
    chosen = None
    for src in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', html):
        if not (src.startswith("/assets/photos/") or src.startswith("/assets/products/")):
            continue
        rel = src.lstrip("/")
        if rel.startswith("assets/photos/thumbs/"):
            full = "assets/photos/" + Path(rel).name
            if (ROOT / full).is_file():
                rel = full
        path = ROOT / rel
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            chosen = rel
            break
    if chosen is None:
        chosen = default_rel
    path = ROOT / chosen
    if not path.is_file():
        raise SystemExit(f"Share image is missing: {path}")
    size = image_size(path)
    if not size:
        raise SystemExit(f"Could not read share image size: {path}")
    return f"{SITE}/{chosen}", size[0], size[1]


LETPOT_URLS = {
    "home": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2F",
    "max": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Flph-max-21-pod-hydroponics-system-with-app-control",
    "se": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Fletpot-senior-12-pod-hydroponic-growing-system-with-app-control",
    "lite": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Fletpot-lph-lite-hydroponics-growing-system-12-pods",
    "air": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Flph-air-indoor-hydroponic-gardening-system",
    "mini": "https://www.awin1.com/cread.php?awinmid=47605&awinaffid=3149328&ued=https%3A%2F%2Fletpot.com%2Fproducts%2Fmini-hydroponics-growing-system",
}

# One sentence each, taken from LetPot's own product pages on November 9, 2026.
LETPOT_MODELS = {
    "mini": (
        "LPH-Mini",
        "LetPot lists the LPH-Mini as a 5-pod indoor garden with app control, a 1.5L water tank, and a growing light you can schedule.",
    ),
    "lite": (
        "LPH-Lite",
        "LetPot describes the LPH-Lite as a 12-pod indoor herb garden with app and Wi-Fi control, a 24W growing LED, a 5.5L water tank, a pump, and an automatic timer.",
    ),
    "se": (
        "LPH-SE",
        "LetPot describes the LPH-SE as a 12-pod system with app and manual touch control, a 21-inch adjustable LED panel, and a 5.5L water tank.",
    ),
    "air": (
        "LPH-Air",
        "LetPot describes the LPH-Air as a 10-pod indoor garden with full-spectrum LED lights, light settings you can control from the app, automatic water circulation, and adjustable height.",
    ),
    "max": (
        "LPH-Max",
        "LetPot describes the LPH-Max as a 21-pod system with app control, automatic water refilling, and automatic watering, nutrients, lighting, and cycling.",
    ),
}

LETPOT_BOXES = {
    "apartment": (
        "A countertop hydroponic garden is a different setup from a tray of mix. These notes come from LetPot's product pages. This site has not grown these units.",
        ["mini", "lite", "max"],
    ),
    "windowsill": (
        "If a tray of mix is a poor fit for the sill, a small countertop garden keeps the water and light in one unit. This note comes from LetPot's product page. This site has not grown this unit.",
        ["mini"],
    ),
    "seed-starting": (
        "These gardens grow plants in the unit. They do not raise transplants for a balcony. These notes come from LetPot's product pages. This site has not grown these units.",
        ["mini", "lite"],
    ),
    "cost": (
        "A hydroponic countertop garden is a different purchase from a microgreen tray kit or a stack of trays. Prices are not listed here. These notes come from LetPot's product pages. This site has not grown these units.",
        ["mini", "se", "max"],
    ),
    "balcony": (
        "If the balcony is too dark, or you would rather grow inside, a countertop garden is a different project from an outdoor pot. These notes come from LetPot's product pages. This site has not grown these units.",
        ["mini", "air"],
    ),
}

# True Leaf Market through Awin, merchant 124042. Collection notes only.
TRUELEAF_URLS = {
    "home": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2F",
    "micro-seed": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fmicro-greens-planting-seed",
    "radish": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fradish-rambo-seeds",
    "pea": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fproducts%2Fdun-pea-seeds",
    "micro-kits": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fmicrogreens-kits-and-supplies",
    "sprout-seed": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fwholesale-sprouting-seed",
    "sprout-kits": "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=https%3A%2F%2Ftrueleafmarket.com%2Fcollections%2Fsprouting-kits-and-supplies",
}

TRUELEAF_LINKS = {
    "micro-seed": (
        "Microgreens seed",
        "True Leaf Market describes this as a collection of organic and conventional microgreens seed, including bulk sizes.",
    ),
    "micro-kits": (
        "Microgreens kits and supplies",
        "True Leaf Market describes this as kits and supplies for growing microgreens at home, with bulk and wholesale options.",
    ),
    "sprout-seed": (
        "Wholesale sprouting seed",
        "True Leaf Market labels this collection wholesale sprouting seed: organic and conventional seed for sprouting.",
    ),
    "sprout-kits": (
        "Sprouting kits and supplies",
        "True Leaf Market describes this as sprouting seeds, sprouters, and other supplies for sprouting at home, with bulk and wholesale options.",
    ),
}

TRUELEAF_BOXES = {
    "apartment": (
        "A first tray needs microgreen seed, and some people start with a kit. Sprouting seed is a different food from the microgreens on this page. These notes describe True Leaf Market collections. This site has not grown seed from them.",
        ["micro-seed", "micro-kits", "sprout-seed"],
    ),
    "windowsill": (
        "A windowsill tray needs microgreen seed. A kit is a separate choice. These notes describe True Leaf Market collections. This site has not grown seed from them.",
        ["micro-seed", "micro-kits"],
    ),
    "seed-starting": (
        "The collection below is microgreens seed. It is not seed for the vegetable transplants on this page. This note describes a True Leaf Market collection. This site has not grown seed from it.",
        ["micro-seed"],
    ),
    "density": (
        "After you have a gram amount, the seed still has to be for an edible microgreen crop. This note describes a True Leaf Market collection. This site has not grown seed from it.",
        ["micro-seed"],
    ),
    "pea": (
        "Radish and pea are different seed. This note describes a True Leaf Market collection. This site has not grown seed from it.",
        ["micro-seed"],
    ),
    "cost": (
        "A kit and a bag of seed are different purchases. Prices are not listed here. These notes describe True Leaf Market collections. This site has not grown seed from them.",
        ["micro-kits", "micro-seed", "sprout-kits"],
    ),
}


def affiliate_link(url: str, label: str) -> str:
    return f'<a href="{esc(url)}" rel="sponsored nofollow" target="_blank">{esc(label)}</a>'


def letpot_link(key: str, label: str) -> str:
    return affiliate_link(LETPOT_URLS[key], label)


def trueleaf_link(key: str, label: str) -> str:
    return affiliate_link(TRUELEAF_URLS[key], label)


TRUELEAF_CARD_PHOTOS = {
    "micro-seed": ["radish-packet", "radish"],
    "micro-kits": ["home-microgreens", "sunflower"],
    "sprout-seed": ["alfalfa-jar", "pea-sack"],
    "sprout-kits": ["alfalfa-jar", "pea-sack", "sunflower"],
}


def take_slug(used: set[str], choices: list[str]) -> str:
    for slug in choices:
        stem = shop_placements.photo_stem(slug)
        name = f"{stem}-600.webp"
        if name not in used:
            used.add(name)
            return slug
    raise SystemExit(f"No unused photo left for {choices}")


def supply_fact_card(slug: str, title_html: str, note: str) -> str:
    alt, author, *_rest = shop_placements.SUPPLY_IMAGES[slug]
    stem = shop_placements.photo_stem(slug)
    official = slug.startswith("letpot-")
    img_class = ' class="letpot-photo"' if official else ""
    if official:
        credit = '<p class="fact-credit">Photo: LetPot</p>'
    else:
        credit = (
            f'<p class="fact-credit">Example photo · '
            f'<a href="/photo-credits/#supply-{slug}">{esc(author)}</a></p>'
        )
    return (
        '<article class="fact-card">'
        f'<img{img_class} src="/assets/products/{stem}-600.webp" width="600" height="600" '
        f'alt="{esc(alt)}" loading="lazy" decoding="async">'
        f"{credit}"
        f"<h3>{title_html}</h3>"
        f'<p class="fact-note">{esc(note)}</p>'
        "</article>"
    )


def affiliate_box(heading_id: str, heading: str, lead: str, cards: str) -> str:
    return (
        '<section class="affiliate-offer">'
        f'<aside class="note affiliate-box" aria-labelledby="{heading_id}">'
        f'<h2 id="{heading_id}">{heading}</h2>'
        f"<p>{esc(lead)}</p>"
        f'<div class="fact-grid fact-grid-2">{cards}</div>'
        "</aside></section>"
    )


def used_image_names(html: str) -> set[str]:
    names = set()
    for src in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', html):
        key = content_image_key(src)
        if key:
            names.add(key)
    return names


def letpot_box(name: str, used: set[str]) -> str:
    lead, keys = LETPOT_BOXES[name]
    cards = []
    for key in keys:
        label, blurb = LETPOT_MODELS[key]
        cards.append(supply_fact_card(take_slug(used, [f"letpot-{key}"]), letpot_link(key, label), blurb))
    return affiliate_box("letpot-choice", "If you'd rather not deal with trays and soil", lead, "".join(cards))


def trueleaf_box(name: str, used: set[str]) -> str:
    lead, keys = TRUELEAF_BOXES[name]
    cards = []
    for key in keys:
        label, blurb = TRUELEAF_LINKS[key]
        cards.append(supply_fact_card(take_slug(used, TRUELEAF_CARD_PHOTOS[key]), trueleaf_link(key, label), blurb))
    return affiliate_box("trueleaf-choice", "If you need seed or a kit", lead, "".join(cards))


def apply_shop(html: str) -> str:
    html = re.sub(r"<!--SHOP:([a-z0-9-]+)-->", lambda match: shop_placements.render_shop(match.group(1)), html)
    if "<!--SHOP" in html:
        raise SystemExit("Unresolved shop placeholder")
    return html


def disclosure_sentence(html: str) -> str | None:
    has_store = "https://www.amazon.com/dp/" in html or "awin1.com" in html
    if not has_store:
        return None
    sentence = shop_placements.COMMISSION_SENTENCE
    if "https://www.amazon.com/dp/" in html or "Amazon Associates" in html:
        sentence = f"{sentence} {shop_placements.AMAZON_DISCLOSURE}"
    return sentence


def insert_after_intro(html: str, block: str) -> str:
    header = re.search(r"<header\b[^>]*>.*?</header>", html, flags=re.S)
    if header and "<h1" in header.group(0):
        end = header.end()
        return html[:end] + block + html[end:]
    h1 = html.find("</h1>")
    h2 = html.find("<h2")
    for pattern in (r'<p class="byline">.*?</p>', r'<p class="dek">.*?</p>'):
        match = re.search(pattern, html, flags=re.S)
        if not match or (h1 != -1 and match.start() < h1):
            continue
        if h2 != -1 and match.end() > h2:
            continue
        return html[: match.end()] + block + html[match.end() :]
    if h1 != -1:
        end = h1 + len("</h1>")
        return html[:end] + block + html[end:]
    raise SystemExit("No place under the title for the commission line")


def place_single_disclosure(html: str) -> str:
    html = re.sub(
        r'<p class="(?:affiliate-disclosure|picks-disclosure)">.*?</p>',
        "",
        html,
        flags=re.S,
    )
    sentence = disclosure_sentence(html)
    if sentence is None:
        return html
    block = f'<p class="affiliate-disclosure">{esc(sentence)}</p>'
    placed = insert_after_intro(html, block)
    first_store = min(
        index
        for index in (
            placed.find("https://www.amazon.com/dp/"),
            placed.find("awin1.com"),
        )
        if index != -1
    )
    if placed.find(block) > first_store:
        raise SystemExit("Commission line is below the first store link")
    if placed.count(block) != 1:
        raise SystemExit("Commission line is not exactly once")
    if "https://www.amazon.com/dp/" in placed:
        if placed.count(shop_placements.AMAZON_DISCLOSURE) != 1:
            raise SystemExit("Amazon disclosure sentence is not exactly once")
    return placed


def apply_letpot(html: str) -> str:
    used = used_image_names(html)

    def repl(match: re.Match) -> str:
        return letpot_box(match.group(1), used)

    html = re.sub(r"<!--LETPOT:([a-z-]+)-->", repl, html)
    html = html.replace("<!--LETPOT_HOME-->", letpot_link("home", "LetPot"))
    if "<!--LETPOT" in html:
        raise SystemExit("Unresolved LetPot placeholder")
    return html


def apply_trueleaf(html: str) -> str:
    used = used_image_names(html)

    def repl(match: re.Match) -> str:
        return trueleaf_box(match.group(1), used)

    html = re.sub(r"<!--TRUELEAF:([a-z-]+)-->", repl, html)
    html = html.replace("<!--TRUELEAF_HOME-->", trueleaf_link("home", "True Leaf Market"))
    if "<!--TRUELEAF" in html:
        raise SystemExit("Unresolved True Leaf placeholder")
    return html


def layout(page: dict, main: str, graph: list[dict]) -> str:
    from product_cards import apply_placeholders

    main = apply_placeholders(main, LETPOT_URLS, TRUELEAF_URLS)
    main = apply_shop(main)
    main = apply_letpot(main)
    main = apply_trueleaf(main)
    main = place_single_disclosure(main)
    main = render_content_photos(main)
    title = page["title"]
    description = page["description"]
    canonical = page["url"]
    nav_html = []
    for label, _abs, href in NAV:
        current = ' aria-current="page"' if page.get("nav") == href else ""
        nav_html.append(f'<li><a href="{href}"{current}>{label}</a></li>')
    robots = page.get("robots", "index,follow")
    og_type = page.get("og_type") or ("article" if page["kind"] == "article" else "website")
    if page.get("rich_pin"):
        image, image_width, image_height = page_share_image(main)
        og_description = description
        if not 140 <= len(og_description) <= 160:
            raise SystemExit(f"{canonical} og:description length {len(og_description)}")
    else:
        image = page.get("image", f"{SITE}/assets/og/home.jpg")
        image_width, image_height = 1200, 630
        og_description = description
    article_times = ""
    if page.get("published") and page.get("modified"):
        article_times = (
            f'<meta property="article:published_time" content="{esc(page["published"])}">\n'
            f'<meta property="article:modified_time" content="{esc(page["modified"])}">\n'
        )
    verify = ""
    if page.get("verify"):
        verify = (
            "<meta name='impact-site-verification' value='39f4dac9-40bd-4810-85dd-0cfda1aaa6a1'>\n"
            '<meta name="p:domain_verify" content="d5bc7d789b70d72abe4b445f09611c3c"/>\n'
        )
    ld = {"@context": "https://schema.org", "@graph": graph}
    gtag = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-8YDK0NYXM5"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-8YDK0NYXM5');
</script>
"""
    scripts = page.get("scripts", "")
    scripts += f'<script src="/js/site.js?v={asset_version("js/site.js")}" defer></script>'
    if page.get("signup"):
        scripts += f'<script src="/js/signup.js?v={asset_version("js/signup.js")}"></script>'
    scripts += """<script>
document.querySelectorAll(".video-facade").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var id = btn.getAttribute("data-id");
    var frame = document.createElement("div");
    frame.className = "video-frame";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
    iframe.title = btn.getAttribute("aria-label") || "YouTube video";
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    btn.replaceWith(frame);
    if (typeof gtag === "function") gtag("event", "video_play", { video_id: id });
  });
});
var toc = document.querySelector(".toc-drawer");
if (toc && window.matchMedia("(max-width: 899px)").matches) toc.removeAttribute("open");
</script>"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{verify}{gtag}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(canonical)}">
<meta name="robots" content="{robots}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(og_description)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Small Space Greens">
{article_times}<meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="{image_width}">
<meta property="og:image:height" content="{image_height}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(og_description)}">
<meta name="twitter:image" content="{esc(image)}">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="/favicon.svg?v={asset_version('favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Small Space Greens" href="/feed.xml">
<link rel="stylesheet" href="/css/styles.css?v={asset_version('css/styles.css')}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="page-{page['kind']}">
<header class="site-header">
<a class="skip" href="#content">Skip to content</a>
<div class="header-bar">
<a class="brand" href="/" aria-label="Small Space Greens home">{BRAND}</a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" hidden>Menu <span aria-hidden="true">+</span></button>
<nav id="primary-nav" class="nav" aria-label="Primary"><ul>{''.join(nav_html)}</ul></nav>
</div>
</header>
<main id="content" class="wrap {page.get('wrap', '')}">
{main}
</main>
<footer class="site-footer">
<div class="footer-bar">
<div class="footer-top"><div><a class="brand" href="/" aria-label="Small Space Greens home">{BRAND}</a><p class="footer-tagline">A little space. Something good to grow.</p></div>
<nav class="footer-nav" aria-label="Footer">
<a href="/guides/">Growing guides</a>
<a href="/gear/">Find your setup</a>
<a href="/editorial-method/">Editorial method</a>
<a href="/photo-credits/">Photo credits</a>
<a href="/privacy/">Privacy</a>
<a href="/affiliate-disclosure/">Affiliate disclosure</a>
<a href="/contact/">Contact</a>
</nav>
</div><div class="footer-bottom"><p class="copyright">© 2026 Small Space Greens</p><p>Independent guidance for smaller growing spaces. <a href="/about/">Meet the editor ↗</a></p></div>
</div>
</footer>
{scripts}
</body>
</html>
""".replace('↗', ARROW_UP).replace('→', ARROW_RIGHT)


def signup_form(compact: bool, direct_link: bool = True) -> str:
    if compact:
        lead = (
            "<h2 id=\"signup-title\">Checklist by email</h2>"
            "<p>Get the first-tray checklist by email from Ryan Moalemi. "
            "Confirm your address first. Unsubscribe any time.</p>"
        )
    else:
        lead = (
            "<h2 id=\"signup-title\">Get the checklist by email</h2>"
            "<p>Get the first-tray checklist by email from Ryan Moalemi. "
            "Confirm your address first. Unsubscribe any time. "
            "You can still print the list on this page without signing up.</p>"
        )
    # The checklist page is the printable list, so a link back to itself would go nowhere.
    direct = (
        '<p class="signup-direct">Or <a href="/guides/first-tray-checklist/">open the printable checklist</a>.</p>\n'
        if direct_link
        else ""
    )
    return f"""<section class="signup" aria-labelledby="signup-title">
{lead}
<form class="signup-form" method="post">
<fieldset data-signup-fields disabled>
<div class="field">
<label for="signup-email">Email address</label>
<input id="signup-email" name="email" type="email" autocomplete="email" required>
</div>
<div class="hp" aria-hidden="true">
<label for="website">Website</label>
<input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
</div>
<button class="button" type="submit">Email me the checklist</button>
<p class="signup-error" role="alert" hidden></p>
</fieldset>
</form>
{direct}</section>
"""


def add_heading_ids(html: str) -> str:
    used: dict[str, int] = {}

    def repl(match: re.Match) -> str:
        inner = match.group(1)
        text = re.sub(r"<[^>]+>", "", inner)
        slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:48] or "section"
        seen = used.get(slug, 0) + 1
        used[slug] = seen
        if seen > 1:
            slug = f"{slug}-{seen}"
        return f'<h2 id="{slug}">{inner}</h2>'

    return re.sub(r"<h2>(.*?)</h2>", repl, html, flags=re.S)


def open_first_faqs(html: str) -> str:
    parts = html.split('<div class="faq">', 1)
    if len(parts) != 2:
        return html
    before, after = parts
    count = {"n": 0}

    def repl(match: re.Match) -> str:
        count["n"] += 1
        return "<details open>" if count["n"] <= 2 else "<details>"

    after = re.sub(r"<details>", repl, after)
    return before + '<div class="faq">' + after


def collapse_sources(html: str) -> str:
    return re.sub(
        r'<h2 id="sources">Sources</h2>\s*(<ul class="sources">.*?</ul>)',
        r'<details class="fold" id="sources"><summary>Sources</summary>\1</details>',
        html,
        count=1,
        flags=re.S,
    )


def guide_toc(html: str) -> str:
    headings = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', html, flags=re.S)
    if 'id="sources"' in html:
        headings.append(("sources", "Sources"))
    if not headings:
        return ""
    items = []
    for slug, inner in headings:
        label = re.sub(r"<[^>]+>", "", inner)
        label = " ".join(label.split())
        items.append(f'<li><a href="#{slug}">{esc(label)}</a></li>')
    return (
        '<nav class="guide-toc" aria-label="On this page">'
        '<details class="toc-drawer" open><summary>On this page</summary>'
        f'<ol>{"".join(items)}</ol></details></nav>'
    )


def prepare_guide_body(html: str) -> str:
    from product_cards import apply_placeholders

    html = apply_placeholders(html, LETPOT_URLS, TRUELEAF_URLS)
    html = apply_shop(html)
    html = add_heading_ids(html)
    html = open_first_faqs(html)
    html = collapse_sources(html)
    toc = guide_toc(html)
    marker = "<!--GUIDE_MAIN-->"
    idx = html.find(marker) if marker in html else html.find("<h2")
    if idx == -1 or not toc:
        return html.replace(marker, "")
    intro = html[:idx]
    content = html[idx:].replace(marker, "", 1)
    return (
        '<div class="guide-intro">' + intro + '</div>'
        + '<div class="guide-with-toc">'
        + toc
        + '<div class="guide-main">'
        + content
        + "</div></div>"
    )


def step_strip() -> str:
    steps = [
        (
            "Clean the tray",
            "Wash the tray and follow the sanitizer label when reusing it, including any rinse; never mix cleaning products.",
        ),
        (
            "Moisten the medium",
            "Add moist soilless mix about 1 to 1.5 inches deep, or use the mat specified by your growing method.",
        ),
        (
            "Sow evenly",
            "Spread the prepared seed over the moist surface and press it into contact, using the amount weighed dry before any soak.",
        ),
        (
            "Cover if directed",
            "Use a cover for the germination period only if your crop's instructions call for it, and vent it if the surface stays dripping.",
        ),
        (
            "Weight only if needed",
            "Add weight only when your crop's method specifies it, then remove it at the stage that method gives.",
        ),
        (
            "Move into light",
            "Uncover into light; Maryland suggests about 16 hours a day, with a lamp if the window falls short.",
        ),
        (
            "Water and drain",
            "Water from below when the medium needs it, then remove the growing tray from the reservoir so excess water can drain.",
        ),
        (
            "Harvest above the mix",
            "At your crop's harvest stage, cut above the mix, leave the roots behind, and wash the greens before eating.",
        ),
    ]
    photos = ["tray", "mix", "sowing", "cover", "sunflower", "light", "water", "harvest"]
    items = []
    for number, (title, instruction) in enumerate(steps, start=1):
        items.append(
            f'<li class="grow-step" data-photo="{photos[number - 1]}">'
            f'<div class="step-copy"><h3>{esc(title)}</h3><p>{esc(instruction)}</p></div>'
            '</li>'
        )
    return '<ol class="grow-steps" role="list">' + "".join(items) + '</ol>'


def harvest_chart() -> str:
    data = json.loads((SRC / "harvest-windows.json").read_text())
    rates = {row["id"]: row for row in json.loads((SRC / "rates.json").read_text())}
    rows = []
    for crop in data["crops"]:
        low, high = crop["low"], crop["high"]
        if not 0 <= low < high:
            raise SystemExit(f'Invalid harvest range for {crop["id"]}')
        expected = f'Harvest about {low} to {high} days.'
        if expected not in rates[crop["id"]]["timing"]:
            raise SystemExit(f'Harvest chart disagrees with calculator guidance for {crop["id"]}')
        photo = LIST_PHOTOS[crop["photo"]]
        rows.append(
            '<li class="harvest-row" role="listitem">'
            '<div class="harvest-crop">'
            f'<img src="/assets/photos/thumbs/{esc(photo["thumbnail"])}" width="320" height="320" '
            f'alt="{esc(photo["alt"])}" loading="lazy" decoding="async">'
            '<div class="harvest-crop-copy">'
            f'<a class="harvest-crop-name" href="/tools/microgreens-seed-calculator/?crop={esc(crop["id"])}&amp;tray=10x10">{esc(crop["name"])}</a>'
            f'<p class="photo-credit">Credit: <a href="/photo-credits/#{esc(photo["credit_id"])}">{esc(photo["author"])}</a></p>'
            '</div></div>'
            f'<p class="harvest-value"><strong>{low}<span class="harvest-to"> to </span>{high}</strong> <span>days</span></p>'
            '</li>'
        )
    return (
        '<section class="harvest-chart" aria-labelledby="harvest-times">'
        '<div class="harvest-heading"><p class="eyebrow">Plan your first harvest</p>'
        '<h2 id="harvest-times">When can you harvest?</h2>'
        '<p class="harvest-subtitle">Compare estimated harvest times by crop.</p></div>'
        '<ul class="harvest-rows" role="list">' + ''.join(rows) + '</ul>'
        '<div class="harvest-footer"><p>Use these ranges to plan, then check your crop before cutting.</p>'
        f'<p class="harvest-source">Estimates: <a href="{esc(data["source_url"])}">{esc(data["source"])}</a>.</p>'
        '<p class="harvest-next">Tap a crop name to calculate seed for your tray.</p></div>'
        '</section>'
    )


VIDEOS = {
    "dtvuMNVLISo": (
        "How to Grow Microgreens from Start to Finish (COMPLETE GUIDE)",
        "Epic Gardening",
    ),
    "TnKe4dowdUk": (
        "How to grow vegetables and herbs on your windowsill",
        "Royal Botanic Gardens, Kew",
    ),
    "FIhqP_47mfQ": (
        "How to Plant Microgreens (And What Soil to Use)",
        "Epic Gardening",
    ),
}


def video_embed(video_id: str) -> str:
    title, channel = VIDEOS[video_id]
    return (
        f'<details class="video-panel"><summary>Watch: {esc(title)} · {esc(channel)}</summary><figure class="video-embed">'
        f'<button type="button" class="video-facade" data-id="{video_id}" '
        f'aria-label="Play video: {esc(title)}, {esc(channel)}">'
        f'<img src="/assets/video/{video_id}.jpg" alt="" width="480" height="360" loading="lazy">'
        '<span class="play-badge">Play</span></button>'
        f'<figcaption class="credit">Video: {esc(channel)} on YouTube. {esc(title)}. '
        "Third-party video. Not filmed for Small Space Greens. "
        f'<a href="https://www.youtube.com/watch?v={video_id}">Opens on YouTube</a>.</figcaption>'
        "</figure></details>"
    )


def disclosure() -> str:
    return (
        '<p class="disclosure">Independent, research-based guidance. '
        '<a href="/editorial-method/">Our editorial method</a> · '
        '<a href="/affiliate-disclosure/">How product links work</a>.</p>'
    )


def article_page(guide: dict, body: str) -> str:
    show_signup = guide["slug"] not in {"balcony-salad-garden", "apartment-seed-starting"}
    url = f"{SITE}/guides/{guide['slug']}/"
    published, modified = git_times(SRC / "guides" / f"{guide['slug']}.html")
    crumbs = [
        ("Home", f"{SITE}/"),
        ("Guides", f"{SITE}/guides/"),
        (guide["h1"], url),
    ]
    faqs = extract_faqs(body)
    if len(faqs) < 3:
        raise SystemExit(f"{guide['slug']} needs at least 3 FAQs, found {len(faqs)}")
    page_image = f"{SITE}/assets/og/{guide.get('og', 'guides')}.jpg"
    graph = base_graph()
    graph.append(crumbs_ld(crumbs))
    graph.append(
        {
            "@type": "Article",
            "headline": guide["h1"],
            "description": guide["description"],
            "datePublished": published,
            "dateModified": modified,
            "author": {"@id": PERSON_ID},
            "publisher": {"@id": ORG_ID},
            "mainEntityOfPage": url,
            "image": page_image,
            "inLanguage": "en",
        }
    )
    graph.append(
        {
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": item["q"],
                    "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
                }
                for item in faqs
            ],
        }
    )
    main = (
        crumbs_html(crumbs)
        + '<header class="article-header"><p class="eyebrow">The small-space growing guide</p>'
        + f"<h1>{esc(guide['h1'])}</h1>"
        + f"<p class=\"dek\">{esc(guide['dek'])}</p>"
        + f"<p class=\"byline\">By <a href=\"/about/\">Ryan Moalemi</a>. Updated {esc(guide.get('updated_label', DATE_LABEL))}.</p>"
        + '</header>'
        + prepare_guide_body(body)
        + related_html(guide["slug"])
        + (signup_form(True) if show_signup else "")
    )
    page = {
        "title": guide["title"],
        "description": guide["description"],
        "url": url,
        "kind": "article",
        "nav": guide.get("nav", "/guides/"),
        "image": page_image,
        "signup": show_signup,
        "rich_pin": True,
        "published": published,
        "modified": modified,
    }
    if guide["slug"] == "microgreens-kit-vs-diy-cost":
        page["scripts"] = f'<script src="/js/cost-compare.js?v={asset_version("js/cost-compare.js")}" defer></script>'
    return layout(page, main, graph)


def simple_page(page: dict, body: str, extra_graph: list[dict] | None = None) -> str:
    crumbs = page["crumbs"]
    graph = base_graph()
    graph.append(crumbs_ld(crumbs))
    if extra_graph:
        graph.extend(extra_graph)
    main = crumbs_html(crumbs) + body
    return layout(page, main, graph)


def rate_label(row: dict) -> str:
    if "grams" in row:
        return f"{row['grams']} g"
    return f"{row['low']} to {row['high']} g"


def bar_chart(title: str, subtitle: str, rows: list[tuple[str, str, str, int | None]], source: str) -> str:
    """Responsive HTML bars. rows are (label, value text, detail, bar grams or None).

    Text stays live HTML so it never shrinks below the page type on phones. Bar widths
    are percentages of the largest published figure in the same chart.
    """
    magnitudes = [grams for *_rest, grams in rows if grams]
    max_g = max(magnitudes) if magnitudes else 1
    items = []
    for label, value, detail, grams in rows:
        if grams:
            bar = f'<span class="seed-bar" aria-hidden="true"><span style="width:{max(4, round(100 * grams / max_g, 1))}%"></span></span>'
            value_html = f'<span class="seed-grams">{esc(value)}</span>'
        else:
            bar = ""
            value_html = f'<span class="seed-grams seed-grams-none">{esc(value)}</span>'
        detail_html = f'<span class="seed-detail">{esc(detail)}</span>' if detail else ""
        items.append(
            '<li class="seed-row">'
            f'<span class="seed-name">{esc(label)}</span>{value_html}{bar}{detail_html}'
            '</li>'
        )
    return (
        f'<figure class="seed-chart" aria-labelledby="{slug_id(title)}">'
        f'<p class="seed-chart-title" id="{slug_id(title)}">{esc(title)}</p>'
        f'<p class="seed-chart-sub">{esc(subtitle)}</p>'
        '<ul class="seed-rows" role="list">' + "".join(items) + '</ul>'
        f'<figcaption class="fact-credit">{esc(source)}</figcaption></figure>'
    )


def slug_id(text: str) -> str:
    return "chart-" + re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def seed_chart() -> str:
    """Calculator chart: every Utah State crop rate, sorted by grams, plus Maryland's sample band."""
    rates = json.loads((SRC / "rates.json").read_text())
    crops = sorted((row for row in rates if "grams" in row and not row.get("needsRate")), key=lambda row: row["grams"])
    max_g = max(row["grams"] for row in crops)
    items = [
        '<li class="seed-row">'
        f'<span class="seed-name">{esc(row["name"])}</span>'
        f'<span class="seed-grams">{row["grams"]} g</span>'
        f'<span class="seed-bar" aria-hidden="true"><span style="width:{max(4, round(100 * row["grams"] / max_g, 1))}%"></span></span>'
        '</li>'
        for row in crops
    ]
    sample = [row for row in rates if row.get("needsRate")]
    lows = {row["low"] for row in sample}
    highs = {row["high"] for row in sample}
    if len(lows) != 1 or len(highs) != 1:
        raise SystemExit("seed chart expects one Maryland sample band")
    low, high = lows.pop(), highs.pop()
    names = ", ".join(row["name"].lower() for row in sample)
    items.append(
        '<li class="seed-row seed-row-sample">'
        '<span class="seed-name">Maryland example</span>'
        f'<span class="seed-grams">{low} to {high} g</span>'
        '<span class="seed-bar seed-bar-sample" aria-hidden="true">'
        f'<span style="width:{round(100 * high / max_g, 1)}%"><span style="width:{round(100 * low / high, 1)}%"></span></span></span>'
        f'<span class="seed-detail">Not a crop rate. A general broadcast example the calculator offers for {esc(names)}.</span>'
        '</li>'
    )
    return (
        '<figure class="seed-chart" aria-labelledby="chart-grams-per-tray">'
        '<p class="seed-chart-title" id="chart-grams-per-tray">Grams per 10 by 20 inch tray</p>'
        '<p class="seed-chart-sub">Utah State crop rates used by the calculator, lightest to heaviest.</p>'
        '<ul class="seed-rows" role="list">' + "".join(items) + '</ul>'
        '<figcaption class="fact-credit">Source: Utah State University Extension grams per 1020 tray. '
        "The tan bar is University of Maryland Extension's general broadcast example for crops without a Utah State rate.</figcaption>"
        '</figure>'
    )


def density_bars() -> str:
    rows = [
        ("Radish", "42 g", "Utah State crop rate", 42),
        ("Pea", "150 g", "Utah State crop rate", 150),
        ("Sunflower", "48 g", "Utah State crop rate", 48),
        ("Broccoli, kale, cilantro, basil, rutabaga", "28 g", "Utah State crop rate for each", 28),
        ("Arugula", "10 g", "Utah State crop rate", 10),
        ("Mustard, beet, amaranth", "No crop rate", "Maryland sample of 10 to 15 g only if you choose it", None),
    ]
    return bar_chart(
        "Published grams",
        "Each bar uses the figure printed for that crop.",
        rows,
        "Source: Utah State University Extension grams per 1020 tray. Mustard, beet, and amaranth have no Utah State crop rate. The 10 to 15 g line is University of Maryland Extension's sample, only if you choose it.",
    )


def rates_table() -> str:
    rates = json.loads((SRC / "rates.json").read_text())
    rows = []
    for row in rates:
        grams = row["grams"] if "grams" in row else None
        detail = f"{row['kind']}. {row['presoak'].rstrip('.')}. {row['timing']}"
        rows.append((row["name"], rate_label(row), detail, grams))
    return bar_chart(
        "Seed per 10 by 20 inch tray",
        "Every published figure the calculator uses.",
        rows,
        "Utah State University Extension grams per 1020 tray. Mustard, beet, and amaranth use the University of Maryland Extension sample of 10 to 15 g, not a crop rate.",
    )


def calculator_options() -> str:
    rates = json.loads((SRC / "rates.json").read_text())
    return "\n".join(
        f'<option value="{esc(row["id"])}">{esc(row["name"])}</option>' for row in rates
    )


TRUELEAF_UNIT_GRAMS = {"g": 1.0, "oz": 28.349523125, "lb": 453.59237}


def trueleaf_awin(url: str) -> str:
    """Same Awin deep-link format as the other True Leaf links (merchant 124042, publisher 3149328)."""
    from urllib.parse import quote

    if not url.startswith("https://trueleafmarket.com/products/"):
        raise SystemExit(f"True Leaf package link is not a product page: {url}")
    return "https://www.awin1.com/cread.php?awinmid=124042&awinaffid=3149328&ued=" + quote(url, safe="")


AMAZON_TAG = "smallspaceg04-20"
# Images already shown elsewhere on the calculator page, and list photos that are the same
# original picture under another file name. A package-box photo may not repeat any of them.
CALCULATOR_PAGE_PHOTO_SOURCES = {
    "pea-shoots-counter.jpg": "supply-pea-shoots",
    "supply-pea-shoots": "supply-pea-shoots",
}


def calculator_box_photo(crop_id: str, key: str) -> dict:
    photos = json.loads((SRC / "list-photos.json").read_text())
    if key not in photos or "thumbnail" not in photos[key]:
        raise SystemExit(f"Package box photo {key} for {crop_id} is not a list photo with a thumbnail")
    photo = photos[key]
    if not (ROOT / "assets" / "photos" / "thumbs" / photo["thumbnail"]).exists():
        raise SystemExit(f"Package box photo file missing: {photo['thumbnail']}")
    return {
        "src": f"/assets/photos/thumbs/{photo['thumbnail']}",
        "alt": photo["alt"],
        "credit": f"/photo-credits/#{photo['credit_id']}",
        "author": photo["author"],
    }


def calculator_check_date(stamp: str) -> str:
    """'2026-11-10 22:29 PT' -> 'November 10, 2026' for the package box."""
    day = datetime.strptime(stamp[:10], "%Y-%m-%d")
    return f"{day.strftime('%B')} {day.day}, {day.year}"


def amazon_offer(crop_id: str, offer: dict) -> dict:
    asin = offer["asin"]
    if len(asin) != 10 or not asin.isalnum() or not asin.isupper():
        raise SystemExit(f"Bad ASIN for {crop_id}: {asin}")
    if not offer["label"].startswith(f'{offer["amount"]:g} {offer["unit"]}'):
        raise SystemExit(f"Amazon size label disagrees with its amount for {crop_id}: {offer['label']}")
    embed = offer.get("image_embed")
    if embed is not None and not re.fullmatch(
        r"https://(ws-na\.amazon-adsystem\.com/widgets/q\?[^\s\"'<>]+|m\.media-amazon\.com/images/I/[A-Za-z0-9%+._-]+)", embed
    ):
        raise SystemExit(f"image_embed for {crop_id} {asin} must be an Amazon-served image URL")
    return {
        "label": offer["label"],
        "unit": offer["unit"],
        "inStock": offer.get("in_stock", True) is not False,
        "grams": round(offer["amount"] * TRUELEAF_UNIT_GRAMS[offer["unit"]], 1),
        "url": f"https://www.amazon.com/dp/{asin}?tag={AMAZON_TAG}",
        "title": offer["title"],
        "match": offer["match"],
        "imageEmbed": embed,
    }


def trueleaf_packages(crops: dict) -> dict:
    """Package sizes verified on True Leaf's product pages, converted to grams for the calculator.

    Crops with no crop rate (needsRate) are sized from the rate the visitor chose, so they only
    need to exist in rates.json. Amazon offers are shown only when the picked True Leaf size is
    out of stock at the last check.
    """
    data = json.loads((SRC / "trueleaf-packages.json").read_text())
    packs = {}
    for crop_id, entry in data["crops"].items():
        if crop_id not in crops or not ("grams" in crops[crop_id] or crops[crop_id].get("needsRate")):
            raise SystemExit(f"True Leaf packages listed for {crop_id}, which has no crop rate")
        sizes = []
        for size in entry["sizes"]:
            label = size["label"]
            if not re.fullmatch(r"\d+", size["variant"]):
                raise SystemExit(f"Bad True Leaf variant id for {crop_id} {label}")
            if not label.startswith(f'{size["amount"]:g} {size["unit"]}'):
                raise SystemExit(f"True Leaf size label disagrees with its amount for {crop_id}: {label}")
            sizes.append(
                {
                    "label": label,
                    "unit": size["unit"],
                    "inStock": size.get("in_stock", True) is not False,
                    "grams": round(size["amount"] * TRUELEAF_UNIT_GRAMS[size["unit"]], 1),
                    "url": trueleaf_awin(f'{entry["url"]}?variant={size["variant"]}'),
                }
            )
        if [s["grams"] for s in sizes] != sorted(s["grams"] for s in sizes):
            raise SystemExit(f"True Leaf sizes for {crop_id} must run small to large")
        amazon = [amazon_offer(crop_id, offer) for offer in entry.get("amazon", [])]
        if [s["grams"] for s in amazon] != sorted(s["grams"] for s in amazon):
            raise SystemExit(f"Amazon offers for {crop_id} must run small to large")
        if "photo" not in entry:
            raise SystemExit(f"Package box for {crop_id} needs an example photo")
        photo = calculator_box_photo(crop_id, entry["photo"])
        packs[crop_id] = {
            "product": entry["product"],
            "checked": data["checked"],
            "stockDate": calculator_check_date(data["stock_checked"]),
            "amazonDate": calculator_check_date(data["amazon_checked"]) if amazon else None,
            "sizes": sizes,
            "amazon": amazon,
            "photo": photo,
        }
    return packs


def check_calculator_box_photos(page_html: str, packs: dict) -> None:
    """Every package box has a photo, and none repeats an image already on the calculator page."""
    on_page = set(re.findall(r"/assets/[a-z]+/(?:thumbs/)?([a-z0-9-]+?)(?:-\d+)?\.(?:webp|jpg|png)", page_html))
    for crop_id, pack in packs.items():
        name = pack["photo"]["src"].rsplit("/", 1)[1]
        stem = name.rsplit(".", 1)[0]
        source = CALCULATOR_PAGE_PHOTO_SOURCES.get(name, stem)
        if stem in on_page or source in on_page:
            raise SystemExit(f"Package box photo for {crop_id} repeats an image already on the calculator page: {name}")


def write_calculator_js() -> dict:
    rates = json.loads((SRC / "rates.json").read_text())
    crops = {}
    for row in rates:
        entry = {"name": row["name"], "source": row["source"], "note": row["note"]}
        if row.get("needsRate"):
            entry["needsRate"] = True
        elif "grams" in row:
            entry["grams"] = row["grams"]
        crops[row["id"]] = entry
    core = (SRC / "calc-core.js").read_text()
    logic = (SRC / "calculator.js").read_text()
    payload = "window.SSG_CROPS = " + json.dumps(crops, ensure_ascii=False) + ";\n"
    packs = trueleaf_packages(crops)
    payload += "window.SSG_PACKS = " + json.dumps(packs, ensure_ascii=False) + ";\n"
    target = ROOT / "js" / "calculator.js"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(core + "\n" + payload + logic)
    return packs


def guide_list(include_dek: bool = True) -> str:
    items = []
    for guide in GUIDES:
        dek = f"<p>{esc(guide['dek'])}</p>" if include_dek else ""
        items.append(f'<li data-photo="{GUIDE_PHOTOS[guide["slug"]]}"><a href="/guides/{guide["slug"]}/">{esc(guide["h1"])}</a>{dek}</li>')
    return f'<ul class="guide-list">{"".join(items)}</ul>'


def check_copy(path: Path, text: str) -> None:
    for bad in ["\u2014", "\u2013"]:
        if bad in text:
            raise SystemExit(f"{path} contains a dash character that is not a hyphen")
    lowered = text.lower()
    for phrase in ["we tested", "in our tests", "we grew", "gardener's supply", "gardeners supply", "johnny's", "johnnys selected"]:
        if phrase in lowered:
            raise SystemExit(f"{path} contains banned phrase: {phrase}")
    for banned in ("hamama.com", "bootstrapfarmer.com"):
        if banned in lowered:
            raise SystemExit(f"{path} links a store that is not approved for the live site")
    if "Hamama" in text:
        raise SystemExit(f"{path} names a product that is not approved for the live site")
    from product_cards import check_document

    check_document(str(path), text)


def check_lengths(title: str, description: str, label: str) -> None:
    if not 35 <= len(title) <= 90:
        raise SystemExit(f"{label} title length {len(title)}: {title}")
    if not 80 <= len(description) <= 200:
        raise SystemExit(f"{label} description length {len(description)}: {description}")


def word_count_main(document: str) -> int:
    main = re.search(r"<main.*?>(.*)</main>", document, flags=re.S)
    if not main:
        return 0
    return len(strip_tags(main.group(1)).split())


def build_feed() -> str:
    items = []
    for guide in GUIDES:
        url = f"{SITE}/guides/{guide['slug']}/"
        items.append(
            f"""<item>
<title>{esc(guide['h1'])}</title>
<link>{url}</link>
<guid>{url}</guid>
<pubDate>Tue, 10 Nov 2026 00:00:00 GMT</pubDate>
<description>{esc(guide['description'])}</description>
<author>ryan@smallspacegreens.com (Ryan Moalemi)</author>
</item>"""
        )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Small Space Greens</title>
<link>{SITE}/</link>
<description>How-to guides for small-space gardening and microgreens.</description>
<language>en-us</language>
<lastBuildDate>Tue, 10 Nov 2026 00:00:00 GMT</lastBuildDate>
{''.join(items)}
</channel>
</rss>
"""


def build_sitemap(urls: list[str]) -> str:
    body = []
    for url in urls:
        body.append(f"<url><loc>{url}</loc><lastmod>{DATE}</lastmod></url>")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(body)
        + "\n</urlset>\n"
    )


def render_static_pages() -> dict[str, str]:
    pages: dict[str, str] = {}

    home_title = "Small Space Greens | Microgreens and Small-Space Gardening"
    home_desc = "Grow microgreens and salad greens in a small space. Find practical guides, a seed calculator, and help choosing trays, lights, and growing supplies."
    check_lengths(home_title, home_desc, "home")
    home_body = (
        (SRC / "pages" / "home.html")
        .read_text()
        .replace("<!--GUIDE_LIST-->", guide_list())
        .replace("<!--SIGNUP-->", signup_form(True))
        .replace("<!--STEP_STRIP-->", step_strip())
        .replace("<!--VIDEO_EPIC-->", video_embed("dtvuMNVLISo"))
    )
    home = {
        "title": home_title,
        "description": home_desc,
        "url": f"{SITE}/",
        "kind": "home",
        "nav": "",
        "verify": True,
        "signup": True,
        "image": f"{SITE}/assets/og/home.jpg",
        "crumbs": [("Home", f"{SITE}/")],
        "wrap": "wrap-wide",
    }
    pages["index.html"] = simple_page(home, home_body)

    about_title = "About Small Space Greens and the Editorial Approach"
    about_desc = "Ryan Moalemi writes Small Space Greens as research-based how-to, with no paid placements and affiliate links explained before they are used."
    check_lengths(about_title, about_desc, "about")
    about = {
        "title": about_title,
        "description": about_desc,
        "url": f"{SITE}/about/",
        "kind": "page",
        "nav": "/about/",
        "image": f"{SITE}/assets/og/about.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("About", f"{SITE}/about/")],
    }
    about_graph = [
        {
            "@type": "AboutPage",
            "url": f"{SITE}/about/",
            "name": about_title,
            "author": {"@id": PERSON_ID},
            "publisher": {"@id": ORG_ID},
        }
    ]
    pages["about/index.html"] = simple_page(about, (SRC / "pages" / "about.html").read_text(), about_graph)

    contact_title = "Contact Small Space Greens About These Garden Guides"
    contact_desc = "Email Ryan Moalemi at ryan@smallspacegreens.com about corrections, source questions, or notes on these small-space gardening guides. We reply."
    check_lengths(contact_title, contact_desc, "contact")
    contact = {
        "title": contact_title,
        "description": contact_desc,
        "url": f"{SITE}/contact/",
        "kind": "page",
        "nav": "/contact/",
        "image": f"{SITE}/assets/og/contact.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("Contact", f"{SITE}/contact/")],
    }
    contact_graph = [
        {
            "@type": "ContactPage",
            "url": f"{SITE}/contact/",
            "name": contact_title,
        }
    ]
    pages["contact/index.html"] = simple_page(contact, (SRC / "pages" / "contact.html").read_text(), contact_graph)

    privacy_title = "Small Space Greens Privacy Policy, Updated Nov 2026"
    privacy_desc = "How Small Space Greens uses Google Analytics 4, cookies, and the checklist email list. Contact ryan@smallspacegreens.com. Updated November 2026."
    check_lengths(privacy_title, privacy_desc, "privacy")
    privacy = {
        "title": privacy_title,
        "description": privacy_desc,
        "url": f"{SITE}/privacy/",
        "kind": "page",
        "nav": "",
        "image": f"{SITE}/assets/og/privacy.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("Privacy", f"{SITE}/privacy/")],
    }
    pages["privacy/index.html"] = simple_page(privacy, (SRC / "pages" / "privacy.html").read_text())

    affiliate_title = "Affiliate Disclosure Statement | Small Space Greens"
    affiliate_desc = "Small Space Greens may earn commissions from qualifying purchases. Prices are not raised, and recommendations stay independent of any program."
    check_lengths(affiliate_title, affiliate_desc, "affiliate")
    affiliate = {
        "title": affiliate_title,
        "description": affiliate_desc,
        "url": f"{SITE}/affiliate-disclosure/",
        "kind": "page",
        "nav": "",
        "image": f"{SITE}/assets/og/affiliate.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("Affiliate disclosure", f"{SITE}/affiliate-disclosure/")],
    }
    pages["affiliate-disclosure/index.html"] = simple_page(
        affiliate, (SRC / "pages" / "affiliate.html").read_text()
    )

    photo_credits_title = "Photo Credits and Image Sources | Small Space Greens"
    photo_credits_desc = "Photographers, original image sources, and reuse licences for the real gardening photographs on Small Space Greens."
    check_lengths(photo_credits_title, photo_credits_desc, "photo-credits")
    photo_credits_page = {
        "title": photo_credits_title,
        "description": photo_credits_desc,
        "url": f"{SITE}/photo-credits/",
        "kind": "page",
        "nav": "",
        "image": f"{SITE}/assets/og/home.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("Photo credits", f"{SITE}/photo-credits/")],
    }
    pages["photo-credits/index.html"] = simple_page(
        photo_credits_page, (SRC / "pages" / "photo-credits.html").read_text()
    )

    guides_title = "Growing Guides for Microgreens, Seed Starting, and Balconies"
    guides_desc = "Guides grouped by job: start microgreens, compare supplies, solve a watering problem, or plan a balcony salad."
    check_lengths(guides_title, guides_desc, "guides")
    guides_page = {
        "title": guides_title,
        "description": guides_desc,
        "url": f"{SITE}/guides/",
        "kind": "page",
        "nav": "/guides/",
        "crumbs": [("Home", f"{SITE}/"), ("Guides", f"{SITE}/guides/")],
        "wrap": "wrap-wide",
        "image": f"{SITE}/assets/og/guides.jpg",
    }
    by_slug = {guide["slug"]: guide for guide in GUIDES}
    visuals = {
        "microgreens-in-a-small-apartment": ("/assets/photos/sunflower-small-tray.jpg", "First tray"),
        "gifts-for-indoor-gardeners": ("/assets/photos/lettuce-in-pot.jpg", "Gift ideas"),
        "windowsill-microgreens": ("/assets/photos/basil-window-personal-creations.jpg", "Light and space"),
        "microgreens-seed-density-per-tray": ("/assets/photos/trays-broccoli-radish.jpg", "Seed planning"),
        "microgreen-seeds-for-beginners": ("/assets/photos/radish-seeds-hugowolf.jpg", "Microgreen seeds"),
        "pea-vs-radish-microgreens": ("/assets/photos/pea-shoots-counter.jpg", "Choose a crop"),
        "bottom-watering-trays": ("/assets/photos/seedling-trays-nested-kvdp.jpg", "Watering"),
        "apartment-seed-starting": ("/assets/photos/basil-by-window.jpg", "Seed starting"),
        "balcony-salad-garden": ("/assets/photos/balcony-garden-ruth-hartnup.jpg", "Balcony growing"),
        "microgreens-kit-vs-diy-cost": ("/assets/photos/fenugreek-tray-anthony-ievlev.jpg", "Supplies and cost"),
    }
    photo_credits = {
        "gifts-for-indoor-gardeners": {
            "alt": "Leaf lettuce growing in a container.",
            "width": 960,
            "height": 1280,
            "author": "Netha Hussain",
            "author_url": "https://commons.wikimedia.org/wiki/User:Netha_Hussain",
            "source_url": "https://commons.wikimedia.org/wiki/File:Leaf_lettuce_plant_in_a_pot_10.jpg",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "note": "Cropped.",
        },
        "microgreens-in-a-small-apartment": {
            "alt": "Sunflower microgreens growing in a small clear tray on a white background.",
            "width": 960,
            "height": 810,
            "author": "Pannet",
            "author_url": "https://commons.wikimedia.org/wiki/User:Pannet",
            "source_url": "https://commons.wikimedia.org/wiki/File:Sunflower_microgreens_01.jpg",
            "license": "CC BY 4.0",
            "license_url": "https://creativecommons.org/licenses/by/4.0/",
            "note": "Cropped.",
        },
        "windowsill-microgreens": {
            "alt": "Mature basil in a colorful mosaic pot beside a sunny window.",
            "width": 800,
            "height": 800,
            "author": "Personal Creations",
            "author_url": "https://www.flickr.com/people/127294011@N07",
            "source_url": "https://commons.wikimedia.org/wiki/File:Chalkboard_Plant_Stake_Basil_in_a_window_(14889072919).jpg",
            "license": "CC BY 2.0",
            "license_url": "https://creativecommons.org/licenses/by/2.0/",
            "note": "Cropped.",
        },
        "microgreen-seeds-for-beginners": {
            "alt": "Loose brown radish seeds on a white background.",
            "width": 960,
            "height": 844,
            "author": "Hugowolf",
            "author_url": "https://en.wikipedia.org/wiki/User:Hugowolf",
            "source_url": "https://commons.wikimedia.org/wiki/File:RadishSeeds.jpg",
            "license": "CC BY 3.0",
            "license_url": "https://creativecommons.org/licenses/by/3.0/",
            "note": "Cropped.",
        },
        "microgreens-seed-density-per-tray": {
            "alt": "Green and purple broccoli and radish microgreens growing in plastic trays.",
            "width": 960,
            "height": 720,
            "author": "Teogenesis",
            "author_url": "https://commons.wikimedia.org/wiki/Special:Contributions/Teogenesis",
            "source_url": "https://commons.wikimedia.org/wiki/File:Mikrolistki_-_broku%C5%82_i_rzodkiewka_na_tacach_plastikowych.jpg",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "note": "Cropped.",
        },
        "pea-vs-radish-microgreens": {
            "alt": "Snow pea shoots with long pale stems and small leaves in a round container on a kitchen counter.",
            "width": 960,
            "height": 720,
            "author": "Daderot",
            "author_url": "https://commons.wikimedia.org/wiki/User:Daderot",
            "source_url": "https://commons.wikimedia.org/wiki/File:Snow_pea_shoots_-_Massachusetts.jpg",
            "license": "CC0",
            "license_url": "https://creativecommons.org/publicdomain/zero/1.0/",
            "note": "Cropped.",
        },
        "bottom-watering-trays": {
            "alt": "Young seedlings in a cell tray nested inside a solid black tray on a windowsill.",
            "width": 1200,
            "height": 714,
            "author": "KVDP",
            "author_url": "https://en.wikipedia.org/wiki/User:KVDP",
            "source_url": "https://commons.wikimedia.org/wiki/File:Horticulture_Tray1.jpg",
            "license": "Public domain",
            "license_url": "https://commons.wikimedia.org/wiki/Template:PD-user-en",
            "note": "Resized.",
        },
        "apartment-seed-starting": {
            "alt": "Young basil seedlings in a pot beside a window.",
            "width": 960,
            "height": 720,
            "author": "Jon Eben Field",
            "author_url": "https://commons.wikimedia.org/wiki/File:Pot_of_basil_sprouts_(Ocimum_basilicum)_-_20050422.jpg#Summary",
            "source_url": "https://commons.wikimedia.org/wiki/File:Pot_of_basil_sprouts_(Ocimum_basilicum)_-_20050422.jpg",
            "license": "CC BY 2.0",
            "license_url": "https://creativecommons.org/licenses/by/2.0/",
            "note": "Cropped.",
        },
        "balcony-salad-garden": {
            "alt": "Leafy greens in a terracotta pot, surrounded by pea vines and herbs in balcony planters.",
            "width": 1200,
            "height": 750,
            "author": "Ruth Hartnup",
            "author_url": "https://www.flickr.com/people/95142644@N00",
            "source_url": "https://commons.wikimedia.org/wiki/File:Balcony_garden_(9069549775).jpg",
            "license": "CC BY 2.0",
            "license_url": "https://creativecommons.org/licenses/by/2.0/",
            "note": "Cropped.",
        },
        "microgreens-kit-vs-diy-cost": {
            "alt": "Dewy microgreens with seed husks growing in a black tray beside other seedlings.",
            "width": 1400,
            "height": 1050,
            "author": "Anthony Ievlev",
            "author_url": "https://unsplash.com/@onmywayhome",
            "source_url": "https://unsplash.com/photos/a-bunch-of-plants-that-are-in-a-tray-cwWk5gZd4_Y",
            "license": "Unsplash License",
            "license_url": "https://unsplash.com/license",
            "note": "Cropped.",
        },
    }
    def cards(slugs: list[str]) -> str:
        items = []
        for slug in slugs:
            guide = by_slug[slug]
            img, category = visuals[slug]
            photo = photo_credits.get(slug)
            caption = ""
            alt, width, height = "", 120, 120
            if photo:
                alt, width, height = photo["alt"], photo["width"], photo["height"]
                caption = (
                    '<figcaption class="photo-credit">Credit: '
                    f'<a href="/photo-credits/#{esc(Path(img).stem)}">{esc(photo["author"])}</a>'
                    '</figcaption>'
                )
            items.append(
                '<figure class="library-card">'
                f'<a class="library-card-link" href="/guides/{slug}/">'
                f'<img src="{esc(img)}" alt="{esc(alt)}" width="{width}" height="{height}" loading="lazy">'
                f'<div><p class="eyebrow">{esc(category)}</p><h2>{esc(guide["h1"])}</h2>'
                f'<p>{esc(guide["dek"])}</p></div></a>{caption}</figure>'
            )
        return f'<div class="guide-library-grid">{"".join(items)}</div>'
    guides_body = f"""<div class="guide-library-intro"><p class="eyebrow">The growing library</p><h1>Small steps.<br>Something good to grow.</h1>
<p class="dek">Find the guide for the job in front of you, from your first tray to a little balcony harvest.</p>
<div class="cta-row"><a class="button" href="/guides/microgreens-in-a-small-apartment/">Start with your first tray ↗</a><a class="text-link" href="/guides/first-tray-checklist/">Get the checklist ↗</a></div></div>
{cards(["microgreens-in-a-small-apartment","gifts-for-indoor-gardeners","microgreen-seeds-for-beginners","windowsill-microgreens","microgreens-seed-density-per-tray","pea-vs-radish-microgreens","bottom-watering-trays","apartment-seed-starting","balcony-salad-garden","microgreens-kit-vs-diy-cost"])}
<div class="verdict" style="margin-top:40px"><p><strong>Advice you can check.</strong> Growing steps link to university extension and public-agency sources. Our <a href="/editorial-method/">editorial method</a> explains how research, illustrations, and firsthand evidence are kept distinct.</p></div>
"""
    pages["guides/index.html"] = simple_page(guides_page, guides_body)

    tool_title = "Microgreens Seed Calculator for Tray Size and Cost"
    tool_desc = "Estimate microgreen seed in grams and ounces for your tray size and crop, then approximate cost from your own seed price. It works offline. Free."
    check_lengths(tool_title, tool_desc, "calculator")
    tool = {
        "title": tool_title,
        "description": tool_desc,
        "url": f"{SITE}/tools/microgreens-seed-calculator/",
        "kind": "tool",
        "nav": "/tools/microgreens-seed-calculator/",
        "crumbs": [
            ("Home", f"{SITE}/"),
            ("Microgreens seed calculator", f"{SITE}/tools/microgreens-seed-calculator/"),
        ],
        "wrap": "wrap-wide",
        "scripts": f'<script src="/js/calculator.js?v={asset_version("js/calculator.js")}"></script>',
        "image": f"{SITE}/assets/og/calculator.jpg",
        "og_type": "website",
        "rich_pin": True,
    }
    tool["published"], tool["modified"] = git_times(SRC / "pages" / "calculator.html")
    tool_body = (SRC / "pages" / "calculator.html").read_text()
    tool_body = tool_body.replace("<!--CROP_OPTIONS-->", calculator_options())
    tool_body = tool_body.replace("<!--RATES_TABLE-->", rates_table())
    tool_body = tool_body.replace("<!--SEED_CHART-->", seed_chart())
    tool_graph = [
        {
            "@type": "WebApplication",
            "name": "Microgreens seed calculator",
            "url": f"{SITE}/tools/microgreens-seed-calculator/",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript. No network connection required.",
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
            "provider": {"@id": ORG_ID},
            "author": {"@id": PERSON_ID},
        }
    ]
    pages["tools/microgreens-seed-calculator/index.html"] = simple_page(tool, tool_body, tool_graph)

    missing_title = "Page Not Found | Small Space Greens How-To Guides."
    missing_desc = "That address is not a page on Small Space Greens. Open the guides, the microgreens seed calculator, or the contact page and continue from there."
    check_lengths(missing_title, missing_desc, "404")
    missing = {
        "title": missing_title,
        "description": missing_desc,
        "url": f"{SITE}/404.html",
        "kind": "page",
        "nav": "",
        "robots": "noindex,follow",
        "image": f"{SITE}/assets/og/not-found.jpg",
        "crumbs": [("Home", f"{SITE}/"), ("Page not found", f"{SITE}/404.html")],
    }
    pages["404.html"] = simple_page(missing, (SRC / "pages" / "404.html").read_text())

    extra_pages = [
        ("gear/index.html", "Microgreens Growing Kits and Supplies for Small Spaces", "A microgreens growing kit for a small space, plus reusable trays, seed, and a no-soil indoor garden. Check what is included before you buy.", f"{SITE}/gear/", "/gear/", "Gear and comparisons", f"{SITE}/assets/og/gear.jpg", "gear.html", "wrap-wide"),
        ("editorial-method/index.html", "How Small Space Greens Chooses and Corrects Guides", "How sources are chosen, how product advice will be labeled, and how to send a correction.", f"{SITE}/editorial-method/", "", "Editorial method", f"{SITE}/assets/og/editorial.jpg", "editorial.html", ""),
        ("guides/first-tray-checklist/index.html", "First-Tray Checklist for Apartment Microgreens", "Print the first-tray checklist, or get the same list by email from Ryan after you confirm your address. You can print it without an email address.", f"{SITE}/guides/first-tray-checklist/", "/guides/", "First-tray checklist", f"{SITE}/assets/og/checklist.jpg", "checklist.html", ""),
    ]
    for rel, title, desc, url, nav, crumb, image, filename, wrap in extra_pages:
        check_lengths(title, desc, rel)
        body = (
            (SRC / "pages" / filename)
            .read_text()
            .replace("<!--SIGNUP-->", signup_form(False, direct_link=filename != "checklist.html"))
            .replace("<!--STEP_STRIP-->", step_strip())
        )
        page = {
            "title": title,
            "description": desc,
            "url": url,
            "kind": "page",
            "nav": nav,
            "image": image,
            "wrap": wrap,
            "signup": filename == "checklist.html",
            "crumbs": [("Home", f"{SITE}/"), (crumb, url)],
        }
        if filename == "gear.html":
            page["scripts"] = f'<script src="/js/setup.js?v={asset_version("js/setup.js")}" defer></script>'
        if filename == "checklist.html":
            page["og_type"] = "article"
            page["rich_pin"] = True
            page["published"], page["modified"] = git_times(SRC / "pages" / "checklist.html")
        pages[rel] = simple_page(page, body)

    subscribe_pages = [
        (
            "subscribe/check-email/index.html",
            "Check Your Email to Confirm the Checklist",
            "Open the message from Small Space Greens and confirm your address. The first-tray checklist is sent after you confirm.",
            f"{SITE}/subscribe/check-email/",
            "Check your email",
            "check-email.html",
        ),
        (
            "subscribe/confirmed/index.html",
            "You Are Confirmed for the Checklist Email",
            "Your address is confirmed. The first-tray checklist is on its way, and you can also open the same list on this site.",
            f"{SITE}/subscribe/confirmed/",
            "Subscription confirmed",
            "confirmed.html",
        ),
        (
            "subscribe/unsubscribed/index.html",
            "You Are Unsubscribed from Checklist Email",
            "You will not get more checklist email from Small Space Greens. The checklist page on the site is still available.",
            f"{SITE}/subscribe/unsubscribed/",
            "Unsubscribed",
            "unsubscribed.html",
        ),
    ]
    for rel, title, desc, url, crumb, filename in subscribe_pages:
        check_lengths(title, desc, rel)
        page = {
            "title": title,
            "description": desc,
            "url": url,
            "kind": "page",
            "nav": "",
            "robots": "noindex,follow",
            "image": f"{SITE}/assets/og/checklist.jpg",
            "crumbs": [("Home", f"{SITE}/"), (crumb, url)],
        }
        pages[rel] = simple_page(page, (SRC / "pages" / filename).read_text())

    for guide in GUIDES:
        check_lengths(guide["title"], guide["description"], guide["slug"])
        body = (SRC / "guides" / f"{guide['slug']}.html").read_text()
        body = body.replace("<!--STEP_STRIP-->", step_strip())
        body = body.replace("<!--HARVEST_CHART-->", harvest_chart())
        body = body.replace("<!--DENSITY_BARS-->", density_bars())
        for video_id in VIDEOS:
            body = body.replace(f"<!--VIDEO:{video_id}-->", video_embed(video_id))
        pages[f"guides/{guide['slug']}/index.html"] = article_page(guide, body)

    return pages


def main() -> None:
    credit_page = (SRC / "pages" / "photo-credits.html").read_text()
    for key, photo in LIST_PHOTOS.items():
        if photo.get("src"):
            if not (ROOT / photo["src"].lstrip("/")).is_file():
                raise SystemExit(f"Missing photo file for {key}")
        elif not (ROOT / "assets" / "photos" / "thumbs" / photo["thumbnail"]).is_file():
            raise SystemExit(f"Missing photo thumbnail for {key}")
        if f'id="{photo["credit_id"]}"' not in credit_page:
            raise SystemExit(f"Missing photo credit record for {key}")
    css = minify_css("\n".join((SRC / name).read_text() for name in ["styles.css", "setup.css", "cost-compare.css", "photo-lists.css", "harvest-chart.css"]))
    check_card_contrast(css)
    check_chrome_text_size(css)
    css_path = ROOT / "css" / "styles.css"
    css_path.parent.mkdir(parents=True, exist_ok=True)
    css_path.write_text(css + "\n")
    calculator_packs = write_calculator_js()
    signup_js = ROOT / "js" / "signup.js"
    signup_js.parent.mkdir(parents=True, exist_ok=True)
    signup_js.write_text((SRC / "signup.js").read_text())
    (ROOT / "js" / "site.js").write_text((SRC / "site.js").read_text())
    for name in ["setup.js", "cost-compare.js"]:
        (ROOT / "js" / name).write_text((SRC / name).read_text())
    pages = render_static_pages()
    check_calculator_box_photos(pages["tools/microgreens-seed-calculator/index.html"], calculator_packs)
    urls = []
    photographed_items = 0
    for rel, document in pages.items():
        check_copy(Path(rel), document)
        if re.search(r"<\s*table\b", document, flags=re.I):
            raise SystemExit(f"{rel}: page outputs a table")
        photographed_items += check_photo_lists(document, rel)
        document = dedupe_content_images(document)
        check_duplicate_images(document, rel)
        check_letpot_panels(document, rel)
        pages[rel] = document
        target = ROOT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(document)
        if rel != "404.html" and 'content="noindex' not in document:
            if rel == "index.html":
                urls.append(f"{SITE}/")
            else:
                urls.append(SITE + "/" + rel.replace("index.html", ""))
        guide_slugs = {guide["slug"] for guide in GUIDES}
        slug = rel.split("/")[1] if rel.startswith("guides/") else ""
        if slug in guide_slugs:
            count = word_count_main(document)
            print(f"words {rel}: {count}")
            # This guide's body is unchanged; long image credits moved to their own page.
            minimum_words = 650 if slug == "pea-vs-radish-microgreens" else 700
            if not minimum_words <= count <= 2300:
                raise SystemExit(f"Word count out of range for {rel}: {count}")
    (ROOT / "sitemap.xml").write_text(build_sitemap(urls))
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: https://smallspacegreens.com/sitemap.xml\n"
    )
    (ROOT / "feed.xml").write_text(build_feed())
    (ROOT / "CNAME").write_text("smallspacegreens.com\n")
    (ROOT / ".nojekyll").write_text("")
    (ROOT / f"{INDEXNOW}.txt").write_text(INDEXNOW + "\n")
    # Internal links
    files = {rel for rel in pages}
    files.add("feed.xml")
    hrefs = set()
    for rel, document in pages.items():
        for href in re.findall(r'href="(/[^"]*)"', document):
            if href.startswith("//"):
                continue
            hrefs.add(href.split("#")[0].split("?")[0])
    missing = []
    for href in sorted(hrefs):
        if href in {"/", "/feed.xml", "/favicon.svg", "/css/styles.css"}:
            continue
        candidate = href.strip("/") + "/index.html"
        direct = href.strip("/")
        if candidate not in files and direct not in files and not (ROOT / direct).exists():
            missing.append(href)
    if missing:
        raise SystemExit("Missing internal targets: " + ", ".join(missing))
    print("built", len(pages), "pages")
    for key, bucket in shop_placements.placement_counts().items():
        print(
            f"placements {key}: amazon {bucket['amazon']}, "
            f"trueleaf {bucket['trueleaf']}, letpot {bucket['letpot']}"
        )
    print("photographed editorial list items", photographed_items)
    print("indexnow", INDEXNOW)
    check = subprocess.run([sys.executable, str(ROOT / "scripts" / "check_affiliate_links.py")], check=False)
    if check.returncode != 0:
        raise SystemExit("Affiliate link check failed")


if __name__ == "__main__":
    main()
