

# Belly App — Addendum Fix Pass (6 Sections)

## Approach
In-place patches across 6 areas. New Stripe subscription work is **conditional** — first, I need a decision from you about the payment provider since the spec requested raw Stripe BYOK but Lovable now provides a no-account-setup integration.

---

## BABY-5 — Fruit emoji per week (data-driven)

**Root cause**: `BabyTracker.tsx` has its own hardcoded `weekEmoji` map at the top of the file (lines 9–20) which is duplicated, partially wrong, and not used by `ShareableWeekCard` or `HomePage`. The shareable card and home week badge each reach for emoji separately.

**Fix**:
1. Add `emoji` column to `PregnancyWeek` interface in `src/data/pregnancyWeeks.ts` and populate every week 1–40 using the spec's exact characters (week 25 = 🥦, week 26 = 🥒, week 20 = 🍌, etc.). Weeks 1–5 use 🫘 (pre-conception bean).
2. Delete the local `weekEmoji` map in `BabyTracker.tsx` and read `weekData.emoji` everywhere.
3. Update `ShareableWeekCard.tsx` to accept and render `weekData.emoji`.
4. Update `HomePage.tsx` week-card ghost emoji to use `pregnancyWeeks.find(w => w.week === currentWeek)?.emoji`.

Single source of truth — emoji visibly changes when tapping any week.

---

## COMMUNITY-5 — Composer sheet fixes

`src/pages/Community.tsx` (lines 427–471):
1. **Background** → change sheet bg from `rgba(200,80,10,0.95)` to flat `#FF8C42`.
2. **Submit button reachability** → keep current sticky footer but add `paddingBottom: calc(100px + env(safe-area-inset-bottom))` so it clears the nav.
3. **Disabled state** → require BOTH title AND body (currently only title): `disabled={!newTitle.trim() || !newBody.trim() || posting}`.
4. **Optimistic insert** → after successful insert, prepend the new post to local `posts` state instead of waiting for `fetchPosts()`. Roll back on error.
5. Confirm input cards stay white, chips match feed filter style (already correct).

---

## JOURNAL-1 — Save button + mood alignment + history + doula shortcut

`src/pages/Journal.tsx` (entire file refactor in place):
1. **Mood unification** → replace MOODS array with the home-screen 5: `[{tired,😴},{good,😊},{glowing,🥰},{anxious,😰},{unwell,😣}]`. Symptoms list stays as-is.
2. **Save button** → already exists in sticky footer but is hidden when `hasCheckedInToday`. Change to: always visible; disabled (opacity 0.4) when `!selectedMood`. Keep current `saveEntry` Supabase insert into `journal_entries`. Update toast to "Entry saved 💛".
3. **History** → already groups by week; refactor the order to descending by `logged_at`/`date`, render ALL past entries (currently does), and add date right-aligned per spec.
4. **Doula shortcut** → at the bottom of each past entry card add a tappable "Ask doula about this →" link that calls `navigate('/ask', { state: { prefill: 'I logged feeling ${mood} with ${symptoms.join(", ")} this week. Can you help?' } })`. The `/ask` chip-prefill receiver added in the previous polish pass already handles this.
5. Allow re-entry the same day (remove the `hasCheckedInToday` gate that currently hides the form).

---

## SHOP-5 — Cart modal redesign + free shipping bar + place-order success

`src/pages/Shop.tsx`:
1. **Cart visual rebuild** (lines 391–464): swap the dropdown-style cart for a bottom sheet — overlay `rgba(0,0,0,0.5)`, container `#FF8C42` with `borderRadius: '24px 24px 0 0'`, padding 24, full-width. Title "Your cart" Fraunces 800 22 white. Each item row: `rgba(255,255,255,0.14)` 12r/12p. Qty buttons: white circles with orange `−`/`+`. Remove `×`: small white. All text white.
2. **Free shipping progress** between subtotal and CTA:
   - <$40: track `rgba(255,255,255,0.2)` h4 r4, fill `#fff` width = `cartTotal/40*100%`. Below: "Add $X.XX more for free shipping 🚚".
   - ≥$40: "🎉 You've unlocked free shipping!" tint white with ✓.
3. **Place Order success** — new route `/order-success` (page component). After successful insert → close cart, clear cart state, `navigate('/order-success')`. Page: full-orange, "Order received! 🎉" Fraunces 900 white, sub copy, "Back to shop" button → `/shop`. Same screen will be reused for Stripe redirect.
4. **Loading state**: button shows "Placing order..." (already there) with disabled style.

---

## PREMIUM-1 — Subscription wiring (DECISION NEEDED before building)

