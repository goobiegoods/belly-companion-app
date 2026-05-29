## Goal
Make the Ask Bella composer feel like the hero of the app — a confident, pop-out footer with a clear "Ask anything" label and a thin orange divider that visually anchors the chat as the most important surface.

## Changes — `src/pages/AskDoula.tsx`

### 1. Thin orange top border on the sticky composer (line ~419)
Replace the current `borderTop: "1px solid var(--color-border-default)"` with a refined orange divider:
- Two-layer effect: a 2px solid line in `var(--color-accent-primary)` (#FF8C42), softened with a subtle gradient fade at the edges via `borderImage` or a `::before` pseudo. Inline-style version: `borderTop: "2px solid var(--color-accent-primary)"` plus a soft inset shadow `boxShadow: "0 -8px 24px -12px rgba(255, 140, 66, 0.25)"` so the bar feels like it glows up into the conversation.

### 2. "Ask anything" eyebrow label above the input pill
Add a small centered chip directly above the input bar, inside the sticky footer:
- Text: `ASK BELLA ANYTHING` (uppercase, letter-spaced).
- Style: `fontFamily: 'Outfit'`, `fontSize: 9`, `fontWeight: 700`, `letterSpacing: 0.16em`, `color: var(--color-accent-primary)`.
- Layout: small horizontal row centered, with a thin orange dot/sparkle on either side (•) to give it a "this is the moment" feel.
- Margin: `4px auto 8px`.

### 3. Polish the input pill itself
- Increase pill border from `1px solid var(--color-border-default)` to `1.5px solid rgba(255, 140, 66, 0.35)` so it carries a subtle orange ring matching the new top border.
- Strengthen the existing shadow to a warm one: `0 6px 20px -6px rgba(255, 140, 66, 0.22), 0 2px 6px rgba(40, 20, 5, 0.06)`.
- Slightly bump placeholder text: keep "Ask anything..." but make `font-size: 14.5` and add a tiny opacity bump for readability.
- Sticky bar padding: `12px 16px 14px` (was `10px 16px 14px`) to make room for the eyebrow label.

### 4. Quota line below remains unchanged
The "10/10 free messages today" microcopy stays right where it is.

## Out of scope
- Header, transcript, message bubbles, premium modal, photo picker, prefill chips — none touched.
- No copy changes to the placeholder or send-button behavior.
- No backend / streaming logic changes.
