export const config = { runtime: 'edge' };

import Stripe from 'stripe';
import { getStripe, dbSelect, dbUpdate, dbUpsert, resolveStripeWebhookSecret } from './_lib/stripe.js';
import {
  cleanEmail,
  findOrCreateUser,
  magicLinkFor,
  sendEmail,
  signInEmail,
  metaCapi,
  phCapture,
  STAGE_TO_SEASON,
} from './_lib/funnel.js';

// WebCrypto-based signature verification for the edge runtime.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const ok = () =>
  new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = resolveStripeWebhookSecret();
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
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
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
    // Landing-page guest checkout: find/create the account, then sync.
    if (session.metadata?.source === 'funnel') {
      await fulfillFunnel(session, sub);
      return;
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
      // Stripe's livemode flag is ground truth — live events label rows
      // 'production', test-mode deliveries stay 'sandbox'.
      environment: sub.livemode ? 'production' : 'sandbox',
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

// ======================================================================
// Landing funnel fulfillment (meetbelly.com guest checkout)
// Every step is idempotent so Stripe retries resume where they stopped.
// ======================================================================
interface FunnelOrder {
  stripe_session_id: string;
  email: string;
  variant: string;
  offer: string;
  trial_days: number;
  ebook: boolean;
  stage: string | null;
  anon_id: string | null;
  fbp: string | null;
  fbc: string | null;
  client_ip: string | null;
  client_ua: string | null;
  gpc: boolean | null;
  user_id: string | null;
  magic_link_sent_at: string | null;
  capi_sent_at: string | null;
}

async function fulfillFunnel(session: Stripe.Checkout.Session, sub: Stripe.Subscription) {
  const rows = await dbSelect<FunnelOrder>(
    `funnel_orders?select=*&stripe_session_id=eq.${encodeURIComponent(session.id)}&limit=1`,
  );
  const order = rows[0];
  const email = cleanEmail(session.customer_details?.email || session.customer_email || order?.email);
  if (!email) throw new Error(`funnel: no email on session ${session.id}`);

  // 1) Account — reuse the existing one for this email, never duplicate.
  let userId = session.metadata?.userId || order?.user_id || null;
  let created = false;
  if (!userId) {
    const r = await findOrCreateUser(email, { source: 'funnel', qa_account: !session.livemode });
    userId = r.userId;
    created = r.created;
  }
  if (created && order?.stage && STAGE_TO_SEASON[order.stage]) {
    await dbUpdate(`profiles?user_id=eq.${userId}&season=is.null`, { season: STAGE_TO_SEASON[order.stage] });
  }

  // 2) Tie the subscription to the user (future events resolve by metadata).
  if (sub.metadata?.userId !== userId) {
    await getStripe().subscriptions.update(sub.id, { metadata: { ...sub.metadata, userId } });
    sub.metadata = { ...sub.metadata, userId };
  }
  await syncSubscription(sub);

  const record = {
    user_id: userId,
    stripe_subscription_id: sub.id,
    status: 'fulfilled',
    updated_at: new Date().toISOString(),
    ...(created ? { created_user: true } : {}),
  };
  if (order) {
    await dbUpdate(`funnel_orders?stripe_session_id=eq.${encodeURIComponent(session.id)}`, record);
  } else {
    await dbUpsert(
      'funnel_orders',
      {
        stripe_session_id: session.id,
        email,
        variant: session.metadata?.variant || 'a',
        offer: session.metadata?.offer || 'trial',
        trial_days: 0,
        livemode: session.livemode,
        ...record,
      },
      'stripe_session_id',
    );
  }

  // 3) Magic-link welcome email (once).
  if (!order?.magic_link_sent_at) {
    const link = await magicLinkFor(email);
    const price = sub.items?.data?.[0]?.price;
    const m = signInEmail(link, {
      welcome: true,
      trialDays: order?.trial_days || undefined,
      plan: price?.unit_amount
        ? {
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            amount: price.unit_amount / 100,
            interval: price.recurring?.interval || 'year',
          }
        : undefined,
    });
    await sendEmail(email, m.subject, m.html, m.text);
    await dbUpdate(`funnel_orders?stripe_session_id=eq.${encodeURIComponent(session.id)}`, {
      magic_link_sent_at: new Date().toISOString(),
    });
  }

  // 4) Analytics. Meta: allow-listed fields only, no stage/product.
  if (!order?.capi_sent_at) {
    const trial = (order?.trial_days ?? 1) > 0;
    if (!order?.gpc) {
      await metaCapi({
        eventName: trial ? 'StartTrial' : 'Purchase',
        eventId: `trial_${session.id}`,
        email,
        ip: order?.client_ip,
        ua: order?.client_ua,
        fbp: order?.fbp,
        fbc: order?.fbc,
        value: trial ? 0 : (session.amount_total ?? 0) / 100,
        currency: 'USD',
      });
    }
    if (order?.anon_id) {
      await phCapture('$create_alias', userId, { alias: order.anon_id });
    }
    await phCapture('funnel_trial_started', userId, {
      variant: order?.variant,
      offer: order?.offer,
      trial_days: order?.trial_days,
      path: order?.stage,
      livemode: session.livemode,
    });
    await dbUpdate(`funnel_orders?stripe_session_id=eq.${encodeURIComponent(session.id)}`, {
      capi_sent_at: new Date().toISOString(),
    });
  }
  console.log(`stripe-webhook: funnel session ${session.id} fulfilled for ${userId} (created=${created})`);
}

/** First real charge after a funnel trial → Purchase (Meta) + PostHog. */
async function handleInvoicePaid(inv: Stripe.Invoice) {
  if (!inv.amount_paid || inv.amount_paid <= 0) return;
  const raw = inv as unknown as {
    subscription?: string | { id: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id: string } } };
  };
  const subRef = raw.parent?.subscription_details?.subscription ?? raw.subscription;
  const subId = typeof subRef === 'string' ? subRef : subRef?.id;
  if (!subId) return;
  const rows = await dbSelect<FunnelOrder>(
    `funnel_orders?select=*&stripe_subscription_id=eq.${encodeURIComponent(subId)}&limit=1`,
  );
  const order = rows[0];
  if (!order) return; // not a funnel subscription
  if (!order.gpc) {
    await metaCapi({
      eventName: 'Purchase',
      eventId: `purchase_${inv.id}`,
      email: order.email,
      ip: order.client_ip,
      ua: order.client_ua,
      fbp: order.fbp,
      fbc: order.fbc,
      value: inv.amount_paid / 100,
      currency: 'USD',
    });
  }
  if (order.user_id) {
    await phCapture('funnel_subscription_paid', order.user_id, {
      variant: order.variant,
      amount: inv.amount_paid / 100,
      billing_reason: inv.billing_reason,
    });
  }
}
