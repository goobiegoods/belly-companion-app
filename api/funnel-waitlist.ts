export const config = { runtime: 'edge' };

import { dbUpsert } from './_lib/stripe.js';
import {
  cleanEmail,
  cleanKey,
  cleanStage,
  cleanToken,
  variantFor,
  originAllowed,
  limited,
  clientIp,
  fjson,
  phCapture,
  metaCapi,
} from './_lib/funnel.js';

/**
 * "Sold out · notify me" — demand test for products that aren't for sale yet.
 * Stores email + product interest first-party. Meta only ever gets a generic
 * Lead (no product, no stage).
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);
  const ip = clientIp(req);
  if (limited(`wl:${ip}`, 12)) return fjson({ error: 'Too many tries — wait a minute.' }, 429);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = cleanEmail(body.email);
  if (!email) return fjson({ error: 'Enter a valid email.' }, 400);
  const keys = (Array.isArray(body.products) ? body.products : [body.product]).map(cleanKey).filter(Boolean) as string[];
  if (!keys.length || keys.length > 3) return fjson({ error: 'Invalid product' }, 400);

  const variant = variantFor(body.variant).code;
  const stage = cleanStage(body.stage);
  const anonId = cleanToken(body.anonId, 64);
  const gpc = body.gpc === true;

  try {
    for (const product_key of keys) {
      await dbUpsert('funnel_leads', { email, kind: 'waitlist', product_key, variant, stage, anon_id: anonId }, 'email,kind,product_key');
      if (anonId) await phCapture('waitlist_joined', anonId, { product: product_key, variant, path: stage, $process_person_profile: false });
    }
    await addToAudience(email);
    if (!gpc) {
      const eventId = cleanToken(body.eventId, 64) || `lead_${crypto.randomUUID()}`;
      await metaCapi({
        eventName: 'Lead',
        eventId,
        email,
        ip,
        ua: (req.headers.get('user-agent') || '').slice(0, 400),
        fbp: cleanToken(body.fbp, 200),
        fbc: cleanToken(body.fbc, 300),
      });
    }
    return fjson({ ok: true });
  } catch (e) {
    console.error('funnel-waitlist error:', e);
    return fjson({ error: "Couldn't save that — try again." }, 500);
  }
}

async function addToAudience(email: string) {
  const key = process.env.RESEND_API_KEY;
  const aud = process.env.RESEND_AUDIENCE_ID;
  if (!key || !aud) return;
  try {
    await fetch(`https://api.resend.com/audiences/${encodeURIComponent(aud)}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
  } catch (e) {
    console.error('resend audience', e);
  }
}
