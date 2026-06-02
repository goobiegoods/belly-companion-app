-- Notifications table (was missing from migration history but referenced by realtime + later migrations)
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'comment',
  title TEXT NOT NULL,
  body TEXT,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Trigger function to notify post owner when someone comments
CREATE OR REPLACE FUNCTION public.notify_post_owner_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner UUID;
  v_post_title TEXT;
BEGIN
  SELECT user_id, title INTO v_post_owner, v_post_title FROM public.posts WHERE id = NEW.post_id;
  IF v_post_owner IS NOT NULL AND v_post_owner <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, post_id)
    VALUES (v_post_owner, 'comment', 'New comment on your post', v_post_title, NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_notify_post_owner
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_owner_on_comment();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
