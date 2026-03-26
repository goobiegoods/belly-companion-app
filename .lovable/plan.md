

# Fix CantSleep.tsx — Layout, Quiz, and Breathe

## Problem Summary
1. **Affirmations tab**: 4th card cut off, empty void below cards
2. **Quiz tab**: Full dark purple fullscreen overlay — should be inline on warm background
3. **Breathe tab**: Full dark purple fullscreen overlay — should be inline on warm background

## Changes — `src/pages/CantSleep.tsx` only

### 1. AffirmationsTab — Fix scroll row + add preview cards

**Scroll row** (line 118): Update styles to `gap: 10px`, `paddingRight: 16px`, add `WebkitOverflowScrolling: 'touch'`. Cards already have `shrink-0` and correct sizing — just ensure width 148px height 98px.

**Add below cards** (after line 138, inside the `<div>` return):
- "More for tonight" label: 7px uppercase, `rgba(200,88,40,0.4)`
- **Breathing preview card**: purple-tinted glass card with 🫧 icon, "4-7-8 Breathing" title, subtitle, chevron. On tap → call parent `setActiveTab("Breathe")`
- **Quiz preview card**: similar card with 🧠, "Baby Brain Quiz" title, subtitle. On tap → call parent `setActiveTab("Baby Quiz 🎮")`

This requires passing `onSwitchTab` callback from parent `CantSleep` into `AffirmationsTab`.

### 2. QuizTab — Remove fullscreen, render inline

**Remove** the `fixed inset-0 z-[100]` wrapper and dark purple background (lines 169-193).

**Replace** with inline content on warm background:
- Score row: "Baby Brain 🧠" label (`rgba(200,88,40,0.4)`) + score display (`#A84E28`)
- Quiz card with dark purple gradient header (question + progress bar) and warm-bg answer options
- Fun fact card slides in after answering
- Next/play-again button in warm orange style
- Footer text in warm colors
- Remove `darkTheme` prop from QuizBlock — or better: **inline the quiz logic** directly since QuizBlock's dark theme doesn't match the new design. Actually, keep using QuizBlock but remove `darkTheme` prop so it renders in light mode.

### 3. BreatheTab — Remove fullscreen, render inline

**Remove** the `fixed inset-0 z-[100]` wrapper (lines 226-273).

**Replace** with a normal `div` that fills the tab content area:
- `padding: 16px`, flex column, centered, gap 16px
- Phase label: 10px uppercase, `rgba(200,88,40,0.5)`, weight 600
- Rings: orange tints `rgba(255,120,64,0.15/0.25/0.35)` dashed borders
- Bubble: warm gradient `rgba(255,120,64,0.3)` with orange glow
- Countdown: 28px, weight 300, `#A84E28`
- Dots: active `rgba(200,88,40,0.7)`, inactive `rgba(200,88,40,0.2)`
- Quote: `rgba(180,100,60,0.45)`
- Button: bg `rgba(255,120,64,0.12)`, border `rgba(255,120,64,0.25)`, color `#C85828`

### 4. Parent component update

Pass `setActiveTab` to `AffirmationsTab` as `onSwitchTab` prop so preview cards can switch tabs.

## File
- `src/pages/CantSleep.tsx` — rewrite QuizTab, BreatheTab, and add preview cards to AffirmationsTab

