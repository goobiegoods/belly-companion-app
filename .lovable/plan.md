

# Fix Community — Create Post Sheet & Reply Bar

## Root Causes Found

Both bugs are in **`src/pages/Community.tsx`** (single file, no separate components).

**Bug 1 — Create Post Sheet (lines 456-522):** The sheet uses `maxHeight: "85vh"` with `flex-col`, but `flex-1 overflow-y-auto` on the scrollable area doesn't reliably expand because the parent height is set via `maxHeight` (not a fixed height). On mobile with virtual keyboard, the button gets pushed below. Fix: use `max-h-[85vh]` as a Tailwind class combined with explicit `overflow-hidden` on the outer container, and ensure the scrollable area gets `min-h-0` (required for flex overflow to work).

**Bug 2 — Reply Bar (lines 280-372):** The post detail uses `h-screen` but the page renders inside a layout with a bottom nav bar (~64px). The reply bar sits at the bottom of `h-screen` which means it's hidden behind the bottom nav. Fix: use `h-[100dvh]` or calculate height minus bottom nav, or use `pb-16` on the container to account for the nav.

## Changes — `src/pages/Community.tsx`

### 1. Create Post Sheet rewrite (lines 456-522)
- Change outer overlay to `fixed inset-0 z-50 flex items-end justify-center`
- Sheet container: `w-full rounded-t-[24px] bg-white flex flex-col max-h-[85vh] overflow-hidden`
- Handle bar: `shrink-0`
- Title "Create a post": `shrink-0`
- Scrollable content (inputs + category): `flex-1 overflow-y-auto min-h-0 px-5 pb-4`
- Submit button area: `shrink-0 px-5 py-4 bg-white` with `borderTop` — never scrolls
- Also add `onOpenChange` callback to refetch posts when sheet closes

### 2. Post Detail rewrite (lines 280-372)
- Change container from `h-screen` to `fixed inset-0 z-40 flex flex-col` so it overlays the entire viewport including the bottom nav
- Header: `shrink-0`
- Scrollable body: `flex-1 overflow-y-auto min-h-0`
- Reply bar: `shrink-0` at the very bottom, add `pb-[env(safe-area-inset-bottom)]` for iOS
- Move `replyError` display inside the reply bar div (above the input row) instead of below the entire bar

### 3. Feed refresh on sheet close
- In the overlay's `onClick` dismiss handler, call `fetchPosts()` after closing
- Already calls `fetchPosts()` after successful create — keep that

### 4. Minor
- Ensure `textTransform: 'none'` on title input and display (already present)
- Comment count already works via `countMap`

## Technical Details
- Single file: `src/pages/Community.tsx`
- No database changes
- No new dependencies
- The key CSS fix is `min-h-0` on the flex child with `overflow-y-auto` — without it, flex items don't shrink below their content size and overflow doesn't activate
- Post detail uses `fixed inset-0` to escape the parent layout's constraints entirely

