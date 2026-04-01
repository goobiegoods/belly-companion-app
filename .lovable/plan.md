

# Fix HomePage.tsx — 6 Targeted Fixes

## Changes — `src/pages/HomePage.tsx` only

### 1. Greeting — first name only
The `displayName` logic on line 16 already uses `profile?.first_name` and applies `titleCase`. The issue is the profile stores a full name in `first_name`. Fix: split on space and take only the first word before titleCasing.
```
const displayName = titleCase((profile?.first_name || "").split(" ")[0]) || "mama";
```

### 2. Input bar — add inside hero card
Insert between the progress bar (line 75) and suggestion chips (line 77): a flex row with a white input field and orange send button circle. On tap, navigate to `/ask`.
- Container: `background: rgba(255,255,255,0.92)`, `borderRadius: 14px`, `padding: "11px 14px"`, `display: "flex"`, `alignItems: "center"`, `gap: 8`, `boxShadow: "0 4px 16px rgba(0,0,0,0.10)"`, `marginTop: 10`
- Input placeholder: "Cramps, sleep, nutrition..." italic `rgba(160,80,20,0.50)`, transparent bg, no border, flex 1, Outfit 13px
- Send button: 28px circle, `#FF6520` bg, white arrow SVG

### 3. Card contrast — increase opacity
Update CSS variable usage inline:
- All cards currently using `var(--c1)` → `rgba(255,255,255,0.20)`
- All borders using `var(--c1-border)` → `rgba(255,255,255,0.30)`
- Keep `backdropFilter: blur(14px)` unchanged
- Apply to: streak card, week card, mood buttons, this-week cards, journey cards, daily check-in, suggestion chips, greeting pill

### 4. Week card — add fruit emoji
Add a fruit emoji map at component level mapping babySize keywords to emojis (e.g., "Blueberry" → "🫐", "Avocado" → "🥑", "Mango" → "🥭", etc.). Position inside the week card as `position: absolute`, `right: 14px`, `top: "50%"`, `transform: "translateY(-50%)"`, `fontSize: 44`, `filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"`. Add `position: "relative"` to the week card container.

### 5. Streak number — warm white
Change streak number color from `"white"` to `"rgba(255,255,240,0.95)"`.

### 6. Topbar — bottom border
Add `borderBottom: "1px solid rgba(255,255,255,0.14)"` to the header div (line 39).

## File
- `src/pages/HomePage.tsx` — all 6 fixes inline

