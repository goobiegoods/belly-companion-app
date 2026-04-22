

# Belly — Update doula system prompt

## What's changing

The user provided a new SYSTEM_PROMPT that significantly evolves Belly's voice and behavior. Note: the user's comment references `doula-chat/index.ts`, but the actual edge function in this project is `belly-chat/index.ts`. I'll update that one (the only chat function wired into `AskDoula.tsx`).

## Key shifts in the new prompt

1. **Tone** — still poetic & natural-medicine focused, but now explicitly "addictive to talk to" and "brilliant friend" rather than a strict format.
2. **Structure** — relaxes the rigid "no lists ever" rule into "2-3 paragraphs max, each with one focus."
3. **Mandatory follow-up question** — every response MUST end with one specific, personal follow-up question on a new line. This is the bonding mechanic.
4. **Modalities expanded** — explicit pattern names: TCM ("Spleen qi deficiency", "SP3"), Ayurveda ("Vata aggravation", Abhyanga), homeopathy with potency + dosing, herbalism with prep instructions.
5. **Safety rule simplified** — only refers to midwife/doctor for genuinely serious symptoms (heavy bleeding, severe pain, reduced movement after 28w, preeclampsia signs); never as a cop-out.
6. **User context placeholders** — `{userName}`, `{currentWeek}`, `{pregnancyNumber}`, `{todaysMood}`, `{recentSymptoms}`. The frontend currently only sends raw messages, not these fields, so the placeholders will sit unfilled in the system prompt unless we also wire context injection.

## Two-part fix

### Part 1 — Replace the SYSTEM_PROMPT in `supabase/functions/belly-chat/index.ts`

Drop in the new prompt verbatim. Keep the rest of the file unchanged: streaming, CORS, error handling, model (`google/gemini-3-flash-preview`), Lovable AI gateway call.

### Part 2 — Inject real user context so the placeholders work

Without this, `{userName}` etc. render literally to the model and weaken the persona.

**Frontend (`src/pages/AskDoula.tsx`)**: when calling `belly-chat`, send a `userContext` object alongside `messages`:
```ts
body: JSON.stringify({
  messages: apiMessages,
  userContext: {
    userName: displayName,
    currentWeek,
    pregnancyNumber: profile?.pregnancy_number ?? 1,
    todaysMood: null,        // not tracked yet — send null
    recentSymptoms: null,    // not tracked yet — send null
  },
})
```

**Edge function**: read `userContext` from the request body, then do a simple string-replace on the system prompt before sending it to the AI gateway. Missing fields fall back to neutral values (`"mama"`, `"this week"`, `"first"`, `"none logged today"`, `"none"`).

This keeps the prompt template clean and lets us add real mood/symptoms data later from `daily_logs` / `journal_entries` without changing the prompt.

## Files touched

- `supabase/functions/belly-chat/index.ts` — replace SYSTEM_PROMPT, add `userContext` parsing + placeholder substitution.
- `src/pages/AskDoula.tsx` — extend the fetch body with `userContext` (one small object literal in `sendMessage`).
- `mem://features/ai-doula` — refresh persona notes: new "addictive friend" tone, mandatory follow-up question, expanded modality vocabulary, dynamic user context injection.

## What stays untouched

- Streaming SSE flow, abort controller, model choice, CORS headers.
- `chat_messages` persistence, daily quota count, premium gating.
- Image-attach flow (the new prompt doesn't address images explicitly; existing image handling continues to work, and the prompt's general "natural medicine" voice still applies).
- All UI — header, chips, sticky input, greeting bubble.

## Test plan

1. Open `/ask` cold → send "I can't sleep tonight" → reply should be 2-3 paragraphs, mention specific remedies (e.g. Passionflower tea, Coffea Cruda 30c, P6 acupressure), and end with a personalized follow-up question on its own line.
2. Send "I'm having round ligament pain on my right side" → reply should reference the right side specifically and ask a specific follow-up like "Is it sharper when you stand up, or more of a dull ache when you lie down?"
3. Send "I'm bleeding heavily" → reply should be the short emergency message directing to midwife/doctor today, nothing else.
4. Verify the assistant addresses the user by their actual first name and current pregnancy week in early replies.

