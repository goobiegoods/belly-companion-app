import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BabySizeIllustration from "@/components/BabySizeIllustration";

const BabyTracker = () => {
  const { profile, user } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const weekData = getWeekData(selectedWeek);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [kickCount, setKickCount] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.children[selectedWeek - 1] as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  const addKick = async () => {
    setKickCount(k => k + 1);
    if (user) {
      await supabase.from("kick_counts").insert({ user_id: user.id, count: 1 });
    }
  };

  const trimesterInfo = [
    { name: "1st Trimester", range: "Weeks 1–13", desc: "Building the foundation" },
    { name: "2nd Trimester", range: "Weeks 14–26", desc: "The golden trimester" },
    { name: "3rd Trimester", range: "Weeks 27–40", desc: "The final stretch" },
  ];

  return (
    <div className="min-h-screen bg-belly-bg pb-20">
      {/* Hero */}
      <div className="bg-primary rounded-b-hero px-5 pt-6 pb-5">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="font-display text-[48px] font-bold text-primary-foreground">{selectedWeek}</p>
            <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">Weeks pregnant</p>
          </div>
          <div className="opacity-85" style={{ background: "rgba(255,212,224,0.2)", borderRadius: "50%", padding: "8px" }}>
            <BabySizeIllustration week={selectedWeek} size={80} />
          </div>
        </div>
        <p className="text-center text-primary-foreground/80 text-sm">{weekData.babySize}</p>
      </div>

      {/* Week strip */}
      <div ref={scrollRef} className="flex gap-1.5 px-3 py-3 overflow-x-auto hide-scrollbar">
        {pregnancyWeeks.map(w => (
          <button
            key={w.week}
            onClick={() => setSelectedWeek(w.week)}
            className={`min-w-[36px] h-9 rounded-pill text-xs font-medium belly-btn-press ${
              w.week === selectedWeek
                ? "bg-primary text-primary-foreground"
                : w.week < currentWeek
                ? "bg-belly-icon-bg text-belly-text-muted"
                : "bg-card border border-belly-card-border text-belly-text-hint"
            }`}
          >
            {w.week}
          </button>
        ))}
      </div>

      {/* Week detail */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-belly-card-border rounded-card overflow-hidden">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1">Baby development</p>
            <p className="text-[13px] text-foreground leading-relaxed">{weekData.developmentHighlight}</p>
          </div>
          <div className="p-4 border-t border-belly-divider flex items-center gap-3">
            <BabySizeIllustration week={selectedWeek} size={60} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1">Baby size</p>
              <p className="text-[13px] text-foreground leading-relaxed">{weekData.babySize} · {weekData.babyLength} · {weekData.babyWeight}</p>
            </div>
          </div>
          <div className="p-4 border-t border-belly-divider">
            <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1">What you might feel</p>
            <p className="text-[13px] text-foreground leading-relaxed">{weekData.momSymptoms.join(" · ")}</p>
          </div>
          <div className="p-4 border-t border-belly-divider">
            <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1">Natural tip</p>
            <p className="text-[13px] text-foreground leading-relaxed">{weekData.naturalTip}</p>
          </div>
        </div>
      </div>

      {/* Trimester overview */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">TRIMESTER OVERVIEW</p>
        <div className="flex gap-2">
          {trimesterInfo.map((t, i) => (
            <div key={i} className={`flex-1 rounded-card p-3 border ${weekData.trimester === i + 1 ? "bg-belly-upsell-bg border-belly-upsell-border" : "bg-card border-belly-card-border opacity-60"}`}>
              <p className="font-display text-[12px] font-bold text-foreground">{t.name}</p>
              <p className="text-[10px] text-belly-text-muted">{t.range}</p>
              <p className="text-[10px] text-belly-text-hint mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kick counter */}
      <div className="px-5 mb-5">
        <div className="bg-card border border-belly-card-border rounded-card p-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">KICK COUNTER</p>
          <p className="font-display text-[48px] font-bold text-foreground mb-3">{kickCount}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={addKick}
              className="rounded-pill px-6 py-2.5 font-semibold text-sm belly-btn-press active:scale-95"
              style={{ background: "#FFD4E0", color: "#8B2252" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} className="bg-belly-icon-bg text-belly-text-muted rounded-pill px-5 py-2.5 text-sm belly-btn-press">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyTracker;
