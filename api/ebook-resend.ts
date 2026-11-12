export const config = { runtime: 'edge' };

// "Send my link again": finds this email's paid e-book purchases in Stripe and re-sends Bella's email.
// Always answers the same way, so it never reveals whether an address bought anything.
import { getStripe } from './_lib/stripe.js';
import { cleanEmail } from './_lib/funnel.js';
import { sendEbookEmail, EBOOK_NAMES } from './_lib/ebook-mail.js';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body: { email?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const email = cleanEmail(body.email);
  if (!email) return json({ error: 'Enter the email you used at checkout.' }, 400);
  try {
    // Stripe matches the email as typed at checkout, so also try the exact casing the mom entered.
    const raw = typeof body.email === 'string' ? body.email.trim() : '';
    const tries = [...new Set([email, raw].filter(Boolean))];
    const sessions = (await Promise.all(tries.map((e) => getStripe().checkout.sessions.list({ customer_details: { email: e }, limit: 30 }))))
      .flatMap((l) => l.data).sort((a, b) => b.created - a.created);
    const latest = new Map<string, (typeof sessions)[number]>();
    for (const s of sessions) {
      const p = s.metadata?.product || '';
      if (s.metadata?.source !== 'ebook' || s.payment_status !== 'paid' || !EBOOK_NAMES[p]) continue;
      if (!latest.has(p)) latest.set(p, s); // list is newest first
    }
    for (const s of latest.values()) await sendEbookEmail(s, true);
    console.log('ebook-resend', latest.size);
  } catch (e) {
    console.error('ebook-resend error', e);
  }
  return json({ ok: true });
}
