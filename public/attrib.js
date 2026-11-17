/*
 * Belly first-party attribution for the e-book pages (/first30, /solids, /recipes).
 * - Keeps the same anonymous id as the landing feed (localStorage belly_anon).
 * - Saves first-touch + last-touch ad source (utm_*, fbclid, referrer host).
 * - ?qa=1 marks this browser as QA (?qa=0 clears it) so test clicks stay out of reports.
 * - Sends page/checkout events to PostHog with a user agent + referrer, so they
 *   are not misread as automation. Nothing about pregnancy stage or health goes anywhere.
 */
(function () {
  'use strict';
  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var q = new URLSearchParams(location.search);
  var ANON = ls.get('belly_anon');
  if (!ANON) {
    ANON = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    ls.set('belly_anon', ANON);
  }
  if (q.get('qa') === '1') ls.set('belly_qa', '1');
  if (q.get('qa') === '0') ls.set('belly_qa', '');
  var QA = ls.get('belly_qa') === '1';

  var touch = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = q.get(k); if (v) touch[k] = v.slice(0, 100);
  });
  if (q.get('fbclid')) touch.fbclid = q.get('fbclid').slice(0, 120);
  var refHost = '';
  try { refHost = document.referrer ? new URL(document.referrer).host : ''; } catch (e) {}
  if (refHost && refHost.indexOf('meetbelly.com') < 0) touch.ref_host = refHost.slice(0, 80);
  if (Object.keys(touch).length) {
    touch.landing = location.pathname.slice(0, 60);
    touch.at = new Date().toISOString();
    if (!ls.get('belly_first_touch')) ls.set('belly_first_touch', JSON.stringify(touch));
    ls.set('belly_last_touch', JSON.stringify(touch));
  }
  function read(k) { try { return JSON.parse(ls.get(k) || 'null'); } catch (e) { return null; } }

  /** Flat, string-only attribution for checkout metadata. */
  function get() {
    var last = read('belly_last_touch') || {}, first = read('belly_first_touch') || {};
    var o = { anon_id: ANON, qa: QA ? '1' : '0' };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ref_host', 'landing'].forEach(function (k) { if (last[k]) o[k] = String(last[k]); });
    if (first.utm_campaign) o.first_campaign = String(first.utm_campaign);
    if (first.at) o.first_at = String(first.at);
    return o;
  }

  var CFG = null, queue = [];
  function send(event, props) {
    if (!CFG) { queue.push([event, props, new Date().toISOString()]); return; }
    if (!CFG.posthogKey) return;
    var a = get(), p = {
      $current_url: location.origin + location.pathname, $process_person_profile: false,
      $raw_user_agent: navigator.userAgent, $referrer: document.referrer || '$direct',
      $screen_width: screen && screen.width, is_qa: QA, test_mode: !!CFG.testMode
    };
    for (var k in a) if (k !== 'anon_id' && k !== 'qa') p[k] = a[k];
    for (var k2 in (props || {})) p[k2] = props[k2];
    try {
      fetch(CFG.posthogHost.replace(/\/+$/, '') + '/capture/', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: CFG.posthogKey, event: event, distinct_id: ANON, properties: p, timestamp: (props && props._at) || new Date().toISOString() })
      }).catch(function () {});
    } catch (e) {}
  }
  fetch('/api/funnel-config', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).catch(function () { return {}; })
    .then(function (c) {
      CFG = { posthogKey: c.posthogKey || '', posthogHost: c.posthogHost || 'https://us.i.posthog.com', testMode: c.testMode !== false };
      var qd = queue; queue = []; qd.forEach(function (x) { var p = x[1] || {}; p._at = x[2]; send(x[0], p); });
    });

  var product = (location.pathname.split('/')[1] || 'home').slice(0, 20);
  send('ebook_page_view', { product: product });
  var t0 = Date.now(), sent15 = false;
  function engaged() { if (!sent15 && Date.now() - t0 >= 15000 && document.visibilityState === 'visible') { sent15 = true; send('ebook_engaged_15s', { product: product }); } }
  setTimeout(engaged, 15200);

  window.BellyAttr = { get: get, track: send, anon: ANON, qa: QA };
})();
