/**
 * Daily lifecycle emails (welcome day 1 / day 3, trial ending, win-back).
 * Runs from the daily cron. Each email goes out at most once (email_log
 * unique kind+ref). Nothing sends until MAIL_POSTAL_ADDRESS is set.
 */
import { dbInsert, dbRpc, dbSelect, getStripe } from './stripe.js';
import { emailCtx, sendEmail } from './funnel.js';
import { trialEnding, welcomeDay1, welcomeDay3, winback, type Built } from './emails.js';

type Row = { kind: string; ref: string; user_id: string; email: string; first_name: string | null; ends_at: string | null; price_id: string | null };

const MARKETING = new Set(['welcome_d1', 'welcome_d3', 'winback']);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });

async function priceTerms(priceId: string | null): Promise<{ price: string; interval: string }> {
  if (priceId) {
    try {
      const p = await getStripe().prices.retrieve(priceId);
      if (p.unit_amount) {
        const a = p.unit_amount / 100;
        return { price: `$${a % 1 ? a.toFixed(2) : a.toFixed(0)}`, interval: p.recurring?.interval || 'year' };
      }
    } catch { /* fall through */ }
  }
  return { price: '$89', interval: 'year' };
}

export async function runLifecycle(limit = 40): Promise<{ sent: number; skipped: string | null; errors: string[] }> {
  if (!process.env.MAIL_POSTAL_ADDRESS) return { sent: 0, skipped: 'MAIL_POSTAL_ADDRESS not set', errors: [] };
  const rows = (await dbRpc<Row>('lifecycle_queue', {})).slice(0, limit);
  let sent = 0;
  const errors: string[] = [];
  for (const r of rows) {
    try {
      const email = r.email.toLowerCase();
      if (MARKETING.has(r.kind)) {
        const out = await dbSelect(`email_optouts?select=email&email=eq.${encodeURIComponent(email)}&limit=1`);
        if (out.length) continue;
      }
      // Claim first so a retry can never double-send.
      try {
        await dbInsert('email_log', { kind: r.kind, ref: r.ref, user_id: r.user_id, email });
      } catch {
        continue; // already sent by another run
      }
      const ctx = await emailCtx(email);
      let msg: Built;
      if (r.kind === 'welcome_d1') msg = welcomeDay1(ctx, r.first_name || undefined);
      else if (r.kind === 'welcome_d3') msg = welcomeDay3(ctx);
      else if (r.kind === 'winback') msg = winback(ctx);
      else msg = trialEnding(ctx, { endsOn: fmtDate(r.ends_at!), ...(await priceTerms(r.price_id)) });
      await sendEmail(email, msg.subject, msg.html, msg.text);
      sent++;
    } catch (e) {
      errors.push(`${r.kind}: ${(e as Error).message.slice(0, 120)}`);
    }
  }
  return { sent, skipped: null, errors };
}
