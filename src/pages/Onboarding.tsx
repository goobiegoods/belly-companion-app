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

  const currentWeek2 = currentWeek;


  return (
    <PageBg>
      {step === 1 && (
        <div className="text-center">
          <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 18px" }}>
            <span aria-hidden style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              background: "var(--color-sage)", opacity: 0.12,
            }} />
            <div style={{
              position: "relative", width: 110, height: 110, borderRadius: "50%",
              background: "var(--color-accent-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-warm)",
            }}>
              <span style={{ fontSize: 44 }}>🤰</span>
            </div>
          </div>

          <span className="pill-base pill-sage-solid" style={{ marginBottom: 14 }}>Week 24 · second trimester</span>

          <h1 className="font-serif-display" style={{
            fontSize: 30, fontWeight: 700, color: "var(--color-text-primary)",
            letterSpacing: -0.5, marginTop: 6, marginBottom: 8,
          }}>Made for every mama</h1>

          <p style={{
            fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 14,
            color: "var(--color-accent-primary)", marginBottom: 14,
          }}>Every heartbeat is a hello 🤍</p>

          <p style={{
            fontFamily: "'Outfit', system-ui", fontSize: 14, lineHeight: 1.6,
            color: "var(--color-text-secondary)", marginBottom: 18, padding: "0 6px",
          }}>
            Track your journey, ask questions, and connect with mamas just like you — all in one warm place.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-7">
            <span className="pill-base pill-sage">Viability milestone</span>
            <span className="pill-base pill-sage">Hearing begins</span>
            <span className="pill-base pill-sage">Lungs forming</span>
          </div>

          <PrimaryCTA onClick={() => setStep(2)}>
            Get started <span style={{ transition: "transform 200ms" }} className="group-active:translate-x-1">→</span>
          </PrimaryCTA>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-serif-display" style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", marginBottom: 4 }}>Tell us about you</h2>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginBottom: 22 }}>We'll personalise your experience</p>

          <div className="space-y-4">
            {[
              { label: "Your name", el: <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full h-12 px-4 text-sm belly-input-focus" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: 14, color: "var(--color-text-primary)" }} /> },
              { label: "Due date", el: <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-12 px-4 text-sm belly-input-focus" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: 14, color: "var(--color-text-primary)" }} /> },
              { label: "Pregnancy number", el: (
                <select value={pregnancyNumber} onChange={e => setPregnancyNumber(Number(e.target.value))} className="w-full h-12 px-4 text-sm belly-input-focus" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderRadius: 14, color: "var(--color-text-primary)" }}>
                  <option value={1}>1st pregnancy</option>
                  <option value={2}>2nd pregnancy</option>
                  <option value={3}>3rd or more</option>
                </select>
              ) },
            ].map(({ label, el }) => (
              <div key={label}>
                <label className="section-label" style={{ marginBottom: 6, display: "block" }}>{label}</label>
                {el}
              </div>
            ))}

            <div className="flex items-center justify-between py-2">
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, color: "var(--color-text-primary)" }}>Working with a midwife or OB?</span>
              <button onClick={() => setHasProvider(!hasProvider)} className="relative" style={{ width: 48, height: 28, borderRadius: 999, background: hasProvider ? "var(--color-sage)" : "var(--color-border-default)", border: "none", transition: "background 200ms" }}>
                <span style={{ position: "absolute", top: 3, left: hasProvider ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "left 200ms" }} />
              </button>
            </div>

            <PrimaryCTA onClick={handleSaveProfile} disabled={!firstName || !dueDate || saving}>
              {saving ? "Saving…" : <>Continue →</>}
            </PrimaryCTA>
          </div>
        </div>
      )}

      {step === 3 && currentWeek && weekData && (
        <div className="text-center">
          <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 18px" }}>
            <span aria-hidden style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "var(--color-sage)", opacity: 0.12 }} />
            <div style={{ position: "relative", width: 110, height: 110, borderRadius: "50%", background: "var(--color-accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-warm)" }}>
              <span style={{ fontSize: 44 }}>🌸</span>
            </div>
          </div>

          <span className="pill-base pill-sage-solid" style={{ marginBottom: 14 }}>Week {currentWeek}</span>

          <h1 className="font-serif-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: -0.5, marginBottom: 6 }}>Your journey starts now</h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 14, color: "var(--color-accent-primary)", marginBottom: 18 }}>
            Every heartbeat is a hello 🤍
          </p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 22 }}>
            Your baby is about the size of a <strong style={{ color: "var(--color-text-primary)" }}>{weekData.babySize.toLowerCase()}</strong>
          </p>

          <PrimaryCTA onClick={handleComplete}>Take me to my home →</PrimaryCTA>
        </div>
      )}
    </PageBg>
  );
};

export default Onboarding;
