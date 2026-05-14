
# Belly App — Full Design System Overhaul

A top-to-bottom visual rebuild of the user-facing app (5 core screens + chat) around a new tiered cream/white token system where orange becomes a true accent. Adds dark mode, renames the nav, fixes the "undefined" username bug, and ships three new shared components. The /admin dashboard is out of scope.

## 1. Foundation — design tokens + global wiring

**New token layer** in `src/index.css` (and mirrored where needed in `tailwind.config.ts`):

- Light tokens: `--color-bg-base #FDF8F2`, `--color-bg-card #FFFFFF`, `--color-bg-card-subtle #FFF5EC`, `--color-accent-primary #F47B20`, `--color-accent-light #FFE8D0`, `--color-accent-dark #C45E0A`, `--color-text-primary #1A1208`, `--color-text-secondary #6B5B4E`, `--color-text-muted #A8917E`, `--color-text-on-accent #FFFFFF`, `--color-border-default #EDE0D4`, `--color-border-strong #D4B89A`, `--color-success #2D9E6B`, `--color-danger #D94F3D`, `--color-streak-flame #FF6B1A`.
- Dark tokens (under `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)` when no explicit pref): bg `#1C1208`, card `#261A0E`, card-subtle `#2E2010`, text `#F5EDE0`/`#BFA98C`, border `#3D2B18`, accent unchanged.
- Map these into the Tailwind HSL semantic tokens (`--background`, `--foreground`, `--card`, `--primary`, `--border`, `--muted`, `--accent`) so existing `bg-card`, `text-foreground`, `bg-primary` classes pick up the new palette automatically.
- Replace the global `body { background: #e07830 }` and `#root { background: #FF8C42 }` with `--color-bg-base`. Kill any full-screen orange wrappers.
- Add a `ThemeProvider` (light/dark/system) persisted in localStorage, toggling `data-theme` on `<html>`. Toggle UI lives in Settings/Journey.

**Typography & spacing rules** baked into utility classes:
- `.text-display` (script, max 36px), `.text-section` (20px/600), body 15px / 1.65, supporting 13px / 1.6, caps label 11px / 0.08em / 500.
- Standard paddings: screen 20px, card 18px, gap-card 14px, gap-section 28px, nav 64px, content bottom 80px.
- Card preset: `bg-card border border-[--color-border-default] rounded-[18px] shadow-[0_2px_12px_rgba(180,100,20,0.06)]`.
- Button presets (primary pill, secondary outlined pill, chip pill 36px) added as reusable classes / a small `<Button>` variant set so the entire app can swap to them.

## 2. Global fixes

- **Bottom nav** (`src/components/BottomNav.tsx`): rename labels to Today / Baby / Ask Bella / Mamas / Shop / Journey. Light-card background, top border, active = orange icon+label, inactive = `--color-text-muted`. Keep existing Shop "1" badge logic; remove any others.
- **Username fallback**: utility `displayName(user)` returning `"Mama"` for null/undefined/string `"undefined"`. Apply in Community feed, post detail, comments, profile references.
- **Routes** in `src/App.tsx` unchanged; only labels/icons change.

## 3. Screen-by-screen

