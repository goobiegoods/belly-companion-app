-- Lesson reflections (one per user per lesson)
CREATE TABLE IF NOT EXISTS public.lesson_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  reflection_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reflections"
  ON public.lesson_reflections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_lesson_reflections_updated_at
  BEFORE UPDATE ON public.lesson_reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course completions (one per user per course)
CREATE TABLE IF NOT EXISTS public.course_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id text NOT NULL,
  lessons_count integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own course completions"
  ON public.course_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own course completions"
  ON public.course_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Cleanup legacy pending orders (no Stripe session attached)
DELETE FROM public.orders WHERE status = 'pending' AND stripe_session_id IS NULL;