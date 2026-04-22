

# Belly App — Comprehensive Polish Pass (8 Sections)

## Overview
Patch existing files in place across 8 areas. No screens are rebuilt. Behavior changes: a few new toggles (Community like/save, Shop cart badge), one new table (`saves`), and a chip-prefill flow Home → Ask. Stripe integration is **explicitly out of scope** here (cart still uses existing `orders` insert flow).

---

## Section 1 — `src/pages/HomePage.tsx`

| Item | Patch |
|---|---|
| 1A Watermark | Replace existing `doula` div (line 107): pure `rgba(255,255,255,0.06)`, fontSize `120`, top `-10`, right `-8`, z-index 0. Wrap hero card content with `position: relative; zIndex: 1`. |
| 1B Progress bar | In hero card track (line 144): track `rgba(255,255,255,0.2)` height 4 radius 4; fill solid `#fff` with `transition: width 0.6s ease`. |
| 1C Week card emoji | Replace name-based `getFruitEmoji` with the same `weekEmoji` map already used in BabyTracker (single shared source). The week card ghost emoji uses `weekEmoji[currentWeek]`. Week 18 → 🫑. |
| 1D Streak bento | Replace lines 181–213 (single streak card + milestones progress) with a 2-tile CSS grid: LEFT translucent card (🔥, big `64px` Fraunces 900 number, "{N}-day streak!", subline). RIGHT dark `rgba(0,0,0,0.12)` card with "JOURNEY" label + 4 milestone rows (🌱 Day 1 / 🌿 Week 1 / 🌸 Week 2 / 👶 Birth — last one dim). |
| 1E Mood section | Move existing mood block to sit **immediately below** the streak bento. Remove its card wrapper (sits on orange). Heading "How are you feeling today?" Fraunces 22, sub "Tap to log your daily check-in". Update toast copy to spec exact (good→"you're glowing today ✨", glowing→"you absolutely radiate 🌸", anxious→"we're right here with you 🤍", unwell→"sending you so much love 💛"). Existing supabase insert + selected pre-load already wired. |
| 1F Journey tiles | Below mood, add a new 2-column grid: SLEEP tile (translucent, "Can't sleep?", "TRY NOW" button → `/cant-sleep`) and COURSES tile (solid white, orange text, "Your Courses · 3 in progress" → `/courses`). Replace current "YOUR JOURNEY" rows section (lines 267–293). |
| 1G Chip prefill | Each suggestion chip (line 156) and the input zone (line 148) navigate with `navigate('/ask', { state: { prefill: chipText } })`. |

## Section 2 — `src/pages/BabyTracker.tsx`

| Item | Patch |
|---|---|
| 2A ShareableWeekCard | Already imported and rendered (line 277). Update component to add `id="shareable-card"` attribute, switch background to flat `#FF8C42` (not gradient), and add the trimester pill alongside weight/length. Button copy already correct. |
| 2B Browse weeks 6–40 | Slice `pregnancyWeeks` to `.filter(w => w.week >= 6)` in the strip. Auto-scroll on mount already works (line 80). Active/inactive pill styles already match spec. |

## Section 3 — `src/pages/AskDoula.tsx`

| Item | Patch |
|---|---|
| 3A LIVE badge | Header pill (line 202) already exists but green dot is static. Add a `@keyframes livePulse` injected via `<style>` and apply to the dot (2s infinite, scale 1↔1.5 + opacity). Adjust pill bg to `rgba(255,255,255,0.15)` border `rgba(255,255,255,0.22)`. |
| 3B Typing dots | Replace current "ringPulse" loader (lines 305–320) with a small 3-dot bubble (matches doula bubble style) using `@keyframes typingBounce` with delays 0/0.15/0.3. Keep the existing condition that hides dots once first delta arrives. |
| 3C Doula avatar | Each assistant message (line 272 map) gets a left 20px circle with "D" Outfit 700 9px white. Currently a bigger 22px circle with 🌸 only on first assistant message — change to per-message 20px "D" circle in flex-row wrapper. |
| 3D Auto-scroll & sticky input | Add `messagesEndRef` div at end of messages list and `scrollIntoView({ behavior: 'smooth' })` in useEffect. Make input bar `position: sticky; bottom: 0` with backdrop blur. Add `paddingBottom: 80px` to messages container. |
| 3E Chip prefill receiver | On mount, read `useLocation().state?.prefill`. If present, call `setInput(prefill)` and immediately `sendMessage(prefill)`. Clear via `window.history.replaceState`. |

## Section 4 — `src/pages/Community.tsx`

| Item | Patch |
|---|---|
| 4A Bell badge | Existing `NotificationBell` shows unread notifications. Augment with localStorage `last_visited_community` set on mount; query likes + comments on user's posts since that timestamp. Render count badge on bell (red 16x16 circle, "5+" cap). |
| 4B Like toggle | Already has `is_liked` + `toggleLike`. Refine UI: liked → filled `Heart fill="#FF8C42"` color `#FF8C42`; unliked → outline Heart `rgba(255,255,255,0.5)`. Apply optimistic update (already partially done; ensure UI updates before fetchPosts refresh). |
| 4C Save toggle | New table `saves` (id, user_id, post_id, created_at, RLS user-only). Load `savedPostIds` Set on mount. Render bookmark icon: saved 🔖 `#FFD700` "Saved" / unsaved 🔖 `rgba(255,255,255,0.45)` "Save". Toggle inserts/deletes. |
| 4D Composer optimistic insert | `createPost` (line 124) already inserts into Supabase + calls `fetchPosts()`. Change to optimistically prepend the new post to local `posts` state immediately on success (before re-fetch) so it shows at top with no flicker. |

