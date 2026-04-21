import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { getRecipesForWeek, getUniqueVitaminsForWeek, CATEGORY_GRADIENTS } from "@/data/recipesData";
import ShareableWeekCard from "@/components/ShareableWeekCard";

const weekEmoji: Record<number, string> = {
  1: '🫘', 2: '🫘', 3: '🫘', 4: '🫘',
  5: '🫘', 6: '🍇', 7: '🫐', 8: '🫐',
  9: '🍒', 10: '🍓', 11: '🍓', 12: '🍋',
  13: '🍋', 14: '🍋', 15: '🍑', 16: '🥑',
  17: '🍐', 18: '🍐', 19: '🥭', 20: '🥭',
  21: '🥕', 22: '🥕', 23: '🌽', 24: '🌽',
  25: '🥦', 26: '🥦', 27: '🥬', 28: '🥬',
  29: '🎃', 30: '🎃', 31: '🥥', 32: '🥥',
  33: '🍍', 34: '🍍', 35: '🍈', 36: '🍈',
  37: '🥬', 38: '🍉', 39: '🍉', 40: '🍉',
};

function getFruitName(babySize: string): string {
  // Extract just the fruit/veg name, lowercase
  const s = babySize.toLowerCase();
  const known = [
    "poppy seed", "sesame seed", "lentil", "blueberry", "raspberry", "cherry",
    "fig", "lemon", "lime", "avocado", "apple", "pear", "mango", "orange",
    "banana", "papaya", "coconut", "melon", "cantaloupe", "cauliflower",
    "lettuce", "cabbage", "pumpkin", "watermelon", "pineapple", "honeydew",
    "butternut squash", "corn", "cucumber", "eggplant", "turnip", "bell pepper",
    "artichoke", "pomegranate", "grapefruit", "peach", "plum", "strawberry",
    "grape", "carrot", "broccoli",
  ];
  for (const k of known) {
    if (s.includes(k)) return k;
  }
  return babySize;
}

function getSymptomCategory(symptom: string): 'physical' | 'emotional' | 'visible' | 'default' {
  const s = symptom.toLowerCase();
  const physical = ['backache', 'heartburn', 'cramp', 'pain', 'nausea', 'fatigue', 'breath', 'swelling', 'swollen', 'hemorrhoid', 'constipation', 'urination', 'discharge', 'congestion', 'leg cramp', 'dizziness', 'headache', 'bloating', 'gas'];
  const emotional = ['mood', 'dream', 'forgetfulness', 'brain', 'nesting', 'emotional', 'energy', 'sensitivity'];
  const visible = ['stretch mark', 'glow', 'skin', 'vein', 'linea', 'waddle'];
  if (physical.some(k => s.includes(k))) return 'physical';
  if (emotional.some(k => s.includes(k))) return 'emotional';
  if (visible.some(k => s.includes(k))) return 'visible';
  return 'default';
}

