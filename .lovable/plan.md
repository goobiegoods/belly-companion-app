

# Belly — Add Missing Features + Spec Polish Pass

## Approach
Your app is ~85% built. This plan adds the genuinely missing pieces from the spec, then does a focused polish pass on existing screens to bring copy and styling closer to the new brief. No screen gets rebuilt from scratch — everything keeps its existing logic and Lovable Cloud / Lovable AI wiring.

## Part 1 — New backend pieces

### 1.1 Database migrations
Two new tables, RLS enforced (users only see their own rows):

| Table | Columns | Purpose |
|---|---|---|
| `mood_logs` | id, user_id, mood (tired/good/glowing/anxious/unwell), logged_at | Persist mood check-ins |
| `streak_state` | user_id (PK), current_streak, last_checkin_date, longest_streak | Track daily streak |

Add a `streak_count` and `last_checkin_date` view via `streak_state` so the home screen can read it directly.

### 1.2 Streak logic (client-side helper)
`src/lib/streak.ts` — on mood check-in or app open:
- same day → no change
- yesterday → increment `current_streak`
- ≥ 2 days gap → reset to 1
- Toast at 3 / 7 / 30 day milestones
- Updates `streak_state` row (upsert)

## Part 2 — New user-facing features

### 2.1 Mood check-in persistence
`HomePage.tsx` already has the 5-emoji mood row. Wire it to:
- Insert into `mood_logs` on tap
- Trigger streak update
- Keep existing toast copy ("rest up, mama 💤" etc.) — already matches spec
- Show selected state for current day's mood

### 2.2 Shareable Week Card (Baby screen)
New component `src/components/ShareableWeekCard.tsx`:
- Orange (#FF8C42) card, white text, belly logo, week's fruit emoji centered, "Week N · Fruit · weight · length"
- "Share this week 📤" button
- Uses `html-to-image` (smaller than html2canvas) to generate PNG
- On mobile: `navigator.share()` with the file; on desktop: download
- Lives below milestones on `/baby`

### 2.3 Admin dashboard `/admin`
Separate route tree with **dark theme** (#111 bg, #FF8C42 accents, sidebar nav). Protected by `user_roles` table check (NOT a column on profiles — security best practice).

New migration:
- `app_role` enum (`admin`, `user`)
- `user_roles` table (user_id, role, unique pair)
- `has_role(user_id, role)` security definer function
- RLS so users see only their own roles

Admin pages:
1. **Overview** — metric cards (total users, orders today, pending orders, DAU from mood_logs), recent orders table
2. **Orders** — full table, filter by status, click row to expand items + shipping, "Mark Shipped" action
3. **Users** — table from `profiles` (name, due date, week, streak, joined)
4. **Community** — all posts table, Pin/Unpin/Delete actions
5. **Products** — read-only list (products are currently hardcoded in `shopData.ts`; full CRUD needs a `products` table — included as a follow-up note, not built now to keep scope sane)

Admin layout uses `shadcn/ui` sidebar component, Outfit font for UI, Fraunces for page titles.

### 2.4 Stripe checkout (Shop)
Currently the shop inserts orders directly with `status: pending`. Replace with real checkout:
- Run `recommend_payment_provider` first (per Lovable's payments workflow)
- Based on result, suggest **Stripe** (digital + physical remedies) via `enable_stripe_payments` (Lovable's built-in, not BYOK)
- After enabling, wire the cart's checkout button to create a Stripe Checkout session, redirect to Stripe-hosted page, handle success/cancel
- Order row gets created on webhook success with `status: paid`

> Note: payments require Pro plan. If you're not on Pro, I'll skip 2.4 and keep the current "order received" flow.

## Part 3 — Polish pass on existing screens

Light-touch CSS / copy adjustments only. No logic changes.

| Screen | Polish |
|---|---|
| **Home** | Add the "doula" ghost watermark behind the hero card (Fraunces 900 120px, opacity 0.06). Verify mood toast copy matches spec exactly. Confirm streak bento right-tile uses `rgba(0,0,0,0.12)` dark bg. |
| **Baby** | Confirm hero "Your / baby's world" stack matches spec sizes (20px / 36px italic). Add ShareableWeekCard placement. |
| **Ask** | Add "AI · LIVE" green-dot badge in header (small). Verify typing-indicator dots use bouncing keyframes. |
| **Community** | Verify "+ Post" button is white pill (already done in earlier pass). Confirm filter chip active state is white. |
| **Shop** | After Stripe wiring, add "🛍️ Checkout securely" CTA copy on cart. |
| **Profile** | Verify achievements grid uses 40% opacity + grayscale + 🔒 overlay for locked badges. |

## Part 4 — Things explicitly NOT changing
- AI provider stays **Lovable AI** (Gemini / GPT via gateway), not direct Anthropic — no API key needed, already working
- Email stays unset (no Resend) — not needed for current flows
- Hosting is Lovable, not Vercel
- Auth keeps email/password + Google (already wired via Lovable Cloud)
- All existing data in `pregnancyWeeks.ts`, `shopData.ts`, `coursesData.ts`, etc.
- No PWA / service worker (Lovable preview restriction)

## Files touched

**New:**
- `src/lib/streak.ts`
- `src/components/ShareableWeekCard.tsx`
- `src/pages/admin/AdminLayout.tsx`
- `src/pages/admin/AdminOverview.tsx`
- `src/pages/admin/AdminOrders.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/admin/AdminCommunity.tsx`
- `src/pages/admin/AdminProducts.tsx`
- `src/hooks/useIsAdmin.ts`
- 2 migrations (mood_logs + streak_state, user_roles + has_role)

**Edited (light polish + wiring only):**
- `src/App.tsx` (admin routes)
- `src/pages/HomePage.tsx` (mood persistence + ghost watermark)
- `src/pages/BabyTracker.tsx` (ShareableWeekCard insertion)
- `src/pages/AskDoula.tsx` (LIVE badge)
- `src/pages/Profile.tsx` (achievements lock styling)
- `src/pages/Shop.tsx` (Stripe checkout if 2.4 enabled)
- `package.json` (`html-to-image` dep)

## Open question for after approval
Are you on the **Pro plan** so I can enable Stripe in Part 2.4? If not, I'll skip checkout and keep the existing "order received" flow.

