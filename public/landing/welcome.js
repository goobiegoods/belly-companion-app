(function () {
  'use strict';
  var BF = window.BellyFunnel;
  var q = new URLSearchParams(location.search);
  var sid = q.get('sid');
  var kind = q.get('k') === 'p' ? 'Purchase' : 'StartTrial';
  if (BF && sid && /^cs_[A-Za-z0-9_]+$/.test(sid)) {
    // Same event_id as the server's Conversions API event → Meta dedupes.
    var key = 'belly_px_' + sid;
    var sent = null; try { sent = sessionStorage.getItem(key); } catch (e) {}
    if (!sent) {
      BF.ready.then(function () {
        BF.pixel(kind, { currency: 'USD', value: 0 }, 'trial_' + sid);
        try { sessionStorage.setItem(key, '1'); } catch (e) {}
      });
    }
  }
  var btn = document.getElementById('resend'), msg = document.getElementById('msg');
  btn.addEventListener('click', function () {
    var em = BF && BF.email();
    if (!em) { msg.textContent = 'Go to Open Belly and choose “Email me a sign-in link”.'; return; }
    btn.disabled = true;
    BF.loginLink(em).then(function () {
      msg.textContent = 'Sent again to ' + em + '.';
      setTimeout(function () { btn.disabled = false; }, 30000);
    });
  });
})();
