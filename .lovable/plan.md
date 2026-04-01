

# Fix Lesson Reader + QuizBlock — White-on-Orange Readability

## Overview
All lesson reader text is dark brown on orange — completely unreadable. Convert everything to white/rgba-white. Two files touched.

## Files Changed

| File | Scope |
|---|---|
| `src/pages/Courses.tsx` | Lines 105-214 (lesson reader section only) + course completion screen (lines 70-88) |
| `src/components/QuizBlock.tsx` | Full file — light theme colors |

## Courses.tsx — Lesson Reader (lines 105-214)

### Topbar (line 107-113)
- Container: `background: "rgba(255,140,66,0.65)"`, `backdropFilter: "blur(16px)"`, `borderBottom: "1px solid rgba(255,255,255,0.14)"`
- "← Back": `color: "white"`, Outfit 600 13px
- Title: `color: "white"`, `fontFamily: "'Fraunces', serif"`, `fontWeight: 700`, `fontSize: 16`
- Lesson badge: `background: "rgba(255,255,255,0.20)"`, `border: "1px solid rgba(255,255,255,0.30)"`, `color: "white"`, Outfit 600 11px

### Hero area (lines 115-127)
- "LESSON X" eyebrow: `color: "rgba(255,255,255,0.55)"` (was `rgba(42,18,0,0.5)`)
- Title: `color: "white"`, `fontFamily: "'Fraunces', serif"`, `fontWeight: 800`, `fontSize: 26`
- Duration badge: `background: "rgba(255,255,255,0.20)"`, `border: "1px solid rgba(255,255,255,0.30)"`, `color: "white"`
- Progress dots: completed → `rgba(255,255,255,0.70)` (was `rgba(42,18,0,0.4)`)

### Content area (lines 128-201)
- **Intro paragraph** (line 129): `color: "rgba(255,255,255,0.88)"`, fontSize 15, lineHeight 1.75
- **"What you'll learn" card** (lines 130-140): `background: "rgba(255,255,255,0.20)"`, `border: "1.5px solid rgba(255,255,255,0.32)"`, `borderRadius: 18`, `backdropFilter: "blur(12px)"`, remove borderLeft. Label: `rgba(255,255,255,0.55)`. Dots: `rgba(255,255,255,0.60)`. Text: `rgba(255,255,255,0.88)`
- **Section headings** (line 143): `color: "white"`, `fontFamily: "'Fraunces', serif"`, fontSize 20, fontWeight 700
- **Section body** (line 144): `color: "rgba(255,255,255,0.80)"`, fontSize 14, lineHeight 1.7
- **Tip cards** (lines 146-149): `background: "rgba(255,240,180,0.15)"`, `border: "1px solid rgba(255,220,120,0.25)"`, `borderRadius: 16`. Label: white. Text: `rgba(255,255,255,0.85)`
- **"Did you know" card** (lines 153-156): `background: "rgba(255,255,255,0.18)"`, `border: "1px solid rgba(255,255,255,0.26)"`, `borderRadius: 16`. All text: white/rgba-white
- **Reflection card** (lines 157-169): `background: "rgba(220,200,255,0.12)"`, `border: "1px solid rgba(200,170,255,0.20)"`, `borderRadius: 16`. All text: white. Textarea: `background: "rgba(255,255,255,0.15)"`, `border: "1px solid rgba(255,255,255,0.25)"`, `color: "white"`, placeholder white. Save button: `background: "white"`, `color: "#FF6520"`
- **Quiz section** (lines 170-197): Question text: white. Option buttons unanswered: `background: "rgba(255,255,255,0.18)"`, `border: "1px solid rgba(255,255,255,0.26)"`, `color: "white"`. Correct: `background: "rgba(100,220,130,0.25)"`, `border: "1px solid rgba(100,220,130,0.45)"`, `color: "rgba(200,255,220,0.95)"`. Wrong: `background: "rgba(255,100,100,0.20)"`, `border: "1px solid rgba(255,130,130,0.35)"`. Explanation card: `background: "rgba(255,255,255,0.15)"`, text white
- **Key takeaway card** (lines 198-201): Keep dark bg `#2A1200` — this is intentional dark card. Text stays light (already correct)

### Bottom bar (lines 203-212)
- Container: `background: "rgba(255,140,66,0.65)"`, `backdropFilter: "blur(16px)"`, `borderTop: "1px solid rgba(255,255,255,0.14)"`
- "← Previous" button: `background: "rgba(255,255,255,0.20)"`, `color: "white"`
- Complete button: `background: "white"`, `color: "#FF6520"`, Outfit 700

### Course completion screen (lines 70-88)
- Check circle: keep white bg
- Title: `color: "white"` (was `#2A1200`)
- All text: white/rgba-white
- Button: `background: "white"`, `color: "#FF6520"`

## QuizBlock.tsx — Light Theme Update

Only change the non-dark-theme (light) values:

- **Outer container** (line 44, 48, 51): `cardBg` → `"rgba(255,255,255,0.20)"`, `cardBorder` → `"1.5px solid rgba(255,255,255,0.32)"`, remove boxShadow for light
- **Header** (line 40): keep gradient but make `"linear-gradient(135deg, rgba(255,100,30,0.60), rgba(255,140,60,0.40))"`, add `borderBottom: "1px solid rgba(255,255,255,0.20)"`
- **"QUICK CHECK" label** (line 55): fontSize 9 (was 8), `color: "rgba(255,255,255,0.65)"`
- **Question text** (line 64): `color: "white"`, `fontFamily: "'Fraunces', serif"`, fontWeight 700, fontSize 15
- **Option cards unanswered** (line 72-74): bg → `"rgba(255,255,255,0.18)"`, border → `"1px solid rgba(255,255,255,0.26)"`, textColor → `"white"`
- **Correct** (lines 76-79): bg → `"rgba(100,220,130,0.25)"`, border → `"1px solid rgba(100,220,130,0.45)"`, textColor → `"rgba(200,255,220,0.95)"`
- **Wrong** (lines 80-83): bg → `"rgba(255,100,100,0.20)"`, border → `"1px solid rgba(255,130,130,0.35)"`, textColor → `"rgba(255,200,200,0.95)"`
- **Correct highlight** (lines 84-88): same as correct
- **Emoji** (line 104): fontSize 24 (was 20)
- **Option text** (line 105): fontSize 11 (was 7.5), fontWeight 600
- **Fun fact card** (lines 116-127): bg → `"rgba(255,255,255,0.15)"`, border → `"rgba(255,255,255,0.25)"`. Correct label: `"rgba(200,255,220,0.95)"`. Wrong label: `"rgba(255,200,200,0.95)"`. Body text: `"rgba(255,255,255,0.80)"`
- **Continue button** (lines 131-139): `background: "white"`, `color: "#FF6520"`, Outfit 700 13px, borderRadius 14, remove gradient and boxShadow

## What Does NOT Change
- Course list screen styling
- Lesson list screen styling
- Lesson content data
- Supabase queries, routing, auth
- Dark theme (CantSleep) QuizBlock values
- Key takeaway dark card (already correct)

