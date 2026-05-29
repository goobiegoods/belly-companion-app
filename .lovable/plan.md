## Goal
Give `/community` and `/shop` the same uniform solid-orange header band used on `/recipes`, so all three pages share one visual language at the top.

## Reference (already shipped on `/recipes`)
- Background: solid `#E8601A`, full-bleed.
- Padding: `14px 16px`.
- Shadow: `0 2px 8px rgba(120,60,10,0.18)`.
- White text, Fraunces serif title centered, Outfit secondary text.

## `/community` — `src/pages/Community.tsx` (header at lines ~388–414)
Replace the current stacked "Mama / community" serif header with a uniform orange band:

- Left: white Fraunces serif title "Mama Community" (`fontSize: 18`, `fontWeight: 700`), with a small white/80% subtitle below it ("Week N mamas · X members", `fontSize: 10`, Outfit).
- Right: keep the existing Notification bell + "+ New post" button, but restyle for the orange background:
  - Bell wrapper: `background: rgba(255,255,255,0.18)`, no border, white icon.
  - "+ New" button: `background: #fff`, `color: #E8601A`, same rounded pill, `fontWeight: 700`.
- Remove the giant 30/36px serif "Mama / community" lockup — it becomes the compact header title.

## `/shop` — `src/pages/Shop.tsx` (header at lines ~203–222)
Wrap the title row in the same orange band:

- Left: white Fraunces serif "Belly Shop" (`fontSize: 18`, `fontWeight: 700`) with subtitle "Natural remedies, delivered to you" (`fontSize: 10`, white/80%, Outfit).
- Right: keep the cart button but restyle:
  - Circle background `rgba(255,255,255,0.18)`, no border, white stroke icon.
  - Cart count badge keeps `background: #fff`, `color: #E8601A` for contrast on the orange.
- Tabs row ("remedies / learn") and everything below remain unchanged, sitting on the page background as today.

## Notes
- Only the header bands change. Page bodies, cards, tabs, modals, and logic are untouched.
- No new components, no token changes — inline styles matching the recipes header for consistency.
- Out of scope: other pages, the cart page, post-detail view, learn-tab content.
