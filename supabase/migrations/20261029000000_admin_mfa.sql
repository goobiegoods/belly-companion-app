-- Admin requires two-factor (TOTP).
-- has_role(…, 'admin') now answers true only for an AAL2 session (a session that
-- passed an authenticator-app code) or for the service role. Every other role is
-- unchanged. Apply AFTER the admin two-factor screen is deployed and you have
-- enrolled your authenticator, or admin will show "no admin role" until you do.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  AND (
    _role <> 'admin'
    OR coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    OR auth.role() = 'service_role'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
