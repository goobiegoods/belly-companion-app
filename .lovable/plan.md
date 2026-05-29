## Footer Nav Label Readability Refinement

The footer nav labels (Today, Baby, Ask Bella, Mamas, Shop, Journey) are currently set at 7.5px with low inactive-state contrast (55% white opacity), making them hard to read on the orange nav bar.

### Proposed Changes

1. **Increase font size**
   - Bump label font-size from `7.5px` to `10px` to match the design system's smallest pill/chip scale (`10px` is used for `.belly-pill-orange` and `.belly-pill-neutral`).

2. **Strengthen inactive-state contrast**
   - Raise inactive label opacity from `rgba(255,255,255,0.55)` to `rgba(255,255,255,0.75)` for better legibility against the `#E8601A` background.

3. **Preserve layout fit**
   - Keep the existing 6-tab layout within the 430px max-width container; 10px labels with current `minWidth: 48` and tight padding still fit comfortably without wrapping.

### Scope
- Single file change: `src/components/BottomNav.tsx`
- Only the `<span>` label styles (font-size, color opacity) are touched.
- No changes to icons, shadows, borders, radius, routing, or business logic.

### Technical Detail
- Current: `fontSize: 7.5`, inactive `color: "rgba(255,255,255,0.55)"`
- Target: `fontSize: 10`, inactive `color: "rgba(255,255,255,0.75)"`
- Active state stays pure white (`#FFFFFF`).