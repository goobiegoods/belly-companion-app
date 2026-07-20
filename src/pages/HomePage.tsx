import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { recipes } from "@/data/recipesData";
import { getBreathingStreak } from "@/lib/breathingStreak";
import { SceneBackground, GhHeader, GlassCard, BellaOrb, SlideToNight } from "@/components/golden";
import {
  Baby,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  MessageCircle,
  UtensilsCrossed,
  Wind,
} from "lucide-react";

const SUGGESTIONS = ["Round ligament?", "Foods to avoid"];

function greetingWord(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

/** Subtle accent glow: soft box-shadow + faint 1px border tint. */
const glow = (r: number, g: number, b: number): React.CSSProperties => ({
  boxShadow: `0 0 24px -6px rgba(${r},${g},${b},0.35)`,
  border: `1px solid rgba(${r},${g},${b},0.38)`,
});

const TEAL_GLOW = glow(44, 156, 143);
const EMBER_GLOW = glow(232, 98, 46);
const MAGENTA_GLOW = glow(181, 56, 107);
const GOLD_GLOW = glow(242, 182, 71);

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

interface FeedPost {
  id: string;
  title: string;
  category: string;
  created_at: string;
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
  const { user, profile } = useAuth();

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekData = getWeekData(currentWeek);
  const weeksToGo = Math.max(0, 40 - currentWeek);
  const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
  const name = titleCase((profile?.first_name || "").split(" ")[0]) || "mama";

  // Breathing streak — same source BellyBreathe/Profile use (breathing_streak table).
  const [breathStreak, setBreathStreak] = useState<number | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getBreathingStreak(user.id).then(({ current }) => {
      if (!cancelled) setBreathStreak(current);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  // Deterministic daily recipe pick from this week's matched recipes.
  const todaysRecipe = useMemo(() => {
    const matched = recipes.filter(
      (r) => currentWeek >= r.weekRange[0] && currentWeek <= r.weekRange[1]
    );
    const pool = matched.length > 0 ? matched : recipes;
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return pool[dayOfYear % pool.length];
  }, [currentWeek]);

  // Recent community posts.
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("posts")
      .select("id, title, category, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!cancelled) setPosts((data as FeedPost[]) ?? []);
      });
    return () => { cancelled = true; };
  }, []);

  const goToAsk = (prefill?: string) =>
    navigate("/ask", { state: prefill ? { prefill } : undefined });

  const cardTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, margin: 0 };
  const subText: React.CSSProperties = { fontSize: 12.5, color: "rgba(251,238,224,0.72)" };

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
        {/* 2. Ask your doula */}
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

        {/* 3. Your baby this week — teal */}
        <GlassCard onClick={() => navigate("/baby")} style={{ ...TEAL_GLOW, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "rgba(44,156,143,0.24)", border: "1px solid rgba(44,156,143,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Baby size={22} strokeWidth={1.8} color="var(--teal)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="gh-section-label" style={{ marginBottom: 3 }}>your baby this week</div>
              <p className="font-gh-serif" style={cardTitle}>
                Size of a {weekData.babySize.toLowerCase()}
              </p>
            </div>
            <ChevronRight size={18} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {weekData.babyLength !== "N/A" && (
              <span className="gh-pill" style={{ fontSize: 11.5, padding: "5px 11px", cursor: "default" }}>
                {weekData.babyLength} long
              </span>
            )}
            {weekData.babyWeight !== "N/A" && (
              <span className="gh-pill" style={{ fontSize: 11.5, padding: "5px 11px", cursor: "default" }}>
                {weekData.babyWeight}
              </span>
            )}
            <span className="gh-pill" style={{ fontSize: 11.5, padding: "5px 11px", cursor: "default" }}>
              week {currentWeek}
            </span>
          </div>
          <p style={{ ...subText, margin: "11px 0 0", lineHeight: 1.5 }}>
            {weekData.developmentHighlight}
          </p>
        </GlassCard>

        {/* 4. Belly breathe — ember */}
        <GlassCard onClick={() => navigate("/breathe")} style={{ ...EMBER_GLOW, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              className="font-gh-mono"
              style={{
                fontSize: 15, fontWeight: 600, background: "rgba(232,98,46,0.22)",
                border: "1px solid rgba(232,98,46,0.4)",
                width: 50, height: 50, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              4·7·8
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, display: "block" }}>
                Belly breathe
              </b>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Calm your body in 60 seconds</span>
            </div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20,
                background: "rgba(232,98,46,0.2)", border: "1px solid rgba(232,98,46,0.4)",
              }}
            >
              {breathStreak !== null && breathStreak > 0 ? (
                <>
                  <Flame size={13} strokeWidth={1.8} color="var(--ember)" />
                  {breathStreak}-day
                </>
              ) : (
                <>
                  <Wind size={13} strokeWidth={1.8} color="var(--ember)" />
                  start
                </>
              )}
            </div>
          </div>
          {breathStreak !== null && breathStreak > 0 && (
            <p style={{ ...subText, margin: "10px 0 0" }}>
              {breathStreak === 1 ? "1 day in a row — keep the calm going." : `${breathStreak} days in a row — keep the calm going.`}
            </p>
          )}
        </GlassCard>

        {/* 5. Today's nourishment — magenta/rose */}
        {todaysRecipe && (
          <GlassCard
            onClick={() => navigate(`/recipes/${todaysRecipe.id}`)}
            style={{ ...MAGENTA_GLOW, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(181,56,107,0.24)", border: "1px solid rgba(181,56,107,0.42)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <UtensilsCrossed size={20} strokeWidth={1.8} color="var(--magenta)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="gh-section-label" style={{ marginBottom: 3 }}>today's nourishment</div>
                <p className="font-gh-serif" style={cardTitle}>{todaysRecipe.title}</p>
              </div>
              <ChevronRight size={18} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span
                className="gh-pill"
                style={{
                  fontSize: 11.5, padding: "5px 11px", cursor: "default",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
              >
                <Clock size={12} strokeWidth={1.8} /> {todaysRecipe.prepTime} min
              </span>
              {todaysRecipe.vitamins.slice(0, 2).map((v) => (
                <span
                  key={v.name}
                  className="gh-pill"
                  style={{
                    fontSize: 11.5, padding: "5px 11px", cursor: "default",
                    background: "rgba(181,56,107,0.18)", border: "1px solid rgba(181,56,107,0.4)",
                  }}
                >
                  {v.name} {v.amount}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        {/* 6. What's happening — community */}
        <GlassCard onClick={() => navigate("/community")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: posts && posts.length > 0 ? 12 : 0 }}>
            <MessageCircle size={18} strokeWidth={1.8} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div className="gh-section-label" style={{ marginBottom: 0, flex: 1 }}>what's happening</div>
            <ChevronRight size={18} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
          </div>
          {posts === null ? (
            <p style={{ ...subText, margin: "10px 0 0" }}>Checking in with the mamas…</p>
          ) : posts.length === 0 ? (
            <p style={{ ...subText, margin: "10px 0 0" }}>
              It's quiet right now — be the first to share with the mamas.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="gh-glass-subtle"
                  style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13.5, fontWeight: 500, margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </p>
                    <span
                      className="font-gh-mono"
                      style={{ fontSize: 10.5, color: "rgba(251,238,224,0.6)", textTransform: "capitalize" }}
                    >
                      {p.category} · {relativeTime(p.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* 7. Learn — gold */}
        <GlassCard onClick={() => navigate("/learn")} style={{ ...GOLD_GLOW, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "rgba(242,182,71,0.2)", border: "1px solid rgba(242,182,71,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <GraduationCap size={21} strokeWidth={1.8} color="var(--gold)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="gh-section-label" style={{ marginBottom: 3 }}>learn</div>
              <p className="font-gh-serif" style={cardTitle}>Bite-size lessons for week {currentWeek}</p>
              <p style={{ ...subText, margin: "3px 0 0" }}>
                Two minutes a day, from birth prep to baby care.
              </p>
            </div>
            <ChevronRight size={18} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
          </div>
        </GlassCard>

        {/* 8. This week's milestones */}
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

        {/* 9. Can't sleep — slide to unlock night mode */}
        <div style={{ marginTop: 18 }}>
          <SlideToNight />
        </div>
      </div>
    </SceneBackground>
  );
}
