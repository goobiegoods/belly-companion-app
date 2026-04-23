

# Belly Admin Dashboard — Build the full /admin route tree

A complete, dark-theme CRM for Belly. Replaces the existing 5-page admin scaffold with a 12-page dashboard reading live data from the database. Desktop-first, fixed sidebar, orange accents, professional polish.

## Design system (locked in)

- BG `#0a0a0a` · Sidebar `#080808` · Card `#111111` · Border `#1e1e1e`
- Orange `#FF8C42` (active/CTAs/metric highlights)
- Text: white / `#888` / `#444`
- Status: success `#22c55e` · warning `#FF8C42` · danger `#ef4444` · info `#3b82f6` · premium `#a855f7`
- Fraunces 800 for page titles + metric values; Outfit for everything else
- Layout: 220px fixed sidebar + scrollable main (padding 28px 32px)

## Backend changes (one migration)

New tables + columns the admin needs:

```sql
-- promo codes
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric not null,
  max_uses integer,
  current_uses integer default 0,
  min_order_value numeric default 0,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  created_by uuid
);
-- RLS: admins full access, public read of active codes only

-- broadcasts (in-app announcements)
create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text not null,
  cta_text text, cta_url text,
  segment text not null default 'all',  -- all|premium|free|t1|t2|t3|inactive7
  scheduled_for timestamptz, sent_at timestamptz,
  reach_estimate integer default 0,
  created_by uuid, created_at timestamptz default now()
);

create table public.broadcast_reads (
  broadcast_id uuid not null,
  user_id uuid not null,
  read_at timestamptz default now(),
  primary key (broadcast_id, user_id)
);

-- chat moderation
alter table chat_messages
  add column if not exists is_flagged boolean default false,
  add column if not exists reviewed_at timestamptz,
  add column if not exists conversation_id uuid;

-- order fulfilment + admin notes
alter table orders
  add column if not exists tracking_number text,
  add column if not exists carrier text,
  add column if not exists shipped_at timestamptz,
  add column if not exists admin_notes text,
  add column if not exists promo_code text;

-- post moderation
alter table posts
  add column if not exists is_featured boolean default false,
  add column if not exists is_flagged boolean default false,
  add column if not exists flag_reason text;

-- app config (single-row)
create table public.app_config (
  id integer primary key default 1 check (id = 1),
  free_message_limit integer default 10,
  premium_monthly_price numeric default 9.99,
  maintenance_mode boolean default false,
  updated_at timestamptz default now()
);
insert into app_config (id) values (1) on conflict do nothing;
```

All new tables get RLS: admin-only via `has_role(auth.uid(), 'admin')`. Pre-seed promo codes BELLY10 / BELLY20 / MAMA / BIRTH.

## Route tree (under `/admin/*`)

```text
/admin                  Dashboard         (metrics + revenue chart + activity + recent orders)
/admin/analytics        Analytics         (growth, engagement, retention, content, revenue)
/admin/orders           Orders            (filters + table + slide-in detail panel)
/admin/promo-codes      Promo Codes       (table + create/edit modal)
/admin/products         Products          (catalog from shopData.ts, edit modal — note re: Supabase migration)
/admin/users            All Users         (search/filter + slide-in user profile)
/admin/premium          Premium Members   (plans + churn risk + at-risk/churned tabs)
/admin/chats            Doula Chat Logs   (conversation list + thread viewer + flagging)
/admin/community        Community Posts   (filters + flagged section + actions)
/admin/broadcast        Broadcast         (composer + segment + preview + history)
/admin/settings         Settings          (admins, app config, danger zone)
```

## File map

```text
src/pages/admin/
  AdminLayout.tsx          (rewrite — new sidebar w/ groups, LIVE dot, admin footer)
  AdminGuard.tsx           (new — shared loading + redirect)
  AdminOverview.tsx        (rewrite as Dashboard)
  AdminAnalytics.tsx       (new)
  AdminOrders.tsx          (rewrite — filters, search, side panel, ship modal, CSV export)
  AdminPromoCodes.tsx      (new)
  AdminProducts.tsx        (rewrite — expandable rows, edit modal)
  AdminUsers.tsx           (rewrite — filters, side panel, role/premium actions)
  AdminPremium.tsx         (new)
  AdminChats.tsx           (new)
  AdminCommunity.tsx       (rewrite — tabs incl. Flagged, Feature action)
  AdminBroadcast.tsx       (new)
  AdminSettings.tsx        (new)

src/components/admin/
  AdminSidebar.tsx         MetricCard.tsx       StatusPill.tsx
  RevenueChart.tsx         LiveActivityFeed.tsx SlidePanel.tsx
  ConfirmDialog.tsx        AdminTable.tsx       SegmentSelector.tsx

src/hooks/
  useIsAdmin.ts            (already exists — extend to return { isAdmin, loading })
  useAdminRealtime.ts      (new — subscribes to orders/profiles/posts/chat for live feed)

src/App.tsx                (wrap /admin/* in AdminGuard, register all 11 child routes)
```

