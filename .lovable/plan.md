

# Ask the Doula — Restore back navigation

## Problem

When the Ask screen was stripped down, the `← Home` back link was removed from the header. The bottom nav highlights "Ask" as the active tab, but there's no way to return to Home from inside the chat without using the browser back gesture. On mobile, this leaves users stranded.

## Fix

Add a small back button to the minimal header strip in `src/pages/AskDoula.tsx`, to the left of the "Ask the Doula" title.

**Layout (header row):**
```
[←]  Ask the Doula                           [● AI · LIVE]
     Your natural pregnancy guide
```

**Back button spec:**
- 32px circular button, `background: rgba(255,255,255,0.15)`, `border: 1px solid rgba(255,255,255,0.22)`.
- Lucide `ChevronLeft` icon, 18px, white.
- `margin-right: 12px`, vertically centered with title.
- `onClick`: `navigate(-1)` — returns to wherever the user came from (Home, Profile, etc.). Falls back to `navigate('/')` if there's no history entry.
- `aria-label="Go back"`.

The header row becomes a flex container with the back button + title block on the left and the AI · LIVE pill on the right (`justify-content: space-between`, `align-items: flex-start`).

## Files touched

- `src/pages/AskDoula.tsx` — add back button to header (~10 lines).

## Test

1. Home → tap Ask → tap back arrow → returns to Home.
2. Profile → tap Ask → tap back arrow → returns to Profile.
3. Direct deep link to `/ask` → tap back arrow → falls back to Home.
4. Confirm AI · LIVE pill stays right-aligned, subline still reads "Your natural pregnancy guide".

