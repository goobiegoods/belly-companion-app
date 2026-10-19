export const config = { runtime: 'edge' };

import {
  cleanEmail,
  findUserIdByEmail,
  magicLinkFor,
  sendEmail,
  signInEmail,
  originAllowed,
  limited,
  clientIp,
  fjson,
} from './_lib/funnel.js';

/**
 * Passwordless sign-in for existing accounts (funnel buyers have no password).
 * Always answers { ok: true } so it can't be used to probe which emails exist.
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);
  if (limited(`ll:${clientIp(req)}`, 5)) return fjson({ error: 'Too many tries — wait a minute.' }, 429);

  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = cleanEmail(body.email);
  if (!email) return fjson({ error: 'Enter a valid email.' }, 400);
  if (limited(`lle:${email}`, 3, 10 * 60_000)) return fjson({ ok: true });

  try {
    const userId = await findUserIdByEmail(email);
    if (userId) {
      const link = await magicLinkFor(email);
      const m = signInEmail(link, { welcome: false });
      await sendEmail(email, m.subject, m.html, m.text);
    }
  } catch (e) {
    console.error('send-login-link error:', e);
  }
  return fjson({ ok: true });
}
