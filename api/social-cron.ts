export const config = { runtime: 'edge' };

import { json } from './_lib/stripe.js';
import { duePosts, publishPost, pullMetrics } from './_lib/meta.js';

/**
 * Daily job (vercel.json crons, 9am Pacific): publish scheduled posts that are
 * due (and finish Instagram reels still processing), then save yesterday's
 * insights. Vercel sends "Authorization: Bearer $CRON_SECRET".
 */
export default async function handler(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Not found', { status: 404 });
  }
  const results: { id: string; status: string; error?: string }[] = [];
  try {
    for (const post of await duePosts(3)) {
      try {
        results.push({ id: post.id, ...(await publishPost(post)) });
      } catch (e) {
        results.push({ id: post.id, status: 'error', error: (e as Error).message.slice(0, 200) });
      }
    }
  } catch (e) {
    results.push({ id: '-', status: 'error', error: (e as Error).message.slice(0, 200) });
  }
  let metrics: unknown;
  try { metrics = await pullMetrics(); } catch (e) { metrics = { error: (e as Error).message.slice(0, 200) }; }
  return json({ published: results, metrics });
}
