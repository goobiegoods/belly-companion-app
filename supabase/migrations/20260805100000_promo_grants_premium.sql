-- ============================================================
-- Founding-creator promo → Pro redemption (2026-08-05).
-- Run by hand in the Supabase SQL editor (not auto-applied).
-- Assumes 20260721000000_security_hardening.sql is already live
-- (protect_profile_admin_fields_trigger on profiles) — redemption
-- writes is_premium via service_role only, which that trigger allows.
-- ============================================================

-- 1) Promo codes can now grant Pro directly (founding-creator codes).
alter table public.promo_codes
  add column if not exists grants_premium boolean not null default false;

-- 2) Redemption ledger: who redeemed which code, once per user per code.
create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

alter table public.promo_redemptions enable row level security;

create policy "Users read own redemptions" on public.promo_redemptions
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Admins read all redemptions" on public.promo_redemptions
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies on purpose: only service_role writes,
-- via redeem_promo_code below (called from api/redeem-promo.ts).

-- 3) Atomic redemption. SECURITY DEFINER + service_role-only EXECUTE:
--    api/redeem-promo.ts verifies the caller's JWT and passes the verified
--    user id — clients can never call this directly. FOR UPDATE serialises
--    concurrent claims so max_uses = 1 is race-safe.
create or replace function public.redeem_promo_code(_user_id uuid, _code text)
returns table(status text, granted_premium boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  promo public.promo_codes%rowtype;
begin
  select * into promo
  from public.promo_codes p
  where upper(p.code) = upper(trim(_code))
  for update;

  if not found
     or not promo.is_active
     or promo.valid_from > now()
     or (promo.valid_until is not null and promo.valid_until <= now()) then
    return query select 'invalid'::text, false;
    return;
  end if;

  if exists (
    select 1 from public.promo_redemptions r
    where r.code_id = promo.id and r.user_id = _user_id
  ) then
    return query select 'already_redeemed'::text, false;
    return;
  end if;

  if promo.max_uses is not null and promo.current_uses >= promo.max_uses then
    return query select 'exhausted'::text, false;
    return;
  end if;

  insert into public.promo_redemptions (code_id, user_id)
  values (promo.id, _user_id);

  update public.promo_codes
  set current_uses = current_uses + 1
  where id = promo.id;

  if promo.grants_premium then
    update public.profiles
    set is_premium = true,
        premium_since = coalesce(premium_since, now())
    where user_id = _user_id;
  end if;

  return query select 'ok'::text, promo.grants_premium;
end;
$$;

revoke execute on function public.redeem_promo_code(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_promo_code(uuid, text) to service_role;
