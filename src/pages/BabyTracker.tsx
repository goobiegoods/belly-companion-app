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
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      {/* Hero */}
      <div className="belly-hero-gradient rounded-b-[24px] px-5 pt-6 pb-5">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="font-display text-[48px] font-bold" style={{ color: "#2A1200" }}>{selectedWeek}</p>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(42,18,0,0.6)" }}>Weeks pregnant</p>
          </div>
          <div className="opacity-85" style={{ background: "rgba(255,212,224,0.2)", borderRadius: "50%", padding: "8px" }}>
            <BabySizeIllustration week={selectedWeek} size={80} />
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: "rgba(42,18,0,0.8)" }}>{weekData.babySize}</p>
      </div>

      {/* Week strip */}
      <div ref={scrollRef} className="flex gap-1.5 px-3 py-3 overflow-x-auto hide-scrollbar">
        {pregnancyWeeks.map(w => (
          <button
            key={w.week}
            onClick={() => setSelectedWeek(w.week)}
            className={`min-w-[36px] h-9 rounded-full text-xs font-medium belly-btn-press ${
              w.week === selectedWeek
                ? "text-white"
                : w.week < currentWeek
                ? "text-belly-text-muted"
                : ""
            }`}
            style={{
              background: w.week === selectedWeek ? "#FFB899" : w.week < currentWeek ? "rgba(255,240,232,0.8)" : "rgba(255,255,255,0.75)",
              border: w.week === selectedWeek ? "none" : "1px solid rgba(255,228,212,0.6)",
              color: w.week === selectedWeek ? "#2A1200" : "#D4B0A0",
            }}
          >
            {w.week}
          </button>
        ))}
      </div>

      {/* Week detail */}
      <div className="px-5 mb-5">
        <div className="belly-glass-card rounded-[16px] overflow-hidden">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#D4B0A0" }}>Baby development</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#2A1200" }}>{weekData.developmentHighlight}</p>
          </div>
          <div className="p-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,228,212,0.4)" }}>
            <BabySizeIllustration week={selectedWeek} size={60} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#D4B0A0" }}>Baby size</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "#2A1200" }}>{weekData.babySize} · {weekData.babyLength} · {weekData.babyWeight}</p>
            </div>
          </div>
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,228,212,0.4)" }}>
            <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#D4B0A0" }}>What you might feel</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#2A1200" }}>{weekData.momSymptoms.join(" · ")}</p>
          </div>
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,228,212,0.4)" }}>
            <p className="text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#D4B0A0" }}>Natural tip</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#2A1200" }}>{weekData.naturalTip}</p>
          </div>
        </div>
      </div>

      {/* Trimester overview */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>TRIMESTER OVERVIEW</p>
        <div className="flex gap-2">
          {trimesterInfo.map((t, i) => (
            <div key={i} className={`flex-1 belly-glass-card rounded-[14px] p-3 ${weekData.trimester !== i + 1 ? "opacity-60" : ""}`}>
              <p className="font-display text-[12px] font-bold" style={{ color: "#2A1200" }}>{t.name}</p>
              <p className="text-[10px]" style={{ color: "#D4906A" }}>{t.range}</p>
              <p className="text-[10px] mt-1" style={{ color: "#D4B0A0" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kick counter */}
      <div className="px-5 mb-5">
        <div className="belly-glass-card rounded-[16px] p-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>KICK COUNTER</p>
          <p className="font-display text-[48px] font-bold mb-3" style={{ color: "#2A1200" }}>{kickCount}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={addKick}
              className="rounded-full px-6 py-2.5 font-semibold text-sm belly-btn-primary active:scale-95"
              style={{ background: "#FFD4E0", color: "#8B2252" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} className="rounded-full px-5 py-2.5 text-sm belly-btn-press" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyTracker;
