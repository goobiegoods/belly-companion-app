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
    <div className="min-h-screen pb-20 page-enter" style={{ background: "#FEF8F4" }}>
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

      <div className="px-5 mb-5">
        <div className="belly-glass-card rounded-[17px] overflow-hidden">
          <div className="p-4">
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Baby development</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#A84E28" }}>{weekData.developmentHighlight}</p>
          </div>
          <div className="p-4 flex items-center gap-3" style={{ borderTop: "0.5px solid rgba(255,170,130,0.1)" }}>
            <BabySizeIllustration week={selectedWeek} size={60} />
            <div>
              <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Baby size</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "#A84E28" }}>{weekData.babySize} · {weekData.babyLength} · {weekData.babyWeight}</p>
            </div>
          </div>
          <div className="p-4" style={{ borderTop: "0.5px solid rgba(255,170,130,0.1)" }}>
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>What you might feel</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#A84E28" }}>{weekData.momSymptoms.join(" · ")}</p>
          </div>
          <div className="p-4" style={{ borderTop: "0.5px solid rgba(255,170,130,0.1)" }}>
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 4, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>Natural tip</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#A84E28" }}>{weekData.naturalTip}</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-5">
        <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>TRIMESTER OVERVIEW</p>
        <div className="flex gap-2">
          {trimesterInfo.map((t, i) => (
            <div key={i} className={`flex-1 belly-glass-card rounded-[14px] p-3 ${weekData.trimester !== i + 1 ? "opacity-60" : ""}`}>
              <p className="font-display text-[12px] font-semibold" style={{ color: "#A84E28" }}>{t.name}</p>
              <p className="text-[10px]" style={{ color: "#C4906A" }}>{t.range}</p>
              <p className="text-[10px] mt-1" style={{ color: "rgba(180,100,60,0.38)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="belly-glass-card rounded-[17px] p-5 text-center">
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>KICK COUNTER</p>
          <p className="font-display text-[48px] font-semibold mb-3" style={{ color: "#B86040" }}>{kickCount}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={addKick}
              className="rounded-full px-6 py-2.5 font-semibold text-sm belly-btn-primary active:scale-95"
              style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)", color: "white" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} className="rounded-full px-5 py-2.5 text-sm belly-btn-press" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyTracker;
