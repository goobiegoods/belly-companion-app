
# Profile (/me) Visual Refinements

Single-file edit to `src/pages/Profile.tsx`. No logic, routing, or data changes.

## 1. Avatar header
- Avatar circle: bg `#E8601A`, white "B" initial, drop the `#FAEADA` fill and orange border ring (keep soft shadow). Matches Bella avatar on Home.
- Name: render `getDisplayName(...)` in title case (e.g. "Bella Mama") instead of relying on uppercase styling. Use a `toTitleCase` helper applied to the display string.

## 2. Journey progress bar (Wk 1 → 40)
- Completed segments + past dots: `#E8601A` (was `rgba(232,112,42,0.40)` / 0.30 connector).
- Remaining segments + future dots: warm light gray `#F0E4DA` (was `rgba(0,0,0,0.08/0.12)`).
- Current-week dot: bump from 11px → 13px, keep orange fill, add a pulsing ring via a small inline `@keyframes` (or reuse Tailwind `animate-pulse` on a wrapping ring span). Implementation: a 22px absolutely-positioned ring with `box-shadow: 0 0 0 4px rgba(232,96,26,0.25)` animated through a new `belly-pulse-ring` keyframe added inline (scoped `<style>` at top of component or appended to `index.css` — prefer inline scoped style to keep this single-file).

## 3. Motivational card (first one, "You're doing amazing, mama …")
- Background: `#FDE8D8` (warmer peach), keep border tone.
- Text alignment: left-align (remove `textAlign: center`), keep italic display font.

## 4. Streak card
- Heading: replace `"{streak.current}-day streak"` with `"Start your streak today 🔥"` when `streak.current === 0`; otherwise keep `"{n}-day streak"` (so it still works once they have one).
- Remove the standalone large numeric `{streak.current}` under the flame. Keep flame emoji, slightly larger, centered in its column.
- Progress bar: track `#FDE8D8` (warm peach), fill `#E8601A` (was sage). Subtext + shield logic unchanged.

## 5. Stat cards (WEEK / DAYS TO GO)
- Label font-size 9 → 11px.
- Label color: warmer mid-gray `#9A7B66` (replaces `#3F5C42` / `var(--color-accent-dark)`) for both tiles, so they share a consistent warm tone.

## 6. Achievements
- Earned badges: full opacity, add warm glow → `box-shadow: 0 0 0 2px #FFE0C7, 0 4px 14px rgba(232,96,26,0.18)`. Remove grayscale.
- Locked badges: opacity 0.4, grayscale(100%) on emoji, and overlay a small lock chip (12×12 circle, white bg, 🔒 at 9px) in the top-right corner so the state is unmistakable. Existing bottom-right 🔒 is replaced by this corner badge.

## Out of scope
No changes to journey timeline data, badge list, premium card, account section, edit form, or routing.
