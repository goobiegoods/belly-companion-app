

# Replace System Prompt in belly-chat Edge Function

## What Changes
Replace the `SYSTEM_PROMPT` string in `supabase/functions/belly-chat/index.ts` (lines 8–30) with the new naturopathic doula prompt. Nothing else changes — no model, no API structure, no UI.

## Technical Detail

**File:** `supabase/functions/belly-chat/index.ts`

Replace the entire `const SYSTEM_PROMPT = \`...\`;` block (lines 8–30) with the new prompt covering:
- Belly's voice and personality (warm prose, no lists, no bullet points)
- Non-negotiable rules (no pharma, no "provider", no generic advice)
- Medicine toolkit (homeopathy, herbs, Ayurveda, TCM, mindfulness)
- Response format (acknowledgment → flowing prose with emoji separators → closing encouragement)
- Emergency override for dangerous symptoms

No other lines in the file change. The edge function will be auto-deployed.

