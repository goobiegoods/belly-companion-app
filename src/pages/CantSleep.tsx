import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { AFFIRMATIONS, AFFIRMATION_CATEGORIES, BABY_QUIZ_QUESTIONS } from "@/data/cantSleepData";
import { supabase } from "@/integrations/supabase/client";
import QuizBlock from "@/components/QuizBlock";

const TABS = ["Affirmations", "Baby Quiz 🎮", "Breathe"] as const;

const CantSleep = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Affirmations");

  return (
    <div className="min-h-screen flex flex-col page-enter" style={{ background: "linear-gradient(160deg, #1E1430, #2A1A45)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-2 shrink-0" style={{ background: "rgba(30,20,48,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <button onClick={() => navigate(-1)} className="text-[12px] font-semibold" style={{ color: "rgba(200,170,255,0.6)" }}>← Back</button>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-3 mb-4 rounded-[22px] p-5 relative overflow-hidden" style={{ background: "linear-gradient(140deg, #2A1A40, #3D2055, #5A2A70)", boxShadow: "0 10px 36px rgba(60,20,100,0.35)" }}>
        <div className="absolute rounded-full" style={{ width: 100, height: 100, right: -20, top: -20, background: "rgba(255,200,255,0.08)" }} />
        <div className="absolute rounded-full" style={{ width: 70, height: 70, left: -15, bottom: -25, background: "rgba(255,180,255,0.06)" }} />
        <div className="absolute right-4 top-4" style={{ fontSize: 28, animation: "float 3s ease-in-out infinite" }}>🌙</div>
        <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,220,255,0.55)", marginBottom: 4 }}>3am mode</p>
        <h1 className="font-display" style={{ fontSize: 19, fontWeight: 600, color: "#FFF0FF", lineHeight: 1.3, marginBottom: 4 }}>You're awake.<br />That's okay.</h1>
        <p style={{ fontSize: 7.5, color: "rgba(255,220,255,0.6)", marginBottom: 12 }}>Gentle things for restless nights in week {currentWeek}.</p>
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="rounded-full px-3 py-1.5 text-[10px] font-medium transition-all"
              style={{
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
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {activeTab === "Affirmations" && <AffirmationsTab userId={user?.id} />}
        {activeTab === "Baby Quiz 🎮" && <QuizTab userId={user?.id} />}
        {activeTab === "Breathe" && <BreatheTab />}
      </div>
    </div>
  );
};

// ─── Affirmations ───
const AffirmationsTab = ({ userId }: { userId?: string }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffled, setShuffled] = useState<number[]>([]);

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
    if (userId) {
      supabase.from("affirmation_views" as any).insert({ user_id: userId, affirmation_index: shuffled[nextIdx] } as any);
    }
  }, [currentIdx, shuffled, userId]);

  if (fullscreen && shuffled.length > 0) {
    const affirmation = AFFIRMATIONS[shuffled[currentIdx]];
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: "linear-gradient(160deg, #2A1A40, #3D2055)" }} onClick={next}>
        <button onClick={(e) => { e.stopPropagation(); setFullscreen(false); }} className="absolute top-5 left-5 text-[12px]" style={{ color: "rgba(200,170,255,0.5)" }}>← Back</button>
        <div className="rounded-[20px] p-7 w-full max-w-[320px]" style={{ background: "linear-gradient(145deg, #3D2060, #5A2880)", border: "0.5px solid rgba(255,180,255,0.15)" }}>
          <div className="text-center mb-4" style={{ fontSize: 28, animation: "float 3s ease-in-out infinite" }}>🌸</div>
          <p className="font-display text-center" style={{ fontSize: 14, fontStyle: "italic", color: "rgba(255,240,255,0.92)", lineHeight: 1.65, letterSpacing: "0.01em" }}>
            "{affirmation}"
          </p>
        </div>
        <div className="flex gap-1.5 mt-5">
          {shuffled.slice(0, Math.min(6, shuffled.length)).map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i === currentIdx % 6 ? "rgba(255,180,255,0.7)" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
        <p style={{ fontSize: 7, color: "rgba(255,200,255,0.4)", marginTop: 12 }}>Tap for next</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(200,170,255,0.4)", marginBottom: 8 }}>Tap a card to read</p>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {AFFIRMATION_CATEGORIES.map((cat, i) => (
          <button key={cat.label} onClick={() => { setCurrentIdx(i * 6); setFullscreen(true); }}
            className="min-w-[140px] h-[90px] rounded-[16px] p-3 flex flex-col justify-between text-left shrink-0 belly-card-interactive"
            style={{ background: `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})`, border: "0.5px solid rgba(255,180,255,0.15)" }}>
            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
            <div>
              <p className="font-display" style={{ fontSize: 10, fontStyle: "italic", color: "rgba(255,240,255,0.85)", lineHeight: 1.4 }}>{cat.label}</p>
              <p style={{ fontSize: 6, color: "rgba(255,200,255,0.4)", marginTop: 2 }}>Tap to refresh</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Quiz ───
const QuizTab = ({ userId }: { userId?: string }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [key, setKey] = useState(0);

  const q = BABY_QUIZ_QUESTIONS[qIdx];

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
    if (userId) {
      supabase.from("quiz_attempts" as any).insert({
        user_id: userId, lesson_id: "cant-sleep-quiz", selected_option: "", is_correct: correct, score: correct ? 1 : 0, total_questions: 1,
      } as any);
    }
  };

  const handleContinue = () => {
    if (qIdx < BABY_QUIZ_QUESTIONS.length - 1) {
      setQIdx(q => q + 1);
      setKey(k => k + 1);
    } else {
      setQIdx(0);
      setScore(0);
      setKey(k => k + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(200,170,255,0.4)" }}>Baby Brain 🧠</p>
        <p style={{ fontSize: 14, fontWeight: 300, color: "#FF7840" }}>{score}/{qIdx + 1}</p>
      </div>
      <QuizBlock
        key={key}
        question={q.question}
        options={q.options}
        darkTheme
        onAnswer={handleAnswer}
        onContinue={handleContinue}
        continueLabel={qIdx < BABY_QUIZ_QUESTIONS.length - 1 ? "Next question →" : "Play again 🔄"}
        progressDots={{ total: BABY_QUIZ_QUESTIONS.length, current: qIdx }}
      />
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
    let phaseTime = phase === "inhale" ? 4 : phase === "hold" ? 7 : 8;
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
    <div className="flex flex-col items-center pt-8">
      <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(200,170,255,0.6)", marginBottom: 20 }}>{active ? phaseLabel : "4-7-8 breathing"}</p>

      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180, margin: "0 auto 20px" }}>
        {[60, 90, 120, 150].map((size, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: size, height: size,
            border: `1.5px dashed rgba(200,150,255,${0.15 + i * 0.08})`,
            animation: active ? `ringPulse 4s ease-in-out infinite ${i * 0.4}s` : "none",
          }} />
        ))}
        <div className="flex items-center justify-center rounded-full" style={{
          width: 36, height: 36,
          background: "linear-gradient(145deg, rgba(180,120,255,0.6), rgba(220,170,255,0.4))",
          boxShadow: "0 0 20px rgba(180,120,255,0.3)",
          animation: active ? "breathe 4s ease-in-out infinite" : "none",
          fontSize: 18,
        }}>
          🫧
        </div>
        {active && (
          <p className="absolute" style={{ fontSize: 22, fontWeight: 300, color: "rgba(230,210,255,0.9)" }}>{count}</p>
        )}
      </div>

      <div className="flex gap-1.5 mb-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: cycle % 4 === i && active ? "rgba(200,170,255,0.7)" : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>

      <p className="font-display text-center" style={{ fontSize: 7.5, fontStyle: "italic", color: "rgba(200,170,255,0.4)", maxWidth: 240, lineHeight: 1.6, marginBottom: 20 }}>
        "Breathe in the love you have for this little one. Breathe out the worry."
      </p>

      <button onClick={() => active ? stop() : setActive(true)}
        className="rounded-[14px] px-6 py-2.5"
        style={{ background: "rgba(180,120,255,0.2)", border: "1px solid rgba(180,120,255,0.3)", color: "rgba(220,190,255,0.9)", fontSize: 8.5, fontWeight: 600 }}>
        {active ? "Stop" : "Start breathing guide"}
      </button>
    </div>
  );
};

export default CantSleep;
