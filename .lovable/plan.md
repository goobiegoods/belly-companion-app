

# BELLY — Premium Visual & UX Elevation Pass

## Overview
A visual-only elevation touching CSS, styling, and animations across all screens. No routing, Supabase logic, or feature changes.

## Part 1 — Living Gradient World

**Global background** in `src/index.css`:
- Set `body, #root` to a fixed peach-lavender gradient: `linear-gradient(135deg, #F8E8FF 0%, #FFE4D4 30%, #FFF0E8 60%, #FFF8F2 100%)` with `background-attachment: fixed`
- Override `bg-belly-bg` and screen containers to `background: transparent`

**Frosted glass cards** — add utility classes:
- `.belly-glass` = `rgba(255,255,255,0.75)` + `backdrop-filter: blur(8px)` + border `rgba(255,228,212,0.8)`
- `.belly-glass-nav` = `rgba(255,252,248,0.88)` + `backdrop-filter: blur(16px)` for navbar

**Splash screen** — wrap routes in a new `SplashScreen` component in `App.tsx`:
- Shows gradient background → fades in BELLY logo + "Virtual Doula" tagline after 400ms → navigates after 1.6s total
- Only shows once per session (use `sessionStorage` flag)

**Apply glass styling** to cards in: HomePage, BabyTracker, Community, Shop, Profile, Journal, Courses. Replace `bg-card`, `bg-white`, `bg-belly-upsell-bg` on card containers with glass styles.

## Part 2 — Concentric Rings AI Thinking

In `AskDoula.tsx`, replace the 3 pulsing dots (lines 241-250) with a concentric rings animation:
- 4 dashed-border circles (`ring-1` to `ring-4`, 60px–150px) with staggered `ringPulse` animation
- "Belly is thinking..." label centered in italic Georgia
- Add `ringPulse` keyframes to `src/index.css`
- Hide immediately when streaming text appears

## Part 3 — Streak & Milestones on Home

In `HomePage.tsx`, add between hero card and "This week" section:

**Streak banner** — glass card with 🔥 emoji, "[X]-day streak!" title, streak number. Hardcode to 3 for now.

**Milestone track** — horizontal 4px bar with gradient fill, 4 markers (🌱 Day 1, 🍋 Week 1, 🥑 Week 2, 👶 Birth) positioned at 0%, 33%, 66%, 100%. Fill width calculated from streak count.

## Part 4 — Home Screen Refinements

In `HomePage.tsx`:
- **Greeting**: already uses `profile?.first_name` with titleCase — verify it shows "Hi, Orel 🌸" not full name. Add glass styling to greeting pill.
- **Logo mark**: replace clock/circle SVG with belly/womb SVG path
- **This week cards**: apply per-card color tints with glass effect (baby=peach, body=green, tip=pink)
- **Journey cards**: glass styling, add course progress pill on "Your Courses" card

## Part 5 — Me Tab Journey Dashboard

In `Profile.tsx`:
- **Avatar**: add double-ring glow shadow
- **Name**: ensure proper case (first + last, not ALL CAPS)
- **Stats row**: replace "Trimester" stat with streak 🔥 stat, glass card styling
- **Achievement badges**: new horizontal scroll section with 6 badge cards (3 earned, 3 locked with opacity 0.3 + grayscale)
- **Settings sections**: glass card styling on all grouped cards
- **Add "My Orders" row** to quick links group

## Part 6 — Ask Tab Warm Welcome

In `AskDoula.tsx`, enhance the empty state (lines 202-212):
- Add a welcome card above prompts: "Good morning, [name] 🌸" + week-specific subtitle
- Add "Suggested for week [X]" label above prompt grid
- Make the 5th prompt full-width, update text to week-dynamic versions
- Glass styling on all prompt cards

## Part 7 — Community Content & Style

In `Community.tsx`:
- **Delete test posts**: add a one-time SQL migration to delete posts where title in ('eee','frr','rrrr')
- **Category colors**: expand `CATEGORY_COLORS` to include text color and avatar ring color per category
- **Post cards**: apply glass styling
- **Avatar rings**: apply category-specific ring color via `box-shadow`

## Part 8 — Shop Kit Cards

In `Shop.tsx`:
- Widen kit cards to 180px
- Add colored header section (80px, peach gradient) with large 40px emoji
- Glass styling on card body
- Fix horizontal scroll padding (16px sides, 32px trailing)

## Part 9 — Global Micro-Interactions

In `src/index.css`:
- `.belly-card-interactive` — scale(0.972) on :active with spring bezier
- `.belly-btn-primary` — scale(0.96) + opacity 0.9 on :active
- Enhanced `heartPop` with 4-step spring curve
- `sheetUp` keyframe for bottom sheets

Apply across all tappable cards and primary buttons in all screen files.

## Part 10 — Navbar Elevation

In `BottomNav.tsx`:
- Glass background: `rgba(255,252,248,0.88)` + `backdrop-filter: blur(16px)`
- Replace active dot (circle) with pill indicator: 20px × 3px, rounded, #FFB899
- Shadow: `0 -4px 20px rgba(42,18,0,0.04)`
- Active icon: slight 2px upward shift (already exists)

## Files Changed
- `src/index.css` — gradient body, glass utilities, ring/streak/interaction keyframes
- `src/App.tsx` — wrap in SplashScreen component
- `src/components/BottomNav.tsx` — glass nav, pill indicator
- `src/pages/HomePage.tsx` — glass cards, streak section, logo, greeting fix
- `src/pages/Profile.tsx` — avatar glow, achievements, stats, glass cards, orders link
- `src/pages/AskDoula.tsx` — concentric rings, warm welcome state
- `src/pages/Community.tsx` — glass cards, category colors, avatar rings
- `src/pages/Shop.tsx` — kit card redesign, glass styling
- `src/pages/BabyTracker.tsx` — glass cards, transparent bg
- `src/pages/Journal.tsx` — glass cards, transparent bg
- `src/pages/Courses.tsx` — glass cards, transparent bg
- Migration SQL — delete test posts from community_posts

## What Does NOT Change
- No routing changes
- No Supabase table schema changes (except deleting junk posts)
- No feature logic changes
- No new dependencies

