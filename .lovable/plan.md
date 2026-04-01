

# Fix Profile.tsx — 9 Visual Updates

## Changes — `src/pages/Profile.tsx` only

### 1. Name Casing
Replace `titleCase` (line 28) with a `formatName` that splits on spaces and title-cases each word. Use it on line 56 for the hero name display.

### 2. Topbar
Add a topbar div above the hero card with "Settings" text link on the right side. Outfit 500 13px `rgba(255,255,255,0.60)`. On tap, call `setEditing(true)` (since there's no settings route — reuse edit mode).

### 3. Avatar
Line 52-55: Update circle to 76px, `boxShadow: "0 0 0 4px rgba(255,255,255,0.28), 0 0 0 8px rgba(255,255,255,0.10)"`. Initial letter: Fraunces 700 30px `#FF6520`.

### 4. Name + Sub
- Name (line 56): Fraunces 700 **26px** white, `letterSpacing: "-0.3px"`
- Sub (line 57-58): Outfit 400 **12px** `rgba(255,255,255,0.55)`
- Pregnancy badge (line 60-63): `rgba(255,255,255,0.20)` bg, `rgba(255,255,255,0.30)` border, `borderRadius: 20px`, `padding: "4px 14px"`, Outfit **600 11px** white

### 5. Stats Row
Line 74: bg `rgba(255,255,255,0.18)`, border `rgba(255,255,255,0.26)`, `borderRadius: 16px`
Line 75: Fraunces 900 **28px** white `letterSpacing: -1`
Line 76: Outfit 600 **8px** `rgba(255,255,255,0.45)` uppercase

### 6. Achievement Badges
- Section label (line 83): color `rgba(255,255,255,0.50)`
- Earned cards (line 86-87): `rgba(255,255,255,0.22)` bg, `rgba(255,255,255,0.34)` border, `borderRadius: 14px`, `padding: "10px 8px"`
- Emoji: fontSize **22px**, marginBottom 4
- Label: Outfit **600 9px** white
- Locked: opacity **0.25**

### 7. Menu Items
Lines 117-131: Wrap each row in individual glass cards instead of a single card with dividers. Each: `rgba(255,255,255,0.16)` bg, `rgba(255,255,255,0.22)` border, `borderRadius: 16px`, `padding: "13px 14px"`. Icon circle: **38px**, `rgba(255,255,255,0.20)` bg, `rgba(255,255,255,0.28)` border, emoji **18px**. Title: Outfit 600 14px white. Chevron: `rgba(255,255,255,0.35)` 14px.

### 8. Upgrade Card
Lines 143-156: Update to `rgba(255,255,255,0.24)` bg, `1.5px solid rgba(255,255,255,0.40)` border, `borderRadius: 20px`, `padding: "15px 14px"`. Add ⭐ circle 40px `rgba(255,255,255,0.25)` bg. Title: Fraunces 700 **18px**. Sub: `rgba(255,255,255,0.62)` Outfit 400 11px. "Go Pro" button: white bg, `#FF6520` text, Outfit 700 13px, borderRadius 20px, padding `8px 18px`, boxShadow `0 3px 12px rgba(0,0,0,0.10)`.

### 9. Section Labels
All section labels ("MY ACHIEVEMENTS", "MY JOURNEY", "PREMIUM", "ACCOUNT"): color `rgba(255,255,255,0.50)`.

## File
- `src/pages/Profile.tsx` — all 9 fixes inline, no other files

