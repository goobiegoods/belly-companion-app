
# Belly App — Surgical Fix Pass

Targeted fixes only. Design system tokens already exist in `src/index.css` — I'll reuse them. No re-theming.

## 1. Shop screen rewrite (`src/pages/Shop.tsx`)
- Replace orange page background with `--color-bg-base`.
- Header: serif "Belly Shop" title in `--color-text-primary`, 13px secondary subtitle, cart icon in `--color-text-secondary` with orange badge.
- Hero banner: white card with 4px left orange accent border. Headline `--color-text-primary`, body `--color-text-secondary`, "Shop all →" as outlined orange button.
- Filter tabs: active = orange filled pill / white text; inactive = transparent + secondary text.
- "REMEDY KITS" label: 11px caps, `--color-text-muted`.
- Product cards (apply to ALL kits — Trimester 1, Trimester 2, etc.):
  - White bg, `1px solid --color-border-default`, 18px radius, soft shadow.
  - 90px circle backdrop in `--color-bg-card-subtle` holding 56px emoji.
  - Badge in `--color-accent-light` / `--color-accent-dark`.
  - Name 15px primary, tagline 13px secondary, ingredients 12px muted.
  - Price 20px bold orange. Full-width orange "Add to cart →" button.

## 2. Undefined name bug
Add `getDisplayName(user)` helper to `src/lib/community.ts` (filters `undefined`/`null`/empty parts, returns `"Mama"` fallback) and wire it into:
- `src/pages/Community.tsx` (post author, comments)
- `src/pages/Profile.tsx` header
- Anywhere else `first_name`/`last_name` concat appears (grep first).

## 3. Baby screen (`src/pages/BabyTracker.tsx`)
- Rebuild horizontal week chip row (1–40):
  - 40×40 circles, 13px number, no wrap, horizontal scroll, hide scrollbar.
  - Past: subtle bg + muted text. Current: orange bg + white + scale(1.1). Future: card bg + border + 8px lock icon.
  - Tap on locked week → opens `PremiumUpgradeSheet`.
  - On mount, scroll current week to center.
- Delete the duplicate "Baby Size · grapefruit · 28.9cm · 500g" card below the stats row.
- Add 170px `#FFF0E0` circle backdrop behind 120px fruit illustration with 3s float animation (respect `prefers-reduced-motion`).

## 4. Ask Bella (`src/pages/AskDoula.tsx`)
- Header title: "Ask Bella". Subtitle dynamic: `"Knows your history · Week {week} · {ordinal} pregnancy"` from `profile`.
- Doula response bubble body text → `--color-text-primary` (#1A1208). Keep orange only for "Bella" label and a single emphasis word.
- Replace "AI · LIVE" badge with 28px circular `--color-accent-light` avatar showing 🌸 + 6px green pulse dot (CSS keyframe scale 1→1.3→1, opacity 1→0.6→1, 2s infinite).

## 5. Home week card (`src/pages/HomePage.tsx`)
Restack to centered vertical:
- "YOU'RE IN" caps centered.
- "week 23" 44px script orange centered.
- 100px fruit on 130px `#FFF0E0` circle, float anim.
- Centered emotional copy with second line italic orange.
- Centered pills row "{n} weeks to go" + "Trimester {n}".
- Full-width outlined "Share my week 📸" button.

## 6. Community (`src/pages/Community.tsx`)
- Filter tabs row → flex row, `overflow-x:auto`, no wrap, hidden scrollbar, touch scrolling. Active = orange pill, inactive = card bg + border + secondary text.
- Restore post footer: `♥ {likes} 💬 {comments}` — heart orange when liked, muted when not, 13px secondary font.

## 7. Journey (`src/pages/Profile.tsx`)
- New streak hero card above stat tiles: 🔥 + count on left, "{n}-day streak" + sub copy + 6px progress bar (3/7 toward Week Streak badge) + muted progress label, optional shield row at bottom when checked-in today.
- Reduce stat tiles from 3 → 2 (Week, Days to Go).
- New Premium upgrade card above Settings: white bg, orange border + soft glow, ✨ + headline + sub + 3 checkmark rows (success green) + full-width orange "See Premium Plans" CTA opening `PremiumUpgradeSheet`.

## 8. Home suggestion chips
Force single horizontal scroll row (`flex-wrap:nowrap`, `overflow-x:auto`, hidden scrollbar, touch scrolling). Already mostly set — verify and fix `flex-wrap`.

## Final audit pass
After edits, grep for:
- Full-screen orange backgrounds (`background:#FF8C42`, `bg-primary` on page roots).
- Orange body copy inside cards/bubbles → swap to `--color-text-primary`/`secondary`.
- Confirm orange remains only on CTAs, active nav, numeric highlights, prices, selected chips.

## Technical notes
- All new styles use existing tokens from `src/index.css` (`--color-bg-base`, `--color-bg-card`, `--color-bg-card-subtle`, `--color-accent-primary`, `--color-accent-light`, `--color-accent-dark`, `--color-text-primary/secondary/muted`, `--color-border-default`, `--color-success`, `--color-streak-flame`).
- Reuse existing `PremiumUpgradeSheet` for locked-week + Premium CTA.
- Reuse `safeDisplayName` infrastructure in `src/lib/community.ts`; add `getDisplayName(user)` alongside.
- No backend, routing, or schema changes.
