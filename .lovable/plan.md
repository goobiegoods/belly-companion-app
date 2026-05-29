## Goal
Expand the recipe library from 29 → ~65 recipes so every week shows a rich, varied set across all five categories (Breakfast, Smoothie, Snack, Dinner, Tea).

## Current inventory
- **Trimester 1 (weeks 1–13)** — 8 recipes
- **Trimester 2 (weeks 14–26/28)** — 8 recipes
- **Trimester 3 (weeks 27–40)** — 9 recipes
- **Universal (weeks 1–40)** — 4 recipes
Categories are uneven (e.g. T3 only has 1 breakfast, T1 only 1 dinner).

## Target after expansion (per trimester, per category)
At least 4–5 recipes in each category × trimester, plus a handful of universal staples. That means roughly **+12 per trimester + 2 universals ≈ +38 recipes**, bringing the total to ~65.

| Section | Breakfast | Smoothie | Snack | Dinner | Tea | Add |
|---|---|---|---|---|---|---|
| T1 (1–13) | +3 | +2 | +2 | +3 | +2 | 12 |
| T2 (14–26) | +2 | +2 | +3 | +4 | +1 | 12 |
| T3 (27–40) | +3 | +3 | +2 | +3 | +1 | 12 |
| Universal (1–40) | +1 | +1 | +0 | +0 | +0 | 2 |
| **Total added** | | | | | | **38** |

## Trimester focus (naturopathic alignment — already in the file)
- **T1**: folate, B6, B12, iron, zinc, vitamin C, nausea relief.
- **T2**: iron, calcium, omega-3 (DHA), vitamin D, protein, magnesium.
- **T3**: magnesium, calcium, complex carbs, iron, raspberry leaf, dates, hydration, labor prep.

## What I'll edit
- `src/data/recipesData.ts` — append ~38 new `Recipe` objects following the existing `Recipe` interface exactly:
  - Unique `id` (`r30`, `r31`, … `r67`).
  - Full `ingredients` (with `nutrientRating` + `alternatives`), `vitamins`, `whyThisWeek` paragraph in the same naturopathic voice, and step-by-step `instructions`.
  - Appropriate `weekRange` per trimester.
- Insert the new recipes inside the matching trimester section comments so the file stays organized.

## Sample dishes I'll add (representative, not exhaustive)
- **T1**: Folate avocado toast, ginger-pear smoothie, chickpea-rosemary crackers, lemon-ginger miso soup, raspberry-coconut yogurt parfait, peppermint nausea tea, baked apple oats, sweet-potato hash, mango-mint hydration drink, hummus & cucumber boats, white-bean tomato stew, lemon-balm tea.
- **T2**: Salmon-avocado toast, sardine pasta, sesame-broccoli stir-fry, chickpea curry, cottage-cheese berry bowl, almond-date energy balls, beet-orange smoothie, calcium green smoothie, sweet-potato & black bean tacos, kale-quinoa salad, magnesium nut clusters, ginger-turmeric latte.
- **T3**: Date-tahini overnight oats, raspberry-leaf chia pudding, slow-cooked lentil dal, prep-for-labor energy bites, oat-banana pancakes, sweet potato wedges with yogurt dip, magnesium cherry smoothie, calcium pumpkin smoothie, miso ginger broth, coconut rice porridge, hibiscus-rosehip iced tea, dark-chocolate almond bark.
- **Universal**: Anytime green smoothie, mineral broth.

## Out of scope
No type/interface changes. No UI changes — the existing `Recipes.tsx` card automatically picks up new entries via `getRecipesForWeek()`. No data migrations.
