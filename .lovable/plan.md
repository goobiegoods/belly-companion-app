

# Belly App — Journal, Shop, Community Seeds, Ask Doula Polish

## Part 1 — Journal: Sticky Submit Button

**File:** `src/pages/Journal.tsx`

The current layout already has the correct flex-column structure with `overflow: hidden` and the button outside the scroll area. The fix is minor:
- Change the scroll area's bottom padding: remove the conditional `paddingBottom` and always use `padding: "0 16px 16px"` (no extra bottom padding needed since button is outside scroll)
- Update button container padding to use `calc(12px + env(safe-area-inset-bottom))` for safe area
- Change button text to "Save check-in 🌸"
- Ensure `!hasCheckedInToday` gate works correctly — the button should show even when entries exist, as long as today's entry hasn't been made

## Part 2 — Shop: Cart Header Icon, Emoji Fix, Shop All Scroll

**Files:** `src/pages/Shop.tsx`, `src/data/shopData.ts`

### 2a. Replace 💊 with 🫧 in shopData.ts
Change all `emoji: "💊"` to `emoji: "🫧"` in the remedies array (8 items). Also update homeopathyCourses h1 emoji from "💊" to "🫧".

### 2b. Cart icon in Shop header
Add a cart button (38px circle, shopping bag SVG, badge with count) to the top-right of the header row. On tap opens the existing cart overlay. Remove the floating FAB at the bottom since the header cart replaces it.

### 2c. "Shop all →" scroll fix
Make the "Shop all →" span a button that calls `document.getElementById('remedy-kits')?.scrollIntoView({ behavior: 'smooth' })`. Add `id="remedy-kits"` to the kits section heading.

### 2d. Cart overlay polish
The existing bottom-sheet cart already works. Enhance it to match the spec:
- Slide from top-right instead of bottom (position fixed, top 60px right 16px, width min(320px, calc(100vw-32px)), slideDown animation)
- Add emoji circles for each item, shipping note, and Apple Pay / card / PayPal buttons
- Apple Pay: use Payment Request API with graceful fallback (hide if unavailable)
- Credit card: placeholder for now (toast "Coming soon")
- PayPal: placeholder (toast "Coming soon")
- Empty cart state with 🛍️

### 2e. Add-to-cart toast + auto-open
Update `addToCart` to show styled toast, call `navigator.vibrate?.(6)`, and auto-open cart after 800ms.

## Part 3 — Community: Seed 16 Posts

**Migration SQL only.** Insert 16 posts using a fixed seed UUID `00000000-0000-0000-0000-000000000001` as user_id. Spread `created_at` over the past 2 weeks. Categories: question (4), tip (4), story (4), support (4). Include the exact titles, bodies, week_posted, and likes from the spec.

Note: The posts table RLS allows anyone to SELECT. The INSERT policy checks `auth.uid() = user_id`, but since this is a migration running as superuser, it bypasses RLS.

Community.tsx will need to handle displaying author names for seed posts. Since there's no profile for the seed user, we'll need to store author names. Looking at the posts table — it doesn't have an author name column. Options:
- Add a `display_name` column to posts (requires migration)
- Or embed author name in the title/body

I'll add a `display_name` nullable text column to posts so seed posts show the correct author name. For real users, the app can fall back to the profiles table.

## Part 4 — Ask Doula: Visual Welcome + Chat Polish

**File:** `src/pages/AskDoula.tsx`

### Welcome state (messages.length === 0):
- Replace the plain glass card with a gradient hero card (linear-gradient #FF7E48→#FFBE98) with orb decoration, 🌸 avatar circle, greeting, and week context
- Add 3 mini context strip cards below (week/fruit, body/symptom, top remedy) using pregnancyWeeks data
- Keep the 2x2 prompt grid but style with Georgia serif, 9px
- Add camera prompt card below grid with lavender tint
- Add "Suggested for week X" section label

### Chat bubbles:
- User: gradient bg, `borderRadius: "18px 18px 4px 18px"`, max-width 80% — already mostly there
- Belly: glass bg, `borderRadius: "18px 18px 18px 4px"`, max-width 88%, add 🌸 avatar above first message

### Input bar:
- Outer container: `borderRadius: 28px`, glass bg, shadow
- Send button: round 36px gradient circle with pulse animation when input non-empty
- Camera button: 🌸 warm circle
- Placeholder: "Ask anything..." italic
- Message counter below input: "X/10 free messages today" — already exists, just restyle

### Thinking state:
- Add "Belly is thinking..." label with Georgia serif italic — already exists, enhance styling

## Files Changed

| File | Change |
|---|---|
| `src/pages/Journal.tsx` | Safe-area padding, button text |
| `src/pages/Shop.tsx` | Header cart icon, cart overlay redesign, shop-all scroll, add-to-cart toast |
| `src/data/shopData.ts` | Replace 💊 with 🫧 |
| `src/pages/AskDoula.tsx` | Welcome hero card, context strip, chat bubble polish, input bar redesign |
| Migration SQL | Add `display_name` column to posts, insert 16 seed posts |

## What Does NOT Change
- No routing changes
- No system prompt changes
- No changes to CantSleep, BabyTracker, Courses, Profile, or other files

