import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";
import { SceneBackground, GlassCard } from "@/components/golden";

/**
 * Magic-link landing (emails from /api/send-login-link and the funnel
 * webhook). The one-time token is only redeemed when the person taps the
 * button, so email link scanners that "pre-click" links can't burn it.
 */
const AuthConfirm = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenHash = params.get("token_hash") || "";
  const type = params.get("type") === "email" ? "email" : "magiclink";

  if (!loading && session && !busy) return <Navigate to="/" replace />;

  const signIn = async () => {
    if (!tokenHash) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      setBusy(false);
      setError("This link has expired or was already used. Request a fresh one below.");
      return;
    }
    track("magic_link_signed_in");
    navigate("/", { replace: true });
  };

  return (
    <SceneBackground scene="today">
      <div
        style={{
          minHeight: "100dvh",
          maxWidth: 430,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 22px",
          textAlign: "center",
        }}
      >
        <h1 className="gh-brand" style={{ fontSize: 34 }}>belly</h1>
        <p className="gh-brand-tag" style={{ marginTop: 6, textAlign: "center" }}>virtual doula</p>
        <GlassCard style={{ padding: "24px 20px", marginTop: 28 }}>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 20,
              color: "var(--cream)",
              margin: "0 0 18px",
            }}
          >
            {tokenHash ? "Welcome, mama. Tap to open Belly." : "This sign-in link is incomplete."}
          </p>
          {tokenHash && (
            <button
              onClick={signIn}
              disabled={busy}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, var(--gold), var(--ember))",
                color: "var(--night)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Opening…" : "Open Belly"}
            </button>
          )}
          {error && (
            <p role="alert" style={{ marginTop: 14, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#FFB59A" }}>
              {error}
            </p>
          )}
        </GlassCard>
        <p style={{ marginTop: 18, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
          <a href="/auth?mode=link" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Email me a new sign-in link
          </a>
        </p>
      </div>
    </SceneBackground>
  );
};

export default AuthConfirm;
