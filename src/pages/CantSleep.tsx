import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { AFFIRMATIONS, AFFIRMATION_CATEGORIES, BABY_QUIZ_QUESTIONS } from "@/data/cantSleepData";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["Affirmations", "Baby Quiz 🎮", "Breathe"] as const;

const CantSleep = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Affirmations");

  return (
    <div className="flex flex-col page-enter" style={{ background: "#FEF8F4", height: "100dvh", overflow: "hidden" }}>
      {/* Topbar */}
      <div className="px-5 pt-5 pb-2 shrink-0" style={{ background: "rgba(254,248,244,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => navigate(-1)} style={{ color: "rgba(200,88,40,0.5)", fontSize: 12, fontWeight: 500 }}>← Back</button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Hero */}
        <div className="mx-4 mt-3 mb-4 rounded-[22px] p-5 relative overflow-hidden" style={{ background: "linear-gradient(140deg, #2A1A40, #3D2055, #5A2A70)", boxShadow: "0 10px 36px rgba(60,20,100,0.35)" }}>
          <div className="absolute rounded-full" style={{ width: 100, height: 100, right: -20, top: -20, background: "rgba(255,200,255,0.08)" }} />
          <div className="absolute rounded-full" style={{ width: 70, height: 70, left: -15, bottom: -25, background: "rgba(255,180,255,0.06)" }} />
          <div className="absolute right-4 top-4" style={{ fontSize: 28, animation: "float 3s ease-in-out infinite" }}>🌙</div>
          <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,220,255,0.55)", marginBottom: 4 }}>3am mode</p>
          <h1 style={{ fontSize: 19, fontWeight: 600, color: "#FFF0FF", lineHeight: 1.3, marginBottom: 4 }}>You're awake.<br />That's okay.</h1>
          <p style={{ fontSize: 7.5, color: "rgba(255,220,255,0.6)", marginBottom: 12 }}>Gentle things for restless nights in week {currentWeek}.</p>
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="rounded-full px-3 py-1.5 transition-all"
                style={{
                  fontSize: 10, fontWeight: 500,
                  background: activeTab === tab ? "rgba(255,180,255,0.25)" : "rgba(255,255,255,0.12)",
                  border: `1px solid ${activeTab === tab ? "rgba(255,180,255,0.4)" : "rgba(255,255,255,0.2)"}`,
                  color: activeTab === tab ? "#FFF0FF" : "rgba(255,255,255,0.6)",
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ paddingBottom: 100 }}>
          {activeTab === "Affirmations" && <AffirmationsTab userId={user?.id} onSwitchTab={setActiveTab} />}
          {activeTab === "Baby Quiz 🎮" && <QuizTab userId={user?.id} />}
          {activeTab === "Breathe" && <BreatheTab />}
        </div>
      </div>
    </div>
  );
};

