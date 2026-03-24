

# Fix Community Section — Submit Button & Reply Bar

## Problems Identified

1. **Create post sheet**: The bottom sheet uses `items-end` + no max-height, so on smaller screens the button gets pushed below the viewport. The sheet content needs a max-height with scrollable body and a fixed/sticky submit button.

2. **Reply bar**: The sticky reply bar is positioned at `bottom-16` (to account for bottom nav) but only renders for non-seeded posts. The bar exists in code but may be clipped by the `pb-20` and `bottom-16` positioning. The main issue is the reply bar needs better positioning and the input should use a textarea for multi-line support.

3. **Title casing**: No text-transform issue in code — titles store as-typed, but need to add `style={{ textTransform: 'none' }}` explicitly to prevent any inherited styles.

4. **Feed refresh**: Already calls `fetchPosts()` after create — working. Can add refetch on sheet close for safety.

5. **Reply count**: Already fetches from comments table — working.

## Changes

### File: `src/pages/Community.tsx`

**1. Rebuild create post sheet (lines 405-438)**
- Add `max-h-[85vh]` to the sheet container
- Split into scrollable content area (title, body, category) and fixed bottom area (submit button)
- Add "Post type" label above category pills
- Add loading state to submit button
- Add inline error display
- Style submit button with active:scale-[0.97]

**2. Fix reply bar in post detail (lines 248-320)**
- Change the post detail container from `min-h-screen` to `h-screen flex flex-col` so the reply bar stays visible
- Move reply bar from `fixed bottom-16` to a flex layout: scrollable body takes `flex-1 overflow-y-auto`, reply bar sits below as a non-scrolling element
- Add current user avatar to reply bar
- Change placeholder to "Reply to [author name]..."
- Add optimistic update for new comments (append immediately, don't re-fetch)
- Handle notification insert is already done by the DB trigger — no client-side insert needed
- Show reply bar for all posts (including seeded, but disable send for seeded)
- Add inline error state

**3. Title text-transform**
- Add `textTransform: 'none'` to title display in post cards and detail

**4. Comment count accuracy**
- Already working via the `countMap` logic in `fetchPosts`

## Technical Details
- Single file change: `src/pages/Community.tsx`
- No database changes needed
- No new dependencies

