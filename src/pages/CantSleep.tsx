import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { AFFIRMATIONS, AFFIRMATION_CATEGORIES, BABY_QUIZ_QUESTIONS } from "@/data/cantSleepData";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Flower2, Star, Flame, Leaf, Wind, Brain, ChevronRight, type LucideIcon } from "lucide-react";

const TABS = ["Affirmations", "Baby Quiz", "Breathe"] as const;

const BODY_FONT = "'Inter', system-ui, sans-serif";

const ctaStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--gold), var(--ember))",
  color: "var(--night)",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 20px -8px rgba(242,182,71,0.5)",
};

const CantSleep = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Affirmations");

  return (
    <div className="page-enter gh-grain" style={{
      minHeight: "100dvh",
      background: "radial-gradient(circle at 50% 0%, rgba(58,26,56,0.65), transparent 55%), linear-gradient(180deg, var(--night) 0%, #0d0713 100%)",
      color: "var(--cream)",
      fontFamily: BODY_FONT,
      position: "relative",
      overflow: "clip",
    }}>
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Topbar */}
        <div className="px-5 pt-5 pb-2">
          <button onClick={() => navigate(-1)} className="gh-icon-btn" aria-label="Back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Hero */}
        <div className="mx-4 mt-3 mb-4 rounded-[22px] p-5 relative overflow-hidden" style={{
          background: "linear-gradient(140deg, #1d0f28, var(--plum) 55%, #4a2246)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 10px 36px rgba(0,0,0,0.45)",
        }}>
          <div className="absolute rounded-full" style={{ width: 100, height: 100, right: -20, top: -20, background: "rgba(242,182,71,0.08)" }} />
          <div className="absolute rounded-full" style={{ width: 70, height: 70, left: -15, bottom: -25, background: "rgba(181,56,107,0.10)" }} />
          <div className="absolute right-4 top-4" style={{ animation: "float 3s ease-in-out infinite" }}>
            <Moon size={26} strokeWidth={1.8} color="var(--gold)" />
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(242,182,71,0.85)", marginBottom: 6 }}>3am mode</p>
          <h1 className="font-display" style={{ fontStyle: "italic", fontSize: 21, fontWeight: 600, color: "var(--cream)", lineHeight: 1.25, marginBottom: 4 }}>You're awake.<br />That's okay.</h1>
          <p style={{ fontSize: 10, color: "rgba(251,238,224,0.6)", marginBottom: 12 }}>Gentle things for restless nights in week {currentWeek}.</p>
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="rounded-full px-3 py-1.5 transition-all"
                style={{
                  fontSize: 10, fontWeight: 500, fontFamily: BODY_FONT,
                  background: activeTab === tab ? "rgba(242,182,71,0.20)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${activeTab === tab ? "rgba(242,182,71,0.45)" : "rgba(255,255,255,0.16)"}`,
                  color: activeTab === tab ? "var(--cream)" : "rgba(251,238,224,0.6)",
                  cursor: "pointer",
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ paddingBottom: 100 }}>
          {activeTab === "Affirmations" && <AffirmationsTab userId={user?.id} onSwitchTab={setActiveTab} />}
          {activeTab === "Baby Quiz" && <QuizTab userId={user?.id} />}
          {activeTab === "Breathe" && <BreatheTab />}
        </div>
      </div>
    </div>
  );
};

