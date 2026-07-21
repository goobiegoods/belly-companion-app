import Stripe from 'stripe';

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

let stripeClient: Stripe | null = null;

/** Stripe client for the edge runtime (fetch-based HTTP, no Node http module). */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    stripeClient = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  }
  return stripeClient;
}

function supabaseUrl(): string {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL is not configured');
  return url;
}

export interface AuthedUser {
  id: string;
  email?: string;
}

/**
 * Resolve the caller from their Supabase JWT by asking GoTrue directly —
 * never trust a userId sent in the request body.
 * Returns a Response (401) to short-circuit with, or the verified user.
 */
export async function requireUser(req: Request): Promise<AuthedUser | Response> {
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('Supabase anon key is not configured');

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Sign in required.' }, 401);

  const resp = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return json({ error: 'Session expired. Please sign in again.' }, 401);

  const user = await resp.json().catch(() => null);
  if (!user?.id) return json({ error: 'Invalid session.' }, 401);
  return { id: user.id, email: user.email || undefined };
}

/** PostgREST fetch with the service-role key (bypasses RLS — server only). */
function dbFetch(pathWithQuery: string, init: RequestInit = {}): Promise<Response> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return fetch(`${supabaseUrl()}/rest/v1/${pathWithQuery}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function assertOk(resp: Response, action: string): Promise<Response> {
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`${action} failed: ${resp.status} ${text.slice(0, 300)}`);
  }
  return resp;
}

export async function dbSelect<T = Record<string, unknown>>(pathWithQuery: string): Promise<T[]> {
  const resp = await assertOk(await dbFetch(pathWithQuery), `select ${pathWithQuery}`);
  return resp.json();
}

export async function dbInsert<T = Record<string, unknown>>(table: string, row: object): Promise<T> {
  const resp = await assertOk(
    await dbFetch(table, {
      method: 'POST',
      body: JSON.stringify(row),
      headers: { Prefer: 'return=representation' },
    }),
    `insert into ${table}`,
  );
  const rows = await resp.json();
  return rows[0];
}

export async function dbUpdate(pathWithQuery: string, patch: object): Promise<void> {
  await assertOk(
    await dbFetch(pathWithQuery, { method: 'PATCH', body: JSON.stringify(patch) }),
    `update ${pathWithQuery}`,
  );
}

export async function dbUpsert(table: string, row: object, onConflict: string): Promise<void> {
  await assertOk(
    await dbFetch(`${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      body: JSON.stringify(row),
      headers: { Prefer: 'resolution=merge-duplicates' },
    }),
    `upsert into ${table}`,
  );
}
