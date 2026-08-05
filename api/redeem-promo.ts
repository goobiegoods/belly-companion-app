export const config = { runtime: 'edge' };

import { CORS, json, requireUser, dbRpc } from './_lib/stripe.js';

// Best-effort per-isolate brute-force guard (mirrors belly-chat's approach):
// a signed-in user gets a handful of attempts per minute, then must wait.
const attempts = new Map<string, { count: number; windowStart: number }>();
const MAX_ATTEMPTS_PER_MINUTE = 8;

function tooManyAttempts(userId: string): boolean {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (!entry || now - entry.windowStart > 60_000) {
    attempts.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS_PER_MINUTE;
}

const STATUS_MESSAGES: Record<string, string> = {
  invalid: "That code isn't valid.",
  exhausted: 'This code has already been fully used.',
  already_redeemed: "You've already redeemed this code.",
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    if (tooManyAttempts(auth.id)) {
      return json({ error: 'Too many attempts — try again in a minute.' }, 429);
    }

    const body = (await req.json().catch(() => ({}))) as { code?: unknown };
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!code || code.length > 64) return json({ error: 'Enter a code.' }, 400);

    // redeem_promo_code is service_role-only in the DB; the user id passed in
    // is the JWT-verified caller, never something the client chose.
    const rows = await dbRpc<{ status: string; granted_premium: boolean }>('redeem_promo_code', {
      _user_id: auth.id,
      _code: code,
    });
    const result = rows[0];
    if (!result) return json({ error: 'Something went wrong. Try again.' }, 500);

    if (result.status !== 'ok') {
      return json({ error: STATUS_MESSAGES[result.status] ?? "That code isn't valid." }, 400);
    }

    return json({ ok: true, grantedPremium: result.granted_premium });
  } catch (e) {
    console.error('redeem-promo error:', e);
    return json({ error: 'Something went wrong. Try again.' }, 500);
  }
}
