"""Photo pick cards. Image paths and copy come from src/placements/*.json."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLACEMENTS = ROOT / "src" / "placements"
AMAZON_HREF = re.compile(r"https://www\.amazon\.com/dp/([A-Z0-9]{10})\?tag=smallspaceg04-20\Z")


def esc(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def load_placement(name: str) -> dict:
    path = PLACEMENTS / f"{name}.json"
    if not path.is_file():
        raise SystemExit(f"Missing placements file: {path}")
    data = json.loads(path.read_text())
    images = data["images"]
    cards = data["cards"]
    for image in images.values():
        slug = image["slug"]
        for size in (300, 600):
            file_path = ROOT / "assets" / "products" / f"{slug}-{size}.webp"
            if not file_path.is_file():
                raise SystemExit(f"Missing product image {file_path}")
    for section in data["sections"]:
        for card_id in section["cards"]:
            if card_id not in cards:
                raise SystemExit(f"{name}: unknown card {card_id}")
            if cards[card_id]["image"] not in images:
                raise SystemExit(f"{name}: card {card_id} has no image record")
    return data


def all_placements() -> list[dict]:
    if not PLACEMENTS.is_dir():
        return []
    return [load_placement(path.stem) for path in sorted(PLACEMENTS.glob("*.json"))]


def href_for(card: dict, letpot: dict[str, str], trueleaf: dict[str, str]) -> str:
    kind = card["kind"]
    if kind == "amazon":
        asin = card["asin"]
        url = f"https://www.amazon.com/dp/{asin}?tag=smallspaceg04-20"
        if not AMAZON_HREF.fullmatch(url):
            raise SystemExit(f"Bad Amazon ASIN: {asin}")
        return url
    if kind == "letpot":
        return letpot[card["href_key"]]
    if kind == "trueleaf":
        return trueleaf[card["href_key"]]
    raise SystemExit(f"Unknown card kind: {kind}")


def render_picks(name: str, letpot: dict[str, str], trueleaf: dict[str, str]) -> str:
    data = load_placement(name)
    blocks = []
    seen_images: set[str] = set()
    for section in data["sections"]:
        cards_html = []
        for card_id in section["cards"]:
            card = data["cards"][card_id]
            image = data["images"][card["image"]]
            slug = image["slug"]
            if slug in seen_images:
                raise SystemExit(f"{name}: image {slug} is used more than once")
            seen_images.add(slug)
            if len(card["why"]) > 70:
                raise SystemExit(f"{name}: why line for {card_id} is {len(card['why'])} characters")
            url = href_for(card, letpot, trueleaf)
            src = f"/assets/products/{slug}-600.webp"
            srcset = f"/assets/products/{slug}-300.webp 300w, /assets/products/{slug}-600.webp 600w"
            official = image.get("official") == "letpot"
            img_class = ' class="letpot-photo"' if official else ""
            if official:
                caption = '<figcaption class="pick-credit">Photo: LetPot</figcaption>'
            else:
                caption = (
                    f'<figcaption class="pick-credit">Credit: '
                    f'<a href="/photo-credits/#{esc(image["credit_id"])}">{esc(image["author"])}</a>'
                    "</figcaption>"
                )
            cards_html.append(
                "<li class=\"pick\">"
                f'<figure class="pick-media{" pick-media-letpot" if official else ""}">'
                f'<img{img_class} src="{esc(src)}" srcset="{esc(srcset)}" '
                'sizes="(min-width: 1024px) 240px, (min-width: 720px) 30vw, 46vw" '
                'width="600" height="600" loading="lazy" decoding="async" '
                f'alt="{esc(image["alt"])}">'
                f"{caption}</figure>"
                f'<p class="pick-badge">{esc(card["badge"])}</p>'
                f'<h3 class="pick-name"><span class="pick-brand">{esc(card["brand"])}</span> '
                f'{esc(card["short"])}</h3>'
                f'<p class="pick-why">{esc(card["why"])}</p>'
                f'<a class="pick-cta" href="{esc(url)}" rel="sponsored nofollow noopener" target="_blank">'
                f'{esc(card["cta"])}<span class="sr-only"> (opens in a new tab)</span></a>'
                "</li>"
            )
        blocks.append(
            f'<section class="picks" id="{esc(section["id"])}" aria-labelledby="{esc(section["id"])}-title">'
            f'<h2 id="{esc(section["id"])}-title">{esc(section["title"])}</h2>'
            + (f'<p class="picks-lead">{esc(section["lead"])}</p>' if section.get("lead") else "")
            + '<ul class="pick-grid" role="list">'
            + "".join(cards_html)
            + "</ul></section>"
        )
    return "".join(blocks)


def render_credits() -> str:
    blocks = []
    seen: set[str] = set()
    try:
        import shop_placements
        shop_credit_ids = {f"supply-{slug}" for slug in shop_placements.SUPPLY_IMAGES}
    except Exception:
        shop_credit_ids = set()
    for data in all_placements():
        for image in data["images"].values():
            credit_id = image["credit_id"]
            if credit_id in seen or credit_id in shop_credit_ids:
                continue
            seen.add(credit_id)
            slug = image["slug"]
            src = f"/assets/products/{slug}-600.webp"
            blocks.append(
                f'<section class="photo-credit-entry" id="{esc(credit_id)}">'
                f'<img src="{esc(src)}" width="600" height="600" alt="{esc(image["alt"])}" '
                'loading="lazy" decoding="async">'
                "<div>"
                f'<h2>{esc(image["title"])}</h2>'
                f'<p><strong>Photographer:</strong> <a href="{esc(image["author_url"])}">{esc(image["author"])}</a>.</p>'
                f'<p><strong>Original:</strong> <a href="{esc(image["source_url"])}">{esc(image["source_label"])}</a>.</p>'
                f'<p><strong>License:</strong> <a href="{esc(image["license_url"])}">{esc(image["license"])}</a>.</p>'
                f'<p><strong>Image use:</strong> {esc(image["note"])}</p>'
                "</div></section>"
            )
    try:
        import shop_placements
        extra = shop_placements.supply_credit_html()
    except Exception:
        extra = ""
    if extra:
        blocks.append(extra)
    return "\n".join(blocks)


def apply_placeholders(html: str, letpot: dict[str, str], trueleaf: dict[str, str]) -> str:
    def repl(match: re.Match) -> str:
        return render_picks(match.group(1), letpot, trueleaf)

    html = re.sub(r"<!--PICKS:([a-z0-9-]+)-->", repl, html)
    if "<!--PICKS:" in html:
        raise SystemExit("Unresolved picks placeholder")
    if "<!--PRODUCT_CREDITS-->" in html:
        html = html.replace("<!--PRODUCT_CREDITS-->", render_credits())
    return html


def check_document(path: str, text: str) -> None:
    if "m.media-amazon.com" in text.lower() or "images-amazon.com" in text.lower():
        raise SystemExit(f"{path} contains an Amazon image host")
    for href in re.findall(r"https://www\.amazon\.com[^\"'\s<]*", text):
        bare = html.unescape(href)
        if not AMAZON_HREF.fullmatch(bare):
            raise SystemExit(f"{path} has an unapproved Amazon URL: {bare}")
    for section in re.findall(r'<section class="picks".*?</section>', text, flags=re.S):
        if "<table" in section.lower():
            raise SystemExit(f"{path} has a table inside product cards")
        if "$" in section.split("<ul", 1)[-1]:
            raise SystemExit(f"{path} has a price inside a product card")
        for card in re.findall(r'<li class="pick">.*?</li>', section, flags=re.S):
            if "<img " not in card:
                raise SystemExit(f"{path} has a product card without an image")
            figure = card.split("</figure>", 1)[0]
            if "<a " in figure[: figure.find("<img")]:
                raise SystemExit(f"{path} wraps a product photo in a link")
            cta = re.search(r'<a class="pick-cta"([^>]*)>', card)
            if not cta:
                raise SystemExit(f"{path} has a product card without a button")
            attrs = cta.group(1)
            rel = re.search(r'rel="([^"]*)"', attrs)
            rel_parts = rel.group(1).split() if rel else []
            if "sponsored" not in rel_parts or "nofollow" not in rel_parts:
                raise SystemExit(f"{path} product button is missing rel sponsored nofollow")
            if "amazon.com" in attrs and "tag=smallspaceg04-20" not in html.unescape(attrs):
                raise SystemExit(f"{path} Amazon button is missing the associate tag")
