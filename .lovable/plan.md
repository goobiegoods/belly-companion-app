

# Belly App — Final Polish: 6 fixes

## Fix 1 — Switch shop checkout to Hosted Checkout (full redirect)

Replace the embedded iframe flow with a Stripe-hosted redirect.

**Edge function `create-shop-checkout`:**
- Remove `ui_mode: "embedded"`.
- Add `success_url: ${origin}/order-success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url: ${origin}/shop?canceled=1`.
- Return `{ url: session.url, orderId }` instead of `{ clientSecret, orderId }`.

**Frontend (`Shop.tsx`):**
- Delete the `ShopCheckoutForm` import and the entire embedded-checkout panel inside the cart sheet.
- Replace `startCheckout` with an async `handleCheckout` that:
  1. Sets `checkoutLoading=true` (disables button, shows spinner inline).
  2. `console.log('[checkout] requesting session…')`
  3. Calls `supabase.functions.invoke('create-shop-checkout', { body: {...} })`.
  4. Throws if `!data?.url`.
  5. `console.log('[checkout] redirecting to', data.url)`
  6. `setShowCart(false)` → `await new Promise(r => setTimeout(r, 50))` → `window.location.href = data.url`.
  7. On error: `toast.error("Something went wrong — please try again")` and reset loading.
- Delete the now-unused `showCheckout` state.

**Cleanup:** delete `src/components/ShopCheckout.tsx` (no longer referenced).

**Note about `PremiumModal` (subscription checkout):** It also uses embedded checkout. **Out of scope** for this pass — only the shop cart was reported broken. Premium flow stays embedded.

## Fix 2 — Remove the orange "Test mode" banner

- In `App.tsx`, remove `<PaymentTestModeBanner />` from `AppLayout` and remove its import.
- Delete `src/components/PaymentTestModeBanner.tsx`.
- Leave `@stripe/stripe-js` and `src/lib/stripe.ts` installed — `PremiumModal` (embedded subscription checkout) still uses `getStripe()`. Removing them would break premium upgrades.

## Fix 3 — Lesson reader: white text on orange

Rewrite the lesson reader block in `src/pages/Shop.tsx` (lines 86–184) so all colors match your spec:

| Element | Spec |
|---|---|
| Page background | transparent over global `#FF8C42` (remove cream gradient `belly-hero-gradient`) |
| Header bar | `rgba(210,80,10,0.9)` + `backdrop-filter: blur(12px)` |
| `← Back` | `rgba(255,255,255,0.85)`, Outfit 500/14 |
| `LESSON N` eyebrow | `rgba(255,255,255,0.6)`, Outfit 700/10, tracking 2px |
| Lesson title (h1) | `#fff`, Fraunces 800/22 |
| `7 min read` pill | bg `rgba(255,255,255,0.18)`, border `rgba(255,255,255,0.25)`, color `#fff`, Outfit 600/11, radius 20, padding 4×12 |
| Intro paragraph | `#fff`, Outfit 400/15, line-height 1.75 |
| Section headings | `#fff`, Fraunces 800/22, mt 24 mb 10 |
| Section body | `rgba(255,255,255,0.85)`, Outfit 400/15 |
| Section "Tip" card | bg `rgba(255,255,255,0.16)`, border `rgba(255,255,255,0.25)`, body text `rgba(255,255,255,0.85)`, label `#fff` |
| "What you'll learn" card | keep cream bg `rgba(255,244,238,0.96)`, label `#888` Outfit 700/10 tracking 1.5px, bullets `#333` Outfit 400/14, dots `#FF8C42` |
| "Did you know?" card | bg `rgba(255,255,255,0.16)`, title `#fff`, body `rgba(255,255,255,0.85)` |
| "Reflect" card | bg `rgba(255,255,255,0.16)`, label `rgba(255,255,255,0.78)`, prompt `#fff` italic, textarea bg `rgba(255,255,255,0.95)` text `#333` |
| Quiz prompt | `#fff`, options bg `rgba(255,255,255,0.16)` text `#fff`; correct keeps green, wrong keeps red |
| Key takeaway gradient card | unchanged |
| Bottom action bar | bg `rgba(210,80,10,0.9)` blur(12px); Previous button `rgba(255,255,255,0.18)` text `#fff` |

