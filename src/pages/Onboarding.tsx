import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { toast } from "sonner";
import { SceneBackground, GlassCard, BellaOrb } from "@/components/golden";

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
  colorScheme: "dark",
};

// Format a Date as YYYY-MM-DD using local calendar fields (matches <input type="date"> values).
const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Inverse of getCurrentWeek(): due date such that today falls in the given week.
// getCurrentWeek subtracts 280 days (40 weeks) from the due date to find conception,
// so due = today + (40 - week) * 7 days round-trips back to the same week.
const dueDateFromWeek = (week: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + (40 - week) * 7);
  return toISODate(d);
};

const FieldError = ({ children }: { children: React.ReactNode }) => (
  <p
    role="alert"
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      color: "var(--ember)",
      margin: "6px 2px 0",
      lineHeight: 1.4,
    }}
  >
    {children}
  </p>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

// Full-window Golden Hour chrome: scene gradient + centered 430px column.
const PageBg = ({ step, children }: { step: number; children: React.ReactNode }) => (
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
      {/* Step progress */}
      <div className="gh-progress-track" style={{ width: 120, margin: "0 auto 26px" }}>
        <div className="gh-progress-fill" style={{ width: `${(step / 3) * 100}%`, transition: "width 300ms ease" }} />
      </div>
      {children}
    </div>
  </SceneBackground>
);

