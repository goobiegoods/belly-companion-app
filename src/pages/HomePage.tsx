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

  // Streak (hardcoded for now)
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
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: "#FFCDB4" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke="#D4906A" strokeWidth="1.5" fill="#FFCDB4" />
              <ellipse cx="12" cy="17" rx="5" ry="3.5" stroke="#D4906A" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[20px] font-bold tracking-[-0.5px] leading-none" style={{ color: "#2A1200" }}>BELLY</h1>
            <p className="text-[9px] uppercase tracking-[0.1em] font-body" style={{ color: "#D4906A" }}>Virtual Doula</p>
          </div>
        </div>
        <div className="belly-glass rounded-full px-3 py-1.5">
          <span className="text-xs" style={{ color: "#D4906A" }}>Hi, {displayName} 🌸</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mb-5">
        <div className="belly-hero-gradient rounded-[20px] p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/8" />
          <div className="absolute top-4 right-4 opacity-85">
            <BabySizeIllustration week={currentWeek} size={72} />
          </div>
          <p className="text-[9.5px] uppercase tracking-[0.1em] mb-1" style={{ color: "rgba(42,18,0,0.6)" }}>WEEK {currentWeek}</p>
          <h2 className="font-display text-[26px] font-bold mb-1" style={{ color: "#2A1200" }}>You're in week {currentWeek}</h2>
          <p className="text-[13px] mb-4 leading-[1.55] pr-16" style={{ color: "rgba(42,18,0,0.7)" }}>{weekData.babySize} — {firstSentence}</p>
          <div className="h-1.5 rounded bg-white/30 mb-3">
            <div className="h-full rounded transition-all" style={{ width: `${progressPercent}%`, background: "rgba(42,18,0,0.25)" }} />
          </div>
          <div className="flex gap-2">
            <div className="bg-white/35 border border-white/60 rounded-full px-3 py-1.5">
              <span className="text-[11px] font-medium" style={{ color: "#2A1200" }}>{40 - currentWeek} weeks to go</span>
            </div>
            <div className="bg-white/35 border border-white/60 rounded-full px-3 py-1.5">
              <span className="text-[11px] font-medium" style={{ color: "#2A1200" }}>Trimester {weekData.trimester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak banner + milestones */}
      <div className="px-5 mb-5">
        <div className="belly-glass-card rounded-[16px] p-[14px_16px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[18px]" style={{ background: "linear-gradient(135deg, #FFB899, #FFCDB4)", boxShadow: "0 2px 8px rgba(255,184,153,0.4)" }}>
              🔥
            </div>
            <div className="flex-1">
              <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>{streakDays}-day streak!</p>
              <p className="text-[11px]" style={{ color: "#D4906A" }}>Keep checking in daily</p>
            </div>
            <p className="font-display text-[28px] font-bold" style={{ color: "#2A1200" }}>{streakDays}</p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.1em] mt-3 mb-2" style={{ color: "#D4B0A0" }}>Journey milestones</p>
          <div className="relative h-4 mb-1">
            <div className="absolute top-[7px] left-0 right-0 h-1 rounded-full" style={{ background: "rgba(255,228,212,0.6)" }} />
            <div className="absolute top-[7px] left-0 h-1 rounded-full transition-all" style={{ width: `${streakProgress}%`, background: "linear-gradient(to right, #FFB899, #FFCDB4)" }} />
            {milestones.map(m => (
              <div key={m.label} className="absolute flex flex-col items-center" style={{ left: `${m.pos}%`, top: 0, transform: "translateX(-50%)" }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]" style={{ background: streakProgress >= m.pos ? "#FFB899" : "rgba(255,228,212,0.6)" }}>
                  {m.emoji}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1 mt-1">
            {milestones.map(m => (
              <span key={m.label} className="text-[8px]" style={{ color: "#D4B0A0" }}>{m.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* This week */}
      <div className="mb-5">
        <p className="px-5 text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>THIS WEEK</p>
        <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar">
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(255,240,232,0.8)", border: "1px solid rgba(255,205,180,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
            <p className="text-lg mb-1">👶</p>
            <p className="font-display text-[13px] font-bold" style={{ color: "#2A1200" }}>Baby size</p>
            <p className="text-[11px]" style={{ color: "#D4906A" }}>{weekData.babySize}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(240,250,240,0.8)", border: "1px solid rgba(200,230,200,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
            <p className="text-lg mb-1">🤰</p>
            <p className="font-display text-[13px] font-bold" style={{ color: "#2A1200" }}>Your body</p>
            <p className="text-[11px]" style={{ color: "#D4906A" }}>{weekData.momSymptoms[0]}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-card-interactive" style={{ background: "rgba(255,244,248,0.8)", border: "1px solid rgba(244,192,209,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
            <p className="text-lg mb-1">💡</p>
            <p className="font-display text-[13px] font-bold" style={{ color: "#2A1200" }}>Tip of the day</p>
            <p className="text-[11px] line-clamp-2" style={{ color: "#D4906A" }}>{weekData.naturalTip.split(/(?<=\.)\s/)[0]}</p>
          </div>
        </div>
      </div>

      {/* Your journey */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>YOUR JOURNEY</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/ask")} className="w-full belly-glass-card rounded-[16px] p-4 flex items-center gap-3 belly-card-interactive text-left">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,240,232,0.8)" }}>
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>Ask the Doula</p>
              <p className="text-[11px]" style={{ color: "#D4906A" }}>Get instant natural guidance</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium belly-badge-glass" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>AI-powered</span>
          </button>

          <button onClick={() => navigate("/courses")} className="w-full belly-glass-card rounded-[16px] p-4 flex items-center gap-3 belly-card-interactive text-left">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "rgba(255,240,232,0.8)" }}>
              <span className="text-lg">📚</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>Your Courses</p>
              <p className="text-[11px]" style={{ color: "#D4906A" }}>Continue learning</p>
            </div>
          </button>
        </div>
      </div>

      {/* Daily check-in */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/journal")} className="w-full belly-glass-card rounded-[16px] p-4 belly-card-interactive text-left">
          <p className="font-display text-[16px] font-bold mb-1" style={{ color: "#2A1200" }}>How are you feeling today?</p>
          <p className="text-[11px]" style={{ color: "#D4906A" }}>Tap to log your daily check-in</p>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
