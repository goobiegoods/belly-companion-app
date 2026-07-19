import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getDaysToGo } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Pencil, BookOpen, Baby, Wind, GraduationCap, ShoppingBag,
  Sprout, MessageCircle, Flame, Flower2, ChevronRight, Sparkles, Lock,
} from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { getStreak } from "@/lib/streak";
import { getDisplayName } from "@/lib/community";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";

const BADGES = [
  { Icon: Sprout, label: "First check-in", earned: true },
  { Icon: BookOpen, label: "First lesson", earned: true },
  { Icon: MessageCircle, label: "Community", earned: true },
  { Icon: Flame, label: "7-day streak", earned: false },
  { Icon: Flower2, label: "Week 20", earned: false },
  { Icon: Baby, label: "Birth ready", earned: false },
];

const formatName = (name: string) =>
  name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const CREAM_70 = "rgba(251,238,224,0.7)";
const CREAM_55 = "rgba(251,238,224,0.55)";

const Profile = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showPremium, setShowPremium] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDueDate, setEditDueDate] = useState(profile?.due_date || "");
  const [editName, setEditName] = useState(profile?.first_name || "");
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    if (!user?.id) return;
    getStreak(user.id).then((s) => s && setStreak(s));
  }, [user?.id]);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 0;
  const daysToGo = profile?.due_date ? getDaysToGo(profile.due_date) : 0;
  const earnedCount = BADGES.filter(b => b.earned).length;

  const handleSave = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ first_name: editName, due_date: editDueDate }).eq("user_id", user.id);
    await refreshProfile();
    setEditing(false);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const formatDueDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  const menuItems = [
    { Icon: Pencil, label: "Edit pregnancy details", action: () => setEditing(true) },
    { Icon: BookOpen, label: "Journal & Symptom Tracker", action: () => navigate("/journal") },
    { Icon: Baby, label: "Feeding tracker", action: () => navigate("/feeding") },
    { Icon: Wind, label: "Belly breathe & rest", action: () => navigate("/breathe") },
    { Icon: GraduationCap, label: "My Courses", action: () => navigate("/courses") },
    { Icon: ShoppingBag, label: "My Orders", action: () => navigate("/orders") },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 14,
    color: "var(--cream)",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    padding: "12px 14px",
    outline: "none",
    colorScheme: "dark",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--gold)",
    opacity: 0.85,
  };

  const stats = [
    { val: String(currentWeek), label: "week", color: "var(--gold)" },
    { val: String(streak.current), label: "day streak", color: "var(--cream)" },
    { val: String(daysToGo), label: "days to go", color: "var(--gold)" },
  ];

  return (
    <SceneBackground scene="mamas" className="page-enter">
      <GhHeader
        brand="Your profile"
        tag={`week ${currentWeek} · ${daysToGo} days to go`}
        brandSize={20}
        showOrb
        weekPill={`wk ${currentWeek}`}
      >
        <div style={{ position: "relative", zIndex: 2, marginTop: 16 }}>
          <div className="font-gh-serif" style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: "var(--cream)", lineHeight: 1.15 }}>
            {formatName(getDisplayName({ first_name: profile?.first_name }))}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", color: CREAM_70, marginTop: 6 }}>
            due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
          </div>
          {profile?.pregnancy_number && (
            <span
              style={{
                display: "inline-block", marginTop: 10, padding: "5px 12px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                color: "var(--cream)", borderRadius: 999,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.08em",
              }}
            >
              {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
            </span>
          )}
        </div>
      </GhHeader>

      <div style={{ padding: "12px 18px 110px" }}>
        {/* Premium banner */}
        {profile?.is_premium ? (
          <div
            className="gh-glass"
            style={{
              borderRadius: 18, padding: "14px 16px", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 12,
              border: "1px solid rgba(242,182,71,0.4)",
            }}
          >
            <Sparkles size={20} color="var(--gold)" strokeWidth={1.8} />
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15, fontWeight: 600, color: "var(--gold)" }}>
              You're a Premium mama
            </p>
          </div>
        ) : (
          <button
            className="belly-btn-press"
            onClick={() => setShowPremium(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              borderRadius: 18, padding: "14px 16px", border: "none", cursor: "pointer",
              textAlign: "left", marginBottom: 12,
              boxShadow: "0 10px 26px -10px rgba(232,98,46,0.6)",
            }}
          >
            <Sparkles size={22} color="var(--night)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--night)", lineHeight: 1.2 }}>
                Upgrade to Pro
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "rgba(21,10,31,0.75)", marginTop: 2 }}>
                Unlimited doula access + all courses
              </p>
            </div>
            <span
              style={{
                background: "var(--night)", color: "var(--gold)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
                padding: "8px 13px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              go pro
            </span>
          </button>
        )}

        {/* Stats + streak */}
        <GlassCard>
          <div className="gh-section-label">where you are</div>
          <div style={{ display: "flex" }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1, textAlign: "center", padding: "2px 4px 4px",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}
              >
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 600, lineHeight: 1.1, color: s.color }}>
                  {s.val}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: CREAM_55, marginTop: 6 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 14, paddingTop: 13 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--cream)" }}>
              {streak.current === 0 ? "Start your streak today" : `${streak.current}-day streak going`}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: CREAM_70, marginTop: 2 }}>
              Check in tomorrow to keep it going
            </p>
            <div className="gh-progress-track" style={{ marginTop: 10 }}>
              <div
                className="gh-progress-fill"
                style={{ width: `${Math.min(100, (streak.current / 7) * 100)}%`, transition: "width 300ms" }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Achievements */}
        <GlassCard>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div className="gh-section-label" style={{ marginBottom: 0 }}>achievements</div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: CREAM_55 }}>
              {earnedCount} of {BADGES.length}
            </span>
          </div>
          <div className="gh-progress-track" style={{ margin: "10px 0 14px" }}>
            <div className="gh-progress-fill" style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {BADGES.map(badge => (
              <div
                key={badge.label}
                className="gh-glass-subtle"
                style={{
                  position: "relative", padding: "12px 6px 10px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  opacity: badge.earned ? 1 : 0.4,
                  border: badge.earned ? "1px solid rgba(242,182,71,0.35)" : undefined,
                }}
              >
                <badge.Icon
                  size={22}
                  color={badge.earned ? "var(--gold)" : "var(--cream)"}
                  strokeWidth={1.8}
                />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 500, textAlign: "center", lineHeight: 1.25, color: "var(--cream)" }}>
                  {badge.label}
                </span>
                {!badge.earned && (
                  <Lock
                    size={10}
                    color={CREAM_55}
                    strokeWidth={1.8}
                    style={{ position: "absolute", top: 6, right: 6 }}
                  />
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Edit form (inline above menu when editing) */}
        {editing && (
          <GlassCard>
            <div className="gh-section-label">edit details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Due date</label>
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setEditing(false)}
                  className="belly-btn-press"
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 14,
                    background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                    color: CREAM_70, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="belly-btn-press"
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 14,
                    background: "linear-gradient(135deg, var(--gold), var(--ember))",
                    color: "var(--night)", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Menu list */}
        <div className="gh-section-label" style={{ margin: "4px 2px 9px" }}>your tools</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {menuItems.map((row) => (
            <button
              key={row.label}
              onClick={row.action}
              className="gh-glass-subtle belly-btn-press"
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", cursor: "pointer", textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 34, height: 34, borderRadius: 11,
                  background: "rgba(242,182,71,0.14)", border: "1px solid rgba(242,182,71,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <row.Icon size={16} color="var(--gold)" strokeWidth={1.8} />
              </div>
              <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: "var(--cream)" }}>
                {row.label}
              </span>
              <ChevronRight size={16} color={CREAM_55} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="belly-btn-press"
          style={{
            width: "100%", padding: "13px 0", borderRadius: 14,
            background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
            color: "var(--cream)", fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </SceneBackground>
  );
};

export default Profile;
