import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { SceneBackground, GhHeader, GlassCard, BellaOrb } from "@/components/golden";

interface Milestone {
  week: number;
  title: string;
  tone: "teal" | "magenta";
}

const MILESTONES: Milestone[] = [
  { week: 6, title: "Heartbeat first detected", tone: "teal" },
  { week: 12, title: "First trimester complete", tone: "teal" },
  { week: 20, title: "Anatomy scan day", tone: "magenta" },
  { week: 28, title: "Third trimester begins", tone: "magenta" },
];

const Journey = () => {
  const { profile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weeksLeft = Math.max(0, 40 - currentWeek);
  const dueDateLabel = profile?.due_date
    ? new Date(profile.due_date).toLocaleDateString(undefined, { month: "long", day: "numeric" })
    : null;

  const arcLabel =
    currentWeek >= 37 ? "almost there — the glow is at its brightest"
    : currentWeek >= 27 ? "the glow is warming up"
    : currentWeek >= 14 ? "the golden middle"
    : "the first flicker of the glow";

  // Timeline: past milestones, "you are here", then the due date.
  const items: { week: number; title: string; state: "done" | "now" | "future"; tone?: "teal" | "magenta" }[] = [
    ...MILESTONES.filter(m => m.week < currentWeek).map(m => ({ week: m.week, title: m.title, state: "done" as const, tone: m.tone })),
    { week: currentWeek, title: "You are here, mama", state: "now" as const },
    ...MILESTONES.filter(m => m.week > currentWeek).map(m => ({ week: m.week, title: m.title, state: "future" as const })),
    ...(currentWeek < 40 ? [{ week: 40, title: dueDateLabel ? `Due date · ${dueDateLabel}` : "Due date", state: "future" as const }] : []),
  ];

  const dotStyle = (item: (typeof items)[number]): React.CSSProperties => {
    if (item.state === "now") {
      return {
        background: "var(--gold)",
        border: "2px solid rgba(21,10,31,0.8)",
        boxShadow: "0 0 0 4px rgba(242,182,71,0.35)",
        animation: "bellaPulse 2.4s ease-in-out infinite",
      };
    }
    if (item.state === "done") {
      return {
        background: item.tone === "magenta" ? "var(--magenta)" : "var(--teal)",
        border: "2px solid rgba(21,10,31,0.8)",
      };
    }
    return { background: "transparent", border: "2px dashed rgba(255,255,255,0.4)" };
  };

  return (
    <SceneBackground scene="journey">
      <GhHeader
        brand="Your journey"
        tag="40 weeks, one glow"
        brandSize={20}
        showOrb
        weekPill={`wk ${currentWeek}`}
        glowStyle={{ right: -40, top: -60 }}
      >
        {/* 40-week arc */}
        <div style={{ position: "relative", zIndex: 2, marginTop: 18 }}>
          <div
            style={{
              height: 9, borderRadius: 6,
              background: "linear-gradient(90deg, #5dd6c4 0%, var(--magenta) 50%, var(--gold) 100%)",
              position: "relative",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute", top: "50%",
                left: `${Math.min(98, Math.round((currentWeek / 40) * 100))}%`,
                width: 16, height: 16, borderRadius: "50%",
                background: "var(--cream)", border: "3px solid var(--gold)",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 12px rgba(242,182,71,0.8)",
              }}
            />
          </div>
          <div className="font-gh-mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 9.5, color: "rgba(251,238,224,0.6)" }}>
            <span>T1</span><span>T2</span><span>T3</span><span>birth</span>
          </div>
          <div className="font-gh-mono" style={{ textAlign: "center", fontSize: 11, color: "var(--gold)", marginTop: 9 }}>
            week {currentWeek} of 40 — {arcLabel}
          </div>
        </div>
      </GhHeader>

      <div style={{ padding: "12px 16px 110px" }}>
        <GlassCard>
          <div className="gh-section-label">your timeline</div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ content: '""', position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,0.2)" }} />
            {items.map((item) => (
              <div key={`${item.week}-${item.title}`} style={{ position: "relative", marginBottom: 17, opacity: item.state === "future" ? 0.55 : 1 }}>
                <div style={{ position: "absolute", left: -24, top: 3, width: 12, height: 12, borderRadius: "50%", ...dotStyle(item) }} />
                <div className="font-gh-mono" style={{ fontSize: 10, color: "rgba(251,238,224,0.55)" }}>week {item.week}</div>
                <div
                  className="font-gh-serif"
                  style={{
                    fontSize: 14, marginTop: 2,
                    color: item.state === "now" ? "var(--gold)" : "var(--cream)",
                    fontWeight: item.state === "now" ? 500 : 400,
                  }}
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Bella's note */}
        <div
          style={{
            borderRadius: 18, padding: 16,
            background: "linear-gradient(135deg, rgba(44,156,143,0.35), rgba(181,56,107,0.35))",
            border: "1px solid var(--glass-border)",
            display: "flex", alignItems: "center", gap: 13,
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            marginTop: 2,
          }}
        >
          <BellaOrb size={44} />
          <div>
            <b className="font-gh-serif" style={{ fontSize: 14.5, fontWeight: 500, display: "block" }}>Bella's note</b>
            <span style={{ fontSize: 12, opacity: 0.85 }}>
              {weeksLeft > 0
                ? `${weeksLeft === 1 ? "One week" : `${weeksLeft} weeks`} left — the glow gets warmer from here.`
                : "You made it to the threshold, mama — the glow is yours now."}
            </span>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
};

export default Journey;
