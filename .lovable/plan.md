## Goal

Simplify the cluttered Bella row on the home Ask card. Currently: orange "B" circle + "Bella" text + green pulse dot + "online · replies in seconds". Replace with a single elegant orange pill that reads "Bella" with a soft live dot + "online" right next to it.

## Change

### `src/pages/HomePage.tsx` lines 68-78

Replace the whole header row with:

- **Orange pill** containing "Bella":
  - background: `linear-gradient(135deg, #E8702A, #D45810)`
  - padding: `4px 11px 4px 10px`
  - border-radius: `999px`
  - white text, Nunito, 11.5px, weight 700, letter-spacing 0.02em
  - tiny white pulse dot (5px) inside, left of "Bella"
  - subtle shadow: `0 2px 8px rgba(232,112,42,0.35)`
- Next to the pill (gap 8): small "online" label
  - Nunito 10px, weight 600, color `#9A6B4E`
  - lowercase

Drop the separate "B" avatar, the standalone "Bella" text, the green dot, and the "replies in seconds" copy.

## Out of scope

- The "Ask your / doula anything" title, the input pill, suggestions, and any other card.
