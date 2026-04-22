

# Ask the Doula — Strip back to pure conversation UI

Rebuild `src/pages/AskDoula.tsx` so the only thing on screen is a chat. Remove the welcome hero, the 3 context tiles, the 2×2 prompt grid, the camera card, the ambient placeholder, and the `← Home` back link. Keep all chat plumbing (streaming, abort, history persistence, image-attach, premium gating).

## New layout (top → bottom)

**1 · Minimal header (no card)**
Sits directly on `#FF8C42`. Padding `16px 20px 12px`.
- Row: `Ask the Doula` (Fraunces 800/20 white) + AI · LIVE pill on the right (rgba white 0.15 bg, 0.22 border, 4×10 padding, 6px green dot with the existing `livePulse` keyframe + `AI · LIVE` Outfit 700/9 white, tracking 1px).
- Subline: `Your natural pregnancy guide` (Outfit 300/12 rgba white 0.55).

**2 · Chat area** (`flex:1`, `overflow-y:auto`, padding 16px, `padding-bottom:80px`, gap 12px).

Pre-loaded greeting bubble shown when `messages.length === 0`:
> "Hi {displayName}! 🌸 You're at week {currentWeek} — {weekMilestone}. I'm here for you 24/7. What's on your mind today?"

`weekMilestone` resolves as: week 20 → "you're halfway there!"; weeks 1–12 → "first trimester, the early days"; weeks 13–26 → "you're in the second trimester"; weeks 27–40 → "in the home stretch now".

The greeting renders as a normal assistant bubble (existing styles already match: rgba white 0.18 bg, 0.22 border, 16/4/16/16 radius, "D" avatar, `Just now` timestamp Outfit 300/10 rgba white 0.4 below). It is **render-only** — not pushed into `messages` or persisted — so once the user sends anything, it disappears and the real conversation takes over.

User & assistant message bubbles, image previews, markdown rendering, typing dots, abort, and the per-message disclaimer line all stay exactly as they are today.

`messagesEndRef` already exists at the end of the list and is already auto-scrolled in the existing `useEffect` — keep both.

**3 · Suggestion chips — single horizontal scroll row**
Lives between the chat area and the input bar, `flex-shrink:0`, `overflow-x:auto`, `scrollbar-width:none`, padding `8px 16px`, gap 8px. Each chip: rgba white 0.15 bg, 0.22 border, radius 20, padding 8×16, Outfit 500/12 white, `white-space:nowrap`.

Four chips, week-aware:
- `What's normal at week {currentWeek}?`
- `Help me sleep tonight`
- `What should I avoid?`
- `I'm feeling anxious`

Tap → call existing `sendMessage(chipText)` (auto-sends, same as today).

Hide the row entirely once `messages.length > 0` so chips don't clutter an active conversation.

**4 · Sticky input bar** (`position:sticky`, `bottom:0`, `z-index:10`)
Bar bg `rgba(220,90,10,0.97)` + `backdrop-filter:blur(16px)`, padding `10px 16px 14px`.

Inner pill: `rgba(255,255,255,0.95)`, radius 24, `padding:4px 4px 4px 16px`, gap 8, flex/center.
- Input: transparent, no border, Outfit 400/14 `#333`, placeholder "Ask anything..." color `#bbb`, Enter sends.
- Send button: 38px circle `#FF8C42`, white `Send` icon (16px). Disabled (opacity 0.5, not clickable) when input empty AND no attached image AND no streaming, OR when free-quota is exhausted.
- Replace send with the existing Square/cancel button while `isStreaming`.

Below the pill, centered inside the sticky bar:
- Free user, count < 10 → `{messageCount}/10 free messages today` (Outfit 400/10 rgba white 0.5).
- Free user, count ≥ 10 → `You've used your 10 free messages for today` (same style) AND show an inline upsell bubble at the bottom of the chat area: assistant-style bubble containing the line "You've used your 10 free messages for today 🌸 Upgrade to Premium for unlimited access." plus a `Go Premium →` button (white bg, `#FF8C42` text, radius 20, padding 8×18) that opens `<PremiumModal>`. This replaces today's standalone block.
- Premium user → render `Unlimited messages ✨` (Outfit 400/10 rgba white 0.7).

**5 · Camera / image-attach**
The spec removes the camera *card* but the ability to attach a product photo is core to the doula. Keep the existing camera button (📷) inside the input pill on the left of the text field — same `showPhotoMenu` sheet, same `attachedImage` preview strip above the input. Nothing else changes.

**6 · Page background**
Wrapper `display:flex`, `flex-direction:column`, `min-height:100vh`, `background:#FF8C42` (explicit, no inheritance).

## What's removed from the file

- Welcome hero card (lines 237–249).
- Week context strip — 3 tiles (252–264).
- "Suggested for week N" label + 2×2 grid (267–276).
- "Is this product safe to use?" card (278–283).
- Ambient "I'm here whenever you need me, mama" card (286–290).
- `← Home` button in the header.
- `getGreeting()` helper and `firstAssistantIdx` (unused after rewrite).
- The standalone "10 daily messages" upsell block (359–372) — folded into the inline chat upsell described above.

## What's kept untouched

- Streaming fetch to `belly-chat`, abort controller, SSE parsing.
- `chat_messages` insert for both user and assistant turns.
- Daily message count query (already filters `role='user'` and today midnight).
- `attachedImage` flow + `showPhotoMenu` sheet.
- `PremiumModal` import and usage.
- Chip prefill receiver from `location.state.prefill`.
- `getCurrentWeek` / `pregnancyWeeks` lookups, `displayName` Title-Case rule.

## Files touched

- `src/pages/AskDoula.tsx` — single-file rewrite (~441 lines → ~230 lines).
- `mem://features/ai-doula` — update to reflect: no welcome hero, no context strip, no 2×2 grid; pre-loaded greeting bubble + horizontal chip row + sticky input.

## Test plan (preview)

1. Open `/ask` cold (empty history) → see header strip, one doula greeting bubble naming the user and current week, horizontal chip row, sticky input. No cards.
2. Tap a chip → it sends, greeting disappears, chip row hides, real reply streams in with typing dots then markdown.
3. Send a few messages → counter under input increments `1/10`, `2/10`, …
4. Set `messageCount` to 10 → send button greys out, footer line switches to "used your 10 free messages", and an inline upsell bubble appears at the end of the chat with a `Go Premium →` that opens the premium modal.
5. Premium user → footer reads `Unlimited messages ✨`, no cap.
6. Tap 📷 in the input pill → existing photo sheet opens, attach a photo, send → image renders in the user bubble and doula replies.
7. Resize to 390×777 (current viewport) → chat fills the screen, input stays pinned above the bottom nav, no horizontal scroll except the chip row.

