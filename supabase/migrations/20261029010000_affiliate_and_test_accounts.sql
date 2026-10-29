-- 1) Amazon affiliate links for remedies (admin → Products → Amazon link).
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS affiliate_url text;

-- 2) Softer remedy wording (matches src/data/shopData.ts).
UPDATE public.products SET use_case = 'Emotional sensitivity, sinus congestion'
  WHERE category = 'remedy' AND name ILIKE 'Pulsatilla%';
UPDATE public.products SET use_case = 'Late-pregnancy birth preparation (ask your midwife first)'
  WHERE category = 'remedy' AND name ILIKE 'Caulophyllum%';

-- 3) Every account made before launch (Oct 29, 2026) is family/QA testing:
--    flag them so the admin cockpit counts real customers only.
--    The profile guard trigger only lets the service role change this flag.
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
UPDATE public.profiles SET is_test_account = true
  WHERE created_at < '2026-10-29 11:00:00+00' AND is_test_account = false;

SELECT count(*) FILTER (WHERE is_test_account) AS test_accounts,
       count(*) FILTER (WHERE NOT is_test_account) AS real_accounts
FROM public.profiles;
