export const config = { runtime: 'edge' };

import { dbInsert, json } from './_lib/stripe.js';

/**
 * Drafts-only door into the Social queue for outside AI helpers (a ChatGPT
 * custom GPT action, etc.). It can ONLY create drafts: nothing is published
 * until an admin approves it in admin.meetbelly.com → Social.
 *
 * Auth: header "x-belly-key: $SOCIAL_DRAFT_KEY" (set in Vercel; paste the same
 * value into the GPT action's API key). Without the env var the door is shut.
 */
const MAX_CAPTION = 2200; // Instagram's caption limit

let recent: number[] = [];

export default async function handler(req: Request) {
  const key = process.env.SOCIAL_DRAFT_KEY;
  if (!key || req.headers.get('x-belly-key') !== key) return new Response('Not found', { status: 404 });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const now = Date.now();
  recent = recent.filter((t) => now - t < 60 * 60_000);
  if (recent.length >= 30) return json({ error: 'Too many drafts this hour. Try later.' }, 429);

  const b = (await req.json().catch(() => ({}))) as {
    caption?: unknown; media_url?: unknown; media_type?: unknown; platforms?: unknown;
  };
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

  recent.push(now);
  const row = await dbInsert<{ id: string }>('social_posts', {
    caption,
    media_url: mediaUrl,
    media_type: mediaType,
    platforms,
    status: 'draft',
  });
  return json({ ok: true, id: row.id, status: 'draft', review: 'https://admin.meetbelly.com/admin/social' });
}
