# REVIEW — Current App vs. `belly_redesign_final_complete.html`

Comparison of the live codebase against the redesign reference (`C:\Users\18185\Downloads\belly_redesign_final_complete.html`, "BELLY — Golden Hour, final"). No code has been changed; this is a report only.

---

## 0. The reference design in one paragraph

The reference is a **dark "golden hour" design**: every screen sits on a night/plum gradient with per-screen radial color scenes, a film-grain overlay, and a faint pregnant-silhouette SVG watermark. Cards are **glassmorphism** (`rgba(255,255,255,0.10)` background, `backdrop-filter: blur(18px)`, translucent borders). The palette is `--night #150A1F`, `--plum #3A1A38`, `--magenta #B5386B`, `--ember #E8622E`, `--gold #F2B647`, `--teal #2C9C8F`, `--cream #FBEEE0`. Fonts are **Fraunces** (serif display), **Inter** (UI text), and **JetBrains Mono** (labels, pills, numbers). Signature elements: a **pulsing gold/ember Bella avatar orb** (CSS radial gradient with an animated glow, used in headers, status pills, and quote cards), a cream **week pill** and an overflow **⋯ menu** in every header, and a translucent glass bottom tab bar with 6 tabs — Today, Baby, Ask Bella, Mamas, Shop, **Journey** — with a gold active state and dot.

The current app is the opposite aesthetic: **terracotta orange `#E8702A` on warm cream `#F0E8DC`**, white cards with orange borders, sage green accents, Nunito/Outfit body fonts. Almost every screen needs both a visual overhaul and (in a few places) structural changes to match.

---

## 1. Today screen

**File / component:** `src/pages/HomePage.tsx` (`HomePage`), routed at `/` in `src/App.tsx:137`. Header from `src/components/AppHeader.tsx`. Note: `src/pages/Index.tsx` is an unused Lovable placeholder stub — not routed anywhere.

**What it looks like now:**
- Cream `#F0E8DC` page (hardcoded at `HomePage.tsx:55`) with a faint "doula" watermark; orange-gradient `AppHeader` (rounded-bottom 40px) with the "belly / VIRTUAL DOULA" wordmark and a time-based greeting ghost pill. No week pill, no overflow menu.
- Cards in order: white "Ask your doula anything" card (orange "Bella" pill with pulsing dot, input pill, 4 suggestion pills), orange week card (huge Fraunces "week N", fruit emoji in an 80px circle, "N weeks to go" + "Trimester n" pills, `ShareableMilestoneCard`), orange Belly Breathe gradient card (4-7-8 badge), 3 small milestone emoji tiles, "Today's Recipe" blush card, Quick Navigate pills, Feeding Tracker entry card, a "What's happening" community-feed card (orange band, "Live" tag, 3 feed items), two streak pills (🔥 day streak, 🌬 breathing streak), and a "Day N of your journey" footer.

