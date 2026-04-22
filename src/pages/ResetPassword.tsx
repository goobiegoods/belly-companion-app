import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    toast.success("Password updated! Welcome back, mama. 🌸");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-belly-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-[22px] font-bold text-foreground tracking-[-0.5px]">Reset password</h1>
          <p className="text-belly-text-muted font-display italic text-xs mt-1">Set your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={!ready}
            className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            disabled={!ready}
            className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={submitting || !ready}
            className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press disabled:opacity-50"
          >
            {submitting ? "..." : "Update password"}
          </button>
        </form>

        <p className="text-center text-xs text-belly-text-muted mt-6">
          <button onClick={() => navigate("/auth")} className="text-belly-accent font-semibold underline">
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
