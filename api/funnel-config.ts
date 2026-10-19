export const config = { runtime: 'edge' };

import { stripeMode, checkoutAllowed } from './_lib/funnel.js';

/** Public, non-secret settings for the static landing page. */
export default async function handler() {
  const posthogKey = process.env.POSTHOG_KEY || process.env.VITE_POSTHOG_KEY || '';
  return new Response(
    JSON.stringify({
      pixelId: process.env.META_PIXEL_ID || '',
      posthogKey,
      posthogHost: process.env.POSTHOG_HOST || process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      checkoutOpen: checkoutAllowed().ok,
      testMode: stripeMode() !== 'live',
    }),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' } },
  );
}
