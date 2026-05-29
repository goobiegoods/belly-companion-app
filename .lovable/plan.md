## Goal
Make the `/community` feed feel alive and trusted for new users by expanding the existing local `SEEDED_POSTS` array from 16 → ~90 realistic human-sounding posts across all four categories, spanning weeks 4–40, with varied likes, comment counts, and timestamps over the past ~60 days.

## Why this approach
`src/pages/Community.tsx` already merges a local `SEEDED_POSTS: Post[]` array into the live feed (lines 23–40, 108–120), de-duped by title against real DB posts. No schema change, no auth user needed — just expand the array. Real posts always appear above seeded ones since they get sorted naturally by category filter + real-time updates.

## Changes

### 1. Extract & expand seeds — new file `src/data/seededPosts.ts`
- Move the existing 16 entries out of `Community.tsx` into this new file as `export const SEEDED_POSTS: Post[]`.
- Add ~74 new entries to reach **~90 total**, distributed roughly:
  - **Questions: ~30** (symptoms, gear, birth plans, partner stuff, work decisions, food safety, weird body changes nobody warned them about)
  - **Stories: ~22** (first kick, gender reveal regret, surprise twins, fast labor, slow labor, c-section recovery, rainbow baby, surrogate journey, single-mom-by-choice)
  - **Tips: ~22** (natural remedies, sleep positions, hospital bag hacks, postpartum prep, perineal massage, pelvic floor PT, lactation, specific herbs/homeopathy tied to the app's naturopathic voice)
  - **Support: ~16** (loss, anxiety, partner conflict, hyperemesis, body image, NICU, identity, fear of birth, geriatric pregnancy framing, queer pregnancy)

- Voice rules for every post:
  - First-person, lowercase-first or sentence-case openings, contractions, occasional ellipses, the odd typo-free aside in parentheses — sound like a tired pregnant person typing on their phone, not a marketing copywriter.
  - No emojis in titles. Bodies may use 0–1 emoji max.
  - Length: title 4–14 words, body 1–4 sentences (~25–80 words).
  - Diverse author first names from many cultures (avoid repeats already in the seed: Maya, Priya, Chloe, Layla, Sofia, Amara, Rania, Jade, Zara, Isla, Nina, Orel, Hana, Leila, Ava, Mia).
  - `week_posted` matches the content (a 36-week labor question shouldn't say week 12).
  - `likes`: 3–250 with a long-tail (most 5–60, a few breakout 100–250 on emotional stories).
  - `comment_count`: roughly likes ÷ 6, clamped 0–35.
  - `created_at`: spread across `now() − 1 day` to `now() − 60 days`, weighted toward the last 2 weeks so the top of the feed feels fresh.
  - `user_id: ""`, deterministic `id: "seed-{n}"`.

- Content guardrails:
  - Tips that mention herbs/remedies stay aligned with the app's existing naturopathic voice (raspberry leaf, magnesium glycinate, P6, Nux Vomica, ginger, dates in 3rd trimester, perineal oil) — never give dosing advice that could be unsafe, and never recommend essential oils internally.
  - Support posts model healthy responses ("I called my midwife", "I'm seeing a perinatal therapist") — no graphic descriptions of loss.
  - No medical claims, no brand bashing, no political content.

### 2. Update `src/pages/Community.tsx`
- Remove the inline `SEEDED_POSTS` definition and its `Post` reference duplication.
- Add `import { SEEDED_POSTS } from "@/data/seededPosts";`
- Export the `Post` interface from the new file (or keep it in `Community.tsx` and import it into the seed file — pick the seed-file-imports-Post direction to avoid circular imports).

### 3. No DB, no UI, no logic changes
- The card rendering, category filtering, dedupe-by-title, and pinned-post behavior all stay identical.
- Live posts from real users continue to take priority and merge in seamlessly.

## Out of scope
- Comments on seeded posts (they show a count but tapping in shows 0 real comments — acceptable; matches current behavior).
- Likes on seeded posts (heart icon is read-only for seeds today — unchanged).
- Any backend, auth, or schema work.
