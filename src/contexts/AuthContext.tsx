import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  due_date: string | null;
  pregnancy_number: number;
  has_provider: boolean;
  is_premium: boolean;
  onboarding_completed: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Subscribe to realtime profile updates so entitlement changes (is_premium)
  // pushed by the payments webhook are reflected immediately in the UI.
  useEffect(() => {
    if (!user?.id) {
      if (profileChannelRef.current) {
        supabase.removeChannel(profileChannelRef.current);
        profileChannelRef.current = null;
      }
      return;
    }
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile((prev) =>
              prev ? { ...prev, ...(payload.new as Partial<Profile>) } : (payload.new as Profile)
            );
          }
        }
      )
      .subscribe();
    profileChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      profileChannelRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      const newUserId = newSession?.user?.id ?? null;
      setSession(newSession);
      setUser((prev) => (prev?.id === newUserId ? prev : newSession?.user ?? null));
      if (newSession?.user && event !== "TOKEN_REFRESHED") {
        setTimeout(() => fetchProfile(newSession.user.id), 0);
      } else if (!newSession?.user) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = useMemo(
    () => ({ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
