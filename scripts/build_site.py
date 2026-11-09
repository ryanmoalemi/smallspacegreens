#!/usr/bin/env python3
"""Build the Small Space Greens static site into the repository root."""

from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
INDEXNOW = "b4f866681f35e865697f0a735d534c00"
SITE = "https://smallspacegreens.com"
DATE = "2026-11-09"
DATE_LABEL = "November 9, 2026"
ORG_ID = f"{SITE}/#organization"
PERSON_ID = f"{SITE}/#ryan-moalemi"
SITE_ID = f"{SITE}/#website"

NAV = [
    ("Guides", f"{SITE}/guides/", "/guides/"),
    ("Calculator", f"{SITE}/tools/microgreens-seed-calculator/", "/tools/microgreens-seed-calculator/"),
    ("About", f"{SITE}/about/", "/about/"),
    ("Contact", f"{SITE}/contact/", "/contact/"),
]

GUIDES = [
    {
        "slug": "microgreens-in-a-small-apartment",
        "title": "Grow Microgreens in a Small Apartment, Step by Step",
        "description": "Set up a tray of microgreens on a shelf or counter. Steps, light, water, and harvest timing are drawn from university extension guides, not a diary.",
        "h1": "How to grow microgreens in a small apartment",
        "dek": "A tray, a soilless mix, and a bright spot are enough to start. Here is the sequence extension publications describe.",
    },
    {
        "slug": "microgreens-kit-vs-diy-cost",
        "title": "Microgreens Kit vs DIY Cost Ranges for Home Growers",
        "description": "Compare a microgreens kit with a do-it-yourself tray setup using labeled example price ranges and seed-cost snapshots from extension publications.",
        "h1": "Microgreens kit vs DIY: what the costs are made of",
        "dek": "The tray is a one-time purchase. Seed is the cost that returns with every sowing.",
    },
    {
        "slug": "microgreens-seed-density-per-tray",
        "title": "Microgreens Seed Density per Tray and How to Scale",
        "description": "See published grams of microgreen seed per 10 by 20 inch tray, why those figures differ, and how to scale a rate to a smaller container. Start there.",
        "h1": "Microgreens seed density per tray",
        "dek": "Extension charts do not all use the same tray. Read the tray size before you copy a gram number.",
    },
    {
        "slug": "pea-vs-radish-microgreens",
        "title": "Pea vs. Radish Microgreens: Time, Seed, and Flavor",
        "description": "Compare pea shoots and radish microgreens with extension figures for seed weight, soaking, days to harvest, and the flavor notes those guides give.",
        "h1": "Pea shoots vs radish microgreens",
        "dek": "Radish is a light sowing of a spicy green. Pea is a heavy sowing of a milder shoot.",
    },
    {
        "slug": "windowsill-microgreens",
        "title": "Grow Microgreens on a Windowsill: Light and Limits",
        "description": "Learn when a window is enough for microgreens, which crops tolerate weaker light, and when extension guides say it is time to add a lamp. Try it.",
        "h1": "Can you grow microgreens on a windowsill?",
        "dek": "Several extensions say yes, with a bright window. A lamp is the backup when stems lean hard toward the glass.",
    },
    {
        "slug": "apartment-seed-starting",
        "title": "Starting Vegetable Seeds in an Apartment, Step by Step",
        "description": "Start vegetable transplants in an apartment with containers, sterile mix, lights, a frost-date timeline, and a calm hardening-off routine. Begin inside.",
        "h1": "How to start vegetable seeds in an apartment",
        "dek": "Transplants need more light and more weeks than a tray of microgreens. The setup is still a shelf, not a yard.",
    },
    {
        "slug": "bottom-watering-trays",
        "title": "Bottom Watering Trays for Seedlings and Microgreens",
        "description": "See how bottom watering works for seedlings and microgreens, why extension guides prefer it, and how long to leave a tray sitting in water. Drain after.",
        "h1": "Bottom watering for trays and microgreens",
        "dek": "Water from below to wet the mix without soaking the leaves. Then let the tray drain.",
    },
    {
        "slug": "balcony-salad-garden",
        "title": "How to Plant a Salad Garden on an Apartment Balcony",
        "description": "Plan a balcony salad garden with container depths, hours of sun, a soilless mix, and salad crops sized for a small outdoor space. Match sun to crop.",
        "h1": "A balcony salad garden in containers",
        "dek": "Leafy greens need less sun than tomatoes. Drainage and pot size decide whether a balcony salad lasts.",
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
            f'<li><a href="/guides/{item}/">{esc(guide["h1"])}</a><p>{esc(guide["dek"])}</p></li>'
        )
    calc = '<li><a href="/tools/microgreens-seed-calculator/">Microgreens seed calculator</a><p>Scale a published 10 by 20 inch rate to your tray and estimate seed cost.</p></li>'
    return "<h2>Related guides</h2><ul class=\"related-list\">" + calc + "".join(items) + "</ul>"


def layout(page: dict, main: str, graph: list[dict]) -> str:
    title = page["title"]
    description = page["description"]
    canonical = page["url"]
    nav_html = []
    for label, _abs, href in NAV:
        current = ' aria-current="page"' if page.get("nav") == href else ""
        nav_html.append(f'<li><a href="{href}"{current}>{label}</a></li>')
    robots = page.get("robots", "index,follow")
    og_type = "article" if page["kind"] == "article" else "website"
    ld = {"@context": "https://schema.org", "@graph": graph}
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(canonical)}">
<meta name="robots" content="{robots}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Small Space Greens">
<meta property="og:image" content="{SITE}/favicon.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{SITE}/favicon.svg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Small Space Greens" href="/feed.xml">
<link rel="stylesheet" href="/css/styles.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="site-header">
<a class="skip" href="#content">Skip to content</a>
<div class="header-bar">
<a class="brand" href="/"><img src="/favicon.svg" width="28" height="28" alt="">Small Space Greens</a>
<nav class="nav" aria-label="Primary"><ul>{''.join(nav_html)}</ul></nav>
</div>
</header>
<main id="content" class="wrap {page.get('wrap', '')}">
{main}
</main>
<footer class="site-footer">
<div class="footer-bar">
<nav class="footer-nav" aria-label="Footer">
<a href="/privacy/">Privacy</a>
<a href="/affiliate-disclosure/">Affiliate Disclosure</a>
<a href="/contact/">Contact</a>
</nav>
<p class="copyright">© 2026 Small Space Greens</p>
</div>
</footer>
{page.get("scripts", "")}
</body>
</html>
"""


def disclosure() -> str:
    return (
        '<p class="disclosure">This page may later include affiliate links. '
        'If you buy through one, we may earn a commission at no extra cost to you. '
        '<a href="/affiliate-disclosure/">Affiliate disclosure</a>.</p>'
    )


def article_page(guide: dict, body: str) -> str:
    url = f"{SITE}/guides/{guide['slug']}/"
    crumbs = [
        ("Home", f"{SITE}/"),
        ("Guides", f"{SITE}/guides/"),
        (guide["h1"], url),
    ]
    faqs = extract_faqs(body)
    if len(faqs) < 3:
        raise SystemExit(f"{guide['slug']} needs at least 3 FAQs, found {len(faqs)}")
    graph = base_graph()
    graph.append(crumbs_ld(crumbs))
    graph.append(
        {
            "@type": "Article",
            "headline": guide["h1"],
            "description": guide["description"],
            "datePublished": DATE,
            "dateModified": DATE,
            "author": {"@id": PERSON_ID},
            "publisher": {"@id": ORG_ID},
            "mainEntityOfPage": url,
            "image": f"{SITE}/favicon.svg",
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
        + disclosure()
        + f"<h1>{esc(guide['h1'])}</h1>"
        + f"<p class=\"dek\">{esc(guide['dek'])}</p>"
        + f"<p class=\"byline\">By <a href=\"/about/\">Ryan Moalemi</a>. Updated {DATE_LABEL}.</p>"
        + body
        + related_html(guide["slug"])
    )
    page = {
        "title": guide["title"],
        "description": guide["description"],
        "url": url,
        "kind": "article",
        "nav": "/guides/",
    }
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


def rates_table() -> str:
    rates = json.loads((SRC / "rates.json").read_text())
    rows = []
    for row in rates:
        rows.append(
            "<tr>"
            f"<td data-label=\"Crop\">{esc(row['name'])}</td>"
            f"<td data-label=\"Seed per 10 by 20 inch tray\">{esc(rate_label(row))}</td>"
            f"<td data-label=\"What this number is\">{esc(row['kind'])}</td>"
            f"<td data-label=\"Soak and timing\">{esc(row['presoak'])} {esc(row['timing'])}</td>"
            "</tr>"
        )
    return (
        "<div class=\"responsive-table\"><table>"
        "<thead><tr><th>Crop</th><th>Seed per 10 by 20 inch tray</th><th>What this number is</th><th>Soak and timing</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table></div>"
    )


def calculator_options() -> str:
    rates = json.loads((SRC / "rates.json").read_text())
    return "\n".join(
        f'<option value="{esc(row["id"])}">{esc(row["name"])}</option>' for row in rates
    )


def write_calculator_js() -> None:
    rates = json.loads((SRC / "rates.json").read_text())
    crops = {}
    for row in rates:
        entry = {"name": row["name"], "source": row["source"], "note": row["note"]}
        if "grams" in row:
            entry["grams"] = row["grams"]
        else:
            entry["low"] = row["low"]
            entry["high"] = row["high"]
        crops[row["id"]] = entry
    logic = (SRC / "calculator.js").read_text()
    payload = "window.SSG_CROPS = " + json.dumps(crops, ensure_ascii=False) + ";\n"
    target = ROOT / "js" / "calculator.js"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload + logic)


def guide_list(include_dek: bool = True) -> str:
    items = []
    for guide in GUIDES:
        dek = f"<p>{esc(guide['dek'])}</p>" if include_dek else ""
        items.append(f'<li><a href="/guides/{guide["slug"]}/">{esc(guide["h1"])}</a>{dek}</li>')
    return f'<ul class="guide-list">{"".join(items)}</ul>'


def check_copy(path: Path, text: str) -> None:
    for bad in ["\u2014", "\u2013"]:
        if bad in text:
            raise SystemExit(f"{path} contains a dash character that is not a hyphen")
    lowered = text.lower()
    for phrase in ["we tested", "in our tests", "we grew", "gardener's supply", "gardeners supply", "amazon.com", "johnny's", "johnnys selected", "true leaf market"]:
        if phrase in lowered:
            raise SystemExit(f"{path} contains banned phrase: {phrase}")
    if "True Leaf" in text:
        raise SystemExit(f"{path} names a seed brand")
    if re.search(r"amazon", lowered):
        raise SystemExit(f"{path} mentions Amazon")


def check_lengths(title: str, description: str, label: str) -> None:
    if not 50 <= len(title) <= 60:
        raise SystemExit(f"{label} title length {len(title)}: {title}")
    if not 140 <= len(description) <= 155:
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
<pubDate>Mon, 09 Nov 2026 00:00:00 GMT</pubDate>
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
<lastBuildDate>Mon, 09 Nov 2026 00:00:00 GMT</lastBuildDate>
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

    home_title = "Small Space Greens: How-To Guides for Small Spaces"
    home_desc = "Neutral how-to guides for microgreens and small-space gardening, plus a tray seed calculator. Sources are linked extension publications. Begin here."
    check_lengths(home_title, home_desc, "home")
    home_body = (SRC / "pages" / "home.html").read_text().replace("<!--GUIDE_LIST-->", guide_list())
    home = {
        "title": home_title,
        "description": home_desc,
        "url": f"{SITE}/",
        "kind": "home",
        "nav": "",
        "crumbs": [("Home", f"{SITE}/")],
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
    privacy_desc = "How Small Space Greens handles analytics, cookies, affiliate tracking cookies, and email sent to ryan@smallspacegreens.com. Dated November 2026."
    check_lengths(privacy_title, privacy_desc, "privacy")
    privacy = {
        "title": privacy_title,
        "description": privacy_desc,
        "url": f"{SITE}/privacy/",
        "kind": "page",
        "nav": "",
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
        "crumbs": [("Home", f"{SITE}/"), ("Affiliate disclosure", f"{SITE}/affiliate-disclosure/")],
    }
    pages["affiliate-disclosure/index.html"] = simple_page(
        affiliate, (SRC / "pages" / "affiliate.html").read_text()
    )

    guides_title = "Small-Space Gardening Guides from Small Space Greens"
    guides_desc = "Eight practical guides on apartment microgreens, seed density, windowsills, seed starting, bottom watering, and a balcony salad garden. Pick one."
    check_lengths(guides_title, guides_desc, "guides")
    guides_page = {
        "title": guides_title,
        "description": guides_desc,
        "url": f"{SITE}/guides/",
        "kind": "page",
        "nav": "/guides/",
        "crumbs": [("Home", f"{SITE}/"), ("Guides", f"{SITE}/guides/")],
        "wrap": "wrap-wide",
    }
    guides_body = f"""<h1>Guides</h1>
