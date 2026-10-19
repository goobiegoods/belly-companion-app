-- ============================================================
-- Landing funnel (meetbelly.com) — ADDITIVE ONLY.
-- New tables are server-only (RLS on, no client policies) except
-- read access for admins. No existing table or row is modified.
-- ============================================================

-- 1) Email capture: "sold out · notify me" waitlists + checkout starts.
CREATE TABLE IF NOT EXISTS public.funnel_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(email)),
  kind text NOT NULL CHECK (kind IN ('waitlist', 'checkout_start')),
  product_key text NOT NULL DEFAULT '',
  variant text,
  stage text,
  anon_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, kind, product_key)
);
CREATE INDEX IF NOT EXISTS funnel_leads_kind_product_idx ON public.funnel_leads (kind, product_key);
ALTER TABLE public.funnel_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read funnel leads"
  ON public.funnel_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) One row per funnel Checkout Session (attribution + fulfillment state).
CREATE TABLE IF NOT EXISTS public.funnel_orders (
  stripe_session_id text PRIMARY KEY,
  email text NOT NULL,
  variant text NOT NULL,
  offer text NOT NULL,
  trial_days integer NOT NULL DEFAULT 0,
  ebook boolean NOT NULL DEFAULT false,
  stage text,
  anon_id text,
  fbp text,
  fbc text,
  client_ip text,
  client_ua text,
  gpc boolean NOT NULL DEFAULT false,
  livemode boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_user boolean NOT NULL DEFAULT false,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired')),
  magic_link_sent_at timestamptz,
  capi_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS funnel_orders_sub_idx ON public.funnel_orders (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS funnel_orders_user_idx ON public.funnel_orders (user_id);
ALTER TABLE public.funnel_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read funnel orders"
  ON public.funnel_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) Account lookup by email for the webhook (prevents duplicate accounts).
--    service_role only — never callable from the browser.
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(_email text)
RETURNS TABLE (user_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT u.id FROM auth.users u
  WHERE lower(u.email) = lower(_email)
  ORDER BY u.created_at
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO service_role;

-- 4) Demand dashboard: waitlist sign-ups per sold-out product.
CREATE OR REPLACE VIEW public.funnel_waitlist_counts
WITH (security_invoker = true) AS
  SELECT product_key,
         count(*)        AS signups,
         count(DISTINCT stage) FILTER (WHERE stage IS NOT NULL) AS paths,
         max(created_at) AS last_signup
  FROM public.funnel_leads
  WHERE kind = 'waitlist'
  GROUP BY product_key
  ORDER BY signups DESC;
