/**
 * Vercel Routing Middleware.
 *
 * - meetbelly.com / www: the bare root serves the landing funnel; app.meetbelly.com
 *   (and previews) keep the app. The landing is also reachable at /start on any host.
 * - Admin lives only on admin.meetbelly.com. /admin on the public hosts redirects
 *   there, and the admin host's root opens /admin. Previews are left alone.
 */
export const config = { matcher: ['/', '/admin', '/admin/:path*'] };

const LANDING_HOSTS = new Set(['meetbelly.com', 'www.meetbelly.com']);
const PUBLIC_APP_HOSTS = new Set(['meetbelly.com', 'www.meetbelly.com', 'app.meetbelly.com']);
const ADMIN_HOST = 'admin.meetbelly.com';

export default function middleware(request: Request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  const url = new URL(request.url);
  const isAdminPath = url.pathname === '/admin' || url.pathname.startsWith('/admin/');

  if (isAdminPath) {
    if (PUBLIC_APP_HOSTS.has(host)) {
      return Response.redirect(`https://${ADMIN_HOST}${url.pathname}${url.search}`, 307);
    }
    return; // admin host or a preview: serve the app
  }

  // Path is '/'.
  if (host === ADMIN_HOST) return Response.redirect(`https://${ADMIN_HOST}/admin`, 307);
  if (!LANDING_HOSTS.has(host)) return; // fall through to the app
  const target = new URL(`/landing/index.html${url.search}`, url);
  return new Response(null, { headers: { 'x-middleware-rewrite': target.toString() } });
}
