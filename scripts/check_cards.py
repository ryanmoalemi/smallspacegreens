#!/usr/bin/env python3
"""Render every built page at 340 and 390 px, light and dark, and check every card the way a
phone reader sees it (Ryan, 2026-11-11: "The text title is sitting right on top of the body text
doesn't look like a polished card should look").

Fails when, inside any card:
- a heading sits less than 6px above the next line of text,
- a photo credit has less than 4px above it or 6px below it, or is squeezed out of sight,
- a line of text is narrower than 150px (two cramped columns on a phone),
- a product card (anything with a store button or a sponsored store address) has no visible store button,
- a product card on a phone is not full width,
- any text is under 12px,
- the page spills sideways.

Needs Playwright with Chromium. Usage: python3 scripts/check_cards.py
"""
from __future__ import annotations

import functools
import http.server
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CARD_SELECTOR = ".pick, .fact-card, .setup-choice-card, .library-card, .story-card, .space-photo-card, .story-teaser, .result-pack"
EXTRA_STATES = [
    "tools/microgreens-seed-calculator/?crop=radish&tray=10x20&n=1",
    "tools/microgreens-seed-calculator/?crop=mustard&tray=10x20&n=1&example=1",
    "gear/?setup=kit",
    "gear/?setup=tray",
    "gear/?setup=reuse",
]

AUDIT = """async () => {
  document.querySelectorAll('details').forEach(d => d.open = true);
  await new Promise(r => setTimeout(r, 50));
  const shown = el => el.offsetParent !== null && el.getClientRects().length;
  const out = [];
  const label = c => ((c.querySelector('h2,h3,h4,.pick-name,strong') || c).innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  const cards = [...document.querySelectorAll(%s)].filter(shown);
  for (const card of cards) {
    const name = label(card);
    const flow = [...card.querySelectorAll('h2,h3,h4,p,figcaption,a.pick-cta,.result-pack-link,ul,img')].filter(shown);
    // heading gap
    for (const h of card.querySelectorAll('h2,h3,h4')) {
      if (!shown(h)) continue;
      const hb = h.getBoundingClientRect();
      const next = flow.find(e => !h.contains(e) && !e.contains(h) && e.getBoundingClientRect().top >= hb.top + hb.height / 2 && Math.abs(e.getBoundingClientRect().left - hb.left) < hb.width);
      if (next) {
        const gap = next.getBoundingClientRect().top - hb.bottom;
        if (gap < 5.5) out.push(name + ': heading has ' + gap.toFixed(1) + 'px above the next line');
      }
    }
    // credit breathing room
    for (const c of card.querySelectorAll('.pick-credit, .fact-credit, .photo-credit, .result-pack-credit')) {
      if (!shown(c)) continue;
      const cb = c.getBoundingClientRect();
      if (cb.width < 20) out.push(name + ': credit is squeezed to ' + cb.width.toFixed(0) + 'px wide');
      const img = [...card.querySelectorAll('img')].filter(shown).find(i => i.getBoundingClientRect().bottom <= cb.top + 1 && Math.abs(i.getBoundingClientRect().left - cb.left) < 40);
      if (img && cb.top - img.getBoundingClientRect().bottom < 3.5) out.push(name + ': credit sits ' + (cb.top - img.getBoundingClientRect().bottom).toFixed(1) + 'px under the photo');
      const next = flow.find(e => e !== c && !c.contains(e) && !e.contains(c) && e.tagName !== 'IMG' && e.getBoundingClientRect().top >= cb.bottom - 1 && Math.abs(e.getBoundingClientRect().left - cb.left) < 40);
      if (next && next.getBoundingClientRect().top - cb.bottom < 5.5) out.push(name + ': credit has ' + (next.getBoundingClientRect().top - cb.bottom).toFixed(1) + 'px below it');
    }
    // narrow text
    for (const t of card.querySelectorAll('h2,h3,h4,p')) {
      if (!shown(t) || !t.innerText.trim() || t.matches('.pick-credit,.fact-credit,.photo-credit,.pick-badge,.result-pack-credit')) continue;
      const w = t.getBoundingClientRect().width;
      if (w < 150 && t.innerText.trim().length > 24) out.push(name + ': text column only ' + w.toFixed(0) + 'px wide');
    }
    // store button
    const store = card.querySelector('a[rel~="sponsored"], a[href*="awin1.com"], a[href*="amazon.com"]');
    if (store) {
      const btn = [...card.querySelectorAll('a.pick-cta, .result-pack-link a, a.button')].filter(shown);
      if (!btn.length) out.push(name + ': store card has no store button');
      if (card.matches('.pick') && !card.closest('.route-picks') && innerWidth < 600) {
        const grid = card.parentElement.getBoundingClientRect();
        if (card.getBoundingClientRect().width < grid.width - 2) out.push(name + ': product card is not full width on a phone');
      }
    }
    for (const el of card.querySelectorAll('*')) {
      if (!shown(el) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) { out.push(name + ': ' + fs + 'px text in ' + (el.className || el.tagName)); break; }
    }
  }
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push('page spills sideways');
  return {cards: cards.length, problems: [...new Set(out)]};
}""" % repr(CARD_SELECTOR)


def pages() -> list[str]:
    found = []
    for path in sorted(ROOT.glob("**/index.html")):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(("src/", "node_modules/")):
            continue
        found.append(rel[: -len("index.html")])
    return found + EXTRA_STATES


def main() -> int:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}/"
    failures = 0
    total = 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in (340, 390):
            for scheme in ("light", "dark"):
                page = browser.new_context(viewport={"width": width, "height": 800}, color_scheme=scheme).new_page()
                for rel in pages():
                    page.goto(base + rel, wait_until="load")
                    page.wait_for_timeout(150)
                    result = page.evaluate(AUDIT)
                    total += result["cards"]
                    for problem in result["problems"]:
                        failures += 1
                        print(f"FAIL {width}px {scheme} /{rel}: {problem}")
                page.context.close()
        browser.close()
    server.shutdown()
    print(f"card checks: {total} card renders, {failures} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
