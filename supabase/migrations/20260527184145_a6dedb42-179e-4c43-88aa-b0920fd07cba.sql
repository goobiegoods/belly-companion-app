CREATE TABLE public.feed_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('breast','bottle','pump')),
  side TEXT,
  duration_seconds INT,
  amount_ml INT,
  bottle_type TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_logs TO authenticated;
GRANT ALL ON public.feed_logs TO service_role;

ALTER TABLE public.feed_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own feed logs" ON public.feed_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own feed logs" ON public.feed_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own feed logs" ON public.feed_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own feed logs" ON public.feed_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_feed_logs_user_logged ON public.feed_logs (user_id, logged_at DESC);