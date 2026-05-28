import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { recordBreathingSession, getBreathingStreak } from "@/lib/breathingStreak";

type Step = "intention" | "technique" | "duration" | "session" | "complete";
type TechId = "478" | "box" | "44";

type Intention = {
  id: string;
  emoji: string;
  label: string;
  benefit: string;
  sessionSub: string;
  completionSub: string;
  recommended: TechId;
};

const INTENTIONS: Intention[] = [
  { id: "anxiety", emoji: "😮‍💨", label: "Calm my anxiety", benefit: "Settle racing thoughts quickly",
    sessionSub: "Easing your mind, mama 😮‍💨", completionSub: "Your nervous system just got a reset.", recommended: "478" },
  { id: "sleep", emoji: "😴", label: "Help me sleep", benefit: "Wind down body and mind",
    sessionSub: "Drifting toward rest, mama 😴", completionSub: "Your body is ready to rest.", recommended: "478" },
  { id: "labor", emoji: "🌊", label: "Labor preparation", benefit: "Breathe through waves and contractions",
    sessionSub: "Preparing your body, mama 🌊", completionSub: "You're building strength, breath by breath.", recommended: "box" },
  { id: "tension", emoji: "💆", label: "Release body tension", benefit: "Melt the tightness away",
    sessionSub: "Melting the tension away 💆", completionSub: "You released what wasn't yours to carry.", recommended: "44" },
  { id: "breathe", emoji: "🌸", label: "Just breathe", benefit: "A moment of stillness for me",
    sessionSub: "A moment just for you 🌸", completionSub: "You showed up for yourself today.", recommended: "44" },
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

const SessionBackground = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    minHeight: "100vh",
    background: "linear-gradient(160deg, #E8702A 0%, #C84E08 55%, #A83800 100%)",
    position: "relative",
    overflow: "hidden",
    maxWidth: 430,
    margin: "0 auto",
  }}>
    <span style={{
      position: "absolute", top: -60, left: -60, width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,180,80,0.18) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <span style={{
      position: "absolute", bottom: -50, right: -50, width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,100,30,0.12) 0%, transparent 70%)", pointerEvents: "none",
    }} />
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
);

