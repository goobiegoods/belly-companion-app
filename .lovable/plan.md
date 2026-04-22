

# "Is this safe?" — Wire the camera safety feature into the chat

## What's already there

The image plumbing exists in `AskDoula.tsx` and `belly-chat/index.ts`:
- Camera button in the input pill opens a sheet → "Take a photo" / "Choose from library"
- Selected image becomes a 60px preview chip above the input
- On send, the image goes to the AI as OpenAI multimodal `image_url` content
- Both user-bubble and assistant-bubble render the image
- Vision model: Gemini via Lovable AI Gateway (already vision-capable — no Anthropic key needed)

What's missing is **discoverability** (nobody knows the camera does this), a **dedicated product-safety prompt** so the answer is structured and scannable, and a tiny bit of **input-bar polish**.

## Changes

### 1 · Add a 5th "📸 Is this safe to use?" suggestion chip (`AskDoula.tsx`)
Append to `QUICK_PROMPTS` row, styled identically to the others **except** `border: 1px solid rgba(255,255,255,0.35)` (brighter, signals "feature"). On tap → opens the camera directly (calls `cameraInputRef.current?.click()`), bypassing the photo-source sheet. After the photo is picked, the existing `handleFileSelect` flow takes over and the input prefills with `Is this product safe for me at week {currentWeek}?` so the user can hit send (or it auto-sends — see Q below).

### 2 · Camera-button polish in the input pill
- Idle: icon color `rgba(255,140,66,0.5)` (was `#FF6520`).
- Active/hover/tap: `#FF8C42`.
- While `isStreaming` AND the last user message has an `imageUrl`: swap the Camera icon for a small spinning Loader2 (Lucide), so the user gets feedback that the photo is being analyzed.

### 3 · Product-safety system-prompt branch (`belly-chat/index.ts`)
Detect "image present" by scanning the last user message for an `image_url` content part. When present, **append** this block to the filled prompt before sending to the gateway:

```
## PRODUCT SAFETY ANALYSIS MODE
The user has sent an image of a product label or ingredient list.
Structure your reply EXACTLY as:
1. "This looks like [product/type]" — one sentence.
2. Verdict on its own line: **SAFE ✓** or **USE WITH CAUTION ⚠️** or **AVOID ✗**.
3. 2–3 sentences of reasoning specific to pregnancy and week {currentWeek}.
4. If any specific ingredients are concerning, name them.
5. If AVOID/CAUTION: one natural alternative.
6. Total ≤ 150 words. Scannable, not preachy.
7. End with one specific follow-up question on a new line.
Never say "it depends." Give a clear verdict.
```

Existing voice/identity rules still apply — this just overlays structure for image turns.

### 4 · Memory update (`mem://features/ai-doula`)
Add a "Product Safety Mode" subsection: chip entry-point, verdict format, system-prompt branch trigger.

## Files touched

- `src/pages/AskDoula.tsx` — add chip, tweak camera-icon color/spinner (~25 lines).
- `supabase/functions/belly-chat/index.ts` — detect image, append safety prompt block (~15 lines).
- `mem://features/ai-doula` — document the mode.

## Explicitly NOT changing

- Vision provider stays Gemini via Lovable Gateway (no Anthropic key, no new secret).
- Image upload/preview UI, base64 handling, and storage in `chat_messages` — already working.
- Streaming, abort, quota gating, premium upsell.

## Test plan

1. Cold load `/ask` → see 5 chips, the 📸 one visibly brighter.
2. Tap 📸 chip → device camera opens directly (no sheet).
3. Snap a supplement label → preview chip appears above input, input field shows "Is this product safe for me at week N?", send button is enabled.
4. Send → user bubble shows the image + the question; camera icon swaps to spinner; doula reply streams back in the verdict format (1-line ID, **VERDICT**, reasoning, ingredients, alternative, follow-up question).
5. Tap the regular camera icon in the input pill → existing sheet still works (Take a photo / Choose from library).
6. Ask a non-image question → reply uses the normal 2–3 paragraph voice (safety block does not leak in).

## One open question

Should tapping the 📸 chip → snapping a photo **auto-send** ("Is this product safe for me at week N?"), or just prefill the input and wait for the user to tap send? Auto-send is more viral-reel friendly (one tap → answer). Default to **auto-send** unless you say otherwise.

