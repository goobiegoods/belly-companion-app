import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { toast } from "sonner";
import { SceneBackground, GlassCard, BellaOrb } from "@/components/golden";
import {
  BRANCHES,
  SEASON_OPTIONS,
  pregnancyNumberFromAnswer,
  type Question,
  type Season,
} from "./onboarding/questions";

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

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 12H5" />
    <path d="M11 18l-6-6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--night)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

// Full-window Golden Hour chrome: scene gradient + centered 430px column.
const PageBg = ({
  progress,
  onBack,
  children,
}: {
  progress: number;
  onBack: (() => void) | null;
  children: React.ReactNode;
}) => (
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
        position: "relative",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            position: "absolute",
            top: 22,
            left: 18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(251,238,224,0.8)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft />
        </button>
      )}
      {/* Step progress */}
      <div className="gh-progress-track" style={{ width: 120, margin: "0 auto 26px" }}>
        <div className="gh-progress-fill" style={{ width: `${Math.round(progress * 100)}%`, transition: "width 300ms ease" }} />
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

// One selectable answer: full-width glass row, gold when chosen.
const OptionButton = ({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    aria-pressed={selected}
    style={{
      width: "100%",
      textAlign: "left",
      borderRadius: 14,
      padding: "14px 16px",
      cursor: "pointer",
      background: selected ? "rgba(242,182,71,0.16)" : "rgba(255,255,255,0.07)",
      border: `1.5px solid ${selected ? "var(--gold)" : "rgba(255,255,255,0.16)"}`,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      transition: "background 180ms, border-color 180ms",
    }}
  >
    <span>
      <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 600, color: "var(--cream)" }}>
        {label}
      </span>
      {sub && (
        <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "rgba(251,238,224,0.55)", marginTop: 2 }}>
          {sub}
        </span>
      )}
    </span>
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        flexShrink: 0,
        background: selected ? "linear-gradient(135deg, var(--gold), var(--ember))" : "rgba(255,255,255,0.10)",
        border: selected ? "none" : "1px solid rgba(255,255,255,0.22)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 180ms",
      }}
    >
      {selected && <CheckIcon />}
    </span>
  </button>
);

