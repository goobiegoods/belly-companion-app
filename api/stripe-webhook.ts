export const config = { runtime: 'edge' };

import Stripe from 'stripe';
import { getStripe, dbSelect, dbUpdate, dbUpsert } from './_lib/stripe';

// WebCrypto-based signature verification for the edge runtime.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const ok = () =>
  new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not configured');
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
  } catch (e) {
    console.error('stripe-webhook: signature verification failed:', e);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        console.log('stripe-webhook: payment failed for invoice', (event.data.object as Stripe.Invoice).id);
        break;
      default:
        console.log('stripe-webhook: unhandled event', event.type);
    }
    return ok();
  } catch (e) {
    // Non-2xx so Stripe retries — DB hiccups shouldn't lose the event.
    console.error(`stripe-webhook: handler error for ${event.type}:`, e);
    return new Response('Handler error', { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // SUBSCRIPTION checkout — sync immediately in case subscription.created
  // raced with (or was delivered after) the success-page polling.
  if (session.mode === 'subscription') {
    if (!session.subscription) return;
    const sub = await getStripe().subscriptions.retrieve(String(session.subscription));
    // The session metadata is the source of truth for userId if the
    // subscription metadata hasn't propagated yet.
    if (!sub.metadata?.userId && session.metadata?.userId) {
      sub.metadata = { ...sub.metadata, userId: session.metadata.userId };
    }
    await syncSubscription(sub);
    return;
  }

  // ONE-TIME payment (shop orders)
  if (session.mode !== 'payment') return;
  if (session.payment_status !== 'paid') {
    console.log('stripe-webhook: skipping session, payment_status =', session.payment_status);
    return;
  }
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.log('stripe-webhook: no orderId in checkout session metadata');
    return;
  }

  await dbUpdate(`orders?id=eq.${orderId}`, {
    status: 'paid',
    amount_paid: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
    paid_at: new Date().toISOString(),
    stripe_session_id: session.id,
  });
  console.log('stripe-webhook: order marked paid:', orderId);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  if (session.mode !== 'payment') return;
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await dbUpdate(`orders?id=eq.${orderId}&status=eq.pending_payment`, { status: 'abandoned' });
  console.log('stripe-webhook: order marked abandoned:', orderId);
}

/**
 * On newer Stripe API versions the billing period lives on the subscription
 * item, not the subscription — read whichever is present.
 */
function billingPeriod(sub: Stripe.Subscription): { start: string | null; end: string | null } {
  const item = sub.items?.data?.[0] as unknown as Record<string, unknown> | undefined;
  const legacy = sub as unknown as Record<string, unknown>;
  const start = (item?.current_period_start ?? legacy.current_period_start) as number | undefined;
  const end = (item?.current_period_end ?? legacy.current_period_end) as number | undefined;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

async function resolveUserId(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.userId) return sub.metadata.userId;
  const rows = await dbSelect<{ user_id: string }>(
    `subscriptions?select=user_id&stripe_subscription_id=eq.${sub.id}&limit=1`,
  );
  return rows[0]?.user_id ?? null;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = await resolveUserId(sub);
  if (!userId) {
    console.error('stripe-webhook: no userId for subscription', sub.id);
    return;
  }

  const item = sub.items?.data?.[0];
  const period = billingPeriod(sub);
  const now = new Date().toISOString();

  await dbUpsert(
    'subscriptions',
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: String(sub.customer),
      product_id: String(item?.price?.product ?? ''),
      price_id: item?.price?.id ?? '',
      status: sub.status,
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: sub.cancel_at_period_end || false,
      environment: 'sandbox',
      updated_at: now,
    },
    'stripe_subscription_id',
  );

  const isActive = sub.status === 'active' || sub.status === 'trialing';
  await dbUpdate(`profiles?user_id=eq.${userId}`, {
    is_premium: isActive,
    ...(isActive ? { premium_since: now } : {}),
    premium_expires_at: period.end,
  });
  console.log(`stripe-webhook: subscription ${sub.id} → ${sub.status}, premium=${isActive} for ${userId}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await dbUpdate(`subscriptions?stripe_subscription_id=eq.${sub.id}`, {
    status: 'canceled',
    updated_at: new Date().toISOString(),
  });
  const userId = await resolveUserId(sub);
  if (userId) {
    await dbUpdate(`profiles?user_id=eq.${userId}`, { is_premium: false });
    console.log('stripe-webhook: premium removed for', userId);
  }
}
