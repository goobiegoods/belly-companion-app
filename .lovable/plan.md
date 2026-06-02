# Stop the "refresh" flicker on every navigation

## What's actually happening

It isn't a real reload — it's two CSS animations replaying every time a route mounts (which React Router does on every tab change):

- `.page-enter` — 260ms fade + 8px slide on the page root
- `.stagger > *` — children fade up to ~240ms delay each (on Home, etc.)

Combined that's ~500ms of fade/slide on every page → reads as "the page keeps refreshing." Nothing in auth or data is actually looping.

## Fix

Disable the mount-time animations app-wide. Navigation becomes instant; the layout and styling stay identical.

### Changes

1. **`src/index.css`** — neutralize the two animation utilities so they no longer play on mount:
   - `.page-enter { animation: none; }`
   - `.stagger > * { animation: none; opacity: 1; transform: none; }`
   - Keep the `@keyframes pageEnter` / `fadeInUp` definitions (harmless, used nowhere else) or remove them — either is fine.
   - Leave `livePulse` (Bella dot), `belly-float`, sheet animations, etc. untouched.

2. **No component changes needed.** Pages can keep the `page-enter` / `stagger` class names; they just become no-ops. This avoids touching ~15 page files.

## Out of scope

- Auth, Supabase, routing, splash screen — not changing.
- Sheet/modal entrance animations, Bella pulse, button press scale — kept as-is.

## Verification

Navigate Home → Cart → Shop → Baby. No fade/slide replay; pages snap in. Splash still shows once per session only.
