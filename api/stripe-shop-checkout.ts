export const config = { runtime: 'edge' };

import { CORS, json, getStripe, requireUser, dbSelect, dbInsert, dbUpdate } from './_lib/stripe.js';

// Must match the thresholds shown in Cart.tsx.
const FREE_SHIPPING_MIN = 40;
const SHIPPING_FEE = 5;

interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  is_active: boolean;
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = (await req.json().catch(() => ({}))) as { items?: unknown };
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) return json({ error: 'Cart is empty' }, 400);

    // Only ids + quantities come from the client; names and prices are
    // re-read from the products table so totals can't be tampered with.
    const wanted = new Map<string, number>();
    for (const raw of items) {
      const it = raw as { id?: unknown; qty?: unknown };
      const id = String(it?.id ?? '').trim();
      const qty = Math.floor(Number(it?.qty));
      if (!id || !Number.isFinite(qty) || qty < 1 || qty > 99) {
        return json({ error: 'Invalid cart item' }, 400);
      }
      wanted.set(id, (wanted.get(id) || 0) + qty);
    }

    const ids = [...wanted.keys()];
    const inList = `(${ids.map((i) => `"${i.replace(/"/g, '')}"`).join(',')})`;
    const products = await dbSelect<ProductRow>(
      `products?select=id,name,price,is_active&id=in.${encodeURIComponent(inList)}`,
    );
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems: {
      price_data: { currency: string; product_data: { name: string }; unit_amount: number };
      quantity: number;
    }[] = [];
    let subtotal = 0;

    for (const [id, qty] of wanted) {
      const p = byId.get(id);
      if (!p || !p.is_active) return json({ error: 'An item in your cart is no longer available' }, 400);
      const price = Number(p.price);
      if (!Number.isFinite(price) || price < 0) return json({ error: 'Invalid product price' }, 400);
      subtotal += price * qty;
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: p.name },
          unit_amount: Math.round(price * 100),
        },
        quantity: qty,
      });
    }

    const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
    if (shipping > 0) {
      lineItems.push({
        price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: shipping * 100 },
        quantity: 1,
      });
    }
    const total = Math.round((subtotal + shipping) * 100) / 100;

    // Pre-create the order in 'pending_payment' so the webhook can flip it to 'paid'.
    const orderItems = ids.map((id) => {
      const p = byId.get(id)!;
      return { id, name: p.name, price: Number(p.price), qty: wanted.get(id)! };
    });
    const order = await dbInsert<{ id: string }>('orders', {
      user_id: auth.id,
      items: orderItems,
      total,
      status: 'pending_payment',
    });

    const origin = req.headers.get('origin') || 'https://belly-companion-app.vercel.app';
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      ...(auth.email ? { customer_email: auth.email } : {}),
      metadata: { userId: auth.id, orderId: order.id, kind: 'shop_order' },
      payment_intent_data: {
        metadata: { userId: auth.id, orderId: order.id, kind: 'shop_order' },
      },
    });

    await dbUpdate(`orders?id=eq.${order.id}`, { stripe_session_id: session.id });

    return json({ url: session.url, orderId: order.id });
  } catch (e) {
    console.error('stripe-shop-checkout error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
}
