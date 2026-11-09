#!/usr/bin/env python3
"""Build the Small Space Greens static site into the repository root."""

from __future__ import annotations

import json
import hashlib
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
    ("Start here", f"{SITE}/guides/microgreens-in-a-small-apartment/", "/guides/microgreens-in-a-small-apartment/"),
    ("Growing guides", f"{SITE}/guides/", "/guides/"),
    ("Find your setup", f"{SITE}/gear/", "/gear/"),
    ("About", f"{SITE}/about/", "/about/"),
    ("Seed calculator ↗", f"{SITE}/tools/microgreens-seed-calculator/", "/tools/microgreens-seed-calculator/"),
]

BRAND_MARK = '<svg viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M20 43V15" stroke="currentColor" stroke-width="1.8"/><path d="M20 29C7 30 3 21 4 13c11 0 16 7 16 16Z" fill="currentColor"/><path d="M20 20C31 21 36 13 35 5c-11 0-15 7-15 15Z" fill="currentColor"/><path d="M7 43h26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
BRAND = BRAND_MARK + '<span class="brand-wordmark">small space<small>GREENS</small></span>'
ARROW_UP = '<svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 16 16 4M5 4h11v11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_RIGHT = '<svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def asset_version(path: str) -> str:
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:12]

GUIDES = [
    {
        "slug": "microgreens-in-a-small-apartment",
        "title": "How to Grow Microgreens in an Apartment: Your First Tray",
        "description": "Start one edible microgreen tray in an apartment: crop, footprint, supplies, light, and a source-backed harvest window.",
        "h1": "How to grow microgreens in an apartment: your first tray",
        "dek": "Pick an edible crop, size the tray, and follow one published method. A lamp is optional until the window falls short.",
        "og": "apartment",
        "nav": "/guides/microgreens-in-a-small-apartment/",
    },
    {
        "slug": "microgreens-kit-vs-diy-cost",
        "title": "Microgreens Kit vs DIY: Compare Setup and Repeat Costs",
        "description": "Compare microgreens kits and DIY setups by what is included, space needed, upfront spending, and repeat costs. Choose the approach that fits your plans.",
        "h1": "Microgreens kit vs DIY: compare setup and repeat costs",
        "dek": "Compare the complete setup, refill costs, and daily work. Use a simple worksheet to price the kit or trays you are considering.",
        "og": "cost",
    },
    {
        "slug": "microgreens-seed-density-per-tray",
        "title": "Microgreens Seed Density by Crop and Tray Size",
        "description": "Look up published microgreen seed rates by crop, see which figures are crop-specific, and scale them to your tray.",
        "h1": "Microgreens seed density by crop and tray size",
        "dek": "Start with the crop and the tray. The calculator applies a published rate only when that rate is crop-specific.",
        "og": "density",
    },
    {
        "slug": "pea-vs-radish-microgreens",
        "title": "Pea Shoots vs Radish Microgreens: Which Should You Grow?",
        "description": "Choose between pea shoots and radish microgreens using published seed weight, soak time, harvest window, and flavor notes.",
        "h1": "Pea shoots vs radish microgreens: which should you grow?",
        "dek": "Radish is spicy and lighter on the scale. Pea is milder, soaked, and a much heavier sowing.",
        "og": "pea-radish",
    },
    {
        "slug": "windowsill-microgreens",
        "title": "Can You Grow Microgreens on a Windowsill? Light and Space",
        "description": "Decide whether your windowsill can grow a tray of microgreens, and when the published guidance says to add a lamp.",
        "h1": "Can you grow microgreens on a windowsill?",
        "dek": "Measure the sill, watch the stems, and add light only if the plants lean or stay pale.",
        "og": "windowsill",
    },
    {
        "slug": "apartment-seed-starting",
        "title": "Starting Vegetable Seeds in an Apartment: Light and Timing",
        "description": "Raise vegetable transplants in an apartment for a balcony or garden, with light, timing, and crops you should not eat as microgreens.",
        "h1": "Starting vegetable seeds in an apartment",
        "dek": "These plants are transplants. They need more light and more weeks than a tray of microgreens.",
        "og": "seed-starting",
    },
    {
        "slug": "bottom-watering-trays",
        "title": "How to Bottom Water Microgreens and Seed Trays",
        "description": "Bottom water a microgreen or seed tray: which tray has holes, where the water goes, and when to pour the extra out.",
        "h1": "How to bottom water microgreens and seed trays",
        "dek": "Wet the mix from below, then empty the reservoir. A moldy crop is discarded, not rescued by a lighter pour.",
        "og": "watering",
    },
    {
        "slug": "balcony-salad-garden",
        "title": "Plan a Balcony Salad Garden: Containers, Light, and Layouts",
        "description": "Plan a balcony salad with container sizes, sun hours, drainage, and layouts that match the light you actually have.",
        "h1": "Plan a balcony salad garden",
        "dek": "Match the crop to the hours of sun. Smaller pots are easier to move. They do not prove the balcony can hold the weight.",
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
    image = page.get("image", f"{SITE}/assets/og/home.jpg")
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
        scripts += '<script src="/js/signup.js"></script>'
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
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Small Space Greens">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
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


def signup_form(compact: bool) -> str:
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
    return f"""<section class="signup" aria-labelledby="signup-title">
{lead}
<form class="signup-form">
<div class="field">
<label for="signup-email">Email address</label>
<input id="signup-email" name="email" type="email" autocomplete="email" required>
</div>
<div class="hp">
<label for="website">Website</label>
<input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
</div>
<button class="button" type="submit">Email me the checklist</button>
<p class="signup-error" role="alert" hidden></p>
</form>
</section>
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
    html = add_heading_ids(html)
    html = open_first_faqs(html)
    html = collapse_sources(html)
    toc = guide_toc(html)
    idx = html.find("<h2")
    if idx == -1 or not toc:
        return html
    return (
        '<div class="guide-intro">' + html[:idx] + '</div>'
        + '<div class="guide-with-toc">'
        + toc
        + '<div class="guide-main">'
        + html[idx:]
        + "</div></div>"
    )


def step_strip() -> str:
    frames = [
        ("01-wash.svg", "1. Wash the tray", "Illustration of washing a shallow planting tray."),
        ("02-fill.svg", "2. Fill the mix", "Illustration of a tray filled with about 1 to 1.5 inches of mix."),
        ("03-sow.svg", "3. Sow the seed", "Illustration of seed scattered on the mix surface."),
        ("04-cover.svg", "4. Cover in the dark", "Illustration of a dark cover over a sown tray."),
        ("05-weight.svg", "5. Weight large seed", "Illustration of a weight on pea or sunflower seed."),
        ("06-light.svg", "6. Uncover into light", "Illustration of seedlings under light."),
        ("07-water.svg", "7. Water from below", "Illustration of a drained tray nested in a water tray."),
        ("08-cut.svg", "8. Cut above the mix", "Illustration of cutting seedlings above the mix and leaving the roots."),
    ]
    items = []
    for filename, label, alt in frames:
        items.append(
            "<li><figure>"
            f'<img src="/assets/diagrams/steps/{filename}" width="320" height="320" alt="{esc(alt)}" loading="lazy">'
            f"<figcaption>{esc(label)}</figcaption></figure></li>"
        )
    return (
        '<ol class="step-strip">'
        + "".join(items)
        + "</ol>"
        + '<p class="credit">Original illustrations of the method. Not photographs of a Small Space Greens tray.</p>'
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


def density_figure() -> str:
    return (
        '<figure class="photo">'
        '<img src="/assets/diagrams/seed-density.svg" width="880" height="520" loading="lazy" '
        'alt="Bar chart of Utah State seed grams per 10 by 20 inch tray. A separate bar shows the Maryland 10 to 15 gram example, labeled as not a crop rate.">'
        '<figcaption class="credit">Same crop rates as the calculator. Illustration, not a grow trial.</figcaption>'
        "</figure>"
    )


def write_density_chart() -> None:
    rates = json.loads((SRC / "rates.json").read_text())
    crops = [row for row in rates if "grams" in row and not row.get("needsRate")]
    crops.sort(key=lambda row: row["grams"])
    width = 880
    row_h = 36
    top = 78
    height = top + row_h * (len(crops) + 2) + 70
    max_g = max(row["grams"] for row in crops)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img">',
        "<title>Seed grams per 10 by 20 inch tray</title>",
        f'<rect width="{width}" height="{height}" fill="#f6f3ea"/>',
        '<text x="24" y="36" font-family="system-ui, Segoe UI, sans-serif" font-size="22" font-weight="700" fill="#1c2420">Grams per 10 by 20 inch tray</text>',
        '<text x="24" y="60" font-family="system-ui, Segoe UI, sans-serif" font-size="14" fill="#4e5a52">Utah State crop rates used by the calculator. Illustration, not a trial.</text>',
    ]
    for index, row in enumerate(crops):
        y = top + index * row_h
        bar = int(520 * row["grams"] / max_g)
        parts.append(
            f'<text x="24" y="{y + 16}" font-family="system-ui, Segoe UI, sans-serif" font-size="15" fill="#1c2420">{esc(row["name"])}</text>'
        )
        parts.append(f'<rect x="160" y="{y}" width="{bar}" height="20" fill="#245c40"/>')
        parts.append(
            f'<text x="{168 + bar}" y="{y + 16}" font-family="system-ui, Segoe UI, sans-serif" font-size="14" fill="#17382a">{row["grams"]} g</text>'
        )
    y = top + len(crops) * row_h + 8
    parts.append(
        f'<text x="24" y="{y + 18}" font-family="system-ui, Segoe UI, sans-serif" font-size="15" fill="#1c2420">Maryland example</text>'
    )
    parts.append(f'<rect x="160" y="{y + 4}" width="{int(520 * 15 / max_g)}" height="20" fill="#e7d7b8" stroke="#8a3e12"/>')
    parts.append(f'<rect x="160" y="{y + 4}" width="{int(520 * 10 / max_g)}" height="20" fill="#c4a574"/>')
    parts.append(
        f'<text x="{176 + int(520 * 15 / max_g)}" y="{y + 18}" font-family="system-ui, Segoe UI, sans-serif" font-size="14" fill="#8a3e12">10 to 15 g, not a crop rate</text>'
    )
    parts.append(
        f'<text x="24" y="{height - 24}" font-family="system-ui, Segoe UI, sans-serif" font-size="13" fill="#4e5a52">Source: Utah State University Extension grams per 1020 tray. The tan bar is University of Maryland Extension\'s general broadcast example for crops without a Utah State rate.</text>'
    )
    parts.append("</svg>")
    path = ROOT / "assets" / "diagrams" / "seed-density.svg"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(parts))


def disclosure() -> str:
    return (
        '<p class="disclosure">Independent, research-based guidance. '
        '<a href="/editorial-method/">Our editorial method</a> · '
        '<a href="/affiliate-disclosure/">How product links work</a>.</p>'
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
    page_image = f"{SITE}/assets/og/{guide.get('og', 'guides')}.jpg"
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
        + f"<p class=\"byline\">By <a href=\"/about/\">Ryan Moalemi</a>. Updated {DATE_LABEL}.</p>"
        + '</header>'
        + prepare_guide_body(body)
        + related_html(guide["slug"])
        + signup_form(True)
    )
    page = {
        "title": guide["title"],
        "description": guide["description"],
        "url": url,
        "kind": "article",
        "nav": guide.get("nav", "/guides/"),
        "image": page_image,
        "signup": True,
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
        if row.get("needsRate"):
            entry["needsRate"] = True
        elif "grams" in row:
            entry["grams"] = row["grams"]
        crops[row["id"]] = entry
    core = (SRC / "calc-core.js").read_text()
    logic = (SRC / "calculator.js").read_text()
    payload = "window.SSG_CROPS = " + json.dumps(crops, ensure_ascii=False) + ";\n"
    target = ROOT / "js" / "calculator.js"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(core + "\n" + payload + logic)


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
    for phrase in ["we tested", "in our tests", "we grew", "gardener's supply", "gardeners supply", "amazon.com", "johnny's", "johnnys selected"]:
        if phrase in lowered:
            raise SystemExit(f"{path} contains banned phrase: {phrase}")
    for banned in ("hamama.com", "bootstrapfarmer.com", "trueleafmarket.com"):
        if banned in lowered:
            raise SystemExit(f"{path} links a store that is not approved for the live site")
    for banned in ("True Leaf", "Bootstrap Farmer", "Hamama"):
        if banned in text:
            raise SystemExit(f"{path} names a product that is not approved for the live site")
    if re.search(r"amazon", lowered):
        raise SystemExit(f"{path} mentions Amazon")


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
        "windowsill-microgreens": ("/assets/diagrams/window-light.svg", "Light and space"),
        "microgreens-seed-density-per-tray": ("/assets/diagrams/seed-density.svg", "Seed planning"),
        "pea-vs-radish-microgreens": ("/assets/diagrams/harvest-windows.svg", "Choose a crop"),
        "bottom-watering-trays": ("/assets/diagrams/bottom-watering.svg", "Watering"),
        "apartment-seed-starting": ("/assets/diagrams/window-light.svg", "Seed starting"),
        "balcony-salad-garden": ("/assets/photos/lettuce-in-pot.jpg", "Balcony growing"),
        "microgreens-kit-vs-diy-cost": ("/assets/diagrams/kit-vs-diy.svg", "Supplies and cost"),
    }
    photo_credits = {
        "microgreens-in-a-small-apartment": {
            "alt": "Sunflower microgreens growing in a small clear tray on a white background.",
            "width": 960,
            "height": 810,
            "author": "Pannet",
            "author_url": "https://commons.wikimedia.org/wiki/User:Pannet",
            "source_url": "https://commons.wikimedia.org/wiki/File:Sunflower_microgreens_01.jpg",
            "license": "CC BY 4.0",
            "license_url": "https://creativecommons.org/licenses/by/4.0/",
            "note": "Reference photo, cropped; not a site trial.",
        },
        "balcony-salad-garden": {
            "alt": "One leaf lettuce plant in a white pot on a table indoors.",
            "width": 960,
            "height": 1280,
            "author": "Netha Hussain",
            "author_url": "https://commons.wikimedia.org/wiki/User:Netha_Hussain",
            "source_url": "https://commons.wikimedia.org/wiki/File:Leaf_lettuce_plant_in_a_pot_10.jpg",
            "license": "CC BY-SA 4.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
            "note": "Container lettuce reference photo, cropped; not a site trial.",
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
                    '<figcaption class="photo-credit">Photo by '
                    f'<a href="{esc(photo["author_url"])}">{esc(photo["author"])}</a> · '
                    f'<a href="{esc(photo["source_url"])}">Original</a> · '
                    f'<a href="{esc(photo["license_url"])}">{esc(photo["license"])}</a>. '
                    f'<span>{esc(photo["note"])}</span></figcaption>'
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
{cards(["microgreens-in-a-small-apartment","windowsill-microgreens","microgreens-seed-density-per-tray","pea-vs-radish-microgreens","bottom-watering-trays","apartment-seed-starting","balcony-salad-garden","microgreens-kit-vs-diy-cost"])}
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
    }
    tool_body = (SRC / "pages" / "calculator.html").read_text()
    tool_body = tool_body.replace("<!--CROP_OPTIONS-->", calculator_options())
    tool_body = tool_body.replace("<!--RATES_TABLE-->", rates_table())
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
        ("gear/index.html", "Microgreens Starter Setup: Kits, Trays and Supplies", "Compare a ready-to-sow kit, reusable trays, or a container you own. Check the full setup, refill costs, light, and daily work before you buy.", f"{SITE}/gear/", "/gear/", "Gear and comparisons", f"{SITE}/assets/og/gear.jpg", "gear.html", "wrap-wide"),
        ("editorial-method/index.html", "How Small Space Greens Chooses and Corrects Guides", "How sources are chosen, how product advice will be labeled, and how to send a correction.", f"{SITE}/editorial-method/", "", "Editorial method", f"{SITE}/assets/og/editorial.jpg", "editorial.html", ""),
        ("guides/first-tray-checklist/index.html", "First-Tray Checklist for Apartment Microgreens", "Print the first-tray checklist, or get the same list by email from Ryan after you confirm your address.", f"{SITE}/guides/first-tray-checklist/", "/guides/", "First-tray checklist", f"{SITE}/assets/og/checklist.jpg", "checklist.html", ""),
    ]
    for rel, title, desc, url, nav, crumb, image, filename, wrap in extra_pages:
        check_lengths(title, desc, rel)
        body = (
            (SRC / "pages" / filename)
            .read_text()
            .replace("<!--SIGNUP-->", signup_form(False))
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
        body = body.replace("<!--DENSITY_CHART-->", density_figure())
        for video_id in VIDEOS:
            body = body.replace(f"<!--VIDEO:{video_id}-->", video_embed(video_id))
        pages[f"guides/{guide['slug']}/index.html"] = article_page(guide, body)

    return pages


def main() -> None:
    css = minify_css((SRC / "styles.css").read_text())
    css_path = ROOT / "css" / "styles.css"
    css_path.parent.mkdir(parents=True, exist_ok=True)
    css_path.write_text(css + "\n")
    write_calculator_js()
    write_density_chart()
    signup_js = ROOT / "js" / "signup.js"
    signup_js.parent.mkdir(parents=True, exist_ok=True)
    signup_js.write_text((SRC / "signup.js").read_text())
    (ROOT / "js" / "site.js").write_text((SRC / "site.js").read_text())
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
            if not 700 <= count <= 2300:
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
