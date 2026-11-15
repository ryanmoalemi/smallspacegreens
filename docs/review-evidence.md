# Shared review evidence store

Both finders use the same source index and matching code. General changes must ship to both.

`data/reviews/evidence.json` is the versioned source of truth. `scripts/build_review_store.py` validates it, imports it into local SQLite (`data/reviews/evidence.sqlite3`) and exports a read-only browser index. SQLite is regenerated, not committed. No remote database service was provisioned. The existing GitHub Pages site remains static.

Initial import: 12 selected Reddit discussion excerpts retrieved November 15, 2026. These are selected search-returned thread excerpts, not complete threads, exhaustive comment imports, verified buyers, or exact-product endorsements. Source URLs, publication/retrieval dates, summaries, contextual limitations, crop and space tags are stored. No usernames or profiles are collected.

Amazon: no review text imported. Retrieval was blocked by robots.txt. Import requires accessible review data/export with exact catalog product IDs, source URLs, retrieval dates and excerpts. Do not display Amazon-review claims until corresponding records exist.

Each final selection re-filters the saved records by crop and space. Amazon entries additionally require exact recommended product IDs. It does not fetch live websites, run live AI research, or change the horticultural recommendation engine. The reveal links to the saved sources and identifies their date. Paths without relevant records go straight to results; paths with fewer than four records show fewer questions. No invented filler or fake review counts.

To add evidence, add sourced records using the existing schema, then run `python scripts/build_review_store.py`, `node scripts/check_reviews.js`, and the normal site builds. Set status to removed to exclude a record. Preserve mixed findings in stored summaries, rather than treating anecdotes as consensus.

## Revised reveal contract
Exactly three evidence questions: one Reddit growing-experience question, one exact-product Amazon buyer question, and one lessons-learned social question, followed by the personalized product-picking line. If any evidence slot is missing, skip the animation. Amazon coverage is currently empty, so the four-stage reveal is not active. This prevents the superseded four-Reddit-question version from appearing.

API candidates checked November 15, 2026:
- Rainforest product API top_reviews: https://docs.trajectdata.com/rainforestapi/product-updates . Their reviews_v2 endpoint was deprecated; test product top reviews with exact catalog ASINs before choosing a plan.
- Canopy: https://www.canopyapi.co/amazon-reviews-api . Review bodies and pagination documented. US requests require an Amazon session cookie in addition to the API key; do not put credentials in source, browser bundles or chat.
- DataForSEO dedicated reviews endpoint currently marked temporarily unavailable; do not build on it.
No provider subscription, credentials, or live sample request has been obtained.

## Catalog research import, November 15
Research corpus: 57 Reddit discussion sources, retained as returned by web search, with dated post/comment excerpts split into SQLite tables. `research_threads`, `research_excerpts`, `research_product_links`, and `catalog_coverage` support per-item lookup. `data/reviews/coverage.json` records counts and gaps. These candidate excerpts are not automatically exported to the public finder or treated as exact-product reviews. No user profiles collected.

Rainforest test: product request for VIVOSUN ASIN B00TF9E6XE with the public documentation's demo key returned HTTP 401 asking for a plan/free trial. RAINFOREST_API_KEY is absent. No Amazon reviews imported, no account created, and no charges incurred. This is an authentication blocker, not a confirmed retrieval failure with a valid account.
