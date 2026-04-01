import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, getDaysToGo } from "@/data/pregnancyWeeks";
import { useNavigate } from "react-router-dom";
import BabySizeIllustration from "@/components/BabySizeIllustration";

const FRUIT_EMOJI_MAP: Record<string, string> = {
  poppy: "🌺", blueberry: "🫐", raspberry: "🫐", grape: "🍇", olive: "🫒",
  lime: "🍈", plum: "🍑", lemon: "🍋", orange: "🍊", apple: "🍎",
  avocado: "🥑", pear: "🍐", mango: "🥭", banana: "🍌", pomegranate: "🍎",
  papaya: "🍈", cantaloupe: "🍈", coconut: "🥥", cauliflower: "🥦",
  lettuce: "🥬", cabbage: "🥬", pineapple: "🍍", melon: "🍈",
  watermelon: "🍉", pumpkin: "🎃", squash: "🎃", cucumber: "🥒",
  corn: "🌽", eggplant: "🍆", turnip: "🫒", peach: "🍑",
};

const getFruitEmoji = (babySize: string): string => {
  const lower = babySize.toLowerCase();
  for (const [key, emoji] of Object.entries(FRUIT_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍒";
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

  const streakDays = 3;
  const streakProgress = Math.min(100, streakDays <= 6 ? (streakDays / 6) * 33 : streakDays <= 13 ? 33 + ((streakDays - 7) / 7) * 33 : 66 + Math.min(34, ((streakDays - 14) / 14) * 34));

  const milestones = [
    { emoji: "🌱", label: "Day 1", pos: 0 },
    { emoji: "🍋", label: "Week 1", pos: 33 },
    { emoji: "🥑", label: "Week 2", pos: 66 },
    { emoji: "👶", label: "Birth", pos: 100 },
  ];

  const SUGGESTION_CHIPS = ["Round ligament pain?", "Foods to avoid", "Better sleep", "First kicks", "Anxiety tips"];
  const MOOD_LABELS = ["TIRED", "GOOD", "GLOW", "HANGOVER", "UNWELL"];
  const fruitEmoji = getFruitEmoji(weekData.babySize);

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      {/* Ghost watermark */}
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-46%)", fontFamily: "'Fraunces', serif", fontSize: 90, fontWeight: 900, color: "rgba(255,255,255,0.055)", letterSpacing: -4, pointerEvents: "none", zIndex: 0, userSelect: "none" }}>doula</div>

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between relative" style={{ zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 29, height: 29, borderRadius: 9, background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" fill="none" />
              <ellipse cx="12" cy="17" rx="5" ry="3.5" stroke="white" strokeWidth="1.1" strokeOpacity="0.9" fill="none" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white", textTransform: "lowercase" as const, letterSpacing: -0.5, lineHeight: 1 }}>belly</h1>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>Virtual Doula</p>
          </div>
        </div>
        <div className="rounded-full px-3 py-1.5" style={{ background: C1, border: `1px solid ${C1B}`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <span className="text-xs" style={{ color: "var(--w70)" }}>Hi, {displayName} 🌸</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mb-5 mt-4 relative" style={{ zIndex: 1 }}>
        {/* AI Pill */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ background: C1, border: `1px solid ${C1B}`, borderRadius: 20, padding: "3px 10px", fontSize: 8, color: "white", fontWeight: 600, display: "inline-block" }}>· AI · ALWAYS HERE FOR YOU ·</span>
        </div>
        <div className="rounded-[22px] p-5 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)" }}>
          <div className="absolute rounded-full" style={{ width: 112, height: 112, top: -32, right: -32, background: "rgba(255,255,255,0.10)" }} />
          <div className="absolute rounded-full" style={{ width: 64, height: 64, bottom: -16, left: -16, background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute top-4 right-4 opacity-85">
            <BabySizeIllustration week={currentWeek} size={72} />
          </div>
          {/* Hero headline */}
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, color: "white", letterSpacing: -1, lineHeight: 1.0 }}>Ask your</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, fontStyle: "italic", color: "rgba(255,255,255,0.80)", letterSpacing: -1, lineHeight: 1.0, marginBottom: 5 }}>doula anything</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.58)", marginBottom: 10 }}>Natural guidance & emotional support — no waiting rooms, no judgment.</p>
          <div className="h-1.5 rounded" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-full rounded transition-all" style={{ width: `${progressPercent}%`, background: "rgba(255,255,255,0.6)" }} />
          </div>
          {/* Input bar */}
          <div onClick={() => navigate("/ask")} style={{ background: "rgba(255,255,255,0.92)", borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", marginTop: 10, cursor: "pointer" }}>
            <span style={{ flex: 1, fontFamily: "'Outfit', system-ui", fontSize: 13, fontStyle: "italic", color: "rgba(160,80,20,0.50)" }}>Cramps, sleep, nutrition...</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FF6520", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          {/* Suggestion chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {SUGGESTION_CHIPS.map(chip => (
              <button key={chip} onClick={() => navigate("/ask")} style={{ background: C1, border: `1px solid ${C1B}`, borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "white", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>{chip}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Week card */}
      <div className="px-5 mb-5">
        <div className="rounded-[16px] p-[14px_16px] relative" style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}` }}>
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

      {/* Streak banner + milestones */}
      <div className="px-5 mb-5">
        <div className="rounded-[16px] p-[14px_16px]" style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]" style={{ background: "rgba(255,255,255,0.2)" }}>
              🔥
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white" }}>{streakDays}-day streak!</p>
              <p className="text-[11px]" style={{ color: "var(--w70)" }}>Keep checking in daily</p>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, color: "rgba(255,255,240,0.95)", letterSpacing: -3 }}>{streakDays}</p>
          </div>

          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 12, marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>Journey milestones</p>
          <div className="relative h-4 mb-1">
            <div className="absolute top-[7px] left-0 right-0 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="absolute top-[7px] left-0 h-1 rounded-full transition-all" style={{ width: `${streakProgress}%`, background: "rgba(255,255,255,0.6)" }} />
            {milestones.map(m => (
              <div key={m.label} className="absolute flex flex-col items-center" style={{ left: `${m.pos}%`, top: 0, transform: "translateX(-50%)" }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]" style={{ background: streakProgress >= m.pos ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
                  {m.emoji}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1 mt-1">
            {milestones.map(m => (
              <span key={m.label} style={{ fontSize: 8, color: "var(--w40)" }}>{m.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      <div className="px-5 mb-5">
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>HOW ARE YOU TODAY</p>
        <div className="flex gap-2 justify-between">
          {MOOD_LABELS.map(mood => (
            <button key={mood} onClick={() => navigate("/journal")} className="belly-btn-press" style={{ flex: 1, background: C1, border: `1px solid ${C1B}`, borderRadius: 14, padding: "10px 4px", textAlign: "center" }}>
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 600, color: "white", textTransform: "uppercase", letterSpacing: "0.05em" }}>{mood}</span>
            </button>
          ))}
        </div>
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

      {/* Your journey */}
      <div className="px-5 mb-5">
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>YOUR JOURNEY</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/ask")} className="w-full rounded-[17px] p-4 flex items-center gap-3 belly-card-interactive text-left"
            style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}` }}>
            <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "0.5px solid rgba(255,255,255,0.28)" }}>
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white" }}>Ask the Doula</p>
              <p className="text-[11px]" style={{ color: "var(--w70)" }}>Get instant natural guidance</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "white" }}>AI-powered</span>
          </button>

          <button onClick={() => navigate("/courses")} className="w-full rounded-[17px] p-4 flex items-center gap-3 belly-card-interactive text-left"
            style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}` }}>
            <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "0.5px solid rgba(255,255,255,0.28)" }}>
              <span className="text-lg">📚</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white" }}>Your Courses</p>
              <p className="text-[11px]" style={{ color: "var(--w70)" }}>Continue learning</p>
            </div>
          </button>
        </div>
      </div>

      {/* Daily check-in */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/journal")} className="w-full rounded-[17px] p-4 belly-card-interactive text-left"
          style={{ background: C1, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C1B}` }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 16, fontWeight: 600, color: "white", marginBottom: 2 }}>How are you feeling today?</p>
          <p className="text-[11px]" style={{ color: "var(--w70)" }}>Tap to log your daily check-in</p>
        </button>
      </div>

      {/* Can't Sleep entry */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/cant-sleep")} className="w-full rounded-[16px] p-[12px_14px] flex items-center gap-3 belly-card-interactive text-left"
          style={{ background: "var(--c2)", border: "1px solid var(--c2-border)", backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
            <span>🌙</span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, fontWeight: 600, color: "white" }}>Can't sleep?</p>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.6)" }}>Affirmations, games & breathing</p>
          </div>
          <span style={{ color: "var(--w40)", fontSize: 14 }}>›</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
