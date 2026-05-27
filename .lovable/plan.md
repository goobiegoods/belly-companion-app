# Belly App — Complete UI Redesign Plan

A pure visual redesign. No changes to data, routing, auth, or functionality.

## 1. Design tokens (src/index.css + tailwind.config.ts)

Replace v3 tri-tone tokens with the new Belly v4 palette:

- `--bg-page: #F0E8DC`, `--card-surface: #FFFFFF`, `--card-border: #E8702A` (1.5px), `--card-shadow: 0 3px 16px rgba(232,112,42,0.10)`
- `--primary: #E8702A`, `--primary-dark: #D45810`, `--header-gradient: linear-gradient(135deg,#E8702A,#D45810)`
- `--nav-bg: #C85818`
- Pills: `--pill-orange-bg #FAEADA / text #A84818`, `--pill-neutral-bg #F0E8DC / text #7A5A40`
- Text: `--text-dark #1A0E06`, `--text-mid #7A5038`, `--text-soft #C0907A`, `--label-muted #C0A888`
- Update shadcn HSL tokens (`--background`, `--card`, `--primary`, `--border`, etc.) so existing shadcn components inherit the new look.

Fonts (add to `index.html` Google Fonts link + Tailwind `fontFamily`):
- Nunito 400/500/600/700 → default sans
- Fraunces italic 300/400 → `font-display`

