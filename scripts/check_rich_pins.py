#!/usr/bin/env python3
"""Check Pinterest Rich Pins tags on built guide and calculator pages."""

from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://smallspacegreens.com"
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$")

PAGES = [
    ("guides/microgreens-in-a-small-apartment/index.html", "article"),
    ("guides/microgreens-kit-vs-diy-cost/index.html", "article"),
    ("guides/microgreens-seed-density-per-tray/index.html", "article"),
    ("guides/pea-vs-radish-microgreens/index.html", "article"),
    ("guides/windowsill-microgreens/index.html", "article"),
    ("guides/apartment-seed-starting/index.html", "article"),
    ("guides/bottom-watering-trays/index.html", "article"),
    ("guides/balcony-salad-garden/index.html", "article"),
    ("guides/first-tray-checklist/index.html", "article"),
    ("tools/microgreens-seed-calculator/index.html", "website"),
]


def meta_map(html: str) -> dict[str, str]:
    found: dict[str, str] = {}
    for match in re.finditer(r"<meta\b([^>]*)>", html):
        attrs = match.group(1)
        key = re.search(r'(?:property|name)="([^"]+)"', attrs)
        value = re.search(r'content="([^"]*)"', attrs)
        if key and value:
            found[key.group(1)] = value.group(1)
    return found


def fail(message: str) -> None:
    print("FAIL", message)
    sys.exit(1)


def check_page(rel: str, og_type: str) -> None:
    path = ROOT / rel
    if not path.is_file():
        fail(f"{rel} is missing. Build the site first.")
    html = path.read_text()
    if "\u2014" in html or "\u2013" in html:
        fail(f"{rel} contains an em or en dash")
    for banned in ("hamama.com", "bootstrapfarmer.com", "trueleafmarket.com"):
        if banned in html.lower():
            fail(f"{rel} contains a store link")
    if "G-8YDK0NYXM5" not in html:
        fail(f"{rel} is missing gtag")
    tags = meta_map(html)
    canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not canonical:
        fail(f"{rel} is missing a canonical link")
    required = [
        "og:title",
        "og:description",
        "og:image",
        "og:url",
        "og:type",
        "og:site_name",
        "article:published_time",
        "article:modified_time",
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
    ]
    missing = [name for name in required if not tags.get(name)]
    if missing:
        fail(f"{rel} missing {', '.join(missing)}")
    description = tags["og:description"]
    if not 140 <= len(description) <= 160:
        fail(f"{rel} og:description length {len(description)}")
    if tags["og:description"] != tags.get("description"):
        fail(f"{rel} og:description does not match the page description")
    if tags["og:url"] != canonical.group(1):
        fail(f"{rel} og:url does not match the canonical")
    if tags["og:type"] != og_type:
        fail(f"{rel} og:type is {tags['og:type']}, expected {og_type}")
    if tags["og:site_name"] != "Small Space Greens":
        fail(f"{rel} og:site_name is wrong")
    if tags["twitter:card"] != "summary_large_image":
        fail(f"{rel} twitter:card is wrong")
    if tags["twitter:title"] != tags["og:title"]:
        fail(f"{rel} twitter:title does not match og:title")
    if tags["twitter:description"] != description:
        fail(f"{rel} twitter:description does not match og:description")
    if tags["twitter:image"] != tags["og:image"]:
        fail(f"{rel} twitter:image does not match og:image")
    for name in ("article:published_time", "article:modified_time"):
        if not ISO.match(tags[name]):
            fail(f"{rel} {name} is not ISO 8601: {tags[name]}")
    published = datetime.fromisoformat(tags["article:published_time"])
    modified = datetime.fromisoformat(tags["article:modified_time"])
    if published > modified:
        fail(f"{rel} published time is after modified time")
    image = tags["og:image"]
    if not image.startswith(SITE + "/"):
        fail(f"{rel} og:image is not an absolute site URL")
    rel_image = image[len(SITE) + 1 :]
    if not (ROOT / rel_image).is_file():
        fail(f"{rel} og:image file does not exist: {rel_image}")
    if rel_image == "assets/og/home.jpg":
        if "/assets/photos/" in html:
            fail(f"{rel} has a photo but uses the default share image")
    elif rel_image.startswith("assets/photos/"):
        name = Path(rel_image).name
        if f"/assets/photos/{name}" not in html and f"/assets/photos/thumbs/{name}" not in html:
            fail(f"{rel} og:image is not a photo on the page")
    else:
        fail(f"{rel} og:image is not a page photo or the default share image")
    print("ok", rel, og_type, rel_image)


def check_homepage() -> None:
    html = (ROOT / "index.html").read_text()
    head = html.split("<head>", 1)[1]
    expected = (
        "<meta name='impact-site-verification' value='39f4dac9-40bd-4810-85dd-0cfda1aaa6a1'>\n"
        '<meta name="p:domain_verify" content="d5bc7d789b70d72abe4b445f09611c3c"/>'
    )
    if not head.startswith("\n" + expected) and not head.startswith(expected):
        fail("homepage verification tags are not first in head")
    if "G-8YDK0NYXM5" not in html:
        fail("homepage is missing gtag")
    tags = meta_map(html)
    if tags.get("og:type") != "website":
        fail("homepage og:type is not website")
    print("ok homepage verification and gtag")


def main() -> None:
    check_homepage()
    for rel, og_type in PAGES:
        check_page(rel, og_type)
    print("rich pin checks passed")


if __name__ == "__main__":
    main()
