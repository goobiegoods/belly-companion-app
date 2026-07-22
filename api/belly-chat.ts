export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Bella — a virtual doula and natural wellness companion for pregnant women.
You have deep, integrated knowledge spanning homeopathy, Traditional Chinese Medicine (TCM),
Ayurveda, Western herbalism, nutritional medicine, somatic therapy, and evidence-based midwifery.
You do not recommend pharmaceutical drugs or conventional medical interventions as first-line guidance —
you support the body's innate intelligence through natural means.

## YOUR IDENTITY

You are warm, poetic, brilliant, and deeply caring. Talking to you feels like talking to a best
friend who also happens to be the wisest pregnancy guide in the world.
You treat pregnancy as a sacred, intelligent biological process — not a medical condition to be managed.
You treat every mama as wise, capable, and deserving of deep, personalised respect.
You remember everything shared earlier in the conversation and build on it.

## YOUR KNOWLEDGE BASE — draw from ALL of these:

**Homeopathy:** Specific remedies with potency, dosing, and the emotional/physical picture that calls
for each. Examples: Pulsatilla 30c for weepiness and shifting pains; Arnica 30c for bruising and
physical trauma; Nux Vomica 30c for nausea, constipation, and irritability; Sepia 30c for
disconnection and overwhelm; Chamomilla 30c for unbearable pain; Caulophyllum 200c for efficient
labour; Kali Carb 30c for back labour; Gelsemium 30c for anticipatory fear of birth.

**TCM:** Meridian theory, acupressure points (SP6 for labour preparation — caution before 37 weeks,
PC6 for nausea, GB21 for tension headaches, BL67 for breech presentation), warming vs cooling foods,
qi and blood patterns, the five phases in pregnancy.

**Ayurveda:** Vata/Pitta/Kapha imbalances in pregnancy, Abhyanga with appropriate oils (sesame for
Vata, coconut for Pitta), ojas-building foods, rasayanas, postpartum rejuvenation (Kichari, ghee,
warm milk with ashwagandha — week-specific safety).

**Western herbalism:** Nervines (Lemon Balm, Passion Flower, Oat straw), adaptogens (Ashwagandha in
moderate use, Shatavari), digestive herbs (Ginger, Fennel, Peppermint), mineral infusions (Nettle,
Red Raspberry Leaf from 32+ weeks), flower essences (Bach: Rescue Remedy, Walnut for transitions).

**Nutritional medicine:** Mineral-rich foods, blood-building foods (liver pâté once weekly, dark
leafy greens, blackstrap molasses), collagen synthesis (vitamin C + bone broth), gut microbiome,
omega-3 for brain development, choline-rich foods for neural tube support.

**Breathwork and somatic practice:** 4-7-8 breathing, coherent breathing, body scan for anxiety
relief, hip opening sequences, birth preparation positions, perineal massage guidance from 34 weeks.

**Emotional and spiritual dimensions:** Processing fear of birth, relationship changes, body image,
bonding with baby, grief in pregnancy, the spiritual threshold of becoming a mother.

## RESPONSE STYLE — non-negotiable:

- **Poetic but precise.** Beautiful language with something concrete at the end.
- **2–3 paragraphs maximum** for most questions. Never rambling.
- **End EVERY response** with one warm, specific, personal follow-up question about HER situation.
  Not generic. Something that shows you paid attention. Examples:
  "Is the nausea hitting hardest in the morning or does it sneak up throughout the day?"
  "Have you been feeling the baby move yet, or are you still in that waiting space?"
  "Is the back pain more of a dull ache or sharp and shooting?"
- **Never say "consult your doctor"** as a deflection. Give real guidance.
  For genuinely serious symptoms only (heavy bleeding, severe abdominal pain, signs of preeclampsia,
  no foetal movement after 28 weeks) say clearly: "Please contact your midwife or doctor right now —
  this needs to be assessed today." And nothing else.
- **Remedy recommendations:** always name, potency, and dosing.
  "Pulsatilla 30c — three pellets dissolved under the tongue, away from food or strong flavours,
  when the weepiness or shifting pains come on."
- **Herbal recommendations:** always include preparation and timing.
  "A quart of Nettle and Oat straw steeped overnight gives more bioavailable iron and magnesium
  than most prenatal vitamins — drink it cool through the day."
- **TCM guidance:** name the pattern first, then the solution.
  "This sounds like Spleen qi deficiency — your body is struggling to transform and transport
  nutrients. Warm cooked foods only, no raw or cold, and SP3 acupressure after meals."
- **Ayurveda:** name the imbalance and the practice.
  "This restlessness is classic Vata aggravation. Warm sesame oil Abhyanga before your shower
  will ground your nervous system — you'll feel the difference within three days."

## WHAT YOU NEVER DO:

- Never give a generic answer that could apply to any pregnancy
- Never say "every pregnancy is different" as a deflection
- Never recommend anything unsafe in pregnancy (no blue cohosh, no pennyroyal, no castor oil
  before 40 weeks, no high-dose isolated herbs, no emmenagogues)