// ─── Affirmations ───
const CATEGORY_STYLES: { gradient: [string, string]; border: string; icon: LucideIcon }[] = [
  { gradient: ["rgba(181,56,107,0.40)", "rgba(58,26,56,0.85)"], border: "rgba(181,56,107,0.40)", icon: Flower2 },
  { gradient: ["rgba(242,182,71,0.30)", "rgba(58,26,56,0.85)"], border: "rgba(242,182,71,0.35)", icon: Star },
  { gradient: ["rgba(232,98,46,0.35)", "rgba(58,26,56,0.85)"], border: "rgba(232,98,46,0.40)", icon: Flame },
  { gradient: ["rgba(44,156,143,0.35)", "rgba(58,26,56,0.85)"], border: "rgba(44,156,143,0.40)", icon: Leaf },
];

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
      <div className="fixed inset-0 z-[100] flex flex-col items-center" style={{
        background: "radial-gradient(circle at 50% 15%, rgba(58,26,56,0.8), transparent 60%), linear-gradient(160deg, var(--night) 0%, var(--plum) 50%, var(--night) 100%)",
        padding: "0 24px 48px", justifyContent: "space-between", fontFamily: BODY_FONT, color: "var(--cream)",
      }} onClick={next}>
        {/* Top bar */}
        <div className="w-full flex items-center justify-between" style={{ paddingTop: 52, paddingBottom: 24 }}>
          <button onClick={(e) => { e.stopPropagation(); setFullscreen(false); }} style={{ fontSize: 13, fontWeight: 500, color: "rgba(242,182,71,0.85)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <p className="font-display" style={{ fontStyle: "italic", fontSize: 15, fontWeight: 500, color: "rgba(251,238,224,0.9)" }}>Tonight's affirmations</p>
          <Moon size={18} strokeWidth={1.8} color="var(--gold)" />
        </div>

        {/* Center card */}
        <div key={fadeKey} className="w-full flex flex-col items-center gh-glass" style={{
          flex: 1, justifyContent: "center", display: "flex",
          borderRadius: 28, padding: "40px 28px",
          background: "linear-gradient(145deg, rgba(58,26,56,0.85), rgba(181,56,107,0.30))",
          border: "1px solid rgba(242,182,71,0.22)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "fadeSwap 300ms ease",
          maxHeight: "55vh",
        }}>
          <div style={{ animation: "float 3s ease-in-out infinite" }}>
            <Flower2 size={44} strokeWidth={1.4} color="var(--gold)" />
          </div>
          <p className="text-center font-display" style={{ fontSize: 22, fontStyle: "italic", fontWeight: 400, color: "rgba(251,238,224,0.94)", lineHeight: 1.65, letterSpacing: "0.01em", marginTop: 24 }}>"{affirmation}"</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(242,182,71,0.5)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 8 }}>Tap for next card</p>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center" style={{ gap: 16, paddingTop: 20 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: i === dotPos ? 24 : 8, height: 8, borderRadius: i === dotPos ? 4 : "50%", background: i === dotPos ? "rgba(242,182,71,0.85)" : "rgba(251,238,224,0.2)", transition: "width 200ms ease" }} />
            ))}
          </div>
          <p className="text-center" style={{ fontSize: 13, fontStyle: "italic", color: "rgba(251,238,224,0.45)" }}>You are doing beautifully, mama</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="gh-section-label" style={{ padding: "8px 16px 0", marginBottom: 5 }}>Tap a card to read</div>
      {/* Horizontal scroll row */}
      <div className="flex hide-scrollbar" style={{ gap: 10, paddingLeft: 16, paddingRight: 32, paddingBottom: 6, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" as any, scrollbarWidth: "none" as any, msOverflowStyle: "none" as any }}>
        {AFFIRMATION_CATEGORIES.map((cat, i) => {
          const s = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
          const Icon = s.icon;
          return (
            <button key={cat.label} onClick={() => { setCurrentIdx(i * 6); setFullscreen(true); }}
              className="flex flex-col text-left"
              style={{
                flexShrink: 0, width: 160, height: 110, borderRadius: 18, padding: "14px 14px",
                background: `linear-gradient(145deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                border: `1px solid ${s.border}`, cursor: "pointer", transition: "transform 140ms",
                justifyContent: "space-between",
              }}
              onPointerDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
              onPointerUp={e => (e.currentTarget.style.transform = "scale(1)")}
              onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} strokeWidth={1.8} color="var(--cream)" />
              </div>
              <p style={{ fontSize: 9, fontStyle: "italic", fontWeight: 400, color: "rgba(251,238,224,0.9)", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginTop: 8, flex: 1 }}>{cat.preview}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6, color: "rgba(251,238,224,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: 6 }}>Tap to read</p>
            </button>
          );
        })}
      </div>

      {/* More for tonight */}
      <div className="gh-section-label" style={{ padding: "12px 16px 0", marginBottom: 6 }}>More for tonight</div>

      {/* Breathing preview card */}
      <button onClick={() => onSwitchTab("Breathe")} className="w-full text-left gh-glass-dark" style={{ margin: "0 16px", width: "calc(100% - 32px)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(44,156,143,0.20)", border: "1px solid rgba(44,156,143,0.35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(44,156,143,0.25)", flexShrink: 0 }}>
          <Wind size={17} strokeWidth={1.8} color="var(--cream)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--cream)" }}>4-7-8 Breathing</p>
          <p style={{ fontSize: 9, color: "rgba(251,238,224,0.55)" }}>Tap to start a guided breathing session</p>
        </div>
        <ChevronRight size={16} strokeWidth={1.8} color="rgba(251,238,224,0.4)" style={{ flexShrink: 0 }} />
      </button>

      {/* Quiz preview card */}
      <button onClick={() => onSwitchTab("Baby Quiz")} className="w-full text-left gh-glass-dark" style={{ margin: "8px 16px 0", width: "calc(100% - 32px)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(181,56,107,0.22)", border: "1px solid rgba(181,56,107,0.38)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brain size={17} strokeWidth={1.8} color="var(--cream)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--cream)" }}>Baby Brain Quiz</p>
          <p style={{ fontSize: 9, color: "rgba(251,238,224,0.55)" }}>10 fun pregnancy trivia questions</p>
        </div>
        <ChevronRight size={16} strokeWidth={1.8} color="rgba(251,238,224,0.4)" style={{ flexShrink: 0 }} />
      </button>
    </div>
  );
};

// ─── Quiz ───
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
    if (!answered) return { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "var(--cream)", animation: "none" };
    if (idx === correctIdx) return { background: "rgba(44,156,143,0.28)", border: "1px solid rgba(44,156,143,0.60)", color: "#8FE3D5", animation: "scaleCorrect 300ms ease" };
    if (idx === selected) return { background: "rgba(232,98,46,0.22)", border: "1px solid rgba(232,98,46,0.50)", color: "#F0A88C", animation: "shake 200ms ease" };
    return { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(251,238,224,0.55)", animation: "none" };
  };

  const isCorrect = selected !== null && selected === correctIdx;

  return (
    <div style={{ padding: "0 0 24px" }}>
      {/* Score row */}
      <div className="flex items-center justify-between" style={{ padding: "12px 16px 8px" }}>
        <div className="gh-section-label" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Brain size={13} strokeWidth={1.8} />
          Baby Brain
        </div>
        <p className="font-display" style={{ fontSize: 20, fontWeight: 400, color: "var(--gold)" }}>{score}/{qIdx + 1}</p>
      </div>

      {/* Quiz card */}
      <div className="gh-glass" style={{ margin: "0 16px", borderRadius: 22, overflow: "hidden" }}>
        {/* Dark header */}
        <div style={{ background: "linear-gradient(135deg, #1d0f28, var(--plum))", padding: "18px 18px 16px" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(242,182,71,0.85)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 8 }}>Question {qIdx + 1} of {BABY_QUIZ_QUESTIONS.length}</p>
          <div className="gh-progress-track" style={{ height: 3, marginBottom: 14 }}>
            <div className="gh-progress-fill" style={{ width: `${progress}%`, transition: "width 300ms ease" }} />
          </div>
          <p className="font-display" style={{ fontStyle: "italic", fontSize: 17, fontWeight: 500, color: "var(--cream)", lineHeight: 1.4 }}>{q.question}</p>
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
                  animation: s.animation, fontFamily: BODY_FONT,
                }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: s.color, lineHeight: 1.3 }}>
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
          background: isCorrect ? "rgba(44,156,143,0.16)" : "rgba(232,98,46,0.14)",
          border: `1px solid ${isCorrect ? "rgba(44,156,143,0.40)" : "rgba(232,98,46,0.40)"}`,
          animation: "slideUp 250ms ease",
        }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: isCorrect ? "#8FE3D5" : "#F0A88C", marginBottom: 4 }}>
            {isCorrect ? "✓ Correct!" : "Almost! Here's why"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(251,238,224,0.75)", lineHeight: 1.6 }}>{q.options[selected].funFact}</p>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button onClick={handleNext} style={{
          ...ctaStyle,
          margin: "10px 16px 0", width: "calc(100% - 32px)", borderRadius: 14, padding: "13px 0",
          fontSize: 11, fontFamily: BODY_FONT,
        }}>
          {qIdx < BABY_QUIZ_QUESTIONS.length - 1 ? "Next question" : "Play again"}
        </button>
      )}

      {/* Footer */}
      <p className="text-center" style={{ fontSize: 12, fontStyle: "italic", color: "rgba(251,238,224,0.4)", padding: "12px 0 24px" }}>Learning about your little one</p>
    </div>
  );
};

// ─── Breathe ───
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
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(242,182,71,0.85)", fontWeight: 600, textAlign: "center" }}>
        {active ? phaseLabel : "4-7-8 breathing"}
      </p>

      {/* Rings */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {[70, 100, 140, 180].map((size, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: size, height: size,
            border: `1.5px dashed rgba(44,156,143,${0.15 + i * 0.09})`,
            animation: active ? `ringPulse 4s ease-in-out infinite ${i * 0.4}s` : "none",
          }} />
        ))}
        <div className="flex items-center justify-center rounded-full" style={{
          width: 48, height: 48,
          background: "linear-gradient(145deg, rgba(44,156,143,0.45), rgba(242,182,71,0.25))",
          border: "1px solid rgba(251,238,224,0.25)",
          boxShadow: "0 0 30px rgba(44,156,143,0.30)",
          animation: active ? "breathe 4s ease-in-out infinite" : "none",
        }}>
          <Wind size={20} strokeWidth={1.8} color="var(--cream)" />
        </div>
        {active && (
          <p className="absolute font-display" style={{ fontSize: 28, fontWeight: 400, color: "var(--gold)" }}>{count}</p>
        )}
      </div>

      {/* Dots */}
      <div className="flex" style={{ gap: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-full" style={{
            width: 6, height: 6,
            background: cycle % 4 === i && active ? "rgba(242,182,71,0.85)" : "rgba(251,238,224,0.2)",
          }} />
        ))}
      </div>

      <p className="text-center" style={{ fontSize: 11, fontStyle: "italic", color: "rgba(251,238,224,0.5)", maxWidth: 260, lineHeight: 1.6 }}>
        "Breathe in the love you have for this little one. Breathe out the worry."
      </p>

      <button onClick={() => active ? stop() : setActive(true)}
        style={active ? {
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 14, padding: "11px 24px", color: "var(--cream)", fontSize: 12, fontWeight: 600, cursor: "pointer",
        } : {
          ...ctaStyle, borderRadius: 14, padding: "11px 24px", fontSize: 12,
        }}>
        {active ? "Stop" : "Start breathing guide"}
      </button>
    </div>
  );
};

export default CantSleep;
