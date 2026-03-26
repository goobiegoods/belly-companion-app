

# BELLY — Design System + Can't Sleep + Interactive Quizzes

## Overview
Three-part update: (1) warm orange design system across all screens, (2) new Can't Sleep screen with affirmations/quiz/breathing, (3) reusable QuizBlock component replacing static quizzes, plus full lesson content for all 12 courses.

## Part 1 — Design System Overhaul

### Global CSS (`src/index.css`)
- Change body/root background to `#FEF8F4`
- Update font-family to `-apple-system, 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif`
- Update `.belly-glass` card styles: `rgba(255,255,255,0.68)`, `blur(16px)`, border `0.5px solid rgba(255,170,130,0.22)`, shadow `0 2px 14px rgba(255,140,90,0.07)`, radius `17px`
- Update `.belly-glass-nav`: `rgba(254,248,244,0.88)`, `blur(22px)`, border-top `0.5px solid rgba(255,170,130,0.18)`
- Update `.belly-hero-gradient`: `linear-gradient(140deg, #FF7E48 0%, #FFA070 55%, #FFBE98 100%)`, shadow with orange tones
- Add float keyframe for Can't Sleep moon

### Apply warm orange text colors across all screens
Replace `#2A1200` titles → `#C85828` for screen titles, `#A84E28` for card titles
Replace `#D4906A` body → `#C4906A`
Replace `#D4B0A0` hints → `rgba(180,100,60,0.38)`
Section labels → `rgba(200,88,40,0.4)`

Files touched: `HomePage.tsx`, `BabyTracker.tsx`, `AskDoula.tsx`, `Community.tsx`, `Courses.tsx`, `Profile.tsx`, `Journal.tsx`, `Shop.tsx`, `BottomNav.tsx`

### Navbar (`BottomNav.tsx`)
- Active color: `#FF7840`, inactive: `rgba(180,100,60,0.35)`
- Active pip: `width: 16px, height: 2px`, gradient `#FF7840 → #FFBA90`
- Labels: `6px` uppercase

### This week mini cards (HomePage)
- Baby: `rgba(255,242,234,0.82)` border `rgba(255,180,140,0.3)`
- Body: `rgba(238,252,240,0.82)` border `rgba(140,210,160,0.28)`
- Tip: `rgba(248,242,255,0.82)` border `rgba(190,155,240,0.28)`

### Community category colors
- Question: `rgba(255,210,185,0.35)` text `#E07040`
- Tip: `rgba(200,240,208,0.35)` text `#40A060`
- Story: `rgba(225,210,252,0.35)` text `#9060D0`
- Support: `rgba(255,240,200,0.35)` text `#B08020`

### Profile hero + achievements
- Avatar double-ring with white/transparent shadows
- Achievement badges locked: `opacity: 0.22`
- Streak number: `font-weight: 300`, color `#FF7840`

## Part 2 — Can't Sleep Screen

### New file: `src/pages/CantSleep.tsx`
Full-screen dark-themed experience with 3 tabs:

**Affirmations tab**: Horizontal scroll of 4 dark gradient category cards → tap opens fullscreen affirmation viewer cycling through 24 hardcoded affirmations with dot nav and random ordering.

**Baby Quiz tab**: Dark-themed quiz using QuizBlock component (Part 3) with 10 pregnancy trivia questions. Score tracking top-right. Questions cover baby size by week, sense development, myths vs facts, natural remedy trivia.

**Breathe tab**: Dark purple UI with concentric rings animation, breathing bubble that scales 1→1.35 on 4-7-8 pattern (4s inhale, 7s hold, 8s exhale), countdown timer, start/stop button.

### New file: `src/data/cantSleepData.ts`
- 24 affirmations array
- 10 baby quiz questions with emoji options, correct answers, fun facts
- Breathing exercise config

### Route + entry point
- `src/App.tsx`: Add `/cant-sleep` route (ProtectedRoute, no AppLayout — fullscreen)
- `src/pages/HomePage.tsx`: Add purple-tinted entry card below check-in card linking to `/cant-sleep`

