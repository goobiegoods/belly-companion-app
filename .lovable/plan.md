## Goal
Eliminate light-on-light text on `/recipes` and `/recipes/:id` so every card is legible on every week.

## Root cause
Both `src/pages/Recipes.tsx` and `src/pages/RecipeDetail.tsx` render recipe content directly on the transparent app background (which is the warm orange/yellow gradient). The cards themselves use `var(--c1)` (translucent white) with white text — which works on dark areas but becomes white-on-orange/yellow under the page background. The amber gradient nutrition hero and the per-category hero strips also stack white text on yellow.

## Fix (applied once to the card components → affects all weeks)

### `src/pages/Recipes.tsx` — recipe list card
- Card background: solid `#FFFFFF` with `1px solid #F0E6DD`, soft shadow `0 4px 14px rgba(120,60,10,0.08)` (replaces translucent `var(--c1)`).
- Title: `#1a1a1a`, weight 600.
- Subtitle / first-sentence: `#555`.
- Hero strip (image area): keep category gradient, keep white text on it (dark gradient ensures contrast); add a subtle `rgba(0,0,0,0.18)` overlay behind the prep-time / category pills so white stays legible on lighter gradients.
- Nutrient pills: background `#FDE8D8`, border `1px solid #F6D2B6`, text `#B84A10`, weight 600.
- "Why this week" block: background `#FDF6F0`, border `1px solid #F1E2D2`; label `#B84A10`; body text `#777`.
- Category filter chips: inactive = white bg / `#1a1a1a` text / `#EADFD2` border; active = `#E8601A` bg / white text.
- Top nutrition hero (amber gradient): darken gradient slightly and add inner shadow so the white nutrient pills + italic quote keep AA contrast on every week (`linear-gradient(135deg,#D4500F,#E8731A,#F0934A)`); quote color `rgba(255,255,255,0.92)`.
- Empty state text → `#1a1a1a` / `#666`.

### `src/pages/RecipeDetail.tsx` — recipe detail
Apply the same token rules so a single visual language carries through:
- Page content wrapper (below hero) becomes a white card region: bg `#FFFFFF`, text default `#1a1a1a`.
- Recipe title `#1a1a1a`; intro italic line `#555`.
- Vitamin pills: `#FDE8D8` / `#B84A10` (same as list).
- "Why your baby needs this…" panel: `#FDF6F0` bg, `#F1E2D2` border, label `#B84A10`, body `#777`.
- Ingredients rows: bg `#FFF8F2`, border `#F1E2D2`, text `#1a1a1a`, star rating chip bg `#FDE8D8` text `#B84A10`; expanded alternatives panel bg `#FDF6F0`, body `#555`.
- Instructions rows: bg `#FFF8F2`, border `#F1E2D2`, step number circle `#E8601A` bg / white text, step body `#1a1a1a`.
- Section labels ("Ingredients", "How to make it"): `#B84A10`, uppercase, tracked.
- Back button + Share button: keep, but back button color `#1a1a1a` so it's visible on the new white content; Share stays white pill with `#E8601A` text.
- Hero strip: keep category gradient with the same dark overlay treatment as the list cards so the white meta pill is readable on any week's gradient.

### Rule enforced going forward
Never render light text on a light background in these two files. The two safe combinations used everywhere:
1. White text → only on the dark category gradient strip (with overlay) or on the darkened amber nutrition hero.
2. `#1a1a1a` / `#555` / `#777` text → only on white (`#FFFFFF`), peach (`#FDF6F0`), or warm-cream (`#FFF8F2`) surfaces.

No structural, data, or routing changes. Pure presentation edits in two files.
