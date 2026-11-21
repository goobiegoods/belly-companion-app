export const config = { runtime: 'edge' };

import { dbInsert, json } from './_lib/stripe.js';
import { duePosts, publishPost } from './_lib/meta.js';

/**
 * Agent door into the Social queue for outside AI helpers (Hermes, a ChatGPT
 * custom GPT action, etc.).
 *
 * Auth: header "x-belly-key: $SOCIAL_DRAFT_KEY" (set in Vercel). Without the env var the door is shut.
 *
 * Actions (POST JSON):
 *  - default            create a draft: {caption, media_url?, media_type?, platforms?}
 *                       Autopilot (Admin → Social) publishes the oldest draft with media at 9am PT.
 *  - "upload_url"       {action, filename, content_type} → {upload_url, public_url}.
 *                       PUT the file bytes to upload_url (header Content-Type), then use public_url
 *                       as media_url. Files land in the public `social` bucket under agents/.
 *  - schedule           add {scheduled_for: ISO time} to a draft → status "scheduled".
 *  - "run_due"          publish scheduled posts whose time has come (and finish processing reels).
 *  scheduled_for and run_due publish without a click in Admin, so they only work when
 *  SOCIAL_AGENT_PUBLISH=on is set in Vercel (Orel's standing approval to post on Belly-owned pages).
 */
const MAX_CAPTION = 2200; // Instagram's caption limit
const UPLOAD_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'video/mp4': 'mp4', 'video/quicktime': 'mov',
};

let recent: number[] = [];

const scheduledAtRequested = (v: unknown) => v !== undefined && v !== null && v !== '';

function supabase(): { url: string; key: string } {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');
  return { url, key };
}

async function signedUpload(filename: string, contentType: string) {
  const ext = UPLOAD_TYPES[contentType];
  const base = filename.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file';
  const day = new Date().toISOString().slice(0, 10);
  const path = `agents/${day}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
  const { url, key } = supabase();
  const resp = await fetch(`${url}/storage/v1/object/upload/sign/social/${path}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const body = (await resp.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!resp.ok || !body.url) throw new Error(`could not create upload link: ${body.message || resp.status}`);
  return {
    upload_url: `${url}/storage/v1${body.url}`,
    public_url: `${url}/storage/v1/object/public/social/${path}`,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
  };
}

export default async function handler(req: Request) {
  const key = process.env.SOCIAL_DRAFT_KEY;
  if (!key || req.headers.get('x-belly-key') !== key) return new Response('Not found', { status: 404 });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const now = Date.now();
  recent = recent.filter((t) => now - t < 60 * 60_000);
  if (recent.length >= 30) return json({ error: 'Too many requests this hour. Try later.' }, 429);

  const b = (await req.json().catch(() => ({}))) as {
    action?: unknown; filename?: unknown; content_type?: unknown;
    caption?: unknown; media_url?: unknown; media_type?: unknown; platforms?: unknown; scheduled_for?: unknown;
  };
  const publishAllowed = process.env.SOCIAL_AGENT_PUBLISH === 'on';

  if (b.action === 'upload_url') {
    const ct = typeof b.content_type === 'string' ? b.content_type : '';
    if (!UPLOAD_TYPES[ct]) return json({ error: `content_type must be one of ${Object.keys(UPLOAD_TYPES).join(', ')}.` }, 400);
    recent.push(now);
    try {
      return json({ ok: true, ...(await signedUpload(typeof b.filename === 'string' ? b.filename : 'file', ct)) });
    } catch (e) {
      return json({ error: (e as Error).message.slice(0, 200) }, 502);
    }
  }

  if (b.action === 'run_due') {
    if (!publishAllowed) return json({ error: 'Publishing by agents is off (SOCIAL_AGENT_PUBLISH).' }, 403);
    recent.push(now);
    const results: { id: string; status: string; error?: string }[] = [];
    try {
      // One post per call keeps us under the edge time limit (Nov 18 FUNCTION_INVOCATION_TIMEOUT). Call again for the next.
      for (const post of await duePosts(1)) {
        try { results.push({ id: post.id, ...(await publishPost(post)) }); }
        catch (e) { results.push({ id: post.id, status: 'error', error: (e as Error).message.slice(0, 200) }); }
      }
    } catch (e) {
      return json({ error: (e as Error).message.slice(0, 200) }, 502);
    }
    return json({ ok: true, results, more: results.length > 0 });
  }

  const caption = typeof b.caption === 'string' ? b.caption.trim() : '';
  if (!caption) return json({ error: 'caption is required.' }, 400);
  if (caption.length > MAX_CAPTION) return json({ error: `caption must be under ${MAX_CAPTION} characters.` }, 400);

  let mediaUrl: string | null = null;
  if (typeof b.media_url === 'string' && b.media_url.trim()) {
    try {
      const u = new URL(b.media_url.trim());
      if (u.protocol !== 'https:') throw new Error();
      mediaUrl = u.toString();
    } catch {
      return json({ error: 'media_url must be a public https URL.' }, 400);
    }
  }
  const mediaType = mediaUrl ? (b.media_type === 'reel' ? 'reel' : 'image') : 'text';
  const allowed = ['facebook', 'instagram'];
  const platforms = Array.isArray(b.platforms)
    ? b.platforms.filter((p): p is string => typeof p === 'string' && allowed.includes(p))
    : allowed;
  if (!platforms.length) return json({ error: 'platforms must include facebook and/or instagram.' }, 400);
  if (scheduledAtRequested(b.scheduled_for) && platforms.includes('instagram') && !mediaUrl) {
    return json({ error: 'A scheduled Instagram post needs media_url (see action "upload_url").' }, 400);
  }

  let scheduledAt: string | null = null;
  if (scheduledAtRequested(b.scheduled_for)) {
    if (!publishAllowed) return json({ error: 'Scheduling by agents is off (SOCIAL_AGENT_PUBLISH). Leave scheduled_for out to save a draft.' }, 403);
    const t = typeof b.scheduled_for === 'string' ? Date.parse(b.scheduled_for) : NaN;
    if (!Number.isFinite(t)) return json({ error: 'scheduled_for must be an ISO date-time.' }, 400);
    if (t > now + 14 * 864e5) return json({ error: 'scheduled_for must be within 14 days.' }, 400);
    scheduledAt = new Date(Math.max(t, now)).toISOString();
  }

  recent.push(now);
  const row = await dbInsert<{ id: string }>('social_posts', {
    caption,
    media_url: mediaUrl,
    media_type: mediaType,
    platforms,
    status: scheduledAt ? 'scheduled' : 'draft',
    scheduled_at: scheduledAt,
  });
  return json({
    ok: true, id: row.id, status: scheduledAt ? 'scheduled' : 'draft', scheduled_at: scheduledAt,
    review: 'https://admin.meetbelly.com/admin/social',
  });
}