const symptomColors: Record<string, { bg: string; border: string }> = {
  physical: { bg: "rgba(255,220,180,0.30)", border: "rgba(255,200,140,0.40)" },
  emotional: { bg: "rgba(220,200,255,0.25)", border: "rgba(200,170,255,0.35)" },
  visible: { bg: "rgba(200,240,220,0.20)", border: "rgba(170,220,200,0.30)" },
  default: { bg: "rgba(255,255,255,0.20)", border: "rgba(255,255,255,0.28)" },
};

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

  const fruitEmoji = weekEmoji[selectedWeek] || '🥑';
  const fruitName = getFruitName(weekData.babySize);

  const milestones = [
    { emoji: '💓', title: 'First heartbeat', sub: 'Week 6', reached: selectedWeek >= 6 },
    { emoji: '🤸', title: 'First movements', sub: 'Week 16', reached: selectedWeek >= 16 },
    { emoji: '👂', title: 'Can hear your voice', sub: 'Week 23', reached: selectedWeek >= 23 },
    { emoji: '👀', title: 'Eyes open', sub: 'Week 28', reached: selectedWeek >= 28 },
    { emoji: '🫁', title: 'Lungs mature', sub: 'Week 36', reached: selectedWeek >= 36 },
  ];

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <style>{`
        @keyframes contractionPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.0); }
        }
      `}</style>

      {/* Hero headline */}
      <div style={{ padding: "12px 16px 4px" }}>
        <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 22, fontWeight: 600, color: "white", display: "block", lineHeight: 1.1 }}>Your</span>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 800, fontStyle: "italic", color: "white", letterSpacing: -0.5, display: "block", lineHeight: 1.0, marginBottom: 4 }}>baby's world</span>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.55)" }}>
          Week {selectedWeek} · {fruitName} · ~{weekData.babyLength}
        </p>
      </div>

      {/* Large Fruit Card */}
      <div className="px-5 mt-2">
        <div style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 24, padding: "28px 16px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: 88, display: "block", margin: "0 auto 14px", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))" }}>{fruitEmoji}</span>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 18, fontWeight: 700, color: "white", marginBottom: 16 }}>About the size of a {fruitName}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { value: weekData.babyWeight, label: "WEIGHT" },
              { value: weekData.babyLength, label: "LENGTH" },
              { value: `${selectedWeek}w`, label: "AGE" },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "white" }}>{stat.value}</p>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 500, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse weeks */}
      <div className="px-5 mt-3 mb-1">
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>Browse weeks</p>
      </div>
      <div ref={scrollRef} style={{ display: "flex", gap: 8, padding: "0 16px", paddingBottom: 12, overflowX: "auto" }} className="hide-scrollbar">
        {pregnancyWeeks.map(w => (
          <button key={w.week} onClick={() => setSelectedWeek(w.week)}
            className="belly-btn-press"
            style={{
              width: 40, height: 40, minWidth: 40,
              borderRadius: "50%",
              background: w.week === selectedWeek ? "white" : "rgba(255,255,255,0.18)",
              border: w.week === selectedWeek ? "none" : "1px solid rgba(255,255,255,0.26)",
              color: w.week === selectedWeek ? "#FF6520" : "rgba(255,255,255,0.75)",
              fontFamily: "'Outfit', system-ui",
              fontWeight: w.week === selectedWeek ? 700 : 600,
              fontSize: w.week === selectedWeek ? 13 : 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0, cursor: "pointer", flexShrink: 0,
              boxShadow: w.week === selectedWeek ? "0 3px 10px rgba(0,0,0,0.10)" : "none",
            }}>
            {w.week}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-3 mb-5">
        {/* Baby Development */}
        <div style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 18, padding: "14px 15px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>Baby Development</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.65, fontWeight: 400 }}>{weekData.developmentHighlight}</p>
        </div>

        {/* Baby Size — warm yellow tint */}
        <div style={{ background: "rgba(255,240,180,0.18)", border: "1px solid rgba(255,220,120,0.28)", borderRadius: 18, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(14px)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 24 }}>
            {fruitEmoji}
          </div>
          <div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.50)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Baby Size</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white" }}>{fruitName} · {weekData.babyLength} · {weekData.babyWeight}</p>
          </div>
        </div>

        {/* Symptoms */}
        <div style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 18, padding: "12px 14px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>What You Might Feel</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weekData.momSymptoms.map((s: string) => {
              const cat = getSymptomCategory(s);
              const colors = symptomColors[cat];
              return (
                <span key={s} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "white", fontWeight: 600, fontFamily: "'Outfit', system-ui" }}>{s}</span>
              );
            })}
          </div>
        </div>

        {/* Natural Tip — lavender hint */}
        <div style={{ background: "rgba(220,200,255,0.16)", border: "1px solid rgba(200,170,255,0.24)", borderRadius: 18, padding: "13px 15px", backdropFilter: "blur(14px)" }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "rgba(220,200,255,0.65)", fontWeight: 600 }}>Natural Tip</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(220,200,255,0.20)", border: "1px solid rgba(200,170,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>🌿</div>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{weekData.naturalTip}</p>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white", margin: "16px 0 8px" }}>Milestones</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {milestones.map(m => (
              <div key={m.title} style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 16, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10, opacity: m.reached ? 1 : 0.45 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.26)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>{m.emoji}</div>
                <div>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, fontWeight: 600, color: "white" }}>{m.title}</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.58)" }}>{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable Week Card */}
        <ShareableWeekCard
          week={selectedWeek}
          fruitEmoji={fruitEmoji}
          fruitName={fruitName}
          weight={weekData.babyWeight}
          length={weekData.babyLength}
        />
      </div>

      {/* Nourish this week */}
      {weekRecipes.length > 0 && (
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ borderRadius: 17, overflow: "hidden", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", backdropFilter: "blur(16px)" }}>
            <div style={{ background: "linear-gradient(135deg, #E89020, #F4A830, #FFCC60)", padding: "12px 14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -8, top: -8, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Week {selectedWeek} nutrition</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 4 }}>What your baby needs from your plate</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {weekVitamins.slice(0, 4).map(v => (
                  <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.32)", borderRadius: 7, padding: "2px 7px", fontSize: 9, color: "white", fontWeight: 600 }}>{v.emoji} {v.name}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: "8px 0 4px" }}>
              <div style={{ display: "flex", gap: 7, padding: "0 11px", overflowX: "auto" }} className="hide-scrollbar">
                {weekRecipes.slice(0, 3).map(r => (
                  <div key={r.id} onClick={() => navigate(`/recipes/${r.id}`)} style={{ width: 120, flexShrink: 0, borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.28)", cursor: "pointer" }}>
                    <div style={{ background: CATEGORY_GRADIENTS[r.category], height: 62, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 28 }}>{r.emoji}</span>
                    </div>
                    <div style={{ padding: "9px 10px" }}>
                      <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 2 }}>{r.title}</p>
                      <p style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", fontFamily: "'Outfit', system-ui" }}>{r.prepTime} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 10, paddingTop: 6 }}>
              <button onClick={() => navigate("/recipes")} style={{ background: "white", border: "none", borderRadius: 22, padding: "9px 20px", fontSize: 13, fontWeight: 700, color: "#FF6520", cursor: "pointer", fontFamily: "'Outfit', system-ui", boxShadow: "0 3px 10px rgba(0,0,0,0.08)", display: "inline-block" }}>
                See all {weekRecipes.length} recipes for week {selectedWeek} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trimester Overview */}
      <div className="px-5 mb-5" style={{ marginTop: 24 }}>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>TRIMESTER OVERVIEW</p>
        <div style={{ display: "flex", gap: 8 }}>
          {trimesterInfo.map((t, i) => {
            const isActive = weekData.trimester === i + 1;
            return (
              <div key={i} style={{
                flex: 1,
                background: isActive ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.12)",
                border: isActive ? "2px solid rgba(255,255,255,0.50)" : "1px solid rgba(255,255,255,0.18)",
                borderRadius: 16, padding: "12px 12px",
                position: "relative",
                boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
              }}>
                {isActive && <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: "white", opacity: 0.7 }} />}
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: isActive ? 13 : 12, fontWeight: isActive ? 700 : 600, color: isActive ? "white" : "rgba(255,255,255,0.65)" }}>{t.name}</p>
                <p style={{ fontSize: 9, color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.40)", fontWeight: isActive ? 500 : 400, fontFamily: "'Outfit', system-ui" }}>{t.range}</p>
                <p style={{ fontSize: isActive ? 9 : 8, color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)", lineHeight: 1.4, marginTop: 2, fontFamily: "'Outfit', system-ui" }}>{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Counters */}
      <div className="px-5" style={{ marginTop: 24, paddingBottom: 32 }}>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>COUNTERS</p>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          {/* Kick Counter */}
          <div style={{ flex: 1, borderRadius: 22, padding: "18px 14px", background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.34)", backdropFilter: "blur(14px)", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>👶</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.50)", fontWeight: 600, marginBottom: 4 }}>Kick Counter</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "white", letterSpacing: -3, lineHeight: 1, margin: "6px 0 2px" }}>{kickCount}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "rgba(255,255,255,0.45)", fontStyle: "italic", marginBottom: 12 }}>Goal: 10 kicks</p>
            <button onClick={addKick} style={{ background: "white", borderRadius: 16, padding: 12, width: "100%", fontSize: 14, fontWeight: 700, color: "#FF6520", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui", boxShadow: "0 3px 12px rgba(0,0,0,0.10)" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 12, padding: 8, width: "100%", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.65)", marginTop: 6, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
              Reset
            </button>
          </div>

          {/* Contraction Counter */}
          <div style={{ flex: 1, borderRadius: 22, padding: "18px 14px", background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.28)", backdropFilter: "blur(14px)", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>⏱️</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.50)", fontWeight: 600, marginBottom: 4 }}>Contractions</p>
            {showResult !== null ? (
              <>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "white", letterSpacing: -3, lineHeight: 1, margin: "6px 0 2px" }}>{showResult}s</p>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "rgba(255,255,255,0.45)", fontStyle: "italic", marginBottom: 12 }}>Contraction lasted</p>
              </>
            ) : isTimingContraction ? (
              <>
                <div style={{ display: "inline-block", borderRadius: "50%", padding: 4, animation: "contractionPulse 1.5s ease-in-out infinite" }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "white", letterSpacing: -3, lineHeight: 1 }}>{formatTimer(elapsedSeconds)}</p>
                </div>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "rgba(255,255,255,0.45)", fontStyle: "italic", marginBottom: 12 }}>Contracting...</p>
                <button onClick={stopContraction} style={{ background: "rgba(255,255,255,0.90)", borderRadius: 16, padding: 12, width: "100%", fontSize: 14, fontWeight: 700, color: "#E05040", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" }}>
                  Stop timing
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "white", letterSpacing: -3, lineHeight: 1, margin: "6px 0 2px" }}>{contractions.length}</p>
                <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontStyle: "italic", marginBottom: 12, color: "rgba(255,255,255,0.45)" }}>
                  {contractions.length >= 2 && avgInterval > 0 ? `Every ${Math.round(avgInterval / 60)} min` : "Tap to start timing"}
                </p>
                <button onClick={startContraction} style={{ background: "rgba(255,255,255,0.90)", borderRadius: 16, padding: 12, width: "100%", fontSize: 14, fontWeight: 700, color: "#9060D0", border: "none", cursor: "pointer", fontFamily: "'Outfit', system-ui", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" }}>
                  Start timing
                </button>
                <button onClick={() => setContractions([])} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 12, padding: 8, width: "100%", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.65)", marginTop: 6, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {shouldAlert && (
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: "10px 12px", marginTop: 8 }}>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 600, color: "white" }}>Your contractions are getting close together 🌸</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>If this is consistent for an hour, contact your midwife or head to hospital.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BabyTracker;
