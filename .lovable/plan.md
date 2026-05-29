## Plan: Header and Footer Nav Styling Update

Add rounded corners, orange drop shadow, and a faint border to the app's header and footer navigation.

### Changes

1. **AppHeader.tsx**
   - Add `rounded-b-[40px]` to the `<header>` element
   - Add `shadow-[0_6px_20px_rgba(232,96,26,0.27)]`
   - Add `border-b border-orange-200/40`
   - Remove or override any conflicting inline `borderRadius`/`borderBottom` styles

2. **BottomNav.tsx**
   - Add `rounded-t-[40px]` to the `<nav>` element
   - Add `shadow-[0_-6px_20px_rgba(232,96,26,0.27)]`
   - Add `border-t border-orange-200/40`
   - Remove or override any conflicting inline `borderRadius`/`borderTop` styles