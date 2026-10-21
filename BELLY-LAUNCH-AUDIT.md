# Belly prelaunch audit

**Date:** 2026-10-19 · **Branch audited:** `belly-landing-preview` @ `58622f1` (+ `.vercelignore` commit `cc9e1ba`)
**Scope:** landing funnel, Stripe checkout and webhook, subscription activation, Supabase, Resend sign-in emails, Vercel routing and env, analytics, mobile, legal/privacy.
**Method:** read-only. No code, config, env, DB or Stripe changes. Tests and static checks ran on a local copy of the branch.

---

## Executive summary

- **The code path works end to end on mocks.** 38/38 unit tests pass, the browser end-to-end suite passes 26/26 (iPhone-size and desktop), and the production build succeeds. Every 7- and 14-day trial promise on the page matches what the server enforces (see §3).
- **Nothing has been tested against real Stripe, Supabase or Resend yet.** Every blocker below is setup (env vars, migration, Resend domain, webhook, Vercel protection), not code. Fixing them gets you a working preview.
- **The biggest risk is legal, not technical:** sending Meta the hashed emails of people who start a trial on a pregnancy app is the pattern the FTC penalized in BetterHelp, Flo and Premom. Recommendation: **launch with the Meta Conversions API off**, either the browser pixel only or no Meta at all, until a lawyer signs off. The code already supports this: just don't set `META_CAPI_TOKEN`.
- **I introduced one regression** (C2): the new `.vercelignore` stops your local `.env` from being uploaded. That's correct for security, but past CLI deploys depended on that file for `VITE_*` values. Those must now be set in Vercel or the build breaks.

---

## 1. CRITICAL: blocks a customer from subscribing or using Belly

| # | Finding | Where | Fix |
|---|---|---|---|
| C1 | **Supabase migration not applied.** `/api/funnel-checkout` calls `find_user_id_by_email` and writes `funnel_orders`. Without them every checkout returns a 500 *after* the Stripe session is created. | `supabase/migrations/20261019000000_landing_funnel.sql`, `api/funnel-checkout.ts` | Run the SQL in the Supabase SQL editor (additive only). |
| C2 | **Build-time vars missing in Vercel.** Earlier CLI deploys uploaded your local `.env` (Vercel does *not* ignore `.env`), so Vite baked `VITE_*` values from it. With `.vercelignore` they must come from Vercel: **`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are Production-only**, so a Preview build ships a broken app and server routes can't find Supabase. **`VITE_PAYMENTS_CLIENT_TOKEN` isn't in Vercel at all**, so the in-app upgrade sheet (`src/lib/stripe.ts`) breaks on the next deploy of any kind. | `.vercelignore`, `src/integrations/supabase/client.ts`, `api/_lib/stripe.ts`, `src/lib/stripe.ts` | **Preview:** add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as Prod; they're public) and `VITE_PAYMENTS_CLIENT_TOKEN` = `pk_test_…`. **Production, before the next prod deploy:** add `VITE_PAYMENTS_CLIENT_TOKEN` = `pk_live_…`, plus `VITE_HARD_PAYWALL` if you rely on it. |
| C3 | **Preview has no usable Stripe test key.** The shared `STRIPE_SECRET_KEY` is Sensitive and almost certainly live. Previews now refuse live keys, so checkout shows "not open yet" until `STRIPE_SECRET_KEY_PREVIEW` is set. **The prompt you started tonight was cancelled; nothing was saved.** | `api/_lib/stripe.ts` (`resolveStripeSecretKey`) | `npx vercel env add STRIPE_SECRET_KEY_PREVIEW preview` → `sk_test_…` |
| C4 | **Preview webhook can't verify test events.** `STRIPE_WEBHOOK_SECRET` is shared with Production (live secret), so test-mode events fail the signature check. The user pays and gets no account or email. | `api/stripe-webhook.ts` (`resolveStripeWebhookSecret`) | Create a **test-mode** endpoint in Stripe, then add its `whsec_…` as `STRIPE_WEBHOOK_SECRET_PREVIEW` (Preview only). |
| C5 | **Vercel Deployment Protection blocks Stripe's webhook** on preview URLs (401). | Vercel → Settings → Deployment Protection | Turn on "Protection Bypass for Automation" and append `?x-vercel-protection-bypass=<secret>` to the test webhook URL. |
| C6 | **Resend isn't configured.** With no `RESEND_API_KEY`, or with the default sender `hello@meetbelly.com` on an unverified domain, the webhook gives premium but **no sign-in email goes out** (Stripe retries for up to 3 days). Buyers have no password, so **they can't get in**. | `api/_lib/funnel.ts` `sendEmail`, `api/stripe-webhook.ts` `fulfillFunnel` | Preview tonight: `RESEND_API_KEY` + `RESEND_FROM="Belly <onboarding@resend.dev>"`. That sender only delivers to your Resend account email, so test with that address. Launch: verify `meetbelly.com` in Resend (SPF/DKIM/DMARC), then set `RESEND_FROM="Belly <hello@meetbelly.com>"`. |
| C7 | **`FUNNEL_SIGNING_SECRET` not set.** The 14-day bonus can't be issued, so every bonus claim falls back to 7 days. That's safe but breaks the finale promise. | `api/_lib/funnel.ts` | Add a random 48+ char value (`openssl rand -base64 48` or any password generator) to Preview and Production. |
| C8 | **Production go-live prerequisites** (needed only when you approve launch): | | |
| | a) **Live $89/yr price.** Live mode never auto-creates prices, so checkout 500s. | `api/_lib/funnel.ts` `ensurePrice` | In Stripe **live**: Product "Belly Membership — Founding", $89.00 USD yearly, **lookup key `belly_founding_yearly_8900`**. |
| | b) **`APP_URL` unset in Production.** Magic links then point at the deployment's own vercel.app URL, which Deployment Protection may block. | `api/_lib/funnel.ts` `appUrl` | Add the `app.meetbelly.com` domain to the project and set `APP_URL=https://app.meetbelly.com` and `LANDING_URL=https://meetbelly.com`. |
| | c) **Live webhook events.** The existing live endpoint may not send everything the funnel needs. | Stripe → Webhooks (live) | Ensure `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`, `checkout.session.expired`. |
| | d) **Live switch.** Checkout is refused until you set it. | `api/_lib/funnel.ts` `checkoutAllowed` | `FUNNEL_LIVE_APPROVED=yes` (Production only), **only on your explicit go**. |
| | e) **Domain routing** for meetbelly.com. | Vercel → Domains, `middleware.ts` | Add `meetbelly.com` + `www` to the project. `/` serving the landing relies on `middleware.ts` (Vercel Routing Middleware), which can only be verified once the domain is attached. Fallback that always works: `meetbelly.com/start`. |

