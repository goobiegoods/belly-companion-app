/**
 * Vercel Routing Middleware — serves the landing funnel at the bare
 * meetbelly.com root while app.meetbelly.com (and previews) keep the app.
 * The landing is also always reachable at /start on any host.
 */
export const config = { matcher: '/' };

const LANDING_HOSTS = new Set(['meetbelly.com', 'www.meetbelly.com']);

export default function middleware(request: Request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  if (!LANDING_HOSTS.has(host)) return; // fall through to the app
  const url = new URL(request.url);
  const target = new URL(`/landing/index.html${url.search}`, url);
  return new Response(null, { headers: { 'x-middleware-rewrite': target.toString() } });
}