<p class="dek">Each guide answers one job: a tray in an apartment, a cost comparison, a windowsill, a balcony salad, or the watering step those setups share.</p>
<p>The pages cite university extension publications and link those sources. They are not grow diaries. A <a href="/tools/microgreens-seed-calculator/">seed calculator</a> scales the published 10 by 20 inch rates to other tray sizes.</p>
{guide_list()}
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
        "scripts": '<script src="/js/calculator.js"></script>',
    }
    tool_body = (SRC / "pages" / "calculator.html").read_text()
    tool_body = tool_body.replace("<!--CROP_OPTIONS-->", calculator_options())
    tool_body = tool_body.replace("<!--RATES_TABLE-->", rates_table())
    tool_body = disclosure() + tool_body
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
        "crumbs": [("Home", f"{SITE}/"), ("Page not found", f"{SITE}/404.html")],
    }
    pages["404.html"] = simple_page(missing, (SRC / "pages" / "404.html").read_text())

    for guide in GUIDES:
        check_lengths(guide["title"], guide["description"], guide["slug"])
        body = (SRC / "guides" / f"{guide['slug']}.html").read_text()
        pages[f"guides/{guide['slug']}/index.html"] = article_page(guide, body)

    return pages


def main() -> None:
    css = minify_css((SRC / "styles.css").read_text())
    css_path = ROOT / "css" / "styles.css"
    css_path.parent.mkdir(parents=True, exist_ok=True)
    css_path.write_text(css + "\n")
    write_calculator_js()
    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    (assets / "photo-soon.svg").write_text((SRC / "photo-soon.svg").read_text())
    pages = render_static_pages()
    urls = []
    for rel, document in pages.items():
        check_copy(Path(rel), document)
        target = ROOT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(document)
        if rel != "404.html":
            if rel == "index.html":
                urls.append(f"{SITE}/")
            else:
                urls.append(SITE + "/" + rel.replace("index.html", ""))
        if rel.startswith("guides/") and rel.endswith("/index.html") and rel != "guides/index.html":
            count = word_count_main(document)
            print(f"words {rel}: {count}")
            if not 1000 <= count <= 1800:
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
            hrefs.add(href.split("#")[0])
    missing = []
    for href in sorted(hrefs):
        if href in {"/", "/feed.xml", "/favicon.svg", "/css/styles.css", "/assets/photo-soon.svg"}:
            continue
        candidate = href.strip("/") + "/index.html"
        direct = href.strip("/")
        if candidate not in files and direct not in files and not (ROOT / direct).exists():
            missing.append(href)
    if missing:
        raise SystemExit("Missing internal targets: " + ", ".join(missing))
    print("built", len(pages), "pages")
    print("indexnow", INDEXNOW)


if __name__ == "__main__":
    main()
