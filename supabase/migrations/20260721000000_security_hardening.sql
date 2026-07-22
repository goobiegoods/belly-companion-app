-- ============================================================
-- Security hardening pass (2026-07-21) — additive only, no existing
-- feature should change behaviour. Run this in the Supabase SQL editor
-- (or `supabase db push` once linked) — it is NOT auto-applied.
-- ============================================================

-- ------------------------------------------------------------
-- 1) CRITICAL: profiles.is_premium (and related billing/admin fields)
--    are user-writable today. "Users can update their own profile" is
--    USING (auth.uid() = user_id) with no column restriction, so any
--    signed-in user can PATCH their own row and set is_premium=true,
--    push premium_expires_at into the future, or flip is_test_account —
--    a full Stripe-payment bypass. RLS is row-level, not column-level,
--    so the fix is a trigger that reverts these columns to their
--    previous value unless the request comes from service_role (the
--    Stripe webhook, api/stripe-webhook.ts, already writes is_premium
--    via SUPABASE_SERVICE_ROLE_KEY, so it is unaffected).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.is_premium := OLD.is_premium;
    NEW.premium_since := OLD.premium_since;
    NEW.premium_expires_at := OLD.premium_expires_at;
    NEW.is_test_account := OLD.is_test_account;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.protect_profile_admin_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_admin_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_admin_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_admin_fields();

-- ------------------------------------------------------------
-- 2) support_tickets: "Users can update own tickets" has no column
--    restriction either, so a user could forge admin_reply/replied_by,
--    or bump their own priority to 'urgent'. No page currently exercises
--    this update path client-side (grep-verified), but the RLS gap is
--    real the moment a support UI is wired up — closing it now.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_support_ticket_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.status := OLD.status;
    NEW.priority := OLD.priority;
    NEW.admin_reply := OLD.admin_reply;
    NEW.replied_at := OLD.replied_at;
    NEW.replied_by := OLD.replied_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.protect_support_ticket_admin_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_support_ticket_admin_fields_trigger ON public.support_tickets;
CREATE TRIGGER protect_support_ticket_admin_fields_trigger
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.protect_support_ticket_admin_fields();

-- ------------------------------------------------------------
-- 3) products: "Anyone can read active products" is USING (true) — the
--    name says "active" but it doesn't actually filter is_active, so
--    inactive/discontinued/draft products are readable by anyone
--    (including signed-out visitors) via a direct REST call. Admins keep
--    full visibility through the separate "Admins can manage products"
--    FOR ALL policy, so this only removes non-admin visibility into
--    inactive rows.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT USING (is_active = true);

-- ------------------------------------------------------------
-- 4) orders: "Users can create their own orders" lets a signed-in user
--    INSERT an order row directly with any status (e.g. status='paid')
--    for themselves — WITH CHECK only verifies auth.uid() = user_id, not
--    status/total. The app no longer uses this path: orders are created
--    server-side in api/stripe-shop-checkout.ts via the service role key
--    (grep-verified: no `.from("orders").insert` anywhere in src/).
--    Removing it closes a fake-order/self-fulfilment vector with zero
--    functional loss today. Flagging explicitly per your instruction —
--    skip this DROP if you know of another caller that still needs it.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- ------------------------------------------------------------
-- 5) Input validation — server-side length caps on free-text fields
--    that had none (defence in depth alongside the belly-chat.ts caps).
--    Limits are generous; normal usage is well under them.
-- ------------------------------------------------------------
ALTER TABLE public.posts
  ADD CONSTRAINT posts_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT posts_body_length CHECK (char_length(body) <= 8000);

ALTER TABLE public.comments
  ADD CONSTRAINT comments_body_length CHECK (char_length(body) <= 3000);

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_content_length CHECK (char_length(content) <= 6000);

ALTER TABLE public.journal_entries
  ADD CONSTRAINT journal_entries_note_length CHECK (note IS NULL OR char_length(note) <= 10000);

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_subject_length CHECK (char_length(subject) <= 200),
  ADD CONSTRAINT support_tickets_body_length CHECK (char_length(body) <= 5000);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_first_name_length CHECK (first_name IS NULL OR char_length(first_name) <= 100);
