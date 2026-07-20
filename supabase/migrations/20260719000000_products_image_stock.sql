-- ============================================================
-- Products: image + stock support
-- Adds an optional product image URL and an in-stock flag.
-- Existing RLS policies on public.products already cover these
-- columns (anyone reads, admins manage via has_role).
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT true;
