
# Profile (/me) Full Layout Redesign

Single-file edit to `src/pages/Profile.tsx`. No routing, data, or business logic changes — purely layout + visual restructuring.

## New section order (top → bottom)

1. Settings link (top-right, unchanged)
2. Profile header
3. Upgrade to Pro banner (moved from bottom)
4. My Journey progress bar
5. Motivational peach card
6. Stats + Streak combined orange gradient card
7. My Achievements
8. Menu list (formerly "MY JOURNEY" rows)
9. Subtle Sign out link

## 1. Profile header
- Centered. 64px avatar circle, solid `#E8601A`, white italic "B" (Fraunces italic, 28px, 800).
- Name title-cased via existing `formatName` helper.
- Subtitle: "Week {n} · Due {date}" in `#9A7B66`, 11px.
- "1st/2nd/3rd+ pregnancy" pill: white bg, 1px `#E8601A` border, orange text, 10px.
- "journey" watermark: behind avatar, `#E8601A` at 8% opacity, 68px, centered.

## 2. Upgrade to Pro banner (NEW position)
- Renders only when `!profile?.is_premium`. If premium, render existing "You're a Premium mama!" card in this slot instead.
- Full-width card, `linear-gradient(135deg, #E8601A, #f07840)`, `borderRadius: 18`, padding `14px 16px`, soft orange shadow.
- Flex row: ⭐ (24px) · text block (flex 1: "Upgrade to Pro" white 15px 700 + "Unlimited doula access + all courses" white 11px 400 opacity 0.9) · white pill button (`background: #fff`, orange `#E8601A` text 12px 700, "Go Pro →", `padding: 8px 14px`, `borderRadius: 20`).
- onClick → `setShowPremium(true)`.

## 3. My Journey progress bar
- White card, 1px `#FFD4B8` border, `borderRadius: 16`, padding 14.
- Top-left label "MY JOURNEY" in `#E8601A` 10px 700 letterspaced.
- 4 nodes (Wk 1, 12, currentWeek, 40). Completed connectors+dots `#E8601A`, remaining `#F0E4DA`. Current dot 13px with `belly-pulse-ring` keyframe (already in file).

## 4. Motivational message
- `#FDE8D8` bg, left-aligned italic `#A84818` text, single line that wraps naturally (no manual breaks). Keep existing copy.

## 5. Combined Stats + Streak card (NEW)
- Single card, `linear-gradient(135deg, #E8601A, #f07840)`, `borderRadius: 20`, white text throughout, soft orange shadow.
- **Top half** (padding 16): 3-column flex row with two thin `rgba(255,255,255,0.25)` vertical dividers.
  - Col 1: "24" (28px 800) over "WEEK" (10px 700 letterspaced, opacity 0.85)
  - Col 2: "{daysToGo}" / "DAYS TO GO"
  - Col 3: "🔥{streak.current}" / "DAY STREAK"
- **Bottom half**: top border `1px solid rgba(255,255,255,0.25)`, padding `14px 16px`.
  - Heading: "Start your streak today" (white 14px 700) when `streak.current === 0`, else "{n}-day streak going".
  - Subtext: "Check in tomorrow to keep it going" (white 11px, opacity 0.85).
  - Progress bar: track `rgba(255,255,255,0.25)` 6px rounded, fill `#FFFFFF` width `min(100, current/7*100)%`.

## 6. My Achievements
- Section label "MY ACHIEVEMENTS" `#E8601A` + "3 of 6 unlocked" right-aligned `#9A7B66`.
- Thin progress bar: track `#FDE8D8`, fill `#E8601A`.
- Badges row: earned → `#FDE8D8` bg, `0 0 0 2px #FFE0C7, 0 4px 14px rgba(232,96,26,0.18)`, full color. Locked → opacity 0.45, grayscale, small 14px white lock chip top-right.

## 7. Menu list (replaces old "MY JOURNEY" rows + ACCOUNT)
- White card, `borderRadius: 18`, 1px `#F0E4DA` border, overflow hidden.
- Rows: Edit pregnancy details, Journal & Symptom Tracker, Feeding tracker, Belly breathe & rest, My Courses, My Orders.
- Each row: 32px peach `#FDE8D8` `borderRadius: 10` icon square with orange Lucide icon inside (Pencil, BookOpen, Baby, Wind, GraduationCap, ShoppingBag), then label (14px 500 `#1A0E06`), then `›` chevron in `#C0907A`.
- 1px `#F5EBE0` divider between rows (not after last).
- Edit form (when `editing === true`) renders inline above this card, unchanged.

## 8. Sign out
- Small centered text link at very bottom, `#9A7B66` 12px, underline on hover, calls `handleSignOut`. No card, no border.

## Removals
- Old standalone PREMIUM section (now in slot 2).
- Old standalone ACCOUNT section card (replaced by subtle link).
- Old amber `var(--color-amber-soft)` streak card (merged into gradient card).
- Old separate sage/peach stat tiles (merged into gradient card).
- Duplicate second motivational sage card.

## Technical notes
- Single file: `src/pages/Profile.tsx`.
- Import additional Lucide icons: `Pencil, BookOpen, Baby, Wind, GraduationCap, ShoppingBag`.
- Keep existing state, effects, `formatName`, `getStreak`, premium modal, edit form intact.
- Pulse keyframe `<style>` block already present; reuse it.

## Out of scope
No backend, no new routes, no changes to BottomNav, badges data, or pregnancy week calculations.
