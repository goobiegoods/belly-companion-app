(function () {
  'use strict';
  var box = document.getElementById('opt'), state = document.getElementById('state');
  var gpc = navigator.globalPrivacyControl === true;
  function get() { try { return localStorage.getItem('belly_optout') === '1'; } catch (e) { return false; } }
  function show() {
    box.checked = gpc || get();
    box.disabled = gpc;
    state.textContent = gpc ? 'Your browser’s Global Privacy Control signal is on, so you’re opted out.'
      : box.checked ? 'You’re opted out on this browser.' : 'Not opted out.';
  }
  box.addEventListener('change', function () {
    try { if (box.checked) localStorage.setItem('belly_optout', '1'); else localStorage.removeItem('belly_optout'); } catch (e) {}
    show();
  });
  show();
})();
