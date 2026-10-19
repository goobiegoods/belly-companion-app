export const config = { runtime: 'edge' };

import { signBonus, originAllowed, limited, clientIp, fjson, cleanToken, phCapture } from './_lib/funnel.js';

/**
 * Starts the finale's 5-minute bonus window. The signed token is the ONLY
 * thing that makes /api/funnel-checkout grant 14 days + the e-book, and it
 * expires server-side regardless of what the browser timer says.
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);
  if (limited(`bonus:${clientIp(req)}`, 6)) return fjson({ error: 'Too many tries' }, 429);
  try {
    const body = (await req.json().catch(() => ({}))) as { anonId?: unknown };
    const { token, exp } = await signBonus();
    const anon = cleanToken(body.anonId, 64);
    if (anon) await phCapture('funnel_bonus_started', anon, { $process_person_profile: false });
    return fjson({ token, exp });
  } catch (e) {
    console.error('funnel-bonus error:', e);
    return fjson({ error: 'Unavailable' }, 500);
  }
}
