## Issue

"Ask your" / "Your" still uses Nunito italic, which is sans-serif faux-italic — it doesn't flow into the Fraunces italic orange line below.

## Change

Switch both lines to Fraunces italic (same family as "doula anything" / "baby's world") so the two lines read as one continuous handwritten phrase.

### `src/pages/HomePage.tsx` line 80
- `fontFamily: "'Nunito',system-ui"` → `fontFamily: "'Fraunces', Georgia, serif"`
- `fontWeight: 500` → `fontWeight: 400`
- Keep italic, color `#B8755A`, size 21, tight margin

### `src/pages/BabyTracker.tsx` line 146
- `fontFamily: "'Nunito',system-ui"` → `fontFamily: "'Fraunces', Georgia, serif"`
- `fontWeight: 500` → `fontWeight: 400`
- Keep italic, color `#B8755A`, size 20, tight margin

## Out of scope
Color, size, spacing, the orange italic lines, and anything else on the pages.
