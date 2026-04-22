

# Baby Tracker — Fix emoji ↔ fruit name mismatches & lowercase fruit names

## What's actually going on

Two separate bugs in `src/data/pregnancyWeeks.ts`:

1. **Emoji mismatches.** The data already uses inline Unicode emojis (no image assets — that part of your diagnosis was a red herring). But many entries pair the wrong emoji with the wrong fruit name, e.g.:
   - Week 13: 🍋 + "Peach" → should be 🍑
   - Week 14: 🍑 + "Lemon" → should be 🍋
   - Week 22: 🌽 + "Papaya" → should be 🍐 (papaya)
   - Week 23: 🥭 + "Grapefruit" → should be 🍊
   - …plus several more across weeks 8, 11, 29, 30, 32, 37, 38, 40.

2. **Capitalisation drift.** The `getFruitName()` helper in `BabyTracker.tsx` lowercases names by matching against a hard-coded list, but the list misses several entries ("raspberry", "kumquat", "jicama", "winter melon", "swiss chard", "romaine lettuce", "head of lettuce", "small watermelon"). When no match is found it falls back to the original `babySize` string, which is capitalised — so you see "About the size of a Jicama" instead of "about the size of a jicama".

## Important: I will NOT bulk-replace the data array

Your spec includes a replacement array that drops `momSymptoms` and `naturalTip` from every week. The current schema has those fields and they're used throughout the page (the "What you might feel" pills + "Natural tip" card). Replacing wholesale would delete weeks of pregnancy content. I'll surgically patch only the emojis.

## Fix 1 — Patch emojis in `src/data/pregnancyWeeks.ts`

Updated emojis week-by-week so each emoji matches the same row's `babySize`:

| Week | Fruit | Old emoji | New emoji |
|---|---|---|---|
| 8  | Raspberry        | 🫑 | 🍓 |
| 11 | Fig              | 🍋 | 🫐 |
| 13 | Peach            | 🍋 | 🍑 |
| 14 | Lemon            | 🍑 | 🍋 |
| 22 | Papaya           | 🌽 | 🍐 |
| 23 | Grapefruit       | 🥭 | 🍊 |
| 29 | Butternut squash | 🎃 | 🥥 |
| 30 | Cabbage          | 🥦 | 🥬 |
| 32 | Jicama           | 🎃 | 🥔 |
| 37 | Swiss chard      | 🥦 | 🥬 |
| 38 | Winter melon     | 🎃 | 🍈 |
| 40 | Watermelon       | 🎃 | 🍉 |

All other weeks already match — no change.

## Fix 2 — Make all fruit names render lowercase

In `src/pages/BabyTracker.tsx`, simplify `getFruitName()` so it always lowercases (no hard-coded allowlist that silently fails):

```ts
function getFruitName(babySize: string): string {
  // Strip parentheticals like "(pre-conception)" then lowercase.
  return babySize.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
}
```

Result: every "About the size of a …" line and the header subtitle will be sentence-case, e.g. "About the size of a jicama", "About the size of a winter melon".

## Files touched

- `src/data/pregnancyWeeks.ts` — 12 single-character emoji edits.
- `src/pages/BabyTracker.tsx` — replace `getFruitName()` body (~12 lines → 3 lines).

## Test plan (preview)

1. Open Baby Tracker. Use the week pills to scrub through:
   - **W8** → 🍓 raspberry
   - **W11** → 🫐 fig
   - **W13** → 🍑 peach
   - **W14** → 🍋 lemon
   - **W20** → 🍌 banana ✓ (sanity check)
   - **W22** → 🍐 papaya
   - **W23** → 🍊 grapefruit
   - **W25** → 🥦 cauliflower ✓
   - **W26** → 🥒 zucchini ✓
   - **W29** → 🥥 butternut squash
   - **W32** → 🥔 jicama
   - **W38** → 🍈 winter melon
   - **W40** → 🍉 watermelon
2. On every week, confirm subtitle reads "About the size of a {lowercase name}" — including jicama, swiss chard, winter melon.
3. Confirm the small fruit chip in the "Baby Size" card shows the same emoji as the big hero card (they read from the same `weekData.emoji`).

