export const config = { runtime: 'edge' };

// Serves a purchased e-book. Access = a paid Stripe Checkout session id for that product.
import { getStripe } from './_lib/stripe.js';
import { FIRST30_HTML } from './_lib/first30-book.js';

const BOOKS: Record<string, string> = { first30: FIRST30_HTML };

function page(msg: string, status: number) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Belly</title>` +
      `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#150A1F;color:#FBEEE0;font-family:Georgia,serif;text-align:center;padding:24px">` +
      `<div><p style="font-size:26px;font-style:italic;margin:0 0 12px">${msg}</p><p style="font-family:sans-serif;font-size:14px;opacity:.7">Need help? Email hello@meetbelly.com</p></div>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get('sid') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sid)) return page('That link doesn’t look right.', 400);
  try {
    const s = await getStripe().checkout.sessions.retrieve(sid);
    const product = s.metadata?.product || '';
    if (s.metadata?.source !== 'ebook' || !BOOKS[product]) return page('We couldn’t find that book.', 404);
    if (s.payment_status !== 'paid') return page('Your payment is still finishing. Refresh in a moment.', 402);
    return new Response(BOOKS[product], {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' },
    });
  } catch (e) {
    console.error('ebook read error:', e);
    return page('We couldn’t open your book just now. Try again in a minute.', 500);
  }
}
