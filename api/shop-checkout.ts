export const config = { runtime: 'edge' };

import { getStripe, dbUpsert } from './_lib/stripe.js';
import {
  cleanEmail,
  cleanStage,
  cleanToken,
  checkoutAllowed,
  originAllowed,
  limited,
  clientIp,
  fjson,
  landingUrl,
  stripeMode,
} from './_lib/funnel.js';

/**
 * Guest checkout for physical shop items on the landing feed.
 * Client sends: { sku, name?, email, stage?, anonId? }
 * Prices live HERE only — the client never sends an amount.
 */
type Sku = { name: string; desc: string; cents: number };

export const TEA_CENTS = 9900; // every mason jar tea ships with 2 tea cups
const ELIXIRS: Record<string, Sku> = {
  golden_elixir: {
    name: 'Golden Elixir',
    desc: 'Raw honey, turmeric, ginger, lemon zest, a pinch of salt and black pepper. Turmeric-forward. 4 oz jar.',
    cents: 3400,
  },
  ginger_zest_elixir: {
    name: 'Ginger Zest Elixir',
    desc: 'Raw honey, ginger, lemon zest, turmeric, a pinch of salt and black pepper. Bright and gingery. 4 oz jar.',
    cents: 3400,
  },
};

function cleanName(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const n = v.replace(/&amp;/g, '&').replace(/[^\p{L}\p{N} &'’.,-]/gu, '').replace(/\s+/g, ' ').trim();
  return n.length >= 3 && n.length <= 60 ? n : null;
}

function resolve(sku: string, name: unknown): Sku | null {
  if (ELIXIRS[sku]) return ELIXIRS[sku];
  if (sku === 'tea') {
    const n = cleanName(name);
    if (!n) return null;
    const base = n.replace(/\s*(tea|blend)$/i, '').trim();
    return {
      name: `${base} · Mason Jar Tea + 2 Tea Cups`,
      desc: 'Hand-blended loose-leaf tea in a glass mason jar, with two tea cups.',
      cents: TEA_CENTS,
    };
  }
  return null;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);

  const gate = checkoutAllowed();
  if (gate.ok === false) return fjson({ error: gate.reason, code: 'closed' }, 503);

  const ip = clientIp(req);
  if (limited(`shop:${ip}`, 10)) return fjson({ error: 'Too many tries — wait a minute.', code: 'rate' }, 429);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = cleanEmail(body.email);
  if (!email) return fjson({ error: 'Enter a valid email.', code: 'email' }, 400);

  const sku = String(body.sku || '');
  const item = resolve(sku, body.name);
  if (!item) return fjson({ error: 'That item is not available.', code: 'sku' }, 400);

  const stage = cleanStage(body.stage);
  const anonId = cleanToken(body.anonId, 64);
  const base = landingUrl(req);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: item.cents,
            product_data: { name: item.name, description: item.desc },
          },
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: 6 },
        },
      ],
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free shipping',
          },
        },
      ],
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${base}/landing/thanks.html?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/start?${stage ? `t=${stage}&` : ''}checkout=cancelled`,
      metadata: { source: 'shop', sku, item: item.name.slice(0, 200) },
      payment_intent_data: { metadata: { source: 'shop', sku } },
    });

    await dbUpsert(
      'funnel_leads',
      { email, kind: 'shop_checkout', product_key: sku, variant: 'a', stage, anon_id: anonId },
      'email,kind,product_key',
    ).catch((e) => console.error('shop lead', e));

    return fjson({ url: session.url, livemode: stripeMode() === 'live' });
  } catch (e) {
    console.error('shop-checkout', e);
    return fjson({ error: 'Checkout could not start. Try again.' }, 500);
  }
}