// ─── Affirmations ───
const AffirmationsTab = ({ userId, onSwitchTab }: { userId?: string; onSwitchTab: (tab: typeof TABS[number]) => void }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffled, setShuffled] = useState<number[]>([]);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const indices = Array.from({ length: AFFIRMATIONS.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffled(indices);
  }, []);

  const next = useCallback(() => {
    const nextIdx = (currentIdx + 1) % shuffled.length;
    setCurrentIdx(nextIdx);
    setFadeKey(k => k + 1);
    if (userId) {
      supabase.from("affirmation_views").insert({ user_id: userId, affirmation_index: shuffled[nextIdx] });
    }
  }, [currentIdx, shuffled, userId]);

  // Fullscreen affirmation viewer
  if (fullscreen && shuffled.length > 0) {
    const affirmation = AFFIRMATIONS[shuffled[currentIdx]];
    const dotPos = currentIdx % 6;
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center" style={{ background: "linear-gradient(160deg, #2A1A40 0%, #3D2055 50%, #2A1A40 100%)", padding: "0 24px 48px", justifyContent: "space-between" }} onClick={next}>
        {/* Top bar */}
        <div className="w-full flex items-center justify-between" style={{ paddingTop: 52, paddingBottom: 24 }}>
          <button onClick={(e) => { e.stopPropagation(); setFullscreen(false); }} style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,200,255,0.6)", background: "none", border: "none" }}>← Back</button>
          <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,240,255,0.85)" }}>Tonight's affirmations</p>
          <span style={{ fontSize: 20 }}>🌙</span>
        </div>

        {/* Center card */}
        <div key={fadeKey} className="w-full flex flex-col items-center" style={{
          flex: 1, justifyContent: "center", display: "flex",
          borderRadius: 28, padding: "40px 28px",
          background: "linear-gradient(145deg, #3D2060, #5A2880)",
          border: "0.5px solid rgba(255,180,255,0.2)",
          boxShadow: "0 20px 60px rgba(60,0,100,0.45)",
          animation: "fadeSwap 300ms ease",
          maxHeight: "55vh",
        }}>
          <div style={{ fontSize: 52, animation: "float 3s ease-in-out infinite" }}>🌸</div>
          <p className="text-center" style={{ fontSize: 22, fontStyle: "italic", fontWeight: 400, color: "rgba(255,240,255,0.92)", lineHeight: 1.65, letterSpacing: "0.01em", marginTop: 24 }}>"{affirmation}"</p>
          <p style={{ fontSize: 10, color: "rgba(255,200,255,0.3)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 8 }}>Tap for next card</p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center" style={{ gap: 16, paddingTop: 20 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: i === dotPos ? 24 : 8, height: 8, borderRadius: i === dotPos ? 4 : "50%", background: i === dotPos ? "rgba(255,180,255,0.75)" : "rgba(255,255,255,0.2)", transition: "width 200ms ease" }} />
            ))}
          </div>
          <p className="text-center" style={{ fontSize: 13, fontStyle: "italic", color: "rgba(255,200,255,0.35)" }}>You are doing beautifully, mama 🌸</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.4)", padding: "8px 16px 5px", fontWeight: 600 }}>Tap a card to read</p>
      {/* Horizontal scroll row */}
      <div className="flex hide-scrollbar" style={{ gap: 10, paddingLeft: 16, paddingRight: 32, paddingBottom: 6, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" as any, scrollbarWidth: "none" as any, msOverflowStyle: "none" as any }}>
        {AFFIRMATION_CATEGORIES.map((cat, i) => (
          <button key={cat.label} onClick={() => { setCurrentIdx(i * 6); setFullscreen(true); }}
            className="flex flex-col text-left"
            style={{
              flexShrink: 0, width: 160, height: 110, borderRadius: 18, padding: "14px 14px",
              background: `linear-gradient(145deg, ${cat.gradient[0]}, ${cat.gradient[1]})`,
              border: `0.5px solid ${cat.border}`, cursor: "pointer", transition: "transform 140ms",
              justifyContent: "space-between",
            }}
            onPointerDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onPointerUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{cat.emoji}</div>
            <p style={{ fontSize: 9, fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.88)", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginTop: 8, flex: 1 }}>{cat.preview}</p>
            <p style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: 6 }}>Tap to read</p>
          </button>
        ))}
      </div>

      {/* More for tonight */}
      <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.4)", padding: "12px 16px 6px", fontWeight: 600 }}>More for tonight</p>

      {/* Breathing preview card */}
      <button onClick={() => onSwitchTab("Breathe")} className="w-full text-left" style={{ margin: "0 16px", width: "calc(100% - 32px)", borderRadius: 16, padding: "14px 16px", background: "linear-gradient(135deg, rgba(42,26,64,0.08), rgba(90,42,112,0.06))", border: "0.5px solid rgba(150,80,200,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(180,120,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 12px rgba(180,120,255,0.2)", flexShrink: 0 }}>🫧</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#7040A0" }}>4-7-8 Breathing</p>
          <p style={{ fontSize: 7.5, color: "rgba(120,70,160,0.6)" }}>Tap to start a guided breathing session</p>
        </div>
        <span style={{ fontSize: 16, color: "rgba(150,80,200,0.4)", flexShrink: 0 }}>›</span>
      </button>

      {/* Quiz preview card */}
      <button onClick={() => onSwitchTab("Baby Quiz 🎮")} className="w-full text-left" style={{ margin: "8px 16px 0", width: "calc(100% - 32px)", borderRadius: 16, padding: "14px 16px", background: "linear-gradient(135deg, rgba(42,26,64,0.08), rgba(60,30,80,0.06))", border: "0.5px solid rgba(100,60,160,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(100,60,160,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧠</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#6040A0" }}>Baby Brain Quiz</p>
          <p style={{ fontSize: 7.5, color: "rgba(100,60,140,0.55)" }}>10 fun pregnancy trivia questions</p>
        </div>
        <span style={{ fontSize: 16, color: "rgba(100,60,160,0.35)", flexShrink: 0 }}>›</span>
      </button>
    </div>
  );
};

