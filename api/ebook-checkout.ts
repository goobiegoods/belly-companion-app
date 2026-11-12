export const config = { runtime: 'edge' };

// Guest checkout for Belly e-books (one-time payment). Price and promo codes
// live here on the server, so the client can't change what it pays.
import { getStripe } from './_lib/stripe.js';
import { cleanEmail, checkoutAllowed, originAllowed, limited, clientIp, fjson, landingUrl } from './_lib/funnel.js';

export const EBOOKS: Record<string, { name: string; cents: number; path: string }> = {
  first30: { name: 'The First 30 · Belly field guide (e-book)', cents: 2900, path: '/first30' },
};
export const CODES: Record<string, number> = { MAMA5: 500, FIRST5: 500, BELLY5: 500 };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);
  if (limited(`ebook:${clientIp(req)}`, 12)) return fjson({ error: 'Too many tries. Give it a minute.' }, 429);
  const allowed = checkoutAllowed();
  if (!allowed.ok) return fjson({ error: 'Checkout is unavailable right now.', code: allowed.reason }, 503);

  try {
    const body = (await req.json().catch(() => ({}))) as { product?: string; code?: string; email?: string };
    const product = EBOOKS[String(body.product || '')];
    if (!product) return fjson({ error: 'Unknown product' }, 400);
    const code = String(body.code || '').trim().toUpperCase().slice(0, 24);
    const off = code ? CODES[code] : 0;
    if (code && !off) return fjson({ error: 'That code isn’t valid.', code: 'bad_code' }, 400);
    const email = cleanEmail(body.email);
    const amount = product.cents - (off || 0);
    const base = landingUrl(req);
    const slug = String(body.product);

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: { name: product.name + (off ? ` · ${code} −$${(off / 100).toFixed(0)}` : '') },
          },
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      customer_creation: 'always',
      success_url: `${base}${product.path}/thanks.html?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${product.path}?checkout=cancelled`,
      metadata: { source: 'ebook', product: slug, code: off ? code : '' },
      payment_intent_data: { metadata: { source: 'ebook', product: slug } },
      custom_text: { submit: { message: 'Instant digital access. One-time payment, no subscription.' } },
    });
    return fjson({ url: session.url });
  } catch (e) {
    console.error('ebook-checkout error:', e);
    return fjson({ error: 'Checkout is unavailable right now. Please try again.' }, 500);
  }
}
