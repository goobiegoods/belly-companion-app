
CREATE TABLE public.affirmation_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affirmation_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affirmation_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own views" ON public.affirmation_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own views" ON public.affirmation_views FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text,
  score integer,
  total_questions integer,
  selected_option text,
  is_correct boolean,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
