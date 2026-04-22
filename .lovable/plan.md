

# Belly Shop — Checkout Flow & Learn Tab Readability Fix

## Problem 1 — Cart checkout doesn't open

The cart sheet opens correctly, but tapping **Checkout** mounts the Stripe Embedded Checkout iframe inside a white container with **no min-height** and inside a fixed-height bottom sheet (85vh). On mobile, after subtotal/shipping rows, there isn't enough room for Stripe's iframe to render, so it appears blank or invisible — making it look like "nothing happens."

### Fix
Restructure the cart sheet so the checkout view **replaces** the cart contents instead of appending below them:
- When `showCheckout = true`, hide the cart line items, subtotal, shipping rows, and the Checkout button.
- Render the `ShopCheckoutForm` in a tall scrollable white panel (`min-height: 480px`, scrolls inside the sheet).
- Keep a clear "← Back to cart" link at the top of the checkout panel.
- Add an order summary header (item count + total) above the Stripe iframe so the user has context.
- Increase the sheet `maxHeight` to `92vh` while in checkout mode for breathing room.
- Add a graceful loading state ("Loading secure checkout…") while Stripe initialises so the user sees feedback the moment they tap.

### Acceptance
- Tapping **Checkout · $X →** instantly shows a "Loading secure checkout…" placeholder, then the Stripe payment form appears within ~1s.
- The form is fully visible and scrollable on a 390×777 viewport.
- "← Back to cart" returns to the cart contents without losing items.

---

## Problem 2 — Learn tab text too low contrast

In the Learn tab (Belly Shop → Learn), several text elements use white at 40–50% opacity over a translucent glass card on the orange background, blending into it:
- Course meta: `"X lessons · Y min"` at `rgba(255,255,255,0.45)`
- Course tags: text at `rgba(255,255,255,0.70)` on a `0.15` glass pill (low contrast)
- Disclaimer text: `rgba(255,255,255,0.40)`
- Section labels: `rgba(255,255,255,0.50)` for "INTRO TO HOMEOPATHY"

### Fix
Bump opacity / weight on grey-on-orange copy in the Learn tab to meet a calm-but-readable contrast:
- Course meta line → `rgba(255,255,255,0.78)`
- Course description → `rgba(255,255,255,0.85)` (currently 0.65)
- Tag pills → background `rgba(255,255,255,0.22)`, text `rgba(255,255,255,0.92)`, border `rgba(255,255,255,0.30)`
- "Continue/Start →" label → `rgba(255,255,255,0.95)` with weight 700
- Section eyebrow ("INTRO TO HOMEOPATHY") → `rgba(255,255,255,0.78)`
- Disclaimer card → text `rgba(255,255,255,0.72)`, slightly stronger card background `rgba(255,255,255,0.16)`

Same treatment applied to the lesson list back-screen meta (`X min` per lesson) for consistency.

### Acceptance
- All text on the Learn tab is comfortably readable on the orange background without feeling harsh.
- Tag pills and meta lines look intentional, not faded.
- Visual rhythm of the page is preserved (no layout/spacing changes).

---

## Files touched

- `src/pages/Shop.tsx` — restructure cart sheet (checkout view replaces cart body); raise text opacities on Learn tab and lesson list.

## Test plan (preview)

1. Add 1–2 items in the **Remedies** tab → tap the cart icon (top-right).
2. Tap **Checkout · $X →**. The cart contents disappear, "Loading secure checkout…" shows for a moment, then Stripe's card form appears inline.
3. Use test card **4242 4242 4242 4242**, any future expiry, any 3-digit CVC, any ZIP. Submit.
4. You're redirected to **/order-success** and the order appears as **Paid** under **Profile → My Orders**.
5. Tap **Learn** in the Shop tab strip. Read the course cards, tags, meta, and disclaimer — text should be clearly legible without straining.
6. Open a course → the lesson list meta ("X min") should also be readable.

