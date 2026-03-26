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
    <div className="flex flex-col page-enter" style={{ background: "#FEF8F4", height: "100dvh", overflow: "hidden" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-2 shrink-0" style={{ background: "rgba(254,248,244,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => navigate(-1)} style={{ color: "rgba(200,88,40,0.5)", fontSize: 12, fontWeight: 500 }}>← Back</button>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-3 mb-4 rounded-[22px] p-5 relative overflow-hidden shrink-0" style={{ background: "linear-gradient(140deg, #2A1A40, #3D2055, #5A2A70)", boxShadow: "0 10px 36px rgba(60,20,100,0.35)" }}>
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 24 }}>
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

  if (fullscreen && shuffled.length > 0) {
    const affirmation = AFFIRMATIONS[shuffled[currentIdx]];
    const dotGroup = Math.floor(currentIdx / 6);
    const dotPos = currentIdx % 6;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ zIndex: 100, background: "linear-gradient(160deg, #2A1A40 0%, #3D2055 50%, #2A1A40 100%)", padding: "32px 24px", gap: 24 }} onClick={next}>
        <button onClick={(e) => { e.stopPropagation(); setFullscreen(false); }} className="absolute" style={{ top: 52, left: 20, fontSize: 13, fontWeight: 500, color: "rgba(255,200,255,0.6)" }}>← Back</button>

        <div key={fadeKey} className="w-full flex flex-col items-center" style={{ maxWidth: 340, borderRadius: 24, padding: "32px 26px", background: "linear-gradient(145deg, #3D2060, #5A2880)", border: "0.5px solid rgba(255,180,255,0.2)", boxShadow: "0 16px 48px rgba(60,0,100,0.4)", gap: 20, animation: "fadeSwap 400ms ease" }}>
          <div style={{ fontSize: 44, animation: "float 3s ease-in-out infinite" }}>🌸</div>
          <p className="text-center" style={{ fontSize: 16, fontStyle: "italic", fontWeight: 400, color: "rgba(255,240,255,0.92)", lineHeight: 1.7, letterSpacing: "0.01em" }}>
            "{affirmation}"
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,200,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Tap anywhere for next</p>
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: i === dotPos ? 20 : 7, height: 7,
              borderRadius: i === dotPos ? 4 : "50%",
              background: i === dotPos ? "rgba(255,180,255,0.7)" : "rgba(255,255,255,0.18)",
              transition: "width 200ms ease",
            }} />
          ))}
        </div>

        <p className="text-center" style={{ fontSize: 11, fontStyle: "italic", color: "rgba(255,200,255,0.35)" }}>You are doing beautifully, mama 🌸</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(200,88,40,0.4)", padding: "8px 16px 5px", fontWeight: 600 }}>Tap a card to read</p>
      <div className="flex hide-scrollbar" style={{ gap: 8, padding: "0 16px", overflowX: "auto", overflowY: "hidden", paddingBottom: 4 }}>
        {AFFIRMATION_CATEGORIES.map((cat, i) => (
          <button key={cat.label} onClick={() => { setCurrentIdx(i * 6); setFullscreen(true); }}
            className="flex flex-col justify-between text-left shrink-0"
            style={{
              width: 148, height: 95, borderRadius: 16, padding: "12px 13px",
              background: `linear-gradient(145deg, ${cat.gradient[0]}, ${cat.gradient[1]})`,
              border: `0.5px solid ${cat.border}`,
              cursor: "pointer", transition: "transform 140ms",
            }}
            onPointerDown={e => (e.currentTarget.style.transform = "scale(0.95)")}
            onPointerUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
            <span style={{ fontSize: 20 }}>{cat.emoji}</span>
            <p style={{ fontSize: 8, fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.82)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {cat.preview}
            </p>
            <p style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tap to read</p>
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
      supabase.from("quiz_attempts").insert({
        user_id: userId, lesson_id: "cant-sleep-quiz", selected_option: "", is_correct: correct, score: correct ? 1 : 0, total_questions: 1,
      });
    }
  };

  const handleContinue = () => {
    if (qIdx < BABY_QUIZ_QUESTIONS.length - 1) {
      setQIdx(q => q + 1);
      setKey(k => k + 1);
    } else {
      setQIdx(0); setScore(0); setKey(k => k + 1);
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Baby Brain 🧠</p>
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
    <div className="flex flex-col items-center" style={{ padding: 16, gap: 16 }}>
      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(200,88,40,0.5)", fontWeight: 600, textAlign: "center" }}>
        {active ? phaseLabel : "4-7-8 breathing"}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140, margin: "0 auto" }}>
        {[50, 70, 95, 120].map((size, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: size, height: size,
            border: `1.5px dashed rgba(255,140,90,${0.12 + i * 0.06})`,
            animation: active ? `ringPulse 4s ease-in-out infinite ${i * 0.4}s` : "none",
          }} />
        ))}
        <div className="flex items-center justify-center rounded-full" style={{
          width: 36, height: 36,
          background: "linear-gradient(145deg, rgba(255,140,90,0.5), rgba(255,180,130,0.4))",
          boxShadow: "0 0 20px rgba(255,140,90,0.25)",
          animation: active ? "breathe 4s ease-in-out infinite" : "none",
          fontSize: 18,
        }}>🫧</div>
        {active && (
          <p className="absolute" style={{ fontSize: 28, fontWeight: 300, color: "#A84E28", letterSpacing: -1 }}>{count}</p>
        )}
      </div>

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
