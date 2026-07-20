/**
 * Keyboard-aware viewport tracking.
 *
 * iOS Safari (and Android before `interactive-widget=resizes-content`) only
 * shrinks the *visual* viewport when the on-screen keyboard opens — `100dvh`
 * and `position: fixed` layouts keep the full layout-viewport height, so
 * bottom-pinned composers end up hidden behind the keyboard.
 *
 * This module mirrors `visualViewport.height` into `--vvh` on <html> so
 * full-screen surfaces can size themselves with `height: var(--vvh, 100dvh)`,
 * and toggles a `kb-open` class (used to hide the bottom nav) when the
 * viewport shrinks enough to indicate a keyboard.
 */
const KEYBOARD_THRESHOLD_PX = 150;

export function initViewportTracking() {
  const vv = window.visualViewport;
  if (!vv) return;

  let baseHeight = vv.height;

  const update = () => {
    const root = document.documentElement;
    // Track the largest height seen so orientation changes re-baseline.
    if (vv.height > baseHeight) baseHeight = vv.height;
    root.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
    root.classList.toggle("kb-open", baseHeight - vv.height > KEYBOARD_THRESHOLD_PX);
  };

  vv.addEventListener("resize", update);
  window.addEventListener("orientationchange", () => {
    baseHeight = 0;
    requestAnimationFrame(update);
  });
  update();
}
