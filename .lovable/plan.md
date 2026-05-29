## Goal
Make the top bar on `/recipes` (← Home, "Week N Recipes", 🍽️) readable and visually uniform by giving it its own solid orange header background.

## Change
In `src/pages/Recipes.tsx`, update the top header row (currently lines 48–52) so it sits inside a full-width orange band:

- Background: solid deep orange matching the nutrition hero (`#E8601A`, the brand CTA orange already used elsewhere on the page).
- Full bleed across the 430px container, no side margin.
- Padding: ~`14px 16px` (slightly taller than current `12px 14px 6px`) for breathing room.
- Subtle bottom shadow `0 2px 8px rgba(120,60,10,0.18)` to separate it from the scroll area below.
- Keep all three children unchanged in content, but:
  - "← Home" stays white, bump to `fontSize: 11`, `fontWeight: 600`.
  - "Week {currentWeek} Recipes" stays Fraunces serif white, bump to `fontSize: 14`, `fontWeight: 700`.
  - 🍽️ icon stays at `fontSize: 18`.
- Remove the small `6px` bottom padding; instead add ~`8px` top margin on the nutrition hero so spacing feels right.

No logic changes, no other pages touched. The recipe cards and nutrition hero below remain identical.

## Out of scope
- Other pages' headers.
- Recipe card visuals.
- Data / business logic.
