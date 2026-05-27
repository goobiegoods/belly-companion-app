import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getWeekData, getDaysToGo } from "@/data/pregnancyWeeks";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getStreak } from "@/lib/streak";
import ShareableMilestoneCard from "@/components/ShareableMilestoneCard";

const SUGGESTION_CHIPS = [
  "Round ligament pain?",
  "Foods to avoid",
  "Better sleep",
  "First kicks",
  "Anxiety tips",
  "I'm scared about…",
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
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    getStreak(user.id).then((s) => s && setStreakDays(s.current));
  }, [user?.id]);

  const goToAsk = (prefill?: string) => {
    navigate("/ask", { state: prefill ? { prefill } : undefined });
  };

  const fruitEmoji = weekData.emoji || "🌱";
  const fruitName = weekData.babySize.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();

  const emotionalFact = currentWeek >= 23
    ? "Your baby can hear you now. Talk to them — they already know your voice."
    : weekData.developmentHighlight.split(/(?<=\.)\s/)[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen page-enter" style={{ background: "var(--color-bg-base)", paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤰</div>
          <div>
            <h1 className="font-serif-display" style={{ fontSize: 20, fontStyle: "italic", fontWeight: 700, color: "var(--color-accent-primary)", lineHeight: 1, letterSpacing: -0.5 }}>belly</h1>
            <p className="section-label" style={{ marginTop: 2, fontSize: 9 }}>Virtual Doula</p>
          </div>
        </div>
        <p className="font-serif-display" style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-text-primary)" }}>
          {greeting}, {displayName}
        </p>
      </div>

      <div className="stagger">

      {/* Ask-doula card — soft sage tint, no left accent */}
      <div style={{ padding: "0 20px", marginBottom: 22 }}>
        <div style={{
          background: "#F3F6F1",
          borderRadius: 20,
          padding: 18,
          border: "1px solid var(--color-border-default)",
          boxShadow: "var(--shadow-card)",
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9622F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Outfit',system-ui", fontSize: 15, fontWeight: 500 }}>B</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Bella</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-sage)", animation: "livePulse 2s infinite" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>online · replies in seconds</span>
            </div>
          </div>

          <p className="font-serif-display" style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.1 }}>Ask your</p>
          <p className="font-serif-display" style={{ fontSize: 32, fontStyle: "italic", color: "var(--color-accent-primary)", letterSpacing: -1, lineHeight: 1.05, marginBottom: 10 }}>doula anything</p>
          <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: 14 }}>
            Natural guidance for your body, your week, your worries — no waiting rooms, no judgment.
          </p>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--color-bg-base)",
            border: "1px solid var(--color-border-default)",
            borderRadius: 28, height: 52, padding: "0 6px 0 18px",
          }}>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToAsk(searchValue)}
              placeholder="Cramps, sleep, what's normal..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "'Outfit',system-ui", fontSize: 14, color: "var(--color-text-primary)" }}
            />
            <button onClick={() => goToAsk(searchValue || undefined)} aria-label="Ask Bella" style={{
              width: 40, height: 40, borderRadius: "50%", border: "none",
              background: "var(--color-accent-primary)", display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "var(--shadow-warm)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", flexWrap: "nowrap" }}>
            {SUGGESTION_CHIPS.map(chip => (
              <button key={chip} onClick={() => goToAsk(chip)} className="v2-chip" style={{ flexShrink: 0 }}>{chip}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Week card with sage glow behind illustration */}
      <div style={{ padding: "0 20px", marginBottom: 22 }}>
        <div className="card" style={{ padding: "20px 16px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          <p className="section-label" style={{ textAlign: "center" }}>YOU'RE IN</p>
          <p className="font-serif-display" style={{ fontSize: 48, fontStyle: "italic", color: "var(--color-accent-primary)", lineHeight: 1, letterSpacing: -1, marginTop: 4, marginBottom: 2 }}>
            week {currentWeek}
          </p>

          <div style={{ position: "relative", width: 180, height: 140, margin: "0 auto" }}>
            <span aria-hidden style={{
              position: "absolute", left: "50%", top: "50%",
              width: 180, height: 140,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "#C8D9C4",
              opacity: 0.25,
              filter: "blur(28px)",
              pointerEvents: "none",
            }} />
            <div className="belly-float" style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 96, lineHeight: 1, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.10))" }}>{fruitEmoji}</span>
            </div>
          </div>

          <p className="belly-body" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14, padding: "0 6px" }}>
            {currentWeek >= 23 ? (
              <>Your baby can hear you now. Talk to them —<br /><em style={{ fontStyle: "italic", color: "var(--color-accent-primary)" }}>they already know your voice.</em></>
            ) : (
              emotionalFact
            )}
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <span className="pill-base pill-terra">{40 - currentWeek} weeks to go</span>
            <span className="pill-base pill-sage">Trimester {weekData.trimester}</span>
          </div>

          <ShareableMilestoneCard
            week={currentWeek}
            fruitEmoji={fruitEmoji}
            fruitName={fruitName}
            emotionalFact={emotionalFact}
          />
        </div>
      </div>

      {/* Today's Recipe mini-card */}
      <div style={{ padding: "0 20px", marginBottom: 22 }}>
        <button onClick={() => navigate("/recipes")} className="belly-card-interactive" style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)",
          borderLeft: "4px solid var(--color-accent-primary)", borderRadius: 18,
          padding: 14, textAlign: "left", cursor: "pointer",
        }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: "var(--color-sage-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🥗</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="section-label" style={{ fontSize: 10, marginBottom: 2 }}>TODAY'S RECIPE</p>
            <p className="font-serif-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>Iron-Rich Lentil & Spinach Bowl</p>
            <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 11, color: "var(--color-text-secondary)", marginTop: 3 }}>Week {currentWeek} · 5 min · Good for baby's brain</p>
            <span className="pill-base pill-sage" style={{ marginTop: 6, fontSize: 10, padding: "3px 10px" }}>Iron</span>
          </div>
          <span style={{ color: "var(--color-accent-primary)", fontSize: 22 }}>›</span>
        </button>
      </div>

      {/* Quick Navigate horizontal row */}
      <div style={{ marginBottom: 22 }}>
        <p className="section-label" style={{ padding: "0 20px", marginBottom: 10 }}>QUICK NAVIGATE</p>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "0 20px", overflowX: "auto" }}>
          {[
            { label: "Baby Size", to: "/baby", fill: "#EEF3EC", border: "#CBD7C8" },
            { label: "Ask Bella", to: "/ask", fill: "#FAE8DE", border: "#E5CFC0" },
            { label: "Recipes", to: "/recipes", fill: "#EEF3EC", border: "#CBD7C8" },
            { label: "Mamas", to: "/community", fill: "#FAE8DE", border: "#E5CFC0" },
          ].map(p => (
            <button key={p.label} onClick={() => navigate(p.to)}
              className="belly-btn-press"
              style={{
                flexShrink: 0, height: 36, padding: "0 16px",
                borderRadius: 18,
                background: p.fill,
                border: `0.5px solid ${p.border}`,
                color: "#C9622F",
                fontFamily: "'Outfit',system-ui",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick journey tiles */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <button onClick={() => navigate("/cant-sleep")} className="belly-card-interactive" style={{
          background: "#FDF9F4", border: "0.5px solid #E3D9CE",
          borderLeft: "3px solid #7A9E7E",
          borderRadius: 16, padding: 14, textAlign: "left", cursor: "pointer",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EEF3EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌙</div>
            <span style={{ color: "#7A9E7E", fontSize: 20 }}>›</span>
          </div>
          <div>
            <p className="font-serif-display" style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Can't sleep?</p>
            <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Guided breathing</p>
          </div>
        </button>
        <button onClick={() => navigate("/courses")} className="belly-card-interactive" style={{
          background: "#FDF9F4", border: "0.5px solid #E3D9CE",
          borderLeft: "3px solid #C9622F",
          borderRadius: 16, padding: 14, textAlign: "left", cursor: "pointer",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FAE8DE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
            <span style={{ color: "#C9622F", fontSize: 20 }}>›</span>
          </div>
          <div>
            <p className="font-serif-display" style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Your Courses</p>
            <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>3 in progress</p>
          </div>
        </button>
      </div>

      {/* Streak callout */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <button onClick={() => navigate("/me")} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: "var(--color-amber-soft)", border: "1px solid var(--color-border-default)",
          borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left",
        }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 13, fontWeight: 600, color: "var(--color-accent-dark)" }}>
            {streakDays}-day streak — keep it up!
          </span>
          <span style={{ marginLeft: "auto", color: "var(--color-accent-dark)" }}>›</span>
        </button>
      </div>

      </div>

      <p style={{ textAlign: "center", marginTop: 4, marginBottom: 0, padding: "0 20px", fontFamily: "'Outfit',system-ui", fontSize: 12, color: "var(--color-text-muted)" }}>
        Day {daysToGo > 0 ? 280 - daysToGo : 280} of your journey
      </p>
    </div>
  );
};

export default HomePage;
