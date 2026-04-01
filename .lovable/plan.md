

# Fix Shop.tsx — 7 Visual Updates

## Changes — `src/pages/Shop.tsx` only

### 1. Screen Title (lines 222-225)
- "Belly Shop": `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 28`, `color: "white"`
- Sub: `color: "rgba(255,255,255,0.60)"`, `fontStyle: "italic"`, keep Outfit 400 12px

### 2. Tab Pills (lines 241-251)
- Active: `background: "white"`, `color: "#FF6520"`, `fontWeight: 700`, `fontSize: 13`, `padding: "6px 18px"`, `border: "none"`
- Inactive: `background: "rgba(255,255,255,0.18)"`, `border: "1px solid rgba(255,255,255,0.26)"`, `color: "rgba(255,255,255,0.78)"`, `fontWeight: 500`

### 3. Hero Banner (lines 256-264)
- "CURATED FOR PREGNANCY" (line 259): `color: "rgba(255,255,255,0.60)"`, Outfit 600 9px — already close, update fontWeight
- Title (line 260): `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 22`, `color: "white"`
- Sub body (line 261): `color: "rgba(255,255,255,0.72)"`
- "Shop all →" button (line 263): `background: "rgba(255,255,255,0.22)"`, `border: "1px solid rgba(255,255,255,0.35)"`, `color: "white"`, Outfit 600 12px, `borderRadius: 20`

### 4. Section Labels (lines 266, 286, 308)
- `color: "rgba(255,255,255,0.50)"` — replace current `rgba(200,88,40,0.4)`

### 5. Kit Cards (lines 269-283)
- Container: `background: "rgba(255,255,255,0.18)"`, `border: "1px solid rgba(255,255,255,0.26)"`, `borderRadius: 20`
- Emoji area: `background: "rgba(255,255,255,0.14)"`, `height: 80`, emoji `fontSize: 36`
- Tag badge: `background: "rgba(255,255,255,0.22)"`, `color: "white"`, Outfit 700 9px, `borderRadius: 8`
- Title: Outfit 700 15px white
- Description: `rgba(255,255,255,0.68)` Outfit 400 11px
- Contents: `rgba(255,255,255,0.52)` Outfit 400 10px
- Price: `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 20`, `color: "white"`
- "Add to cart" button: `background: "white"`, `color: "#FF6520"`, Outfit 700 13px, `borderRadius: 14`

### 6. Individual Remedy Rows (lines 288-305)
- Card: `background: "rgba(255,255,255,0.16)"`, `border: "1px solid rgba(255,255,255,0.22)"`
- Icon circle: `background: "rgba(255,255,255,0.20)"`
- Name: Outfit 600 13px white
- Brand: `rgba(255,255,255,0.55)`
- Use text: `rgba(255,255,255,0.65)`
- Price: `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 16`, `color: "white"`
- "✓ Pregnancy safe": `color: "rgba(200,255,220,0.70)"`
- "Add" button: `background: "white"`, `color: "#FF6520"`
- Apply same pattern to tea rows (lines 310-325)

### 7. Cart Icon (lines 226-239)
- Circle: `background: "rgba(255,255,255,0.22)"`, `border: "1px solid rgba(255,255,255,0.30)"`, remove boxShadow
- SVG stroke: `"white"` instead of `"#C85828"`
- Badge: `background: "white"`, `color: "#FF6520"`, remove gradient

### Also update
- Disclaimer card (lines 328-330): `background: "rgba(255,255,255,0.12)"`, `border: "1px solid rgba(255,255,255,0.18)"`, text `rgba(255,255,255,0.40)`
- Learn tab hero (lines 334-340): same Fraunces title treatment
- Course cards (lines 346-377): glass style with white text (same pattern as remedy cards)

## File
- `src/pages/Shop.tsx` — all 7 fixes inline, no other files