const BackCircle = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} aria-label="Back" style={{
    width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  </button>
);

const TopBar = ({ onBack, rightSlot, stepIndicator }: { onBack: () => void; rightSlot?: React.ReactNode; stepIndicator?: string }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
    <BackCircle onClick={onBack} />
    <p className="font-display" style={{ fontStyle: "italic", fontSize: 18, color: "#fff", fontWeight: 500 }}>Belly Breathe</p>
    <div style={{ minWidth: 36, display: "flex", justifyContent: "flex-end" }}>
      {rightSlot ?? (stepIndicator ? (
        <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{stepIndicator}</span>
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
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 26, color: "#fff", textAlign: "center", lineHeight: 1.1, marginTop: 40 }}>
          What do you need right now?
        </h1>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, color: "rgba(255,255,255,0.65)", textAlign: "center", marginTop: 8 }}>
          We'll personalize your session
        </p>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, paddingBottom: 24 }}>
          {INTENTIONS.map(i => {
            const sel = picked === i.id;
            return (
              <button key={i.id} onClick={() => select(i)} style={{
                background: sel ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.14)",
                border: sel ? "1px solid rgba(255,255,255,0.50)" : "1px solid rgba(255,255,255,0.22)",
                borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", transition: "all 200ms ease", textAlign: "left",
              }}>
                <span style={{
                  width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                }}>{i.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 14, fontWeight: 800, color: "#fff" }}>{i.label}</p>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginTop: 2 }}>{i.benefit}</p>
                </div>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: sel ? "none" : "1.5px solid rgba(255,255,255,0.35)",
                  background: sel ? "#fff" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {sel && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C84E08" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
  return (
    <SessionBackground>
      <TopBar onBack={onBack} stepIndicator="2 of 3" />
      <div className="animate-fade-in" style={{ padding: "0 18px", flex: 1, paddingBottom: 120 }}>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 24, color: "#fff", textAlign: "center", marginTop: 24 }}>
          Your session
        </h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <span style={{
            background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "6px 14px",
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "'Nunito',system-ui", fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            <span>{intention.emoji}</span>
            <span>{intention.label}</span>
          </span>
        </div>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.60)", fontWeight: 600, marginTop: 22, marginBottom: 10, letterSpacing: "0.05em" }}>
          RECOMMENDED FOR YOU
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TECHNIQUES.map(t => {
            const sel = pick === t.id;
            const isRecommended = intention.recommended === t.id;
            const totalSec = t.phases.reduce((s, p) => s + p.sec, 0);
            return (
              <button key={t.id} onClick={() => setPick(t.id)} style={{
                background: sel ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.14)",
                border: sel || isRecommended ? "1.5px solid rgba(255,255,255,0.50)" : "1px solid rgba(255,255,255,0.20)",
                borderRadius: 18, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                transition: "all 180ms ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 13, fontWeight: 800, color: "#fff" }}>{t.name}</p>
                  <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "3px 9px", fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {t.patternLabel}
                  </span>
                </div>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{t.benefit}</p>
                <div style={{ display: "flex", gap: 3, marginTop: 8, alignItems: "center" }}>
                  {t.phases.map((p, idx) => (
                    <span key={idx} style={{
                      height: 4, borderRadius: 2, background: "rgba(255,255,255,0.40)",
                      width: `${(p.sec / totalSec) * 100}%`, display: "block",
                    }} />
                  ))}
                  {isRecommended && (
                    <span style={{
                      marginLeft: "auto", background: "rgba(255,255,255,0.20)", borderRadius: 8,
                      padding: "2px 8px", fontSize: 8, color: "#fff", fontFamily: "'Nunito',system-ui", fontWeight: 700,
                    }}>Recommended ✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", padding: "0 16px 20px" }}>
        <button onClick={() => onContinue(TECHNIQUES.find(t => t.id === pick)!)} style={{
          width: "100%", background: "rgba(255,255,255,0.90)", color: "#C84E08",
          fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 14, border: "none",
          borderRadius: 14, padding: 13, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          Continue →
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
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 24, color: "#fff", textAlign: "center", marginTop: 32 }}>
          How long do you have?
        </h1>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, color: "rgba(255,255,255,0.60)", textAlign: "center", marginTop: 8 }}>
          Even 1 minute makes a difference
        </p>
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {DURATIONS.map(d => {
            const sel = pick === d.min;
            return (
              <button key={d.min} onClick={() => setPick(d.min)} style={{
                background: sel ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.14)",
                border: sel ? "2px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.20)",
                borderRadius: 20, padding: "20px 12px", textAlign: "center", cursor: "pointer",
                boxShadow: sel ? "0 0 20px rgba(255,255,255,0.15)" : "none",
                transition: "all 180ms ease",
              }}>
                <p className="font-display" style={{ fontStyle: "italic", fontSize: 36, color: "#fff", lineHeight: 1 }}>{d.min} min</p>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: 600, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.label}</p>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "rgba(255,255,255,0.50)", marginTop: 4 }}>{d.baseRounds} round{d.baseRounds === 1 ? "" : "s"}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => onStart(pick)} style={{
          width: "calc(100% - 0px)", background: "rgba(255,255,255,0.90)", color: "#C84E08",
          fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 14, border: "none",
          borderRadius: 14, padding: 14, cursor: "pointer", marginTop: 20,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          Start breathing →
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

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCount(c => {
        if (c > 1) return c - 1;
        // phase finished
        setPhaseIdx(pi => {
          const nextIdx = (pi + 1) % technique.phases.length;
          if (nextIdx === 0) {
            // round finished
            setRound(r => {
              const nr = r + 1;
              if (nr > totalRounds && !completedRef.current) {
                completedRef.current = true;
                setTimeout(() => onComplete({ roundsCompleted: totalRounds, elapsed: elapsed + 1 }), 0);
              }
              return nr;
            });
          }
          // set next count
          setTimeout(() => setCount(technique.phases[nextIdx].sec), 0);
          return nextIdx;
        });
        return 0;
      });
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, technique, totalRounds, onComplete, elapsed]);

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
          <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "5px 12px", fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            {technique.patternLabel}
          </span>
        }
      />
      <div style={{ textAlign: "center", padding: "4px 16px 8px" }}>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 13, fontWeight: 800, color: "#fff" }}>Calming Breath</p>
        <p style={{ fontFamily: "'Nunito',system-ui", fontStyle: "italic", fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
          {intention.sessionSub}
        </p>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 500, marginTop: 6 }}>
          Round {Math.min(round, totalRounds)} of {totalRounds} · {remainingSec}s remaining
        </p>
      </div>

      {/* breathing area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
        <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* outer ring */}
          <span style={{
            position: "absolute", width: 220, height: 220, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            transform: `scale(${ringScale})`, transition: scaleTransition,
          }} />
          {/* mid ring */}
          <span style={{
            position: "absolute", width: 196, height: 196, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.14)",
            transform: `scale(${ringScale})`, transition: scaleTransition,
          }} />
          {/* glow disc */}
          <span style={{
            position: "absolute", width: 172, height: 172, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,220,150,0.12) 0%, rgba(255,140,60,0.06) 50%, transparent 80%)",
            opacity: expanded ? 1 : 0.6,
            transition: `opacity ${phase.sec}s ease-in-out`,
          }} />
          {/* arc svg */}
          <svg width="168" height="168" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx="84" cy="84" r="80" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
            <circle
              cx="84" cy="84" r="80" stroke="#ffffff" strokeWidth="3" fill="none"
              strokeLinecap="round"
              strokeDasharray={ARC_LEN}
              strokeDashoffset={arcOffset}
              style={{ transition: arcTransition, filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
            />
          </svg>
          {/* core */}
          <div style={{
            position: "absolute", width: 130, height: 130, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,200,120,0.25) 0%, rgba(232,112,42,0.4) 60%, rgba(200,78,8,0.3) 100%)",
            border: "2px solid rgba(255,255,255,0.35)",
            boxShadow: expanded
              ? "inset 0 0 30px rgba(255,200,100,0.15), 0 0 0 14px rgba(255,255,255,0.06)"
              : "inset 0 0 30px rgba(255,200,100,0.15), 0 0 0 0 rgba(255,255,255,0)",
            transform: `scale(${coreScale})`,
            transition: `${scaleTransition}, box-shadow ${phase.sec}s ease-in-out`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{phase.label}</p>
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.80)", marginTop: 6 }}>{count}</p>
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
          <div key={i} style={{
            background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.20)",
            borderRadius: 12, padding: "10px 8px", textAlign: "center",
          }}>
            <p className="font-display" style={{ fontSize: 18, color: "#fff", lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 10, padding: "14px 16px 22px" }}>
        <button onClick={() => setPaused(p => !p)} style={{
          flex: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 12, padding: "12px 16px", color: "#fff",
          fontFamily: "'Nunito',system-ui", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button onClick={onEnd} style={{
          flex: 1, background: "rgba(255,255,255,0.90)", border: "none",
          borderRadius: 12, padding: "12px 16px", color: "#C84E08",
          fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}>
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

  return (
    <SessionBackground>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 18px 0", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{intention.emoji}</div>
        <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 32, color: "#fff", lineHeight: 1.1 }}>Beautiful, mama.</h1>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 12, color: "rgba(255,255,255,0.80)", fontWeight: 500, maxWidth: 220, lineHeight: 1.6, marginTop: 14 }}>
          {intention.completionSub}
        </p>

        <div style={{
          marginTop: 24, width: "100%", background: "rgba(255,255,255,0.14)",
          border: "0.5px solid rgba(255,255,255,0.22)", borderRadius: 18, padding: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
        }}>
          {[
            { v: `${durationMin} min`, label: "duration" },
            { v: `${roundsCompleted}`, label: "rounds" },
            { v: technique.patternLabel, label: "technique" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p className="font-display" style={{ fontSize: 18, color: "#fff", lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, width: "100%", background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12, textAlign: "center" }}>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 12, fontWeight: 800, color: "#fff" }}>
            🔥 Breathing streak: {streak} day{streak === 1 ? "" : "s"}
          </p>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.60)", marginTop: 4 }}>
            Come back tomorrow to keep it going
          </p>
        </div>
        <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.40)", marginTop: 8 }}>
          Total time {fmt(elapsed)}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "0 18px 16px" }}>
        <button onClick={onAgain} style={{
          flex: 1, background: "rgba(255,255,255,0.18)", border: "none",
          borderRadius: 12, padding: "13px 12px", color: "#fff",
          fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}>
          Breathe again
        </button>
        <button onClick={onHome} style={{
          flex: 1, background: "rgba(255,255,255,0.90)", border: "none",
          borderRadius: 12, padding: "13px 12px", color: "#C84E08",
          fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}>
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
