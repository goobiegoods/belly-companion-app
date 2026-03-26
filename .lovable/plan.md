

# Fix CantSleep.tsx — Card Layout, Fullscreen Viewer, Empty Space, Breathe Polish

## Changes

### `src/data/cantSleepData.ts`
- Update `AFFIRMATION_CATEGORIES` to include `preview` text and per-card border colors:
  - Card 1: 🌸 "My body knows exactly what it's doing." border `rgba(255,180,255,0.15)`
  - Card 2: ⭐ "Every sleepless hour is love in action." border `rgba(180,220,255,0.15)`
  - Card 3: 🔥 "I am stronger than I know tonight." border `rgba(255,200,150,0.15)`
  - Card 4: 🌿 "This baby chose me for a reason." border `rgba(150,230,180,0.15)`

### `src/pages/CantSleep.tsx` — Full rewrite

**Root container**: Change from dark purple full-screen bg to `#FEF8F4` background, `height: 100dvh`, flex column, overflow hidden. Dark purple only lives inside hero card and fullscreen overlay.

**Header**: Change to warm topbar style — `rgba(254,248,244,0.85)`, `blur(24px)`, back button color `rgba(200,88,40,0.5)`.

**Hero card**: Keep dark purple gradient, shrink-0, unchanged design.

**Tab content area**: `flex: 1, overflow-y: auto, padding-bottom: 24px`.

**AffirmationsTab rewrite**:
- Section label: "TAP A CARD TO READ" — 7px uppercase, color `rgba(200,88,40,0.4)`, weight 600, letterSpacing 0.12em
- Horizontal scroll row: flex, gap 8px, padding 0 16px, hide scrollbar
- 4 cards: 148px × 95px fixed, shrink-0, rounded-16px, each with unique gradient + border from data
- Card content: emoji 20px top → italic affirmation preview 8px middle (max 2 lines, overflow hidden) → "TAP TO READ" 6px uppercase bottom
- On tap: open fullscreen, cycle to next

**Fullscreen affirmation overlay rewrite**:
- Fixed inset-0, z-100, dark gradient bg
- Back button: top 52px left 20px, 13px, color `rgba(255,200,255,0.6)`
- Center card: max-width 340px, rounded-24px, padding 32px 26px, gradient `#3D2060→#5A2880`, shadow `0 16px 48px rgba(60,0,100,0.4)`
  - Emoji 44px with float animation
  - Affirmation text 16px italic, color `rgba(255,240,255,0.92)`, line-height 1.7
  - "TAP ANYWHERE FOR NEXT" 10px uppercase subtext
- Dot nav below card: 6 dots, active = pill 20×7px `rgba(255,180,255,0.7)`, inactive = circle 7×7px
- Bottom text: "You are doing beautifully, mama 🌸" 11px italic
- Fade transition on content change via `fadeSwap` keyframe + key-based re-render

**BreatheTab rewrite** — warm orange palette instead of purple:
- Phase label: 10px uppercase, color `rgba(200,88,40,0.5)`, weight 600
- Rings: use warm orange tints `rgba(255,140,90,...)` instead of purple
- Bubble: warm gradient, orange glow
- Countdown: 28px, weight 300, color `#A84E28`
- Dots: active `rgba(200,88,40,0.7)`, inactive `rgba(200,88,40,0.2)`
- Quote: 11px italic, `rgba(180,100,60,0.45)`
- Button: bg `rgba(255,120,64,0.12)`, border `rgba(255,120,64,0.25)`, color `#C85828`, 12px weight 600

**QuizTab**: Keep existing logic, just ensure no extra spacing/empty void.

## Files
- `src/data/cantSleepData.ts` — update AFFIRMATION_CATEGORIES with preview + border
- `src/pages/CantSleep.tsx` — full rewrite of layout, affirmations, breathe styling

No routing, Supabase, or other file changes.