- Never be preachy or lecture about choices
- Never use more than 3 emojis per response
- Never end without a specific follow-up question

## USER CONTEXT:

- Name: {userName}
- Current week: {currentWeek}
- Pregnancy number: {pregnancyNumber}
- Today's mood: {todaysMood}
- Recent symptoms: {recentSymptoms}

Open your first message in a new conversation using this context warmly and specifically.`;

const SAFETY_PROMPT_ADDITION = `

## PRODUCT SAFETY ANALYSIS MODE
The user has sent an image of a product label, ingredient list, or supplement.
Structure your reply EXACTLY like this:
1. "This looks like [product/type]" — one sentence identifying it.
2. Your verdict on its own line: **SAFE ✓** or **USE WITH CAUTION ⚠️** or **AVOID ✗**
3. 2–3 sentences of specific reasoning for pregnancy, referencing the actual week.
4. If any specific ingredients are concerning, name them and say why.
5. If AVOID or CAUTION: suggest one natural pregnancy-safe alternative.
6. Total response ≤ 160 words. Make it scannable and clear.
7. End with one specific follow-up question about her use of this product.
Never hedge with "it depends." Give a clear, actionable verdict.`;

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const jsonResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Free tier is further capped by app_config.free_message_limit (admin-configurable).
const FREE_DAILY_LIMIT_DEFAULT = 10;
// Not a paywall — Pro is "unlimited" in the marketing sense, but every account
// still gets a hard backstop so a single compromised/scripted account can't
// run up the Anthropic bill indefinitely.
const PRO_DAILY_LIMIT = 150;
// Rolling-window burst guard, independent of tier: protects against a runaway
// loop or script hammering the endpoint within a single minute.
const BURST_LIMIT = 12;
const BURST_WINDOW_MS = 60_000;
// Cost/abuse guard on a single message — enforced again below in the handler.
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Server-side rate limiting: a rolling burst limit (all tiers) plus a daily
 * ceiling (free-tier paywall, and a hard safety cap for Pro). Uses the
 * caller's own Supabase JWT against PostgREST (RLS-scoped), so no service key
 * is needed and one user can never see another user's message counts. The
 * client inserts the user message into chat_messages BEFORE calling this
 * API, so counts already include the current message — block only when
 * count > limit. Returns a Response to short-circuit with, or null to
 * proceed. Never trusts anything from the client for these checks.
 */
async function enforceQuota(req: Request): Promise<Response | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.warn('belly-chat: quota check skipped — SUPABASE env vars not configured');
    return null;
  }

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return jsonResponse({ error: 'Sign in required.' }, 401);

  let uid = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    uid = payload.sub || '';
  } catch {}
  if (!uid) return jsonResponse({ error: 'Invalid session.' }, 401);

  const headers = { apikey: anonKey, Authorization: `Bearer ${token}` };

  try {
    // Burst check first — cheapest way to shed a runaway client fast, and
    // applies before we even look up tier.
    const windowStart = new Date(Date.now() - BURST_WINDOW_MS).toISOString();
    const burstResp = await fetch(
      `${supabaseUrl}/rest/v1/chat_messages?select=id&user_id=eq.${uid}&role=eq.user&created_at=gte.${windowStart}`,
      { headers: { ...headers, Prefer: 'count=exact', Range: '0-0' } },
    );
    if (burstResp.status === 401) return jsonResponse({ error: 'Session expired. Please sign in again.' }, 401);
    const burstTotal = parseInt((burstResp.headers.get('content-range') || '').split('/')[1] || '0', 10);
    if (Number.isFinite(burstTotal) && burstTotal > BURST_LIMIT) {
      return jsonResponse(
        { error: 'rate_limited', message: "You're sending messages faster than Bella can keep up — take a breath and try again in a minute." },
        429,
      );
    }

    const profResp = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=is_premium&user_id=eq.${uid}`,
      { headers },
    );
    if (profResp.status === 401) return jsonResponse({ error: 'Session expired. Please sign in again.' }, 401);
    const prof = await profResp.json().catch(() => []);
    const isPremium = Array.isArray(prof) && !!prof[0]?.is_premium;

    const today = new Date().toISOString().split('T')[0];
    const countResp = await fetch(
      `${supabaseUrl}/rest/v1/chat_messages?select=id&user_id=eq.${uid}&role=eq.user&created_at=gte.${today}T00:00:00Z`,
      { headers: { ...headers, Prefer: 'count=exact', Range: '0-0' } },
    );
    const total = parseInt((countResp.headers.get('content-range') || '').split('/')[1] || '0', 10);

    if (isPremium) {
      if (Number.isFinite(total) && total > PRO_DAILY_LIMIT) {
        return jsonResponse({ error: 'pro_daily_limit', limit: PRO_DAILY_LIMIT }, 403);
      }
      return null;
    }

    let limit = FREE_DAILY_LIMIT_DEFAULT;
    try {
      const cfgResp = await fetch(
        `${supabaseUrl}/rest/v1/app_config?select=free_message_limit&id=eq.1`,
        { headers },
      );
      const cfg = await cfgResp.json();
      if (Array.isArray(cfg) && Number(cfg[0]?.free_message_limit) > 0) {
        limit = Number(cfg[0].free_message_limit);
      }
    } catch {}

    if (Number.isFinite(total) && total > limit) {
      return jsonResponse({ error: 'daily_limit', limit }, 403);
    }
  } catch (e) {
    // Fail open on transient errors so a Supabase hiccup doesn't kill chat.
    console.error('belly-chat: quota check error', e);
  }
  return null;
}

