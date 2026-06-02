import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    // Use SECURITY DEFINER RPC — bypasses RLS entirely, always works for authenticated users
    supabase.rpc("has_role", { _user_id: uid, _role: "admin" }).then(({ data, error }) => {
      if (!cancelled) {
        if (error) console.error("useIsAdmin rpc error:", error);
        setState({ isAdmin: data === true, loading: false });
      }
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  return state;
};
