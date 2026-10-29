-- One-time checkout recovery email + marketing opt-outs.
ALTER TABLE public.funnel_orders ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.email_optouts (
  email text PRIMARY KEY CHECK (email = lower(email)),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_optouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read email optouts" ON public.email_optouts;
CREATE POLICY "Admins read email optouts" ON public.email_optouts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