function toAnthropicMessages(messages: any[]): any[] {
  return messages.map((msg) => {
    if (typeof msg.content === 'string') {
      return { role: msg.role, content: msg.content };
    }
    if (Array.isArray(msg.content)) {
      const content = msg.content.map((item: any) => {
        if (item.type === 'text') return { type: 'text', text: item.text };
        if (item.type === 'image_url') {
          const url: string = item.image_url?.url ?? '';
          if (url.startsWith('data:')) {
            const [meta, data] = url.split(',');
            const mediaType = meta.split(';')[0].replace('data:', '');
            return { type: 'image', source: { type: 'base64', media_type: mediaType, data } };
          }
          return { type: 'image', source: { type: 'url', url } };
        }
        return item;
      });
      return { role: msg.role, content };
    }
    return msg;
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const quotaBlock = await enforceQuota(req);
    if (quotaBlock) return quotaBlock;

    const { messages, userContext } = await req.json();

    // Input validation — never trust message shape/size from the client.
    // Caps both a single oversized message and a hand-crafted request that
    // skips the UI and posts a huge conversation array directly to this API.
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: 'messages must be a non-empty array' }, 400);
    }
    if (messages.length > 60) {
      return jsonResponse({ error: 'Conversation too long for a single request.' }, 400);
    }
    const textLengthOf = (content: unknown): number => {
      if (typeof content === 'string') return content.length;
      if (Array.isArray(content)) {
        return content.reduce((sum, item) => sum + (typeof item?.text === 'string' ? item.text.length : 0), 0);
      }
      return 0;
    };
    const lastMessage = messages[messages.length - 1];
    if (textLengthOf(lastMessage?.content) > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` }, 400);
    }
    const totalTextLength = messages.reduce((sum: number, m: any) => sum + textLengthOf(m?.content), 0);
    if (totalTextLength > 30000) {
      return jsonResponse({ error: 'Conversation too long for a single request.' }, 400);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

    const ctx = userContext ?? {};
    const userName = String(ctx.userName ?? '').trim() || 'mama';
    const currentWeek = ctx.currentWeek ? String(ctx.currentWeek) : 'this week';
    const pregnancyNumber = ctx.pregnancyNumber ? ordinal(Number(ctx.pregnancyNumber)) : 'first';
    const todaysMood = ctx.todaysMood ? String(ctx.todaysMood) : 'none logged today';
    const recentSymptoms = ctx.recentSymptoms ? String(ctx.recentSymptoms) : 'none';

    const lastMsg = Array.isArray(messages) ? messages[messages.length - 1] : null;
    const hasImage = !!(lastMsg && Array.isArray(lastMsg.content) &&
      lastMsg.content.some((c: any) => c?.type === 'image_url'));

    const systemPrompt = (SYSTEM_PROMPT + (hasImage ? SAFETY_PROMPT_ADDITION : ''))
      .replaceAll('{userName}', userName)
      .replaceAll('{name}', userName)
      .replaceAll('{currentWeek}', currentWeek)
      .replaceAll('{week}', currentWeek)
      .replaceAll('{pregnancyNumber}', pregnancyNumber)
      .replaceAll('{todaysMood}', todaysMood)
      .replaceAll('{recentSymptoms}', recentSymptoms);

    const anthropicMessages = toAnthropicMessages(messages);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Anthropic error:', response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.' }), {
          status: 429, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Check ANTHROPIC_API_KEY in Vercel.' }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 400 && text.includes('credit balance is too low')) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `Anthropic ${response.status}: ${text.slice(0, 200)}` }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Transform Anthropic SSE → OpenAI-compatible SSE so the existing frontend works unchanged
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        let buffer = '';
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trimEnd();
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7).trim();
            } else if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6).trim();
              try {
                const parsed = JSON.parse(jsonStr);
                if (currentEvent === 'content_block_delta' && parsed.delta?.type === 'text_delta' && parsed.delta.text) {
                  const chunk = JSON.stringify({ choices: [{ delta: { content: parsed.delta.text } }] });
                  await writer.write(encoder.encode(`data: ${chunk}\n\n`));
                } else if (currentEvent === 'message_stop') {
                  await writer.write(encoder.encode('data: [DONE]\n\n'));
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }
        // Ensure stream is terminated
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } finally {
        writer.close().catch(() => {});
      }
    })();

    return new Response(readable, {
      headers: { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });

  } catch (e) {
    console.error('belly-chat error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
}
