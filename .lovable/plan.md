## Journal & Symptom Tracker (`src/pages/Journal.tsx`)

1. **Back button** — Add a top-left `‹` button (orange `#E8601A`, 28px) that calls `navigate("/me")`. Placed next to the "Journal" title.
2. **Mood cards** — Change card bg from `rgba(255,255,255,0.14)` to white `#FFFFFF` with `1px solid #E8601A` border. Mood label color `#333`. Selected state: bg `#FDE8D8`, border 2px `#E8601A`, label `#A84818`.
3. **Symptom pills** — Unselected: bg `#FFFFFF`, text `#333`, border `1px solid #E0D5CC`. Selected: bg `#E8601A`, text `#FFFFFF`, border `#E8601A`.
4. **Save button** — Replace ghost style with solid `#E8601A` bg, white bold text. Disabled state: keep solid orange at 40% opacity.
5. **Section labels** ("SYMPTOMS" eyebrow, "How are you feeling today?") and textarea — bump contrast: eyebrow `#9A7B66`, heading `#1A0E06`, textarea border `1px solid #E0D5CC`.
6. **Form card bg** — Switch translucent white to solid `#FFFFFF` with `1px solid #F0E4DA` border so children are readable.
7. **Success toast** — Already uses `toast.success`; change copy to `"✓ Entry saved for today!"`.

## Feeding Tracker (`src/pages/FeedingTracker.tsx`)

1. **LogSheet save button visibility** — Restructure the sheet into a flex column with `maxHeight: 85vh`: scrollable inner content area, plus a sticky footer holding the Save button. Footer: white bg, top border `#F0E4DA`, `paddingBottom: calc(16px + env(safe-area-inset-bottom))`. Save button: solid `#E8601A`, white bold text, full width — guaranteed above the bottom nav since the sheet is `position: fixed` and the footer sits inside it.
2. **Save confirmation toast** — Update `toast.success` text to dynamic message: bottle → `"✓ Bottle logged — {ml}ml saved!"`; breast → `"✓ Breastfeed logged!"`; pump → `"✓ Pump logged — {ml}ml saved!"`.
3. **Immediate summary update** — `onSaved` already calls `fetchLogs()`, which refreshes TODAY'S SUMMARY. Add an optimistic local prepend of the new log into `logs` before the refetch resolves so the user sees the update instantly.

No backend, route, or schema changes. Edits limited to the two files above.