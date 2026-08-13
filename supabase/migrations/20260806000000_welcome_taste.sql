-- One-free-taste tracking: profiles.welcome_completed_at records when the
-- /welcome Bella exchange finished, so the HARD_PAYWALL gate can't be dodged
-- by clearing localStorage.
-- NOTE: like 20260721000000_security_hardening.sql, this is NOT auto-applied.
-- Run it manually in the Supabase SQL editor (or `supabase db push`) BEFORE
-- flipping VITE_HARD_PAYWALL on. While the flag is off the app tolerates the
-- column being absent — the client write fails quietly and localStorage
-- covers the welcome-done state, exactly as before.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_completed_at timestamptz;

-- Deliberately NOT added to protect_profile_admin_fields(): the user's own
-- client writes it when their welcome exchange completes. Worst case a
-- hostile client refuses to set it and can replay /welcome — each replay is
-- one Bella exchange, already capped by the server-side chat quota.
