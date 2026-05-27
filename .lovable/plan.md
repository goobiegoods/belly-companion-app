# Fix: Infinite refresh loop

## Root cause

The session replay shows the Onboarding "Get started" screen re-rendering every ~1 second even though the network log confirms the user's profile has `onboarding_completed: true`. The loop is between `/` and `/onboarding`:

1. `ProtectedRoute` in `src/App.tsx` only waits on `auth.loading`. Once auth finishes, `profile` is still `null` for a tick (it's fetched asynchronously via `setTimeout(fetchProfile, 0)` inside `onAuthStateChange`). During that gap `!profile?.onboarding_completed` is true → it `<Navigate to="/onboarding">`.
2. Onboarding then loads, profile arrives, sees `onboarding_completed: true` → `<Navigate to="/">`.
3. Meanwhile `AuthProvider` rebuilds its context `value={{...}}` object on every render, and `setSession(newSession)` fires for every auth event with a fresh reference, so every consumer re-renders. Combined with the realtime profile channel pushing partial `payload.new` objects (Supabase realtime UPDATE payloads can omit unchanged columns when REPLICA IDENTITY isn't FULL), `profile` momentarily loses `onboarding_completed` → bounce back to `/onboarding`.
4. Repeat → visible refresh loop.

## Fix

Three small, surgical changes — no UI, routing, or data logic changes.

### 1. `src/App.tsx` — `ProtectedRoute` waits for profile

Treat "session exists but profile not yet fetched" as still loading instead of redirecting:

```tsx
if (loading) return <Spinner />;
if (!session) return <Navigate to="/auth" replace />;
if (!profile) return <Spinner />;            // NEW: wait for profile
if (!profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
return <>{children}</>;
```

This alone breaks the `/` ↔ `/onboarding` ping-pong.

### 2. `src/contexts/AuthContext.tsx` — merge realtime profile + stable context value

- In the realtime `UPDATE` handler, merge into existing profile instead of replacing, so a partial payload can never drop `onboarding_completed`:
  ```ts
  setProfile((prev) => prev ? { ...prev, ...(payload.new as Partial<Profile>) } : (payload.new as Profile));
  ```
- Wrap the context value in `useMemo` keyed on `[session, user, profile, loading]` so consumers don't re-render on every parent render.
- Keep the existing `setUser((prev) => prev?.id === newId ? prev : ...)` guard (already correct).

### 3. Verify

- Reload the preview at `/`, confirm a single render to HomePage, no flicker through Onboarding.
- Confirm the network panel shows a single `profiles?select=*` fetch on load (not a stream).
- Confirm navigating to `/baby`, `/ask`, etc. still works and that signed-out users still get redirected to `/auth`.

## Out of scope

- No design changes.
- No changes to routing structure, Onboarding flow, or any feature page.
- No DB/migration changes.
