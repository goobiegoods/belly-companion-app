// Bella's "your book is here" email. Used on purchase (webhook) and on "send my link again" (ebook-resend).
import type Stripe from 'stripe';
import { layout } from './emails.js';
import { cleanEmail, sendEmail } from './funnel.js';

export const EBOOK_NAMES: Record<string, string> = { first30: 'The First 30' };

export async function sendEbookEmail(session: Stripe.Checkout.Session, again = false) {
  const email = cleanEmail(session.customer_details?.email || session.customer_email);
  const product = session.metadata?.product || '';
  const name = EBOOK_NAMES[product];
  if (!email || !name) { console.log('ebook: missing email or product', session.id); return null; }
  const base = (process.env.LANDING_URL || 'https://meetbelly.com').replace(/\/+$/, '');
  const link = `${base}/api/ebook?sid=${encodeURIComponent(session.id)}`;
  const html = layout({
    preheader: again ? `Here's your link to ${name} again.` : `${name} is yours. Open it tonight, mama.`,
    icon: '',
    eyebrow: again ? 'Your link, again' : 'Your book is here',
    headline: again ? `Right where *you left it.*` : `${name}, *yours.*`,
    paragraphs: again
      ? ["Here's your book again, mama. Your ticks are saved on the phone you used."]
      : ["Hi mama, I'm Bella. One page a day, one warm bowl, one tiny win.", 'Open it on your phone and tick your first day tonight. Your moon starts filling.'],
    features: [
      { icon: '', title: 'Save this email', text: 'The button below is your copy, forever. Any phone, any time.' },
      { icon: '', title: 'Keep it like an app', text: 'Open it, tap Share, then Add to Home Screen.' },
      { icon: '', title: 'Want me at 3am too?', text: 'Belly is free for 7 days at app.meetbelly.com.' },
    ],
    cta: { label: `Open ${name}`, url: link },
    note: `Receipt: ${name} · one-time purchase · no subscription. Lost this email? Get your link any time at meetbelly.com/first30/access`,
    signoff: true,
    footer: { reason: `You're getting this because you bought ${name}.` },
  });
  const text = `Hi mama, it's Bella. ${name} is yours.\n\nOpen it: ${link}\n\nKeep this email, that link is your copy forever. Lost it? meetbelly.com/first30/access\n\n— Bella, Belly`;
  await sendEmail(email, again ? `Your link to ${name}` : `${name} is yours, mama`, html, text);
  return { email, product, name };
}
