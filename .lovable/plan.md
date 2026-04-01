

# Fix AskDoula.tsx — 6 Visual Enhancements

## Changes — `src/pages/AskDoula.tsx` only

### 1. Welcome Hero Card (lines 215-227)
- Background: `rgba(255,255,255,0.20)`, border: `rgba(255,255,255,0.32)`, borderRadius: `22px`
- Orb: absolute `right: -10px`, `top: -10px`, 80px circle `rgba(255,255,255,0.08)`
- Headline "Your": Outfit 600 **22px** (was 24px)
- "doula chat": Fraunces 800 italic **30px** + `letterSpacing: "-0.5px"`
- Sub: italic Outfit 400 11px `rgba(255,255,255,0.58)` (was 0.65)
- Doula icon circle: `rgba(255,255,255,0.22)` bg, 36px — already correct, keep 🌸

### 2. Context Strip (lines 230-258)
- Each card: `rgba(255,255,255,0.18)` bg (was `var(--c2)`), `rgba(255,255,255,0.28)` border, `borderRadius: 14px`, `padding: "10px 11px"`
- Emoji: fontSize **20px** (was 14), `marginBottom: 4`
- Title: Outfit **700** 10px white (was 8px, 600)
- Sub: Outfit 400 **8px** `rgba(255,255,255,0.60)` (was 7px, `var(--w50)`)
- Card 1: show fruit emoji dynamically + "Week {X}"
- Card 2: 🧘 "Your body" + top symptom
- Card 3: 💊 "Top remedy" + remedy name (keep 🫧 if preferred, but spec says 💊)

### 3. Suggested Prompts (lines 261-270)
- Section label: `rgba(255,255,255,0.50)` (was `var(--w40)`), fontSize 9px, uppercase, Outfit 600
- Each prompt card: `rgba(255,255,255,0.20)` bg (was `var(--c1)`), `rgba(255,255,255,0.30)` border, borderRadius **14px** (was 13), padding `11px 13px` (was 9 11)
- Text: Outfit 600 **12px** white (was 11px)

### 4. Send Button Glow (lines 385-389)
- Add inline `@keyframes sendGlow` via a `<style>` tag in the component (or use conditional className)
- When `input.trim()` is non-empty and not streaming: apply `animation: "sendGlow 2s ease-in-out infinite"` to the send button
- Keyframes: box-shadow oscillates between `0 2px 8px rgba(255,255,255,0.3)` and `0 4px 20px rgba(255,255,255,0.6)`

### 5. Input Bar (lines 363-391)
- Inner container: `rgba(255,255,255,0.95)` bg (already correct via `var(--input-bg)`)
- borderRadius: **28px** (already correct)
- padding: `10px 14px` (was `4px 6px 4px 12px`)
- boxShadow: `0 4px 20px rgba(0,0,0,0.12)`
- Outer wrapper margin: `8px 16px 6px` (was `px-4 py-3`)

### 6. Chat Bubbles (lines 288-303)
- Doula: `rgba(255,255,255,0.20)` bg (was `var(--c1)`), `rgba(255,255,255,0.30)` border, color `rgba(255,255,255,0.90)` (was 0.88)
- User: `rgba(255,255,255,0.95)` bg — already correct
- Border radii already correct

## File
- `src/pages/AskDoula.tsx` — all 6 fixes inline, no other files

