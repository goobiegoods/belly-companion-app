-- Custom journey moments: user-added milestones stored as a JSONB array on the profile.
-- Shape: [{ "id": "<uuid>", "title": "First kick", "date": "2026-07-19" }, ...]
-- Existing RLS policies on public.profiles (own-row select/update) cover this column.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_milestones JSONB NOT NULL DEFAULT '[]'::jsonb;
