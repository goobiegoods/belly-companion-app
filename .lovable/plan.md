

# BELLY App Fixes — Courses Overhaul, Chat UI, Community

## Overview
Three sections of changes applied in one pass: complete Courses rebuild with rich lesson content, AI Chat UI improvements, and Community bug fixes with seeded data.

## Database Changes
Create 3 new tables via migration:
- `lesson_reflections` (id, user_id, lesson_id, reflection_text, created_at) with RLS for authenticated users on own rows
- `quiz_attempts` (id, user_id, lesson_id, selected_option, is_correct, created_at) with RLS
- `course_completions` (id, user_id, course_id, completed_at, lessons_count) with RLS

Seed 6 community posts into `posts` table using a system/admin user_id (since RLS requires user_id match, we'll use a SQL insert in the migration with a fixed UUID for seeded content, with an RLS-bypassing approach).

## Section A — Courses Overhaul

### 1. Update `src/data/coursesData.ts`
- Add `emoji`, `duration`, and `tags` fields to the Course interface
- Add emoji mapping, estimated duration per course, and topic tags for all 12 courses

### 2. Create `src/data/lessonContent.ts`
- Full lesson content data for all 6 First Trimester Basics lessons
- Each lesson contains: intro, whatYoullLearn (bullet points), sections (heading + body + optional tip), didYouKnow, reflection question, quiz (question + options + correctIndex + explanation), keyTakeaway
- Other courses get generated placeholder content

### 3. Rewrite `src/pages/Courses.tsx` completely
Three views managed by state:

**Course List View:**
- Header: "Your courses" 26px Georgia + subtitle with course count
- Hero progress card (bg #FFB899, border-radius 20px) with eyebrow, title showing X of Y lessons, 6px progress bar, 3 stat pills, decorative orb
- Filter tabs (All / Trimester / Wellness / Birth prep / Saved) in horizontal scroll
- Section labels between category groups
- Course cards with: 52x52 emoji thumbnail, category label, title, meta (lessons + duration), CTA or premium lock, progress row if started, topic tags

**Lesson Reader View (the big one):**
- Header bar with back button, truncated course title, "Lesson X of Y" pill
- Lesson hero (bg #FFB899) with eyebrow, title, duration pill, progress dots
- 7 content blocks: Intro, What You'll Learn callout, Main Sections with tip boxes, Did You Know, Reflection (textarea saving to `lesson_reflections` on blur), Quick Quiz (interactive MCQ saving to `quiz_attempts`), Key Takeaway (dark bg)
- Sticky bottom bar: Previous + Complete & Continue buttons
- On last lesson completion: full-screen course completion celebration

**Course Completion Screen:**
- Full screen bg #FFB899, checkmark circle, congratulations, stats, back button

## Section B — AI Chat Fixes

### 1. Update Edge Function system prompt (`supabase/functions/belly-chat/index.ts`)
Replace the SYSTEM_PROMPT with the new structured formatting instructions (emoji bullets, clear line breaks, grouped tips, warm sign-off)

### 2. Update `src/pages/AskDoula.tsx`
- Add back button "← Home" in the header (navigates to `/` using `useNavigate`)
- Keep ReactMarkdown rendering (already handles bold, line breaks, lists)
- Add proper prose styling so markdown renders with correct spacing, line height, bullet styling in the peach theme

## Section C — Community Fixes

### 1. Fix Create Post Bottom Sheet (`src/pages/Community.tsx`)
- Restyle title input: Georgia italic placeholder, bg #FFF8F5, border #FFE4D4, border-radius 12px
- Restyle body textarea: Georgia italic placeholder, bg #FFF8F5, min-height 120px
- Category pills with proper selected/unselected styling, default "question"
- Post button: disabled when title empty (not when body empty — body can be optional), proper styling
- Fix: the current code requires both title AND body — the submission logic itself works, but the UX makes it unclear. Will ensure the flow is obvious and functional.

### 2. Upgrade Post Card Visual
- Category-specific color pills (Question=#FFF0E8, Story=#FFE8F0, Tip=#F0FAF4, Support=#FFF4E8)
- Bottom row with border-top separator, proper spacing
- Press animation scale(0.975)

### 3. Post Detail Screen Upgrade
- Full header with back + category pill
- Full post content with Georgia serif title, body with line-height 1.75
- "Replies" section label
- Styled comment input bar with Georgia italic placeholder, send button bg #FFB899

### 4. Seed Community Posts
- Insert 6 seeded posts via migration (using a service-level insert that bypasses RLS since these are system posts). Use a generated UUID as a "system" user_id for seeded content.

## Technical Details

**Files modified:**
- `src/data/coursesData.ts` — add emoji, duration, tags
- `src/data/lessonContent.ts` — new file with full lesson content for c1
- `src/pages/Courses.tsx` — complete rewrite
- `src/pages/AskDoula.tsx` — add back button, improve markdown rendering
- `src/pages/Community.tsx` — fix post creation, upgrade cards, detail screen
- `supabase/functions/belly-chat/index.ts` — update system prompt
- Migration SQL — create 3 tables + seed 6 posts

**No changes to:** Home, Baby Tracker, Profile, Auth, Journal, BottomNav, AuthContext, or existing table schemas.

