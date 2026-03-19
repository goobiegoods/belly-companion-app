

# BELLY App — 7 Fixes in One Pass

## Fix 1: Community Post Submission + Reply Bar
- Restyle create post bottom sheet: ensure "Post to community 🌸" button is full-width and always visible below category pills. Remove the side-by-side Cancel/Post layout, replace with single full-width submit button.
- Post detail reply bar: restyle to rounded pill input (border-radius 22px), circular send button (36x36, border-radius 50%), styled comments with avatar circles and dividers.

**Files:** `src/pages/Community.tsx`

## Fix 2: Community Notifications
- Create `notifications` table (id, user_id, type, title, body, post_id, is_read, created_at) with RLS policies.
- Create database trigger function: on INSERT into `comments`, insert a notification for the post owner (type: reply_to_post).
- Add bell icon in Community header with red unread dot.
- Bottom sheet showing notification list with read/unread states.
- Add unread dot badge on Community tab in BottomNav (pass unread count via context or direct query).

**Files:** `src/pages/Community.tsx`, `src/components/BottomNav.tsx`, migration SQL

## Fix 3: Lessons — Reflection Save Button + Real Content
- Add explicit "Save my reflection 💭" button below every reflection textarea (disabled when empty, shows "Saved 🌸" confirmation).
- Replace generic `getLessonContent` fallback with real, specific, pregnancy-accurate content for ALL 12 courses (c2–c12). Each course's lessons will have specific section headings, real facts, accurate quizzes, and personal reflection prompts.

**Files:** `src/pages/Courses.tsx`, `src/data/lessonContent.ts`

## Fix 4: Chat Photo Upload
- Add camera icon button left of text input in AskDoula.
- Action sheet: "Take a photo" / "Choose from library" using file input with capture attribute.
- Thumbnail preview above input bar with X to remove.
- Send image as base64 in multimodal message format to edge function.
- Update edge function to pass through image content in the messages array.
- Update system prompt with product safety assessment instructions.
- Add user bubble image rendering.
- Add 5th quick prompt "Is this product safe? 📷" that triggers photo picker.

**Files:** `src/pages/AskDoula.tsx`, `supabase/functions/belly-chat/index.ts`

## Fix 5: Baby Size SVG Illustrations
- Create `src/components/BabySizeIllustration.tsx` with inline SVG components for all 40 weeks (simple flat illustrations in peach tones, stroke #D4906A, fill #FFF0E8/#FFCDB4).
- Integrate into BabyTracker hero card (80x80) and week detail card (60x60).

**Files:** `src/components/BabySizeIllustration.tsx`, `src/pages/BabyTracker.tsx`

## Fix 6: Homepage Refinements
- Fix greeting to show first_name only with title case (already uses `profile?.first_name`).
- Replace header icon SVG with belly/womb silhouette.
- Add BabySizeIllustration to hero card (72x72, right side, opacity 0.85).
- Fix description truncation: show full first sentence instead of slice+ellipsis.
- Differentiate "This week" cards with pastel backgrounds: peach, sage green, blush pink.
- Fix subtitle text size to 13px with line-height 1.55.

**Files:** `src/pages/HomePage.tsx`

## Fix 7: Global Accent Colors
- Add CSS variables for sage green (#C8E6C0/#2D5A27) and blush pink (#FFD4E0/#8B2252).
- Update completed lesson checkmarks to use sage green circle.
- Kick counter button: bg #FFD4E0, color #8B2252.
- Success toasts: configure sonner with sage green theme.
- Week milestone area on Baby tab: soft pink tint.

**Files:** `src/index.css`, `src/pages/Courses.tsx`, `src/pages/BabyTracker.tsx`

## Database Migration
```sql
-- notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  post_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Trigger function for comment notifications
CREATE OR REPLACE FUNCTION public.notify_post_owner_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  post_owner_id uuid;
  commenter_name text;
  comment_preview text;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN RETURN NEW; END IF;
  SELECT COALESCE(first_name, 'Someone') INTO commenter_name FROM public.profiles WHERE user_id = NEW.user_id;
  comment_preview := LEFT(NEW.body, 60) || CASE WHEN LENGTH(NEW.body) > 60 THEN '...' ELSE '' END;
  INSERT INTO public.notifications (user_id, type, title, body, post_id)
  VALUES (post_owner_id, 'reply_to_post', commenter_name || ' replied to your post', comment_preview, NEW.post_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_notify
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_post_owner_on_comment();
```

## Priority Order
1. Fix 1 (community submit) — most broken
2. Fix 4 (photo upload) — most requested
3. Fix 3 (lesson content) — most value
4. Fix 2 (notifications) — engagement
5. Fix 5 (baby illustrations) — premium feel
6. Fix 6 (homepage) — polish
7. Fix 7 (accent colors) — polish

