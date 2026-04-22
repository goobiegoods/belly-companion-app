import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, getDaysToGo } from "@/data/pregnancyWeeks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateStreak, getStreak } from "@/lib/streak";
import BabySizeIllustration from "@/components/BabySizeIllustration";

const MOOD_KEYS = ["tired", "good", "glowing", "anxious", "unwell"] as const;
type Mood = (typeof MOOD_KEYS)[number];

const MOOD_TOAST: Record<Mood, string> = {
  tired: "rest up, mama 💤",
  good: "you're glowing today ✨",
  glowing: "you absolutely radiate 🌸",
  anxious: "we're right here with you 🤍",
  unwell: "sending you so much love 💛",
};

const C1 = "rgba(255,255,255,0.20)";
const C1B = "rgba(255,255,255,0.30)";
const BLUR = "blur(14px)";

const HomePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const daysToGo = profile?.due_date ? getDaysToGo(profile.due_date) : 140;
  const progressPercent = (currentWeek / 40) * 100;

  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase((profile?.first_name || "").split(" ")[0]) || "mama";

  const firstSentence = weekData.developmentHighlight.split(/(?<=\.)\s/)[0] || weekData.developmentHighlight;

  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [todayMood, setTodayMood] = useState<Mood | null>(null);

  useEffect(() => {
    if (!user) return;
    getStreak(user.id).then((s) => s && setStreakDays(s.current));
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("mood_logs")
      .select("mood")
      .eq("user_id", user.id)
      .gte("logged_at", `${today}T00:00:00Z`)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.mood) setTodayMood(data.mood as Mood); });
  }, [user]);

  const handleMood = async (mood: Mood) => {
    setTodayMood(mood);
    toast.success(MOOD_TOAST[mood]);
    if (!user) return;
    await supabase.from("mood_logs").insert({ user_id: user.id, mood });
    const s = await updateStreak(user.id);
    if (s) setStreakDays(s.current);
  };

  const SUGGESTION_CHIPS = ["Round ligament pain?", "Foods to avoid", "Better sleep", "First kicks", "Anxiety tips"];
  const MOOD_LABELS: { key: Mood; label: string; emoji: string }[] = [
    { key: "tired", label: "TIRED", emoji: "😴" },
    { key: "good", label: "GOOD", emoji: "😊" },
    { key: "glowing", label: "GLOWING", emoji: "🥰" },
    { key: "anxious", label: "ANXIOUS", emoji: "😰" },
    { key: "unwell", label: "UNWELL", emoji: "😣" },
  ];
  const fruitEmoji = weekData.emoji || "🌱";

  const journeyMilestones = [
    { emoji: "🌱", label: "Day 1", reached: streakDays >= 1 },
    { emoji: "🌿", label: "Week 1", reached: streakDays >= 7 },
    { emoji: "🌸", label: "Week 2", reached: streakDays >= 14 },
    { emoji: "👶", label: "Birth", reached: false },
  ];

  const goToAsk = (prefill?: string) => {
    navigate("/ask", { state: prefill ? { prefill } : undefined });
  };

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent", position: "relative" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between relative" style={{ zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 29, height: 29, borderRadius: 9, background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🤰</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white", textTransform: "lowercase" as const, letterSpacing: -0.5, lineHeight: 1 }}>belly</h1>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>Virtual Doula</p>
          </div>
        </div>
        <div className="rounded-full px-3 py-1.5" style={{ background: C1, border: `1px solid ${C1B}`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <span className="text-xs" style={{ color: "var(--w70)" }}>Hi, {displayName} <span style={{ fontSize: 16 }}>🤰</span></span>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mb-5 mt-4 relative" style={{ zIndex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ background: C1, border: `1px solid ${C1B}`, borderRadius: 20, padding: "3px 10px", fontSize: 8, color: "white", fontWeight: 600, display: "inline-block" }}>· AI · ALWAYS HERE FOR YOU ·</span>
        </div>
        <div className="rounded-[22px] p-5 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)" }}>
          {/* Ghost watermark */}
          <div style={{
            position: "absolute",
            top: -10,
            right: -8,
            fontFamily: "'Fraunces', serif",
            fontWeight: 900,
            fontSize: "clamp(80px, 20vw, 140px)",
            color: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
            lineHeight: 1,
          }}>doula</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="absolute rounded-full" style={{ width: 112, height: 112, top: -32, right: -32, background: "rgba(255,255,255,0.10)" }} />
            <div className="absolute rounded-full" style={{ width: 64, height: 64, bottom: -16, left: -16, background: "rgba(255,255,255,0.07)" }} />
            <div className="absolute top-0 right-0 opacity-85">
              <BabySizeIllustration week={currentWeek} size={72} />
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, color: "white", letterSpacing: -1, lineHeight: 1.0 }}>Ask your</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, fontStyle: "italic", color: "rgba(255,255,255,0.80)", letterSpacing: -1, lineHeight: 1.0, marginBottom: 5 }}>doula anything</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.58)", marginBottom: 10 }}>Natural guidance & emotional support — no waiting rooms, no judgment.</p>
            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.2)", height: 4, borderRadius: 4, width: "100%", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, background: "#ffffff", height: 4, borderRadius: 4, transition: "width 0.6s ease" }} />
            </div>
            {/* Input bar */}
            <div onClick={() => goToAsk()} style={{ background: "rgba(255,255,255,0.92)", borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", marginTop: 10, cursor: "pointer" }}>
              <span style={{ flex: 1, fontFamily: "'Outfit', system-ui", fontSize: 13, fontStyle: "italic", color: "rgba(160,80,20,0.50)" }}>Cramps, sleep, nutrition...</span>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FF6520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {SUGGESTION_CHIPS.map(chip => (
                <button key={chip} onClick={() => goToAsk(chip)} style={{ background: C1, border: `1px solid ${C1B}`, borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>{chip}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Week card */}
      <div className="px-5 mb-5">
        <div className="rounded-[16px] p-[14px_16px] relative" style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 44, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>{fruitEmoji}</div>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 18, fontWeight: 600, color: "white" }}>You're in</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "white", letterSpacing: -1 }}>week {currentWeek}</p>
          <p className="text-[11px] mt-1 pr-14" style={{ color: "var(--w70)" }}>{weekData.babySize} — {firstSentence}</p>
          <div className="flex gap-2 mt-3">
            <div className="rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.35)" }}>
              <span className="text-[11px] font-medium" style={{ color: "white" }}>{40 - currentWeek} weeks to go</span>
            </div>
            <div className="rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.35)" }}>
              <span className="text-[11px] font-medium" style={{ color: "white" }}>Trimester {weekData.trimester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak bento — 2-tile grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px 16px" }}>
        {/* LEFT translucent tile */}
        <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🔥</div>
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: 64, color: "#fff", lineHeight: 1, letterSpacing: -2 }}>{streakDays}</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 14, color: "#fff", marginTop: 4 }}>{streakDays}-day streak!</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Keep going, mama</p>
        </div>
        {/* RIGHT dark tile */}
        <div style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 16 }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 700, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.45)", marginBottom: 10, textTransform: "uppercase" }}>JOURNEY</p>
          {journeyMilestones.map((m, i) => (
            <div key={m.label} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: i === journeyMilestones.length - 1 ? 0 : 7,
              fontFamily: "'Outfit', system-ui",
              fontSize: 11,
              fontWeight: 500,
              color: i === journeyMilestones.length - 1 ? "rgba(255,255,255,0.28)" : "#fff",
            }}>
              <span style={{ fontSize: 14 }}>{m.emoji}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood check-in (no card wrapper) */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 22, color: "#fff", padding: "0 16px", marginBottom: 4 }}>How are you feeling today?</p>
        <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.6)", padding: "0 16px", marginBottom: 12 }}>Tap to log your daily check-in</p>
        <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
          {MOOD_LABELS.map(({ key, label, emoji }) => {
            const selected = todayMood === key;
            return (
              <button
                key={key}
                onClick={() => handleMood(key)}
                className="belly-btn-press"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px 4px",
                  background: selected ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.13)",
                  border: `1px solid ${selected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  transform: selected ? "scale(1.05)" : "scale(1)",
                  transition: "all 160ms ease",
                }}
              >
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1, marginTop: 5 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journey tiles — Sleep + Courses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px 16px" }}>
        {/* SLEEP */}
        <button onClick={() => navigate("/cant-sleep")} className="text-left belly-card-interactive" style={{
          background: "rgba(255,255,255,0.13)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 18,
          padding: 16,
          cursor: "pointer",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌙</div>
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>Can't sleep?</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Guided breathing</p>
          <span style={{
            background: "rgba(255,255,255,0.85)",
            color: "#FF8C42",
            fontFamily: "'Outfit', system-ui",
            fontWeight: 700,
            fontSize: 10,
            borderRadius: 20,
            padding: "5px 14px",
            display: "inline-block",
          }}>TRY NOW</span>
        </button>
        {/* COURSES */}
        <button onClick={() => navigate("/courses")} className="text-left belly-card-interactive relative" style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: 16,
          cursor: "pointer",
          border: "none",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 16, color: "#FF8C42" }}>Your Courses</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: 11, color: "rgba(255,100,0,0.7)", marginBottom: 4 }}>3 in progress</p>
          <span style={{
            position: "absolute",
            bottom: 12,
            right: 14,
            fontFamily: "'Outfit', system-ui",
            fontSize: 22,
            color: "#FF8C42",
          }}>›</span>
        </button>
      </div>

      {/* This week */}
      <div className="mb-5">
        <p className="px-5" style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>THIS WEEK</p>
        <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar">
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: C1, border: `1px solid ${C1B}`, backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
            <p className="text-lg mb-1">👶</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>Baby size</p>
            <p className="text-[11px]" style={{ color: "var(--w70)" }}>{weekData.babySize}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: C1, border: `1px solid ${C1B}`, backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
            <p className="text-lg mb-1">🤰</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>Your body</p>
            <p className="text-[11px]" style={{ color: "var(--w70)" }}>{weekData.momSymptoms[0]}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: C1, border: `1px solid ${C1B}`, backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
            <p className="text-lg mb-1">💡</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white" }}>Tip of the day</p>
            <p className="text-[11px] line-clamp-2" style={{ color: "var(--w70)" }}>{weekData.naturalTip.split(/(?<=\.)\s/)[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
