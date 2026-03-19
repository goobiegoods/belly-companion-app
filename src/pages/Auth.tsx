import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const { session, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();

  if (loading) return <div className="min-h-screen bg-belly-bg flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-belly-hero border-t-transparent animate-spin" /></div>;
  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else if (isSignUp) {
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
            {isSignUp ? "Join thousands of mamas on their journey" : "Welcome back, mama"}
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus placeholder:text-belly-text-hint"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press disabled:opacity-50"
          >
            {submitting ? "..." : isSignUp ? "Create my account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-belly-text-muted mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-belly-accent font-semibold underline">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