## Page-by-page summary

1. **Dashboard** — 5 metric cards (users, revenue all-time, revenue today, pending orders, premium members) with deltas; revenue bar chart (last 7 days, recharts); live activity feed (Supabase realtime on orders/profiles/posts/chat_messages); recent orders table with expandable rows + Mark Shipped.
2. **Analytics** — User growth line+overlay, engagement grid (avg msgs/user, mood pie, streak histogram), retention (D1/D7/D30 from auth metadata), top content (liked posts + chat keyword clusters), revenue breakdown (SKU bar, plan donut, promo usage).
3. **Orders** — Status tabs, search, date-range filter, full table, slide-in detail panel (customer, items, promo, shipping, Stripe link, timeline, ship modal w/ tracking + carrier, admin notes, refund stub), CSV export.
4. **Promo Codes** — Table with usage progress bars, create/edit modal (% or $, min order, max uses, validity dates, generate-random helper), deactivate/delete.
5. **Products** — Catalog from `shopData.ts` (kits + remedies + teas), expandable rows, edit modal updates a local override store + shows note "Connect to products table for live editing." Toggle active/inactive persisted in localStorage for now.
6. **Users** — Search + filter chips (trimester / premium / signup date / last active), table with status pills incl. Churned, slide-in profile (pregnancy, stats, last 5 chats, last 3 orders, journal count, community activity, Grant/Revoke Premium, Make/Remove Admin via `user_roles`).
7. **Premium Members** — Filter to `is_premium = true`, joined with `subscriptions`; tabs Active / At-risk / Churned; MRR/ARR + projection.
8. **Doula Chat Logs** — Group `chat_messages` by user + day → conversation rows; flag column; thread viewer; keyword search; "Flag for review" / "Mark reviewed" using new columns.
9. **Community Posts** — Tabs (All / Pinned / Flagged / categories); Pin/Unpin, Feature, Delete, Warn (sends a `notifications` row); right-rail stats.
10. **Broadcast** — Title/body/CTA composer, segment selector w/ live reach count from profiles, push-style preview, Send now or schedule, history table.
11. **Settings** — Admins list + add by email (via `user_roles`), App Config form (free message limit, premium price note, maintenance toggle reading/writing `app_config`), Danger Zone wipe-test-data button (only when no real orders).

## Guard + access

`AdminGuard` wraps the layout: shows an `AdminLoadingScreen` while the role check resolves, redirects to `/` if not admin. Uses existing `useIsAdmin` hook (extended to expose `loading`). The README/setup-only step `INSERT INTO user_roles (user_id, role) VALUES ('YOUR-UUID','admin')` is documented in a small banner inside Settings → Admin Users when zero admins exist.

## Live data wiring

- Realtime: `useAdminRealtime` opens one channel listening to inserts on `orders`, `profiles`, `posts`, `post_likes`, `chat_messages`, `subscriptions` and pushes shaped events into the activity feed + invalidates dashboard counts.
- Charts: recharts (already a likely dep — verified during implementation; install if missing).
- All counts use `head: true, count: 'exact'` queries to stay light.

## Non-goals (explicit)

- No real push-notification delivery (broadcasts are in-app only — documented).
- No live Stripe refund call wired up; "Refund" button shows a placeholder modal.
- Products edit doesn't migrate `shopData.ts` to the DB this round (shipped as a future task surfaced in the UI note).
- AI keyword clustering for "most asked topics" uses a simple in-page keyword tally over recent `chat_messages` (no extra LLM call).

## Test plan

1. Sign in as a user with `user_roles.role='admin'` → `/admin` loads dashboard with live metrics. Non-admin → redirected to `/`.
2. Place a test order → activity feed updates within 2s, Pending Orders metric +1.
3. Create promo code BETA50 in Promo Codes → row appears, usage bar at 0/—.
4. Open a user in Users → slide panel shows pregnancy + last 5 chats + grant premium toggles `is_premium`.
5. Flag a chat in Chats → row gets red flag pill; mark reviewed → flag clears.
6. Compose a Broadcast for "Premium only" → reach count matches `select count from profiles where is_premium`; Send now writes a `broadcasts` row + a `notifications` row per matching user.
7. Toggle Maintenance Mode in Settings → `app_config.maintenance_mode = true` (UI banner on user-facing app is out-of-scope this round, just persistence).

