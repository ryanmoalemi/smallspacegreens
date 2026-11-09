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


def fail(message: str) -> None:
    print("FAIL", message)
    sys.exit(1)


def program_for(href: str) -> str | None:
    match = re.search(r"awinmid=(\d+)", href)
    return match.group(1) if match else None


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
    for path in sorted(ROOT.rglob("*.html")):
        if "src" in path.parts:
            continue
        text = path.read_text()
        if "awin1.com" not in text:
            continue
        found = check_document(path.relative_to(ROOT), text)
        if found:
            pages += 1
            total += found
            print("ok", path.relative_to(ROOT), found)
    used = set()
    for path in ROOT.rglob("*.html"):
        if "src" in path.parts:
            continue
        for href in re.findall(r'href="([^"]*awin1\.com[^"]*)"', path.read_text()):
            used.add(html.unescape(href))
    missing = ALLOWED - used
    if missing:
        fail("approved affiliate URLs missing from the built site: " + ", ".join(sorted(missing)))
    print(f"affiliate link checks passed ({total} links on {pages} pages, awinmid=47605 and awinmid=124042)")


if __name__ == "__main__":
    main()
