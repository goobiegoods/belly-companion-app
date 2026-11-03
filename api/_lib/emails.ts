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
  bg: '#150A1F',
  card: '#221022',
  hero: '#3A1838',
  gold: '#F2B647',
  cream: '#FBEEE0',
  muted: 'rgba(251,238,224,.78)',
  faint: 'rgba(251,238,224,.5)',
  line: 'rgba(242,182,71,.25)',
};
const SANS = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface Feature { icon: string; title: string; text: string }
export interface EmailParts {
  preheader: string;      // inbox preview line
  icon: string;           // big emoji in the hero
  eyebrow?: string;       // small gold label above the headline
  headline: string;
  paragraphs: string[];
  features?: Feature[];
  cta?: { label: string; url: string };
  note?: string;          // small boxed note (plan terms, etc.)
  signoff?: boolean;      // "With love, Bella & the Belly team"
  footer: { reason: string; unsubscribeUrl?: string; address?: string };
}

export function layout(p: EmailParts): string {
  const para = p.paragraphs
    .map((t) => `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.muted}">${esc(t)}</p>`)
    .join('');
  const features = (p.features || [])
    .map(
      (f) => `<tr><td style="padding:0 0 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};border-radius:16px"><tr>
<td width="52" valign="top" style="padding:16px 0 16px 16px"><div style="width:40px;height:40px;line-height:40px;text-align:center;border-radius:12px;background:${C.hero};font-size:20px">${f.icon}</div></td>
<td valign="top" style="padding:16px 16px 16px 12px;font-family:${SANS}"><div style="font-size:15px;font-weight:600;color:${C.cream};padding-bottom:3px">${esc(f.title)}</div><div style="font-size:14px;line-height:1.5;color:${C.muted}">${esc(f.text)}</div></td>
</tr></table></td></tr>`,
    )
    .join('');
  const cta = p.cta
    ? `<tr><td align="center" style="padding:10px 0 6px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="${C.gold}" style="border-radius:999px">
<a href="${esc(p.cta.url)}" style="display:inline-block;padding:17px 40px;font-family:${SANS};font-size:16px;font-weight:700;color:${C.bg};text-decoration:none;border-radius:999px">${esc(p.cta.label)} &rarr;</a></td></tr></table></td></tr>`
    : '';
  const note = p.note
    ? `<tr><td style="padding:18px 0 0"><div style="border:1px solid ${C.line};border-radius:14px;padding:14px 16px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted}">${p.note}</div></td></tr>`
    : '';
  const signoff = p.signoff
    ? `<tr><td style="padding:26px 0 0;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.cream}">With love,<br><span style="color:${C.gold}">Bella</span> 💛</td></tr>`
    : '';
  const unsub = p.footer.unsubscribeUrl
    ? ` &middot; <a href="${esc(p.footer.unsubscribeUrl)}" style="color:${C.faint};text-decoration:underline">Unsubscribe</a>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(p.headline)}</title></head>
<body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(p.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg}"><tr><td align="center" style="padding:28px 14px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td align="center" style="padding:0 0 18px"><a href="https://meetbelly.com" style="text-decoration:none;font-family:${SERIF};font-size:34px;letter-spacing:.5px;color:${C.gold}">belly</a><div style="font-family:${SANS};font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${C.faint};padding-top:2px">your 24/7 virtual doula</div></td></tr>
<tr><td bgcolor="${C.hero}" style="background:${C.hero};background-image:linear-gradient(160deg,#4A1F45 0%,#2A1129 100%);border-radius:26px 26px 0 0;padding:34px 28px 26px" align="center">
<div style="width:76px;height:76px;line-height:76px;border-radius:50%;background:rgba(251,238,224,.1);border:1px solid ${C.line};font-size:38px;text-align:center">${p.icon}</div>
${p.eyebrow ? `<div style="font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.gold};padding-top:20px">${esc(p.eyebrow)}</div>` : ''}
<h1 style="margin:${p.eyebrow ? '8px' : '20px'} 0 0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:normal;color:${C.cream}">${esc(p.headline)}</h1>
</td></tr>
<tr><td bgcolor="${C.card}" style="background:${C.card};border-radius:0 0 26px 26px;padding:28px 26px 30px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>${para}</td></tr>
${features}${cta}${note}${signoff}
</table></td></tr>
<tr><td align="center" style="padding:24px 18px 0;font-family:${SANS};font-size:11.5px;line-height:1.6;color:${C.faint}">
Belly offers education and support, not medical advice. Always check with your provider.<br>
${esc(p.footer.reason)}${unsub}<br>
Belly${p.footer.address ? ` &middot; ${esc(p.footer.address)}` : ''} &middot; <a href="mailto:hello@meetbelly.com" style="color:${C.faint}">hello@meetbelly.com</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

/** Plain-text twin for every email (spam filters and screen readers like it). */
export function plain(p: EmailParts): string {
  const lines = [p.headline, '', ...p.paragraphs.flatMap((x) => [x, ''])];
  for (const f of p.features || []) lines.push(`• ${f.title}: ${f.text}`);
  if (p.features?.length) lines.push('');
  if (p.cta) lines.push(`${p.cta.label}: ${p.cta.url}`, '');
  if (p.note) lines.push(p.note.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''), '');
  if (p.signoff) lines.push('With love,', 'Bella', '');
  lines.push('Belly offers education and support, not medical advice.', p.footer.reason);
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
  return build(`I saved your spot, mama 💛`, {
    preheader: `Your first ${days} days are on us, whenever you're ready.`,
    icon: '🤍',
    eyebrow: 'A note from Bella',
    headline: 'I saved your spot',
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
  return build("Bring me your 3am questions 🌙", {
    preheader: "The best way to begin: ask me anything, even the questions that feel silly.",
    icon: '🌙',
    eyebrow: 'Day 1 together',
    headline: firstName ? `Hi ${firstName}, it's Bella` : "Hi mama, it's Bella",
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
  return build('3 things I want you to find 💛', {
    preheader: 'Most mamas miss the second one in their first week.',
    icon: '✨',
    eyebrow: 'Day 3 together',
    headline: '3 things I want you to find',
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
  return build('Three more days of our first week, mama ✨', {
    preheader: `Your first 7 days are on us. On ${opts.endsOn}, your membership begins at ${opts.price}/${opts.interval}.`,
    icon: '✨',
    eyebrow: 'A note from Bella',
    headline: "I've loved this week with you",
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
  return build("I'm still here, mama 💛", {
    preheader: "Whenever you want me back, your spot is waiting.",
    icon: '🏡',
    eyebrow: 'A note from Bella',
    headline: "I'm still here whenever you need me",
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
    headline: opts.size ? `About the size of ${opts.size}` : `Your week ${opts.week} letter`,
    paragraphs: ["Here's my gentle guide to your week. Grab some tea, mama."],
    features: opts.highlights,
    cta: { label: 'Read this week with me', url: utm(`${ctx.appUrl}/`, `weekly_w${opts.week}`) },
    signoff: true,
    footer: { reason: 'You\'re getting your weekly letter because you\'re a Belly member.', unsubscribeUrl: ctx.unsubscribeUrl, address: ctx.address },
  });
}
