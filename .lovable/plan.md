

# Fix: Create Post Sheet Submit Button Hidden Behind Nav

## Problem
The create post sheet overlay uses `z-50` — same as the bottom nav. Since the nav appears later in the DOM, it renders on top, hiding the submit button area.

## Changes — `src/pages/Community.tsx`

### 1. Raise sheet overlay z-index (line 459)
Change `z-50` to `z-[200]` on the overlay container so the entire sheet (including submit button) renders above the bottom nav.

```
// Line 459: change
className="fixed inset-0 bg-black/40 z-50 flex items-end"
// to
className="fixed inset-0 bg-black/40 z-[200] flex items-end"
```

### 2. Add safe bottom padding to submit area (line 507)
Add extra bottom padding to account for the safe area inset on mobile devices.

```
// Line 507: change
<div className="shrink-0 px-5 py-4 bg-white" style={{ borderTop: "1px solid #FFF0E8" }}>
// to
<div className="shrink-0 px-5 bg-white" style={{ borderTop: "1px solid #FFF0E8", padding: "16px 20px calc(16px + env(safe-area-inset-bottom))" }}>
```

These two changes ensure the sheet renders above everything and the submit button has proper spacing on all devices.

