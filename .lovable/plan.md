

# Fix BabyTracker.tsx — Bottom Half Visual Redesign

## Overview
Update Recipe section, Trimester Overview, and Counters below line 220. No changes above the Natural Tip card. No logic changes.

## File: `src/pages/BabyTracker.tsx`

### Fix 1 — Recipe Section (lines 220-256)

**Header text** (lines 226-231):
- Eyebrow: fontSize `9` (was 7), color `rgba(255,255,255,0.65)`
- Headline: fontSize `16` (was 13)
- Nutrient pills: fontSize `9` (was 6.5), border `rgba(255,255,255,0.32)` (was 0.3)

**Recipe mini cards** (lines 237-245):
- Card: width `120` (was 86), borderRadius `16` (was 12), bg `rgba(255,255,255,0.20)` (was 0.12), border `rgba(255,255,255,0.28)` (was 0.18)
- Emoji area: height `62` (was 48), emoji fontSize `28` (was 22)
- Body: padding `9px 10px` (was 5px 7px)
- Title: fontSize `10` (was 9), fontWeight `700` (was 600), marginBottom `2`, remove `-webkit-line-clamp` truncation (let wrap to 2 lines naturally)
- Time: fontSize `8` (was 7), color `rgba(255,255,255,0.55)` (was 0.50)
- Add vitamin badges below time for each recipe's top vitamins

**"See all" button** (lines 249-253):
- borderRadius `22` (was 10), padding `9px 20px` (was 5px 14px), fontSize `13` (was 9)
- boxShadow `0 3px 10px rgba(0,0,0,0.08)`, display `block`, width `fit-content`, margin `10px auto`

### Fix 2 — Trimester Overview (lines 258-274)

- Section label: color `rgba(255,255,255,0.50)` (was 0.45), marginBottom `10` (was 8)
- Gap: `8px` (was 6px)
- Cards: borderRadius `16` (was 12), padding `12px 12px` (was 8px 10px)
- Remove `opacity: 0.5` for inactive — instead use distinct styles:
  - **Inactive**: bg `rgba(255,255,255,0.12)`, border `1px solid rgba(255,255,255,0.18)`, title color `rgba(255,255,255,0.65)` fontSize 12, weeks/desc color `rgba(255,255,255,0.40)`/`rgba(255,255,255,0.35)` fontSize 9/8
  - **Active**: bg `rgba(255,255,255,0.26)`, border `2px solid rgba(255,255,255,0.50)`, boxShadow `0 4px 16px rgba(0,0,0,0.08)`, position relative. Title: white fontWeight 700 fontSize 13. Weeks: `rgba(255,255,255,0.65)` fontWeight 500 fontSize 9. Desc: `rgba(255,255,255,0.65)` fontSize 9. Add white dot: 7px circle, position absolute top 10 right 10, bg white, opacity 0.7

### Fix 3 — Counters Redesign (lines 276-336)

- Section label: color `rgba(255,255,255,0.50)`, marginBottom `10`
- marginTop on section: `24px` (from Fix 4 spacing)

**Kick Counter tile** (lines 281-291):
- Container: bg `rgba(255,255,255,0.22)`, border `1.5px solid rgba(255,255,255,0.34)`, borderRadius `22` (was 16), padding `18px 14px` (was 14px 12px), boxShadow `0 4px 20px rgba(0,0,0,0.06)`
- Emoji: fontSize `24` (was 20), marginBottom `6` (was 4)
- Count: fontSize `52` (was 36), letterSpacing `-3px`, margin `6px 0 2px`
- Goal text: color `rgba(255,255,255,0.45)` (was 0.50), marginBottom `12` (was 8)
- "+ Kick" button: bg `white`, color `#FF6520`, fontWeight `700`, fontSize `14` (was 11), borderRadius `16` (was 12), padding `12px`, boxShadow `0 3px 12px rgba(0,0,0,0.10)`
- "Reset" button: bg `rgba(255,255,255,0.15)`, border `1px solid rgba(255,255,255,0.22)`, color `rgba(255,255,255,0.65)`, fontWeight `500`, fontSize `12` (was 10), borderRadius `12`, padding `8px`, marginTop `6` (was 5)

**Contraction Counter tile** (lines 294-327):
- Container: bg `rgba(255,255,255,0.18)`, border `1.5px solid rgba(255,255,255,0.28)`, borderRadius `22`, padding `18px 14px`, boxShadow `0 4px 20px rgba(0,0,0,0.06)`
- Emoji/label: same sizing as kick
- Count/timer: fontSize `52` (was 36/28), letterSpacing `-3px`
- Hint text: marginBottom `12`
- "Start timing" button: bg `rgba(255,255,255,0.90)`, color `#9060D0`, fontWeight `700`, fontSize `14`, borderRadius `16`, padding `12px`, boxShadow `0 3px 12px rgba(0,0,0,0.08)`
- "Stop timing" button (timing state): bg `rgba(255,255,255,0.90)`, color `#E05040`
- Pulse animation on timer wrapper: keep existing `contractionPulse` but update keyframes to `0 0 0 0 rgba(255,255,255,0.3)` → `0 0 0 8px rgba(255,255,255,0.0)`
- "Reset" buttons: same style as kick reset (bg `rgba(255,255,255,0.15)`, border, etc.)

**Alert card** (lines 330-335): no changes needed (already correct)

### Fix 4 — Spacing (throughout)

- Between Natural Tip and Recipe section: `marginTop: 20` (was 8 on line 222)
- Between Recipe and Trimester: `marginTop: 24` (was 12 on line 259)
- Between Trimester and Counters: `marginTop: 24`
- Bottom padding after counters: `paddingBottom: 32` (add to counters wrapper)
- All section labels: marginBottom `10`

## What Does NOT Change
- Lines 1-218 (everything above Natural Tip)
- All counter logic (addKick, start/stopContraction, shouldAlert)
- Supabase calls, routing, imports

