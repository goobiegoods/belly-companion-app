export const config = { runtime: 'edge' };

import { CORS, json, getStripe, requireUser, dbSelect } from './_lib/stripe.js';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const subs = await dbSelect<{ stripe_customer_id: string }>(
      `subscriptions?select=stripe_customer_id&user_id=eq.${auth.id}&order=updated_at.desc&limit=1`,
    );
    if (!subs.length || !subs[0].stripe_customer_id) {
      return json({ error: 'No subscription found for this account' }, 404);
    }

    const origin = req.headers.get('origin') || 'https://belly-companion-app.vercel.app';
    const session = await getStripe().billingPortal.sessions.create({
      customer: subs[0].stripe_customer_id,
      return_url: `${origin}/me`,
    });

    return json({ url: session.url });
  } catch (e) {
    console.error('stripe-portal error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
}
