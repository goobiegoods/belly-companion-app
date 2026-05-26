## Diagnosis

The preview iframe keeps reloading on `/onboarding` (and you perceive it as constant glitching). Two signals in the session replay confirm this:

- The URL re-navigates to the same `?__lovable_sha=…` every ~1s.
- Each navigation re-renders the exact same "Get started" page.

Root cause is in `src/pages/Onboarding.tsx`:

```text
const Onboarding = () => {
  ...
  const PageBg = ({ children }) => (...);       // ← defined INSIDE the component
  const PrimaryCTA = ({ onClick, ... }) => (...); // ← defined INSIDE the component
  return <PageBg>{step === 1 && (...)}</PageBg>;
}
```

Defining components inside another component is a known React anti-pattern:

1. On every render, `PageBg` / `PrimaryCTA` are brand-new function identities, so React unmounts and remounts the whole subtree on every state change (typing in inputs, toggling steps, any auth event). That alone causes visible flicker, lost input focus, and animation re-trigger.
2. Vite's React Fast Refresh cannot reconcile components whose identity changes every render, so it falls back to **full page reloads** — which is what you're seeing as "the app keeps reloading". Any unrelated HMR ping (e.g. the auto-managed `.env.development` refresh, an auth state change, a profile realtime update) then forces a hard reload of the iframe instead of a hot patch.

There is no infinite loop in `AuthContext` itself — the previous fix is holding. The remaining reload behavior is purely the inline-component issue.

## Fix

Edit only `src/pages/Onboarding.tsx`:

1. Move `PageBg` and `PrimaryCTA` out of the `Onboarding` function body to module scope (above `const Onboarding = …`). Keep their props/markup identical so the visual design is unchanged.
2. Leave everything else (auth checks, step state, handlers, styling tokens) untouched.

## Verification

- Open `/onboarding`, log in, and confirm the page renders once and stays stable (no 1-second iframe reload pulse in the session replay / network panel).
- Type into the "First name" input on step 2 — focus should be retained across keystrokes (previously it would have been lost on each render due to remounting).
- Step transitions (1 → 2 → 3) should fade in without a full page flash.

## Out of scope

- No changes to `AuthContext`, routing, theme, design tokens, or any backend logic.
- No new dependencies.
