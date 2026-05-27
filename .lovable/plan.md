## Fix Week Card on Home Screen

Scope: `src/pages/HomePage.tsx` (Card 2) and the Share button in `src/components/ShareableMilestoneCard.tsx`. No other changes.

### 1. Move corn circle into the orange header zone

In `src/pages/HomePage.tsx` Card 2:

- Inside the orange gradient `<div>` (currently ends after the "VIABILITY MILESTONE" `<p>`), append the fruit circle as a normal block element with these exact styles:
  - `width: 80px, height: 80px`
  - `borderRadius: 50%`
  - `background: rgba(255,255,255,0.15)`
  - `border: 2px solid rgba(255,255,255,0.25)`
  - `display: flex, alignItems: center, justifyContent: center`
  - `fontSize: 50px`
  - `margin: 0 auto 16px`
- Remove the existing corn circle that currently sits between the orange and white zones (the one with `margin: "-18px auto 8px"`, `border: "3px solid #FFFFFF"`, radial-gradient background, `position: relative, zIndex: 2`). Delete it entirely.
- The orange header's bottom padding stays as-is (already `0`); the 16px margin-bottom on the circle provides spacing inside the orange zone before the hard edge.
- The white body wrapper currently has `padding: "0 16px 14px"` — change to `padding: "14px 16px"` so the white zone starts with `padding-top: 14px` as specified.

Result: clean hard edge between orange and white. Corn circle is fully inside orange. No negative margins, no z-index, no white border.

### 2. Make Share button solid filled orange

In `src/components/ShareableMilestoneCard.tsx` line 77, replace the `v2-btn-secondary` button with inline styles:
- `background: '#E8702A'`
- `color: '#fff'`
- `fontWeight: 800`
- `fontFamily: "'Nunito', system-ui"`
- `border: 'none'`
- `borderRadius: 12`
- `height: 44, width: '100%'`
- `fontSize: 14`
- `boxShadow: '0 3px 12px rgba(232,112,42,0.42)'`
- `cursor: busy ? 'wait' : 'pointer'`

No other changes to the file.
