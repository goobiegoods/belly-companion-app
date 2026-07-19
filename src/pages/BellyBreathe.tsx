import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { recordBreathingSession, getBreathingStreak } from "@/lib/breathingStreak";
import { Wind, Moon, Waves, Feather, Flower2, Flame, Play, Pause, type LucideIcon } from "lucide-react";

type Step = "intention" | "technique" | "duration" | "session" | "complete";
type TechId = "478" | "box" | "44";

type Intention = {
  id: string;
  icon: LucideIcon;
  label: string;
  benefit: string;
  sessionSub: string;
  completionSub: string;
  recommended: TechId;
};

const INTENTIONS: Intention[] = [
  { id: "anxiety", icon: Wind, label: "Calm my anxiety", benefit: "Settle racing thoughts quickly",
    sessionSub: "Easing your mind, mama", completionSub: "Your nervous system just got a reset.", recommended: "478" },
  { id: "sleep", icon: Moon, label: "Help me sleep", benefit: "Wind down body and mind",
    sessionSub: "Drifting toward rest, mama", completionSub: "Your body is ready to rest.", recommended: "478" },
  { id: "labor", icon: Waves, label: "Labor preparation", benefit: "Breathe through waves and contractions",
    sessionSub: "Preparing your body, mama", completionSub: "You're building strength, breath by breath.", recommended: "box" },
  { id: "tension", icon: Feather, label: "Release body tension", benefit: "Melt the tightness away",
    sessionSub: "Melting the tension away", completionSub: "You released what wasn't yours to carry.", recommended: "44" },
  { id: "breathe", icon: Flower2, label: "Just breathe", benefit: "A moment of stillness for me",
    sessionSub: "A moment just for you", completionSub: "You showed up for yourself today.", recommended: "44" },
];

type Technique = {
  id: TechId;
  name: string;
  patternLabel: string;
  benefit: string;
  phases: { label: "Inhale" | "Hold" | "Exhale"; sec: number }[];
};

const TECHNIQUES: Technique[] = [
  { id: "478", name: "4-7-8 Breath", patternLabel: "4-7-8", benefit: "Best for anxiety and sleep",
    phases: [{ label: "Inhale", sec: 4 }, { label: "Hold", sec: 7 }, { label: "Exhale", sec: 8 }] },
  { id: "box", name: "Box Breath", patternLabel: "4-4-4-4", benefit: "Perfect for labor and focus",
    phases: [{ label: "Inhale", sec: 4 }, { label: "Hold", sec: 4 }, { label: "Exhale", sec: 4 }, { label: "Hold", sec: 4 }] },
  { id: "44", name: "4-4 Rhythm", patternLabel: "4-4", benefit: "Quick calm, anytime",
    phases: [{ label: "Inhale", sec: 4 }, { label: "Exhale", sec: 4 }] },
];

const DURATIONS = [
  { min: 1, label: "Quick reset", baseRounds: 1 },
  { min: 3, label: "Daily practice", baseRounds: 4 },
  { min: 5, label: "Deep calm", baseRounds: 7 },
  { min: 10, label: "Full reset", baseRounds: 14 },
];

const ARC_LEN = 502;

const BODY_FONT = "'Inter', system-ui, sans-serif";

const ctaStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--gold), var(--ember))",
  color: "var(--night)",
  fontFamily: BODY_FONT,
  fontWeight: 800,
  fontSize: 14,
  border: "none",
  borderRadius: 14,
  padding: 13,
  cursor: "pointer",
  boxShadow: "0 8px 24px -8px rgba(242,182,71,0.5)",
};

const SessionBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="gh-grain" style={{
    minHeight: "100dvh",
    background: "radial-gradient(ellipse at 50% 30%, rgba(44,156,143,0.28), transparent 60%), linear-gradient(180deg, var(--night), #0d0713)",
    position: "relative",
    overflow: "hidden",
    color: "var(--cream)",
    fontFamily: BODY_FONT,
  }}>
    <span style={{
      position: "absolute", top: -60, left: -60, width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(44,156,143,0.20) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <span style={{
      position: "absolute", bottom: -50, right: -50, width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(242,182,71,0.10) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
);

const BackCircle = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} aria-label="Back" className="gh-icon-btn" style={{ width: 36, height: 36 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </button>
);

const TopBar = ({ onBack, rightSlot, stepIndicator }: { onBack: () => void; rightSlot?: React.ReactNode; stepIndicator?: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
    <BackCircle onClick={onBack} />
    <p className="font-display" style={{ fontStyle: "italic", fontSize: 18, color: "var(--cream)", fontWeight: 500 }}>Belly Breathe</p>
    <div style={{ minWidth: 36, display: "flex", justifyContent: "flex-end" }}>
      {rightSlot ?? (stepIndicator ? (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(251,238,224,0.55)", fontWeight: 600, letterSpacing: "0.08em" }}>{stepIndicator}</span>
      ) : null)}
    </div>
  </div>
);

/* ------------------------------- STEP 1 ------------------------------- */
const IntentionStep = ({ onBack, onPick }: { onBack: () => void; onPick: (i: Intention) => void }) => {
  const [picked, setPicked] = useState<string | null>(null);
  const select = (i: Intention) => {
    if (picked) return;
    setPicked(i.id);
    setTimeout(() => onPick(i), 400);
  };
  return (
    <SessionBackground>
      <TopBar onBack={onBack} stepIndicator="1 of 3" />
      <div className="animate-fade-in" style={{ padding: "0 18px", flex: 1 }}>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 26, color: "var(--cream)", textAlign: "center", lineHeight: 1.1, marginTop: 40 }}>
          What do you need right now?
        </h1>
        <p style={{ fontFamily: BODY_FONT, fontSize: 11, color: "rgba(251,238,224,0.65)", textAlign: "center", marginTop: 8 }}>
          We'll personalize your session
        </p>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 24 }}>
          {INTENTIONS.map(i => {
            const sel = picked === i.id;
            const Icon = i.icon;
            return (
              <button key={i.id} onClick={() => select(i)} style={{
                background: sel ? "rgba(44,156,143,0.24)" : "rgba(255,255,255,0.07)",
                border: sel ? "1px solid rgba(44,156,143,0.60)" : "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", transition: "all 200ms ease", textAlign: "left",
              }}>
                <span style={{
                  width: 42, height: 42, borderRadius: "50%", background: "rgba(44,156,143,0.20)",
                  border: "1px solid rgba(44,156,143,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={20} strokeWidth={1.8} color="var(--cream)" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: BODY_FONT, fontSize: 14, fontWeight: 700, color: "var(--cream)" }}>{i.label}</p>
                  <p style={{ fontFamily: BODY_FONT, fontSize: 10, color: "rgba(251,238,224,0.6)", fontWeight: 500, marginTop: 2 }}>{i.benefit}</p>
                </div>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: sel ? "none" : "1.5px solid rgba(251,238,224,0.35)",
                  background: sel ? "var(--gold)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {sel && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--night)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </SessionBackground>
  );
};

/* ------------------------------- STEP 2 ------------------------------- */
const TechniqueStep = ({ intention, onBack, onContinue }: { intention: Intention; onBack: () => void; onContinue: (t: Technique) => void }) => {
  const [pick, setPick] = useState<TechId>(intention.recommended);
  const IntentionIcon = intention.icon;
  return (
    <SessionBackground>
      <TopBar onBack={onBack} stepIndicator="2 of 3" />
      <div className="animate-fade-in" style={{ padding: "0 18px", flex: 1, paddingBottom: 120 }}>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 24, color: "var(--cream)", textAlign: "center", marginTop: 24 }}>
          Your session
        </h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <span className="gh-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
            <IntentionIcon size={14} strokeWidth={1.8} />
            <span>{intention.label}</span>
          </span>
        </div>
        <div className="gh-section-label" style={{ marginTop: 22, marginBottom: 10 }}>
          Recommended for you
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TECHNIQUES.map(t => {
            const sel = pick === t.id;
            const isRecommended = intention.recommended === t.id;
            const totalSec = t.phases.reduce((s, p) => s + p.sec, 0);
            return (
              <button key={t.id} onClick={() => setPick(t.id)} style={{
                background: sel ? "rgba(44,156,143,0.22)" : "rgba(255,255,255,0.07)",
                border: sel ? "1.5px solid rgba(44,156,143,0.60)" : isRecommended ? "1.5px solid rgba(242,182,71,0.45)" : "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                borderRadius: 18, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                transition: "all 180ms ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 700, color: "var(--cream)" }}>{t.name}</p>
                  <span style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "3px 9px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, color: "var(--gold)" }}>
                    {t.patternLabel}
                  </span>
                </div>
                <p style={{ fontFamily: BODY_FONT, fontSize: 10, color: "rgba(251,238,224,0.6)", marginTop: 6 }}>{t.benefit}</p>
                <div style={{ display: "flex", gap: 3, marginTop: 8, alignItems: "center" }}>
                  {t.phases.map((p, idx) => (
                    <span key={idx} style={{
                      height: 4, borderRadius: 2, background: sel ? "rgba(44,156,143,0.70)" : "rgba(251,238,224,0.35)",
                      width: `${(p.sec / totalSec) * 100}%`, display: "block",
                    }} />
                  ))}
                  {isRecommended && (
                    <span style={{
                      marginLeft: "auto", background: "rgba(242,182,71,0.16)", border: "1px solid rgba(242,182,71,0.35)", borderRadius: 8,
                      padding: "2px 8px", fontSize: 8, color: "var(--gold)", fontFamily: BODY_FONT, fontWeight: 700, whiteSpace: "nowrap",
                    }}>Recommended</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", padding: "0 16px 20px" }}>
        <button onClick={() => onContinue(TECHNIQUES.find(t => t.id === pick)!)} style={{ ...ctaStyle, width: "100%" }}>
          Continue
        </button>
      </div>
    </SessionBackground>
  );
};

/* ------------------------------- STEP 3 ------------------------------- */
const DurationStep = ({ onBack, onStart }: { onBack: () => void; onStart: (min: number) => void }) => {
  const [pick, setPick] = useState<number>(3);
  return (
    <SessionBackground>
      <TopBar onBack={onBack} stepIndicator="3 of 3" />
      <div className="animate-fade-in" style={{ flex: 1, padding: "0 18px" }}>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 24, color: "var(--cream)", textAlign: "center", marginTop: 32 }}>
          How long do you have?
        </h1>
        <p style={{ fontFamily: BODY_FONT, fontSize: 11, color: "rgba(251,238,224,0.6)", textAlign: "center", marginTop: 8 }}>
          Even 1 minute makes a difference
        </p>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {DURATIONS.map(d => {
            const sel = pick === d.min;
            return (
              <button key={d.min} onClick={() => setPick(d.min)} style={{
                background: sel ? "rgba(44,156,143,0.24)" : "rgba(255,255,255,0.07)",
                border: sel ? "2px solid rgba(44,156,143,0.65)" : "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                borderRadius: 20, padding: "20px 12px", textAlign: "center", cursor: "pointer",
                boxShadow: sel ? "0 0 20px rgba(44,156,143,0.25)" : "none",
                transition: "all 180ms ease",
              }}>
                <p className="font-display" style={{ fontStyle: "italic", fontSize: 36, color: "var(--cream)", lineHeight: 1 }}>{d.min} min</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(242,182,71,0.85)", fontWeight: 600, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{d.label}</p>
                <p style={{ fontFamily: BODY_FONT, fontSize: 8, color: "rgba(251,238,224,0.5)", marginTop: 4 }}>{d.baseRounds} round{d.baseRounds === 1 ? "" : "s"}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => onStart(pick)} style={{ ...ctaStyle, width: "100%", padding: 14, marginTop: 20 }}>
          Start breathing
        </button>
      </div>
    </SessionBackground>
  );
};

/* ------------------------------- SESSION ------------------------------- */
const SessionStep = ({
  intention, technique, durationMin, onBack, onEnd, onComplete,
}: {
  intention: Intention; technique: Technique; durationMin: number;
  onBack: () => void;
  onEnd: () => void;
  onComplete: (stats: { roundsCompleted: number; elapsed: number }) => void;
}) => {
  const cycleSec = useMemo(() => technique.phases.reduce((s, p) => s + p.sec, 0), [technique]);
  const totalRounds = useMemo(() => Math.max(1, Math.round((durationMin * 60) / cycleSec)), [durationMin, cycleSec]);

  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(technique.phases[0].sec);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const completedRef = useRef(false);
  const elapsedRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const phasesRef = useRef(technique.phases);
  const totalRoundsRef = useRef(totalRounds);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { phasesRef.current = technique.phases; }, [technique]);
  useEffect(() => { totalRoundsRef.current = totalRounds; }, [totalRounds]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCount(c => {
        if (c > 1) return c - 1;
        setPhaseIdx(pi => {
          const phases = phasesRef.current;
          const nextIdx = (pi + 1) % phases.length;
          if (nextIdx === 0) {
            setRound(r => {
              const nr = r + 1;
              if (nr > totalRoundsRef.current && !completedRef.current) {
                completedRef.current = true;
                setTimeout(() => onCompleteRef.current({ roundsCompleted: totalRoundsRef.current, elapsed: elapsedRef.current + 1 }), 0);
              }
              return nr;
            });
          }
          setTimeout(() => setCount(phases[nextIdx].sec), 0);
          return nextIdx;
        });
        return 0;
      });
      elapsedRef.current += 1;
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, technique.id]);

  const phase = technique.phases[phaseIdx];
  const isInhale = phase.label === "Inhale";
  const isExhale = phase.label === "Exhale";
  const isHoldAfterInhale = phase.label === "Hold" && phaseIdx > 0 && technique.phases[phaseIdx - 1]?.label === "Inhale";

  // visual scale targets
  const expanded = isInhale || isHoldAfterInhale;
  const coreScale = expanded ? 1.18 : 1.0;
  const ringScale = expanded ? 1.12 : 1.0;

  // arc dashoffset target
  let arcOffset = ARC_LEN;
  if (isInhale) arcOffset = 0;
  else if (isExhale) arcOffset = ARC_LEN;
  else if (isHoldAfterInhale) arcOffset = 0;
  else arcOffset = ARC_LEN;

  // transition duration matches phase seconds (linear) for inhale/exhale; 0 for holds
  const arcTransition = (isInhale || isExhale) ? `stroke-dashoffset ${phase.sec}s linear` : "stroke-dashoffset 0.4s ease";
  const scaleTransition = (isInhale || isExhale) ? `transform ${phase.sec}s ease-in-out` : "transform 0.6s ease-in-out";

  const totalSec = totalRounds * cycleSec;
  const remainingSec = Math.max(0, totalSec - elapsed);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <SessionBackground>
      <TopBar
        onBack={onBack}
        rightSlot={
          <span style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "5px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: "var(--gold)" }}>
            {technique.patternLabel}
          </span>
        }
      />
      <div style={{ textAlign: "center", padding: "4px 16px 8px" }}>
        <p style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 700, color: "var(--cream)" }}>Calming Breath</p>
        <p style={{ fontFamily: BODY_FONT, fontStyle: "italic", fontSize: 10, color: "rgba(251,238,224,0.65)", marginTop: 3 }}>
          {intention.sessionSub}
        </p>
        <p style={{ fontFamily: BODY_FONT, fontSize: 10, color: "rgba(251,238,224,0.65)", fontWeight: 500, marginTop: 6 }}>
          Round {Math.min(round, totalRounds)} of {totalRounds} · {remainingSec}s remaining
        </p>
      </div>

      {/* breathing area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
        <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* outer ring */}
          <span style={{
            position: "absolute", width: 220, height: 220, borderRadius: "50%",
            border: "1px solid rgba(251,238,224,0.08)",
            transform: `scale(${ringScale})`, transition: scaleTransition,
          }} />
          {/* mid ring */}
          <span style={{
            position: "absolute", width: 196, height: 196, borderRadius: "50%",
            border: "1.5px solid rgba(44,156,143,0.28)",
            transform: `scale(${ringScale})`, transition: scaleTransition,
          }} />
          {/* glow disc */}
          <span style={{
            position: "absolute", width: 172, height: 172, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(242,182,71,0.14) 0%, rgba(44,156,143,0.10) 50%, transparent 80%)",
            opacity: expanded ? 1 : 0.6,
            transition: `opacity ${phase.sec}s ease-in-out`,
          }} />
          {/* arc svg */}
          <svg width="168" height="168" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx="84" cy="84" r="80" stroke="rgba(251,238,224,0.12)" strokeWidth="3" fill="none" />
            <circle
              cx="84" cy="84" r="80" stroke="var(--gold)" strokeWidth="3" fill="none"
              strokeLinecap="round"
              strokeDasharray={ARC_LEN}
              strokeDashoffset={arcOffset}
              style={{ transition: arcTransition, filter: "drop-shadow(0 0 5px rgba(242,182,71,0.7))" }}
            />
          </svg>
          {/* core */}
          <div style={{
            position: "absolute", width: 130, height: 130, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(242,182,71,0.18) 0%, rgba(44,156,143,0.40) 60%, rgba(21,10,31,0.35) 100%)",
            border: "2px solid rgba(251,238,224,0.30)",
            boxShadow: expanded
              ? "inset 0 0 30px rgba(44,156,143,0.25), 0 0 0 14px rgba(44,156,143,0.10)"
              : "inset 0 0 30px rgba(44,156,143,0.25), 0 0 0 0 rgba(44,156,143,0)",
            transform: `scale(${coreScale})`,
            transition: `${scaleTransition}, box-shadow ${phase.sec}s ease-in-out`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <p style={{ fontFamily: BODY_FONT, fontSize: 22, fontWeight: 700, color: "var(--cream)", lineHeight: 1 }}>{phase.label}</p>
            <p style={{ fontFamily: BODY_FONT, fontSize: 14, fontWeight: 600, color: "rgba(251,238,224,0.8)", marginTop: 6 }}>{count}</p>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px" }}>
        {[
          { v: `${Math.max(0, totalRounds - round + 1)}`, label: "rounds left" },
          { v: fmt(elapsed), label: "elapsed" },
          { v: "↓ Stress", label: "effect" },
        ].map((s, i) => (
          <div key={i} className="gh-glass-dark" style={{ borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
            <p className="font-display" style={{ fontSize: 18, color: "var(--cream)", lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontFamily: BODY_FONT, fontSize: 9, color: "rgba(251,238,224,0.6)", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 10, padding: "14px 16px 22px" }}>
        <button onClick={() => setPaused(p => !p)} style={{
          flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 12, padding: "12px 16px", color: "var(--cream)",
          fontFamily: BODY_FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {paused ? <Play size={15} strokeWidth={1.8} /> : <Pause size={15} strokeWidth={1.8} />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={onEnd} style={{ ...ctaStyle, flex: 1, borderRadius: 12, padding: "12px 16px", fontSize: 13 }}>
          End session
        </button>
      </div>
    </SessionBackground>
  );
};

/* ------------------------------- COMPLETE ------------------------------- */
const CompleteStep = ({
  intention, technique, durationMin, roundsCompleted, elapsed, onAgain, onHome,
}: {
  intention: Intention; technique: Technique; durationMin: number;
  roundsCompleted: number; elapsed: number;
  onAgain: () => void; onHome: () => void;
}) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      const res = await recordBreathingSession(user.id);
      if (!cancelled && res) setStreak(res.current);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const IntentionIcon = intention.icon;

  return (
    <SessionBackground>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 18px 0", textAlign: "center" }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%", marginBottom: 12,
          background: "radial-gradient(circle, rgba(242,182,71,0.20) 0%, rgba(44,156,143,0.30) 100%)",
          border: "1px solid rgba(251,238,224,0.25)",
          boxShadow: "0 0 30px rgba(44,156,143,0.30)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IntentionIcon size={34} strokeWidth={1.8} color="var(--cream)" />
        </div>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 32, color: "var(--cream)", lineHeight: 1.1 }}>Beautiful, mama.</h1>
        <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: "rgba(251,238,224,0.8)", fontWeight: 500, maxWidth: 220, lineHeight: 1.6, marginTop: 14 }}>
          {intention.completionSub}
        </p>

        <div className="gh-glass" style={{
          marginTop: 24, width: "100%", borderRadius: 18, padding: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
        }}>
          {[
            { v: `${durationMin} min`, label: "duration" },
            { v: `${roundsCompleted}`, label: "rounds" },
            { v: technique.patternLabel, label: "technique" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p className="font-display" style={{ fontSize: 18, color: "var(--cream)", lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontFamily: BODY_FONT, fontSize: 9, color: "rgba(251,238,224,0.6)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="gh-glass-dark" style={{ marginTop: 12, width: "100%", borderRadius: 14, padding: 12, textAlign: "center" }}>
          <p style={{ fontFamily: BODY_FONT, fontSize: 12, fontWeight: 700, color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Flame size={14} strokeWidth={1.8} color="var(--gold)" />
            Breathing streak: {streak} day{streak === 1 ? "" : "s"}
          </p>
          <p style={{ fontFamily: BODY_FONT, fontSize: 9, color: "rgba(251,238,224,0.6)", marginTop: 4 }}>
            Come back tomorrow to keep it going
          </p>
        </div>
        <p style={{ fontFamily: BODY_FONT, fontSize: 9, color: "rgba(251,238,224,0.4)", marginTop: 8 }}>
          Total time {fmt(elapsed)}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "0 18px 16px" }}>
        <button onClick={onAgain} style={{
          flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 12, padding: "13px 12px", color: "var(--cream)",
          fontFamily: BODY_FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          Breathe again
        </button>
        <button onClick={onHome} style={{ ...ctaStyle, flex: 1, borderRadius: 12, padding: "13px 12px", fontSize: 13 }}>
          Back to home
        </button>
      </div>
    </SessionBackground>
  );
};

/* ------------------------------- ROOT ------------------------------- */
const BellyBreathe = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intention");
  const [intention, setIntention] = useState<Intention | null>(null);
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [durationMin, setDurationMin] = useState<number>(3);
  const [finalStats, setFinalStats] = useState<{ roundsCompleted: number; elapsed: number }>({ roundsCompleted: 0, elapsed: 0 });

  const reset = () => {
    setIntention(null);
    setTechnique(null);
    setDurationMin(3);
    setStep("intention");
  };

  if (step === "intention" || !intention) {
    return (
      <IntentionStep
        onBack={() => navigate("/")}
        onPick={(i) => { setIntention(i); setStep("technique"); }}
      />
    );
  }
  if (step === "technique" || !technique) {
    return (
      <TechniqueStep
        intention={intention}
        onBack={() => setStep("intention")}
        onContinue={(t) => { setTechnique(t); setStep("duration"); }}
      />
    );
  }
  if (step === "duration") {
    return (
      <DurationStep
        onBack={() => setStep("technique")}
        onStart={(min) => { setDurationMin(min); setStep("session"); }}
      />
    );
  }
  if (step === "session") {
    return (
      <SessionStep
        intention={intention} technique={technique} durationMin={durationMin}
        onBack={() => setStep("duration")}
        onEnd={() => navigate("/")}
        onComplete={(stats) => { setFinalStats(stats); setStep("complete"); }}
      />
    );
  }
  return (
    <CompleteStep
      intention={intention} technique={technique} durationMin={durationMin}
      roundsCompleted={finalStats.roundsCompleted} elapsed={finalStats.elapsed}
      onAgain={reset}
      onHome={() => navigate("/")}
    />
  );
};

export default BellyBreathe;