Utility classes in `@layer components`:
- `.card-belly` (white + 1.5px orange border + 20px radius + shadow)
- `.pill-orange`, `.pill-neutral`
- `.btn-primary` (orange CTA), `.btn-circle-send`
- `.input-belly`
- `.eyebrow` (uppercase 8px 0.16em #E8702A bold)
- `.watermark` (Fraunces italic, opacity .045, color #E8702A, absolute)
- Animations: `card-enter` (opacity+translateY, 280ms, stagger via delay utility), `sheet-up` (cubic-bezier(.34,1.56,.64,1) 300ms), `press` (active:scale-97).

## 2. Shared layout components

- `src/components/AppHeader.tsx` — fixed gradient header, decorative top-right radial glow, left "belly · VIRTUAL DOULA" lockup, `right` slot for per-screen control. Props: `right?: ReactNode`, `showBack?: boolean`.
- `src/components/BottomNav.tsx` — rebuild with `#C85818` bg, 6 items (Today/Baby/Ask Bella/Mamas/Shop/Journey), SVG line icons stroke 1.6, white active label + 16×2 indicator bar, inactive `rgba(255,255,255,.55)`.
- `src/components/PageShell.tsx` — wraps `<AppHeader>` + scroll container with `#F0E8DC` bg, top padding for fixed header, bottom padding for nav, optional `watermark` prop (word + position + size).
- `src/components/PostSheet.tsx` — bottom sheet modal (Radix Dialog or shadcn Sheet side="bottom"), 85vh, drag handle, X close, category pills (Questions/Stories/Tips/Support), title input, body textarea, primary CTA, overlay `rgba(40,20,5,.45)`, slide-up spring. Global trigger via context (`usePostSheet().open()`) so any "+ Post" button across the app opens it instantly without route change.

## 3. Per-screen redesigns

### HomePage (`src/pages/HomePage.tsx`) — Today
- Header right: time-aware greeting pill ("good morning/afternoon/evening, mama") based on `new Date().getHours()`.
- Watermark "doula" top-left ~100px.
- Card 1 Ask Bella: white card, "bella" watermark inside top-right, 33px orange "B" avatar, name + green-dot online + "replies in seconds", split headline ("Ask your" Nunito bold / "doula anything" Fraunces italic), subtext, input pill with orange send circle, suggestion pills row (mix orange/neutral). Tapping input or pills routes to `/ask`.
- Card 2 Week: white card; inner top section uses gradient header strip (radius top 20), eyebrow "YOU'RE IN", "week N" Fraunces 44px, milestone label, fruit illustration circle floats with `-mt-18`, body line ("Your baby … voice." mixing Nunito + Fraunces italic), tag row ("X weeks to go" + "Trimester N"), full-width Share CTA. Wire to existing share handler.
- Card 3 Milestones: three equal white bordered mini-cards (emoji + bold 8px label). Pull from existing week-content data; fall back to static set if absent.
- Card 4 Today's Recipe: horizontal white card → links to `/recipes` (or baby tab nutrition).
- Quick Navigate: eyebrow + 4 pills (Baby Size, Ask Bella, Recipes, Mamas) routing to respective tabs.

### BabyTracker (`src/pages/BabyTracker.tsx`) — Baby
- Header right: week pill ("week N").
- Watermark "baby" top-left ~90px.
- Title block "Your" / "baby's world" + subtitle "Week N · {fruit} · ~{size}".
- Size illustration card: centered 110px circle w/ radial glow, existing BabySizeIllustration mapped per week, Fraunces caption.
- Three stat boxes (Weight/Length peach, Age cream). For weeks 1–4 render `—` in `#B8A898`.
- Week browser: horizontal scroll pills w(N-2)…w(N+2), active = orange pill bold, locked future weeks = neutral pill opacity .6 with 🔒.
- Card "BABY DEVELOPMENT": body text + symptom pills (mix).
- Card "WEEK N NUTRITION": horizontal link card → `/recipes`.
- Audit `BabySizeIllustration` mapping for all 40 weeks; confirm Week 1 poppy seed, Week 24 corn, etc. Fix any mismatches.

### AskDoula (`src/pages/AskDoula.tsx`) — Ask Bella
- Header: back arrow circle (left, overrides default lockup), centered "Ask Bella" split typography, right: 30px orange "B" avatar with green online dot.
- Context pills row (Week / pregnancy / "Knows your history") + thin divider.
- Message bubbles: user = orange right-aligned (no avatar, no flower), Bella = white with 1.5px orange border + 28px 🌸 avatar left. Inline Fraunces italic for emphasized terms (wrap key phrases via simple regex on known terms, or `<em>` already in messages).
- Suggestion chips above input, horizontal scroll (mix pills).
- Input bar: camera icon left, pill input, orange send circle. Keep existing send/streaming logic untouched.

### Community (`src/pages/Community.tsx`) — Mamas
- Header right: white "+ Post" pill → `usePostSheet().open()` (never scrolls/navigates).
- Title block "Mama / community" + subtitle ("Week N mamas · X members").
- Category filter pills (All/Questions/Stories/Tips/Support) — All active = orange.
- Post cards: white + orange border, 26px orange avatar w/ initial, username + week badge orange pill + timestamp right, type badge pill (orange story / neutral question), title bold, preview text, engagement row (♡ 💬 counts).
- Replace any existing inline composer trigger with the global PostSheet.

### Profile (`src/pages/Profile.tsx`) — Journey
- Header right: "Settings" ghost pill.
- Watermark "journey" top-center ~68px.
- Centered profile: 68px peach avatar w/ 2.5px orange border + Fraunces initial, name, week+due subtitle, "1st pregnancy" orange pill.
- Stats row: Week box (cream) + Days-to-go box (peach), Fraunces 28px values.
- Streak card: 🔥 + "{N}-day streak" + progress bar (#FAEADA track, #E8702A fill) + "{N} of 7 days".
- Achievements: eyebrow + 4 equal bordered cards (earned full opacity, locked 0.35 + 🔒). Use existing achievements data.
- Journey timeline card: 4 nodes Wk1 → Wk12 → Wk24(now) → Wk40, completed segments orange-30, current node solid orange with halo, future segment gray.
- Motivational card: peach bg, Fraunces italic copy, dynamic days-left from due date.

## 4. Global polish

- Mount `<PostSheetProvider>` in `App.tsx` so `usePostSheet` works app-wide.
- Add card-enter stagger via tailwind `animate-card-enter` + `style={{animationDelay: ...}}`.
- Buttons get `active:scale-[0.97] transition-transform`.
- Update `index.html` `<title>` and Google Fonts link.

## 5. Out of scope (explicit)

- Other screens (Cart, Shop, Recipes, Courses, Auth, Onboarding, admin) — token updates will cascade visually but no structural rework.
- No backend, route, hook, or data changes. No new dependencies beyond existing Radix/shadcn primitives.

## 6. Verification

- Build passes (auto).
- Manually walk each of the 5 screens at 390px viewport via preview; confirm header/footer/watermark/cards/pills match tokens; confirm "+ Post" opens bottom sheet without navigation; confirm Bella avatar appears only on Bella bubbles; confirm week 24 → corn illustration and weeks 1–4 show em-dash stats.