const QuestionHeading = ({ prompt, sub }: { prompt: string; sub?: string }) => (
  <div style={{ textAlign: "center", marginBottom: 22 }}>
    <BellaOrb size={44} style={{ margin: "0 auto 14px" }} />
    <h2 className="gh-brand" style={{ fontSize: 24, letterSpacing: -0.5, lineHeight: 1.25 }}>
      {prompt}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: "italic",
          fontSize: 13,
          color: "rgba(251,238,224,0.6)",
          marginTop: 8,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const DONE_SEASON_LINES: Record<Season, string> = {
  pregnant: "",
  trying_to_conceive: "Every path to baby looks different — yours matters here.",
  postpartum: "Recovery is its own journey. We'll walk it with you.",
  raising_little_ones: "The little years are big years. You're not doing them alone.",
  general_wellness: "This is your space to breathe, learn, and feel good again.",
};

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [season, setSeason] = useState<Season | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [dueDate, setDueDate] = useState("");
  const [dateMode, setDateMode] = useState<"due" | "week">("due");
  const [weekInput, setWeekInput] = useState("");
  const [saving, setSaving] = useState(false);
  // Suppresses the already-onboarded redirect while we save + refresh the
  // profile, so completion lands on /welcome instead of bouncing to "/".
  const [finishing, setFinishing] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed && !finishing) return <Navigate to="/" replace />;

  // Screen list: fixed intro screens, then the chosen season's questions, then
  // the completion moment. Before a season is picked the branch is empty.
  const branch: Question[] = season ? BRANCHES[season] : [];
  const screens: string[] = ["welcome", "name", "season", ...branch.map(q => q.id), "done"];
  const screenId = screens[Math.min(index, screens.length - 1)];
  const activeQuestion = branch.find(q => q.id === screenId) ?? null;

  const goNext = () => setIndex(i => i + 1);
  const goBack = () => setIndex(i => Math.max(0, i - 1));

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

  const pickSeason = (s: Season) => {
    if (s !== season) {
      // Switching seasons invalidates previous branch answers.
      setAnswers({});
      setDueDate("");
      setWeekInput("");
    }
    setSeason(s);
    setTimeout(goNext, 260);
  };

  const pickAnswer = (questionId: string, label: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: label }));
    setTimeout(goNext, 260);
  };

  const toggleAnswer = (questionId: string, label: string) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const next = current.includes(label) ? current.filter(l => l !== label) : [...current, label];
      return { ...prev, [questionId]: next };
    });
  };

  const handleComplete = async () => {
    if (!season || saving) return;
    setSaving(true);
    setFinishing(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        season,
        due_date: season === "pregnant" ? resolvedDueDate : null,
        pregnancy_number:
          season === "pregnant" ? pregnancyNumberFromAnswer(answers.firstPregnancy as string) : 1,
        has_provider: season === "pregnant" ? answers.provider === "Yes" : false,
        onboarding_answers: answers,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    if (error) {
      setSaving(false);
      setFinishing(false);
      toast.error("Failed to save — please try again");
      return;
    }
    track("onboarding_completed", { season });
    await refreshProfile();
    navigate("/welcome");
  };

  const currentWeek = season === "pregnant" && resolvedDueDate ? getCurrentWeek(resolvedDueDate) : null;
  const weekData = currentWeek ? getWeekData(currentWeek) : null;

  return (
    <PageBg
      progress={index / (screens.length - 1)}
      onBack={index > 0 && !saving ? goBack : null}
    >
      {/* Keyed wrapper re-mounts per screen so each question fades in. */}
      <div key={screenId} style={{ animation: "fadeInUp 320ms ease both" }}>
        {screenId === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <BellaOrb size={72} style={{ margin: "0 auto 20px" }} />

            <p className="gh-brand-tag" style={{ textAlign: "center", marginBottom: 12 }}>
              Your companion for every season
            </p>

            <h1 className="gh-brand" style={{ fontSize: 30, letterSpacing: -0.5, marginBottom: 10 }}>
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
              A few gentle questions, and we'll shape Belly around exactly where you are.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 28 }}>
              <span className="gh-pill">Daily guidance</span>
              <span className="gh-pill">Ask Bella anytime</span>
              <span className="gh-pill">Mama community</span>
            </div>

            <PrimaryCTA onClick={goNext}>
              Get started <ArrowRight />
            </PrimaryCTA>
          </div>
        )}

        {screenId === "name" && (
          <div>
            <QuestionHeading prompt="What should we call you?" sub="Bella likes to greet you properly" />
            <GlassCard style={{ padding: "20px 18px", marginBottom: 16 }}>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && firstName.trim()) goNext(); }}
                placeholder="Your first name"
                maxLength={100}
                autoFocus
                className="gh-auth-input"
                style={inputStyle}
              />
            </GlassCard>
            <PrimaryCTA onClick={goNext} disabled={!firstName.trim()}>
              Continue <ArrowRight />
            </PrimaryCTA>
          </div>
        )}

        {screenId === "season" && (
          <div>
            <QuestionHeading
              prompt={`Which season are you in${firstName.trim() ? `, ${firstName.trim()}` : ""}?`}
              sub="Belly shapes itself around your answer"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SEASON_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={season === opt.value}
                  onClick={() => pickSeason(opt.value)}
                />
              ))}
            </div>
          </div>
        )}

        {activeQuestion?.kind === "dueDate" && (
          <div>
            <QuestionHeading prompt={activeQuestion.prompt} sub={activeQuestion.sub} />
            <GlassCard style={{ padding: "20px 18px", marginBottom: 16 }}>
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
            </GlassCard>
            <PrimaryCTA onClick={goNext} disabled={!resolvedDueDate}>
              Continue <ArrowRight />
            </PrimaryCTA>
          </div>
        )}

        {activeQuestion?.kind === "select" && (
          <div>
            <QuestionHeading prompt={activeQuestion.prompt} sub={activeQuestion.sub} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeQuestion.options?.map(label => (
                <OptionButton
                  key={label}
                  label={label}
                  selected={answers[activeQuestion.id] === label}
                  onClick={() => pickAnswer(activeQuestion.id, label)}
                />
              ))}
            </div>
          </div>
        )}

        {activeQuestion?.kind === "multiselect" && (
          <div>
            <QuestionHeading prompt={activeQuestion.prompt} sub={activeQuestion.sub} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {activeQuestion.options?.map(label => {
                const selectedList = Array.isArray(answers[activeQuestion.id])
                  ? (answers[activeQuestion.id] as string[])
                  : [];
                return (
                  <OptionButton
                    key={label}
                    label={label}
                    selected={selectedList.includes(label)}
                    onClick={() => toggleAnswer(activeQuestion.id, label)}
                  />
                );
              })}
            </div>
            <PrimaryCTA
              onClick={goNext}
              disabled={!Array.isArray(answers[activeQuestion.id]) || (answers[activeQuestion.id] as string[]).length === 0}
            >
              Continue <ArrowRight />
            </PrimaryCTA>
          </div>
        )}

        {screenId === "done" && season && (
          <div style={{ textAlign: "center" }}>
            <BellaOrb size={72} style={{ margin: "0 auto 20px" }} />

            {currentWeek ? (
              <p className="gh-brand-tag" style={{ textAlign: "center", marginBottom: 12 }}>
                Week {currentWeek}
              </p>
            ) : (
              <p className="gh-brand-tag" style={{ textAlign: "center", marginBottom: 12 }}>
                Your space is ready
              </p>
            )}

            <h1 className="gh-brand" style={{ fontSize: 28, letterSpacing: -0.5, marginBottom: 8 }}>
              You're all set{firstName.trim() ? `, ${firstName.trim()}` : ""}
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
              Every season deserves a companion
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(251,238,224,0.7)",
                marginBottom: 24,
              }}
            >
              {season === "pregnant" && weekData ? (
                <>
                  Your baby is about the size of a{" "}
                  <strong style={{ color: "var(--gold)" }}>{weekData.babySize.toLowerCase()}</strong>
                </>
              ) : (
                DONE_SEASON_LINES[season]
              )}
            </p>

            <PrimaryCTA onClick={handleComplete} disabled={saving}>
              {saving ? "One moment…" : <>Meet Bella <ArrowRight /></>}
            </PrimaryCTA>
          </div>
        )}
      </div>
    </PageBg>
  );
};

export default Onboarding;
