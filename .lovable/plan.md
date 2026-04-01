

# Complete Design System Overhaul — Outfit + Fraunces on Orange

## Overview
Styling-only pass across the entire app: new fonts, new CSS tokens, and full color replacement in every screen. No logic, routing, or Supabase changes.

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add Outfit + Fraunces Google Fonts link |
| `src/index.css` | New CSS custom properties, body font/bg, `.card` and `.card-soft` utility classes, remove old light backgrounds from `.belly-glass-nav` |
| `src/components/BottomNav.tsx` | Dark orange glass nav, white active icons/labels/pip with glow |
| `src/pages/HomePage.tsx` | Ghost watermark, AI pill, Fraunces headlines, Outfit body, suggestion chips, new hero structure |
| `src/pages/BabyTracker.tsx` | Transparent bg, Fraunces hero headline, `var(--c1)` cards, white text throughout, week pills, counter cards |
| `src/pages/AskDoula.tsx` | Transparent bg, AI badge, Fraunces welcome headline, `var(--c1)` doula bubbles, white user bubbles, ring colors |
| `src/pages/Community.tsx` | Transparent bg, Fraunces hero, `var(--c1)` post cards, white filter pills, post composer bar |
| `src/pages/Profile.tsx` | Transparent bg, white avatar circle, Fraunces name, `var(--c1)` menu items, upgrade card |
| `src/pages/Shop.tsx` | Transparent bg, `var(--c1)` cards, white text |
| `src/pages/Journal.tsx` | Transparent bg, `var(--c1)` cards, `var(--input-bg)` inputs, white text |
| `src/pages/Courses.tsx` | Transparent bg, `var(--c1)` cards, Fraunces headlines, white text |
| `src/pages/Recipes.tsx` | Transparent bg, `var(--c1)` cards (keep amber gradient header as accent) |
| `src/pages/RecipeDetail.tsx` | Transparent bg, `var(--c1)` cards, white text |
| `src/pages/Orders.tsx` | Transparent bg, `var(--c1)` cards, white text |

**NOT touched:** `CantSleep.tsx` (dark purple hero stays), system prompt, Supabase queries, routing, Auth.tsx, Onboarding.tsx

## Technical Detail

### Step 1 — index.html
Add before `</head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 2 — index.css
- Add `:root` block with all `--bg`, `--c1`, `--c2`, `--input-bg`, `--white`, `--w90/70/50/40/15/08`, `--nav-bg`, `--send` tokens
- Replace `body, #root` block: `font-family: 'Outfit', system-ui, sans-serif; background: #FF8C42;`
- Add `.card` class (primary glass) and `.card-soft` class (secondary)
- Update `.belly-glass-nav` to use `var(--nav-bg)`, white border-top
- Update `.belly-hero-gradient` to use `rgba(255,255,255,0.22)` glass instead of orange gradient
- Keep all animations/keyframes unchanged

### Step 3 — BottomNav.tsx
- Nav background: `rgba(200,80,10,0.40)`, `blur(22px)`, `border-top: 1px solid rgba(255,255,255,0.15)`
- Padding bottom: `calc(13px + env(safe-area-inset-bottom))`
- Active icon: white stroke, white label (600), white pip 18×2.5px with `box-shadow: 0 0 8px rgba(255,255,255,0.55)`
- Inactive: `rgba(255,255,255,0.38)` for both icon and label
- Labels: `fontFamily: 'Outfit'`, 7px uppercase

### Step 4 — HomePage.tsx
- Ghost watermark "doula" behind hero: Fraunces 900, 90px, `rgba(255,255,255,0.055)`, absolute positioned
- AI pill: `· AI · ALWAYS HERE FOR YOU ·` with `var(--c1)` bg
- Hero headline: Line 1 "Ask your" Fraunces 800 32px white, Line 2 "doula anything" Fraunces 800 italic `rgba(255,255,255,0.80)`
- Hero sub: Outfit 400 11px `rgba(255,255,255,0.58)`
- Suggestion chips below input: 5 chips with `var(--c1)` bg, Outfit 600 11px white
- Week card headline: "You're in" Outfit 600 18px + "week [X]" Fraunces 900 italic 28px
- Streak number: Fraunces 900 52px white, letterSpacing -3px
- Mood labels: TIRED / GOOD / GLOW / HANGOVER / UNWELL
- Logo: "belly" lowercase Fraunces 700 18px white, subtitle Outfit 8px `rgba(255,255,255,0.55)`

### Step 5 — BabyTracker.tsx
- Root: `background: "transparent"` (was `#FEF8F4`)
- Hero gradient → `rgba(255,255,255,0.22)` glass with blur
- Headline: "Your" Outfit 600 22px + "baby's world" Fraunces 800 italic 30px
- Fruit: 80px, drop-shadow, "About the size of a [fruit]" Fraunces 700 italic 16px
- All info cards (Baby Development, Size, Symptoms, Natural Tip): `var(--c1)` bg, white text
- Week pills: active = white bg + `#FF6520` text, inactive = `var(--c2)` + white text
- Trimester cards: `var(--c2)` bg, white text
- Counter cards: `var(--c1)` bg, Fraunces 900 numbers, white button text
- Recipe amber gradient header: kept as-is (intentional accent)

### Step 6 — AskDoula.tsx
- Root: transparent bg
- Header: "AI · LIVE" badge with green dot, Outfit 600
- Welcome headline: "Your" Outfit 600 24px + "doula chat" Fraunces 800 italic 30px
- Context strip cards: `var(--c2)` bg, white text
- Prompt grid: `var(--c1)` bg, Outfit 600 white
- Doula bubbles: `var(--c1)` bg, `rgba(255,255,255,0.88)` text, border-radius 18 18 18 4
- User bubbles: `rgba(255,255,255,0.95)` bg, `#3A1A00` text, border-radius 18 18 4 18
- Thinking rings: `rgba(255,255,255,0.40/0.25/0.15/0.08)`, center Outfit italic white
- Input bar: `var(--input-bg)`, send button `#FF6520` circle

### Step 7 — Community.tsx
- Headline: "Mama" Outfit 700 28px + "community" Fraunces 800 italic 34px
- Pinned post: `rgba(255,255,255,0.20)`, PINNED badge `rgba(255,255,255,0.22)`
- All post cards: `var(--c1)`, titles Outfit 600 14px white, body `rgba(255,255,255,0.65)`
- Category pills: active = white bg `#FF6520` text, inactive = `var(--c1)` white text
- Composer bar: `rgba(200,80,10,0.45)` bg, `var(--input-bg)` input, white Post button

### Step 8 — Profile.tsx
- Avatar: white bg, `#FF6520` initial, Fraunces 700 28px, 4px white ring
- Name: Fraunces 700 24px white
- Stats: Fraunces 900 26px white numbers, Outfit 7px labels
- Menu items: `var(--c1)`, Outfit 600 14px white titles
- Upgrade card: `rgba(255,255,255,0.22)`, "Go Pro" white button `#FF6520` text

### Step 9 — Shop, Journal, Courses, Recipes, RecipeDetail, Orders
Apply same pattern: transparent root bg, `var(--c1)` cards, white titles, `var(--w70)` body, `var(--w40)` hints, Fraunces for headlines, Outfit for body, `var(--input-bg)` for inputs.

## What Does NOT Change
- CantSleep.tsx dark purple hero
- Recipe amber gradient headers (kept as accent)
- All Supabase queries, routing, feature logic, auth
- AI system prompt
- Auth.tsx, Onboarding.tsx

