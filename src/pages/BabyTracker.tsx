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

  // Contraction state
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

  // Live timer for contraction
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
    { name: "1st Trimester", range: "Weeks 1–13", desc: "Building the foundation", bg: "rgba(255,235,220,0.8)", border: "rgba(255,180,140,0.3)" },
    { name: "2nd Trimester", range: "Weeks 14–26", desc: "The golden trimester", bg: "rgba(255,248,210,0.8)", border: "rgba(220,190,80,0.3)" },
    { name: "3rd Trimester", range: "Weeks 27–40", desc: "The final stretch", bg: "rgba(220,245,225,0.8)", border: "rgba(140,210,160,0.3)" },
  ];

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "#FEF8F4" }}>
      <style>{`
        @keyframes contractionPulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(144,96,208,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(144,96,208,0.05); }
        }
      `}</style>

      <div className="belly-hero-gradient rounded-b-[24px] px-5 pt-6 pb-5">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="font-display text-[48px] font-semibold" style={{ color: "white" }}>{selectedWeek}</p>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)" }}>Weeks pregnant</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 8 }}>
            <BabySizeIllustration week={selectedWeek} size={80} />
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{weekData.babySize}</p>
      </div>

      <div ref={scrollRef} className="flex gap-1.5 px-3 py-3 overflow-x-auto hide-scrollbar">
        {pregnancyWeeks.map(w => (
          <button key={w.week} onClick={() => setSelectedWeek(w.week)}
            className="min-w-[36px] h-9 rounded-full text-xs font-medium belly-btn-press"
            style={{
              background: w.week === selectedWeek ? "linear-gradient(140deg, #FF7E48, #FFA070)" : w.week < currentWeek ? "rgba(255,200,170,0.2)" : "rgba(255,255,255,0.68)",
              border: w.week === selectedWeek ? "none" : "0.5px solid rgba(255,170,130,0.22)",
              color: w.week === selectedWeek ? "white" : "rgba(180,100,60,0.38)",
            }}>
            {w.week}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3 mb-5">
        {/* Baby Development Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,240,230,0.9), rgba(255,248,240,0.9))",
          border: "0.5px solid rgba(255,180,140,0.3)", borderRadius: 16, padding: "13px 14px",
        }}>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(200,88,40,0.45)", fontWeight: 600 }}>Baby Development</p>
          <p style={{ fontSize: 9.5, color: "#A84E28", lineHeight: 1.65, fontWeight: 500 }}>{weekData.developmentHighlight}</p>
        </div>

        {/* Baby Size Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,245,220,0.9), rgba(255,252,235,0.9))",
          border: "0.5px solid rgba(220,190,100,0.3)", borderRadius: 16, padding: "11px 14px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "rgba(255,200,80,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <BabySizeIllustration week={selectedWeek} size={32} />
          </div>
          <div>
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(180,140,40,0.55)", fontWeight: 600 }}>Baby Size</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#A87828" }}>{weekData.babySize} · {weekData.babyLength} · {weekData.babyWeight}</p>
          </div>
        </div>

        {/* What You Might Feel Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(235,255,240,0.9), rgba(245,255,248,0.9))",
          border: "0.5px solid rgba(140,210,160,0.3)", borderRadius: 16, padding: "11px 14px",
        }}>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(60,140,80,0.55)", fontWeight: 600 }}>What You Might Feel</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weekData.momSymptoms.map((s: string) => (
              <span key={s} style={{
                background: "rgba(100,180,120,0.12)", border: "0.5px solid rgba(100,180,120,0.25)",
                borderRadius: 20, padding: "3px 9px", fontSize: 7.5, color: "#40A060", fontWeight: 500,
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Natural Tip Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(240,232,255,0.9), rgba(248,242,255,0.9))",
          border: "0.5px solid rgba(180,140,240,0.25)", borderRadius: 16, padding: "11px 14px",
        }}>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(120,70,180,0.5)", fontWeight: 600 }}>Natural Tip</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "rgba(160,100,220,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10,
            }}>🌿</div>
            <p style={{ fontSize: 8.5, color: "#7040A0", lineHeight: 1.55 }}>{weekData.naturalTip}</p>
          </div>
        </div>
      </div>

      {/* Nourish this week */}
      {weekRecipes.length > 0 && (
        <div style={{ margin: "8px 16px 0" }}>
          <div style={{ borderRadius: 17, overflow: "hidden", background: "rgba(255,255,255,0.68)", border: "0.5px solid rgba(255,200,100,0.3)", backdropFilter: "blur(16px)", boxShadow: "0 2px 14px rgba(220,160,20,0.08)" }}>
            <div style={{ background: "linear-gradient(135deg, #E89020, #F4A830, #FFCC60)", padding: "12px 14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
              <span style={{ position: "absolute", right: 14, bottom: -4, fontSize: 28, opacity: 0.8 }}>{weekData.babySize.split(" ")[0] === "Poppy" ? "🌱" : "🥑"}</span>
              <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Week {selectedWeek} nutrition</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, color: "white", lineHeight: 1.2, marginBottom: 4 }}>What your baby needs from your plate</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {weekVitamins.slice(0, 4).map(v => (
                  <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 7, padding: "2px 7px", fontSize: 6.5, color: "white", fontWeight: 600 }}>{v.emoji} {v.name}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: "8px 0 4px" }}>
              <div style={{ display: "flex", gap: 7, padding: "0 11px", overflowX: "auto" }} className="hide-scrollbar">
                {weekRecipes.slice(0, 3).map(r => (
                  <div key={r.id} onClick={() => navigate(`/recipes/${r.id}`)} style={{ width: 86, flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "rgba(255,248,230,0.9)", border: "0.5px solid rgba(255,200,100,0.3)", cursor: "pointer" }}>
                    <div style={{ background: CATEGORY_GRADIENTS[r.category], height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    </div>
                    <div style={{ padding: "5px 7px" }}>
                      <p style={{ fontSize: 7.5, fontWeight: 600, color: "#A84E28", lineHeight: 1.2, marginBottom: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{r.title}</p>
                      <p style={{ fontSize: 6, color: "#D4906A", marginBottom: 3 }}>{r.prepTime} min</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {r.vitamins.slice(0, 2).map(v => (
                          <span key={v.name} style={{ background: "rgba(220,160,20,0.15)", borderRadius: 3, padding: "0 4px", fontSize: 5.5, color: "#907020" }}>{v.emoji} {v.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 8, paddingTop: 6 }}>
              <button onClick={() => navigate("/recipes")} style={{ background: "linear-gradient(145deg, #FF7840, #FFAB80)", border: "none", borderRadius: 10, padding: "5px 14px", fontSize: 7.5, fontWeight: 600, color: "white", cursor: "pointer" }}>
                See all {weekRecipes.length} recipes for week {selectedWeek} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trimester Overview */}
      <div className="px-5 mb-5" style={{ marginTop: 12 }}>
        <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>TRIMESTER OVERVIEW</p>
        <div className="flex gap-[6px]">
          {trimesterInfo.map((t, i) => (
            <div key={i} style={{
              flex: 1, background: t.bg, border: `0.5px solid ${t.border}`,
              borderRadius: 12, padding: "8px 10px",
              opacity: weekData.trimester !== i + 1 ? 0.5 : 1,
            }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: "#A84E28" }}>{t.name}</p>
              <p style={{ fontSize: 6.5, color: "#C4906A" }}>{t.range}</p>
              <p style={{ fontSize: 6.5, color: "#C4906A", lineHeight: 1.4, marginTop: 2 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="px-5 mb-5">
        <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>COUNTERS</p>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          {/* Kick Counter */}
          <div style={{ flex: 1, borderRadius: 16, padding: "14px 12px", background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.22)", backdropFilter: "blur(12px)", textAlign: "center" }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>👶</p>
            <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.4)", fontWeight: 600, marginBottom: 4 }}>Kick Counter</p>
            <p style={{ fontSize: 36, fontWeight: 300, color: "#FF7840", letterSpacing: -2, lineHeight: 1 }}>{kickCount}</p>
            <p style={{ fontSize: 7, color: "#D4906A", fontStyle: "italic", marginBottom: 8 }}>Goal: 10 kicks</p>
            <button onClick={addKick} style={{ background: "linear-gradient(145deg, #FF7840, #FFAB80)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", boxShadow: "0 3px 10px rgba(255,120,64,0.28)" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} style={{ background: "rgba(255,200,170,0.2)", border: "0.5px solid rgba(255,170,130,0.25)", borderRadius: 12, padding: 7, width: "100%", fontSize: 10, color: "#C4906A", marginTop: 5, cursor: "pointer" }}>
              Reset
            </button>
          </div>

          {/* Contraction Counter */}
          <div style={{ flex: 1, borderRadius: 16, padding: "14px 12px", background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(180,140,240,0.22)", backdropFilter: "blur(12px)", textAlign: "center" }}>
            <p style={{ fontSize: 20, marginBottom: 4 }}>⏱️</p>
            <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(130,80,180,0.45)", fontWeight: 600, marginBottom: 4 }}>Contractions</p>

            {showResult !== null ? (
              /* STATE 3 — Result */
              <>
                <p style={{ fontSize: 36, fontWeight: 300, color: "#9060D0", letterSpacing: -2, lineHeight: 1 }}>{showResult}s</p>
                <p style={{ fontSize: 7, color: "rgba(150,100,200,0.5)", fontStyle: "italic", marginBottom: 8 }}>Contraction lasted</p>
              </>
            ) : isTimingContraction ? (
              /* STATE 2 — Timing */
              <>
                <div style={{ display: "inline-block", borderRadius: "50%", padding: 4, animation: "contractionPulse 1.5s ease-in-out infinite" }}>
                  <p style={{ fontSize: 28, fontWeight: 300, color: "#9060D0", letterSpacing: -1, lineHeight: 1 }}>{formatTimer(elapsedSeconds)}</p>
                </div>
                <p style={{ fontSize: 7, color: "rgba(144,96,208,0.7)", fontStyle: "italic", marginBottom: 6 }}>Contracting...</p>
                <button onClick={stopContraction} style={{ background: "linear-gradient(145deg, #9060D0, #C090F0)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", boxShadow: "0 3px 10px rgba(140,80,200,0.25)" }}>
                  Stop timing
                </button>
              </>
            ) : (
              /* STATE 1 — Idle */
              <>
                <p style={{ fontSize: 36, fontWeight: 300, color: "#9060D0", letterSpacing: -2, lineHeight: 1 }}>{contractions.length}</p>
                <p style={{ fontSize: 7, fontStyle: "italic", marginBottom: 8, color: contractions.length >= 2 ? "#C090D0" : "rgba(150,100,200,0.5)" }}>
                  {contractions.length >= 2 && avgInterval > 0 ? `Every ${Math.round(avgInterval / 60)} min` : "Tap to start timing"}
                </p>
                <button onClick={startContraction} style={{ background: "linear-gradient(145deg, #9060D0, #C090F0)", borderRadius: 12, padding: 9, width: "100%", fontSize: 11, fontWeight: 600, color: "white", border: "none", cursor: "pointer", boxShadow: "0 3px 10px rgba(140,80,200,0.25)" }}>
                  Start timing
                </button>
                <button onClick={() => setContractions([])} style={{ background: "transparent", border: "none", fontSize: 10, color: "rgba(150,100,200,0.4)", textAlign: "center", marginTop: 5, cursor: "pointer", width: "100%" }}>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Alert */}
        {shouldAlert && (
          <div style={{ background: "rgba(255,184,153,0.15)", border: "0.5px solid rgba(255,120,64,0.3)", borderRadius: 12, padding: "10px 12px", marginTop: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#C85828" }}>Your contractions are getting close together 🌸</p>
            <p style={{ fontSize: 8, color: "#D4906A", lineHeight: 1.5 }}>If this is consistent for an hour, contact your midwife or head to hospital.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BabyTracker;
