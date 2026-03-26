

# Fix CantSleep.tsx — Pixel-Perfect Design Match

## Changes — `src/pages/CantSleep.tsx` only

### 1. Affirmation Cards — Bigger dimensions
- Cards: `width: 160px`, `height: 110px`, `borderRadius: 18px`, `padding: "14px 14px"`
- Emoji in 32×32 circle with `rgba(255,255,255,0.15)` bg, 16px font
- Preview text: 9px, `lineHeight: 1.55`, `WebkitLineClamp: 3`, `marginTop: 8px`
- "TAP TO READ": 6px, `letterSpacing: 0.1em`, weight 600, `marginTop: 6px`
- Scroll container: `paddingRight: 32px` (extra space so last card isn't cut off)

### 2. Fullscreen Affirmation Viewer — Complete redesign
Replace current overlay with spec-matching layout:
- Container: `fixed inset-0 z-[100]`, flex column, `justifyContent: space-between`, `padding: "0 24px 48px"`
- **Top bar**: `paddingTop: 52px`, flex row with "← Back" left, "Tonight's affirmations" center (15px, weight 600), 🌙 right
- **Center card**: `flex: 1`, `justifyContent: center`, `borderRadius: 28px`, `padding: "40px 28px"`, gradient `#3D2060→#5A2880`, shadow `0 20px 60px rgba(60,0,100,0.45)`
  - Emoji: 52px with float animation
  - Affirmation text: **22px** (the big upgrade), italic, `lineHeight: 1.65`
  - "TAP FOR NEXT CARD": 10px, `letterSpacing: 0.14em`
- **Bottom**: dots (active 24×8px pill, inactive 8×8px circle), footer 13px italic
- Fade transition via opacity animation on key change

### 3. Quiz Tab — Match mockup exactly
- Score row: "Baby Brain 🧠" 11px uppercase, score `fontSize: 20px` color `#FF7840`
- Quiz card: `borderRadius: 22px`, glass bg `rgba(255,255,255,0.75)`, `backdropFilter: blur(16px)`, orange shadow
- Header: gradient `#2A1A40→#4A2060`, `padding: "18px 18px 16px"`, counter 8px weight 600, progress bar 3px with `rgba(255,180,255,0.7)` fill, question 17px weight 600
- **Options grid**: `display: grid`, `gridTemplateColumns: "1fr 1fr"`, `gap: 10px`, `padding: 16px`
  - Each: `borderRadius: 16px`, `padding: "14px 10px"`, bg `rgba(255,242,234,0.85)`, border `rgba(255,170,130,0.28)`
  - Emoji: 28px, text: 9px weight 500 color `#C4784A`
  - Correct: green bg/border, scale animation
  - Wrong: red bg/border, shake animation
- Fun fact: colored bg based on correct/wrong, `slideUp 250ms`
- Next button: gradient `#FF7840→#FFAB80`, white text, shadow
- Footer: 12px italic `rgba(180,100,60,0.38)`

### 4. Breathe Tab — No changes needed
Already matches spec with warm orange palette inline.

## File
- `src/pages/CantSleep.tsx` — update card sizes, fullscreen viewer, and quiz tab styling

