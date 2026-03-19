

# BELLY — Natural Wellness Virtual Doula App

## Overview
A mobile-first pregnancy companion app with warm peach design language, AI doula chat, baby tracking, community forum, courses, and journaling.

## Phase 1: Foundation & Design System
- Set up the full peach color palette as CSS custom properties (#FFE8D6, #FFB899, #FFE4D4, #FFF0E8, #FFF4EE, #D4906A, #D4B0A0, #2A1200, etc.)
- Configure Georgia serif + system-ui typography tokens
- Build reusable styled components: PeachCard, PeachButton, PeachInput, PeachBadge, Avatar with initials, BottomSheet
- Create global interaction styles (press scale, input focus glow, border-radius tokens)
- Create the static pregnancy data file (`pregnancyWeeks.ts`) with all 40 weeks of real data (sizes, development, symptoms, tips)

## Phase 2: Auth & Onboarding
- Enable Lovable Cloud for database + auth
- Build Sign Up and Sign In screens with peach-themed styling and logo
- Create `profiles` table (user_id, first_name, due_date, pregnancy_number, has_provider, is_premium, premium_since, premium_expires_at, onboarding_completed)
- Build 3-step onboarding flow: Welcome → Tell us about you (form saving to profiles) → Week reveal with baby size
- Route logic: new users → onboarding, returning users → home

## Phase 3: App Shell & Navigation
- Bottom tab navigation with 5 tabs: Home, Baby, Ask, Community, Me
- Active/inactive states with peach dot indicator
- Route setup for all main screens

## Phase 4: Home Screen
- Header with BELLY logo + greeting pill ("Hi, [name] 🌸")
- Hero card showing current pregnancy week, progress bar, stats pills
- "This week" horizontal scroll cards (baby size, body changes, daily tip)
- "Your journey" action cards (Ask the Doula, Today's Course)
- Community preview section with latest posts
- Daily check-in prompt card if not completed today

## Phase 5: Baby Tracker Screen
- Hero card with large week number and baby size comparison
- Week-by-week horizontal scroll strip (weeks 4–40)
- Week detail card with development, size, symptoms, natural tip sections
- Trimester overview cards (T1/T2/T3)
- Kick counter with Supabase persistence (`kick_counts` table)

## Phase 6: AI Doula Chat
- Edge function calling Lovable AI gateway with the doula system prompt
- Streaming chat UI with peach-styled user/doula bubbles
- Quick prompt cards when chat is empty (4 suggestions in 2×2 grid)
- Thinking indicator with pulsing dots
- AI disclaimer below every response
- Message limit tracking (10/day for free users) with upgrade banner
- Inline upsell after every 3rd response

## Phase 7: Community Forum
- Create `posts`, `comments`, `post_likes` tables with RLS
- Feed with category filter tabs (All, My Trimester, Questions, Stories, Tips)
- Post cards with author info, week badge, like/comment counts
- Post detail screen with threaded comments
- Create post bottom sheet with title, body, category selector
- Warm empty states

## Phase 8: Courses System
- Create `courses`, `course_lessons`, `lesson_completions` tables
- Seed course data (12 courses across 3 categories with free/premium flags)
- Course list screen with category sections and progress indicators
- Lesson detail screen with content reader
- Completion tracking with checkmarks
- Premium lock UI on gated courses

## Phase 9: Journal & Symptom Tracker
- Create `journal_entries` table (mood, symptoms array, note, week_number)
- Daily check-in: mood selector (5 options) + symptom chips + free write
- Journal history grouped by week
- Accessible from Me tab and Home screen

## Phase 10: Profile & Settings
- Profile hero card with avatar, name, week, due date
- Stats row (week, days to go, trimester)
- Settings sections: My Pregnancy, Notifications (UI only), Premium upgrade card, Account management
- Sign out functionality
- Premium upgrade modal (bottom sheet with pricing, benefits, mock CTA)

## Phase 11: Polish & States
- Loading skeletons in peach tones for all screens
- Empty states with warm messaging and CTAs
- Weekly milestone celebration screen on new week detection
- Success toasts in peach theme
- Forgot password flow