// ─── Quiz (inline, warm background) ───
const QuizTab = ({ userId }: { userId?: string }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showFact, setShowFact] = useState(false);

  const q = BABY_QUIZ_QUESTIONS[qIdx];
  const correctIdx = q.options.findIndex(o => o.correct);
  const progress = ((qIdx + 1) / BABY_QUIZ_QUESTIONS.length) * 100;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = q.options[idx].correct;
    if (correct) setScore(s => s + 1);
    setTimeout(() => setShowFact(true), 250);
    if (userId) {
      supabase.from("quiz_attempts").insert({
        user_id: userId, lesson_id: "cant-sleep-quiz", selected_option: q.options[idx].text, is_correct: correct, score: correct ? 1 : 0, total_questions: 1,
      });
    }
  };

  const handleNext = () => {
    if (qIdx < BABY_QUIZ_QUESTIONS.length - 1) {
      setQIdx(i => i + 1);
    } else {
      setQIdx(0);
      setScore(0);
    }
    setSelected(null);
    setAnswered(false);
    setShowFact(false);
  };

  const getOptionStyle = (idx: number) => {
    if (!answered) return { background: "rgba(255,242,234,0.85)", border: "0.5px solid rgba(255,170,130,0.28)", color: "#C4784A", animation: "none" };
    if (idx === correctIdx) return { background: "rgba(200,240,210,0.9)", border: "1px solid rgba(80,180,110,0.5)", color: "#30A050", animation: "scaleCorrect 300ms ease" };
    if (idx === selected) return { background: "rgba(255,210,210,0.85)", border: "0.5px solid rgba(240,130,130,0.4)", color: "#C05050", animation: "shake 200ms ease" };
    return { background: "rgba(255,242,234,0.5)", border: "0.5px solid rgba(255,170,130,0.15)", color: "#C4784A", animation: "none" };
  };

  const isCorrect = selected !== null && selected === correctIdx;

  return (
    <div style={{ padding: "0 0 24px" }}>
      {/* Score row */}
      <div className="flex items-center justify-between" style={{ padding: "12px 16px 8px" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(200,88,40,0.5)", fontWeight: 600 }}>Baby Brain 🧠</p>
        <p style={{ fontSize: 20, fontWeight: 300, color: "#FF7840" }}>{score}/{qIdx + 1}</p>
      </div>

      {/* Quiz card */}
      <div style={{ margin: "0 16px", borderRadius: 22, overflow: "hidden", background: "rgba(255,255,255,0.75)", border: "0.5px solid rgba(255,170,130,0.22)", backdropFilter: "blur(16px)", boxShadow: "0 4px 20px rgba(255,140,90,0.08)" }}>
        {/* Dark header */}
        <div style={{ background: "linear-gradient(135deg, #2A1A40, #4A2060)", padding: "18px 18px 16px" }}>
          <p style={{ fontSize: 8, color: "rgba(255,200,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>Question {qIdx + 1} of {BABY_QUIZ_QUESTIONS.length}</p>
          <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,0.1)", marginBottom: 14 }}>
            <div style={{ height: "100%", borderRadius: 3, background: "rgba(255,180,255,0.7)", width: `${progress}%`, transition: "width 300ms ease" }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "#FFF0FF", lineHeight: 1.4 }}>{q.question}</p>
        </div>

        {/* Options grid */}
        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {q.options.map((opt, idx) => {
            const s = getOptionStyle(idx);
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                style={{
                  borderRadius: 16, padding: "14px 10px", textAlign: "center",
                  background: s.background, border: s.border,
                  cursor: answered ? "default" : "pointer", transition: "all 180ms ease",
                  animation: s.animation,
                }}>
                {opt.emoji && <span style={{ fontSize: 28, marginBottom: 6, display: "block" }}>{opt.emoji}</span>}
                <span style={{ fontSize: 9, fontWeight: 500, color: s.color, lineHeight: 1.3 }}>
                  {answered && idx === correctIdx && "✓ "}{opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fun fact */}
      {showFact && selected !== null && q.options[selected]?.funFact && (
        <div style={{
          margin: "10px 16px 0", borderRadius: 14, padding: "12px 14px",
          background: isCorrect ? "rgba(200,240,210,0.5)" : "rgba(255,225,215,0.5)",
          border: `0.5px solid ${isCorrect ? "rgba(100,200,130,0.35)" : "rgba(255,160,130,0.35)"}`,
          animation: "slideUp 250ms ease",
        }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: isCorrect ? "#40A060" : "#E07040", marginBottom: 4 }}>
            {isCorrect ? "✓ Correct! 🌸" : "Almost! Here's why 💡"}
          </p>
          <p style={{ fontSize: 9, color: isCorrect ? "#60B080" : "#C07050", lineHeight: 1.6 }}>{q.options[selected].funFact}</p>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button onClick={handleNext} style={{
          margin: "10px 16px 0", width: "calc(100% - 32px)", borderRadius: 14, padding: "13px 0",
          background: "linear-gradient(145deg, #FF7840, #FFAB80)", border: "none",
          color: "white", fontSize: 10, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(255,120,64,0.3)",
        }}>
          {qIdx < BABY_QUIZ_QUESTIONS.length - 1 ? "Next question →" : "Play again 🔄"}
        </button>
      )}

      {/* Footer */}
      <p className="text-center" style={{ fontSize: 12, fontStyle: "italic", color: "rgba(180,100,60,0.38)", padding: "12px 0 24px" }}>Learning about your little one 💕</p>
    </div>
  );
};

// ─── Breathe (inline, warm background) ───
const BreatheTab = () => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!active) return;
    const phaseTime = phase === "inhale" ? 4 : phase === "hold" ? 7 : 8;
    setCount(phaseTime);
    intervalRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          if (phase === "inhale") setPhase("hold");
          else if (phase === "hold") setPhase("exhale");
          else { setPhase("inhale"); setCycle(cy => cy + 1); }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, phase]);

  const stop = () => { setActive(false); setPhase("inhale"); setCount(4); setCycle(0); clearInterval(intervalRef.current); };
  const phaseLabel = phase === "inhale" ? "Inhale slowly..." : phase === "hold" ? "Hold..." : "Exhale slowly...";

  return (
    <div className="flex flex-col items-center" style={{ padding: "20px 16px", gap: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(200,88,40,0.5)", fontWeight: 600, textAlign: "center" }}>
        {active ? phaseLabel : "4-7-8 breathing"}
      </p>

      {/* Rings */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {[70, 100, 140, 180].map((size, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: size, height: size,
            border: `1.5px dashed rgba(255,120,64,${0.1 + i * 0.08})`,
            animation: active ? `ringPulse 4s ease-in-out infinite ${i * 0.4}s` : "none",
          }} />
        ))}
        <div className="flex items-center justify-center rounded-full" style={{
          width: 48, height: 48,
          background: "linear-gradient(145deg, rgba(255,120,64,0.3), rgba(255,170,100,0.2))",
          boxShadow: "0 0 30px rgba(255,120,64,0.15)",
          animation: active ? "breathe 4s ease-in-out infinite" : "none",
          fontSize: 24,
        }}>🫧</div>
        {active && (
          <p className="absolute" style={{ fontSize: 28, fontWeight: 300, color: "#A84E28" }}>{count}</p>
        )}
      </div>

      {/* Dots */}
      <div className="flex" style={{ gap: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-full" style={{
            width: 6, height: 6,
            background: cycle % 4 === i && active ? "rgba(200,88,40,0.7)" : "rgba(200,88,40,0.2)",
          }} />
        ))}
      </div>

      <p className="text-center" style={{ fontSize: 11, fontStyle: "italic", color: "rgba(180,100,60,0.45)", maxWidth: 260, lineHeight: 1.6 }}>
        "Breathe in the love you have for this little one. Breathe out the worry."
      </p>

      <button onClick={() => active ? stop() : setActive(true)}
        style={{
          background: "rgba(255,120,64,0.12)", border: "0.5px solid rgba(255,120,64,0.25)",
          borderRadius: 14, padding: "11px 24px", color: "#C85828", fontSize: 12, fontWeight: 600,
        }}>
        {active ? "Stop" : "Start breathing guide"}
      </button>
    </div>
  );
};

export default CantSleep;
