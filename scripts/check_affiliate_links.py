#!/usr/bin/env python3
"""Every awin1.com link must use rel sponsored.

awinmid=47605 is LetPot. awinmid=124042 is True Leaf Market.
Those links must be the approved URLs for that program.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_site  # noqa: E402

PROGRAMS = {
    "47605": set(build_site.LETPOT_URLS.values()),
    "124042": set(build_site.TRUELEAF_URLS.values()),
}
ALLOWED = set().union(*PROGRAMS.values())
ANCHOR = re.compile(r"<a\b([^>]*)>", re.I)
AMAZON_HREF = re.compile(r"^https://www\.amazon\.com/dp/[A-Z0-9]{10}\?tag=smallspaceg04-20$")
AMAZON_DISCLOSURE = build_site.shop_placements.AMAZON_DISCLOSURE


def fail(message: str) -> None:
    print("FAIL", message)
    sys.exit(1)


def program_for(href: str) -> str | None:
    match = re.search(r"awinmid=(\d+)", href)
    return match.group(1) if match else None


def link_text(attrs_end: int, text: str) -> str:
    close = text.find("</a>", attrs_end)
    inner = text[attrs_end:close] if close != -1 else ""
    return " ".join(re.sub(r"<[^>]+>", "", inner).split())


def check_amazon(path: Path, text: str) -> int:
    count = 0
    for match in ANCHOR.finditer(text):
        attrs = match.group(1)
        href_match = re.search(r'href="([^"]*)"', attrs)
        if not href_match or "amazon.com" not in href_match.group(1):
            continue
        count += 1
        href = html.unescape(href_match.group(1))
        if not AMAZON_HREF.match(href):
            fail(f"{path} has an Amazon link that is not a tagged /dp/ URL")
        rel_match = re.search(r'rel="([^"]*)"', attrs)
        rel = rel_match.group(1).split() if rel_match else []
        if "sponsored" not in rel or "nofollow" not in rel:
            fail(f"{path} Amazon link is missing rel sponsored nofollow")
        if 'target="_blank"' not in attrs:
            fail(f"{path} Amazon link is missing target _blank")
        label = link_text(match.end(), text).replace(" (opens in a new tab)", "")
        is_photo = 'class="pick-photo-link"' in match.group(0)
        if is_photo:
            if label not in {"View on Amazon", "Check price on Amazon"}:
                fail(f"{path} Amazon photo link text is not an approved label")
        elif label not in {"Check price on Amazon", "View on Amazon"}:
            fail(f"{path} Amazon link text is not an approved label")
    if re.search(r"amazon\.com(?!/dp/)", text, re.I):
        # Tagged /dp/ links are the only allowed amazon.com URLs.
        bare = re.findall(r"https://www\.amazon\.com/[^\"'\s<]*", text)
        for url in bare:
            if not AMAZON_HREF.match(html.unescape(url)):
                fail(f"{path} has a non-product Amazon URL")
    if count and text.count(AMAZON_DISCLOSURE) != 1:
        fail(f"{path} must contain the Amazon Associates disclosure exactly once")
    if count:
        block = (
            '<p class="affiliate-disclosure">We earn a commission from purchases through this page. '
            + AMAZON_DISCLOSURE
            + "</p>"
        )
        if text.count(block) != 1:
            fail(f"{path} is missing the single top commission line")
        disclosure_at = text.find(block)
        first_store = min(
            index
            for index in (text.find("https://www.amazon.com/dp/"), text.find("awin1.com"))
            if index != -1
        )
        if disclosure_at > first_store:
            fail(f"{path} commission line is below the first store link")
    for tag in re.findall(r"<img\b[^>]*>", text, flags=re.I):
        if re.search(r"amazon", tag, re.I):
            src = re.search(r"\bsrc=[\"']([^\"']+)[\"']", tag)
            src_url = src.group(1) if src else ""
            if 'class="amazon-photo"' in tag and "m.media-amazon.com/images/I/" in src_url:
                continue
            fail(f"{path} hotlinks an Amazon image")
    return count


def check_document(path: Path, text: str) -> int:
    count = 0
    if "awin1.com" in text and "<a " not in text:
        fail(f"{path} mentions awin1.com outside a link")
    for match in ANCHOR.finditer(text):
        attrs = match.group(1)
        href_match = re.search(r'href="([^"]*)"', attrs)
        if not href_match or "awin1.com" not in href_match.group(1):
            continue
        count += 1
        href = html.unescape(href_match.group(1))
        rel_match = re.search(r'rel="([^"]*)"', attrs)
        rel = rel_match.group(1).split() if rel_match else []
        if "sponsored" not in rel or "nofollow" not in rel:
            fail(f"{path} awin1.com link is missing rel sponsored nofollow")
        if 'target="_blank"' not in attrs:
            fail(f"{path} awin1.com link is missing target _blank")
        mid = program_for(href)
        if mid not in PROGRAMS or href not in PROGRAMS[mid]:
            fail(f"{path} has an unapproved awin1.com link ({mid})")
    loose = text.lower().count("awin1.com")
    if loose != count:
        fail(f"{path} has {loose} awin1.com mentions but {count} affiliate anchors")
    return count


def main() -> None:
    total = 0
    pages = 0
    amazon_total = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "src" in path.parts:
            continue
        text = path.read_text()
        rel = path.relative_to(ROOT)
        amazon_found = check_amazon(rel, text) if "amazon.com" in text else 0
        if amazon_found:
            amazon_total += amazon_found
            print("amazon", rel, amazon_found)
        if "awin1.com" not in text:
            continue
        found = check_document(rel, text)
        if found:
            pages += 1
            total += found
            print("ok", rel, found)
    used = set()
    for path in ROOT.rglob("*.html"):
        if "src" in path.parts:
            continue
        for href in re.findall(r'href="([^"]*awin1\.com[^"]*)"', path.read_text()):
            used.add(html.unescape(href))
    missing = ALLOWED - used
    if missing:
        fail("approved affiliate URLs missing from the built site: " + ", ".join(sorted(missing)))
    print(
        f"affiliate link checks passed ({total} Awin links on {pages} pages, "
        f"{amazon_total} Amazon links, awinmid=47605 and awinmid=124042)"
    )


if __name__ == "__main__":
    main()
