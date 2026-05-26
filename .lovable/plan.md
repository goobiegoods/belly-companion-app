# Warm Premium Redesign Plan

Shift the app from harsh orange/white to a soothing tri-tone editorial palette (muted terracotta, warm cream, sage green) and layer in targeted UX improvements on Welcome, Home, Ask Bella, Community, and Journey screens.

## 1. Global tokens (`src/index.css`, `tailwind.config.ts`)

Replace existing color tokens with the new palette:

```
--color-accent-primary: #C9622F   (muted terracotta)
--color-accent-dark:    #A04E22
--color-accent-light:   #F5D5C0   (warm peach)
--color-sage:           #7A9E7E
--color-sage-soft:      #EEF4EE
--color-amber-soft:     #FFF3E0
--color-bg-base:        #FAF7F2   (warm cream)
--color-bg-card:        #FDF9F4   (card surface)
--color-border-default: #E3D9CE   (warm beige-gray, 0.5px)
--color-text-primary:   #3D2C1E   (warm dark brown)
--color-text-secondary: #6B5544
--color-text-muted:     #9E8E82
--shadow-warm: 0 2px 8px rgba(180, 90, 30, 0.18)
```

Load Playfair Display via `index.html` (`Fraunces` already loaded — reuse as serif if visually equivalent, otherwise add Playfair). Add a `.font-serif-display` utility. Body remains Outfit.

Add global utilities: `.pill` (radius 20px, 6px/14px padding), `.card-warm` (bg-card + 0.5px border-default), `.section-label` (11px small-caps terracotta, letter-spacing 0.1em), `.fade-in-up` keyframe (translateY 12→0, 300ms), staggered children helper.

## 2. BottomNav (`src/components/BottomNav.tsx`)

- Background `--color-bg-base`, faint warm top border.
- Active icon + label: terracotta with 2px underline indicator.
- Inactive: `#9E8E82`.
- Min 48px tap target.

## 3. Onboarding / Welcome (`src/pages/Onboarding.tsx`)

Step 1 (welcome) and Step 3 (your-journey):
- Background cream, faint radial terracotta pattern (opacity 0.06) top 40%.
- Icon circle 110px with sage halo ring (opacity 0.12).
- Sage "Week N" pill below icon (white text).
- Italic serif tagline: "Every heartbeat is a hello 🤍".
- Row of 3 sage milestone pills (week-dependent: viability, hearing, lungs etc. — use static set for now per spec).
- Full-width terracotta pill CTA with warm shadow + right-arrow micro-animation on press.
- Faint sage wave SVG at bottom.

## 4. Home (`src/pages/HomePage.tsx`)

- Time-aware greeting ("Good morning/afternoon/evening, {name}") in warm-brown serif.
- Ask-doula card: 4px sage left border, `#FDF9F4` bg, input radius 28px.
- Week card: sage oval glow behind illustration, week number in large serif italic.
- NEW "Today's Recipe" card below week card — bowl emoji, name, "Week N · 5 min · Good for baby's brain", sage "Iron" pill, terracotta left accent, navigates to `/baby` recipes.
- NEW "Quick Navigate" horizontal scroll: 4 pills (Baby Size, Ask Bella, Recipes, Mamas) alternating sage/terracotta.

## 5. Ask Bella (`src/pages/AskDoula.tsx`)

- Header: "Ask **Bella**" with Bella in italic serif terracotta.
- Replace gray subtext with 3 sage pill badges (Knows your history · Week N · Nth pregnancy).
- User bubbles: right-aligned, `#F5D5C0`, warm-brown text, no flower icon, avatar = user initial in peach circle.
- Bella bubbles: cream bg, 3px sage left border, warm brown text, radius 18px.
- Input bar: pill (28px radius), cream, camera icon left, 40px terracotta circular send right.

## 6. Community (`src/pages/Community.tsx`)

- Convert "+ Post" to a bottom-sheet modal (vaul `Drawer`, 85vh):
  - Drag handle top, X close top-right, overlay `rgba(40,20,5,0.45)`.
  - Category pill toggles (Questions / Stories / Tips / Support).
  - Title input, body textarea, full-width terracotta pill "Post" button.
  - Opens instantly on tap — no scroll/navigation.
- Post cards: 0.5px warm border, increased padding, press state `scale(0.98)` + warm shadow.
- PINNED badge → sage.
- Category badges: Story=sage, Question=terracotta, Tips=warm amber, Support=muted pink.

## 7. Journey / Profile (`src/pages/Profile.tsx`)

- Avatar: 3px conic gradient ring (terracotta→sage) with 8s slow rotation.
- Name in warm brown with faint terracotta underline.
- Streak card: amber bg `#FFF3E0`, terracotta flame, sage progress bar, brown text.
- Week stat box: sage bg `#EEF4EE`; Days To Go: `#FDF0EA`; both brown numbers.
- Achievements: earned = warm glow ring; locked = desaturated + lock overlay; "X of 8 badges unlocked" progress bar above.
- Replace "Edit pregnancy details" row with horizontal timeline: Conceived → Week 12 → Week N (now, pulsing terracotta dot) → Week 40.
- Bottom sage card: italic serif "You're doing amazing, {name}. {daysLeft} days left — every single one counts. 🌱".

## 8. Global polish pass

Apply across all screens already on the new system (Shop, Baby, Courses, Recipes, etc. — touch only where the new tokens or border/typography rules don't yet apply):
- Cards: `#FDF9F4` bg + 0.5px `#E3D9CE` border.
- Section labels → `.section-label` utility.
- Pills → 20px radius, 6/14 padding.
- Card mount: fade-in-up, 60ms stagger.
- Route transitions: 150ms opacity cross-fade (wrap `<Routes>` or per-page wrapper).

## Files to edit

- `src/index.css` — tokens, utilities, keyframes
- `tailwind.config.ts` — extend with new semantic colors
- `index.html` — add Playfair Display
- `src/components/BottomNav.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/AskDoula.tsx`
- `src/pages/Community.tsx` (+ new `PostComposerSheet` component using `vaul`)
- `src/pages/Profile.tsx`
- Light polish: `src/pages/Shop.tsx`, `BabyTracker.tsx`, `Courses.tsx`, `Recipes.tsx`, `Journal.tsx` (tokens/borders only — no structural changes)

## Out of scope

- No backend / data model changes.
- No auth changes.
- No new dependencies (vaul `Drawer` already available).
