import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { toast } from "sonner";

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pregnancyNumber, setPregnancyNumber] = useState(1);
  const [hasProvider, setHasProvider] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/" replace />;

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        due_date: dueDate,
        pregnancy_number: pregnancyNumber,
        has_provider: hasProvider,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    setStep(3);
  };

  const handleComplete = async () => {
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
    await refreshProfile();
    navigate("/");
  };

  const currentWeek = dueDate ? getCurrentWeek(dueDate) : null;
  const weekData = currentWeek ? getWeekData(currentWeek) : null;

  return (
    <div className="min-h-screen bg-belly-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {step === 1 && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <ellipse cx="12" cy="14" rx="7" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <h1 className="font-display text-[26px] font-bold text-foreground mb-3">Made for every mama</h1>
            <p className="text-belly-text-muted text-sm leading-relaxed mb-8">
              Track your journey, ask questions, and connect with moms just like you — all in one place.
            </p>
            <button onClick={() => setStep(2)} className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press">
              Get started →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-[24px] font-bold text-foreground mb-1 text-center">Tell us about you</h2>
            <p className="text-belly-text-muted text-xs text-center mb-6">We'll personalize your experience</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint font-body mb-1 block">Your name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus placeholder:text-belly-text-hint" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint font-body mb-1 block">Due date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus text-foreground" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint font-body mb-1 block">Pregnancy number</label>
                <select value={pregnancyNumber} onChange={e => setPregnancyNumber(Number(e.target.value))} className="w-full h-12 rounded-input border border-belly-card-border bg-card px-4 text-sm belly-input-focus text-foreground">
                  <option value={1}>1st pregnancy</option>
                  <option value={2}>2nd pregnancy</option>
                  <option value={3}>3rd or more</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Working with a midwife or OB?</span>
                <button onClick={() => setHasProvider(!hasProvider)} className={`w-12 h-7 rounded-full transition-colors ${hasProvider ? 'bg-primary' : 'bg-belly-card-border'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${hasProvider ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <button onClick={handleSaveProfile} disabled={!firstName || !dueDate || saving} className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press disabled:opacity-50">
                {saving ? "Saving..." : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && currentWeek && weekData && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl">🌸</span>
            </div>
            <h1 className="font-display text-[26px] font-bold text-foreground mb-2">Your journey starts now</h1>
            <p className="text-belly-text-muted text-lg mb-2">You're in week {currentWeek} 🌸</p>
            <p className="text-belly-accent text-sm mb-8">Your baby is about the size of a {weekData.babySize.toLowerCase()}</p>
            <button onClick={handleComplete} className="w-full h-12 rounded-input bg-primary text-primary-foreground font-semibold text-sm belly-btn-press">
              Take me to my home →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
