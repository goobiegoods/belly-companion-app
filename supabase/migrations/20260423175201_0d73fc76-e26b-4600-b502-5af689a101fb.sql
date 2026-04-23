-- promo codes
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric not null,
  max_uses integer,
  current_uses integer not null default 0,
  min_order_value numeric not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.promo_codes enable row level security;

create policy "Admins manage promo codes" on public.promo_codes
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public can read active promo codes" on public.promo_codes
  for select to authenticated
  using (is_active = true and (valid_until is null or valid_until > now()));

-- broadcasts
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  cta_text text,
  cta_url text,
  segment text not null default 'all',
  scheduled_for timestamptz,
  sent_at timestamptz,
  reach_estimate integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.broadcasts enable row level security;

create policy "Admins manage broadcasts" on public.broadcasts
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- broadcast reads
create table if not exists public.broadcast_reads (
  broadcast_id uuid not null,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (broadcast_id, user_id)
);

alter table public.broadcast_reads enable row level security;

create policy "Users manage own broadcast reads" on public.broadcast_reads
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins view all broadcast reads" on public.broadcast_reads
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- chat moderation
alter table public.chat_messages
  add column if not exists is_flagged boolean not null default false,
  add column if not exists reviewed_at timestamptz,
  add column if not exists conversation_id uuid;

create policy "Admins view all chat messages" on public.chat_messages
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update chat messages" on public.chat_messages
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- order fulfilment
alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists carrier text,
  add column if not exists shipped_at timestamptz,
  add column if not exists admin_notes text,
  add column if not exists promo_code text;

-- post moderation
alter table public.posts
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_flagged boolean not null default false,
  add column if not exists flag_reason text;

-- app config
create table if not exists public.app_config (
  id integer primary key default 1 check (id = 1),
  free_message_limit integer not null default 10,
  premium_monthly_price numeric not null default 9.99,
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

create policy "Anyone authenticated can read app config" on public.app_config
  for select to authenticated using (true);

create policy "Admins update app config" on public.app_config
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins insert app config" on public.app_config
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.app_config (id) values (1) on conflict (id) do nothing;

-- seed promo codes
insert into public.promo_codes (code, description, discount_type, discount_value, max_uses)
values
  ('BELLY10', 'Beta user discount', 'percentage', 10, null),
  ('BELLY20', 'Influencer discount', 'percentage', 20, 50),
  ('MAMA', 'Community sharing', 'fixed', 5, null),
  ('BIRTH', 'Birth plan users', 'percentage', 15, null)
on conflict (code) do nothing;