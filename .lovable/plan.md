## Files to change

1. **src/contexts/AuthContext.tsx**
   - Provider `value` is already wrapped in `useMemo` — verify this in-file.
   - Ensure the `onAuthStateChange` subscription has a `return () => subscription.unsubscribe()` cleanup (already present — verify).
   - Ensure any `useEffect` that lists `user` or `session` as deps uses `user?.id` or `session?.access_token` primitives instead (realtime channel already uses `[user?.id]` — verify).

2. **src/contexts/CartContext.tsx**
   - Wrap the Provider `value` in `useMemo` with `[items, cartCount, cartTotal, addItem, updateQty, removeItem, clearCart, setCartCount]` as dependencies.
   - Check all `useEffect` deps for object references and replace with primitives where needed.

3. **src/hooks/useAdminRealtime.ts**
   - Verify every `supabase.channel(...)` has a matching `return () => supabase.removeChannel(channel)` in its `useEffect` cleanup (already present — verify).

## Verification
- Build passes with no errors.
- App loads without console warnings.
- No visual changes anywhere.