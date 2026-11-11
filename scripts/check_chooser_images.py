#!/usr/bin/env python3
"""Open /gear/ at 340 and 390 px, light and dark, pick each supply list in turn, and fail if any
shown supply card or list row has a photo that does not load, if a card shows no photo, if the
cards spill past the screen, or if any chooser text is under 12px.

Needs Playwright with Chromium (pip install playwright && playwright install chromium).
Usage: python3 scripts/check_chooser_images.py
"""
from __future__ import annotations

import functools
import http.server
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ("kit", "tray", "reuse")

STATE = """() => {
  const b = document.querySelector('.setup-builder');
  const shown = el => el.offsetParent !== null;
  const cards = [...b.querySelectorAll('.route-picks .pick')].filter(shown);
  const rows = [...b.querySelectorAll('[data-setup-panel]:not([hidden]) .supply-checks > li')];
  const bad = [];
  for (const el of [...cards, ...rows]) {
    const img = el.querySelector('img');
    const name = (el.querySelector('.pick-name, strong, label') || el).innerText.trim().slice(0, 40);
    if (!img) { bad.push(name + ': no photo'); continue; }
    if (!img.complete || img.naturalWidth === 0) bad.push(name + ': photo did not load (' + img.currentSrc.split('/').pop() + ')');
  }
  let minFont = 99, minEl = '';
  for (const el of b.querySelectorAll('*')) {
    if (!shown(el) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < minFont) { minFont = fs; minEl = el.className || el.tagName; }
  }
  return {cards: cards.length, rows: rows.length, bad, minFont, minEl,
          overflow: document.documentElement.scrollWidth > innerWidth,
          status: (document.getElementById('route-picks-status') || {}).innerText || ''};
}"""


def main() -> int:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}/gear/"
    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (340, 390):
            for scheme in ("light", "dark"):
                page = browser.new_context(viewport={"width": width, "height": 800}, color_scheme=scheme).new_page()
                page.goto(base)
                for route in ROUTES:
                    page.locator(f'input[name="setup-route"][value="{route}"]').check(force=True)
                    # Bring every shown card and row on screen, the way a reader scrolls past them.
                    for el in page.locator('.route-picks .pick:visible img, [data-setup-panel]:not([hidden]) .supply-checks img').all():
                        el.scroll_into_view_if_needed()
                    page.wait_for_function(
                        "() => [...document.querySelectorAll('.setup-builder img')].filter(i => i.offsetParent).every(i => i.complete)",
                        timeout=15000,
                    )
                    state = page.evaluate(STATE)
                    label = f"{width}px {scheme} {route}"
                    problems = list(state["bad"])
                    if state["cards"] < 3:
                        problems.append(f"only {state['cards']} supply cards shown")
                    if state["overflow"]:
                        problems.append("page scrolls sideways")
                    if state["minFont"] < 12:
                        problems.append(f"text under 12px ({state['minFont']}px, {state['minEl']})")
                    if "example" in state["status"].lower():
                        problems.append("status line uses the word example")
                    if problems:
                        failures += 1
                        print(f"FAIL {label}: {problems}")
                    else:
                        print(f"ok {label}: {state['cards']} cards, {state['rows']} rows, all photos loaded")
                page.close()
        browser.close()
    server.shutdown()
    if failures:
        print(f"chooser image checks: {failures} failures")
        return 1
    print("chooser image checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
