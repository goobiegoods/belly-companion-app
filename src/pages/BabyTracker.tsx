import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, pregnancyWeeks } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
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
    { name: "1st Trimester", range: "Weeks 1–13", desc: "Building the foundation", bg: "rgba(255,235,220,0.8)", border: "rgba(255,180,140,0.3)" },
    { name: "2nd Trimester", range: "Weeks 14–26", desc: "The golden trimester", bg: "rgba(255,248,210,0.8)", border: "rgba(220,190,80,0.3)" },
    { name: "3rd Trimester", range: "Weeks 27–40", desc: "The final stretch", bg: "rgba(220,245,225,0.8)", border: "rgba(140,210,160,0.3)" },
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

      {/* Trimester Overview */}
      <div className="px-5 mb-5">
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

      {/* Kick Counter */}
      <div className="px-5 mb-5">
        <div className="rounded-[17px] p-5 text-center" style={{ background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,170,130,0.18)", backdropFilter: "blur(12px)" }}>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>KICK COUNTER</p>
          <p className="font-display text-[48px] font-semibold mb-3" style={{ color: "#B86040" }}>{kickCount}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={addKick}
              className="rounded-full px-6 py-2.5 font-semibold text-sm active:scale-95"
              style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)", color: "white" }}>
              + Kick
            </button>
            <button onClick={() => setKickCount(0)} className="rounded-full px-5 py-2.5 text-sm" style={{ background: "rgba(255,200,170,0.3)", color: "#C4906A" }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BabyTracker;
