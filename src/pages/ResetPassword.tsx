import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SceneBackground, GlassCard } from "@/components/golden";

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

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash. The auth client
    // picks it up automatically; we just need to confirm we have a session.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
      if (!data.session) {
        toast.error("This reset link is invalid or expired. Please request a new one.");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated! Welcome back, mama.");
    navigate("/");
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="gh-brand" style={{ fontSize: 28 }}>Reset password</h1>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "rgba(251,238,224,0.7)",
              marginTop: 10,
            }}
          >
            Set your new password below
          </p>
        </div>

        <GlassCard style={{ padding: "22px 20px", marginBottom: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={!ready}
              className="gh-auth-input"
              style={{ ...inputStyle, opacity: ready ? 1 : 0.5 }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              disabled={!ready}
              className="gh-auth-input"
              style={{ ...inputStyle, opacity: ready ? 1 : 0.5 }}
            />
            <button
              type="submit"
              disabled={submitting || !ready}
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
                boxShadow: "0 8px 20px -8px rgba(232,98,46,0.6)",
                opacity: submitting || !ready ? 0.5 : 1,
                cursor: submitting || !ready ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "..." : "Update password"}
            </button>
          </form>
        </GlassCard>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={() => navigate("/auth")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "var(--gold)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to sign in
          </button>
        </p>
      </div>
    </SceneBackground>
  );
};

export default ResetPassword;
