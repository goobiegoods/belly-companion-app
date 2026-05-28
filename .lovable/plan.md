## Replace /breathe with full premium breathing experience

Completely rewrite `src/pages/BellyBreathe.tsx` as a multi-step flow with its own state machine. Add a persistent breathing streak in the database and surface it on the Journey screen.

### Flow overview

```
step: "intention" → "technique" → "duration" → "session" → "complete"
```

State held at top of `BellyBreathe`:
- `step`
- `intention` (id, emoji, label, sessionSubtext, completionSubtext)
- `technique` ("478" | "box" | "44")
- `duration` (1 | 3 | 5 | 10 minutes → rounds)
- session runtime: `round`, `phase` ("inhale"|"hold"|"exhale"), `count`, `paused`, `elapsedSec`
- `slideDir` ("forward"|"back") to drive a CSS slide-left/right transition between steps

Step shell: shared `<SessionBackground>` component renders the `linear-gradient(160deg,#E8702A,#C84E08 55%,#A83800)` plus the two absolutely-positioned radial blobs (top-left 280×280 warm highlight, bottom-right 220×220 ember). Each step is wrapped in a `key={step}`-driven `animate-slide-in-right` / `animate-slide-out-right` div so transitions feel like a real onboarding wizard. Hide `BottomNav` for this route (remove `/breathe` from `AppLayout` wrap in `src/App.tsx` and render BellyBreathe full-bleed).

### Step 1 — Intention picker

Top bar: back arrow circle (rgba(255,255,255,0.15)) navigating to `/` · centered "Belly Breathe" Fraunces italic 18 · right "1 of 3" Nunito 10 rgba(255,255,255,0.55).

Heading "What do you need right now?" Fraunces italic 26 white centered, sub "We'll personalize your session" Nunito 11 rgba(255,255,255,0.65).

5 vertical intention cards exactly as specified. Tap → set intention, set `slideDir=forward`, `setTimeout(()=>setStep("technique"),400)`.

INTENTIONS array:
```ts
[
  { id:"anxiety", emoji:"😮‍💨", label:"Calm my anxiety", benefit:"Settle racing thoughts quickly",
    sessionSub:"Easing your mind, mama 😮‍💨", completionSub:"Your nervous system just got a reset.",
    recommended:"478" },
  { id:"sleep",   emoji:"😴", label:"Help me sleep",     benefit:"Wind down body and mind",
    sessionSub:"Drifting toward rest, mama 😴", completionSub:"Your body is ready to rest.",
    recommended:"478" },
  { id:"labor",   emoji:"🌊", label:"Labor preparation", benefit:"Breathe through waves and contractions",
    sessionSub:"Preparing your body, mama 🌊", completionSub:"You're building strength, breath by breath.",
    recommended:"box" },
  { id:"tension", emoji:"💆", label:"Release body tension", benefit:"Melt the tightness away",
    sessionSub:"Melting the tension away 💆", completionSub:"You released what wasn't yours to carry.",
    recommended:"44" },
  { id:"breathe", emoji:"🌸", label:"Just breathe",       benefit:"A moment of stillness for me",
    sessionSub:"A moment just for you 🌸", completionSub:"You showed up for yourself today.",
    recommended:"44" },
]
```

### Step 2 — Technique selector

Top bar with "2 of 3". Heading "Your session" Fraunces italic 24, beneath it a pill (rgba 0.18) showing selected intention emoji + label. "Recommended for you" caption.

TECHNIQUES:
```ts
[
  { id:"478", name:"4-7-8 Breath", patternLabel:"4-7-8", benefit:"Best for anxiety and sleep",
    phases:[{label:"Inhale",sec:4},{label:"Hold",sec:7},{label:"Exhale",sec:8}] },
  { id:"box", name:"Box Breath", patternLabel:"4-4-4-4", benefit:"Perfect for labor and focus",
    phases:[{label:"Inhale",sec:4},{label:"Hold",sec:4},{label:"Exhale",sec:4},{label:"Hold",sec:4}] },
  { id:"44",  name:"4-4 Rhythm", patternLabel:"4-4", benefit:"Quick calm, anytime",
    phases:[{label:"Inhale",sec:4},{label:"Exhale",sec:4}] },
]
```

Pre-select `intention.recommended`. Recommended card gets thicker border + "Recommended ✓" badge. Mini pattern indicator under benefit = phase-count rectangles with width proportional to seconds (each 4px high, gap 3px, rgba(255,255,255,0.40)).

