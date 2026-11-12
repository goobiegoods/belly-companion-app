/**
 * Belly's marketing + retention email design system.
 *
 * One layout (`layout`) and a set of templates built from it. Table-based with
 * inline styles so it renders the same in Gmail, Apple Mail and Outlook.
 * Every marketing email carries an unsubscribe link and the postal address
 * (CAN-SPAM). No pregnancy-stage data ever leaves this server except inside
 * the user's own email.
 */

const C = {
  night: '#150A1F',
  paper: '#FFFAF4',      // bright reading card
  cream: '#FBEEE0',
  ink: '#1E1428',
  body: '#3B2F45',
  dim: '#7A6D84',
  gold: '#F2B647',
  ember: '#E8622E',
  teal: '#2C9C8F',
  line: '#EFE3D3',
  faint: 'rgba(251,238,224,.55)',
};
const SANS = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "Fraunces,Georgia,'Times New Roman',serif";
const MONO = "'JetBrains Mono',ui-monospace,Menlo,monospace";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
/** *word* in a headline becomes the one gold italic accent word. */
const accent = (s: string, color: string) =>
  esc(s).replace(/\*(.+?)\*/g, `<em style="font-style:italic;color:${color}">$1</em>`);

export interface Feature { icon: string; title: string; text: string }
export interface EmailParts {
  preheader: string;      // inbox preview line
  icon: string;           // kept for compatibility; the Golden Hour design uses Bella's orb instead
  eyebrow?: string;       // small mono label above the headline
  headline: string;       // wrap one word in *stars* for the gold italic accent
  paragraphs: string[];
  features?: Feature[];   // rendered as numbered 01/02/03 rows
  cta?: { label: string; url: string };
  note?: string;          // small boxed note (plan terms, receipt, etc.)
  signoff?: boolean;      // "— Bella"
  footer: { reason: string; unsubscribeUrl?: string; address?: string };
}

/**
 * The Belly master email (Golden Hour). Night header with glow and Bella's orb,
 * then a bright paper card for easy reading. Every Belly email uses this.
 */
export function layout(p: EmailParts): string {
  const para = p.paragraphs
    .map((t) => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${C.body}">${esc(t)}</p>`)
    .join('');
  const rows = (p.features || [])
    .map(
      (f, i) => `<tr><td style="padding:14px 0;border-top:1px solid ${C.line}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="44" valign="top" style="font-family:${MONO};font-size:13px;font-weight:700;color:${C.ember};padding-top:2px">${String(i + 1).padStart(2, '0')}</td>
<td valign="top" style="font-family:${SANS}"><div style="font-family:${SERIF};font-size:18px;color:${C.ink};padding-bottom:3px">${esc(f.title)}</div><div style="font-size:14.5px;line-height:1.55;color:${C.body}">${esc(f.text)}</div></td>
</tr></table></td></tr>`,
    )
    .join('');
  const cta = p.cta
    ? `<tr><td align="center" style="padding:20px 0 4px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="${C.night}" style="border-radius:999px;box-shadow:0 10px 24px rgba(21,10,31,.25)">
<a href="${esc(p.cta.url)}" style="display:inline-block;padding:17px 34px;font-family:${SANS};font-size:16px;font-weight:600;color:${C.cream};text-decoration:none;border-radius:999px">${esc(p.cta.label)} <span style="color:${C.gold}">&rarr;</span></a></td></tr></table></td></tr>`
    : '';
  const note = p.note
    ? `<tr><td style="padding:22px 0 0"><div style="background:#FBF3E8;border:1px dashed #E7D3B8;border-radius:14px;padding:14px 16px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body}">${p.note}</div></td></tr>`
    : '';
  const signoff = p.signoff
    ? `<tr><td style="padding:24px 0 0;font-family:${SERIF};font-size:19px;font-style:italic;color:${C.ember}">&mdash; Bella</td></tr>`
    : '';
  const unsub = p.footer.unsubscribeUrl
    ? ` &middot; <a href="${esc(p.footer.unsubscribeUrl)}" style="color:${C.faint};text-decoration:underline">Unsubscribe</a>`
    : '';
  const orb = `<div style="width:46px;height:46px;border-radius:50%;background:${C.gold};background-image:radial-gradient(circle at 35% 30%,#FFE7A8 0%,#F2B647 30%,#E8622E 72%,#B5386B 100%);box-shadow:0 0 28px rgba(242,182,71,.6)">&nbsp;</div>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(p.headline.replace(/\*/g, ''))}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Inter:wght@400;600&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${C.night}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(p.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.night}" style="background:${C.night}"><tr><td align="center" style="padding:24px 12px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td bgcolor="${C.night}" style="background:${C.night};background-image:radial-gradient(60% 80% at 8% 0%,rgba(44,156,143,.55),transparent 70%),radial-gradient(55% 80% at 100% 30%,rgba(181,56,107,.55),transparent 70%),radial-gradient(70% 70% at 60% 120%,rgba(232,98,46,.45),transparent 70%);border-radius:28px 28px 0 0;padding:30px 30px 74px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" width="58">${orb}</td>
<td valign="middle" style="font-family:${SERIF};font-size:26px;font-style:italic;color:${C.cream}"><a href="https://meetbelly.com" style="color:${C.cream};text-decoration:none">belly</a></td>
<td valign="middle" align="right" style="font-family:${MONO};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.gold}">${esc(p.eyebrow || 'From Bella')}</td>
</tr></table>
<h1 style="margin:34px 0 0;font-family:${SERIF};font-size:38px;line-height:1.08;font-weight:normal;color:${C.cream};letter-spacing:-.3px">${accent(p.headline, C.gold)}</h1>
</td></tr>
<tr><td style="padding:0 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.paper}" style="background:${C.paper};border-radius:22px;margin-top:-50px;box-shadow:0 30px 60px rgba(0,0,0,.35)"><tr><td style="padding:30px 26px 30px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>${para}</td></tr>
${rows}${cta}${note}${signoff}
</table></td></tr></table></td></tr>
<tr><td align="center" style="padding:28px 18px 0;font-family:${SANS};font-size:11.5px;line-height:1.7;color:${C.faint}">
<div style="font-family:${MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.gold};padding-bottom:8px">A doula who is awake at 3am</div>
${esc(p.footer.reason)}${unsub}<br>
Belly${p.footer.address ? ` &middot; ${esc(p.footer.address)}` : ''} &middot; <a href="mailto:hello@meetbelly.com" style="color:${C.faint}">hello@meetbelly.com</a> &middot; @bellycircle
</td></tr>
</table></td></tr></table></body></html>`;
}

/** Plain-text twin for every email (spam filters and screen readers like it). */
export function plain(p: EmailParts): string {
  const lines = [p.headline.replace(/\*/g, ''), '', ...p.paragraphs.flatMap((x) => [x, ''])];
  for (const f of p.features || []) lines.push(`• ${f.title}: ${f.text}`);
  if (p.features?.length) lines.push('');
  if (p.cta) lines.push(`${p.cta.label}: ${p.cta.url}`, '');
  if (p.note) lines.push(p.note.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''), '');
  if (p.signoff) lines.push('— Bella', '');
  lines.push(p.footer.reason);
  if (p.footer.unsubscribeUrl) lines.push(`Unsubscribe: ${p.footer.unsubscribeUrl}`);
  lines.push(`Belly${p.footer.address ? ` · ${p.footer.address}` : ''} · hello@meetbelly.com`);
  return lines.join('\n');
}

