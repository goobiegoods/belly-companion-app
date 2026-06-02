import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "forgot";

const Auth = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();

  if (loading) return <div className="min-h-screen bg-belly-bg flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-belly-hero border-t-transparent animate-spin" /></div>;
  if (session) {
    const from = (location.state as any)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSubmitting(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email for a reset link 🌸");
      setMode("signin");
      return;
    }

    const { error } = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else if (mode === "signup") {
      toast.success("Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="min-h-screen bg-belly-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-icon bg-belly-upsell-border mx-auto mb-3 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-belly-text-primary">
              <ellipse cx="12" cy="14" rx="7" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <h1 className="font-display text-[22px] font-bold text-foreground tracking-[-0.5px]">BELLY</h1>
          <p className="text-belly-text-muted font-display italic text-xs mt-1">
            {mode === "signup" ? "Join thousands of mamas on their journey" :
              mode === "forgot" ? "We'll email you a reset link" :
                "Welcome back, mama"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus placeholder:text-belly-text-hint"
          />
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus placeholder:text-belly-text-hint"
            />
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press disabled:opacity-50"
          >
            {submitting ? "..." :
              mode === "signup" ? "Create my account" :
                mode === "forgot" ? "Send reset link" :
                  "Sign in"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="text-center text-xs text-belly-text-muted mt-4">
            <button onClick={() => setMode("forgot")} className="text-belly-accent font-medium underline">
              Forgot password?
            </button>
          </p>
        )}

        <p className="text-center text-xs text-belly-text-muted mt-6">
          {mode === "signup" ? "Already have an account?" :
            mode === "forgot" ? "Remembered it?" :
              "Don't have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")}
            className="text-belly-accent font-semibold underline"
          >
            {mode === "signup" || mode === "forgot" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
