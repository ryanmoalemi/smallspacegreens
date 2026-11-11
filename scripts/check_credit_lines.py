#!/usr/bin/env python3
"""Render every built page at 390 and 320 px, light and dark, and fail if any photo credit
wraps onto a second line, drops under 12px, collapses, or if "Example photo" shows anywhere.

Needs Playwright with Chromium (pip install playwright && playwright install chromium).
Usage: python3 scripts/check_credit_lines.py
"""
from __future__ import annotations

import asyncio
import functools
import http.server
import re
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRA = [
    "tools/microgreens-seed-calculator/?crop=radish&tray=10x20&n=1",
    "tools/microgreens-seed-calculator/?crop=amaranth&tray=10x20&n=1&example=1",
    "tools/microgreens-seed-calculator/?crop=pea&tray=10x20&n=1",
]

MEASURE = """() => {
  const out = [];
  for (const el of document.querySelectorAll('.credit-line')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || el.getClientRects().length === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.35;
    out.push({text: el.textContent.trim(), font: parseFloat(cs.fontSize), height: r.height, lh,
              width: r.width, cut: el.scrollWidth > el.clientWidth + 1, ws: cs.whiteSpace});
  }
  return {credits: out, example: /example photo/i.test(document.body.innerText)};
}"""


def pages() -> list[str]:
    found = []
    for path in sorted(ROOT.rglob("index.html")):
        rel = path.relative_to(ROOT)
        if rel.parts[0] in {"src", "scripts", "docs", "node_modules", "previews"}:
            continue
        found.append(str(rel.parent).replace(".", "") + "/" if str(rel.parent) != "." else "")
    return [p.lstrip("/") for p in found] + EXTRA


async def run(port: int) -> int:
    from playwright.async_api import async_playwright

    failures = 0
    cut = set()
    total = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width in (390, 320):
            for scheme in ("light", "dark"):
                ctx = await browser.new_context(viewport={"width": width, "height": 900}, color_scheme=scheme)
                page = await ctx.new_page()
                for rel in pages():
                    await page.goto(f"http://127.0.0.1:{port}/{rel}", wait_until="load")
                    if "seed-calculator" in rel:
                        await page.wait_for_timeout(150)
                    data = await page.evaluate(MEASURE)
                    if data["example"]:
                        failures += 1
                        print(f"FAIL {rel} shows Example photo text")
                    for c in data["credits"]:
                        total += 1
                        if c["height"] > c["lh"] * 1.5:
                            failures += 1
                            print(f"FAIL {width}px {scheme} {rel}: credit wraps ({c['height']:.0f}px tall): {c['text']}")
                        if c["font"] < 12:
                            failures += 1
                            print(f"FAIL {width}px {scheme} {rel}: credit is {c['font']}px: {c['text']}")
                        if c["width"] < 40:
                            failures += 1
                            print(f"FAIL {width}px {scheme} {rel}: credit collapsed to {c['width']:.0f}px: {c['text']}")
                        if c["cut"]:
                            cut.add((width, rel, c["text"]))
                await ctx.close()
        await browser.close()
    for width, rel, text in sorted(cut):
        print(f"note {width}px {rel}: shortened with an ellipsis: {text}")
    print(f"credit line checks: {total} credit renders, {len(cut)} shortened with an ellipsis, {failures} failures")
    return failures


def main() -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a, **k: None
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        failures = asyncio.run(run(server.server_address[1]))
    finally:
        server.shutdown()
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