### Database (migration)
```sql
CREATE TABLE public.affirmation_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affirmation_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affirmation_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own views" ON public.affirmation_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own views" ON public.affirmation_views FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text,
  score integer,
  total_questions integer,
  selected_option text,
  is_correct boolean,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

## Part 3 — Interactive QuizBlock Component

### New file: `src/components/QuizBlock.tsx`
Reusable component with props:
```ts
interface QuizOption { text: string; emoji: string; correct: boolean; funFact: string; }
interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  onAnswer?: (correct: boolean) => void;
  darkTheme?: boolean; // for Can't Sleep
  progressDots?: { total: number; current: number };
}
```

Features:
- Gradient header with question text and progress dots
- 2x2 grid of emoji + text option cards
- Correct → green bg + scale animation + checkmark
- Wrong → red bg + shake + correct highlights green
- Result card slides in with fun fact
- "Continue lesson →" button after answering
- Dark theme variant for Can't Sleep quiz

### Replace quiz in lesson reader (`Courses.tsx`)
- Import QuizBlock, replace lines 170-197 (the static quiz block) with `<QuizBlock>` using adapted lesson quiz data
- Map existing `LessonQuiz` format to `QuizOption[]` format

### Update lesson content (`src/data/lessonContent.ts`)
- Update `LessonQuiz` interface to include `options` as `QuizOption[]` format with emoji + funFact per option
- Write real quiz content for ALL 12 courses (not just c1):
  - c1 (6 lessons): heart beating week, B6 for nausea, mercury fish, prenatal anxiety stats, dating scan, sleep position week
  - c2 (5 lessons): ginger research, acupressure points, B6 dosing, small meals science, hyperemesis signs
  - c3 (7 lessons): quickening week, anatomy scan timing, round ligament, baby hearing, glucose test, baby position, skin changes
  - c4 (8 lessons): Braxton Hicks, engagement, hospital bag essentials, mucus plug, GBS test, perineal massage, birth positions, when to call
  - c5 (6 lessons): herb safety categories, essential oil dilution, raspberry leaf timing, arnica uses, chamomile safety, ginger forms
  - c6 (7 lessons): folate vs folic acid, iron absorption, caffeine limits, listeria foods, DHA sources, calcium needs, vitamin D
  - c7 (5 lessons): left side sleeping, melatonin safety, sleep hygiene, pregnancy pillow positions, RLS remedies
  - c8 (6 lessons): cortisol effects, box breathing, mindfulness evidence, journaling benefits, anxiety vs worry, partner support
  - c9 (5 lessons): birth plan components, pain relief options, delayed cord clamping, skin to skin evidence, birth preferences vs plan
  - c10 (8 lessons): breathing patterns, TENS machines, water birth evidence, hypnobirthing, counter pressure, visualization, vocalizing, transition phase
  - c11 (6 lessons): early labor signs, active labor dilation, transition description, pushing positions, placenta delivery, golden hour
  - c12 (7 lessons): fourth trimester, lochia stages, breastfeeding initiation, postpartum mood, pelvic floor, newborn sleep, support systems

Each quiz has 4 options with emoji, correct flag, and educational fun fact.

Also update all placeholder lesson content (the fallback in `getLessonContent`) with real course-specific content — specific section headings, real tips, real did-you-know facts, specific reflection prompts.

## Files Summary

**New files:**
- `src/components/QuizBlock.tsx`
- `src/pages/CantSleep.tsx`
- `src/data/cantSleepData.ts`

**Modified files:**
- `src/index.css` — design tokens, keyframes
- `src/App.tsx` — add /cant-sleep route
- `src/pages/HomePage.tsx` — warm orange colors, Can't Sleep entry card
- `src/pages/Courses.tsx` — warm orange colors, QuizBlock integration
- `src/data/lessonContent.ts` — full real content for all 12 courses with interactive quizzes
- `src/components/BottomNav.tsx` — warm orange active states
- `src/pages/BabyTracker.tsx` — warm orange colors
- `src/pages/AskDoula.tsx` — warm orange colors
- `src/pages/Community.tsx` — warm orange colors, updated category colors
- `src/pages/Profile.tsx` — warm orange colors, achievement opacity
- `src/pages/Journal.tsx` — warm orange colors
- `src/pages/Shop.tsx` — warm orange colors
- Migration SQL for `affirmation_views` + `quiz_attempts` tables

**No changes to:** routing structure (except adding /cant-sleep), existing Supabase tables, auth logic

