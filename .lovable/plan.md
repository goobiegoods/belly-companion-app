
Confirmed target locations before making edits:
- Post detail container: `src/pages/Community.tsx` (current class includes `fixed inset-0 z-40 ...`)
- Sticky reply bar div: same file, bottom `shrink-0` reply bar block

Implementation (only these two changes, nothing else):
1. In `src/pages/Community.tsx`, change the post detail container class from:
   - `fixed inset-0 z-40 flex flex-col`
   to:
   - `fixed inset-0 z-[100] flex flex-col`

2. In the reply bar `div` style object, set it explicitly to:
   - `style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))', zIndex: 101, position: 'relative', background: '#FFFFFF' }}`
   while keeping existing class names and existing border-top styling behavior intact.

Validation after edit:
- Open a post from `/community`
- Confirm post detail overlays above bottom nav
- Confirm reply bar is visible and interactive at the bottom
- Confirm no other layout or logic changed
