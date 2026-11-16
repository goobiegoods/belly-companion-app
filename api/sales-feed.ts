export const config = { runtime: 'edge' };

// Read-only sales feed for the GoobieVerse dashboard (money in, refunds). No customer details.
// Auth: Bearer = hex HMAC-SHA256(SUPABASE_SERVICE_ROLE_KEY, "goobieverse-sales-feed"). The dashboard already
// holds Belly's service key, so it can sign; the key itself never travels.
import { getStripe } from './_lib/stripe.js';

async function expected(): Promise<string> {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!k) return '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('goobieverse-sales-feed'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function same(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async function handler(req: Request) {
  const got = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!same(got, await expected())) return json({ error: 'unauthorized' }, 401);
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get('days')) || 60));
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const out: unknown[] = [];
  try {
    for await (const ch of getStripe().charges.list({ created: { gte: since }, limit: 100 })) {
      if (!ch.paid || ch.status !== 'succeeded') continue;
      out.push({ id: ch.id, amount: ch.amount, refunded: ch.amount_refunded, currency: ch.currency, created: ch.created,
        description: ch.description || ch.calculated_statement_descriptor || null, livemode: ch.livemode });
      if (out.length >= 500) break;
    }
    return json({ charges: out });
  } catch (e) {
    console.error('sales-feed', e);
    return json({ error: 'stripe unavailable' }, 502);
  }
}
