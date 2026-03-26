

# Belly App — 7-Part Fix: Journal, BabyTracker, Courses, Notifications, Push, Shop Backend, Orders

## Scope Assessment

This is an extremely large request spanning 7 major sections. To deliver reliably, I recommend splitting into two passes. Here is the full plan — I will implement Parts 1–4 and 7 (UI/UX fixes + in-app notifications + orders page) first, then Parts 5–6 (push notifications + shop backend migration) in a follow-up, since those require generating VAPID keys, creating secrets, service workers, and multiple edge functions with scheduled jobs.

---

## Part 1 — Journal: Fix Submit + Full Flow

**File:** `src/pages/Journal.tsx`

- **Layout fix**: Root container becomes `flex flex-col h-screen overflow-hidden bg-[#FEF8F4]`. Form area gets `flex-1 overflow-y-auto` with `padding-bottom: 100px`.
- **Sticky save button**: Positioned `sticky bottom-0` with frosted glass bar (`backdrop-filter: blur(16px)`, warm bg). Button: full-width, gradient `#FF7840→#FFAB80`, `borderRadius: 16px`, `padding: 15px`, shadow. Calls `navigator.vibrate?.(8)` on tap.
- **Validation**: If no mood selected, show inline error text below moods: "Please select how you're feeling today 🌸" in `#E07040`.
- **Mood selector visual**: Each mood in a 44px circle with white glass bg, selected state gets gradient + glow. Labels 7px below.
- **Symptom chips**: `borderRadius: 20px`, `padding: 6px 14px`, `fontSize: 12px`. Unselected: white glass + warm border. Selected: `rgba(255,184,153,0.25)` bg + `#FF7840` border.
- **Save logic**: Insert to `journal_entries`, toast "Check-in saved 🌸", reset form after 500ms delay. (Streak tracking in profiles requires adding `current_streak` column — will skip for now since profiles table doesn't have it and the spec asks not to change schemas not mentioned. Will use the existing flow.)

## Part 2 — Baby Tracker: Color-Coded Section Cards

**File:** `src/pages/BabyTracker.tsx`

Replace the single white card with 4 individually styled cards:
1. **Baby Development**: warm peach gradient, orange border
2. **Baby Size**: golden gradient, fruit emoji in circle, size/weight display
3. **What You Might Feel**: green gradient, symptoms as chips (not dot-separated text)
4. **Natural Tip**: lavender gradient, 🌿 icon circle, purple-tinted text

**Trimester cards**: Each gets a unique color (peach/gold/green) with reduced opacity when not active trimester. Smaller sizing per spec.

## Part 3 — Courses: Module List Redesign

**Files:** `src/pages/Courses.tsx`, `src/data/lessonContent.ts`

**Course hero card** (when viewing lesson list): Gradient header with course emoji, title, 2-sentence description, pills row (lesson count, duration, difficulty).

**Progress bar**: Below hero, showing completed/total with gradient fill.

**Lesson rows**: Replace plain white rows with status-colored cards:
- Completed: green tint, white ✓ in green circle
- Active/next: warm orange tint, number in orange circle with glow
- Upcoming: white glass, number in soft circle

Each card shows lesson title, 2-line description preview, and meta tags.

**Lesson descriptions**: Add `description` field to `LessonContent` interface. Write real descriptions for all 6 first-trimester lessons. The `getLessonContent` fallback also gets meaningful generated descriptions.

## Part 4 — In-App Notifications

**Files:** `src/pages/Community.tsx`, `src/components/NotificationBell.tsx`

- **NotificationBell component**: Shows unread count badge (16px circle, `#FF7840`, scale-in animation). Subscribes to Supabase Realtime on `notifications` table filtered by `user_id`.
- **Notification dropdown**: Full-screen overlay with glass bg. Each row shows type icon + title + body + relative time. Unread rows have orange left border accent. Tap marks as read and navigates to relevant post.
- **"Mark all read" button** in header.
- Community.tsx header updated to use the new NotificationBell component.
- The existing `notify_post_owner_on_comment` trigger already handles comment notifications. No additional triggers needed for Part 4.

## Part 5 — Push Notifications (Deferred)

This requires: VAPID key generation, adding secrets, creating a service worker, a `push_subscriptions` table, a `send-push-notification` edge function, and multiple `pg_cron` scheduled jobs. **I recommend implementing this in a separate follow-up pass** to avoid an excessively large changeset.

## Part 6 — Shop Backend (Deferred)

Creating a `products` table, seeding it, and migrating Shop.tsx to fetch from Supabase instead of static data is a significant backend migration. The admin card in Profile.tsx references `VITE_ADMIN_EMAIL` which needs to be set. **Recommend deferring to the follow-up pass** alongside push notifications.

## Part 7 — Orders Page

**Files:** `src/pages/Orders.tsx` (new), `src/App.tsx`, `src/pages/Profile.tsx`

- **New route** `/orders` added to App.tsx with AppLayout wrapper.
- **Orders.tsx**: Fetches from `orders` table. Empty state with 🛍️ emoji and "Shop remedies →" button. Order cards show formatted date, status badge (color-coded), item list, and total.
- **Profile.tsx**: Update "My Orders" row to navigate to `/orders` instead of `/shop`.

---

## Files Changed

| File | Change |
|---|---|
| `src/pages/Journal.tsx` | Full rewrite — layout, mood circles, symptom chips, sticky button |
| `src/pages/BabyTracker.tsx` | Replace single card with 4 color-coded cards + trimester polish |
| `src/pages/Courses.tsx` | Add course hero card, progress bar, redesigned lesson rows |
| `src/data/lessonContent.ts` | Add `description` field to interface + all lessons |
| `src/components/NotificationBell.tsx` | New component with realtime subscription |
| `src/pages/Community.tsx` | Use NotificationBell, clean up inline notification code |
| `src/pages/Orders.tsx` | New page |
| `src/App.tsx` | Add `/orders` route |
| `src/pages/Profile.tsx` | Update "My Orders" navigation to `/orders` |
| Migration SQL | Enable realtime on `notifications` table |

## What Does NOT Change
- No routing changes beyond adding `/orders`
- No Supabase schema changes (except enabling realtime on notifications)
- No changes to CantSleep.tsx, AskDoula.tsx, Auth.tsx, Onboarding.tsx
- No changes to the AI system prompt
- Push notifications and shop backend deferred to follow-up

