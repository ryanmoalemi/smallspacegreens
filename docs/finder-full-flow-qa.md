# Finder redesign and full-flow QA

14 November 2026

## Changes

Warmer result welcome, cream/sage product card with sun rays and a small crop photo, two factual match chips, clear yellow Buy on Amazon button. Supplies are explicitly sold separately. Removed the old completion banner because it caused a layout shift. Added an explicit Start over action which clears answers; answer chips remain available for editing. All new text is at least 12px. Reduced-motion preferences disable the arrival animation.

## Browser checks

- All 28 selectable shopping journeys completed through real UI controls on desktop and in a 375px mobile iframe, 56 journeys total. Rechecked the final mobile sizing on all 28 routes after cosmetic adjustments.
- Verified the offered answer set at each question against the allowed paths; verified primary/add-on Amazon ASINs, affiliate links, guide mapping, Back, and 100% progress at results.
- Followed the entire Back chain from every result, all 28 passed.
- Activated Start over from every result, all 28 cleared the selected answers and URL parameters.
- Edited space from a basil kit to balcony, edited crop to tomatoes, and edited radish microgreens kit to pea shoots: incompatible kit/supply choices did not persist.
- Broccoli Not sure shortcut worked. Browser Back and Forward restored the expected result/question. Six representative invalid saved links returned to valid questions without unavailable screens.
- No horizontal overflow at 375px or text under 12px in the inspected result labels.
- Product photos loaded during browser review; remote photos can be briefly pending during rapid transitions. The image-loading fallback remains.

## Limits and assessment

This tests the deterministic shopping finder, not Amazon checkout, live stock, yield, or every possible device/browser. Remote image delivery and font loading can affect first-paint timing. On shorter phones some result variants need a small scroll.

Candid overall score: 8/10. The flow is short, warm and functional, but the catalog is narrow and sunlight qualification is still broad for crops other than tomatoes. A budget preference and more precise light choices would improve recommendation quality beyond visual polish.
