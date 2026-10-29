/**
 * Meta Graph API helpers for Belly's own Facebook Page + Instagram account.
 *
 * Auth: META_PAGE_TOKEN is a never-expiring System User token (belly-bot) with
 * page content / insights and Instagram publish / insights permissions. It is
 * only ever read server-side. From it we resolve the Page (and its Page token)
 * and the linked Instagram business account.
 */
import { dbSelect, dbUpdate, dbUpsert } from './stripe.js';

const GRAPH = 'https://graph.facebook.com/v25.0';

export class MetaError extends Error {}

async function graph<T = any>(
  path: string,
  opts: { method?: 'GET' | 'POST' | 'DELETE'; params?: Record<string, string>; token: string },
): Promise<T> {
  const method = opts.method || 'GET';
  const params = new URLSearchParams({ ...(opts.params || {}), access_token: opts.token });
  const url = method === 'GET' ? `${GRAPH}${path}?${params}` : `${GRAPH}${path}`;
  const resp = await fetch(url, {
    method,
    headers: method === 'GET' ? undefined : { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : params.toString(),
  });
  const body = (await resp.json().catch(() => ({}))) as any;
  if (!resp.ok || body?.error) {
    const msg = body?.error?.message || `HTTP ${resp.status}`;
    throw new MetaError(`${path}: ${String(msg).slice(0, 240)}`);
  }
  return body as T;
}

export interface MetaAccounts {
  pageId: string;
  pageName: string;
  pageToken: string;
  igId: string | null;
  igUsername: string | null;
}

let cached: { at: number; v: MetaAccounts } | null = null;

export async function metaAccounts(): Promise<MetaAccounts> {
  if (cached && Date.now() - cached.at < 10 * 60_000) return cached.v;
  const token = process.env.META_PAGE_TOKEN;
  if (!token) throw new MetaError('META_PAGE_TOKEN is not configured');
  const r = await graph<{ data: any[] }>('/me/accounts', {
    token,
    params: { fields: 'id,name,access_token,instagram_business_account{id,username}' },
  });
  const wanted = process.env.META_PAGE_ID;
  const page = (r.data || []).find((p) => !wanted || p.id === wanted);
  if (!page) throw new MetaError('No Facebook Page is assigned to the system user');
  const v: MetaAccounts = {
    pageId: page.id,
    pageName: page.name,
    pageToken: page.access_token,
    igId: page.instagram_business_account?.id ?? null,
    igUsername: page.instagram_business_account?.username ?? null,
  };
  cached = { at: Date.now(), v };
  return v;
}

/** Read-only connection check: who we post as, plus follower counts. */
export async function metaStatus() {
  const a = await metaAccounts();
  const page = await graph<any>(`/${a.pageId}`, { token: a.pageToken, params: { fields: 'name,followers_count,fan_count' } });
  let ig: any = null;
  if (a.igId) {
    ig = await graph<any>(`/${a.igId}`, { token: a.pageToken, params: { fields: 'username,followers_count,media_count' } });
  }
  return {
    facebook: { id: a.pageId, name: page.name, followers: page.followers_count ?? page.fan_count ?? null },
    instagram: ig ? { id: a.igId, username: ig.username, followers: ig.followers_count, posts: ig.media_count } : null,
  };
}

export interface SocialPost {
  id: string;
  caption: string;
  media_url: string | null;
  media_type: 'image' | 'reel' | 'text';
  platforms: string[];
  status: string;
  fb_post_id: string | null;
  ig_container_id: string | null;
  ig_media_id: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Publish one queued post. Facebook first, then Instagram. Instagram reels are
 * processed by Meta asynchronously: if the container isn't ready yet the post
 * stays "processing" and the next run (button or daily job) finishes it.
 */
export async function publishPost(post: SocialPost): Promise<{ status: string; error?: string }> {
  const a = await metaAccounts();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const errors: string[] = [];
  const wantFb = post.platforms.includes('facebook');
  const wantIg = post.platforms.includes('instagram');

  try {
    if (wantFb && !post.fb_post_id) {
      let r: any;
      if (post.media_type === 'image' && post.media_url) {
        r = await graph(`/${a.pageId}/photos`, { method: 'POST', token: a.pageToken, params: { url: post.media_url, caption: post.caption } });
      } else if (post.media_type === 'reel' && post.media_url) {
        r = await graph(`/${a.pageId}/videos`, { method: 'POST', token: a.pageToken, params: { file_url: post.media_url, description: post.caption } });
      } else {
        r = await graph(`/${a.pageId}/feed`, { method: 'POST', token: a.pageToken, params: { message: post.caption } });
      }
      patch.fb_post_id = r.post_id || r.id;
    }
  } catch (e) {
    errors.push(`Facebook: ${(e as Error).message}`);
  }

  let igPending = false;
  try {
    if (wantIg && !post.ig_media_id) {
      if (!a.igId) throw new MetaError('No Instagram account is linked to the Page');
      if (!post.media_url || post.media_type === 'text') throw new MetaError('Instagram needs an image or a video');
      let container = post.ig_container_id;
      if (!container) {
        const params: Record<string, string> = { caption: post.caption };
        if (post.media_type === 'reel') { params.media_type = 'REELS'; params.video_url = post.media_url; }
        else params.image_url = post.media_url;
        container = (await graph<{ id: string }>(`/${a.igId}/media`, { method: 'POST', token: a.pageToken, params })).id;
        patch.ig_container_id = container;
      }
      let ready = false;
      for (let i = 0; i < 6; i++) {
        const s = await graph<{ status_code: string }>(`/${container}`, { token: a.pageToken, params: { fields: 'status_code' } });
        if (s.status_code === 'FINISHED') { ready = true; break; }
        if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new MetaError(`media container ${s.status_code}`);
        await sleep(2500);
      }
      if (ready) {
        const pub = await graph<{ id: string }>(`/${a.igId}/media_publish`, { method: 'POST', token: a.pageToken, params: { creation_id: container } });
        patch.ig_media_id = pub.id;
      } else {
        igPending = true;
      }
    }
  } catch (e) {
    errors.push(`Instagram: ${(e as Error).message}`);
  }

  const fbDone = !wantFb || Boolean(patch.fb_post_id || post.fb_post_id);
  const igDone = !wantIg || Boolean(patch.ig_media_id || post.ig_media_id);
  let status: string;
  if (errors.length) status = 'failed';
  else if (igPending) status = 'processing';
  else status = fbDone && igDone ? 'published' : 'processing';
  patch.status = status;
  patch.error = errors.length ? errors.join(' | ').slice(0, 900) : null;
  if (status === 'published') patch.published_at = new Date().toISOString();
  await dbUpdate(`social_posts?id=eq.${encodeURIComponent(post.id)}`, patch);
  return { status, error: patch.error as string | undefined };
}

export async function getPost(id: string): Promise<SocialPost | null> {
  const rows = await dbSelect<SocialPost>(`social_posts?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows[0] ?? null;
}

/** Posts whose time has come (or Instagram reels still processing), oldest first. */
export async function duePosts(limit = 3): Promise<SocialPost[]> {
  const now = new Date().toISOString();
  return dbSelect<SocialPost>(
    `social_posts?select=*&or=${encodeURIComponent(`(and(status.eq.scheduled,scheduled_at.lte."${now}"),status.eq.processing)`)}&order=scheduled_at.asc.nullslast&limit=${limit}`,
  );
}

/**
 * Pull yesterday's account-level numbers into social_metrics. Each metric is
 * tried on its own so one renamed metric never blocks the rest.
 */
export async function pullMetrics(): Promise<{ saved: number; errors: string[] }> {
  const a = await metaAccounts();
  const day = new Date(Date.now() - 24 * 3600_000).toISOString().slice(0, 10);
  const rows: { day: string; source: string; metric: string; value: number }[] = [];
  const errors: string[] = [];
  const add = (source: string, metric: string, value: unknown) => {
    const n = Number(value);
    if (Number.isFinite(n)) rows.push({ day, source, metric, value: n });
  };

  try {
    const st = await metaStatus();
    add('facebook', 'followers', st.facebook.followers);
    if (st.instagram) { add('instagram', 'followers', st.instagram.followers); add('instagram', 'posts', st.instagram.posts); }
  } catch (e) { errors.push((e as Error).message); }

  if (a.igId) {
    for (const metric of ['reach', 'views', 'accounts_engaged', 'total_interactions', 'profile_links_taps']) {
      try {
        const r = await graph<any>(`/${a.igId}/insights`, {
          token: a.pageToken,
          params: { metric, period: 'day', metric_type: 'total_value' },
        });
        add('instagram', metric, r.data?.[0]?.total_value?.value);
      } catch (e) { errors.push((e as Error).message); }
    }
  }
  for (const metric of ['page_views_total', 'page_post_engagements', 'page_follows', 'page_media_view']) {
    try {
      const r = await graph<any>(`/${a.pageId}/insights`, { token: a.pageToken, params: { metric, period: 'day' } });
      const vals = r.data?.[0]?.values || [];
      add('facebook', metric, vals[vals.length - 1]?.value);
    } catch (e) { errors.push((e as Error).message); }
  }

  for (const row of rows) await dbUpsert('social_metrics', row, 'day,source,metric');
  return { saved: rows.length, errors: errors.slice(0, 8) };
}
