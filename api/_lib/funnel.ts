/**
 * Landing-page funnel (meetbelly.com) — shared server helpers.
 *
 * SECURITY CONTRACT
 *  - The browser only ever sends: a variant code, an offer name, an email,
 *    and an opaque bonus token. Price, trial length and e-book eligibility
 *    are decided HERE from server config + a server-signed token.
 *  - Live mode is refused unless FUNNEL_LIVE_APPROVED=yes is set by a human.
 *  - Nothing health-related (pregnancy stage, product interest) is ever sent
 *    to Meta. Stage stays first-party (Supabase / PostHog).
 */
import type Stripe from 'stripe';
import { getStripe, dbRpc, dbSelect, isProductionDeploy } from './stripe.js';

// ---------------------------------------------------------------- variants
// One entry per funnel variant (?v=a, ?v=b …). To A/B a new price or trial,
// add an entry; the landing link just carries the code.
export interface FunnelVariant {
  code: string;
  label: string;
  /** Stripe Price lookup_key. In TEST mode it is auto-created if missing. */
  lookupKey: string;
  unitAmount: number; // cents — used to create (test) and to verify (live)
  interval: 'year' | 'month';
  trialDays: number;
  bonusTrialDays: number;
  bonusEbook: boolean;
  productName: string;
}

export const VARIANTS: Record<string, FunnelVariant> = {
  a: {
    code: 'a',
    label: 'founding-89-yearly',
    lookupKey: 'belly_founding_yearly_8900',
    unitAmount: 8900,
    interval: 'year',
    trialDays: 7,
    bonusTrialDays: 14,
    bonusEbook: false, // e-books will be sold as store items later
    productName: 'Belly Membership — Founding',
  },
};
export const DEFAULT_VARIANT = 'a';

export function variantFor(code: unknown): FunnelVariant {
  const c = typeof code === 'string' ? code.toLowerCase().trim() : '';
  return VARIANTS[c] ?? VARIANTS[DEFAULT_VARIANT];
}

// Landing path (?t=) → profiles.season. First-party only.
export const STAGE_TO_SEASON: Record<string, string> = {
  pregnant: 'pregnant',
  trying: 'trying_to_conceive',
  postpartum: 'postpartum',
  little: 'raising_little_ones',
};
export const cleanStage = (s: unknown): string | null =>
  typeof s === 'string' && STAGE_TO_SEASON[s] ? s : null;

// ---------------------------------------------------------------- responses
export const fjson = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Same-site only: browsers always send Origin on cross-site POSTs. */
export function originAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin navigations / server-to-server
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set(
    [
      'meetbelly.com',
      'www.meetbelly.com',
      'app.meetbelly.com',
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      ...(process.env.FUNNEL_EXTRA_ORIGINS || '').split(','),
    ]
      .map((h) => (h || '').trim().replace(/^https?:\/\//, ''))
      .filter(Boolean),
  );
  if (allowed.has(host)) return true;
  // Local dev
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

// ---------------------------------------------------------------- rate limit
// Best-effort per-isolate limiter (same approach as redeem-promo/belly-chat).
const buckets = new Map<string, { n: number; t: number }>();
export function limited(key: string, max: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    if (buckets.size > 5000) buckets.clear();
    return false;
  }
  b.n += 1;
  return b.n > max;
}

export const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
  req.headers.get('x-real-ip') ||
  '';

// ---------------------------------------------------------------- validation
export function cleanEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const e = v.trim().toLowerCase();
  if (e.length < 5 || e.length > 254) return null;
  // Pragmatic check; Stripe/Supabase do the strict validation.
  if (!/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(e)) return null;
  return e;
}
export const cleanToken = (v: unknown, max = 64): string | null =>
  typeof v === 'string' && /^[A-Za-z0-9._\-]{1,}$/.test(v) && v.length <= max ? v : null;
export const cleanKey = (v: unknown): string | null =>
  typeof v === 'string' && /^[a-z0-9_-]{1,48}$/.test(v) ? v : null;

// ---------------------------------------------------------------- stripe mode
export function stripeMode(): 'test' | 'live' | 'missing' {
  const k = (!isProductionDeploy() && process.env.STRIPE_SECRET_KEY_PREVIEW) || process.env.STRIPE_SECRET_KEY || '';
  if (!k) return 'missing';
  return /^(sk|rk)_live_/.test(k) ? 'live' : 'test';
}
/** Hard stop: live charges need an explicit human switch. */
export function checkoutAllowed(): { ok: true } | { ok: false; reason: string } {
  const m = stripeMode();
  if (m === 'missing') return { ok: false, reason: 'Checkout is not configured yet.' };
  if (m === 'live' && !isProductionDeploy()) return { ok: false, reason: 'Checkout is not open yet.' };
  if (m === 'live' && process.env.FUNNEL_LIVE_APPROVED !== 'yes') {
    return { ok: false, reason: 'Checkout is not open yet.' };
  }
  return { ok: true };
}

