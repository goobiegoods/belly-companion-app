export const config = { runtime: 'edge' };

import { getStripe, dbUpsert } from './_lib/stripe.js';
import {
  variantFor,
  cleanEmail,
  cleanStage,
  cleanToken,
  checkoutAllowed,
  ensurePrice,
  verifyBonus,
  findUserIdByEmail,
  subscriptionHistory,
  originAllowed,
  limited,
  clientIp,
  fjson,
  landingUrl,
  stripeMode,
  phCapture,
  metaCapi,
} from './_lib/funnel.js';

/**
 * Guest checkout for the landing funnel.
 * Client sends: { offer: 'trial'|'bonus'|'year'|'notrial', email, variant,
 *                 bonusToken?, stage?, anonId?, fbp?, fbc?, gpc? }
 * Server decides price + trial length. Returns { url } (Stripe-hosted page)
 * or { error, code } for the sheet to explain.
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') return fjson({ error: 'Method not allowed' }, 405);
  if (!originAllowed(req)) return fjson({ error: 'Forbidden' }, 403);

  const gate = checkoutAllowed();
  if (!gate.ok) return fjson({ error: gate.reason, code: 'closed' }, 503);

  const ip = clientIp(req);
  if (limited(`co:${ip}`, 10)) return fjson({ error: 'Too many tries — wait a minute.', code: 'rate' }, 429);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = cleanEmail(body.email);
  if (!email) return fjson({ error: 'Enter a valid email.', code: 'email' }, 400);
  if (limited(`coe:${email}`, 5)) return fjson({ error: 'Too many tries — wait a minute.', code: 'rate' }, 429);

  const offer = ['trial', 'bonus', 'year', 'notrial'].includes(String(body.offer)) ? String(body.offer) : 'trial';
  const variant = variantFor(body.variant);
  const stage = cleanStage(body.stage);
  const anonId = cleanToken(body.anonId, 64);
  const gpc = body.gpc === true;
  const fbp = gpc ? null : cleanToken(body.fbp, 200);
  const fbc = gpc ? null : cleanToken(body.fbc, 300);
  const ua = (req.headers.get('user-agent') || '').slice(0, 400);
  const livemode = stripeMode() === 'live';

  try {
    // ---- eligibility (server-side only) ----
    let trialDays = variant.trialDays;
    let ebook = false;
    if (offer === 'bonus') {
      if (await verifyBonus(body.bonusToken)) {
        trialDays = variant.bonusTrialDays;
        ebook = variant.bonusEbook;
      } else {
        return fjson({ error: 'That bonus has ended — your founding price is still here.', code: 'bonus_expired' }, 409);
      }
    }

    let customer: string | null = null;
    const userId = await findUserIdByEmail(email);
    if (userId) {
      const hist = await subscriptionHistory(userId, livemode);
      if (hist.active) {
        return fjson({ error: "You're already a member.", code: 'already_member' }, 409);
      }
      if (hist.any) {
        // One free trial per person.
        if (offer !== 'notrial') {
          return fjson({ error: "You've already had a free trial.", code: 'trial_used' }, 409);
        }
      }
      customer = hist.customerId;
    }
    if (offer === 'notrial') {
      trialDays = 0;
      ebook = false;
    }

    const priceId = await ensurePrice(variant);
    const base = landingUrl(req);
    const terms =
      trialDays > 0
        ? `Free for ${trialDays} days, then $${(variant.unitAmount / 100).toFixed(0)}/${variant.interval}. ` +
          `Renews automatically every ${variant.interval} until you cancel. Cancel anytime in the app ` +
          `(Me → Manage) or by emailing hello@meetbelly.com before your trial ends and you won't be charged.`
        : `$${(variant.unitAmount / 100).toFixed(0)}/${variant.interval}, renews automatically every ${variant.interval} until you cancel. ` +
          `Cancel anytime in the app (Me → Manage) or by emailing hello@meetbelly.com.`;

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customer ? { customer } : { customer_email: email }),
      payment_method_collection: 'always',
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      success_url: `${base}/landing/welcome.html?sid={CHECKOUT_SESSION_ID}&k=${trialDays > 0 ? 't' : 'p'}`,
      // Back to the same path + offer screen (funnel.js strips these before any pixel loads).
      cancel_url: `${base}/start?${stage ? `t=${stage}&` : ''}s=${offer === 'bonus' ? 'finale' : 'offer'}&v=${variant.code}&checkout=cancelled`,
      metadata: { source: 'funnel', variant: variant.code, offer, ...(userId ? { userId } : {}) },
      subscription_data: {
        ...(trialDays > 0
          ? { trial_period_days: trialDays, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } }
          : {}),
        metadata: { source: 'funnel', variant: variant.code, ...(userId ? { userId } : {}) },
      },
      custom_text: { submit: { message: terms } },
      ...(process.env.STRIPE_REQUIRE_TOS === '1' ? { consent_collection: { terms_of_service: 'required' as const } } : {}),
    });

    await dbUpsert(
      'funnel_orders',
      {
        stripe_session_id: session.id,
        email,
        variant: variant.code,
        offer,
        trial_days: trialDays,
        ebook,
        stage,
        anon_id: anonId,
        fbp,
        fbc,
        client_ip: gpc ? null : ip || null,
        client_ua: gpc ? null : ua || null,
        gpc,
        livemode,
        user_id: userId,
        status: 'pending',
      },
      'stripe_session_id',
    );
    await dbUpsert(
      'funnel_leads',
      { email, kind: 'checkout_start', product_key: '', variant: variant.code, stage, anon_id: anonId },
      'email,kind,product_key',
    ).catch((e) => console.error('lead upsert', e));

    if (anonId) await phCapture('funnel_checkout_started', anonId, { offer, variant: variant.code, path: stage, trial_days: trialDays, $process_person_profile: false });
    if (!gpc) {
      await metaCapi({ eventName: 'InitiateCheckout', eventId: `ic_${session.id}`, email, ip, ua, fbp, fbc, value: 0, currency: 'USD' });
    }

    return fjson({ url: session.url, eventId: `ic_${session.id}` });
  } catch (e) {
    console.error('funnel-checkout error:', e);
    return fjson({ error: 'Checkout is unavailable right now. Please try again.', code: 'server' }, 500);
  }
}
