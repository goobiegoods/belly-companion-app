import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns { isAdmin, loading } — the authoritative shape.
 * For backwards-compat with code that does `if (isAdmin === null)`, the
 * returned object is also the boolean when coerced via `valueOf`.
 */
export const useIsAdmin = () => {
  const { user } = useAuth();
  const [state, setState] = useState<{ isAdmin: boolean; loading: boolean }>({ isAdmin: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    const uid = user?.id;
    if (!uid) {
      setState({ isAdmin: false, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setState({ isAdmin: !!data, loading: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return state;
};
