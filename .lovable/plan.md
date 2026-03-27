

# Inverted Orange — HomePage.tsx + index.css Test

## Overview
Flip the home screen to a deep orange gradient background with frosted white glass cards. Only two files touched.

## Changes

### `src/index.css` (lines 90-93)
Replace the `body, #root` background:
```css
body, #root {
  background: linear-gradient(160deg, #FF6520 0%, #FF8C40 35%, #FFA055 65%, #FF7830 100%) fixed;
  min-height: 100vh;
}
```

### `src/pages/HomePage.tsx` — full color inversion

**Root div (line 32):** Remove `background: "#FEF8F4"` — let the global orange gradient show through. Set `background: "transparent"`.

**Header (lines 34-49):**
- BELLY title: `color: "white"`
- "Virtual Doula": `color: "rgba(255,255,255,0.6)"`
- Logo icon bg: `rgba(255,255,255,0.2)` border `rgba(255,255,255,0.3)`
- Greeting pill: `background: rgba(255,255,255,0.16)`, `border: 1px solid rgba(255,255,255,0.28)`, `backdropFilter: blur(16px)`, text `rgba(255,255,255,0.7)`

**Hero card (lines 53-74):** Replace `belly-hero-gradient` class with inline:
- `background: rgba(255,255,255,0.22)`, `backdropFilter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.35)`
- Remove the gradient class. All text stays white (already is).

**Streak card (lines 78-108):** Replace `belly-glass-card` with inline:
- `background: rgba(255,255,255,0.16)`, `backdropFilter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.28)`
- Streak title: `color: white`
- "Keep checking in": `rgba(255,255,255,0.7)`
- Streak number: `rgba(255,255,255,0.9)`, `fontWeight: 200`
- "Journey milestones" label: `rgba(255,255,255,0.45)`
- Progress track: `rgba(255,255,255,0.2)`, fill: `rgba(255,255,255,0.6)`
- Milestone dots active: `rgba(255,255,255,0.6)`, inactive: `rgba(255,255,255,0.2)`
- Milestone labels: `rgba(255,255,255,0.4)`
- Fire emoji bg: `rgba(255,255,255,0.2)` (remove orange gradient)

**This Week cards (lines 112-130):**
- Section label: `rgba(255,255,255,0.45)`
- All 3 cards: `background: rgba(255,255,255,0.16)`, `border: 1px solid rgba(255,255,255,0.28)`, `backdropFilter: blur(16px)`
- Card titles: `white`
- Card body text: `rgba(255,255,255,0.7)`

**Your Journey cards (lines 134-157):**
- Section label: `rgba(255,255,255,0.45)`
- Both buttons: `background: rgba(255,255,255,0.16)`, `border: 1px solid rgba(255,255,255,0.28)`, `backdropFilter: blur(16px)` (replace `belly-glass-card`)
- Icon containers: `background: rgba(255,255,255,0.18)`, `border: 0.5px solid rgba(255,255,255,0.28)`
- Titles: `white`
- Subtitles: `rgba(255,255,255,0.7)`
- AI badge: `background: rgba(255,255,255,0.15)`, `border: rgba(255,255,255,0.28)`, `color: white`

**Daily check-in (lines 161-165):**
- Same glass card style, title white, subtitle `rgba(255,255,255,0.7)`

**Can't Sleep (lines 169-180):**
- `background: rgba(255,255,255,0.12)`, `border: 1px solid rgba(255,255,255,0.2)`
- Icon bg: `rgba(255,255,255,0.18)`
- Title: `white`, subtitle: `rgba(255,255,255,0.6)`, chevron: `rgba(255,255,255,0.4)`

## Files
- `src/index.css` — body/root background
- `src/pages/HomePage.tsx` — all inline colors inverted to white-on-orange

No other files touched.

