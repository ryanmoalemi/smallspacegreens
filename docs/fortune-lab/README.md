# Fortune Lab: three working concepts

Prepared November 22, 2026. This is a reviewable product demo with functional quizzes, personalized results, free report previews and real merchant destinations. Prices, audiences and conversion rates are proposed tests; demand and profitability have not been established.

## Open the demos

The site is mounted under `/fortune-lab/`. The existing site's main pages can continue to operate alongside it.

| Route | Concept | Working experience | Proposed revenue |
| --- | --- | --- | --- |
| `/fortune-lab/destiny/` | Astraline | Personal chart or explicit birth-date reflection; tailored prompts; printable personal blueprint | Test a $19 one-time expanded report, then relevant journal referrals |
| `/fortune-lab/compatibility/` | Orbit Two | Two birthdays, relationship context and conversation preferences; pair reading; seven-day conversation report | Test a $19 pair report; consider a richer $29 gift version later; couples-card or journal referrals |
| `/fortune-lab/starseed/` | Starseed Rituals | Symbolic archetype quiz; practical ritual plan; tea, journal or card recommendations | Approved product commissions and a possible $9 original ritual workbook |

The collection page is `/fortune-lab/`. The owner comparison and interactive economics calculator are at `/fortune-lab/business.html`. Methods, product sources and license notices are linked from `/fortune-lab/credits.html`.

## What creates the readings

**Astraline uses a real traditional chart calculator when a birth time is supplied.** The browser bundle contains the MIT-licensed core from [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu/tree/39c0abd3b8dac609975dddfadd4d4e1d3a978deb), pinned to commit `39c0abd3b8dac609975dddfadd4d4e1d3a978deb`, with its required runtime dependencies. It calculates the 12 palaces. The featured English archetype simplifies the chart to a principal Life Palace star; an empty Life Palace explicitly uses its opposite palace's stars.

This first version uses entered local clock time, the source engine's split leap-month convention and next-day charting for 23:00–23:59. It does not automatically correct birthplace, longitude, historical timezone or daylight saving. Those choices matter near chart boundaries and need a deliberate production decision. Unknown birth time produces a clearly labeled digit-sum numerology reflection; no natal chart is guessed.

**Orbit Two uses numerology plus chosen preferences.** It adds the Gregorian birth-date digits and reduces the sum, retaining 11, 22 and 33 when encountered. Relationship type, selected focus and each person's conversation preference change the result and prompts. It gives no invented compatibility percentage.

**Starseed Rituals uses answer-based archetype matching.** Pleiadian, Sirian, Arcturian and Andromedan labels are symbolic entertainment themes. Activity, time and product preferences provide the practical match. They are not evidence of extraterrestrial ancestry. Tea recommendations use ingredient, flavor and caffeine information without health or supernatural-effect claims.

All English interpretations, questions and plans are original editorial content. No LLM or external reading API generates results at runtime. The demos do not use the upstream interpretation dataset or lecture corpus. A functioning chart algorithm does not establish scientific predictive validity.

## Commercial status

All complete report previews are free. Payment processing, email collection, affiliate tracking, advertising pixels, retargeting and recurring billing are inactive. Merchant links are ordinary direct product links. Names, birthdays and answers remain in tab memory and are not placed in share URLs or sent to a server. Downloads and copies are user initiated. Hosting providers and external merchants have their own request handling and privacy terms.

The [Art of Tea program](https://www.artoftea.com/pages/affiliates) publicly advertises 10% commission; its [AWIN listing](https://ui.awin.com/merchant-profile/85315) lists 30-day attribution. The [Intelligent Change direct creator program](https://www.intelligentchange.com/pages/ic-partner-program) advertises 10%, with eligibility requirements; its separate publisher route needs confirmation. Enrollment and account acceptance remain unconfirmed. [Keen](https://www.keen.com/affiliate) is a possible later referral partner, with no verified numerical bounty in the base case. Hay House product references currently have no connected retail affiliate program. Confirm current terms and approved links before relying on any commission.

## Economics: what the calculator means

The calculator models expected values, so fractional orders are intentional. It deducts modeled processing fees, a report refund reserve and per-order costs. Affiliate revenue is before reversals or network adjustments. Fixed costs and tax are excluded. The illustrative fee baseline uses [Stripe's US domestic-card pricing](https://stripe.com/pricing?locale=en-US); eligibility and actual account terms are unconfirmed.

The default 1,000 visitors, 65% completion and 3% report purchase rate imply 19.5 report orders. At $19, with the displayed fees, refund reserve and per-order allowance, report contribution is **$325.63**. Assumed affiliate revenue adds **$35.10**, making contribution before ads **$360.73**, or approximately **$0.361 per visitor**. At $0.40 advertising cost per visitor, contribution after ads is **−$39.27**. Affiliate-only revenue at those same funnel assumptions is **$0.0351 per visitor**. These are arithmetic examples, not forecasts or suggested advertising bids.

The exported `calculateEconomics` function supports checks without a browser. Default arithmetic, a zero-price affiliate-only scenario, zero visitors, changing ad costs and retained fees on modeled refunds have been checked. Negative contribution before ads is displayed as no possible break-even advertising cost at those inputs.

## Maintain and rebuild

Frontend source is in `fortune-lab/` at the repository root: each concept owns its HTML/JavaScript/CSS; shared UI helpers are in `assets/common.js`, shared styles in `assets/shared.css`, and the business calculator in `assets/business.js`. It is a static site and can be served by an ordinary web server. Use HTTP for local review because the pages use JavaScript modules.

The maintainable chart-engine source belongs in `docs/fortune-lab/engine/`. Read its `README.md` for the adapter contract, conventions and tests. Keep the pinned source files, lockfile, build script and license files together. From that directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm test
```

After rebuilding, copy `dist/chart-engine.js`, `dist/chart-engine.js.LEGAL.txt`, `dist/THIRD_PARTY_LICENSES.txt` and `dist/LICENSE-ziwei-doushu.txt` into the site's `fortune-lab/assets/`. Retain the license notices with the public bundle. The complete upstream reference archive includes mixed-license materials and should remain a reference download rather than being published wholesale in the commercial site.

## Decisions before a paid launch

1. Choose the first concept and make the paid report valuable enough to justify its proposed price. Astraline is the first direct-revenue hypothesis to test.
2. Decide the chart-time convention and whether to add birthplace/timezone correction before selling chart-based reports.
3. Confirm payment-provider eligibility; implement server-verified payment, receipt, report fulfillment and refunds. No client-side button should imply an unverified successful payment.
4. Obtain affiliate acceptance and replace only relevant merchant destinations with approved product-specific tracking links. Confirm geography, permitted traffic, attribution and reversal rules.
5. Decide the public brand/domain, privacy notices and minimal analytics. Track funnel events without names or birth details. Email nurture needs its own explicit opt-in flow.
6. Test acquisition messages and measure collected revenue, refunds, approved commissions and cost per visitor. Set a separate paid-test budget only after those decisions. The current evidence supports a useful demo, not proven market demand.

Keep `/fortune-lab/credits.html` and the research evidence current when products, program terms or methods change.
