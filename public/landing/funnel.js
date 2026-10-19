/*
 * Belly landing — revenue + analytics glue. Loaded BEFORE feed.js.
 *
 * PRIVACY: the pregnancy path (?t=pregnant|trying|postpartum|little) and
 * screen deep links (?s=) are read here, kept in memory/sessionStorage, and
 * stripped from the address bar BEFORE the Meta Pixel loads, so Meta never
 * sees them. Meta gets standard events only (PageView, Lead,
 * InitiateCheckout, StartTrial) — never stage or product. PostHog
 * (first-party analytics) gets the path so funnels can be compared.
 * Global Privacy Control / "Your privacy choices" opt-out disables Meta.
 */
(function () {
  'use strict';
  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- 1) read + strip sensitive URL bits -------------------------------
  var TRACKS = ['pregnant', 'trying', 'postpartum', 'little'];
  var url = new URL(location.href);
  var q = url.searchParams;
  var t = q.get('t'), s = q.get('s');
  (url.hash || '').slice(1).split(/[.\-]/).forEach(function (h) {
    if (!h) return;
    if (TRACKS.indexOf(h) >= 0) t = t || h; else s = s || h;
  });
  if (t && TRACKS.indexOf(t) < 0) t = null;
  if (t) ss.set('belly_t', t); else t = ss.get('belly_t');
  if (s && !/^[a-z0-9]{1,24}$/.test(s)) s = null;
  window.__BELLY_INIT = { t: t, s: s };

  var vq = q.get('v');
  if (vq && /^[a-z0-9]{1,8}$/.test(vq)) ls.set('belly_v', vq);
  var VARIANT = ls.get('belly_v') || 'a';

  var fbclid = q.get('fbclid');
  var UTM = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = q.get(k); if (v) UTM[k] = v.slice(0, 100);
  });
  var cancelled = q.get('checkout') === 'cancelled';
  ['t', 's', 'checkout'].forEach(function (k) { q.delete(k); });
  try { history.replaceState(history.state, '', url.pathname + (q.toString() ? '?' + q.toString() : '')); } catch (e) {}

  // ---- 2) identity / consent --------------------------------------------
  var ANON = ls.get('belly_anon');
  if (!ANON) {
    ANON = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    ls.set('belly_anon', ANON);
  }
  var GPC = navigator.globalPrivacyControl === true || ls.get('belly_optout') === '1';

  function cookie(n) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function fbp() { return GPC ? null : cookie('_fbp'); }
  function fbc() {
    if (GPC) return null;
    var c = cookie('_fbc');
    if (c) return c;
    if (fbclid) return 'fb.1.' + Date.now() + '.' + fbclid;
    return null;
  }

  // ---- 3) analytics -----------------------------------------------------
  var CFG = null, queue = [];
  function ph(event, props) {
    if (!CFG) { queue.push([event, props]); return; }
    if (!CFG.posthogKey) return;
    var p = { $current_url: location.origin + location.pathname, $process_person_profile: false, variant: VARIANT, path: t || null, test_mode: !!CFG.testMode };
    for (var k in UTM) p[k] = UTM[k];
    for (var k2 in (props || {})) p[k2] = props[k2];
    try {
      fetch(CFG.posthogHost.replace(/\/+$/, '') + '/capture/', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: CFG.posthogKey, event: event, distinct_id: ANON, properties: p })
      }).catch(function () {});
    } catch (e) {}
  }
  var pixelOn = false;
  function loadPixel(id) {
    /* Meta's standard loader, without inline script (CSP). */
    !function (f, b, e, v, n, t2, s2) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t2 = b.createElement(e); t2.async = !0; t2.src = v; s2 = b.getElementsByTagName(e)[0]; s2.parentNode.insertBefore(t2, s2);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq.disablePushState = true;
    window.fbq('set', 'autoConfig', false, id); // no button/microdata scraping of page text
    window.fbq('init', id);
    window.fbq('track', 'PageView');
    pixelOn = true;
  }
  function pixel(name, data, eventId) {
    if (!pixelOn || !window.fbq) return;
    window.fbq('track', name, data || {}, eventId ? { eventID: eventId } : undefined);
  }

  var cfgReady = fetch('/api/funnel-config', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .catch(function () { return {}; })
    .then(function (c) {
      CFG = { pixelId: c.pixelId || '', posthogKey: c.posthogKey || '', posthogHost: c.posthogHost || 'https://us.i.posthog.com', checkoutOpen: !!c.checkoutOpen, testMode: c.testMode !== false };
      if (CFG.pixelId && !GPC) loadPixel(CFG.pixelId);
      var qd = queue; queue = []; qd.forEach(function (a) { ph(a[0], a[1]); });
      return CFG;
    });

  ph(document.body && document.body.dataset.page === 'welcome' ? 'funnel_success_view' : 'funnel_view', { deep_link: s || null, returned_from_checkout: cancelled });

  // Screen views (dedup per page load). Tip scenes are added dynamically.
  var seen = {};
  function watchScenes() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target.getAttribute('data-n'); if (!n || seen[n]) return;
        seen[n] = 1; ph('funnel_screen_view', { screen: n });
      });
    }, { threshold: 0.6 });
    var feed = document.getElementById('feed');
    if (!feed) return;
    [].forEach.call(feed.querySelectorAll('section.scene'), function (el) { io.observe(el); });
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.matches && n.matches('section.scene')) io.observe(n); }); });
    }).observe(feed, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchScenes); else watchScenes();

  // ---- 4) server calls --------------------------------------------------
  function post(path, body) {
    return fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .catch(function () { return { error: 'Connection problem — try again.', code: 'network' }; });
  }
  function uid(p) { return p + '_' + ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); }

  var BONUS_KEY = 'belly_bonus_v1';
  window.BellyFunnel = {
    variant: VARIANT,
    ready: cfgReady,
    isTestMode: function () { return !CFG || CFG.testMode; },
    email: function () { return ls.get('belly_email') || ''; },
    track: ph,
    pixel: pixel,
    /** Called once when the finale timer starts. Server signs the window. */
    bonusStart: function () {
      var cur = null; try { cur = JSON.parse(ls.get(BONUS_KEY) || 'null'); } catch (e) {}
      if (cur && cur.token) return; // never extend an existing window
      post('/api/funnel-bonus', { anonId: ANON }).then(function (r) {
        if (r && r.token) ls.set(BONUS_KEY, JSON.stringify({ token: r.token, exp: r.exp }));
      });
    },
    checkout: function (plan, email, extraWaitlist) {
      ls.set('belly_email', email);
      if (extraWaitlist && extraWaitlist.length) this.waitlist(extraWaitlist, email).catch(function () {});
      var tok = null; try { tok = (JSON.parse(ls.get(BONUS_KEY) || 'null') || {}).token || null; } catch (e) {}
      ph('funnel_checkout_submit', { offer: plan });
      return post('/api/funnel-checkout', {
        offer: plan, email: email, variant: VARIANT, bonusToken: plan === 'bonus' ? tok : null,
        stage: t, anonId: ANON, fbp: fbp(), fbc: fbc(), gpc: GPC
      }).then(function (r) {
        if (r && r.url) pixel('InitiateCheckout', { currency: 'USD', value: 0 }, r.eventId);
        else ph('funnel_checkout_blocked', { offer: plan, code: (r && r.code) || 'unknown' });
        return r;
      });
    },
    waitlist: function (keys, email) {
      ls.set('belly_email', email);
      var eventId = uid('lead');
      return post('/api/funnel-waitlist', {
        products: keys, email: email, variant: VARIANT, stage: t, anonId: ANON,
        fbp: fbp(), fbc: fbc(), gpc: GPC, eventId: eventId
      }).then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || 'Could not save — try again.');
        pixel('Lead', {}, eventId);
        return r;
      });
    },
    loginLink: function (email) { return post('/api/send-login-link', { email: email }); },
    optOut: function (on) { if (on) ls.set('belly_optout', '1'); else ls.del('belly_optout'); },
    optedOut: function () { return GPC; }
  };
})();