/**
 * Resolve the Stripe Price for a variant. TEST mode: find by lookup_key or
 * create it. LIVE mode: must already exist (created by a human) and must
 * match the configured amount/interval exactly — otherwise refuse.
 */
const priceCache = new Map<string, string>();
export async function ensurePrice(v: FunnelVariant): Promise<string> {
  const cached = priceCache.get(v.lookupKey);
  if (cached) return cached;
  const stripe = getStripe();
  const found = await stripe.prices.list({ lookup_keys: [v.lookupKey], active: true, limit: 1 });
  let price: Stripe.Price | undefined = found.data[0];
  if (!price) {
    if (stripeMode() !== 'test') throw new Error(`Live price ${v.lookupKey} missing — create it in Stripe first.`);
    const product = await stripe.products.create({
      name: v.productName,
      metadata: { source: 'funnel', variant: v.code },
    });
    price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: v.unitAmount,
      recurring: { interval: v.interval },
      lookup_key: v.lookupKey,
      metadata: { source: 'funnel', variant: v.code },
    });
  }
  if (price.unit_amount !== v.unitAmount || price.recurring?.interval !== v.interval || price.currency !== 'usd') {
    throw new Error(`Price ${price.id} does not match variant ${v.code} config`);
  }
  priceCache.set(v.lookupKey, price.id);
  return price.id;
}

// ---------------------------------------------------------------- bonus token
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (s: string) => {
  const p = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(p + '==='.slice((p.length + 3) % 4)), (c) => c.charCodeAt(0));
};
async function hmacKey() {
  const secret = process.env.FUNNEL_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error('FUNNEL_SIGNING_SECRET missing or too short');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** The finale bonus lasts 5 minutes, plus a short grace for checkout to load. */
export const BONUS_WINDOW_MS = 5 * 60 * 1000;
export const BONUS_GRACE_MS = 2 * 60 * 1000;

export async function signBonus(now = Date.now()): Promise<{ token: string; exp: number }> {
  const exp = now + BONUS_WINDOW_MS;
  const payload = b64url(enc.encode(JSON.stringify({ k: 'bonus', iat: now, exp, n: crypto.randomUUID() })));
  const sig = b64url(await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(payload)));
  return { token: `${payload}.${sig}`, exp };
}

export async function verifyBonus(token: unknown, now = Date.now()): Promise<boolean> {
  if (typeof token !== 'string' || token.length > 400) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(), fromB64url(sig), enc.encode(payload));
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { k?: string; exp?: number };
    return data.k === 'bonus' && typeof data.exp === 'number' && now <= data.exp + BONUS_GRACE_MS;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- supabase auth admin
function sbUrl() {
  const u = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!u) throw new Error('SUPABASE_URL is not configured');
  return u;
}
function sbAdminHeaders() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return { apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' };
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const rows = await dbRpc<{ user_id: string }>('find_user_id_by_email', { _email: email });
  return rows[0]?.user_id ?? null;
}

/** Find the existing account, or create one (no password — magic link only). */
export async function findOrCreateUser(
  email: string,
  meta: Record<string, unknown>,
): Promise<{ userId: string; created: boolean }> {
  const existing = await findUserIdByEmail(email);
  if (existing) return { userId: existing, created: false };
  const resp = await fetch(`${sbUrl()}/auth/v1/admin/users`, {
    method: 'POST',
    headers: sbAdminHeaders(),
    body: JSON.stringify({ email, email_confirm: true, user_metadata: meta }),
  });
  if (resp.ok) {
    const u = (await resp.json()) as { id?: string };
    if (u.id) return { userId: u.id, created: true };
  }
  // Raced with another delivery / signup — re-read instead of duplicating.
  const again = await findUserIdByEmail(email);
  if (again) return { userId: again, created: false };
  throw new Error(`create user failed: ${resp.status} ${(await resp.text().catch(() => '')).slice(0, 200)}`);
}

