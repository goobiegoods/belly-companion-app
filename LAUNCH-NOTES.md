# Belly landing funnel — launch notes

Landing = `public/landing/` (generated from `belly-feed-deploy.html`). Served at
`meetbelly.com/` (via `middleware.ts`) and at `/start` on every host (previews).

Edit the design in `belly-feed-deploy.html`, then run:

    python scripts/build-landing.py

The build fails loudly if a wired-up string in the design changed.

## Flow

1. Visitor picks a path (`?t=pregnant|trying|postpartum|little`). `funnel.js` strips
   `t`/`s` from the URL **before** the Meta Pixel loads.
2. Trial / founding / bonus → email → `POST /api/funnel-checkout` → Stripe-hosted checkout.
   The server decides price + trial (`api/_lib/funnel.ts → VARIANTS`).
   - Bonus (14 days free) only with a server-signed token from `/api/funnel-bonus`
     (5 min + 2 min grace).
   - One trial per person. Active members get a sign-in link instead of a second sub.
3. `checkout.session.completed` → `api/stripe-webhook.ts → fulfillFunnel`. It finds the
   account by email (or creates it, no password), sets premium, then emails a one-tap
   sign-in link via Resend → `/auth/confirm`.
4. Sold-out products → "notify me" → `funnel_leads` (kind `waitlist`).
   Counts are in the `funnel_waitlist_counts` view.

## Environment variables (Vercel → Settings → Environment Variables → **Preview**)

Never commit these. Existing vars (`VITE_SUPABASE_*`, `VITE_POSTHOG_*`) stay as they are.

| Var | Value |
|---|---|
| `STRIPE_SECRET_KEY_PREVIEW` | `sk_test_…` — Preview only. Previews use this and **refuse any live key**; Production keeps using `STRIPE_SECRET_KEY` (untouched) |
| `STRIPE_WEBHOOK_SECRET_PREVIEW` | `whsec_…` from the **test-mode** webhook endpoint — Preview only |
| `VITE_PAYMENTS_CLIENT_TOKEN` | `pk_test_…` |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key |
| `FUNNEL_SIGNING_SECRET` | random, 48+ chars (`openssl rand -base64 48`) |
| `FUNNEL_HEALTH_KEY` | random, for `/api/funnel-health` |
| `RESEND_API_KEY` | Resend key |
| `RESEND_FROM` | `Belly <hello@meetbelly.com>` once the domain is verified (until then `Belly <onboarding@resend.dev>`, which only sends to your own Resend email) |
| `RESEND_AUDIENCE_ID` | optional — also adds waitlist emails to a Resend audience |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Meta Events Manager |
| `META_TEST_EVENT_CODE` | Events Manager → Test events (Preview only) |
| `APP_URL` | `https://app.meetbelly.com` (Production). For Preview, leave unset; it uses the preview URL |
| `LANDING_URL` | `https://meetbelly.com` (Production only) |
| `FUNNEL_LIVE_APPROVED` | **leave unset.** Live keys are refused until this is `yes` |

## One-time setup

- **Supabase:** run `supabase/migrations/20261019000000_landing_funnel.sql`. It's additive:
  2 new tables, 1 service-role-only function, 1 view.
- **Stripe (test mode):**
  - Developers → Webhooks → add endpoint `https://<preview-branch-url>/api/stripe-webhook?x-vercel-protection-bypass=<bypass secret>`
  - Events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
  - Settings → Billing → Customer portal: save once in test mode (the app's "Manage" button needs it).
  - The $89/yr test price is created automatically (lookup key `belly_founding_yearly_8900`). Live prices are never auto-created.
- **Vercel:** Settings → Deployment Protection → "Protection Bypass for Automation" → copy the secret (used in the webhook URL above).
- **Resend:** add + verify `meetbelly.com` (DNS records).
- **Check everything:** `curl -H "x-health-key: $FUNNEL_HEALTH_KEY" https://<preview>/api/funnel-health`

## Test card

`4242 4242 4242 4242`, any future date, any CVC. Test mode only.

## Open business decisions (not invented in code)

- Tea blends, Golden Elixir, remedies, kit, recipe e-book and courses are placeholders.
  All of them show **sold out / coming soon**, with no prices.
- Finale bonus = **14 days free only** (e-book dropped; e-books will be added later as store items — the recipe-book screen is "coming soon · notify me" to measure demand).
- No price-lock promise anywhere ("locked for life" removed).
- Homeopathic remedies — **confirmed**: keep "Traditionally used to support…" wording, shown as
  sold out with "notify me" (demand tracked per remedy in `funnel_waitlist_counts`).
- Legal text was updated for the funnel, Meta Pixel and auto-renewal. **Have a lawyer
  review** before live, especially for health data: WA My Health My Data and CA.
