# Belly v4 — Full Design System Rollout + 2 New Features

Apply the complete warm-cream/orange-border design language to every screen, then add Belly Breathe and Feeding Tracker as new routes. Zero changes to data, auth, or routing logic — additive visuals + two new pages.

## 1. Global tokens (`src/index.css`, `tailwind.config.ts`, `index.html`)

- Add Fraunces (ital 300,400) + Nunito (400–800) via Google Fonts in `index.html`.
- Extend CSS with the full token set:
  - Page `#F0E8DC`, card `#FFFFFF`, border `1.5px solid #E8702A`, shadow `0 3px 14px rgba(232,112,42,0.10)`.
  - Primary `#E8702A`, header gradient `135deg #E8702A → #C84E08`, nav `#C85818`.
  - Pills, inputs, send button, avatars, text colors, eyebrow label per spec.
- Utility classes: `.belly-card`, `.belly-pill-orange`, `.belly-pill-neutral`, `.belly-btn-primary-v4`, `.belly-input`, `.belly-send`, `.belly-avatar`, `.belly-eyebrow`, `.belly-watermark`, `.belly-header-bar`, `.belly-card-header-gradient`.
- Keyframes: `card-enter` (opacity+translateY, 280ms stagger 50ms), `breath-cycle` (1→1.15 4s, hold 7s, →1 8s, loop), button press `scale(0.97)`.

## 2. Shared chrome

- **AppHeader** (already exists): keep gradient + glow circles, accept `rightSlot` per screen (greeting pill / week pill / "+ Post" / "Settings" / "breathe" / "today" / back-arrow + title variants for Ask Bella).
- **BottomNav** (already exists): expand to 6 tabs in order Today · Baby · Ask Bella · Mamas · Shop · Journey, SVG line icons stroke 1.6, white active indicator bar 14×2.
- **PostSheet** (already exists): keep as global bottom sheet — already triggered via `usePostSheet()`.

## 3. Screen redesigns

**Today (`HomePage.tsx`)** — already redone in last turn; verify: time-aware greeting pill, Ask Bella card with watermark, Week card OPTION A (corn emoji circle fully inside orange header zone, white body below), Belly Breathe orange gradient card linking to `/breathe`, 3 milestone boxes, Today's Recipe row, Quick Navigate pills, + new Feeding Tracker card linking to `/feeding`. "doula" watermark top-left.

**Baby (`BabyTracker.tsx`)** — rewrite presentation only:
- Watermark "baby" top-left.
- Title block "Your / baby's world" + subtitle.
- Size card OPTION A: replace `BabySizeIllustration` SVG with native food emoji (62px) inside 110px radial-gradient circle. Build a 1–40 week → emoji map (1–5 🌱, 6 🫛, 7 🫐, 8 🍇, 9 🍒, 10 🍊, 11 🍋‍🟩, 12 🍋‍🟩, 13 🍑, 14 🍋, 15 🍎, 16 🥑, 17 🍐, 18 🫑, 19 🥭, 20 🍌, 21 🥕, 22 🥥, 23 🍆, 24 🌽, 25 🥬, 26 🥒, 27 🥬, 28 🍆, 29 🎃, 30 🥬, 31 🍍, 32 🎃, 33 🍍, 34 🍈, 35 🍈, 36 🥬, 37 🍈, 38 🥬, 39 🍉, 40 🍉).
- Stats trio (Weight / Length / Age) per token spec; weeks 1–4 show `—` in `#B8A898`.
- Horizontal week pill scroller (orange active, neutral inactive, locked = neutral + 🔒 opacity 0.6).
- Development card + Nutrition link card.

**Ask Bella (`AskDoula.tsx`)** — presentation only:
- Custom header variant: back-arrow circle + "Ask Bella" mixed font + Bella avatar with green dot.
- Context pills row + divider.
- User bubbles orange right-aligned no avatar; Bella bubbles white with orange border + 🌸 avatar. Italic Fraunces inline for emphasized terms (regex-wrap a small whitelist).
- Suggestion chips row, input bar with camera + orange send circle.
- Watermark "bella" top-right.

**Mamas (`Community.tsx`)** — presentation:
- Watermark "mamas" top-right.
- Title "Mama / community" + member subtitle.
- Category filter pills (All active orange).
- Post cards in white + orange border per spec; "+ Post" header pill opens PostSheet.