## 2. IMPORTANT: fix before spending on ads

| # | Finding | Where | Recommendation |
|---|---|---|---|
| I1 | **Meta Conversions API sends a hashed email when someone starts a trial or joins a waitlist** on a pregnancy app. The FTC treats "this person uses a pregnancy/fertility/therapy app" plus identifiers sent to an ad platform as an unauthorized health-data disclosure (BetterHelp, Flo, Premom; Health Breach Notification Rule). We never send stage or product, but the trial event on its own is the risk. | `api/_lib/funnel.ts` `metaCapi`, `api/stripe-webhook.ts`, `api/funnel-waitlist.ts` | **Launch with `META_CAPI_TOKEN` unset.** Keep the browser pixel (PageView / InitiateCheckout / StartTrial without email) or none, until a lawyer approves. Alternative: an explicit opt-in checkbox before sending identifiers. Also check Meta Events Manager for health-category event restrictions. |
| I2 | **No sign-up confirmation with auto-renew terms.** California's Automatic Renewal Law requires a confirmation (acknowledgment) that includes the renewal terms, cancellation policy and how to cancel. The welcome email has only the sign-in link. | `api/_lib/funnel.ts` `signInEmail` | Add 3 lines to the welcome email: "Free until {date}, then $89/year, renews yearly until you cancel. Cancel anytime: Me → Manage, or hello@meetbelly.com." Small copy change. |
| I3 | **The cancellation promise must match the Stripe portal.** The Terms say "keep access until the end of the paid period". If the portal cancels immediately, that's false. Also, if the portal isn't saved in a given mode, "Manage" errors. | `Belly-Auto-Renewal-Terms.md`, `api/stripe-portal.ts` | Stripe → Settings → Billing → Customer portal (**test and live**): enable "Cancel subscriptions" → **At end of billing period**, and allow updating the payment method. |
| I4 | **Two prices for one product.** The funnel sells $89/yr; the in-app paywall still uses live prices of $99/yr and $14.99/mo. | `api/stripe-checkout.ts` (`PRICE_IDS`) | Decide whether existing app users see $89 or $99. If $89, point `yearly` at the new live price. |
| I5 | **The landing course shelf doesn't match the real courses.** The landing shows "Prep for birth · 12", "Homeopathy, honestly · 8", "Rest & your nervous system · 6", "Feeding & recovery · 9". The app's courses have different names and lesson counts. That's a promise inside a paid offer. | `belly-feed-deploy.html` (`T.crs`), `src/data/coursesData.ts` | Use real course names and counts, or "Short lessons for every stage" without numbers. |
| I6 | **Washington My Health My Data / health-data consent.** The landing collects pregnancy stage (first-party) without a consent step. | `public/landing/funnel.js`, Privacy Policy | Lawyer review. The Privacy Policy is updated, but WA requires a separate consumer health data policy and consent to collect. |
| I7 | **Existing app trial vs funnel trial.** One trial per person is enforced only by email in our database. A different email gets another trial. | `api/funnel-checkout.ts` | Acceptable for launch. Later: Stripe Radar rule or card-fingerprint check. |
| I8 | **Signed-in device edge case.** If someone already logged in (for example your test account) opens a new buyer's magic link, `/auth/confirm` redirects to the *current* account. | `src/pages/AuthConfirm.tsx` | Test in a private window. Later fix: sign out before `verifyOtp` when the emails differ. |
| I9 | **Local pulled env file.** `.env.preview.local` (pulled tonight) is on disk. Git and Vercel ignore it. | project root | `Remove-Item .env.preview.local` |

