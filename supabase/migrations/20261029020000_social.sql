-- Social posting queue + daily insights for Belly's Facebook Page and Instagram.
-- Admin-only (has_role admin, which requires a two-factor session).

CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caption text NOT NULL DEFAULT '',
  media_url text,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'reel', 'text')),
  platforms text[] NOT NULL DEFAULT '{facebook,instagram}',
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'published', 'failed')),
  fb_post_id text,
  ig_container_id text,
  ig_media_id text,
  error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
CREATE INDEX IF NOT EXISTS social_posts_due_idx ON public.social_posts (status, scheduled_at);
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage social posts" ON public.social_posts;
CREATE POLICY "Admins manage social posts" ON public.social_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.social_metrics (
  day date NOT NULL,
  source text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  PRIMARY KEY (day, source, metric)
);
ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read social metrics" ON public.social_metrics;
CREATE POLICY "Admins read social metrics" ON public.social_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Public bucket for post media (Meta fetches images/videos from a public URL).
INSERT INTO storage.buckets (id, name, public) VALUES ('social', 'social', true)
  ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Admins upload social media" ON storage.objects;
CREATE POLICY "Admins upload social media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete social media" ON storage.objects;
CREATE POLICY "Admins delete social media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'social' AND public.has_role(auth.uid(), 'admin'));
