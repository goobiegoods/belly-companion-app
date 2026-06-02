## Goal

Get a full working copy of Belly — frontend + backend data — into your new personal Lovable account (`orelfitch@gmail.com`), while leaving this current project untouched and live.

## Important: Lovable doesn't have a one-click "transfer to another account"

There is no button that moves a project (or its Cloud backend) from one Lovable account to another. The supported path is a **clone via GitHub + a fresh Lovable Cloud backend seeded with this project's data**. That's what the steps below do.

## The plan

### 1. Mirror the code into your personal account (via GitHub)

You'll do this part in the browser — I can't reach into the other account.

1. In **this** project (school account) → top right → **GitHub → Connect to GitHub** → push the repo to a GitHub repo you own personally (use a personal GitHub account, not a school-tied one).
2. Log in to Lovable as `orelfitch@gmail.com` → **New Project → Import from GitHub** → pick that repo.
3. Lovable will spin up a fresh project in your personal account with identical code.

Result: identical frontend + edge function source. No backend wired up yet.

### 2. Enable Lovable Cloud in the new project

In the new (personal) project, enable Lovable Cloud. This creates a brand-new, empty backend (new database, new auth users table, new project ref, new keys). `src/integrations/supabase/client.ts` and `.env` are regenerated automatically to point at the new backend.

### 3. Recreate the database schema in the new backend

All `supabase/migrations/*.sql` files come along with the GitHub repo. After Cloud is enabled, I (in the new project) run those migrations so the new database ends up with the same 25+ tables, RLS policies, functions (`has_role`, `has_active_subscription`, `validate_promo_code`, `handle_new_user`, etc.), and the `app_role` enum.

### 4. Copy the data from this project's backend to the new one

Once you give me access to the new project, I'll:

- Export every public-schema table from **this** project as SQL or CSV (profiles, posts, comments, orders, subscriptions, journal_entries, chat_messages, app_config, promo_codes, user_roles, etc.).
- Import them into the new project's backend.
- Re-grant your admin role in the new `user_roles` table.

Caveats you should know about:

- **Auth users (`auth.users`) cannot be exported with passwords.** Supabase intentionally blocks this. Options:
  - Recreate the small number of real accounts manually and send password-reset links, OR
  - Tell every user "we moved — please use Forgot Password once."
  - For test accounts, just recreate them.
- **Stripe stays on the same Stripe account** (it's not tied to Lovable). The new Cloud project gets the same `STRIPE_SANDBOX_API_KEY` / webhook secret added as secrets, and the webhook URL in Stripe is updated to point at the new backend's `payments-webhook` function URL.
- **Existing subscriptions** in the `subscriptions` table get copied. They keep working as long as Stripe webhooks land on the new backend.

### 5. Reconnect integrations & secrets in the new project

I'll re-add these in the new Cloud → Secrets:
- `STRIPE_SANDBOX_API_KEY`
- `PAYMENTS_SANDBOX_WEBHOOK_SECRET`
- `LOVABLE_API_KEY` (auto-provisioned)

Then update the Stripe Dashboard webhook endpoint to the new project's URL.

### 6. Custom domain (optional)

If you want `bellymama.ai` (or wherever you publish from) to point at the new project instead of this one, swap the domain over in the new project's Publish settings once it's verified working. The current project keeps running on its preview/published URL.

### 7. Verify, then decide

Smoke-test the new project: sign up, log in, journal entry, post a comment, buy a shop item, upgrade to premium. Once green, both projects are independently live — you decide later whether to keep this one as a backup or shut it down.

## What I need from you

1. **Do step 1 yourself** (GitHub push from this account + Import from GitHub on the new account) — those buttons are in the UI and only you can click them while logged into each account.
2. Once the new project exists in `orelfitch@gmail.com`, **invite me / grant access to it** the same way you'd grant access to this one.
3. Tell me whether real end-users exist who'll need the "forgot password" email, or if this is still pre-launch and we can ignore the auth-users issue.

## Out of scope

- Moving Stripe to a different Stripe account (not needed).
- Moving the GitHub repo's history into a Lovable-managed git (the GitHub import keeps it on GitHub, which is fine).
- Migrating the `bellymama.ai` email-sender domain config — that DNS is yours and can simply be re-pointed once the new project is verified.
