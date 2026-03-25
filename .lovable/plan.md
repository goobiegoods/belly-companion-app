

# BELLY App — Global UI Polish + Shop & Homeopathy Tab

## Overview
Two additions in one pass: (1) CSS-only visual polish across all screens, and (2) a new Shop tab with remedies marketplace and homeopathy courses.

## Part 1 — Global UI Polish (CSS + minor component tweaks, no layout changes)

### A. Page Transitions
- Add `pageEnter` keyframes and `.page-enter` class to `src/index.css`
- Add `className="page-enter"` to root div of: HomePage, BabyTracker, AskDoula, Community, Courses, Profile, Journal, Shop (new)

### B. Typography Hierarchy
- Add utility classes to `src/index.css`: `.belly-title`, `.belly-section-label`, `.belly-card-title`, `.belly-body`, `.belly-hint`, `.belly-badge-text`, `.belly-cta-text`
- Apply these classes across existing screens where appropriate (page titles, section labels, card titles)

### C. Hero Card Gradient
- Replace flat `bg-primary` on hero cards with inline `background: radial-gradient(ellipse at top right, #FFCDB4 0%, #FFB899 45%, #FFA882 100%)` plus `box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(42,18,0,0.06)` on: HomePage hero, BabyTracker hero, Profile hero, Courses progress hero

### D. Skeleton Loading
- Add shimmer keyframes to `src/index.css`
- Create `src/components/BellySkeleton.tsx` — reusable peach shimmer skeleton
- Add skeleton states to Community feed, Course list, Baby tab loading

### E. Micro-Animations
- Heart like: add `heartPop` and `floatUp` keyframes; add pop animation state to Community like button
- Lesson completion: add `burst` keyframes; celebration particles on "Complete" button
- Card press states: enhance `.belly-press` and `.belly-btn-press` with box-shadow
- Tab bar active indicator: add spring scale to active dot, slight upward shift on active icon in BottomNav
- Bottom sheet slide-up: add `slideUp` keyframe; apply to create-post and premium modals

### F. Premium Touches
- Dividers: add `.belly-divider-elegant` class with gradient fade
- Card depth: add `.belly-card-shadow` class with subtle layered shadow
- Avatar ring: add `box-shadow: 0 0 0 2px #FFCDB4` via `.belly-avatar-ring` class
- Input focus: enhance `.belly-input-focus` with updated border-color + glow
- Badge pills: add inner shadow via `.belly-badge-glass` class

## Part 2 — Shop + Homeopathy Tab

### Database Migration
Create `orders` table:
```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  shipping_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- RLS: users can insert/view their own orders
```

### Navigation Update
- In `src/components/BottomNav.tsx`: add Shop tab (ShoppingBag icon from lucide-react) between Community and Me, path `/shop`
- In `src/App.tsx`: add route `/shop` pointing to new Shop page, wrapped in ProtectedRoute + AppLayout

### New Files
- **`src/pages/Shop.tsx`** — Full shop screen with two pill tabs (Remedies / Learn)
  - Remedies tab: hero banner, horizontal scroll kit cards (4 kits), individual remedy cards (8 remedies), herbal tea cards (4 teas), floating cart button, cart bottom sheet with qty controls and order placement
  - Learn tab: hero card, 5 homeopathy course cards reusing existing course card styling
  - Disclaimer at bottom of both tabs
  - Cart state managed with React useState; order insertion to `orders` table on checkout

- **`src/data/shopData.ts`** — Static product data (kits, remedies, teas) and homeopathy course definitions

- **`src/data/homeopathyLessons.ts`** — Full lesson content for 5 homeopathy courses (~25 lessons total) with real homeopathy education content in warm doula voice, including quizzes and reflections. Reuses `LessonContent` interface from `lessonContent.ts`

### Shop Screen Structure
```text
[Header: "Belly Shop" + subtitle]
[Pill tabs: Remedies | Learn]

REMEDIES TAB:
  [Peach gradient hero banner]
  [Section: "Remedy kits" — horizontal scroll of 4 bundle cards]
  [Section: "Individual remedies" — vertical list of 8 cards]
  [Section: "Herbal teas" — vertical list of 4 cards]
  [Disclaimer card]
  [Floating cart FAB → opens cart bottom sheet]

LEARN TAB:
  [Peach gradient hero card]
  [5 homeopathy course cards]
  [Disclaimer card]
  [Tapping a course → opens lesson list → lesson reader (reuses Courses.tsx reader pattern)]
```

### Homeopathy Course Integration
The Learn tab will use the same lesson reader pattern as `Courses.tsx`. The 5 homeopathy courses and their lessons will be defined in `shopData.ts` and `homeopathyLessons.ts`, using the same `LessonContent` interface. The Shop page will include its own inline lesson reader (same JSX pattern) to avoid coupling with the main Courses page.

### Cart Flow
1. User taps "Add to cart" on any product
2. Floating cart button shows item count badge
3. Tapping cart opens bottom sheet with item list, qty controls, subtotal
4. "Place order" inserts to `orders` table and shows confirmation toast

## Files Changed
- `src/index.css` — new keyframes, utility classes
- `src/components/BottomNav.tsx` — add Shop tab
- `src/App.tsx` — add /shop route
- `src/pages/HomePage.tsx` — page-enter class, hero gradient
- `src/pages/BabyTracker.tsx` — page-enter class, hero gradient, skeleton
- `src/pages/AskDoula.tsx` — page-enter class
- `src/pages/Community.tsx` — page-enter class, heart animation, skeleton, divider polish
- `src/pages/Courses.tsx` — page-enter class, hero gradient, skeleton
- `src/pages/Profile.tsx` — page-enter class, hero gradient
- `src/pages/Journal.tsx` — page-enter class
- `src/components/BellySkeleton.tsx` — new reusable skeleton component
- `src/pages/Shop.tsx` — new full shop screen
- `src/data/shopData.ts` — new static product + course data
- `src/data/homeopathyLessons.ts` — new homeopathy lesson content
- Migration SQL for `orders` table

