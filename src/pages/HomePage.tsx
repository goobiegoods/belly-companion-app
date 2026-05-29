import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, getDaysToGo } from "@/data/pregnancyWeeks";
import { useNavigate } from "react-router-dom";
import { getStreak } from "@/lib/streak";
import { getBreathingStreak } from "@/lib/breathingStreak";
import ShareableMilestoneCard from "@/components/ShareableMilestoneCard";
import AppHeader, { HeaderGhostPill } from "@/components/AppHeader";

const SUGGESTIONS = [
  { label: "Round ligament?", kind: "orange" as const },
  { label: "Foods to avoid",  kind: "orange" as const },
  { label: "Better sleep",    kind: "neutral" as const },
  { label: "Anxiety tips",    kind: "neutral" as const },
];

const HomePage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const daysToGo = profile?.due_date ? getDaysToGo(profile.due_date) : 140;

  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const displayName = titleCase((profile?.first_name || "").split(" ")[0]) || "mama";

  const [streakDays, setStreakDays] = useState(0);
  const [breathingStreak, setBreathingStreak] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    getStreak(user.id).then((s) => s && setStreakDays(s.current));
    getBreathingStreak(user.id).then((s) => setBreathingStreak(s.current));
  }, [user?.id]);

  const goToAsk = (prefill?: string) => navigate("/ask", { state: prefill ? { prefill } : undefined });

  const fruitEmoji = weekData.emoji || "🌱";
  const fruitName = weekData.babySize.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();

  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? "good morning, mama"
    : hour >= 12 && hour < 18 ? "good afternoon, mama"
    : "good evening, mama";

  const milestones = [
    { emoji: currentWeek >= 23 ? "👂" : "💓", label: currentWeek >= 23 ? "Hearing active" : "Heartbeat" },
    { emoji: "🫁", label: "Lungs forming" },
    { emoji: currentWeek >= 24 ? "🌱" : "🧠", label: currentWeek >= 24 ? "Viability reached" : "Brain growing" },
  ];

  return (
    <div className="min-h-screen page-enter" style={{ background: "#F0E8DC", paddingBottom: 110, position: "relative", overflow: "hidden" }}>
      <AppHeader right={<HeaderGhostPill>{greeting}</HeaderGhostPill>} />

      {/* Watermark */}
      <span className="belly-watermark" style={{ top: 70, left: -8, fontSize: 100 }}>doula</span>

      <div className="stagger" style={{ position: "relative", zIndex: 1, padding: "12px 0 0" }}>

        {/* Card 1 — Ask Bella */}
        <div style={{ padding: "0 12px", marginBottom: 12 }}>
          <div className="belly-card" style={{ position: "relative", overflow: "hidden", padding: 16 }}>
            <span className="belly-watermark" style={{ top: -8, right: -6, fontSize: 72, opacity: 0.05 }}>bella</span>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative", zIndex: 1 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "linear-gradient(135deg, #E8702A, #D45810)",
                padding: "4px 11px 4px 10px", borderRadius: 999,
                boxShadow: "0 2px 8px rgba(232,112,42,0.35)",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "livePulse 2s infinite" }} />
                <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 11.5, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>Bella</span>
              </span>
              <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 600, color: "#9A6B4E" }}>online</span>
            </div>

            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 21, fontWeight: 400, fontStyle: "italic", color: "#B8755A", letterSpacing: -0.3, lineHeight: 1.1, marginBottom: -2 }}>Ask your</p>
            <p className="font-display" style={{ fontSize: 25, fontStyle: "italic", fontWeight: 400, color: "#E8702A", letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 8 }}>
              doula anything
            </p>
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10.5, color: "#7A5038", lineHeight: 1.55, marginBottom: 12 }}>
              No waiting rooms, no judgment — honest guidance for your body.
            </p>

            <div className="belly-input-pill">
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goToAsk(searchValue)}
                placeholder="Cramps, sleep, what's normal..."
              />
              <button onClick={() => goToAsk(searchValue || undefined)} className="belly-send-circle" aria-label="Ask Bella">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="hide-scrollbar" style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto" }}>
              {SUGGESTIONS.map(s => (
                <button key={s.label} onClick={() => goToAsk(s.label)}
                  className={s.kind === "orange" ? "belly-pill-orange" : "belly-pill-neutral"}
                  style={{ flexShrink: 0, cursor: "pointer" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 — Week */}
        <div style={{ padding: "0 12px", marginBottom: 12 }}>
          <div className="belly-card" style={{ overflow: "hidden", padding: 0, textAlign: "center" }}>
            <div style={{
              background: "linear-gradient(135deg, #E8702A 0%, #D45810 100%)",
              padding: "14px 12px 0", position: "relative", overflow: "hidden",
            }}>
              <span className="belly-header-glow" aria-hidden />
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)", fontWeight: 600, textTransform: "uppercase" }}>YOU'RE IN</p>
              <p className="font-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: 44, color: "#fff", lineHeight: 0.95, letterSpacing: -1.5, margin: "2px 0 4px" }}>
                week {currentWeek}
              </p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 7.5, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: 12, textTransform: "uppercase" }}>
                {currentWeek >= 24 ? "VIABILITY MILESTONE" : currentWeek >= 13 ? "SECOND TRIMESTER" : "FIRST TRIMESTER"}
              </p>

              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 50, lineHeight: 1,
                margin: "0 auto 16px",
              }}>{fruitEmoji}</div>
            </div>

            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, color: "#2A1808", marginBottom: 2 }}>
                Your baby can hear you now —
              </p>
              <p className="font-display" style={{ fontStyle: "italic", fontSize: 14, color: "#E8702A", marginBottom: 12 }}>
                they already know your voice.
              </p>

              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <span className="belly-pill-orange">{Math.max(0, 40 - currentWeek)} weeks to go</span>
                <span className="belly-pill-neutral">Trimester {weekData.trimester}</span>
              </div>


              <ShareableMilestoneCard
                week={currentWeek}
                fruitEmoji={fruitEmoji}
                fruitName={fruitName}
                emotionalFact={`Your baby is the size of a ${fruitName}.`}
              />
            </div>
          </div>
        </div>

        {/* Card 3 — Belly Breathe */}
        <div style={{ padding: "0 11px", marginBottom: 10 }}>
          <button onClick={() => navigate("/breathe")} className="belly-press-scale" style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            background: "linear-gradient(135deg, #E8702A 0%, #C84E08 100%)",
            border: "none", borderRadius: 18, padding: 14, position: "relative", overflow: "hidden",
            boxShadow: "0 4px 16px rgba(232,112,42,0.4)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ position: "absolute", top: -15, right: -15, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.30)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 800, color: "#fff" }}>4-7-8</span>
              <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>breath</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, letterSpacing: "0.14em", color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase" }}>BELLY BREATHE</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Calm your body in 60 seconds</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "rgba(255,255,255,0.70)", fontWeight: 500 }}>Sleep · Anxiety · Birth prep</p>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.22)", border: "0.5px solid rgba(255,255,255,0.30)",
              borderRadius: 10, padding: "7px 10px", fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 800, color: "#fff",
              position: "relative", zIndex: 1, flexShrink: 0,
            }}>Start →</span>
          </button>
        </div>

        {/* Card 4 — Milestones row */}
        <div style={{ padding: "0 11px", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
            {milestones.map(m => (
              <div key={m.label} className="belly-card" style={{ padding: 12, textAlign: "center", borderRadius: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{m.emoji}</div>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, fontWeight: 700, color: "#7A4818", lineHeight: 1.3 }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 — Today's Recipe */}
        <div style={{ padding: "0 12px", marginBottom: 14 }}>
          <button onClick={() => navigate("/recipes")} className="belly-card belly-press-scale" style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "#FAEADA",
              border: "1px solid rgba(232,112,42,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
            }}>🥗</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="belly-eyebrow" style={{ marginBottom: 3 }}>TODAY'S RECIPE</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 12, fontWeight: 700, color: "#1A0E06", lineHeight: 1.25 }}>Iron-Rich Lentil Bowl</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "#B89070", marginTop: 2 }}>5 min · Iron · Week {currentWeek}</p>
            </div>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#FAEADA",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: "#E8702A", fontSize: 16, fontWeight: 700,
            }}>›</div>
          </button>
        </div>

        {/* Quick Navigate */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: "'Nunito',system-ui", fontSize: 7.5, letterSpacing: "0.14em",
            color: "#C0907A", fontWeight: 700, textTransform: "uppercase",
            padding: "0 14px 6px",
          }}>QUICK NAVIGATE</p>
          <div className="hide-scrollbar" style={{ display: "flex", gap: 6, padding: "0 14px", overflowX: "auto" }}>
            {[
              { label: "Baby Size", to: "/baby", kind: "orange" as const },
              { label: "Ask Bella", to: "/ask", kind: "neutral" as const },
              { label: "Recipes", to: "/recipes", kind: "orange" as const },
              { label: "Mamas", to: "/community", kind: "neutral" as const },
            ].map(p => (
              <button key={p.label} onClick={() => navigate(p.to)}
                className={p.kind === "orange" ? "belly-pill-orange" : "belly-pill-neutral"}
                style={{ flexShrink: 0, cursor: "pointer", fontSize: 11, padding: "6px 13px" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feeding Tracker entry */}
        <div style={{ padding: "0 12px", marginBottom: 12 }}>
          <button onClick={() => navigate("/feeding")} className="belly-card belly-press-scale" style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "#FAEADA",
              border: "1px solid rgba(232,112,42,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
            }}>🍼</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="belly-eyebrow" style={{ marginBottom: 3 }}>FEEDING TRACKER</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 12, fontWeight: 700, color: "#1A0E06", lineHeight: 1.25 }}>Log breast + bottle feeds</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "#B89070", marginTop: 2 }}>Quick log · Weekly trends</p>
            </div>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#FAEADA",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: "#E8702A", fontSize: 16, fontWeight: 700,
            }}>›</div>
          </button>
        </div>

        {/* Streak callouts */}
        <div style={{ padding: "0 12px", display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/me")} className="belly-press-scale" style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "#FAEADA", border: "1px solid rgba(232,112,42,0.25)",
            borderRadius: 14, padding: "10px 12px", cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 700, color: "#A84818", lineHeight: 1.2 }}>
              {streakDays}-day streak
            </span>
          </button>
          <button onClick={() => navigate("/breathe")} className="belly-press-scale" style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "#FAEADA", border: "1px solid rgba(232,112,42,0.25)",
            borderRadius: 14, padding: "10px 12px", cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 16 }}>🌬</span>
            <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 700, color: "#A84818", lineHeight: 1.2 }}>
              {breathingStreak}-day breathing
            </span>
          </button>
        </div>

      </div>

      <p style={{ textAlign: "center", marginTop: 14, padding: "0 20px", fontFamily: "'Nunito',system-ui", fontSize: 10, color: "#C0A888" }}>
        Day {daysToGo > 0 ? 280 - daysToGo : 280} of your journey
      </p>
    </div>
  );
};

export default HomePage;
