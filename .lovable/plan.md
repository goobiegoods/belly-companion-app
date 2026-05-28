## Findings

The structural issues listed are already fixed in this codebase:

- `queryClient` is module-scoped (line 46) — outside the App function ✓
- `ProtectedRoute` is module-scoped (line 80) — not nested in App ✓
- `BrowserRouter` appears exactly once (App.tsx line 177); `main.tsx` does not include another ✓
- `main.tsx` does NOT wrap `<App />` in `React.StrictMode` ✓

## Single change to apply

Upgrade the bare `new QueryClient()` (line 46 of `src/App.tsx`) to use the recommended defaults to reduce unnecessary refetches:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
```

No other files touched. No UI changes.