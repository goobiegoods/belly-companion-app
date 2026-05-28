CREATE TABLE public.breathing_streak (
  user_id uuid PRIMARY KEY,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_session_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.breathing_streak TO authenticated;
GRANT ALL ON public.breathing_streak TO service_role;
ALTER TABLE public.breathing_streak ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own breathing streak" ON public.breathing_streak FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "Users insert own breathing streak" ON public.breathing_streak FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own breathing streak" ON public.breathing_streak FOR UPDATE TO authenticated USING (auth.uid()=user_id);