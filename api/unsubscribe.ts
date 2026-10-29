export const config = { runtime: 'edge' };

import { dbUpsert } from './_lib/stripe.js';
import { cleanEmail, verifyOptOut } from './_lib/funnel.js';

/** One-click unsubscribe from Belly marketing emails (signed link, no login). */
const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#150A1F;color:#FBEEE0;font-family:Inter,Helvetica,Arial,sans-serif;padding:24px;text-align:center">
<div style="max-width:380px"><div style="font-family:Georgia,serif;font-size:30px;color:#F2B647">belly</div><h1 style="font-size:22px;font-weight:600">${title}</h1><p style="color:rgba(251,238,224,.75);line-height:1.5">${body}</p></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const email = cleanEmail(url.searchParams.get('e'));
  const token = url.searchParams.get('t') || '';
  if (!email || !(await verifyOptOut(email, token))) {
    return page('Link not valid', 'This unsubscribe link is broken or incomplete. Email hello@meetbelly.com and we will remove you.', 400);
  }
  await dbUpsert('email_optouts', { email }, 'email');
  return page("You're unsubscribed", "You won't get any more marketing emails from Belly. Account emails (like sign-in links) still arrive when you ask for them.");
}
