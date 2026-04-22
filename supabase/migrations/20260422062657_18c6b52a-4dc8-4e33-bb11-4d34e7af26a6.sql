CREATE TABLE public.saves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saves"
ON public.saves FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saves"
ON public.saves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saves"
ON public.saves FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_saves_user_post ON public.saves(user_id, post_id);