Fixed-bottom "Continue →" white button (color #C84E08) advances to step 3.

### Step 3 — Duration picker

Top bar "3 of 3". Heading "How long do you have?" + subtext. 2×2 grid of 4 duration cards. Selected card gets the heavier border + glow. Bottom "Start breathing →" button → set `step="session"`, reset session runtime state (round=1, phaseIdx=0, count=phases[0].sec, elapsedSec=0).

DURATIONS (rounds derived from technique cycle length so total time ≈ duration):
```ts
[
  { min:1,  label:"Quick reset",     baseRounds:1 },
  { min:3,  label:"Daily practice",  baseRounds:4 },
  { min:5,  label:"Deep calm",       baseRounds:7 },
  { min:10, label:"Full reset",      baseRounds:14 },
]
```
At session start compute `totalRounds = max(1, round(min*60 / cycleSeconds))` using actual technique cycle length (19s for 4-7-8, 16s for box, 8s for 4-4). Show the option's `baseRounds` label on the card as the spec requested.

### Step 4 — Session screen

Layout:
- Top bar: back-circle (→ `setStep("intention")` with `slideDir=back`), center "Belly Breathe" Fraunces italic 18 white, right pill showing `technique.patternLabel`.
- Session header block centered: "Calming Breath" Nunito 13 800 white + `intention.sessionSub` italic 10 rgba(255,255,255,0.65) + "Round X of N · Ys remaining" 10 rgba(0.65) 500.

Central breathing area — absolutely-stacked layers all centered via wrapper `position:relative; width:240px; height:240px; margin: 0 auto`:

1. Outer ring 220×220, border 1px rgba(255,255,255,0.08)
2. Mid ring 196×196, border 1.5px rgba(255,255,255,0.14)
3. Inner glow disc 172×172, radial gradient warm
4. SVG 168×168 with two `<circle r="80" cx="84" cy="84">` — track stroke rgba(255,255,255,0.12), fill stroke #fff with `strokeDasharray={502}`, `strokeDashoffset` computed from phase progress, `filter: drop-shadow(0 0 4px rgba(255,255,255,0.6))`, rotated -90°.
5. Core circle 130×130 with radial gradient, 2px border, inset shadow, transform scale + animated outer box-shadow ring. Inside: phase label Nunito 22 800 white + countdown 14 rgba(0.80) 600.

Scale targets driven by phase:
- Inhale: rings/core scale interpolates 1.0→1.18 (core) and 1.0→1.12 (rings) over phase seconds (CSS `transition: transform Ns linear`).
- Hold (after inhale): held at expanded scale; core box-shadow loops `0 0 0 14px → 0 0 0 20px → 0 0 0 14px` via CSS keyframes.
- Exhale: scale interpolates back to 1.0.
- Box-breath's second Hold (after exhale): held at base scale.

Arc fill: track full circumference 502.65. `dashoffset` set per phase:
- Inhale: animates 502→0 over `sec` seconds.
- Hold (post-inhale): stays 0.
- Exhale: animates 0→502 over `sec` seconds.
- Hold (post-exhale, box): stays 502.

Implementation: a single `useEffect` sets up `setInterval(tick, 1000)` only when `!paused && step==="session"`. Each tick decrements `count`. When `count` hits 0, advance to next phase (`phaseIdx = (phaseIdx+1) % phases.length`) and set `count = phases[phaseIdx].sec`. If the phase rolled back to index 0, increment `round`. When `round > totalRounds`, transition to `step="complete"` and record the session.

Transitions are driven by React state changes on `phase`: each layer reads target scale/offset and the inline CSS `transition` uses the phase's duration so the animation is smooth between ticks (no per-frame JS).

Stats row — 3 boxes, glass card style:
- Rounds remaining (Fraunces 18 white) + Nunito 9 rgba(0.65) caption "rounds left"
- Total session time (formatted `mm:ss` of elapsed) + caption "elapsed"
- "↓ Stress" Fraunces 18 + caption "effect"

Controls row (gap 10, padding 0 18):
- "⏸ Pause" / "▶ Resume" toggling `paused`
- "End session" white-90% button → if at least 1 round completed go to complete screen, else `navigate("/")`.

### Step 5 — Completion screen

When entered, call `recordBreathingSession()` (see below) once via a `useEffect` keyed to `step==="complete"`.

Layout: centered emoji = `intention.emoji` 56px, "Beautiful, mama." Fraunces italic 32 white, `intention.completionSub` Nunito 12 rgba(0.80) max-width 220 line-height 1.6 centered.

Stats summary card: 3 columns — duration (`${selectedMin} min`), rounds completed, technique name. Same glass card spec.

Breathing streak card: shows `🔥 Breathing streak: X days` + "Come back tomorrow to keep it going". Pulls X from new `breathing_streak` table (see Database).

Bottom two side-by-side buttons:
- "Breathe again" rgba(0.18) white text → resets state, `setStep("intention")`
- "Back to home" white-90% #C84E08 → `navigate("/")`

### Personalization summary on session subheading

Already covered by `intention.sessionSub`.

### Database — breathing streak persistence

New table `breathing_streak` mirroring existing `streak_state`:
```sql
CREATE TABLE public.breathing_streak (
  user_id uuid PRIMARY KEY,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_session_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.breathing_streak TO authenticated;
GRANT ALL ON public.breathing_streak TO service_role;
ALTER TABLE public.breathing_streak ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own breathing streak" ON public.breathing_streak FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "Users insert own breathing streak" ON public.breathing_streak FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own breathing streak" ON public.breathing_streak FOR UPDATE TO authenticated USING (auth.uid()=user_id);
```

New helper `src/lib/breathingStreak.ts` mirroring `src/lib/streak.ts`:
- `recordBreathingSession(userId)` — same-day no change, yesterday increments, gap resets to 1, updates longest.
- `getBreathingStreak(userId)` — returns `{current, longest}`.

### Journey screen integration

Find the existing streak bento on the Journey screen (per memory: home screen streak bento; will read `src/pages/Journal.tsx` — the "Journey"/journal page — to locate). Add a small "🌬 Breathing streak: X days" row beside the main streak. Implementation only adds a read of `getBreathingStreak` and a matching glass card next to the existing streak component — no styling overhaul.

### Routing change

In `src/App.tsx`, remove the `AppLayout` wrapper on `/breathe` so the bottom nav disappears during the breathing flow (mirrors `/ask` and `/cant-sleep`):
```tsx
<Route path="/breathe" element={<ProtectedRoute><BellyBreathe /></ProtectedRoute>} />
```

### Files touched

- Rewrite `src/pages/BellyBreathe.tsx`
- New `src/lib/breathingStreak.ts`
- New migration creating `breathing_streak` table + RLS + grants
- Edit `src/App.tsx` to drop `AppLayout` on `/breathe`
- Small addition to the Journey screen to display the breathing streak

No other screens, components, or styles change.