/** Returns a one-time token hash; the app's /auth/confirm page redeems it. */
export async function magicLinkFor(email: string): Promise<string> {
  const resp = await fetch(`${sbUrl()}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: sbAdminHeaders(),
    body: JSON.stringify({ type: 'magiclink', email }),
  });
  if (!resp.ok) throw new Error(`generate_link failed: ${resp.status}`);
  const j = (await resp.json()) as { hashed_token?: string; properties?: { hashed_token?: string } };
  const th = j.hashed_token ?? j.properties?.hashed_token;
  if (!th) throw new Error('generate_link returned no token');
  return `${appUrl()}/auth/confirm?token_hash=${encodeURIComponent(th)}&type=magiclink`;
}

export function appUrl(): string {
  const u = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  return u.replace(/\/+$/, '') || 'https://app.meetbelly.com';
}
export function landingUrl(req: Request): string {
  const u = process.env.LANDING_URL;
  if (u) return u.replace(/\/+$/, '');
  const o = req.headers.get('origin');
  if (o && originAllowed(req)) return o;
  return appUrl();
}

// ---------------------------------------------------------------- email (Resend)
export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  const from = process.env.RESEND_FROM || 'Belly <hello@meetbelly.com>';
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, text, reply_to: process.env.RESEND_REPLY_TO || undefined }),
  });
  if (!resp.ok) throw new Error(`resend failed: ${resp.status} ${(await resp.text().catch(() => '')).slice(0, 200)}`);
  const j = (await resp.json().catch(() => ({}))) as { id?: string };
  return j.id || '';
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function signInEmail(link: string, opts: { welcome: boolean; trialDays?: number }) {
  const head = opts.welcome ? "You're in. Welcome to Belly." : 'Your Belly sign-in link';
  const lead = opts.welcome
    ? `Your ${opts.trialDays ?? 7}-day free trial has started. Tap below to open Belly — no password needed.`
    : 'Tap below to sign in to Belly. No password needed.';
  const html = `<!doctype html><html><body style="margin:0;background:#150A1F;padding:32px 16px;font-family:Inter,Helvetica,Arial,sans-serif;color:#FBEEE0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:440px;background:#221022;border-radius:22px;padding:28px 24px">
<tr><td style="font-family:Georgia,serif;font-size:30px;color:#F2B647;padding-bottom:6px">belly</td></tr>
<tr><td style="font-size:20px;font-weight:600;padding:8px 0">${esc(head)}</td></tr>
<tr><td style="font-size:15px;line-height:1.55;color:rgba(251,238,224,.8);padding-bottom:22px">${esc(lead)}</td></tr>
<tr><td><a href="${esc(link)}" style="display:block;text-align:center;background:#FBEEE0;color:#150A1F;text-decoration:none;font-weight:600;font-size:16px;padding:16px;border-radius:14px">Open Belly</a></td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:rgba(251,238,224,.55);padding-top:20px">This link works once and expires soon. Need a new one? Go to ${esc(appUrl())}/auth and choose “Email me a sign-in link”. Didn't request this? You can ignore it.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${head}\n\n${lead}\n\nOpen Belly: ${link}\n\nThis link works once and expires soon. Need a new one? ${appUrl()}/auth`;
  return { subject: opts.welcome ? "You're in — open Belly" : 'Your Belly sign-in link', html, text };
}

// ---------------------------------------------------------------- PostHog (first-party analytics)
export async function phCapture(event: string, distinctId: string, props: Record<string, unknown> = {}) {
  const key = process.env.POSTHOG_KEY || process.env.VITE_POSTHOG_KEY;
  if (!key || !distinctId) return;
  const host = (process.env.POSTHOG_HOST || process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');
  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, event, distinct_id: distinctId, properties: { $lib: 'belly-funnel-server', ...props } }),
    });
  } catch (e) {
    console.error('posthog capture failed', e);
  }
}

// ---------------------------------------------------------------- Meta Conversions API (ads)
// ALLOW-LIST ONLY. Never add stage, product, or any health-adjacent field.
export interface CapiInput {
  eventName: 'Lead' | 'InitiateCheckout' | 'StartTrial' | 'Purchase';
  eventId: string;
  email?: string | null;
  ip?: string | null;
  ua?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  value?: number;
  currency?: 'USD';
}
async function sha256(s: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s.trim().toLowerCase())))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function metaCapi(ev: CapiInput): Promise<boolean> {
  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return false;
  const user_data: Record<string, unknown> = {};
  if (ev.email) user_data.em = [await sha256(ev.email)];
  if (ev.ip) user_data.client_ip_address = ev.ip;
  if (ev.ua) user_data.client_user_agent = ev.ua;
  if (ev.fbp) user_data.fbp = ev.fbp;
  if (ev.fbc) user_data.fbc = ev.fbc;
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: ev.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: 'website',
        // Bare origin only — landing URLs can carry ?t=<stage>.
        event_source_url: 'https://meetbelly.com/',
        user_data,
        ...(ev.value !== undefined ? { custom_data: { value: ev.value, currency: ev.currency || 'USD' } } : {}),
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  const v = process.env.META_GRAPH_VERSION || 'v21.0';
  try {
    const r = await fetch(`https://graph.facebook.com/${v}/${encodeURIComponent(pixel)}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) console.error('meta capi', r.status, (await r.text().catch(() => '')).slice(0, 200));
    return r.ok;
  } catch (e) {
    console.error('meta capi failed', e);
    return false;
  }
}

/** Has this person ever had a Belly subscription (any status) in this Stripe mode? */
export async function subscriptionHistory(userId: string, livemode: boolean) {
  const env = livemode ? 'production' : 'sandbox';
  const rows = await dbSelect<{ status: string; stripe_customer_id: string }>(
    `subscriptions?select=status,stripe_customer_id&user_id=eq.${userId}&environment=eq.${env}&order=updated_at.desc`,
  );
  const active = rows.some((r) => ['active', 'trialing', 'past_due'].includes(r.status));
  return { any: rows.length > 0, active, customerId: rows[0]?.stripe_customer_id || null };
}
