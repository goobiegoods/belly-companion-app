export const config = { runtime: 'edge' };

import { dbSelect } from './_lib/stripe.js';
import { stripeMode, checkoutAllowed, ensurePrice, VARIANTS, metaCapi, appUrl } from './_lib/funnel.js';

/**
 * Integration check: GET /api/funnel-health with header x-health-key.
 * Reports ok/error per service. Never returns secret values.
 */
export default async function handler(req: Request) {
  const want = process.env.FUNNEL_HEALTH_KEY;
  if (!want || req.headers.get('x-health-key') !== want) {
    return new Response('Not found', { status: 404 });
  }
  const out: Record<string, unknown> = { stripeMode: stripeMode(), checkoutOpen: checkoutAllowed().ok, appUrl: appUrl() };
  const run = async (name: string, fn: () => Promise<unknown>) => {
    try {
      out[name] = { ok: true, detail: await fn() };
    } catch (e) {
      out[name] = { ok: false, error: e instanceof Error ? e.message.slice(0, 200) : String(e) };
    }
  };

  await run('stripe_price', async () => {
    const ids: Record<string, string> = {};
    for (const v of Object.values(VARIANTS)) ids[v.code] = await ensurePrice(v);
    return ids;
  });
  await run('supabase_tables', async () => {
    await dbSelect('funnel_leads?select=id&limit=1');
    await dbSelect('funnel_orders?select=stripe_session_id&limit=1');
    return 'funnel_leads + funnel_orders reachable';
  });
  await run('supabase_find_user_rpc', async () => {
    const r = await fetch(`${process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL}/rest/v1/rpc/find_user_id_by_email`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _email: 'health-check@bellytest.dev' }),
    });
    if (!r.ok) throw new Error(`rpc ${r.status}`);
    return 'ok';
  });
  await run('resend', async () => {
    const r = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY || ''}` },
    });
    if (!r.ok) throw new Error(`resend ${r.status}`);
    const j = (await r.json()) as { data?: { name: string; status: string }[] };
    return (j.data || []).map((d) => `${d.name}:${d.status}`);
  });
  await run('posthog', async () => {
    const key = process.env.POSTHOG_KEY || process.env.VITE_POSTHOG_KEY;
    if (!key) throw new Error('no key');
    const host = (process.env.POSTHOG_HOST || process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');
    const r = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, event: 'funnel_health_check', distinct_id: 'funnel-health', properties: { $process_person_profile: false } }),
    });
    if (!r.ok) throw new Error(`posthog ${r.status}`);
    return 'event accepted';
  });
  await run('meta_capi', async () => {
    if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) throw new Error('not configured');
    if (!process.env.META_TEST_EVENT_CODE) return 'configured (set META_TEST_EVENT_CODE to send a test event)';
    const ok = await metaCapi({
      eventName: 'Lead',
      eventId: `health_${Date.now()}`,
      ip: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null,
      ua: req.headers.get('user-agent'),
    });
    if (!ok) throw new Error('graph api rejected the test event');
    return 'test event sent';
  });

  return new Response(JSON.stringify(out, null, 2), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