- **Today (HomePage)**: rebuild Hero card (white card with gradient-border glow, Bella avatar + green pulse dot + "online now…", display headline split across serif/script, new subhead copy, white search input with orange send button). Suggestion chips become a single horizontally scrollable row including new "I'm scared about…" chip. Week card redesigned (white, caps label, big script week #, new emotional fact w/ italic emphasis, 80px floating fruit emoji, outlined stat pills, "Share my week" button). Add streak callout strip just above bottom nav linking to Journey.
- **Baby (BabyTracker)**: cream background, smaller script header, white hero card with 120px floating fruit + restyled stat tiles, **remove** the redundant bottom "Baby Size" repeat card. Week browser → label "Peek ahead →", filled current chip, lock icon on future weeks, tapping locked week opens Premium bottom sheet. Baby Development card gets a divider + new "SENSES THIS WEEK" sub-block.
- **Ask Bella (AskDoula)**: rename header to "Ask Bella" with Bella avatar + animated green pulse dot, subtitle "Knows your history · Week 23 · 2nd pregnancy". Cream chat background. User bubble = orange/white text/asymmetric radius; Bella bubble = white card with 1px border + 20px avatar to its left. Replace typing dots with new `DoulaLoadingState` (skeleton line + "Bella is reading your Week 23 profile…" + bouncing orange dots). Remove the "1/10 free messages" inline counter; after the 8th message in a session show a dismissible accent-light banner above the input with an "Unlock Unlimited" CTA opening the Premium sheet. Restyle input bar (white pill, 52px, muted camera icon, orange send circle).
- **Mamas (Community)**: cream header, dark script title, primary "+ Post" pill, secondary bell icon. Week cohort becomes a tappable accent-light pill. Filter tabs use new pill style. Post cards switch to white/border/18px radius with restyled avatar, week badge, outlined category tag, muted counts. Add **sensitive-content** handling: posts tagged "Story" matching keywords (premature, NICU, loss, miscarriage, complication, stillbirth, preeclampsia) replace preview with the italic muted "tap when you're ready to read" line; full content only on detail tap. Add new top-of-feed "Share your moment" prompt card (gradient white→subtle, secondary outlined CTA, dismissible, persisted in localStorage).
- **Journey (Profile)**: cream header, avatar with orange ring, restyled name/meta, accent-light "2nd pregnancy" pill. **Promote streak** to its own dedicated card above the stat row (large flame, 32px count, copy + 3/7 progress bar + optional "🛡 You're protected today"). Stat row reduced to 2 tiles (week / days to go). Section renamed "MY MILESTONES" with locked tile treatment + progress hint line. "MY PREGNANCY" list items become white cards with emoji + chevron. New Upgrade card above Settings with subtle gradient, glowing orange border, full-width primary CTA opening the Premium sheet. Theme toggle (light/dark/system) added in Settings.

## 4. New components

- `src/components/ShareableMilestoneCard.tsx` — 1080×1920 cream canvas, illustrated fruit, big script "week N", emotional fact, Belly wordmark, faint corner circles. Renders via `html-to-image` and triggers `navigator.share({ files })` with download fallback (mirroring existing `ShareableWeekCard` infra). Wired to a "Share my week" CTA on Home and Journey.
- `src/components/PremiumUpgradeSheet.tsx` — bottom sheet (handle, script headline, subhead, 3 checkmark features, 9.99/mo + 59.99/yr pricing block, full-width primary "Start free 7-day trial", "Maybe later" link, safe-area padding). Single shared instance triggered from: locked future week (Baby), 8th-message banner (Ask Bella), Journey upgrade card.
- `src/components/DoulaLoadingState.tsx` — skeleton line + italic status copy + 3-dot orange bounce. Used inside Ask Bella while awaiting AI response.

## 5. Out of scope / constraints

- No data, routing, API, or backend changes except the username fallback utility and the per-session 8-message banner counter (client-side only).
- /admin dashboard untouched.
- All work stays in frontend / presentation code. Existing animations preserved; new ones honor `prefers-reduced-motion`.
- Verified at 390px viewport.

## Technical notes

- Tokens live in `src/index.css`; Tailwind HSL semantic variables remap to them so existing components inherit the palette without per-file edits.
- Theme toggle: `<html data-theme="light|dark">` + `localStorage("belly-theme")`; default = system. No external lib.
- Sensitive-keyword detector: pure function in `src/lib/community.ts` taking title + body, returning boolean.
- Session message counter for Ask Bella: `useRef`/state in chat page; banner dismissal stored in `sessionStorage`.
- Premium sheet uses existing `Sheet`/`Drawer` shadcn primitives for accessibility.
