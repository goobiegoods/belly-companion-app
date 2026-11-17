export const config = { runtime: 'edge' };

// Serves a purchased e-book. Access = a paid Stripe Checkout session id for that product.
import { getStripe } from './_lib/stripe.js';
import { FIRST30_HTML } from './_lib/first30-book.js';
import { SOLIDS_HTML } from './_lib/solids-book.js';
import { RECIPES_HTML } from './_lib/recipes-book.js';

const BOOKS: Record<string, string> = { first30: FIRST30_HTML, solids: SOLIDS_HTML, recipes: RECIPES_HTML };

// Last page of every book: one next guide, at its normal price. Self-styled so it renders the same in all three books.
const NEXT: Record<string, { eyebrow: string; title: string; accent: string; line: string; cta: string; href: string }> = {
  first30: { eyebrow: 'Next from Belly', title: 'Feed', accent: 'yourself.', line: 'Sixteen warm bowls, including the recovery ones. One pot, twenty minutes.', cta: 'The Recipe Book · $19', href: '/recipes?ref=book-first30' },
  solids: { eyebrow: 'Next from Belly', title: 'Warm bowls for', accent: 'everyone.', line: 'Sixteen easy recipes, four just for littles. One pot, twenty minutes.', cta: 'The Recipe Book · $19', href: '/recipes?ref=book-solids' },
  recipes: { eyebrow: 'Next from Belly', title: 'The first month,', accent: 'held.', line: 'One page a day for you and baby. What’s normal, a warm bowl, a tiny win.', cta: 'The First 30 · $29', href: '/first30?ref=book-recipes' },
};

function withNext(product: string, html: string) {
  const n = NEXT[product];
  if (!n) return html;
  const card =
    `<section style="background:#150A1F;padding:56px 22px 72px;text-align:center;font-family:Inter,system-ui,sans-serif">` +
    `<div style="max-width:480px;margin:0 auto;background:#fff;color:#150A1F;border-radius:22px;padding:30px 24px;box-shadow:0 30px 60px -20px #000c,0 0 40px #F2B64733">` +
    `<div style="font:600 10px 'JetBrains Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#E8622E">${n.eyebrow}</div>` +
    `<h3 style="font:400 30px/1.15 Fraunces,Georgia,serif;margin:12px 0 0">${n.title} <i style="color:#E8622E">${n.accent}</i></h3>` +
    `<p style="font-size:15px;line-height:1.55;color:#150A1Fcc;margin:12px 0 0">${n.line}</p>` +
    `<a href="${n.href}" style="display:inline-flex;align-items:center;gap:10px;margin-top:22px;background:#150A1F;color:#FBEEE0;border-radius:999px;padding:15px 24px;font:600 15px Inter,sans-serif;text-decoration:none">${n.cta} <span style="color:#F2B647">→</span></a>` +
    `</div></section>`;
  const i = html.lastIndexOf('</body>');
  return i < 0 ? html + card : html.slice(0, i) + card + html.slice(i);
}

function page(msg: string, status: number) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Belly</title>` +
      `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#150A1F;color:#FBEEE0;font-family:Georgia,serif;text-align:center;padding:24px">` +
      `<div><p style="font-size:26px;font-style:italic;margin:0 0 12px">${msg}</p><p style="font-family:sans-serif;font-size:14px;opacity:.7"><a href="/first30/access" style="color:#F2B647">Get your link again</a> · Need help? Email hello@meetbelly.com</p></div>`,
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
    return new Response(withNext(product, BOOKS[product]), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' },
    });
  } catch (e) {
    console.error('ebook read error:', e);
    return page('We couldn’t open your book just now. Try again in a minute.', 500);
  }
}