export interface Built { subject: string; html: string; text: string }
const build = (subject: string, p: EmailParts): Built => ({ subject, html: layout(p), text: plain(p) });

export interface Ctx {
  appUrl: string;        // https://app.meetbelly.com
  landingUrl: string;    // https://meetbelly.com
  unsubscribeUrl: string;
  address: string;
}
const utm = (url: string, campaign: string) =>
  `${url}${url.includes('?') ? '&' : '?'}utm_source=email&utm_medium=lifecycle&utm_campaign=${campaign}`;

// ------------------------------------------------------------------ templates

/** Left checkout without starting the trial. Sent once, ~2h later. */
export function recovery(ctx: Ctx, trialDays = 7): Built {
  const days = trialDays > 0 ? trialDays : 7;
  return build(`I saved your spot, mama`, {
    preheader: `Your first ${days} days are on us, whenever you're ready.`,
    icon: '🤍',
    eyebrow: 'A note from Bella',
    headline: 'I saved your *spot*',
    paragraphs: [
      "You were one tap away from joining us. No pressure at all, just a gentle nudge in case life (or nausea, or a nap) got in the way.",
      `Your first ${days} days are on us. Here's what's waiting for you:`,
    ],
    features: [
      { icon: '💬', title: 'Me, day and night', text: 'Bring me the 3am questions. I answer gently, without judgment.' },
      { icon: '📅', title: 'Your week, explained', text: "What's happening with your body and baby, in plain words." },
      { icon: '🎓', title: 'Courses and the Mamas circle', text: 'Bite-size lessons, plus mamas going through it with you.' },
    ],
    cta: { label: 'Begin your first 7 days', url: utm(`${ctx.landingUrl}/?s=offer`, 'checkout_recovery') },
    note: `Your first ${days} days are on us, then $89/year. Cancel anytime before the trial ends and you pay nothing.`,
    signoff: true,
    footer: { reason: "You're getting this one-time reminder because you started a checkout at meetbelly.com.", unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}

/** Welcome series, day 1: get them talking to Bella. */
export function welcomeDay1(ctx: Ctx, firstName?: string): Built {
  return build("Bring me your 3am questions", {
    preheader: "The best way to begin: ask me anything, even the questions that feel silly.",
    icon: '🌙',
    eyebrow: 'Day 1 together',
    headline: firstName ? `Hi ${firstName}, it's *Bella*` : "Hi mama, it's *Bella*",
    paragraphs: [
      "I'm so happy you're here. Most mamas tell me Belly clicked the first time they asked me something they felt silly asking anyone else.",
      'Try one of these, or ask me your own:',
    ],
    features: [
      { icon: '🍋', title: '"Is this much nausea normal?"', text: "I'll share gentle, practical ideas to get you through the day." },
      { icon: '🛏️', title: '"How do I sleep with this bump?"', text: 'Positions, pillows and wind-down rituals.' },
      { icon: '📝', title: '"What should I ask at my next appointment?"', text: "We'll make your list together." },
    ],
    cta: { label: 'Ask me now', url: utm(`${ctx.appUrl}/ask`, 'welcome_d1') },
    note: `<b style="color:${C.gold}">New here?</b> <a href="${esc(utm(`${ctx.appUrl}/tour`, 'welcome_d1_tour'))}" style="color:${C.cream}">Take the 1-minute tour of everything inside Belly &rarr;</a>`,
    signoff: true,
    footer: { reason: "You're getting this because you joined Belly.", unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}

/** Welcome series, day 3: show the rest of the app. */
export function welcomeDay3(ctx: Ctx): Built {
  return build('3 things I want you to find', {
    preheader: 'Most mamas miss the second one in their first week.',
    icon: '✨',
    eyebrow: 'Day 3 together',
    headline: '3 things I want you to *find*',
    paragraphs: ["We've had a few days together now. Here are the corners of Belly mamas come back to again and again:"],
    features: [
      { icon: '📅', title: 'Your week, explained', text: "Open Today to see what's happening this week, for you and baby." },
      { icon: '🎓', title: 'Short courses', text: 'Trimester guides, sleep, birth plans and labor, in bite-size lessons.' },
      { icon: '🫶', title: 'The Mamas circle', text: 'Ask, vent and celebrate with mamas going through it too.' },
    ],
    cta: { label: 'See everything inside Belly', url: utm(`${ctx.appUrl}/tour`, 'welcome_d3') },
    signoff: true,
    footer: { reason: "You're getting this because you joined Belly.", unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}

/**
 * Trial ending in 3 days. Account notice (auto-renewal reminder), so it goes out
 * even to people who unsubscribed from marketing.
 */
export function trialEnding(ctx: Ctx, opts: { endsOn: string; price: string; interval: string }): Built {
  return build('Three more days of our first week, mama', {
    preheader: `Your first 7 days are on us. On ${opts.endsOn}, your membership begins at ${opts.price}/${opts.interval}.`,
    icon: '✨',
    eyebrow: 'A note from Bella',
    headline: "I've loved this week with *you*",
    paragraphs: [
      "Your first 7 days are on us, and I've loved every question you've brought me, the big ones and the 3am ones. That's exactly what I'm here for.",
      `On ${opts.endsOn}, our week together becomes your Belly membership at ${opts.price} a ${opts.interval}, so I stay right here with you, along with your courses and your circle of mamas. You don't need to do a thing.`,
    ],
    cta: { label: 'Keep going together', url: utm(`${ctx.appUrl}/`, 'trial_ending') },
    note: `<b style="color:${C.gold}">If now isn't the right time,</b> that's okay too. Cancel anytime before ${esc(opts.endsOn)} in the app: Me &rarr; Manage &rarr; Cancel, and you won't be charged.`,
    signoff: true,
    footer: { reason: "This is an account notice about your Belly membership's renewal." },
  });
}

/** Cancelled: one warm win-back, ~7 days later. */
export function winback(ctx: Ctx): Built {
  return build("I'm still here, mama", {
    preheader: "Whenever you want me back, your spot is waiting.",
    icon: '🏡',
    eyebrow: 'A note from Bella',
    headline: "I'm still here whenever you *need* me",
    paragraphs: [
      "Your membership ended, and that's completely okay. This season asks a lot of you, and you get to choose what helps.",
      "If you ever want me back for a 3am question, a lesson before the big day, or just the mamas who get it, everything is right where you left it.",
    ],
    cta: { label: 'Come back to Belly', url: utm(`${ctx.appUrl}/`, 'winback') },
    signoff: true,
    footer: { reason: "You're getting this because you were a Belly member.", unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}

/** Weekly bump letter. `highlights` come from the app's own week content. */
export function weekly(ctx: Ctx, opts: { week: number; size?: string; highlights: Feature[] }): Built {
  return build(`Week ${opts.week}: what's happening this week`, {
    preheader: opts.size ? `Baby is about the size of ${opts.size} this week.` : `Your week ${opts.week} letter from Bella.`,
    icon: '🌸',
    eyebrow: `Week ${opts.week}`,
    headline: opts.size ? `About the size of *${opts.size}*` : `Your week *${opts.week}* letter`,
    paragraphs: ["Here's my gentle guide to your week. Grab some tea, mama."],
    features: opts.highlights,
    cta: { label: 'Read this week with me', url: utm(`${ctx.appUrl}/`, `weekly_w${opts.week}`) },
    signoff: true,
    footer: { reason: 'You\'re getting your weekly letter because you\'re a Belly member.', unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}