## 3. Trial promises vs server billing ✅ consistent

| Promise on page | Server behavior (`api/funnel-checkout.ts`, `VARIANTS.a`) |
|---|---|
| "7 days free, then $89 a year" (offer card, all "7 days free" CTAs, `trial`/`year` offers) | `trial_period_days: 7`, $89/yr price resolved by the server (the client can't send a price) |
| "14 days free" (finale, after scratch) | 14 days **only** with a valid server-signed bonus token (5 min + 2 min grace). Expired or forged token → 409 → sheet switches to the 7-day offer and says so |
| "$0.00 today", "cancel anytime before your trial ends and you won't be charged" | Card collected (`payment_method_collection: 'always'`), $0 invoice, first charge at trial end. The Stripe page repeats the terms (`custom_text`) |
| Already had a trial | 409 `trial_used` → "Continue · $89 today" (no trial). Active member → sign-in link, no second subscription |
| e-book / "locked for life" | Removed everywhere (verified by grep and a build-time guard) |

## 4. Security and accidental-live-key review ✅

- **Previews can't charge real money.** `resolveStripeSecretKey` throws on any live key unless `VERCEL_ENV=production`. Funnel checkout also requires `FUNNEL_LIVE_APPROVED=yes` in production. Both are covered by tests.
- **No secret reaches the browser.** `/api/funnel-config` exposes only the pixel ID and PostHog public key. The service-role key is used only server-side. The new tables use row-level security (admin read only). `find_user_id_by_email` is callable only with the service-role key.
- **The webhook is protected.** It verifies the signature on the raw body, and every step is idempotent, so retries resume safely.
- **`/api/funnel-health`** returns 404 without the `x-health-key` header.
- **OPTIONAL hardening:**
  - Rate limits are per server instance only. Add a Vercel Firewall rate-limit rule on `/api/funnel-*` and `/api/send-login-link`.
  - `funnel_orders` keeps IP and user agent with no retention limit. Purge after 90 days.

## 5. Mobile / UX

- The end-to-end suite passes at 390×844 (touch) and 1280×800. The sheet stays above the finale fireworks.
- **Test on a real iPhone:** the keyboard opening over the bottom sheet (email field → "Continue" button) can't be emulated.
- The app bundle is a single **1.9 MB** JS file (existing). The first open after a magic link is slow on cellular. OPTIONAL: code-split routes.

## 6. Ten highest-impact conversion improvements (quick wins first)

1. **Turn on Apple Pay / Google Pay / Link** in Stripe → Payment methods. No code; the biggest mobile win on hosted checkout.
2. **Turn on Stripe trial-ending reminder emails** (Billing → Subscriptions and emails), then add "We'll remind you before you're charged" next to the CTA. This lowers sign-up anxiety. Copy change only.
3. **Show the actual charge date in the sheet:** "$0 today · $89 on Oct 26". About a 5-line change in `feed.js`.
4. **Say "Card required · $0 today" in the sheet** so Stripe's card form isn't a surprise. One-line copy change.
5. **Send ad traffic to deep links** (`/?t=pregnant&s=bella`, `&s=scan`, etc.) per ad set, so each ad lands on the matching screen. Already supported.
6. **A/B the offer with `?v=`**: for example 7-day vs 14-day trial, or yearly vs a monthly option. Infrastructure is ready: add an entry in `VARIANTS`.
7. **Abandoned-checkout recovery:** `checkout_start` emails are stored. Send one plain reminder 1 hour later (Resend) to people who didn't finish. Needs a small cron/route and a consent line.
8. **Add Open Graph tags** (title, description, image) to the landing page so shared or organic links render a card. Currently none.
9. **Welcome page → app:** point "Open Belly" at `APP_URL` and add "Add Belly to your Home Screen" steps. Improves day-1 activation and retention.
10. **Real social proof** once you have it (the community screen is correctly labeled "sample posts"). Never fabricate reviews or counts.

## 7. Checks run (read-only, local copy)

| Check | Result |
|---|---|
| `vitest run` | **38/38 pass** (6 files, includes funnel bonus token, live-key and pricing tests) |
| Browser end-to-end (Playwright, mocked APIs) | **26/26 pass**: URL stripping before pixel, GPC blocks pixel, sold-out → waitlist, checkout payload has no price, bonus token, trial_used / already_member flows, welcome StartTrial dedupe |
| `tsc` strict on `api/` + `middleware.ts` | 0 errors |
| `tsc` app | 2 errors, both **pre-existing** (`api/belly-chat.ts` replaceAll lib target; `AdminDashboard.tsx` `is_test_account` type). Not build-blocking |
| `eslint .` | 95 errors / 30 warnings, almost all pre-existing. 1 in new code (`api/_lib/funnel.ts:126` useless escape, cosmetic) |
| `vite build` | ✓ succeeds |
| Not possible here | Real Stripe, Supabase, Resend, Meta or Vercel calls (no network access from this workspace by design) |

---

## 8. Launch checklist (in order)

### A. Preview, end to end (test mode, no production changes)
1. **Supabase → SQL editor:** run `supabase/migrations/20261019000000_landing_funnel.sql` (C1).
2. **Vercel env, Preview only:**
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PAYMENTS_CLIENT_TOKEN` (`pk_test_…`) (C2)
   - `STRIPE_SECRET_KEY_PREVIEW` (`sk_test_…`) (C3)
   - `FUNNEL_SIGNING_SECRET`, `FUNNEL_HEALTH_KEY` (random) (C7)
   - `RESEND_API_KEY`, `RESEND_FROM="Belly <onboarding@resend.dev>"` (C6)
   - Skip Meta for now (I1).
3. **Vercel → Deployment Protection:** turn on Protection Bypass for Automation and copy the secret (C5).
4. **Deploy preview:** `npx vercel deploy` (no `--prod`). Note the URL.
5. **Stripe test mode → Webhooks:** add endpoint `https://<preview-url>/api/stripe-webhook?x-vercel-protection-bypass=<secret>` with the 7 events from C8c. Copy the signing secret → `STRIPE_WEBHOOK_SECRET_PREVIEW` (Preview). **Redeploy the preview** (`npx vercel deploy`).
6. **Stripe test mode → Customer portal:** enable cancel at end of billing period, then save (I3).
7. **Health check:** `curl -H "x-health-key: <key>" https://<preview-url>/api/funnel-health`. Every block should say `ok: true` except Meta.
8. **Test purchase:**
   - Open `https://<preview-url>/start?t=pregnant` in a **private window**, slide a 7-day CTA, and use your Resend account email.
   - Pay with `4242 4242 4242 4242` → welcome page → email arrives → **Open Belly** → onboarding → premium.
   - Repeat with the finale bonus and confirm **14 days** in Stripe.
9. **Verify:**
   - In Stripe (test), the subscription is `trialing` with trial end at +7 or +14 days.
   - In Supabase, the `funnel_orders` row has `status='fulfilled'`, plus a `subscriptions` row, and `profiles.is_premium=true`.
   - Cancel via **Me → Manage** and confirm the portal schedules cancel at period end.
10. **Clean up:** `Remove-Item .env.preview.local` (I9).

### B. Production (only after your explicit approval)
11. Make the decisions on I1 (Meta), I4 (app price), I5 (course copy), and I2 (confirmation email copy, a small code change).
12. Stripe **live**:
    - Create the $89/yr price with lookup key `belly_founding_yearly_8900` (C8a).
    - Add events to the live webhook (C8c).
    - Configure the portal (I3).
    - Enable wallets and trial reminders (§6 items 1–2).
13. Resend: verify `meetbelly.com` and set `RESEND_FROM="Belly <hello@meetbelly.com>"` in Production.
14. Vercel **Production** env:
    - `VITE_PAYMENTS_CLIENT_TOKEN` (`pk_live_…`)
    - `FUNNEL_SIGNING_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`
    - `APP_URL=https://app.meetbelly.com`, `LANDING_URL=https://meetbelly.com`
    - Leave `FUNNEL_LIVE_APPROVED` **unset** for now.
15. Vercel → Domains: add `meetbelly.com`, `www.meetbelly.com` and `app.meetbelly.com`, and update DNS.
16. Merge `belly-landing-preview` → `main`, then `npx vercel deploy --prod`. Checkout still shows "opens soon" (live switch off), so you can smoke-test `meetbelly.com` and `/start` safely.
17. **Go live:** set `FUNNEL_LIVE_APPROVED=yes` (Production) and redeploy. Do one real $0-trial signup with your own card, then cancel it from the portal.
