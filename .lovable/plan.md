

# Move "📸 Is this safe to use?" to first chip position

## Change

In `src/pages/AskDoula.tsx`, reorder the `QUICK_PROMPTS` array so the safety scan chip is **first** in the horizontal chip row (currently 5th/last). It will be the first thing the user sees when they scroll the chip strip — front and center for discoverability and viral reels.

## Implementation

- Move the `📸 Is this safe to use?` chip entry to index 0 of the chips array.
- Keep its existing brighter border (`rgba(255,255,255,0.45)`) and heavier font weight (600) so it still reads as a feature highlight.
- Keep its existing `onClick` → `handleSafetyChipClick` (opens camera directly, auto-sends with `Is this product safe for me at week {N}?`).
- Other 4 chips keep their order behind it.

## Files touched

- `src/pages/AskDoula.tsx` — reorder one array entry (~3 lines).

## Test

1. Cold load `/ask` with no prior messages → first chip on the left of the row reads `📸 Is this safe to use?` with the brighter border.
2. Tap it → camera opens directly, auto-send still works.
3. Other chips still function unchanged.

