

# Fix BabyTracker.tsx — 9 Visual & Data Fixes

## Overview
Fix broken fruit emoji mapping, refine hero/card styling, add symptom chip color categories, and polish milestones. Single file: `src/pages/BabyTracker.tsx`.

## Fix 1 — Week-based Emoji Map (CRITICAL)

Replace `FRUIT_EMOJI_MAP` (name-based, lines 8-18) and `getFruitEmoji` (lines 20-25) with a direct `weekEmoji: Record<number, string>` map as specified. Fallback `'🥑'` instead of `'🍼'`. Remove `FRUIT_EMOJI_MAP` and `getFruitEmoji`. Update `fruitEmoji` on line 121 to `weekEmoji[selectedWeek] || '🥑'`.

Keep `getFruitName` but update it to extract from `weekData.babySize` (it already does this via the name keys — replace its key list with the `babySize` field values from pregnancyWeeks: "Poppy seed", "Sesame seed", "Lentil", "Blueberry", etc.).

The `weekEmoji` map (all 40 weeks) as provided in the request.

## Fix 2 — Hero Headline

Update lines 133-137:
- Reduce font sizes: "Your" → 22px (was 26), "baby's world" → 30px (was 34)
- Add week subtitle below: `Week {selectedWeek} · {fruitName} · ~{weekData.babyLength}` in Outfit 400 11px `rgba(255,255,255,0.55)`
- Padding: `12px 16px 4px` (was `px-4 pt-4 pb-3`)

## Fix 3 — Large Fruit Card

Update lines 139-157:
- borderRadius: `24` (was 22), padding: `28px 16px 20px` (was `24px 16px`)
- boxShadow: `0 4px 20px rgba(0,0,0,0.06)`
- Emoji: fontSize `88` (was 90) — minor tweak
- Stats row: bg `rgba(255,255,255,0.16)` (was 0.12), border `rgba(255,255,255,0.22)` (was 0.18), borderRadius `14` (was 12), padding `10px 8px` (was 8)
- Number: fontSize `20` (was 18)
- Label: fontSize `8` (was 7)

## Fix 4 — Browse Weeks Strip

Update lines 159-180:
- Week pills: width/height `40px`, `borderRadius: "50%"` (circle), remove padding
- Current: fontSize `13` (was 10), fontWeight `700`, boxShadow `0 3px 10px rgba(0,0,0,0.10)`
- Other: fontSize `12` (was 10), fontWeight `600` (was 500), border `rgba(255,255,255,0.26)` (was 0.22), bg `rgba(255,255,255,0.18)` (was 0.16)
- Gap: `8px` (was `1.5`/6px), padding `0 16px` (was `px-3`)

## Fix 5 — Baby Development Card

Update lines 184-187:
- borderRadius: `18` (was 16), padding: `14px 15px` (was `11px 13px`)
- Label: fontSize `9` (was 10), color `rgba(255,255,255,0.50)` (was 0.45), marginBottom `6` (was 4)

## Fix 6 — Baby Size Card

Update lines 189-198:
- borderRadius: `18` (was 16), padding: `13px 15px` (was `11px 13px`), gap: `12` (already 12)
- Icon circle: `48px` (was 38), bg `rgba(255,255,255,0.20)` (was 0.18), border `rgba(255,255,255,0.30)` (was 0.26), emoji fontSize `24` (was 18)
- "Baby Size" label: fontSize `9` (was 12), color `rgba(255,255,255,0.50)`, uppercase, add letterSpacing `0.1em`

## Fix 7 — Symptom Chips with Color Categories

Update lines 200-208. Add a helper function to categorize symptoms:

```typescript
function getSymptomCategory(symptom: string): 'physical' | 'emotional' | 'visible' | 'default' {
  const physical = ['backache', 'heartburn', 'cramp', 'pain', 'nausea', 'fatigue', 'breath', 'swelling', 'swollen', 'hemorrhoid', 'constipation', 'urination', 'discharge', 'congestion', 'leg cramp', 'dizziness', 'headache', 'bloating', 'gas'];
  const emotional = ['mood', 'dream', 'forgetfulness', 'brain', 'nesting', 'emotional', 'energy', 'sensitivity'];
  const visible = ['stretch mark', 'glow', 'skin', 'vein', 'linea', 'waddle'];
  const s = symptom.toLowerCase();
  if (physical.some(k => s.includes(k))) return 'physical';
  if (emotional.some(k => s.includes(k))) return 'emotional';
  if (visible.some(k => s.includes(k))) return 'visible';
  return 'default';
}
```

Color mapping per category:
- **physical**: bg `rgba(255,220,180,0.30)`, border `rgba(255,200,140,0.40)`
- **emotional**: bg `rgba(220,200,255,0.25)`, border `rgba(200,170,255,0.35)`
- **visible**: bg `rgba(200,240,220,0.20)`, border `rgba(170,220,200,0.30)`
- **default**: bg `rgba(255,255,255,0.20)`, border `rgba(255,255,255,0.28)`

Card: borderRadius `18`, padding `12px 14px`.

## Fix 8 — Natural Tip Card

Update lines 210-217:
- bg: `rgba(220,200,255,0.16)` (was 0.12), border: `rgba(200,170,255,0.24)` (was 0.20)
- borderRadius: `18` (was 16), padding: `13px 15px` (was `11px 13px`)
- Label color: `rgba(220,200,255,0.65)` (was `rgba(255,255,255,0.45)`)
- Icon circle: `36px` (was 38), bg `rgba(220,200,255,0.20)`, border `rgba(200,170,255,0.28)` (was white-based)
- Tip text: color `rgba(255,255,255,0.85)` (was 0.60), fontSize `13` (was 11), lineHeight `1.6` (was 1.55)

## Fix 9 — Milestones Section (NEW)

Add a new "Milestones" section after the Natural Tip card and before the recipe section. Simple static milestones based on week ranges:

```typescript
const milestones = [
  { emoji: '💓', title: 'First heartbeat', sub: 'Week 6', reached: selectedWeek >= 6 },
  { emoji: '🤸', title: 'First movements', sub: 'Week 16', reached: selectedWeek >= 16 },
  { emoji: '👂', title: 'Can hear your voice', sub: 'Week 23', reached: selectedWeek >= 23 },
  { emoji: '👀', title: 'Eyes open', sub: 'Week 28', reached: selectedWeek >= 28 },
  { emoji: '🫁', title: 'Lungs mature', sub: 'Week 36', reached: selectedWeek >= 36 },
];
```

Section title: Fraunces 700 22px white. Each card: glass style `rgba(255,255,255,0.16)` bg, 40px icon circle, Outfit 600 12px white title, Outfit 400 9px `rgba(255,255,255,0.58)` sub. Unreached milestones get lower opacity (0.45).

## What Does NOT Change
- Lines 220-348 (recipe, trimester, counters — already fixed)
- pregnancyWeeks.ts data
- All Supabase logic, routing, counter functionality
- Any other file

