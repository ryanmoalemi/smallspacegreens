# Version B: presentation-only comparison

A is the root homepage. B is `/product-finder/`. No automatic traffic allocation or root redirect is configured.

Both load the same `finder-core.js` and `finder-data.js`. B's small adapter delegates normalization, choice eligibility and result routing directly to A. There are no separate light/space eligibility rules in B. Question order is Grow, optional microgreen detail, Space, conditional Setup, then results. Choice selection advances immediately in both versions. B starts with Grow on desktop and mobile. Same recommendation copy, product IDs, ASINs, affiliate URLs, required supplies, notes, growing guides and fit information. The main homepage files are unchanged.

B retains its photo backgrounds, typography, centered sequential card, photo answer tiles and product-card presentation. The desktop hero is shorter and the prior tablet two-column form rule is overridden. The separate Next action was removed to match A's selection behavior; users select a card to continue.

Validation: all 28 shared paths, 1,000 invalid/incomplete recovery states, and dependent-answer resets pass in the parity script. Every desktop and mobile path was checked through the browser against the shared engine's offered choices and exact ordered ASINs (56 journeys). Earlier-answer edits and Back remain supported. Screenshots reviewed before publication.

Real garden photography: Michał Robak, Pexels photo 27393767, and Eva Bronzini, Pexels photo 5501510. Existing credited option photography and exact product photography are reused. No generated merchandise or fabricated ratings. Native devices and native screen readers were not tested.
