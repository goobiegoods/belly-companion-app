

# Continue BELLY App Fixes — Remaining Work

## What's Already Done
- Fix 1 (Community post submission + reply bar): **Done** — create post sheet, reply input, post detail all working
- Database migration for notifications table + trigger: **Done**
- Course list + lesson reader UI: **Done**
- First Trimester (c1) lesson content: **Done** (6 lessons with real content)
- Chat system prompt update: **Done**
- Chat back button: **Done**

## What's Still Missing

### 1. Community Notifications UI (Fix 2)
- Bell icon in Community header with red unread dot
- Notifications bottom sheet (list with read/unread states, tap to navigate)
- Unread dot badge on Community tab in BottomNav

### 2. Reflection Save Button (Fix 3A)
- Add explicit "Save my reflection 💭" button below textarea in lesson reader (currently only saves on blur)
- Show "Saved 🌸" confirmation in sage green

### 3. Real Lesson Content for c2–c12 (Fix 3B)
- Replace generic `getLessonContent` fallback with real pregnancy-accurate content for all 11 remaining courses (c2–c12)
- Use AI gateway script to generate content, then write to `lessonContent.ts`

### 4. Chat Photo Upload (Fix 4)
- Camera icon button left of text input in AskDoula
- File input (take photo / choose from library)
- Thumbnail preview with X to remove
- Send image as base64 multimodal message
- Update edge function to pass image content
- Add product safety instructions to system prompt
- User bubble image rendering
- 5th quick prompt "Is this product safe? 📷"

### 5. Baby Size SVG Illustrations (Fix 5)
- Create `BabySizeIllustration.tsx` with inline SVGs for all 40 weeks
- Integrate into BabyTracker hero (80x80) and week detail (60x60)

### 6. Homepage Refinements (Fix 6)
- Fix greeting to title-case first name only
- Replace header icon with belly/womb silhouette
- Add BabySizeIllustration to hero card (72x72, right side)
- Fix description truncation (full first sentence)
- Differentiate "This week" cards with pastel backgrounds (peach, sage, pink)
- Fix subtitle text size to 13px with line-height 1.55

### 7. Global Accent Colors (Fix 7)
- Add CSS vars for sage green (#C8E6C0/#2D5A27) and blush pink (#FFD4E0/#8B2252)
- Completed lesson checkmarks → sage green circle (partially done, using #A8D4B8)
- Kick counter button → bg #FFD4E0, color #8B2252
- Week milestone area on Baby tab → soft pink tint

## Implementation Plan

**Step 1: Database & Notifications UI**
- Add bell icon + notifications bottom sheet to `Community.tsx`
- Query `notifications` table for unread count
- Update `BottomNav.tsx` to show red dot on Community tab

**Step 2: Lesson Reflection Save Button**
- Add save button below textarea in Courses.tsx lesson reader
- Track saved state, show confirmation

**Step 3: Real Lesson Content (c2–c12)**
- Use AI gateway to generate pregnancy-accurate lesson content for all 11 courses
- Write comprehensive `lessonContent.ts` with real section headings, facts, quizzes, reflections

**Step 4: Chat Photo Upload**
- Update `AskDoula.tsx` with camera button, file input, thumbnail preview, base64 encoding
- Update `belly-chat/index.ts` edge function to handle multimodal messages and add product safety system prompt

**Step 5: Baby Size SVGs**
- Create `BabySizeIllustration.tsx` with simple inline SVGs for 40 weeks in peach tones

**Step 6: Homepage Polish**
- Update `HomePage.tsx` with title-case name, belly icon, illustration, pastel card backgrounds, truncation fix

**Step 7: Global Accent Colors**
- Update `index.css` with sage/pink vars
- Update kick counter in `BabyTracker.tsx`
- Ensure completed lesson checkmarks use sage green consistently

## Technical Details
- Files to create: `src/components/BabySizeIllustration.tsx`
- Files to modify: `src/pages/Community.tsx`, `src/components/BottomNav.tsx`, `src/pages/Courses.tsx`, `src/data/lessonContent.ts`, `src/pages/AskDoula.tsx`, `supabase/functions/belly-chat/index.ts`, `src/pages/BabyTracker.tsx`, `src/pages/HomePage.tsx`, `src/index.css`
- No new database migrations needed (notifications table + trigger already exist)

