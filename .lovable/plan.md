

# Make All Can't Sleep Tabs Fullscreen

## What Changes
When a user taps on the Baby Quiz or Breathe tab, each should expand into a fullscreen overlay (just like the affirmation cards already do when tapped). The small card previews in the scroll row stay as entry points, but the actual experience is fullscreen.

## Approach

### `src/pages/CantSleep.tsx`

**1. QuizTab — Add fullscreen mode**
- Add a `fullscreen` state (default `true` since selecting the tab means you want to play)
- When active, render a `fixed inset-0 z-[100]` overlay with dark purple gradient background (matching affirmation fullscreen style)
- Move the score display and QuizBlock into this fullscreen container
- Add a "← Back" button (top-left, same style as affirmation viewer) that navigates back to main screen
- The quiz content centers vertically in the overlay with proper padding

**2. BreatheTab — Add fullscreen mode**
- Same pattern: `fullscreen` state, defaults to `true`
- Render a `fixed inset-0 z-[100]` overlay with the dark purple gradient background
- Center the breathing rings, countdown, quote, and start/stop button vertically
- Add "← Back" button top-left
- Scale up the rings visualization (from 140px to ~200px container) to fill more space
- Keep warm orange accents for rings/text but against the dark purple bg:
  - Phase label: `rgba(255,220,255,0.6)` instead of orange
  - Countdown: `#FFF0FF` instead of `#A84E28`
  - Rings: `rgba(255,180,255,...)` dashed borders
  - Quote: `rgba(255,200,255,0.4)`
  - Button: `rgba(255,180,255,0.2)` bg, `#FFF0FF` text

**3. No changes to AffirmationsTab** — already has fullscreen mode

### Files
- `src/pages/CantSleep.tsx` — wrap QuizTab and BreatheTab content in fullscreen overlays

