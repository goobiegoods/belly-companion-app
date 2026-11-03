-- Social autopilot switch + lifecycle email log (welcome, trial ending, win-back).

ALTER TABLE public.app_config ADD COLUMN IF NOT EXISTS social_autopilot boolean NOT NULL DEFAULT false;
INSERT INTO public.app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  ref text NOT NULL,
  user_id uuid,
  email text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, ref)
);
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read email log" ON public.email_log;
CREATE POLICY "Admins read email log" ON public.email_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Who is due a lifecycle email right now. Service role only (reads auth.users emails).
CREATE OR REPLACE FUNCTION public.lifecycle_queue()
RETURNS TABLE (kind text, ref text, user_id uuid, email text, first_name text, ends_at timestamptz, price_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  WITH base AS (
    SELECT p.user_id, u.email::text AS email, p.first_name, p.created_at
    FROM public.profiles p JOIN auth.users u ON u.id = p.user_id
    WHERE NOT coalesce(p.is_test_account, false) AND u.email IS NOT NULL
  ), q AS (
    SELECT 'welcome_d1'::text AS kind, b.user_id::text AS ref, b.user_id AS user_id, b.email AS email, b.first_name AS first_name, NULL::timestamptz AS ends_at, NULL::text AS price_id
      FROM base b WHERE b.created_at BETWEEN now() - interval '48 hours' AND now() - interval '20 hours'
    UNION ALL
    SELECT 'welcome_d3', b.user_id::text, b.user_id, b.email, b.first_name, NULL, NULL
      FROM base b WHERE b.created_at BETWEEN now() - interval '96 hours' AND now() - interval '68 hours'
    UNION ALL
    SELECT 'trial_ending', s.stripe_subscription_id, b.user_id, b.email, b.first_name, s.current_period_end, s.price_id
      FROM public.subscriptions s JOIN base b ON b.user_id = s.user_id
      WHERE s.status = 'trialing' AND NOT coalesce(s.cancel_at_period_end, false)
        AND s.current_period_end BETWEEN now() + interval '24 hours' AND now() + interval '80 hours'
    UNION ALL
    SELECT 'winback', b.user_id::text, b.user_id, b.email, b.first_name, NULL, NULL
      FROM public.subscriptions s JOIN base b ON b.user_id = s.user_id
      WHERE s.status = 'canceled' AND s.updated_at BETWEEN now() - interval '10 days' AND now() - interval '6 days'
  )
  SELECT * FROM q WHERE NOT EXISTS (SELECT 1 FROM public.email_log l WHERE l.kind = q.kind AND l.ref = q.ref)
$$;
REVOKE ALL ON FUNCTION public.lifecycle_queue() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lifecycle_queue() TO service_role;
