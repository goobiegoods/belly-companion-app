import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, getDaysToGo } from "@/data/pregnancyWeeks";
import { useNavigate } from "react-router-dom";
import BabySizeIllustration from "@/components/BabySizeIllustration";


const HomePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const daysToGo = profile?.due_date ? getDaysToGo(profile.due_date) : 140;
  const progressPercent = (currentWeek / 40) * 100;

  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase(profile?.first_name || "") || "mama";

  const firstSentence = weekData.developmentHighlight.split(/(?<=\.)\s/)[0] || weekData.developmentHighlight;

  const streakDays = 3;
  const streakProgress = Math.min(100, streakDays <= 6 ? (streakDays / 6) * 33 : streakDays <= 13 ? 33 + ((streakDays - 7) / 7) * 33 : 66 + Math.min(34, ((streakDays - 14) / 14) * 34));

  const milestones = [
    { emoji: "🌱", label: "Day 1", pos: 0 },
    { emoji: "🍋", label: "Week 1", pos: 33 },
    { emoji: "🥑", label: "Week 2", pos: 66 },
    { emoji: "👶", label: "Birth", pos: 100 },
  ];

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 29, height: 29, borderRadius: 9, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 3px 12px rgba(0,0,0,0.08)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke="white" strokeWidth="1.3" strokeOpacity="0.9" fill="none" />
              <ellipse cx="12" cy="17" rx="5" ry="3.5" stroke="white" strokeWidth="1.1" strokeOpacity="0.9" fill="none" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[20px] font-semibold tracking-[-0.5px] leading-none" style={{ color: "white" }}>BELLY</h1>
            <p className="font-body" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>Virtual Doula</p>
          </div>
        </div>
        <div className="rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Hi, {displayName} 🌸</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mb-5">
        <div className="rounded-[22px] p-5 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)" }}>
          <div className="absolute rounded-full" style={{ width: 112, height: 112, top: -32, right: -32, background: "rgba(255,255,255,0.10)" }} />
          <div className="absolute rounded-full" style={{ width: 64, height: 64, bottom: -16, left: -16, background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute top-4 right-4 opacity-85">
            <BabySizeIllustration week={currentWeek} size={72} />
          </div>
          <p style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, color: "rgba(255,255,255,0.65)" }}>WEEK {currentWeek}</p>
          <h2 className="font-display text-[26px] font-semibold mb-1" style={{ color: "white" }}>You're in week {currentWeek}</h2>
          <p className="text-[13px] mb-4 leading-[1.55] pr-16" style={{ color: "rgba(255,255,255,0.8)" }}>{weekData.babySize} — {firstSentence}</p>
          <div className="h-1.5 rounded" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-full rounded transition-all" style={{ width: `${progressPercent}%`, background: "rgba(255,255,255,0.6)" }} />
          </div>
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
        <div className="rounded-[16px] p-[14px_16px]" style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]" style={{ background: "rgba(255,255,255,0.2)" }}>
              🔥
            </div>
            <div className="flex-1">
              <p className="font-display text-[14px] font-semibold" style={{ color: "white" }}>{streakDays}-day streak!</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Keep checking in daily</p>
            </div>
            <p className="font-display" style={{ fontSize: 26, fontWeight: 200, color: "rgba(255,255,255,0.9)" }}>{streakDays}</p>
          </div>

          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginTop: 12, marginBottom: 8, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Journey milestones</p>
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
              <span key={m.label} style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{m.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* This week */}
      <div className="mb-5">
        <p className="px-5" style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>THIS WEEK</p>
        <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar">
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <p className="text-lg mb-1">👶</p>
            <p className="font-display text-[13px] font-semibold" style={{ color: "white" }}>Baby size</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>{weekData.babySize}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <p className="text-lg mb-1">🤰</p>
            <p className="font-display text-[13px] font-semibold" style={{ color: "white" }}>Your body</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>{weekData.momSymptoms[0]}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <p className="text-lg mb-1">💡</p>
            <p className="font-display text-[13px] font-semibold" style={{ color: "white" }}>Tip of the day</p>
            <p className="text-[11px] line-clamp-2" style={{ color: "rgba(255,255,255,0.7)" }}>{weekData.naturalTip.split(/(?<=\.)\s/)[0]}</p>
          </div>
        </div>
      </div>

      {/* Your journey */}
      <div className="px-5 mb-5">
        <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>YOUR JOURNEY</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/ask")} className="w-full rounded-[17px] p-4 flex items-center gap-3 belly-card-interactive text-left"
            style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.28)" }}>
            <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "0.5px solid rgba(255,255,255,0.28)" }}>
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-semibold" style={{ color: "white" }}>Ask the Doula</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Get instant natural guidance</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "white" }}>AI-powered</span>
          </button>

          <button onClick={() => navigate("/courses")} className="w-full rounded-[17px] p-4 flex items-center gap-3 belly-card-interactive text-left"
            style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.28)" }}>
            <div className="w-10 h-10 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "0.5px solid rgba(255,255,255,0.28)" }}>
              <span className="text-lg">📚</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-semibold" style={{ color: "white" }}>Your Courses</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Continue learning</p>
            </div>
          </button>
        </div>
      </div>

      {/* Daily check-in */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/journal")} className="w-full rounded-[17px] p-4 belly-card-interactive text-left"
          style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.28)" }}>
          <p className="font-display text-[16px] font-semibold mb-1" style={{ color: "white" }}>How are you feeling today?</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Tap to log your daily check-in</p>
        </button>
      </div>

      {/* Can't Sleep entry */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/cant-sleep")} className="w-full rounded-[16px] p-[12px_14px] flex items-center gap-3 belly-card-interactive text-left"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
            <span>🌙</span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 10, fontWeight: 600, color: "white" }}>Can't sleep?</p>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.6)" }}>Affirmations, games & breathing</p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>›</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
