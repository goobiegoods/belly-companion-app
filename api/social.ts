export const config = { runtime: 'edge' };

import { json, requireUser } from './_lib/stripe.js';
import { getPost, metaStatus, publishPost, pullMetrics } from './_lib/meta.js';

/**
 * Admin-only social actions for the admin "Social" page.
 * POST { action: "status" }            -> who we post as (read-only)
 * POST { action: "publish", id }       -> publish one queued post now
 * POST { action: "metrics" }           -> pull yesterday's insights now
 *
 * The caller must be an admin with a two-factor (AAL2) session: we ask the
 * database's has_role() with the caller's own token, which enforces both.
 */
async function isAdmin(req: Request, userId: string): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const r = await fetch(`${url}/rest/v1/rpc/has_role`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ _user_id: userId, _role: 'admin' }),
  });
  return r.ok && (await r.json().catch(() => false)) === true;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const user = await requireUser(req);
  if (user instanceof Response) return user;
  if (!(await isAdmin(req, user.id))) return json({ error: 'Admins only.' }, 403);

  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string };
  try {
    if (body.action === 'status') return json(await metaStatus());
    if (body.action === 'metrics') return json(await pullMetrics());
    if (body.action === 'publish') {
      if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return json({ error: 'Missing post id.' }, 400);
      const post = await getPost(body.id);
      if (!post) return json({ error: 'Post not found.' }, 404);
      if (post.status === 'published') return json({ status: 'published' });
      return json(await publishPost(post));
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    return json({ error: (e as Error).message.slice(0, 300) }, 502);
  }
}
