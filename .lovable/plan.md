# Stability fix — kill the re-render / interval loop

## Root cause found

`src/pages/BellyBreathe.tsx` → `SessionStep` (line ~299):

```ts
useEffect(() => {
  ...
  const id = setInterval(() => {
    setCount(...);
    setElapsed(e => e + 1);
  }, 1000);
  return () => clearInterval(id);
}, [paused, technique, totalRounds, onComplete, elapsed]);
```

Two bugs here, both matching the user's audit:
- `elapsed` is updated inside the interval AND listed as a dependency → effect tears down and recreates the interval every single second.
- `onComplete` and `technique` are non-primitive props recreated by the parent each render → same effect churn whenever the parent re-renders.

This is the source of the "twitching / refreshing" feeling whenever the breathing screen runs, and it also keeps firing setTimeouts that race with state updates.

## Fix

In `SessionStep`:
- Store `elapsed`, `onComplete`, and the technique reference in `useRef`s that are kept in sync via a tiny sync effect.
- Reduce the interval effect's deps to only the primitives that should restart the timer: `[paused, technique.id, totalRounds]`.
- Read/write `elapsedRef.current` inside the tick; mirror to state once per tick for the visible timer.
- Keep the existing `clearInterval` cleanup.

Result: one interval is created when the session starts (or pauses/resumes), not 60+ per minute.

## Broader audit (only touch what's actually wrong)

Walk every file under `src/` and apply the user's checklist, but **only edit files that have a real defect**. Expected concrete changes after grep review:

1. `BellyBreathe.tsx` — the fix above.
2. `BellyBreathe.tsx` `CompleteStep` — effect already has `[user?.id]` and a `cancelled` guard; leave as-is.
3. `HomePage.tsx` streak effect — already `[user?.id]`; leave as-is.
4. `AuthContext.tsx` — `value` is already `useMemo`'d; realtime channel has `removeChannel` cleanup; leave as-is.
5. `NotificationBell.tsx`, `useAdminRealtime.ts`, `useIsAdmin.ts`, `SavedRecipesContext.tsx`, `CartContext.tsx` — re-verify each `supabase.channel(...)` has a `removeChannel` in cleanup and primitive deps (`user?.id`). Patch any that don't; from the files already in context these look correct, so this step may be a no-op.
6. Sweep remaining pages (`AskDoula`, `Community`, `Profile`, `Journal`, `BabyTracker`, `Courses`, `Orders`, `OrderSuccess`, `PremiumSuccess`, `FeedingTracker`, `ResetPassword`, `CantSleep`, admin pages, `PostSheet`, `PremiumUpgradeSheet`) for the same three patterns:
   - object/array/function in deps → swap for primitive id or wrap with `useCallback`/`useMemo`.
   - effect setting state that's also in its own deps → drop that state from deps.
   - `setInterval`/`setTimeout` → must be stored and cleared.
   Only edit a file if it actually exhibits one of these.
7. Navigation-on-mount guards: `PremiumSuccess` polls `refreshProfile` via `setTimeout` recursion with empty deps — safe. Confirm no page calls `navigate(...)` unguarded in a `useEffect` whose deps change; add a `hasNavigated` ref only if found.

## Verification

- Reload `/`, `/breathe`, `/community`, `/me`, `/journal` and watch the console: no log should repeat more than once per real user action.
- Run a 1-minute breathing session and confirm the timer decrements smoothly with a single interval (add a temporary `console.log` inside the tick during dev, remove before finishing).
- Confirm no visual change anywhere — this is a logic-only patch.

## Out of scope

No styling, copy, layout, route, schema, or data-shape changes. UI must render identically.
