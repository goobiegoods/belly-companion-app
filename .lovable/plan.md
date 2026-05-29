## Goal

On the home (Today) Ask-Bella card and the Baby page header, the small line above the italic orange title ("Ask your" / "Your") is hard black (#1A0E06) and sits visually disconnected from the warm orange script line. Soften the color and tighten the spacing so the two lines read as one flowing phrase.

Keep the orange italic lines exactly as they are ("doula anything" / "baby's world").

## Changes

### 1. `src/pages/HomePage.tsx` — line 80

The "Ask your" line.

- Color: `#1A0E06` → `#B8755A` (soft warm brown that bridges into the orange below)
- Weight: `700` → `500` (less assertive, more flowing)
- Font style: add `fontStyle: "italic"` so it shares character with the script line
- Size: keep `21`
- Letter spacing: add `letterSpacing: -0.3`
- Margin: add `marginBottom: -2` to tuck it closer to "doula anything"

### 2. `src/pages/BabyTracker.tsx` — line 146

The "Your" line above "baby's world".

- Color: `#1A0E06` → `#B8755A`
- Weight: `800` → `500`
- Add `fontStyle: "italic"`
- Add `letterSpacing: -0.3` and `marginBottom: -2`

## Out of scope

- The orange italic lines themselves ("doula anything", "baby's world")
- Any other headings, cards, or page chrome
- Behavior, copy, or layout beyond the two title pairs above
