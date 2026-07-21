export const config = { runtime: 'edge' };

import { CORS, json, getStripe, requireUser } from './_lib/stripe.js';

// Stripe test-mode price IDs for Pro (not secrets). The client only ever
// sends a plan name, so it can never inject an arbitrary price.
const PRICE_IDS: Record<string, string> = {
  monthly: 'price_1TvRZH3aGROnSTkwA5AGLshP', // $9.99 / month
  yearly: 'price_1TvRZH3aGROnSTkwcIdEonLx', // $79.99 / year
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
    const priceId = PRICE_IDS[String(body.plan)];
    if (!priceId) return json({ error: 'Invalid plan' }, 400);

    const origin = req.headers.get('origin') || 'https://belly-companion-app.vercel.app';

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'embedded_page',
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      ...(auth.email ? { customer_email: auth.email } : {}),
      metadata: { userId: auth.id },
      subscription_data: { metadata: { userId: auth.id } },
    });

    return json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error('stripe-checkout error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
}
