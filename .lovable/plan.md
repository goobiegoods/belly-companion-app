

# Move Recipes to Baby Tab + Add Contraction Counter

## Change 1 — Move "Nourish this week" from Home to Baby

### HomePage.tsx
- Delete lines 111–161 (the entire `{(() => { ... })()}` block for "Nourish this week")
- Remove the unused imports on line 5: `getRecipesForWeek`, `getUniqueVitaminsForWeek`, `CATEGORY_GRADIENTS` from recipesData

### BabyTracker.tsx
- Add imports: `useNavigate` from react-router-dom, `getRecipesForWeek`, `getUniqueVitaminsForWeek`, `CATEGORY_GRADIENTS` from recipesData
- Insert the golden amber "Nourish this week" card between the Natural Tip card (ends line 122) and the Trimester Overview section (line 124). Uses `selectedWeek` for filtering recipes, identical card structure to what was on Home.

## Change 2 — Replace Kick Counter with Dual Counter Layout

### BabyTracker.tsx (lines 142–158)
Replace the single kick counter card with a flex row containing two equal-width cards:

**Left card — Kick Counter** (preserves existing `kickCount`/`addKick`/reset logic):
- 👶 emoji, "Kick Counter" label, count in 36px `#FF7840`, "Goal: 10 kicks" hint
- Stacked buttons: "+ Kick" (orange gradient) and "Reset" (subtle)
- Haptic on kick: `navigator.vibrate?.(8)`

**Right card — Contraction Counter** (new local state, purple-tinted):
- New state: `contractions` array, `isTimingContraction`, `contractionStart`, `elapsedSeconds`
- `useEffect` with `setInterval` for live timer during STATE 2
- ⏱️ emoji, "Contractions" label in purple tones

- **STATE 1 (idle)**: Shows count of today's contractions, average interval from last 3, "Start timing" button (purple gradient)
- **STATE 2 (timing)**: Live elapsed timer `0:XX` with pulsing purple ring animation (`contractionPulse` keyframes), "Stop timing" button
- **STATE 3 (result)**: Shows duration for 2s via `setTimeout`, then returns to STATE 1

**Alert card** below both counters: If contractions are ≤5min apart AND ≥60s duration for the last 3+, show a warm warning card suggesting contacting midwife.

### CSS addition (inline `@keyframes` via style tag or inline animation):
- `contractionPulse`: box-shadow oscillates between 3px and 8px purple glow

## Files touched
- `src/pages/HomePage.tsx` — remove recipe section + unused imports
- `src/pages/BabyTracker.tsx` — add recipe card + dual counter layout

No other files changed.

