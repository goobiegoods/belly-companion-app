

# Fix Community.tsx — 7 Visual Updates

## Changes — `src/pages/Community.tsx` only

### 1. Hero Headline (lines 299-302)
- "Mama": change to `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 32`, `lineHeight: "1.0"`, `display: "block"` (currently Outfit 28px 700)
- "community": keep Fraunces 800 italic but update `fontSize: 38` (was 34), add `marginBottom: 5`, `lineHeight: "1.0"`, `display: "block"`
- Add sub line below: `"Week {currentWeek} mamas · {posts.length} members"` — Outfit 400 11px `rgba(255,255,255,0.52)`

### 2. Filter Pills (lines 312-326)
- Active pill: `background: "white"`, `color: "#FF6520"`, Outfit **700 12px**, `borderRadius: 20`, `padding: "5px 14px"`, `border: "none"` (mostly correct, bump font to 12px)
- Inactive pills: `background: "rgba(255,255,255,0.16)"`, `border: "1px solid rgba(255,255,255,0.24)"`, `color: "rgba(255,255,255,0.80)"`, Outfit **500 11px**, `borderRadius: 20`, `padding: "5px 12px"`

### 3. Post Cards (lines 338-371)
- Card container: `background: "rgba(255,255,255,0.16)"`, `border: "1px solid rgba(255,255,255,0.24)"`, `borderRadius: 18`, `padding: "13px 14px"`
- Avatar circles: `rgba(255,255,255,0.24)` bg, Outfit 700 12px white
- Author name: Outfit **700 12px** white
- Week badge: `rgba(255,255,255,0.18)` bg, `rgba(255,255,255,0.26)` border, Outfit **600 9px** white
- Time: `rgba(255,255,255,0.40)` Outfit 400 10px
- Post title: Outfit **700 15px** white, `lineHeight: "1.25"` (was 14px 600)
- Post body: Outfit 400 **11px** `rgba(255,255,255,0.65)`, `lineHeight: "1.5"`, 2-line clamp (was 12px)
- Action row: `borderTop: "1px solid rgba(255,255,255,0.12)"`, `paddingTop: 8`, `marginTop: 8`
- Heart/comment counts: `rgba(255,255,255,0.45)` (was `var(--w40)`)

### 4. Category Pills on Posts (lines 355-357)
Replace the single generic style with category-specific colors:
- question: `rgba(255,255,255,0.20)`
- tip: `rgba(200,255,220,0.20)`
- story: `rgba(220,200,255,0.20)`
- support: `rgba(255,255,200,0.20)`
- All: white text, `borderRadius: 8`, `padding: "2px 8px"`, Outfit **700 9px**, no border

### 5. Pinned Post
- Sort posts to find the one with highest likes
- Render it first with stronger card: `rgba(255,255,255,0.22)` bg, `rgba(255,255,255,0.34)` border
- Add "PINNED" badge top-right: `rgba(255,255,255,0.25)` bg, Outfit 700 8px white, `borderRadius: 6`, `padding: "2px 7px"`, `position: "absolute"` in a relative container

### 6. Notification Bell (line 304)
- Already using `<NotificationBell>` component — update inline on the component usage or the bell itself is in NotificationBell.tsx. Since spec says "Community.tsx only", wrap the bell in a styled div: 32px circle, `rgba(255,255,255,0.20)` bg, `rgba(255,255,255,0.30)` border, white icon 14px. The NotificationBell component already renders a button — just update the style props passed or wrap it.

### 7. "+ POST" Button (lines 305-308)
- `background: "white"`, `color: "#FF6520"`, Outfit **700 13px**, `borderRadius: 20`, `padding: "7px 16px"`, `boxShadow: "0 2px 10px rgba(0,0,0,0.08)"`

## File
- `src/pages/Community.tsx` — all 7 fixes inline, no other files

