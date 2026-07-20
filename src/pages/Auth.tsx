import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SceneBackground, GlassCard } from "@/components/golden";

type Mode = "signin" | "signup" | "forgot";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 14,
  padding: "13px 14px",
  color: "var(--cream)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  outline: "none",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, var(--gold), var(--ember))",
  color: "var(--night)",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  boxShadow: "0 8px 20px -8px rgba(232,98,46,0.6)",
};

const linkBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--gold)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const Auth = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #150A1F 0%, #0d0713 100%)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
        />
      </div>
    );
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
      toast.success("Check your email for a reset link");
      setMode("signin");
      return;
    }

    if (mode === "signup") {
      const { data, error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      // With email-enumeration protection, signing up an email that already has an
      // account returns a fake "success" whose user has no identities — no account
      // is created. Send the mama to sign in instead of pretending it worked.
      if (data?.user && (data.user.identities?.length ?? 0) === 0) {
        toast.error("An account with this email already exists — sign in below.");
        setMode("signin");
        return;
      }
      // Autoconfirm is on, so a real signup returns a session and redirects;
      // only mention a confirmation email if one is actually required.
      if (!data?.session) toast.success("Account created! Check your email to confirm.");
      return;
    }

    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(
        /invalid login credentials/i.test(error.message)
          ? "That email and password don't match an account — double-check them, or use Forgot password."
          : /email not confirmed/i.test(error.message)
            ? "Please confirm your email first — check your inbox for the link."
            : error.message
      );
    }
  };

  return (
    <SceneBackground scene="today">
      <style>{`
        .gh-auth-input::placeholder { color: rgba(251,238,224,0.45); }
        .gh-auth-input:focus { border-color: rgba(242,182,71,0.6); box-shadow: 0 0 0 3px rgba(242,182,71,0.15); }
      `}</style>
      <div
        style={{
          minHeight: "100dvh",
          maxWidth: 430,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 22px",
        }}
      >
        {/* Brand block */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="gh-brand" style={{ fontSize: 34 }}>belly</h1>
          <p className="gh-brand-tag" style={{ marginTop: 6, textAlign: "center" }}>virtual doula</p>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "rgba(251,238,224,0.7)",
              marginTop: 14,
            }}
          >
            {mode === "signup" ? "Join thousands of mamas on their journey" :
              mode === "forgot" ? "We'll email you a reset link" :
                "Welcome back, mama"}
          </p>
        </div>

        <GlassCard style={{ padding: "22px 20px", marginBottom: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="gh-auth-input"
              style={inputStyle}
            />
            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="gh-auth-input"
                style={inputStyle}
              />
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryBtnStyle, opacity: submitting ? 0.5 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "..." :
                mode === "signup" ? "Create my account" :
                  mode === "forgot" ? "Send reset link" :
                    "Sign in"}
            </button>
          </form>
        </GlassCard>

        {mode === "signin" && (
          <p style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setMode("forgot")} style={linkBtnStyle}>
              Forgot password?
            </button>
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(251,238,224,0.55)",
            marginTop: mode === "signin" ? 12 : 20,
          }}
        >
          {mode === "signup" ? "Already have an account?" :
            mode === "forgot" ? "Remembered it?" :
              "Don't have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")}
            style={linkBtnStyle}
          >
            {mode === "signup" || mode === "forgot" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </SceneBackground>
  );
};

export default Auth;
