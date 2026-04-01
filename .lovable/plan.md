

# Fix AskDoula.tsx — 6 Targeted Visual Fixes

## Changes — `src/pages/AskDoula.tsx` only

### Fix 1 — Hero Card: More contrast
Line 215: Update background to `rgba(255,255,255,0.25)`, border to `1.5px solid rgba(255,255,255,0.40)`, add `backdropFilter: "blur(16px)"`, `boxShadow: "0 4px 20px rgba(0,0,0,0.06)"`.

### Fix 2 — Context Strip: Layout + emoji
Lines 230-245: Update each card to `rgba(255,255,255,0.22)` bg, `rgba(255,255,255,0.32)` border, `padding: "10px 10px 9px"`, add `display: "flex"`, `flexDirection: "column"`, `alignItems: "flex-start"`, `gap: 4`. Emoji → 18px, marginBottom 2. Title → 10px 700 white lineHeight 1.2. Sub → 8px 400 `rgba(255,255,255,0.62)` lineHeight 1.3. Replace 💊 with 🫧 on card 3.

### Fix 3 — Suggested Prompts: More contrast
Lines 250-264: Prompt cards → `rgba(255,255,255,0.24)` bg, `1.5px solid rgba(255,255,255,0.38)` border, `borderRadius: 16px`, `padding: "13px 14px"`, `boxShadow: "0 2px 8px rgba(0,0,0,0.06)"`. Text → 13px. Camera card → `rgba(255,255,255,0.20)` bg, `1.5px solid rgba(255,255,255,0.30)` border, `borderRadius: 16px`, `padding: "13px 14px"`, flex row with gap 8, icon 16px, text 13px.

### Fix 4 — Ambient card below prompts
Insert after the camera card button (line 264), before `</>`: a new card that shows only when `messages.length === 0`. Background `rgba(255,255,255,0.10)`, border `rgba(255,255,255,0.16)`, borderRadius 16px, padding 14px 16px, textAlign center. Content: 🌸 at 22px, "I'm here whenever you need me, mama." italic 12px `rgba(255,255,255,0.55)`, sub "Available 24/7 · Natural guidance only" 10px `rgba(255,255,255,0.35)`.

### Fix 5 — Topbar: White text
Lines 198-208: Update topbar bg to `rgba(255,140,66,0.60)`. "← Home" button → color white, fontWeight 600, fontSize 13. Title → Fraunces 700 18px white. Subtitle → `rgba(255,255,255,0.55)` Outfit 400 11px. Keep border-bottom and backdrop-filter.

### Fix 6 — Input Bar: Polish
Lines 351-381: Outer wrapper → `background: "rgba(255,255,255,0.15)"`, `borderTop: "1px solid rgba(255,255,255,0.18)"`, `padding: "10px 16px 14px"`, `backdropFilter: "blur(16px)"`, remove margin. Input container → `boxShadow: "0 4px 20px rgba(0,0,0,0.10)"`. Placeholder color → `rgba(160,80,20,0.45)`. Send button → 32px circle, `boxShadow: "0 2px 10px rgba(255,80,20,0.35)"`. Camera icon → make it white on orange bg (change color to white, background to `rgba(255,255,255,0.20)`).

## File
- `src/pages/AskDoula.tsx` — all 6 fixes inline, no other files