The spec asks for raw Stripe BYOK with a `create-subscription` edge function and price IDs in `.env`. Lovable now offers a built-in payments integration that is strictly preferred over BYOK and doesn't require a Stripe account or env vars.

I will **ask you which path** before building (see "Open question" below). Once chosen, the implementation is one of these two options:

### Path A — Lovable's built-in Stripe payments (recommended)
1. Run `recommend_payment_provider` (project sells digital subscriptions — should clear).
2. Call `enable_stripe_payments` to provision the integration.
3. Use the post-enable knowledge to create two products ($9.99/mo and $59.99/yr with 7-day trial) and wire checkout. Lovable manages keys, webhooks, and the `subscriptions`/`customers` schema for us.
4. Wire the existing Premium modal "Start free trial" CTA to the generated checkout helper.
5. New `/premium-success` page (full orange, welcome copy, CTA to `/`).

### Path B — Build the BYOK flow exactly as specified
1. New edge function `supabase/functions/create-subscription/index.ts` (per spec).
2. Migration: add `stripe_customer_id`, `stripe_subscription_id` columns to `profiles` (`is_premium` and `premium_expires_at` already exist).
3. Add a `stripe-webhook` edge function to handle `customer.subscription.created/updated/deleted`.
4. You provide `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID` via the secrets tool.
5. Same modal wiring + `/premium-success` page.

### Common to both paths — Premium gates
1. **Doula chat 10/day cap** in `AskDoula.tsx`: count `chat_messages` since today midnight where `role='user'`. If ≥10 and `!profile.is_premium` → disable send + show in-chat banner with "Go Premium →".
2. **Course locks** in `Courses.tsx`: for `course.isPremium` cards when `!profile.is_premium`, apply `filter: blur(4px)` over content + centered 🔒 + Premium badge. Tapping opens the Premium modal (already exists in `Profile.tsx` — extract it to a shared `PremiumModal` component so it can be opened from anywhere).
3. **Interim fallback**: regardless of path, if Stripe price IDs aren't yet configured, the CTA shows toast "Premium is launching very soon! We'll notify you 🌸" and inserts into a new `premium_waitlist` table (`user_id`, `created_at`, RLS user-only).

---

## COURSES-1 — Replace courses data + add lock UX

`src/data/coursesData.ts` already has 12 courses; the spec wants a different set of 6 with `episodes_list`. **Two options here too** (see open question):

- **Option X (replace)**: rewrite `coursesData.ts` to match the spec's 6-course array with episodes. Update `Courses.tsx` to render the new shape (episode count + total minutes; tap a course → list of episodes with durations). Adds a new `course_progress` table (user_id, course_id, episode_id, completed_at) with RLS.
- **Option Y (keep & enrich)**: keep current 12 courses + `lessonContent.ts` (which has actual reading material, quizzes, reflections — much richer than the spec's titles-only list), add the lock blur overlay on Premium courses, leave content otherwise alone.

**My recommendation: Option Y.** Your existing course system has lesson content, reflections, quizzes, completions, and reflection saving — replacing it with the spec's title-only stubs would be a regression. The Premium gate (lock blur + modal) is what unlocks the monetization story, not the content swap.

---

## New backend pieces

| Migration | Detail |
|---|---|
| `premium_waitlist` table | `id`, `user_id`, `created_at`. RLS: user can SELECT/INSERT own rows. |
| (Path B only) `profiles` ALTER | `+stripe_customer_id text`, `+stripe_subscription_id text` |
| (Course Option X only) `course_progress` table | `id, user_id, course_id, episode_id, completed_at` + RLS |

---

## Files touched

**New**: `src/pages/OrderSuccess.tsx`, `src/pages/PremiumSuccess.tsx`, `src/components/PremiumModal.tsx` (extracted from Profile), and (Path B) `supabase/functions/create-subscription/index.ts` + `supabase/functions/stripe-webhook/index.ts`.

**Edited**: `src/data/pregnancyWeeks.ts`, `src/pages/BabyTracker.tsx`, `src/components/ShareableWeekCard.tsx`, `src/pages/HomePage.tsx`, `src/pages/Community.tsx`, `src/pages/Journal.tsx`, `src/pages/Shop.tsx`, `src/pages/AskDoula.tsx`, `src/pages/Courses.tsx`, `src/pages/Profile.tsx`, `src/App.tsx`.

---

## Open questions (I'll ask after you approve)

1. **Premium path**: Lovable's built-in Stripe (no setup) or BYOK Stripe with your own keys?
2. **Courses data**: Keep your existing 12-course system with rich lesson content (recommended), or replace with the spec's 6 title-only courses?
3. **Pro plan**: Payments require Pro. Are you on Pro? If not, I'll skip Premium wiring and only add the waitlist + visual lock states.

