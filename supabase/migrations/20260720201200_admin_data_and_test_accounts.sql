-- ============================================================
-- 1) Admin visibility into subscriptions (was missing — even the
--    real admin couldn't read other users' subscription rows,
--    which silently broke AdminPremium.tsx and blocks the Money
--    panel's MRR figure). Same pattern as the existing admin
--    policies on orders/profiles.
-- ============================================================
CREATE POLICY "Admins view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2) Seed/QA test-account tagging so founder-dashboard metrics
--    reflect real users only.
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_test_account boolean NOT NULL DEFAULT false;

-- Auto-tag future signups at insert time.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_test boolean;
BEGIN
  v_is_test := (
    NEW.email ILIKE 'seed+%@belly.app'
    OR NEW.email ILIKE '%@bellytest.dev'
    OR COALESCE((NEW.raw_user_meta_data->>'seed_account')::boolean, false)
    OR COALESCE((NEW.raw_user_meta_data->>'qa_account')::boolean, false)
  );
  INSERT INTO public.profiles (user_id, is_test_account)
  VALUES (NEW.id, v_is_test);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill existing seed personas, the QA domain, and the one-off
-- manual Stripe test account.
UPDATE public.profiles p
SET is_test_account = true
FROM auth.users u
WHERE p.user_id = u.id
  AND (
    u.email ILIKE 'seed+%@belly.app'
    OR u.email ILIKE '%@bellytest.dev'
    OR u.email = 'orel.shemen@gmail.com'
    OR COALESCE((u.raw_user_meta_data->>'seed_account')::boolean, false)
    OR COALESCE((u.raw_user_meta_data->>'qa_account')::boolean, false)
  );
