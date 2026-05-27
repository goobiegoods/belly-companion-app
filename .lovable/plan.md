I’ll make a narrowly scoped loop-stability pass only, with no UI, routing, or data-behavior changes.

1. Normalize `useEffect` dependencies to primitives
   - Replace object dependencies like `[user]` with stable primitives like `[user?.id]` / local `userId` in pages and hooks that fetch user-specific data.
   - Files likely included: `HomePage`, `AskDoula`, `Community`/notifications hook, `Courses`, `Journal`, `Orders`, `Profile`, `useIsAdmin`.
   - Keep existing fetches and returned data exactly the same.

2. Stabilize function dependencies that can retrigger effects
   - In `App.tsx`, make the splash `onDone` handler stable with `useCallback` so the splash timeout effect does not reset on parent renders.
   - In `PremiumUpgradeSheet`, avoid depending on a possibly-new `onClose` function by storing it in a ref or otherwise stabilizing the effect.
   - In `OrderSuccess`, avoid rerunning the clear-cart effect because `setCartCount` is recreated by context provider renders.
   - In carousel cleanup, ensure all Embla event subscriptions registered in the effect are removed cleanly.

3. Audit timers and realtime subscriptions
   - Confirm every Supabase channel / auth subscription has cleanup via `removeChannel` or `unsubscribe`.
   - Confirm every interval/timeout created in an effect is cleared.
   - Add missing timeout cleanup where timers are currently fire-and-forget inside effects.
   - Avoid changing any realtime channel names, filters, or event handlers.

4. Remove self-triggering effect patterns
   - Review effects that set state and depend on the same state/object.
   - Restructure only if needed so state updates do not recursively retrigger the same effect.
   - Keep intentional event-handler state updates untouched.

5. Verify the loop is gone
   - Re-scan the codebase for `useEffect` patterns after edits.
   - Check dev-server logs and preview behavior.
   - Confirm the app loads once and remains stable without repeated refresh/re-render pulses.