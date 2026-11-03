export const config = { runtime: 'edge' };

import { dbSelect, json } from './_lib/stripe.js';
import { duePosts, nextAutopilotDraft, postedRecently, publishPost, pullMetrics } from './_lib/meta.js';
import { runLifecycle } from './_lib/lifecycle.js';

/**
 * Daily job (vercel.json crons, 9am Pacific):
 *  1. publish scheduled posts that are due (and finish reels still processing)
 *  2. Autopilot (Admin → Social switch): if nothing went out in the last 20h,
 *     publish the oldest draft that has media
 *  3. save yesterday's insights
 *  4. send lifecycle emails (welcome, trial ending, win-back)
 * Vercel sends "Authorization: Bearer $CRON_SECRET".
 */
export default async function handler(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Not found', { status: 404 });
  }
  const results: { id: string; status: string; error?: string }[] = [];
  const run = async (post: Awaited<ReturnType<typeof duePosts>>[number]) => {
    try {
      results.push({ id: post.id, ...(await publishPost(post)) });
    } catch (e) {
      results.push({ id: post.id, status: 'error', error: (e as Error).message.slice(0, 200) });
    }
  };
  try {
    for (const post of await duePosts(3)) await run(post);
  } catch (e) {
    results.push({ id: '-', status: 'error', error: (e as Error).message.slice(0, 200) });
  }

  let autopilot: string = 'off';
  try {
    const cfg = await dbSelect<{ social_autopilot: boolean }>('app_config?select=social_autopilot&id=eq.1');
    if (cfg[0]?.social_autopilot) {
      if (results.some((r) => r.status === 'published') || (await postedRecently())) autopilot = 'already posted today';
      else {
        const draft = await nextAutopilotDraft();
        if (draft) { await run(draft); autopilot = `posted ${draft.id}`; } else autopilot = 'no drafts left';
      }
    }
  } catch (e) { autopilot = `error: ${(e as Error).message.slice(0, 150)}`; }

  let metrics: unknown;
  try { metrics = await pullMetrics(); } catch (e) { metrics = { error: (e as Error).message.slice(0, 200) }; }
  let emails: unknown;
  try { emails = await runLifecycle(); } catch (e) { emails = { error: (e as Error).message.slice(0, 200) }; }
  return json({ published: results, autopilot, metrics, emails });
}
