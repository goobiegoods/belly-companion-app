
## Goal

Fix signup so the confirmation email reliably arrives, the link works, and users can then sign in. Keep email verification ON (more secure) and send emails from your own branded domain instead of Supabase's default sender.

## Why this is happening now

- Your project requires email confirmation before sign-in.
- No custom sender domain is configured, so signups fall back to Supabase's shared default sender, which is rate-limited and often filtered to spam — that's why no email arrives.
- Because the account is never confirmed, login returns "Invalid login credentials".

## Plan

### 1. Unblock you right now (one-time cleanup)
- Delete the existing unconfirmed test account(s) in the backend so you can re-test cleanly with the same email after email sending is live.

### 2. Set up a sender domain
- Open the email domain setup dialog. You'll provide a domain you own (e.g. `yourdomain.com`) and pick a subdomain to send from (default `notify`, so emails come from `notify@yourdomain.com`).
- You'll add the NS records shown in the dialog at your domain registrar. DNS verification can take minutes to a few hours.
- While DNS is propagating, the rest of the setup can continue — emails simply start flowing once verification completes.

### 3. Scaffold branded auth email templates
- Generate the auth email templates (signup confirmation, password reset, magic link, etc.) styled to match Belly's brand (deep orange `#FF8C42`, Outfit/display fonts, white email background, 🤰 wordmark).
- Deploy the `auth-email-hook` edge function so Supabase routes auth emails through your branded templates.

### 4. Verify end-to-end
- Once DNS shows verified in Cloud → Emails:
  - Sign up with a fresh email.
  - Confirm the branded email arrives in the inbox.
  - Click the link → account confirmed → sign in works.

### 5. (Optional, recommended later) Transactional emails
- Same domain can later power order confirmations, shipping updates, and admin broadcast emails. Not part of this plan — flagged for next round.

## What I need from you to start

- A domain you own and can edit DNS for (e.g. `bellyapp.com`). If you don't have one yet, tell me and I'll suggest the simplest options.
- Confirmation that the branded sender name should be **Belly** and the from-address subdomain should be `notify` (so users see `Belly <notify@yourdomain.com>`), or tell me what to use instead.

## Out of scope for this plan

- Changing the signin flow itself (it already works once accounts are confirmed).
- Switching to a third-party provider like Resend (not needed — Lovable's built-in email handles this).
- Auto-confirm signups (rejected — you chose to keep verification on).
