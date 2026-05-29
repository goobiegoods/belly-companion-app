## Goal
Two small fixes on `/community`:
1. The "+ Post" create-post sheet currently slides up from the bottom and feels clipped. Make it roll **down from the top** instead.
2. The category chips row (All / Questions / Stories / Tips / Support) sits flush against the new orange header. Add breathing room.

## Changes

### 1. Top-sheet create-post modal — `src/pages/Community.tsx` (lines ~455–500)
- Change the overlay flex alignment from `items-end` to `items-start` so the sheet anchors to the top.
- Swap the sheet's rounded corners: remove `borderTopLeft/RightRadius`, add `borderBottomLeftRadius: 24` and `borderBottomRightRadius: 24`.
- Change shadow direction: `0 10px 40px rgba(40,20,5,0.18)` (drops below instead of above).
- Move the grabber pill from the top of the sheet to the **bottom** (small visual cue that it pulls down from the top).
- Keep close (×) button position at top-right; the rest of the form layout is unchanged.
- Animation: add a new `sheet-down` class in `src/index.css` mirroring `.sheet-enter` but using `translateY(-100%) → 0` with the same easing/duration. Replace `sheet-enter` with `sheet-down` on this modal only. (Other usages of `sheet-enter` in `FeedingTracker.tsx` and `PremiumUpgradeSheet.tsx` are untouched.)

### 2. Category chips spacing — `src/pages/Community.tsx` (line ~417)
- The chips row currently has no top margin. Change its top padding to `paddingTop: 14` (or add `marginTop: 12`) so the pills sit cleanly below the orange header band rather than touching it.

## Out of scope
- Other pages.
- Modal content / form fields.
- The bottom-sheet pattern elsewhere in the app.
