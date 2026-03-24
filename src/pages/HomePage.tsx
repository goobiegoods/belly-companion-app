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

  // Get full first sentence of development highlight
  const firstSentence = weekData.developmentHighlight.split(/(?<=\.)\s/)[0] || weekData.developmentHighlight;

  return (
    <div className="min-h-screen bg-belly-bg pb-20">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-icon bg-belly-upsell-border flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" stroke="#D4906A" strokeWidth="1.5" fill="#FFCDB4" />
              <ellipse cx="12" cy="17" rx="5" ry="3.5" stroke="#D4906A" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[20px] font-bold text-foreground tracking-[-0.5px] leading-none">BELLY</h1>
            <p className="text-[9px] uppercase tracking-[0.1em] text-belly-accent font-body">Virtual Doula</p>
          </div>
        </div>
        <div className="bg-belly-upsell-bg border border-belly-upsell-border rounded-pill px-3 py-1.5">
          <span className="text-belly-accent text-xs">Hi, {displayName} 🌸</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mb-5">
        <div className="bg-primary rounded-hero p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/8" />
          <div className="absolute top-4 right-4 opacity-85">
            <BabySizeIllustration week={currentWeek} size={72} />
          </div>
          <p className="text-[9.5px] uppercase tracking-[0.1em] text-primary-foreground/60 mb-1">WEEK {currentWeek}</p>
          <h2 className="font-display text-[26px] font-bold text-primary-foreground mb-1">You're in week {currentWeek}</h2>
          <p className="text-[13px] text-primary-foreground/70 mb-4 leading-[1.55] pr-16">{weekData.babySize} — {firstSentence}</p>
          
          {/* Progress bar */}
          <div className="h-1.5 rounded bg-white/30 mb-3">
            <div className="h-full rounded bg-primary-foreground/25 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          
          {/* Stat pills */}
          <div className="flex gap-2">
            <div className="bg-white/35 border border-white/60 rounded-pill px-3 py-1.5">
              <span className="text-[11px] text-primary-foreground font-medium">{40 - currentWeek} weeks to go</span>
            </div>
            <div className="bg-white/35 border border-white/60 rounded-pill px-3 py-1.5">
              <span className="text-[11px] text-primary-foreground font-medium">Trimester {weekData.trimester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* This week - horizontal scroll */}
      <div className="mb-5">
        <p className="px-5 text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">THIS WEEK</p>
        <div className="flex gap-3 px-5 overflow-x-auto hide-scrollbar">
          <div className="min-w-[130px] rounded-[14px] p-3 belly-press" style={{ background: "#FFF0E8", border: "1px solid #FFE4D4" }}>
            <p className="text-lg mb-1">👶</p>
            <p className="font-display text-[13px] font-bold text-foreground">Baby size</p>
            <p className="text-[11px] text-belly-text-muted">{weekData.babySize}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-press" style={{ background: "#F0F7F0", border: "1px solid #D4E8D4" }}>
            <p className="text-lg mb-1">🤰</p>
            <p className="font-display text-[13px] font-bold text-foreground">Your body</p>
            <p className="text-[11px] text-belly-text-muted">{weekData.momSymptoms[0]}</p>
          </div>
          <div className="min-w-[130px] rounded-[14px] p-3 belly-press" style={{ background: "#FFF4F8", border: "1px solid #FFD4E0" }}>
            <p className="text-lg mb-1">💡</p>
            <p className="font-display text-[13px] font-bold text-foreground">Tip of the day</p>
            <p className="text-[11px] text-belly-text-muted line-clamp-2">{weekData.naturalTip.split(/(?<=\.)\s/)[0]}</p>
          </div>
        </div>
      </div>

      {/* Your journey */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">YOUR JOURNEY</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/ask")} className="w-full bg-card border border-belly-card-border rounded-card p-4 flex items-center gap-3 belly-press text-left">
            <div className="w-10 h-10 rounded-icon bg-belly-icon-bg flex items-center justify-center shrink-0">
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-bold text-foreground">Ask the Doula</p>
              <p className="text-[11px] text-belly-text-muted">Get instant natural guidance</p>
            </div>
            <span className="text-[9px] bg-belly-icon-bg text-belly-accent px-2 py-0.5 rounded-pill font-medium">AI-powered</span>
          </button>

          <button onClick={() => navigate("/courses")} className="w-full bg-card border border-belly-card-border rounded-card p-4 flex items-center gap-3 belly-press text-left">
            <div className="w-10 h-10 rounded-icon bg-belly-icon-bg flex items-center justify-center shrink-0">
              <span className="text-lg">📚</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-bold text-foreground">Your Courses</p>
              <p className="text-[11px] text-belly-text-muted">Continue learning</p>
            </div>
          </button>
        </div>
      </div>

      {/* Daily check-in */}
      <div className="px-5 mb-5">
        <button onClick={() => navigate("/journal")} className="w-full bg-belly-upsell-bg border border-belly-upsell-border rounded-card p-4 belly-press text-left">
          <p className="font-display text-[16px] font-bold text-foreground mb-1">How are you feeling today?</p>
          <p className="text-[11px] text-belly-text-muted">Tap to log your daily check-in</p>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