**What it should look like per the reference (`scene-today`, lines 199–251):**
- Dark plum→rust scene gradient, silhouette watermark, glow orb in the header.
- Header: "belly / virtual doula" wordmark, **⋯ overflow menu icon button + cream "week 33" pill** on the right, Fraunces greeting **"Good evening, mama / the light is on for you"**, and a **gold→ember trimester progress bar** with mono labels "trimester 3" / "7 weeks to go".
- Body has only three things: a glass "Ask your doula anything" card (with a small **pulsing Bella orb** in a "Bella · here with you" status pill, dark input pill with gold→ember arrow button, and just **2** suggestion pills — "Round ligament?" / "Foods to avoid"), a **teal→magenta glass** Belly Breathe card (4·7·8 in a mono circle), and a "this week's milestones" section label (gold JetBrains Mono, uppercase) above **3 glass trio tiles** with gold stroked icons (Hearing / Lungs / Viability).
- The reference Today screen has **no** recipe card, quick-nav pills, feeding card, community feed, or streak pills. (Whether to remove or restyle those is a product decision — the reference simply doesn't show them.)

**Data: real vs. hardcoded:**
| Element | Source |
|---|---|
| Current week, trimester, days to go | Supabase `profiles.due_date` (via `useAuth`) fed into the **hardcoded** 40-week table `src/data/pregnancyWeeks.ts` |
| Display name / greeting | Supabase `profiles.first_name`; greeting text computed locally |
| Day streak | **Real Supabase** — `streak_state` table via `src/lib/streak.ts` |
| Breathing streak | Supabase via `src/lib/breathingStreak.ts` |
| Suggestion pills, milestone tiles, "Today's Recipe" | **Hardcoded** in `HomePage.tsx` |
| "What's happening" community feed | **Entirely fake/hardcoded** — the three feed items are static strings, not fetched from `posts` or anywhere else |

---

## 2. Baby screen

**File / component:** `src/pages/BabyTracker.tsx` (`BabyTracker`), routed at `/baby`. (`FeedingTracker.tsx` at `/feeding` is a separate newborn-feeding page, not part of this screen.)

**What it looks like now:**
- Cream bg, `AppHeader` with a "week N" ghost pill (no overflow menu). Fraunces hero "Your / baby's world" with subline "Week N · {fruit} · ~{length}".
- White fruit card: 110px radial-glow circle with the **fruit emoji**, "About the size of a {fruit}", 3 stat tiles (WEIGHT / LENGTH / AGE).
- Horizontal scroll of **all 40 week pills (w1–w40)**; future weeks show 🔒 for non-premium and open `PremiumUpgradeSheet`.
- Then: Baby Development card, "What You Might Feel" symptom pills (color-coded amber/lavender/green), Natural Tip card, a 5-item Milestones list, `ShareableWeekCard`, a "Nourish this week" recipes section, Trimester Overview tiles, a **Kick Counter** (big number, "+ Kick", goal 10, reset), a **Contraction Timer** (start/stop, avg interval, alert when 3 contractions ≥60s and ≤5min apart).

**What it should look like per the reference (`scene-baby`, lines 360–422):**
- Dark teal→amber scene. Header: **"Baby's world"** brand with mono tag "week 33 · pineapple · ~43.7cm", **⋯ menu + cream week pill**.
- Centered glass hero card: large fruit emoji (48px), italic gold Fraunces "about the size of a pineapple", and **3 JetBrains Mono stats separated by hairlines** (1.9kg weight / 43.7cm length / 33w age).
- A **short week pill row — only w31, w32, w33 (active, gold), w34 🔒** — not all 40 weeks.
- One glass "baby development" card with a gold mono section label and Fraunces body text.
- **Two side-by-side glass tiles**: kick counter (big gold mono "0", "kicks today", gradient "+ Kick" text button) and contraction timer (big magenta mono "0", "contractions", "tap to time"). Compact tiles, not the current full-width sections.
- The reference Baby screen has no symptom pills, natural tip, milestones list, recipes, or trimester overview.

**Data: real vs. hardcoded:**
| Element | Source |
|---|---|
| Fruit, weight, length, development text, symptoms, tip, milestones | **Hardcoded** — `src/data/pregnancyWeeks.ts` (`getWeekData`) and inline arrays in `BabyTracker.tsx` |
| Week recipes / vitamins | **Hardcoded** — `src/data/recipesData.ts` |
| Current week | Supabase `profiles.due_date` → `getCurrentWeek` |
| Week-lock premium gate | **Real Supabase** — `profiles.is_premium` |
| Kick counter | Hybrid: each tap **inserts into Supabase `kick_counts`** (`BabyTracker.tsx:73-79`) but the on-screen count is local state and is **never read back** — it resets to 0 on reload |
| Contraction timer | **Purely local state** — nothing persisted anywhere |

---

## 3. Ask Bella screen

**File / component:** `src/pages/AskDoula.tsx` (`AskDoula`), routed at `/ask` inside `FullScreenLayout` — meaning **the bottom tab bar is hidden on this screen**, while the reference shows the tab bar present with "Ask Bella" active.

**What it looks like now:**
- Light theme (`--color-bg-base`). Custom minimal header: back chevron, Fraunces "Ask *Bella*" title, a **🌸 flower-emoji avatar** in a blush circle with a green online dot, and 3 sage context pills ("Knows your history", "Week N", "Nth pregnancy"). No week pill, no overflow menu.
- Chat: assistant bubbles are white cards with a sage left accent and 🌸 avatar; user bubbles are blush, right-aligned with an initial avatar; three-dot typing indicator.
- Before the first message: a 📸 "Is this safe to use?" photo-safety chip plus 4 **uniform white/orange quick-prompt chips** — no category system, no color coding, no legend.
- Sticky input bar: "ASK BELLA ANYTHING" eyebrow, input pill with camera + send buttons, and a **plain-text footer counter** — "N/10 free messages today" (premium: "Unlimited messages ✨").

**What it should look like per the reference (`scene-ask`, lines 253–307):**
- Dark plum scene with a top-center glow orb. Header: **pulsing Bella avatar orb** next to "Ask Bella / knows your whole history", plus **⋯ menu and cream "wk 33" pill**.
- "what's going on right now" gold mono section label, then a **legend** (ember dot = physical, teal dot = nutrition + rest, magenta dot = big moments) and a **2×3 grid of six color-coded category tiles**: Nausea (ember), Sleep (teal), Safe? (ember), What to eat (teal), Herbal (teal), Labor prep (magenta) — tinted glass tiles with matching stroked icons.
- A **trending line**: "📈 trending — **47 mamas** asked about nausea".
- A **Bella quote card**: dark glass, small Bella orb + italic gold "Bella" name, italic Fraunces quote.
- A **daily-question counter with a progress bar**: mono row "today's questions / 3 of 10" above a thin track with a **teal→gold fill at 30%**.
- Input pill at the bottom ("Ask anything, gently…") with a gold→ember arrow button. Tab bar visible.

**Bella's chat mechanics (current):**
- The frontend streams from **`POST /api/belly-chat`** — a Vercel Edge function (`api/belly-chat.ts`) calling **Anthropic `claude-sonnet-4-6`** directly with a naturopathic-doula system prompt. SSE chunks feed a **typewriter effect** (`AskDoula.tsx:167-274`: stream buffer + ~200 chars/sec interval drip), abortable via a stop button. This is the "streaming typewriter" from the recent commit — it exists and works.
- ⚠️ A **second, divergent chat backend** also exists: `supabase/functions/belly-chat/index.ts` (Lovable AI gateway → `google/gemini-3-flash-preview`, different system prompt, image-safety mode). The app currently uses the Vercel one; the Supabase one appears orphaned. These should be consolidated.

**Paywall counter (current):**
- Limit is **hardcoded to 10/day** in `AskDoula.tsx:62` (`quotaExhausted = !profile.is_premium && messageCount >= 10`).
- The count is **real Supabase data**: on mount it counts today's `chat_messages` rows with `role='user'` (`AskDoula.tsx:73-83`); every message is inserted into `chat_messages`.
- At the limit: input disabled + inline upsell bubble → **`PremiumModal`** (bottom sheet, hardcoded **$9.99/mo, $59.99/yr**, "Start 7-day free trial", embedded Stripe checkout via the `create-checkout` edge function which resolves the real price by lookup key).
- ⚠️ Discrepancies: the DB has `app_config.free_message_limit` (default 10) which **AdminSettings edits — but AskDoula ignores it**, so the admin setting is a no-op. And the limit is **client-side only** — neither chat backend enforces any quota server-side.

**Data: real vs. hardcoded:**
| Element | Source |
|---|---|
| AI responses | Vercel Edge `/api/belly-chat` → Anthropic (streamed) |
| Message history & daily count | **Real Supabase** — `chat_messages` |
| Quick prompts, greeting, safety chip | **Hardcoded** in `AskDoula.tsx` |
| Week / name / pregnancy number / premium flag | **Real Supabase** — `profiles` |
| Trending line, Bella quote, category tiles | **Do not exist yet** (net-new per reference; trending could be derived from `chat_messages`) |

---

## 4. Mamas screen

**File / component:** `src/pages/Community.tsx` (`Community`), routed at `/community`. `src/components/PostSheet.tsx` + `PostSheetProvider` (mounted in `App.tsx`) are **dead code** — Community uses its own inline composer and nothing ever calls `usePostSheet().open()`.

**What it looks like now:**
- Solid orange `#E8601A` header, Fraunces white "Mama Community", subtitle "Week N mamas · N members", `NotificationBell`, white "+ Post" pill.
- **5 filter pills**: All / Questions / Stories / Tips / Support.
- Post cards: white with orange border; **plain initial-letter avatars** (single style); pinned post = highest-liked post, sage left border + sage "PINNED" badge; **Playfair Display** titles; category pill; heart/like + comment counts. Full-screen post detail overlay with replies and reply composer; inline bottom-sheet create-post modal; in-component notifications view.

**What it should look like per the reference (`scene-mamas`, lines 309–358):**
- Dark magenta scene. Header: **"Mama community"** with mono tag **"week 33 · 90 mamas tonight"**, **⋯ menu**, and a cream **"+ post" pill with an ember plus icon**.
- **3 filter pills only**: All (filled magenta→ember gradient) / Questions / Stories.
- Glass post cards with **colored gradient initial avatars** (ember, teal, magenta variants), meta line "Name · wk N", **gold "pinned" tag** and **gold left border** (square-left radius) on the pinned card, **Fraunces** titles, and gold-stroked heart/comment icons ("new" / "be first" for zero-engagement posts).

**Data: real vs. hardcoded:**
| Element | Source |
|---|---|
| Posts, likes, comments, author names, notifications | **Real Supabase** — `posts`, `post_likes`, `comments`, `profiles`, `notifications` (plain queries, no RPCs) |
| Seeded content | **90 hardcoded posts** in `src/data/seededPosts.ts`, merged with DB posts (deduped by title). Seeded posts are local-only: likes don't persist, replies disabled |
| Member count / "90 mamas tonight" | Current subtitle count is computed; the reference's "tonight" presence count doesn't exist (admin has a presence channel, the app doesn't) |
| Posting | **Real** — inserts into `posts` with `week_posted` |

---

## 5. Shop screen

**File / component:** `src/pages/Shop.tsx` (`Shop`), routed at `/shop`. Cart in `src/contexts/CartContext.tsx` + `src/pages/Cart.tsx`; orders in `Orders.tsx`; Stripe glue in `src/lib/stripe.ts`.

**What it looks like now:**
- Solid orange `#E8601A` header "Belly Shop" + cart-bag icon with count badge.
- **Two tabs: "Remedies" and "Learn"** (not category pills). Remedies tab: hero banner card, "REMEDY KITS" horizontal carousel (emoji circles, tags, prices), "INDIVIDUAL REMEDIES" list rows, "HERBAL TEAS" list rows, FDA disclaimer. Learn tab: homeopathy courses with progress bars and premium locks, full in-page lesson reader with quizzes/reflections.

**What it should look like per the reference (`scene-shop`, lines 424–484):**
- Dark plum→rust scene. Header: **"Belly shop"** with mono tag **"natural remedies · delivered"**; right side is just a **shopping-bag icon button** (no week pill on this screen).
- **3 category pills: Remedies (filled) / Teas / Kits.**
- Gold mono section label **"bella recommends for week 33"** — a personalized, week-aware merchandising angle that doesn't exist today.
- Featured glass card: "REMEDY KIT" eyebrow, Fraunces "Third trimester relief kit", gold mono **$34.99**, contents line "Arnica · Chamomilla · Red raspberry leaf", full-width **gold→ember "Add to cart →"** button.
- "individual remedies" label + compact glass rows: Fraunces product name, muted description, **gold JetBrains Mono price**, small ember "Add".
- The reference has **no Learn tab** (courses would live elsewhere or be dropped from Shop).

**Data: real vs. hardcoded:**
| Element | Source |
|---|---|
| Products | Hybrid, DB-preferred: `useShopProducts()` starts with **hardcoded `src/data/shopData.ts`** (4 kits, 8 remedies, 4 teas) and **replaces it with Supabase `products`** rows (`is_active`, `sort_order`, incl. `stripe_price_id`) when the table is non-empty |
| Courses / lessons | **Hardcoded** — `shopData.ts` + `homeopathyLessons.ts`; completions/reflections write to Supabase `lesson_completions` / `lesson_reflections` |
| Cart | **localStorage only** (`belly-cart-items`) — not in Supabase |
| Checkout | **Real** — `create-shop-checkout` edge function pre-creates an `orders` row, builds a Stripe session, webhook flips to `paid` |
| "Bella recommends for week N" | **Does not exist** — net-new per reference |

---

## 6. Journey screen

**File / component:** **Does not exist.** The bottom-nav tab labeled "Journey" (`src/components/BottomNav.tsx:32`) actually routes to **`/me` → `Profile.tsx`**, whose only journey-ish element is a small 4-dot "MY JOURNEY" progress widget (`Profile.tsx:157-191`). `Journal.tsx` (`/journal`) is a daily mood/symptom log writing to Supabase `journal_entries` — a different feature entirely. No component, route, or file named Journey exists anywhere.

**What it should look like per the reference (`scene-journey`, lines 486–562)** — an entirely new screen:
- Dark teal→plum→amber scene. Header: **Bella orb** + "Your journey / 40 weeks, one glow", **⋯ menu + cream week pill**.
- A **journey arc**: a 9px bar with a **teal → magenta → gold gradient**, a cream/gold glowing **marker at week 33 (82.5%)**, mono tick labels **T1 / T2 / T3 / birth**, and the gold mono caption "week 33 of 40 — the glow is warming up".
- A glass **"your timeline"** card: vertical timeline with a hairline spine and colored dots — teal (done, early), magenta (done, mid), **pulsing gold "You are here, mama" at week 33**, dashed-outline future dot for "week 40 · Due date". Entries: wk6 Heartbeat first detected, wk12 First trimester complete, wk20 Anatomy scan day, wk28 Third trimester begins, wk33 now, wk40 due date.
- A **"Bella's note"** card (teal→magenta glass) with a large 44px Bella orb and the note "Seven weeks left — the glow gets warmer from here."

**Data:** nothing exists yet. The week marker and "you are here" can derive from Supabase `profiles.due_date`; the milestone list would be static (like `pregnancyWeeks.ts`) unless a milestones table is added. Building this screen also means deciding what happens to the current `/me` Profile page (the tab currently points there).

---

## 7. Navigation

**File / component:** `src/components/BottomNav.tsx`, rendered by `AppLayout` in `App.tsx`. (`src/components/NavLink.tsx` is an unrelated react-router shim, not used by the nav.)

**Now:** fixed, centered `min(430px,100%)` bar, **solid deep orange `#D4500F`**, rounded top corners. 6 tabs — Today `/`, Baby `/baby`, Ask Bella `/ask`, Mamas `/community`, Shop `/shop` (with cart badge), **Journey `/me`** (points at Profile). Active = white icon/label + small white underline bar. **Hidden on FullScreen routes including `/ask`**, so the tab bar disappears on the Ask Bella screen.

**Per reference:** **translucent dark glass bar** — `rgba(10,6,16,0.55)` + `backdrop-filter: blur(16px)`, 1px top hairline `rgba(255,255,255,0.12)`. Same 6 tab names and order, thin-stroke icons, 8.5px labels. Active tab = **gold icon + gold label + tiny gold dot** beneath. Present on **every** screen, including Ask Bella and Journey. Journey must point to the new Journey screen, not Profile.

Headers: the reference gives **every screen** an overflow **⋯ icon button** and (except Shop/Mamas variants) a **cream week pill**. Today, no screen has an overflow menu, and only Baby shows a week pill (as a translucent ghost pill, not cream). Community and Shop also bypass `AppHeader` with their own inline orange headers — the redesign is a chance to unify on one header component.

---

## 8. Colors & fonts

**Files:** `src/index.css`, `tailwind.config.ts`, `index.html`, `src/lib/theme.ts`, `src/App.css`.

| | Now | Per reference |
|---|---|---|
| Page background | Cream `#F0E8DC` (light); warm dark-brown dark mode | Night gradient `#150A1F → #0d0713` + per-screen radial scene gradients + grain overlay + silhouette watermark |
| Primary accent | Terracotta `#E8702A` (borders, headers, buttons) | Gold `#F2B647` + ember `#E8622E` gradients; magenta `#B5386B` and teal `#2C9C8F` as semantic accents |
| Cards | Solid white, 1.5px orange border, radius 22 | Glass: `rgba(255,255,255,0.10)` bg, blur(18px), `rgba(255,255,255,0.22)` border, radius 20 |
| Text | `#1A0E06` / `#7A5038` on light | Cream `#FBEEE0` with rgba-cream secondary tones on dark |
| Semantic color coding | Sage green = "online"; symptom pills use ad-hoc amber/lavender/green | System-wide: **ember = physical, teal = nutrition/rest, magenta = big emotional moments** (Ask Bella tiles + legend, Mamas avatars, Baby counter tiles) |
| Display font | Fraunces (kept in reference) + Playfair Display (not in reference) | Fraunces only |
| UI font | Nunito (home/nav) + Outfit (baby/chat) | **Inter** — not currently loaded |
| Mono font | none | **JetBrains Mono** for week pills, section labels, stats, counters, timeline ticks — not currently loaded |
| Theming | 3-way light/dark/system via `data-theme` (`src/lib/theme.ts`), undermined by hardcoded hex on most pages (`#E8601A`, `#D4500F`, `#FF8C42`, `#F0E8DC` inline) | Single dark theme; would replace the toggle or become the new "dark" |

---

## 9. Bella's chat & paywall counter (summary)

- **Streaming typewriter:** exists and matches the spirit of the redesign (`AskDoula.tsx:167-274`), backed by the Vercel `api/belly-chat.ts` → Anthropic. The orphaned Supabase `belly-chat` edge function (Gemini via Lovable) is a divergent second backend that should be reconciled.
- **Bella's avatar:** currently a 🌸 emoji in a blush circle (chat) and an orange text pill (home). The reference's signature element is an **animated CSS orb** (radial gradient `#fff2d8 → gold → ember`, pulsing box-shadow, `bellaPulse` keyframes) used in the Ask Bella header, the Today status pill, quote cards, and the Journey header. This component does not exist anywhere in the codebase.
- **Counter:** currently a plain text line under the input ("N/10 free messages today"). Reference shows a **mono label row ("today's questions / 3 of 10") + thin progress track with teal→gold fill**. The underlying count is real (Supabase `chat_messages`), but the limit is hardcoded client-side to 10, ignores the admin-editable `app_config.free_message_limit`, and is not enforced server-side.
- **Upgrade flow:** `PremiumModal` (orange sheet, hardcoded $9.99/$59.99, embedded Stripe checkout, 7-day trial via `create-checkout`) and a second lighter `PremiumUpgradeSheet` (used by Baby week-lock; also hardcodes prices; just navigates to `/me`). Prices shown in UI can drift from the real Stripe prices resolved by lookup key. Premium status = `profiles.is_premium`, mirrored by the `payments-webhook` edge function from the `subscriptions` table.

---

## 10. Admin dashboard

**Files:** `src/pages/admin/*` (15 pages), `src/components/admin/ui.tsx`, `src/hooks/useAdminRealtime.ts`, `scripts/check-admin.mjs` (untracked). Not depicted in the reference — no visual changes implied — but audited for real-vs-fake data as requested.

**Look:** its own dark console theme (near-black `#0a0a0a`/`#111` with `#FF8C42` accent, Fraunces + Outfit, inline styles), 224px sidebar with live presence counter, grouped nav, `SlidePanel`/`Modal` primitives. Access gated by `AdminGuard` → `has_role` RPC (SECURITY DEFINER against `user_roles`).

**Data audit:**
| Page | Real Supabase? |
|---|---|
| Overview (metrics, trimester split, live feed, recent orders) | Yes — `profiles`, `orders`, realtime channel. **⚠️ Bug: `AdminOverview.tsx` never imports `supabase` — the page throws `ReferenceError` at runtime** |
| Analytics (growth, moods, streaks, keywords, revenue) | Yes — aggregated client-side from `profiles`, `mood_logs`, `streak_state`, `chat_messages`, `posts`, `subscriptions`, `orders`, `promo_codes`. Plan-split and keyword logic are admitted heuristics |
| Users (table + detail, grant premium, make admin) | Yes — `profiles`, `chat_messages`, `orders`, `journal_entries`, `user_roles`; writes real |
| Chats (logs, flagging) | Yes — `chat_messages`; auto-flag keyword list is hardcoded client-side |
| Community (moderation) | Yes — `posts`, `notifications` |
| Orders (revenue, pipeline, shipping) | Yes — `orders` + realtime; writes real |
| Products (content manager) | Yes — `products` (⚠️ table missing from generated `types.ts` — untyped) |
| Premium (MRR/ARR/at-risk) | Partly — member list real (`profiles`, `subscriptions`) but **MRR/ARR math uses hardcoded $9.99**, not Stripe |
| Promo Codes | Yes — full CRUD on `promo_codes` |
| Broadcast | Yes, but in-app only — inserts `broadcasts` + chunked `notifications`; no real push (UI admits it) |
| Support | Yes — `support_tickets` (⚠️ also missing from `types.ts`) |
| AI Insights | Yes — `chat_messages`; topics = client-side word frequency |
| Settings | Yes — `user_roles`, `app_config`, `orders`. **⚠️ "Free message limit" edit is a no-op** (AskDoula hardcodes 10); add-admin-by-email is a stub `alert()` |

**⚠️ `scripts/check-admin.mjs`** (untracked) connects to the production Postgres with a **hardcoded connection string/password in plaintext** and upserts an admin role for `orelfitch@gmail.com`. This credential should be rotated and the file kept out of git (it currently is untracked, but the password is already exposed on this machine).

---

## Cross-cutting gaps (the short list)

1. **Entire visual system**: light terracotta/cream → dark golden-hour glassmorphism (backgrounds, cards, headers, per-screen scenes, grain, silhouettes).
2. **Fonts**: Inter and JetBrains Mono are not loaded at all; Nunito/Outfit/Playfair would be retired.
3. **Journey screen doesn't exist** — the tab is a mislabel pointing at Profile; the arc + timeline + Bella's note screen is net-new.
4. **Bella avatar orb component doesn't exist** (currently a 🌸 emoji).
5. **Ask Bella structure**: no color-coded category tiles/legend, no trending line, no Bella quote card, no progress-bar counter, and the tab bar is hidden on that screen.
6. **Headers**: no overflow ⋯ menus anywhere; week pill only on Baby; Community/Shop use one-off inline headers.
7. **Two divergent chat backends** (Vercel/Anthropic vs. Supabase/Gemini).
8. **Paywall is client-side only**, hardcoded to 10, disconnected from the admin-editable `app_config.free_message_limit`.
9. **Hardcoded prices** ($9.99/$59.99) in both premium surfaces can drift from Stripe.
10. **Fake data in the UI**: Today's "What's happening" feed is static; Community merges 90 seeded posts; Shop falls back to a static catalog; kick counts write to Supabase but never read back.
11. **Housekeeping**: unused `Index.tsx`, dead `PostSheet.tsx`/provider, stale generated `types.ts` (missing `products`, `support_tickets`), `AdminOverview` missing import, plaintext DB credential in `scripts/check-admin.mjs`.