**Journey (`Profile.tsx`)** — presentation:
- Watermark "journey" top-center.
- Profile block: 64px avatar orange border (no gradient ring).
- Stats row (Week / Days to go).
- Streak card with progress bar.
- Achievements grid (4-per-row, progress bar in eyebrow).
- Journey timeline card with 4 nodes (Week 1, 12, current, 40) computed from `current_week`.
- Motivational card with dynamic days-left text.
- "Track feeds" entry point linking to `/feeding`.

## 4. New routes

**`/breathe` → `src/pages/BellyBreathe.tsx`** (new)
- AppHeader with "breathe" ghost pill.
- Title "Belly / breathe & rest" + subtitle.
- Category filter pills (All · Breathing · Sleep · Meditation · Anxiety) — client-side filter on a local in-file dataset.
- Featured 4-7-8 orange-gradient card with animated breathing circle (CSS `breath-cycle` + JS phase label cycling Inhale 4s → Hold 7s → Exhale 8s).
- "Start breathing →" expands a full-screen overlay running the same animation larger with phase text.
- 3 category cards (Sleep stories / Body scan / Anxiety relief) — static counts.
- "Continue where you left off" card (localStorage-backed last-session marker, optional).
- Nav highlights Today (per spec).

**`/feeding` → `src/pages/FeedingTracker.tsx`** (new)
- AppHeader with "today" ghost pill.
- Title "Feeding / tracker" + subtitle.
- Orange-gradient summary card with 3 dynamic boxes (Feeds today / Total ml / Since last).
- 3 quick-log cards (Breastfeed / Bottle / Pump) — each opens its own bottom-sheet modal (local component, mirrors PostSheet styling):
  - Breastfeed: side selector (L/R/Both) + duration start/stop timer + notes.
  - Bottle: ml input + type select (breast milk/formula/water) + notes.
  - Pump: side + ml + notes.
- Today's log list (white card, swipeable delete via touch handlers, "Done" pill on each row).
- Weekly summary card: 7-day mini bar chart (pure SVG) + avg feeds/day, avg ml/day.
- Persistence: new Lovable Cloud table `feed_logs` (see §6) with RLS.
- Add nav route + entry cards from Today and Journey.

## 5. Routing (`src/App.tsx`)

- Add `<Route path="/breathe" element={<BellyBreathe />} />` and `<Route path="/feeding" element={<FeedingTracker />} />`.
- Keep all existing routes untouched.

## 6. Backend (Lovable Cloud migration)

Single migration creating `public.feed_logs`:

```
id uuid pk default gen_random_uuid()
user_id uuid not null
kind text not null check (kind in ('breast','bottle','pump'))
side text                 -- L/R/Both for breast/pump
duration_seconds int      -- breast
amount_ml int             -- bottle/pump
bottle_type text          -- 'breast_milk'|'formula'|'water'
notes text
logged_at timestamptz not null default now()
created_at timestamptz not null default now()
```

GRANTs for `authenticated` (CRUD own rows) + `service_role` ALL. RLS enabled with `user_id = auth.uid()` for select/insert/update/delete. No anon grant.

## 7. Animations

- Wrap page sections in a small `<StaggerCards>` helper applying `card-enter` with `style={{ animationDelay: i*50+'ms' }}`.
- Add global `button { transition: transform 100ms } button:active { transform: scale(0.97) }` scoped to `.belly-press`.
- PostSheet + feed log sheets reuse the existing spring cubic-bezier.

## Out of scope

- No auth changes, no Supabase client edits, no edge function work, no changes to existing routes/data fetching, no Shop/Cart/Orders rewrites (they inherit tokens only).

## Technical notes

- Emoji mapping lives in a new `src/data/babyEmojiByWeek.ts` to avoid touching the SVG `BabySizeIllustration` consumers elsewhere (Shareable cards keep SVG).
- Watermarks rendered as a single `<BellyWatermark text size position />` helper.
- Breathing circle phase machine: `useEffect` with `setTimeout` chain {inhale 4000, hold 7000, exhale 8000}, cleanup on unmount.
- Time-aware greeting computed once per mount + on visibilitychange.
- Feeding timer uses `useRef` for start timestamp to avoid re-render loops.
