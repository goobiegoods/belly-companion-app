/**
 * Comment triage: who is a potential Belly customer vs. noise.
 *
 *  lead    - pregnant / trying / postpartum signals, a question, a worry,
 *            or asking about the app. Reply first, with a soft invite.
 *  chatter - real engagement (jokes, "same!") but no buying signal. Quick reply if time.
 *  tag     - just tagging a friend ("Tyler Holden", "@sam"). Never reply.
 */
export type Intent = 'lead' | 'chatter' | 'tag';

const PREGNANT =
  /\b(\d{1,2}\s*(weeks?|wks?|w)\b|\d{1,2}w\d|weeks? (along|pregnant)|(first|second|third|1st|2nd|3rd)\s+(tri|trimester)|trimester|(i'?m|i am|am|my|me|currently|still|now)\s+(\w+\s+)?(pregnant|pregnancy|expecting)|due (in|date|on|this|next)|due\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*|ttc|trying to conceive|bump|ftm|first[- ]time mom|baby #?\d|rainbow baby|postpartum|newborn|ob\b|obgyn|midwife|doula|ultrasound|scan|gender reveal|hyperemesis|contractions|c-?section|induc\w*)/i;
const TOPIC = /\b(pregnan\w*|expecting|morning sickness|nause\w*|heartburn|labou?r|cravings?)\b/i;
const NEED =
  /\b(help|advice|anyone else|is (it|this) normal|normal\?|scared|anxious|anxiety|worried|nervous|overwhelm\w*|can'?t sleep|insomnia|tips?|what (do|should|helps?)|how (do|did|can|long)|recommend)/i;
const APP = /\b(app|link|sign ?up|free trial|download|how much|price|cost|where (do|can) i|belly app|subscribe)\b/i;
const MONTH_ONLY = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b[\s!.💛❤️🤍🩷💙💗✨🤰👶]*$/i;

/** "Tyler Holden", "Gloria Randolph", "@sam_k @jo" - a mention, not a message. */
function isTag(t: string): boolean {
  const s = t.trim();
  if (!s) return true;
  const words = s.replace(/[\p{Extended_Pictographic}️‍]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length && words.every((w) => w.startsWith('@'))) return true;
  // 1-4 capitalised words, no punctuation beyond emoji = a tagged name
  if (words.length >= 1 && words.length <= 4 && words.every((w) => /^[A-Z][\p{Ll}'’.-]+$/u.test(w))) {
    // but a capitalised due month ("March!") is a lead, handled by caller
    return !MONTH_ONLY.test(s);
  }
  return false;
}

export function classify(text: string): { intent: Intent; score: number; why: string } {
  const t = (text || '').trim();
  if (MONTH_ONLY.test(t)) return { intent: 'lead', score: 70, why: 'shared due month' };
  if (isTag(t)) return { intent: 'tag', score: 0, why: 'tagged a friend' };
  let score = 0;
  const why: string[] = [];
  if (APP.test(t)) { score += 60; why.push('asked about the app'); }
  if (PREGNANT.test(t)) { score += 45; why.push('pregnancy signal'); }
  else if (TOPIC.test(t)) { score += 20; why.push('pregnancy topic'); }
  if (NEED.test(t)) { score += 30; why.push('needs help'); }
  if (t.includes('?')) { score += 15; why.push('question'); }
  if (/\b(me|i'?m|my|mine|i)\b/i.test(t) && score > 0) score += 5;
  if (score >= 40) return { intent: 'lead', score: Math.min(score, 100), why: why.join(', ') };
  return { intent: 'chatter', score, why: why.join(', ') || 'engagement' };
}
