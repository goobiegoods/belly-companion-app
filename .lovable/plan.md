## Problem

The UI is in a constant refresh loop. The network log shows `/rest/v1/profiles` (and `streak_state`, `saved_recipes`) being fetched dozens of times per second.

## Root cause

In `src/contexts/AuthContext.tsx`:

1. `onAuthStateChange` calls `setUser(session?.user)` on every event (`INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, …). Supabase returns a **new `user` object reference** every time, even when the id is unchanged.
2. The recently-added realtime profile channel `useEffect(..., [user])` therefore tears down and re-creates the channel on every auth event.
3. Each `removeChannel` + `subscribe` cycle nudges the Supabase client to refresh the session, which fires another `TOKEN_REFRESHED` → another `setUser` → another channel rebuild → another `fetchProfile`. Infinite loop.
4. `SavedRecipesProvider` reads `session?.user?.id` and `Profile`/`HomePage` read `user`, so each loop iteration also re-runs their effects (visible as repeated `saved_recipes` and `streak_state` fetches).

## Fix (one file: `src/contexts/AuthContext.tsx`)

1. Change the realtime channel effect dependency from `[user]` to `[user?.id]` so it only rebuilds when the actual user id changes.
2. Skip redundant state writes inside `onAuthStateChange`: only call `fetchProfile` on `INITIAL_SESSION`, `SIGNED_IN`, `USER_UPDATED`, and `SIGNED_OUT`; ignore `TOKEN_REFRESHED` (token is updated automatically and does not need a profile refetch).
3. Avoid the double-fetch race between the `getSession()` Promise and the `INITIAL_SESSION` event by removing the `getSession().then(fetchProfile)` block — `onAuthStateChange` already delivers `INITIAL_SESSION` synchronously on subscribe.
4. Keep the existing `setTimeout(..., 0)` deferral for `fetchProfile` so we don't deadlock inside the auth callback.

No other files need to change. Routes, ProtectedRoute, contexts, and pages stay as-is. The visible symptom (page appearing to constantly refresh, network spam) goes away once the loop is broken.

## Verification

- Reload the preview and watch the Network panel: `/rest/v1/profiles` should fire once on load, not continuously.
- Navigate between Home / Baby / Profile — only the page-specific fetches happen, no repeating profile fetch.
