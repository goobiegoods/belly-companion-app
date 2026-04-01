

# Fix BabyTracker.tsx — 8 Visual Updates

## Changes — `src/pages/BabyTracker.tsx` only

### 1. Hero Headline
Update font sizes: "Your" → Outfit 600 **26px**, "baby's world" → Fraunces 800 italic **34px**. Padding `16px 16px 10px`. Remove the week number/fruit illustration/babySize text from inside hero — that moves to the new fruit card.

### 2. Large Fruit Card (NEW)
Insert between hero and week strip. A centered card with:
- `background: rgba(255,255,255,0.18)`, `border: 1px solid rgba(255,255,255,0.28)`, `borderRadius: 22px`, `padding: "24px 16px"`, `textAlign: "center"`
- Fruit emoji at 90px with `drop-shadow(0 8px 20px rgba(0,0,0,0.15))` — derived from `weekData.babySize` keyword (same `FRUIT_EMOJI_MAP` pattern used in HomePage)
- "About the size of a [fruit]" — Fraunces italic 18px 700 white
- Stats row: 3 secondary cards (flex, gap 8) showing weight/length/week — each `rgba(255,255,255,0.12)` bg, `rgba(255,255,255,0.18)` border, 12px radius
  - Number: Fraunces 700 18px white
  - Label: Outfit 500 7px `rgba(255,255,255,0.45)` uppercase

### 3. Milestone Cards (Development, Size, Symptoms, Natural Tip)
Each card updated to: `rgba(255,255,255,0.16)` bg, `rgba(255,255,255,0.24)` border, `borderRadius: 16px`, `padding: "11px 13px"`. Add 38px emoji circles on left where applicable.
- Title: Outfit 600 12px white
- Sub/body: Outfit 400 9px `rgba(255,255,255,0.60)` (or 13px for development body)

### 4. Browse Weeks Strip
Add "Browse weeks" label (Outfit 600 14px white) above the existing week pills. Update pill styling:
- Active: white bg, `#FF6520` text, Outfit 700 10px, `borderRadius: 20px`, `padding: "4px 12px"`
- Inactive: `rgba(255,255,255,0.16)` bg, `rgba(255,255,255,0.22)` border, `rgba(255,255,255,0.75)` text, Outfit 500

### 5. Baby Development Card
Update to `rgba(255,255,255,0.16)` bg, `rgba(255,255,255,0.24)` border. Label color `rgba(255,255,255,0.45)`. Body text `rgba(255,255,255,0.88)` Outfit 400 13px.

### 6. Baby Size Card — warm yellow tint
`background: rgba(255,240,180,0.15)`, `border: 1px solid rgba(255,220,120,0.25)`. Size text: Fraunces 700 18px white.

### 7. Symptom Chips
`rgba(255,255,255,0.18)` bg, `rgba(255,255,255,0.28)` border, `borderRadius: 20px`, white text Outfit 600 11px.

### 8. Natural Tip Card — lavender hint
`background: rgba(220,200,255,0.12)`, `border: 1px solid rgba(200,170,255,0.20)`.

## Fruit Emoji Map
Add a `FRUIT_EMOJI_MAP` constant mapping babySize keywords → emojis (Poppy→·, Blueberry→🫐, Raspberry→🍇, Cherry→🍒, Fig→🫐, Lemon→🍋, Lime→🍈, Avocado→🥑, Apple→🍎, Mango→🥭, Banana→🍌, Papaya→🍈, Coconut→🥥, Melon→🍈, Pumpkin→🎃, Watermelon→🍉, etc.)

## File
- `src/pages/BabyTracker.tsx` — all 8 changes inline, no other files

