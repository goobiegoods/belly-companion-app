import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import BabySizeIllustration from "@/components/BabySizeIllustration";
import { getRecipesForWeek, getUniqueVitaminsForWeek, CATEGORY_GRADIENTS } from "@/data/recipesData";

interface Contraction {
  startTime: Date;
  endTime: Date;
  duration: number;
  interval: number;
}

const BabyTracker = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const weekData = getWeekData(selectedWeek);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [kickCount, setKickCount] = useState(0);

  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isTimingContraction, setIsTimingContraction] = useState(false);
  const [contractionStart, setContractionStart] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showResult, setShowResult] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.children[selectedWeek - 1] as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    if (!isTimingContraction || !contractionStart) return;
    const iv = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - contractionStart.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [isTimingContraction, contractionStart]);

  const addKick = async () => {
    setKickCount(k => k + 1);
    navigator.vibrate?.(8);
    if (user) {
      await supabase.from("kick_counts").insert({ user_id: user.id, count: 1 });
    }
  };

  const startContraction = () => {
    setContractionStart(new Date());
    setIsTimingContraction(true);
    setElapsedSeconds(0);
    navigator.vibrate?.([20, 50, 20]);
  };

  const stopContraction = () => {
    if (!contractionStart) return;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - contractionStart.getTime()) / 1000);
    const lastStart = contractions.length > 0 ? contractions[contractions.length - 1].startTime : null;
    const interval = lastStart ? Math.floor((contractionStart.getTime() - lastStart.getTime()) / 1000) : 0;
    setContractions(prev => [...prev, { startTime: contractionStart, endTime, duration, interval }]);
    setIsTimingContraction(false);
    setContractionStart(null);
    setShowResult(duration);
    navigator.vibrate?.(15);
    setTimeout(() => setShowResult(null), 2000);
  };

  const avgInterval = (() => {
    const last3 = contractions.slice(-3).filter(c => c.interval > 0);
    if (last3.length === 0) return 0;
    return Math.round(last3.reduce((a, c) => a + c.interval, 0) / last3.length);
  })();

  const shouldAlert = contractions.length >= 3 && avgInterval > 0 && avgInterval <= 300 &&
    contractions.slice(-3).every(c => c.duration >= 60);

  const weekRecipes = getRecipesForWeek(selectedWeek);
  const weekVitamins = getUniqueVitaminsForWeek(selectedWeek);

  const trimesterInfo = [
    { name: "1st Trimester", range: "Weeks 1–13", desc: "Building the foundation" },
    { name: "2nd Trimester", range: "Weeks 14–26", desc: "The golden trimester" },
    { name: "3rd Trimester", range: "Weeks 27–40", desc: "The final stretch" },
  ];

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <style>{`
        @keyframes contractionPulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.05); }
        }
      `}</style>

      {/* Hero */}
      <div className="rounded-b-[24px] px-5 pt-6 pb-5" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)", borderTop: "none" }}>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 22, fontWeight: 600, color: "white" }}>Your</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 800, fontStyle: "italic", color: "white", letterSpacing: -0.5 }}>baby's world</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 900, color: "white" }}>{selectedWeek}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--w70)" }}>Weeks pregnant</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 8 }}>
            <BabySizeIllustration week={selectedWeek} size={80} />
          </div>
        </div>
        <p className="text-center text-sm mt-2" style={{ color: "var(--w70)" }}>{weekData.babySize}</p>
      </div>

      {/* Week pills */}
      <div ref={scrollRef} className="flex gap-1.5 px-3 py-3 overflow-x-auto hide-scrollbar">
        {pregnancyWeeks.map(w => (
          <button key={w.week} onClick={() => setSelectedWeek(w.week)}
            className="min-w-[36px] h-9 rounded-full text-xs font-medium belly-btn-press"
            style={{
              background: w.week === selectedWeek ? "white" : "var(--c2)",
              border: w.week === selectedWeek ? "none" : "1px solid var(--c2-border)",
              color: w.week === selectedWeek ? "#FF6520" : "white",
              fontFamily: "'Outfit', system-ui",
              fontWeight: w.week === selectedWeek ? 700 : 400,
            }}>
            {w.week}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3 mb-5">
        {/* Baby Development */}
        <div style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", borderRadius: 16, padding: "13px 14px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, color: "var(--w40)", fontWeight: 600 }}>Baby Development</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, color: "white", lineHeight: 1.65, fontWeight: 400 }}>{weekData.developmentHighlight}</p>
        </div>

        {/* Baby Size */}
        <div style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", borderRadius: 16, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(14px)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.26)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BabySizeIllustration week={selectedWeek} size={32} />
          </div>
          <div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, color: "var(--w40)", fontWeight: 600 }}>Baby Size</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>{weekData.babySize} · {weekData.babyLength} · {weekData.babyWeight}</p>
          </div>
        </div>

        {/* Symptoms */}
        <div style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", borderRadius: 16, padding: "11px 14px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>What You Might Feel</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weekData.momSymptoms.map((s: string) => (
              <span key={s} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "3px 9px", fontSize: 10, color: "white", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Natural Tip */}
        <div style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", borderRadius: 16, padding: "11px 14px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>Natural Tip</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>🌿</div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "var(--w70)", lineHeight: 1.55 }}>{weekData.naturalTip}</p>
          </div>
        </div>
      </div>

      {/* Nourish this week */}
      {weekRecipes.length > 0 && (
        <div style={{ margin: "8px 16px 0" }}>
          <div style={{ borderRadius: 17, overflow: "hidden", background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(16px)" }}>
            {/* Keep amber gradient header as accent */}
            <div style={{ background: "linear-gradient(135deg, #E89020, #F4A830, #FFCC60)", padding: "12px 14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Week {selectedWeek} nutrition</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 4 }}>What your baby needs from your plate</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {weekVitamins.slice(0, 4).map(v => (
                  <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 7, padding: "2px 7px", fontSize: 6.5, color: "white", fontWeight: 600 }}>{v.emoji} {v.name}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: "8px 0 4px" }}>
              <div style={{ display: "flex", gap: 7, padding: "0 11px", overflowX: "auto" }} className="hide-scrollbar">
                {weekRecipes.slice(0, 3).map(r => (
                  <div key={r.id} onClick={() => navigate(`/recipes/${r.id}`)} style={{ width: 86, flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "var(--c2)", border: "1px solid var(--c2-border)", cursor: "pointer" }}>
                    <div style={{ background: CATEGORY_GRADIENTS[r.category], height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    </div>
                    <div style={{ padding: "5px 7px" }}>
                      <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 600, color: "white", lineHeight: 1.2, marginBottom: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{r.title}</p>
                      <p style={{ fontSize: 7, color: "var(--w50)" }}>{r.prepTime} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 8, paddingTop: 6 }}>
              <button onClick={() => navigate("/recipes")} style={{ background: "white", border: "none", borderRadius: 10, padding: "5px 14px", fontSize: 9, fontWeight: 700, color: "#FF6520", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
                See all {weekRecipes.length} recipes for week {selectedWeek} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trimester Overview */}
      <div className="px-5 mb-5" style={{ marginTop: 12 }}>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>TRIMESTER OVERVIEW</p>
        <div className="flex gap-[6px]">
          {trimesterInfo.map((t, i) => (
            <div key={i} style={{
              flex: 1, background: "var(--c2)", border: "1px solid var(--c2-border)",
              borderRadius: 12, padding: "8px 10px",
              opacity: weekData.trimester !== i + 1 ? 0.5 : 1,
            }}>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 700, color: "white" }}>{t.name}</p>
              <p style={{ fontSize: 8, color: "var(--w50)" }}>{t.range}</p>
              <p style={{ fontSize: 8, color: "var(--w50)", lineHeight: 1.4, marginTop: 2 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="px-5 mb-5">
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>COUNTERS</p>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          {/* Kick Counter */}
          <div style={{ flex: 1, borderRadius: 16, padding: "14px 12px", background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)", textAlign: "center" }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>👶</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, marginBottom: 4 }}>Kick Counter</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1 }}>{kickCount}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "var(--w50)", fontStyle: "italic", marginBottom: 8 }}>Goal: 10 kicks</p>
            <button onClick={addKick} style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 7, width: "100%", fontSize: 10, color: "var(--w50)", marginTop: 5, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
              Reset
            </button>
          </div>

          {/* Contraction Counter */}
          <div style={{ flex: 1, borderRadius: 16, padding: "14px 12px", background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)", textAlign: "center" }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>⏱️</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, marginBottom: 4 }}>Contractions</p>
            {showResult !== null ? (
              <>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1 }}>{showResult}s</p>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "var(--w50)", fontStyle: "italic", marginBottom: 8 }}>Contraction lasted</p>
              </>
            ) : isTimingContraction ? (
              <>
                <div style={{ display: "inline-block", borderRadius: "50%", padding: 4, animation: "contractionPulse 1.5s ease-in-out infinite" }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: -1, lineHeight: 1 }}>{formatTimer(elapsedSeconds)}</p>
                </div>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "var(--w50)", fontStyle: "italic", marginBottom: 6 }}>Contracting...</p>
                <button onClick={stopContraction} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
                  Stop timing
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1 }}>{contractions.length}</p>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontStyle: "italic", marginBottom: 8, color: "var(--w50)" }}>
                  {contractions.length >= 2 && avgInterval > 0 ? `Every ${Math.round(avgInterval / 60)} min` : "Tap to start timing"}
                </p>
                <button onClick={startContraction} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
                  Start timing
                </button>
                <button onClick={() => setContractions([])} style={{ background: "transparent", border: "none", fontSize: 10, color: "var(--w40)", textAlign: "center", marginTop: 5, cursor: "pointer", width: "100%", fontFamily: "'Outfit', system-ui" }}>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {shouldAlert && (
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: "10px 12px", marginTop: 8 }}>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 600, color: "white" }}>Your contractions are getting close together 🌸</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "var(--w70)", lineHeight: 1.5 }}>If this is consistent for an hour, contact your midwife or head to hospital.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BabyTracker;
