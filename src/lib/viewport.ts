import { useEffect } from "react";

/**
 * Keyboard-aware viewport tracking.
 *
 * iOS Safari never resizes the layout viewport for the on-screen keyboard —
 * it shrinks only the *visual* viewport and scrolls/pans the page to reveal
 * the focused input. This module:
 *
 * - mirrors `visualViewport.height` into `--vvh` on <html> so full-screen
 *   surfaces can size themselves with `height: var(--vvh, 100dvh)`;
 * - toggles `kb-open` on <html> (hides the bottom nav) based on *actual
 *   focus on a text-editable element*, not height history — Safari's
 *   collapsing toolbars and persistent input auto-zoom both shrink the
 *   visual viewport with no keyboard present, so height alone lies;
 * - on iOS, appends `maximum-scale=1` to the viewport meta, which disables
 *   the focus auto-zoom (since iOS 10 it does NOT block manual pinch-zoom,
 *   so accessibility is preserved; Android's meta is left untouched);
 * - while a `vv-lock` surface is active (see useVvLock), pins any residual
 *   visual-viewport pan back to the origin.
 */
const KB_MIN_INSET_PX = 100;

const TEXTLESS_INPUT_TYPES = new Set([
  "button", "checkbox", "radio", "range", "file", "submit", "reset", "color", "image",
]);

function isTextEditable(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") return !TEXTLESS_INPUT_TYPES.has((el as HTMLInputElement).type);
  return (el as HTMLElement).isContentEditable;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS masquerading as Mac

export function initViewportTracking() {
  const root = document.documentElement;
  const vv = window.visualViewport;

  if (isIOS()) {
    const meta = document.querySelector('meta[name="viewport"]');
    const content = meta?.getAttribute("content") ?? "";
    if (meta && !content.includes("maximum-scale")) {
      meta.setAttribute("content", `${content}, maximum-scale=1`);
    }
  }

  const update = () => {
    const vvh = vv ? vv.height : window.innerHeight;
    root.style.setProperty("--vvh", `${Math.round(vvh)}px`);

    // Keyboard inset relative to the *current* layout viewport, normalized by
    // zoom scale — toolbar collapse and pinch/auto zoom both cancel out here,
    // an overlay keyboard (iOS) does not.
    const scale = vv?.scale ?? 1;
    const inset = vv ? window.innerHeight - vvh * scale : 0;
    const editing = isTextEditable(document.activeElement);
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    root.classList.toggle("kb-open", editing && (coarse || inset > KB_MIN_INSET_PX));

    // On locked (chat) surfaces the layout already fits the visual viewport;
    // undo any pan Safari applied between focus and this handler.
    if (root.classList.contains("vv-lock") && (window.scrollX !== 0 || window.scrollY !== 0)) {
      window.scrollTo(0, 0);
    }
  };

  vv?.addEventListener("resize", update);
  vv?.addEventListener("scroll", update);
  // Re-check after the keyboard show/hide animation settles.
  window.addEventListener("focusin", () => { update(); setTimeout(update, 300); });
  window.addEventListener("focusout", () => { setTimeout(update, 50); });
  update();
}

let vvLockCount = 0;

/**
 * While active, locks <html>/<body> to exactly the visual-viewport height
 * (class `vv-lock`) so the document has zero scrollable overflow — iOS Safari
 * then has nothing to scroll when the keyboard opens, and the flex layout
 * alone raises the composer. Ref-counted so overlapping surfaces compose.
 */
export function useVvLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    vvLockCount += 1;
    document.documentElement.classList.add("vv-lock");
    return () => {
      vvLockCount -= 1;
      if (vvLockCount <= 0) document.documentElement.classList.remove("vv-lock");
    };
  }, [active]);
}
