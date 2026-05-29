## Goal
Redesign the recipe card used on `/recipes` so a single edit updates every week (1–40) automatically. No data or routing changes.

## Where
`src/pages/Recipes.tsx` — the `.map(recipe => ...)` card block. All weekly pages render through this one component, so updating it once cascades to every week.

## New card spec

```text
┌─────────────────────────────────────┐
│                                     │
│         {Recipe Title}        ♡    │  ← 180px hero, bold solid color
│         (serif, centered)           │
│                                     │
│  [Breakfast]              [12 min]  │
├─────────────────────────────────────┤
│  Punchy one-line hook in gray       │
│                                     │
│  [🌿 Iron 8mg] [🥬 Folate 200mcg]   │
│                                     │
│ ┃ Why this week 🌱                  │
│ ┃ Full why-this-week sentence...    │
│                                     │
│  [   View full recipe →   ]         │  ← full-width orange button
└─────────────────────────────────────┘
```

- Card: `border-radius: 24px`, `background: #FFFFFF`, `border: 1px solid #F4D9C2`, `box-shadow: 0 6px 18px rgba(120,60,10,0.08)`, `overflow: hidden`, margin `10px 11px`.
- Hero: height `180px`, solid color from palette (see below), padding `16px`, flex column with title centered (`flex: 1`, center-aligned). Title in `Fraunces` serif, ~22px, weight 700, line-height 1.15, color auto-picked white or `#1a1a1a` for contrast. No emoji. Heart top-right (`♡` / `♥`) absolutely positioned, white with soft shadow. Pills bottom-left (meal type) and bottom-right (cook time) — small, `rgba(0,0,0,0.28)` bg, white text, 8px radius.
- Body padding `12px 14px 14px`.
- Hook: first sentence of `whyThisWeek`, `Outfit`, 11px, `#666`, italic, 1 line clamp.
- Nutrient pills: bg `#FDE8D8`, border `1px solid #F6D2B6`, text `#B84A10`, 9px, weight 600, 8px radius.
- "Why this week 🌱" box: left border `3px solid #E8601A`, bg `#FDF6F0`, padding `8px 10px`, radius `0 8px 8px 0`. Label `#B84A10` weight 700 uppercase letter-spacing 0.06em. Body `#666`, 9.5px, lh 1.5.
- CTA button: full width, `background: #E8601A`, color `white`, weight 700, 12px font, padding `10px`, radius `12px`, text `View full recipe →`. Whole card still clickable, but the button is the primary affordance.

## Color cycling
At the top of the file:
```ts
const HERO_PALETTE = ["#4a7c40","#d4920a","#6b8f3a","#8b4a42","#c47820","#b05a30","#a03060","#7a5030"];
const getHeroColor = (idx: number) => HERO_PALETTE[idx % HERO_PALETTE.length];
```
Apply per card by index from the `.map((recipe, idx) => ...)` so consecutive cards never repeat.

Contrast helper (inline) — luminance check on the hex; if dark, use `#FFFFFF` title, if light (e.g. `#d4920a`, `#c47820`) use `#1a1a1a`. Pills on hero always white text on dark overlay so they're readable regardless.

## What stays
- Top nutrition hero (amber gradient), category filter chips, save toggle, navigation to `/recipes/:id`, data sources. Untouched.
- `RecipeDetail.tsx` untouched.

## Notes
- The hero solid color replaces `CATEGORY_GRADIENTS[recipe.category]` for this card only. `CATEGORY_GRADIENTS` is still used by `RecipeDetail.tsx`, so we leave the export in place.
- Heart click and CTA click both `e.stopPropagation()` correctly; CTA navigates to `/recipes/${recipe.id}`.
