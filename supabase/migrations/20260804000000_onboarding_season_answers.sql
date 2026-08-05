-- Onboarding seasons: adds profiles.season + profiles.onboarding_answers.
-- NOTE: like 20260721000000_security_hardening.sql, this is NOT auto-applied.
-- Run it manually in the Supabase SQL editor (or `supabase db push`) BEFORE
-- deploying the frontend that writes these columns — apply the pending
-- 20260721000000 migration in the same session if it hasn't run yet.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS onboarding_answers jsonb NOT NULL DEFAULT '{}'::jsonb;

-- season is nullable so legacy rows (onboarded before seasons existed) are
-- untouched; the app treats NULL season as "pregnant-era account".
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_season_allowed CHECK (
    season IS NULL OR season IN (
      'pregnant',
      'trying_to_conceive',
      'postpartum',
      'raising_little_ones',
      'general_wellness'
    )
  );

-- Same spirit as the security-hardening length caps: onboarding_answers is
-- user-writable, so bound its size.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_answers_size CHECK (
    pg_column_size(onboarding_answers) <= 8192
  );
