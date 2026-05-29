## Plan

### Scope
Single file change: `src/components/BottomNav.tsx`

### Changes

1. **Border radius**: Change `rounded-t-[40px]` to `rounded-t-[20px]` on the `<nav>` element.

2. **Background color**: Change the inline `background` from `#C85818` to `#E8601A` to match the header.

3. **SVG icon crispness**: The nav icons are already inline SVGs. To eliminate subpixel blur caused by the 18×18 size on a 24×24 viewBox, add `shape-rendering="geometricPrecision"` to each SVG and, if needed, force GPU compositing on the icon wrapper so strokes render sharply on all screen densities.

No UI changes beyond these three fixes. No other files touched.