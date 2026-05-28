
-- 1) notifications: restrict INSERT to self or admin
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users insert own or admin inserts any"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2) promo_codes: remove public read; only admins can access directly.
DROP POLICY IF EXISTS "Public can read active promo codes" ON public.promo_codes;

-- Provide a safe RPC for client-side promo validation that returns only what's
-- needed (code, discount_type, discount_value) for active codes.
CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text)
RETURNS TABLE(code text, discount_type text, discount_value numeric, min_order_value numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.code, p.discount_type, p.discount_value, p.min_order_value
  FROM public.promo_codes p
  WHERE p.code = _code
    AND p.is_active = true
    AND (p.valid_until IS NULL OR p.valid_until > now())
    AND (p.max_uses IS NULL OR p.current_uses < p.max_uses)
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.validate_promo_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text) TO authenticated;

-- 3) user_roles: prevent any client-side role modification. Only service_role
-- (edge functions / admin tooling) can grant/revoke roles. Admin reads remain.
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

-- 4) Lock down SECURITY DEFINER helper/trigger functions to least-privilege.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_post_owner_on_comment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role / has_active_subscription must remain callable by authenticated
-- because they are referenced inside RLS policies; just revoke from anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