Same opacity bumps applied to lesson list screen (lines 196–223): titles `#fff`, meta `rgba(255,255,255,0.78)`.

## Fix 4 — Maternity-aware icons

- `HomePage.tsx` header logo (lines 109–114): replace the SVG belly silhouette inside the rounded square with `<span style={{ fontSize: 20 }}>🤰</span>`.
- `HomePage.tsx` greeting pill (line 121): change `Hi, {displayName} 🌸` → `Hi, {displayName} 🤰` with the emoji at `fontSize: 16`.
- Audit pass (decorative-only emojis, never content): no other 🌸/✨ used as branding marks were found in headers; toasts/copy keep their existing flavor emojis (those are content, not decoration).

## Fix 5 — Ghost watermark "doula" — make it actually visible & contained

In `HomePage.tsx`, the "doula" string already exists at lines 91–104 but it's currently positioned on the **page** (not the hero card) and sits behind the orange page bg, so it disappears. Move it inside the hero card:

- Delete lines 91–104 (the page-level ghost div).
- Inside the hero card (line 130 wrapper), set `position: relative; overflow: hidden`.
- As the **first child** of that card, add the ghost div with the exact spec:
  ```
  fontFamily: "'Fraunces', serif"
  fontWeight: 900
  fontSize: "clamp(80px, 20vw, 140px)"
  color: "rgba(255,255,255,0.06)"
  position: "absolute", top: -10, right: -8
  pointerEvents: "none", userSelect: "none", zIndex: 0
  lineHeight: 1
  ```
  text content: `doula`
- Wrap all card content in a `<div style={{ position: "relative", zIndex: 1 }}>` (already present at line 131 — just keep it).

## Fix 6 — Shop background = brand orange

The shop page uses `background: "transparent"` and inherits the `AppLayout` orange `#FF8C42` — the perceived "darker brown-orange" comes from the `belly-hero-gradient` class on the hero banner darkening the area. Fixes:

- `Shop.tsx` line 228: change `background: "transparent"` → `background: "#FF8C42", minHeight: "100vh"` (explicit, no inheritance ambiguity).
- Hero banner (line 268): replace `belly-hero-gradient` with inline `background: "rgba(255,255,255,0.14)"` + `border: "1px solid rgba(255,255,255,0.22)"`. All inner text already white — keep it.
- "REMEDY KITS" / "INDIVIDUAL REMEDIES" / "HERBAL TEAS" labels (lines 278, 298, 320): color `rgba(255,255,255,0.55)`, Outfit 700/10, tracking 2px.
- Title "Belly Shop" (line 231): already `color: "white"` — keep.
- Product card backgrounds: already `rgba(255,255,255,0.14–0.18)` — no change needed.

---

## Files touched

- `src/pages/Shop.tsx` — checkout redirect, lesson reader colors, shop bg.
- `src/pages/HomePage.tsx` — header emoji, greeting emoji, ghost watermark relocation.
- `src/App.tsx` — remove banner import + usage.
- `supabase/functions/create-shop-checkout/index.ts` — return hosted URL.
- **Deleted:** `src/components/ShopCheckout.tsx`, `src/components/PaymentTestModeBanner.tsx`.

## Test plan (preview)

1. **Checkout (revenue path):** Shop → add 1–2 remedies → cart → **Checkout · $X →**. Cart sheet closes; tab navigates to `checkout.stripe.com`. Pay with **4242 4242 4242 4242**, any future expiry, any CVC, any ZIP. Land on `/order-success`. Verify **Profile → My Orders** shows status **Paid**.
2. **Banner:** No orange "Test mode" strip on any screen.
3. **Learn reader:** Shop → Learn → open any lesson → all body, headings, eyebrows, pill clearly white-on-orange; "What you'll learn" card stays cream.
4. **Header:** Home → top-left logo square shows 🤰; top-right pill says `Hi, Orel 🤰`.
5. **Ghost:** Home hero card shows a faint "doula" watermark cropped at top-right corner; doesn't bleed outside the card.
6. **Shop bg:** Shop page now matches the same bright orange as Home/Profile.