const PrimaryCTA = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    disabled={disabled}
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
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
    {children}
  </button>
);

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dateMode, setDateMode] = useState<"due" | "week">("due");
  const [weekInput, setWeekInput] = useState("");
  const [pregnancyNumber, setPregnancyNumber] = useState(1);
  const [hasProvider, setHasProvider] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/" replace />;

  // --- Due date / current week validation ---
  const weekNum = parseInt(weekInput, 10);
  const weekValid = weekInput.trim() !== "" && Number.isInteger(weekNum) && weekNum >= 1 && weekNum <= 40;
  const weekError =
    dateMode === "week" && weekInput.trim() !== "" && !weekValid
      ? "Enter a week between 1 and 40"
      : null;

  let dueError: string | null = null;
  if (dateMode === "due" && dueDate) {
    const due = new Date(`${dueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDue = new Date(today);
    maxDue.setDate(maxDue.getDate() + 280); // 40 weeks out
    if (Number.isNaN(due.getTime())) {
      dueError = "That date doesn't look right";
    } else if (due < today) {
      dueError = "That date has already passed — try entering your current week instead";
    } else if (due > maxDue) {
      dueError = "That's more than 40 weeks away — double-check the date";
    }
  }

  // The due date everything downstream is computed from: either entered
  // directly, or derived from the current pregnancy week.
  const resolvedDueDate =
    dateMode === "due"
      ? (dueDate && !dueError ? dueDate : "")
      : (weekValid ? dueDateFromWeek(weekNum) : "");

  const handleSaveProfile = async () => {
    if (!firstName || !resolvedDueDate) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        due_date: resolvedDueDate,
        pregnancy_number: pregnancyNumber,
        has_provider: hasProvider,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    if (dateMode === "week") setDueDate(resolvedDueDate);
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
    <PageBg step={step}>
      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <BellaOrb size={72} style={{ margin: "0 auto 20px" }} />

          <p className="gh-brand-tag" style={{ textAlign: "center", marginBottom: 12 }}>
            Your pregnancy companion
          </p>

          <h1
            className="gh-brand"
            style={{ fontSize: 30, letterSpacing: -0.5, marginBottom: 10 }}
          >
            Made for every mama
          </h1>

          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--gold)",
              marginBottom: 14,
            }}
          >
            Every heartbeat is a hello
          </p>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(251,238,224,0.7)",
              marginBottom: 18,
              padding: "0 6px",
            }}
          >
            Track your journey, ask questions, and connect with mamas just like you — all in one warm place.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 28 }}>
            <span className="gh-pill">Weekly guidance</span>
            <span className="gh-pill">Ask Bella anytime</span>
            <span className="gh-pill">Mama community</span>
          </div>

          <PrimaryCTA onClick={() => setStep(2)}>
            Get started <ArrowRight />
          </PrimaryCTA>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2
            className="gh-brand"
            style={{ fontSize: 26, letterSpacing: -0.5, textAlign: "center", marginBottom: 6 }}
          >
            Tell us about you
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "rgba(251,238,224,0.55)",
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            We'll personalise your experience
          </p>

          <GlassCard style={{ padding: "20px 18px", marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="gh-section-label" style={{ marginBottom: 6, display: "block" }}>Your name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="gh-auth-input" style={inputStyle} />
              </div>

              <div>
                <label className="gh-section-label" style={{ marginBottom: 6, display: "block" }}>Where are you in your journey?</label>

                {/* Segmented toggle: due date vs current week */}
                <div
                  role="tablist"
                  aria-label="How would you like to tell us?"
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 14,
                    padding: 4,
                    marginBottom: 10,
                  }}
                >
                  {([
                    { mode: "due" as const, label: "I know my due date" },
                    { mode: "week" as const, label: "I know my week" },
                  ]).map(({ mode, label }) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={dateMode === mode}
                      onClick={() => setDateMode(mode)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 11,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        fontWeight: dateMode === mode ? 700 : 500,
                        background: dateMode === mode ? "linear-gradient(135deg, var(--gold), var(--ember))" : "transparent",
                        color: dateMode === mode ? "var(--night)" : "rgba(251,238,224,0.65)",
                        transition: "background 200ms, color 200ms",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {dateMode === "due" ? (
                  <>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      aria-invalid={!!dueError}
                      className="gh-auth-input"
                      style={{ ...inputStyle, borderColor: dueError ? "rgba(232,98,46,0.6)" : undefined }}
                    />
                    {dueError && <FieldError>{dueError}</FieldError>}
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={40}
                      value={weekInput}
                      onChange={e => setWeekInput(e.target.value)}
                      placeholder="Current week (1–40)"
                      aria-invalid={!!weekError}
                      className="gh-auth-input"
                      style={{ ...inputStyle, borderColor: weekError ? "rgba(232,98,46,0.6)" : undefined }}
                    />
                    {weekError && <FieldError>{weekError}</FieldError>}
                    {!weekError && weekValid && resolvedDueDate && (
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "var(--gold)",
                          margin: "6px 2px 0",
                          lineHeight: 1.4,
                        }}
                      >
                        That puts your due date around{" "}
                        {new Date(`${resolvedDueDate}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="gh-section-label" style={{ marginBottom: 6, display: "block" }}>Pregnancy number</label>
                <select value={pregnancyNumber} onChange={e => setPregnancyNumber(Number(e.target.value))} className="gh-auth-input" style={inputStyle}>
                  <option value={1}>1st pregnancy</option>
                  <option value={2}>2nd pregnancy</option>
                  <option value={3}>3rd or more</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--cream)" }}>
                  Working with a midwife or OB?
                </span>
                <button
                  onClick={() => setHasProvider(!hasProvider)}
                  aria-pressed={hasProvider}
                  style={{
                    position: "relative",
                    width: 48,
                    height: 28,
                    borderRadius: 999,
                    background: hasProvider ? "var(--teal)" : "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    transition: "background 200ms",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: hasProvider ? 22 : 2,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--cream)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      transition: "left 200ms",
                    }}
                  />
                </button>
              </div>

              <PrimaryCTA onClick={handleSaveProfile} disabled={!firstName || !resolvedDueDate || saving}>
                {saving ? "Saving…" : <>Continue <ArrowRight /></>}
              </PrimaryCTA>
            </div>
          </GlassCard>
        </div>
      )}

      {step === 3 && currentWeek && weekData && (
        <div style={{ textAlign: "center" }}>
          <BellaOrb size={72} style={{ margin: "0 auto 20px" }} />

          <p className="gh-brand-tag" style={{ textAlign: "center", marginBottom: 12 }}>
            Week {currentWeek}
          </p>

          <h1
            className="gh-brand"
            style={{ fontSize: 28, letterSpacing: -0.5, marginBottom: 8 }}
          >
            Your journey starts now
          </h1>
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--gold)",
              marginBottom: 18,
            }}
          >
            Every heartbeat is a hello
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              color: "rgba(251,238,224,0.7)",
              marginBottom: 24,
            }}
          >
            Your baby is about the size of a <strong style={{ color: "var(--gold)" }}>{weekData.babySize.toLowerCase()}</strong>
          </p>

          <PrimaryCTA onClick={handleComplete}>Take me to my home <ArrowRight /></PrimaryCTA>
        </div>
      )}
    </PageBg>
  );
};

export default Onboarding;
