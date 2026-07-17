import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { SceneBackground, GhHeader, GlassCard, BellaOrb } from "@/components/golden";

const SUGGESTIONS = ["Round ligament?", "Foods to avoid"];

function greetingWord(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

/** Three week-appropriate milestone tiles (hearing / lungs / viability style). */
function milestonesForWeek(week: number): { icon: JSX.Element; label: string }[] {
  const iconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--gold)",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    width: 20,
    height: 20,
    style: { margin: "0 auto 7px", display: "block" },
  };
  const hearing = (
    <svg {...iconProps}><path d="M4 12a8 8 0 0 1 16 0M8 12a4 4 0 0 1 8 0M12 16v2" /></svg>
  );
  const lungs = (
    <svg {...iconProps}><path d="M12 3v6M8 9c-3 0-5 3-5 7s2 5 4 5 3-2 3-5V9M16 9c3 0 5 3 5 7s-2 5-4 5-3-2-3-5V9" /></svg>
  );
  const drop = (
    <svg {...iconProps}><path d="M12 21c0-8 6-9 6-16a6 6 0 0 0-12 0c0 7 6 8 6 16z" /></svg>
  );
  const heart = (
    <svg {...iconProps}><path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9z" /></svg>
  );
  const brain = (
    <svg {...iconProps}><path d="M12 4a3 3 0 0 0-3 3c-2 0-3.5 1.5-3.5 3.5 0 1 .4 1.9 1 2.5-.6.6-1 1.5-1 2.5A3.5 3.5 0 0 0 9 19h6a3.5 3.5 0 0 0 3.5-3.5c0-1-.4-1.9-1-2.5.6-.6 1-1.5 1-2.5C18.5 8.5 17 7 15 7a3 3 0 0 0-3-3z" /></svg>
  );
  if (week >= 28) return [
    { icon: hearing, label: "Hearing" },
    { icon: lungs, label: "Lungs" },
    { icon: drop, label: "Viability" },
  ];
  if (week >= 20) return [
    { icon: hearing, label: "Hearing" },
    { icon: brain, label: "Brain growth" },
    { icon: heart, label: "Movement" },
  ];
  return [
    { icon: heart, label: "Heartbeat" },
    { icon: brain, label: "Brain forming" },
    { icon: drop, label: "Growing" },
  ];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const weeksToGo = Math.max(0, 40 - currentWeek);
  const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  const name = titleCase((profile?.first_name || "").split(" ")[0]) || "mama";

  const goToAsk = (prefill?: string) =>
    navigate("/ask", { state: prefill ? { prefill } : undefined });

  return (
    <SceneBackground scene="today">
      <GhHeader brand="belly" tag="virtual doula" brandSize={26} weekPill={`week ${currentWeek}`}>
        <div
          className="font-gh-serif"
          style={{ position: "relative", zIndex: 2, fontSize: 22, fontWeight: 500, marginTop: 16, lineHeight: 1.3 }}
        >
          Good {greetingWord()}, {name}
          <span
            style={{
              opacity: 0.8, fontWeight: 400, fontStyle: "italic",
              fontSize: 15, display: "block", marginTop: 2,
            }}
          >
            the light is on for you
          </span>
        </div>
        <div className="gh-progress-track" style={{ position: "relative", zIndex: 2, marginTop: 14 }}>
          <div className="gh-progress-fill" style={{ width: `${Math.round((currentWeek / 40) * 100)}%` }} />
        </div>
        <div
          className="font-gh-mono"
          style={{
            position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between",
            marginTop: 7, fontSize: 11, color: "rgba(251,238,224,0.75)",
          }}
        >
          <span>trimester {weekData.trimester}</span>
          <span>{weeksToGo} weeks to go</span>
        </div>
      </GhHeader>

      <div style={{ padding: "12px 16px 110px" }}>
        {/* Ask your doula */}
        <GlassCard>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12,
              background: "rgba(255,255,255,0.14)", padding: "4px 11px 4px 5px",
              borderRadius: 20, marginBottom: 12, fontWeight: 500,
            }}
          >
            <BellaOrb size={20} /> Bella · here with you
          </div>
          <p className="font-gh-serif" style={{ fontSize: 20, fontWeight: 500, margin: "0 0 3px" }}>
            Ask your doula anything
          </p>
          <p style={{ fontSize: 13, color: "rgba(251,238,224,0.7)", margin: "0 0 13px" }}>
            No waiting rooms. Just honest, warm guidance.
          </p>
          <div className="gh-input-row" style={{ marginBottom: 11 }} onClick={() => goToAsk()} role="button">
            Cramps, sleep, what's normal…
            <div className="gh-arrow-btn">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="gh-pill" onClick={() => goToAsk(s)}>
                {s}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Belly breathe */}
        <div
          onClick={() => navigate("/breathe")}
          role="button"
          style={{
            borderRadius: 18, padding: 16,
            background: "linear-gradient(135deg, rgba(44,156,143,0.35), rgba(181,56,107,0.35))",
            border: "1px solid var(--glass-border)",
            display: "flex", alignItems: "center", gap: 13,
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            marginBottom: 12, cursor: "pointer",
          }}
        >
          <div
            className="font-gh-mono"
            style={{
              fontSize: 15, fontWeight: 600, background: "rgba(255,255,255,0.16)",
              width: 50, height: 50, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            4·7·8
          </div>
          <div>
            <b className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, display: "block" }}>
              Belly breathe
            </b>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Calm your body in 60 seconds</span>
          </div>
        </div>

        {/* This week's milestones */}
        <div className="gh-section-label">this week's milestones</div>
        <div style={{ display: "flex", gap: 9 }}>
          {milestonesForWeek(currentWeek).map((m) => (
            <div
              key={m.label}
              style={{
                flex: 1, background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)", borderRadius: 15,
                padding: "13px 6px", textAlign: "center",
                backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              }}
            >
              {m.icon}
              <span style={{ fontSize: 11, fontWeight: 500, display: "block" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SceneBackground>
  );
}