## Section 5 — `src/pages/Shop.tsx`

| Item | Patch |
|---|---|
| 5A Cart badge on nav | Create `src/contexts/CartContext.tsx` (cartCount, setCartCount) persisted in localStorage. Wrap app in `App.tsx`. Refactor Shop to read/write context (replace local `cart` state's count source). Add badge on Shop nav icon in `BottomNav.tsx`: top -4 right -4, 16px circle bg `#FF8C42`, 2px border `rgba(210,80,10,0.92)`, white "9+"-capped count. |
| 5B Add-to-cart state | After `addToCart`, set per-product `addedId` for 2000ms. Button shows "✓ Added" with `rgba(100,200,100,0.15)` bg during that window. Toast already shows. |
| 5C Scroll clipping | Wrap product strips in container with `overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 0 16px 8px`. Each card `min-width: 200px; scroll-snap-align: start; flex-shrink: 0`. Append 16px spacer div. Add right-side fade overlay via wrapper `position: relative` + `::after` injected through inline `<style>` rule scoped to `.shop-strip`. |

## Section 6 — `src/pages/Profile.tsx`

| Item | Patch |
|---|---|
| 6A Full orange bg | Top wrapper already `background: transparent`. Confirm no white inheritance — add explicit `style={{ backgroundColor: '#FF8C42' }}` to outermost div for safety. The Premium modal stays. |
| 6B Remove avatar wrapper card | Lines 66–93: remove the `rounded-b-[24px]` translucent card wrapping the avatar/name/sub. Avatar+name+sub+pill sit directly on orange with `padding: 40px 20px 16px; text-align: center`. |
| 6C Stats tiles | Already mostly correct. Bump value to Fraunces 900 28px, label letter-spacing `2px` 9px `rgba(255,255,255,0.55)`. Add `letterSpacing: -1px` only on the streak value to tighten "3🔥". |
| 6D Achievements lock | Already has `opacity` + `grayscale` + 🔒. Tighten: locked tiles `opacity: 0.4`, bg `rgba(255,255,255,0.07)`, 🔒 absolute bottom-right 4/4 fontSize 10. Unlocked: full opacity, bg `rgba(255,255,255,0.14)`, no filter. |
| 6E Unified menu card | Wrap the 4 journey rows (currently separate buttons) in ONE container `rgba(255,255,255,0.12)` border `rgba(255,255,255,0.18)` radius 18 `overflow: hidden`. Each row has `border-bottom: 1px solid rgba(255,255,255,0.08)` except last. Row icon: 32x32 rounded-10. Arrow: › 18px `rgba(255,255,255,0.35)`. |

## Section 7 — `src/components/BottomNav.tsx`

| Item | Patch |
|---|---|
| 7A Active dot | Replace current 18×2.5 white pill (lines 67–77) with a 4×4 white circle (`borderRadius: 50%`, `marginBottom: 3`). Inactive items color `rgba(255,255,255,0.45)`. No blue anywhere — already none. |
| 7B Label font | Bump label fontSize `7→9`, fontWeight `600→700`, letterSpacing `0.05em→0.8px`. Apply to all tabs incl. ME (currently labeled "Me"). |

## Section 8 — Global / App-wide

| Item | Patch |
|---|---|
| 8A Fonts | `index.html` line 12: extend href to include Outfit weights `300;400;500;600;700` and Fraunces opsz axis as specified. Add `fontFamily` definitions in `tailwind.config.ts` `extend.fontFamily`: `fraunces` and `outfit`. (Project mostly uses inline `fontFamily`, but this enables future Tailwind classes.) |
| 8B Global toast | Keep existing `sonner` Toaster (already in App.tsx). Reposition to `bottom: 90px` via `position="bottom-center"`, customize style via `toastOptions.style` to match white pill spec (white bg, radius 30, padding 10/22, dark text, Outfit 500 13). Migration of existing `toast.success(...)` calls is unnecessary because they all already route through sonner. |
| 8C Container | `AppLayout` in `App.tsx` (line 71) currently `max-w-lg mx-auto relative`. Change to inline-style `maxWidth: 430px; margin: 0 auto; minHeight: 100vh; position: relative; overflow: hidden`. Body bg already orange via index.css; add a body rule for `#e07830` outer color in `src/index.css`. |

---

## New backend pieces

| Migration | Detail |
|---|---|
| `saves` table | `id uuid pk`, `user_id uuid`, `post_id uuid`, `created_at`. Unique (user_id, post_id). RLS: user can SELECT/INSERT/DELETE own rows. |

No other DB changes. `mood_logs`, `streak_state`, `notifications`, `post_likes` all already exist.

---

## Files touched

**New:** `src/contexts/CartContext.tsx`, 1 migration (saves table).

**Edited:** `src/pages/HomePage.tsx`, `src/pages/BabyTracker.tsx`, `src/pages/AskDoula.tsx`, `src/pages/Community.tsx`, `src/pages/Shop.tsx`, `src/pages/Profile.tsx`, `src/components/BottomNav.tsx`, `src/components/ShareableWeekCard.tsx`, `src/App.tsx`, `index.html`, `src/index.css`, `tailwind.config.ts`.

## Out of scope
- Stripe checkout (kept current "order received" mock flow)
- PWA / service worker
- Rebuilding any screen from scratch

