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
    if (!user) return;
    getStreak(user.id).then((s) => s && setStreakDays(s.current));
  }, [user]);

  const goToAsk = (prefill?: string) => {
    navigate("/ask", { state: prefill ? { prefill } : undefined });
  };

  const fruitEmoji = weekData.emoji || "🌱";
  const fruitName = weekData.babySize.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();

  const emotionalFact = currentWeek >= 23
    ? "Your baby can hear you now. Talk to them — they already know your voice."
    : weekData.developmentHighlight.split(/(?<=\.)\s/)[0];

  return (
    <div className="min-h-screen page-enter" style={{ background: "var(--color-bg-base)", paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤰</div>
          <div>
            <h1 className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--color-accent-primary)", lineHeight: 1, letterSpacing: -0.5 }}>belly</h1>
            <p className="belly-caps" style={{ marginTop: 2, fontSize: 9 }}>Virtual Doula</p>
          </div>
        </div>
        <p className="belly-support" style={{ fontWeight: 500 }}>Hi {displayName} 💛</p>
      </div>

      {/* Hero card */}
      <div style={{ padding: "0 20px", marginBottom: 28 }}>
        <div style={{
          background: "var(--color-bg-card)",
          borderRadius: 20,
          padding: 18,
          border: "1px solid var(--color-border-default)",
          boxShadow: "0 6px 22px rgba(244,123,32,0.10), 0 0 0 1px rgba(244,123,32,0.05)",
          position: "relative",
        }}>
          {/* Bella row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--color-accent-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🌸</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Bella</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "livePulse 2s infinite" }} />
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>online now · replies in seconds</span>
            </div>
          </div>

          {/* Headline */}
          <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 28, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.05 }}>Ask your</p>
          <p className="font-display" style={{ fontSize: 34, fontStyle: "italic", color: "var(--color-accent-primary)", letterSpacing: -1, lineHeight: 1.05, marginBottom: 10 }}>doula anything</p>
          <p className="belly-support" style={{ marginBottom: 14 }}>
            Natural guidance for your body, your week, your worries — no waiting rooms, no judgment.
          </p>

          {/* Search input */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 18, height: 52, padding: "0 6px 0 18px",
          }}>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToAsk(searchValue)}
              placeholder="Cramps, sleep, what's normal..."
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontFamily: "'Outfit',system-ui", fontSize: 15, color: "var(--color-text-primary)",
              }}
            />
            <button onClick={() => goToAsk(searchValue || undefined)} aria-label="Ask Bella" style={{
              width: 40, height: 40, borderRadius: "50%", border: "none",
              background: "var(--color-accent-primary)", display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 3px 10px rgba(244,123,32,0.35)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Suggestion chips — single horizontal scroll row */}
          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", flexWrap: "nowrap" }}>
            {SUGGESTION_CHIPS.map(chip => (
              <button key={chip} onClick={() => goToAsk(chip)} className="v2-chip" style={{ flexShrink: 0 }}>{chip}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Week card — centered vertical stack */}
      <div style={{ padding: "0 20px", marginBottom: 28 }}>
        <div className="v2-card" style={{ padding: "20px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <p className="belly-caps" style={{ textAlign: "center" }}>YOU'RE IN</p>
          <p className="font-display" style={{ fontSize: 44, fontStyle: "italic", color: "var(--color-accent-primary)", lineHeight: 1, letterSpacing: -1, marginTop: 4, marginBottom: 14 }}>
            week {currentWeek}
          </p>

          <div style={{ width: 130, height: 130, borderRadius: "50%", background: "#FFF0E0", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }} className="belly-float">
            <span style={{ fontSize: 100, lineHeight: 1, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.10))" }}>{fruitEmoji}</span>
          </div>

          <p className="belly-body" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14, padding: "0 6px" }}>
            {currentWeek >= 23 ? (
              <>Your baby can hear you now. Talk to them —<br /><em style={{ fontStyle: "italic", color: "var(--color-accent-primary)" }}>they already know your voice.</em></>
            ) : (
              emotionalFact
            )}
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
            <span style={{
              borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 500,
              border: "1px solid var(--color-accent-primary)", color: "var(--color-accent-primary)",
            }}>{40 - currentWeek} weeks to go</span>
            <span style={{
              borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 500,
              border: "1px solid var(--color-accent-primary)", color: "var(--color-accent-primary)",
            }}>Trimester {weekData.trimester}</span>
          </div>

          <ShareableMilestoneCard
            week={currentWeek}
            fruitEmoji={fruitEmoji}
            fruitName={fruitName}
            emotionalFact={emotionalFact}
          />
        </div>
      </div>

      {/* Quick journey tiles */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate("/cant-sleep")} className="v2-card belly-card-interactive" style={{ padding: 16, textAlign: "left", border: "1px solid var(--color-border-default)" }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🌙</div>
          <p style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Can't sleep?</p>
          <p className="belly-support" style={{ marginTop: 2 }}>Guided breathing</p>
        </button>
        <button onClick={() => navigate("/courses")} className="v2-card belly-card-interactive" style={{ padding: 16, textAlign: "left" }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>📚</div>
          <p style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>Your Courses</p>
          <p className="belly-support" style={{ marginTop: 2 }}>3 in progress</p>
        </button>
      </div>

      {/* Streak callout above bottom nav */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <button onClick={() => navigate("/me")} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: "var(--color-accent-light)", border: "none",
          borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left",
        }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 13, fontWeight: 600, color: "var(--color-accent-dark)" }}>
            {streakDays}-day streak — keep it up!
          </span>
          <span style={{ marginLeft: "auto", color: "var(--color-accent-dark)" }}>›</span>
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: 4, marginBottom: 0, padding: "0 20px" }} className="belly-support">
        Day {daysToGo > 0 ? 280 - daysToGo : 280} of your journey
      </p>
    </div>
  );
};

export default HomePage;
