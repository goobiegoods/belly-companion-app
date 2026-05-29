import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getDaysToGo } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, BookOpen, Baby, Wind, GraduationCap, ShoppingBag } from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { getStreak } from "@/lib/streak";
import { getDisplayName } from "@/lib/community";

const BADGES = [
  { emoji: "🌱", label: "First check-in", earned: true },
  { emoji: "📚", label: "First lesson", earned: true },
  { emoji: "💬", label: "Community", earned: true },
  { emoji: "🔥", label: "7-day streak", earned: false },
  { emoji: "🌸", label: "Week 20", earned: false },
  { emoji: "👶", label: "Birth ready", earned: false },
];

const formatName = (name: string) =>
  name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

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
    toast.success("Profile updated! 🌸");
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

  return (
    <div className="min-h-screen pb-24 page-enter" style={{ backgroundColor: "var(--color-bg-base)" }}>
      {/* Pulse ring keyframes (scoped) */}
      <style>{`
        @keyframes belly-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(232,96,26,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(232,96,26,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,96,26,0); }
        }
      `}</style>

      {/* Topbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 20px 0" }}>
        <button onClick={() => setEditing(true)} style={{
          fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 500,
          color: "var(--color-text-primary)", background: "none", border: "none", cursor: "pointer"
        }}>Settings</button>
      </div>

      {/* 1. Profile header */}
      <div style={{ padding: "16px 20px 18px", textAlign: "center", position: "relative" }}>
        <span aria-hidden style={{
          position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
          fontSize: 68, fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 800,
          color: "#E8601A", opacity: 0.08, pointerEvents: "none", letterSpacing: "-0.04em", zIndex: 0,
        }}>journey</span>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#E8601A",
          margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 18px rgba(232,96,26,0.32)", position: "relative", zIndex: 1,
        }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 800, fontSize: 28, color: "#FFFFFF" }}>B</span>
        </div>
        <h1 style={{ fontFamily: "'Nunito',system-ui", fontSize: 16, fontWeight: 800, color: "#1A0E06", position: "relative", zIndex: 1 }}>
          {formatName(getDisplayName({ first_name: profile?.first_name }))}
        </h1>
        <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 11, color: "#9A7B66", marginTop: 4, position: "relative", zIndex: 1 }}>
          Week {currentWeek} · Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span style={{
            display: "inline-block", marginTop: 10, padding: "4px 10px",
            background: "#FFFFFF", border: "1px solid #E8601A", color: "#E8601A",
            borderRadius: 999, fontSize: 10, fontWeight: 700,
            fontFamily: "'Outfit',system-ui", position: "relative", zIndex: 1,
          }}>
            {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
          </span>
        )}
      </div>

      {/* 2. Upgrade to Pro banner */}
      <div className="px-3 mb-3">
        {profile?.is_premium ? (
          <div style={{
            background: "linear-gradient(135deg, #E8601A, #f07840)", borderRadius: 18,
            padding: "14px 16px", textAlign: "center",
            boxShadow: "0 6px 18px rgba(232,96,26,0.25)",
          }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>
              You're a Premium mama! 🌟
            </p>
          </div>
        ) : (
          <button onClick={() => setShowPremium(true)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            background: "linear-gradient(135deg, #E8601A, #f07840)", borderRadius: 18,
            padding: "14px 16px", border: "none", cursor: "pointer", textAlign: "left",
            boxShadow: "0 6px 18px rgba(232,96,26,0.25)",
          }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>⭐</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 15, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
                Upgrade to Pro
              </p>
              <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 11, color: "#FFFFFF", opacity: 0.9, marginTop: 2 }}>
                Unlimited doula access + all courses
              </p>
            </div>
            <span style={{
              background: "#FFFFFF", color: "#E8601A", fontFamily: "'Outfit',system-ui",
              fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 20,
              flexShrink: 0, whiteSpace: "nowrap",
            }}>Go Pro →</span>
          </button>
        )}
      </div>

      {/* 3. My Journey progress bar */}
      <div className="px-3 mb-3">
        <div style={{ background: "#FFFFFF", border: "1px solid #FFD4B8", borderRadius: 16, padding: 14 }}>
          <p style={{
            fontFamily: "'Outfit',system-ui", fontSize: 10, fontWeight: 700,
            color: "#E8601A", letterSpacing: "0.12em", marginBottom: 12,
          }}>MY JOURNEY</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            {[1, 12, currentWeek, 40].map((w, i, arr) => {
              const isCurrent = w === currentWeek;
              const isPast = w <= currentWeek;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                  {i < arr.length - 1 && (
                    <span style={{
                      position: "absolute", top: 6, left: "50%", right: "-50%", height: 2,
                      background: arr[i + 1] <= currentWeek ? "#E8601A" : "#F0E4DA",
                    }} />
                  )}
                  <span style={{
                    width: isCurrent ? 13 : 8, height: isCurrent ? 13 : 8, borderRadius: "50%",
                    background: isPast ? "#E8601A" : "#F0E4DA",
                    position: "relative", zIndex: 1,
                    animation: isCurrent ? "belly-pulse-ring 1.8s ease-out infinite" : "none",
                  }} />
                  <p style={{
                    fontFamily: "'Outfit',system-ui", fontSize: 9.5, fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? "#E8601A" : "#C0A888", marginTop: 8,
                  }}>Wk {w}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Motivational message */}
      <div className="px-3 mb-3">
        <div style={{
          background: "#FDE8D8", border: "1px solid rgba(232,112,42,0.22)",
          borderRadius: 14, padding: "12px 14px",
        }}>
          <p style={{
            fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 400,
            fontSize: 13, color: "#A84818", lineHeight: 1.55, textAlign: "left",
          }}>
            You're doing amazing, mama. {daysToGo} days left — every one counts. 🌸
          </p>
        </div>
      </div>

      {/* 5. Combined Stats + Streak gradient card */}
      <div className="px-3 mb-4">
        <div style={{
          background: "linear-gradient(135deg, #E8601A, #f07840)", borderRadius: 20,
          boxShadow: "0 8px 22px rgba(232,96,26,0.25)", overflow: "hidden", color: "#FFFFFF",
        }}>
          {/* Top: 3 stats */}
          <div style={{ display: "flex", padding: "16px 8px" }}>
            {[
              { val: String(currentWeek), label: "WEEK" },
              { val: String(daysToGo), label: "DAYS TO GO" },
              { val: `🔥${streak.current}`, label: "DAY STREAK" },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: "center", padding: "0 4px",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.25)" : "none",
              }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.5 }}>
                  {s.val}
                </p>
                <p style={{
                  fontFamily: "'Outfit',system-ui", fontSize: 9.5, fontWeight: 700,
                  letterSpacing: "0.14em", opacity: 0.9, marginTop: 4,
                }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* Bottom: streak progress */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.25)", padding: "14px 16px" }}>
            <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
              {streak.current === 0 ? "Start your streak today" : `${streak.current}-day streak going`}
            </p>
            <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 11, color: "#FFFFFF", opacity: 0.9, marginTop: 2 }}>
              Check in tomorrow to keep it going
            </p>
            <div style={{ height: 6, borderRadius: 50, background: "rgba(255,255,255,0.25)", marginTop: 10, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(100, (streak.current / 7) * 100)}%`,
                background: "#FFFFFF", borderRadius: 50, transition: "width 300ms",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Achievements */}
      <div className="px-3 mb-4">
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <p style={{ fontFamily: "'Outfit',system-ui", fontSize: 10, fontWeight: 700, color: "#E8601A", letterSpacing: "0.12em" }}>
            MY ACHIEVEMENTS
          </p>
          <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 11, color: "#9A7B66" }}>
            {earnedCount} of {BADGES.length} unlocked
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 50, background: "#FDE8D8", marginBottom: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(earnedCount / BADGES.length) * 100}%`, background: "#E8601A", borderRadius: 50 }} />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {BADGES.map(badge => (
            <div key={badge.label} className="flex flex-col items-center relative" style={{
              minWidth: 64, borderRadius: 14, padding: "10px 8px",
              background: badge.earned ? "#FDE8D8" : "#FFFFFF",
              border: badge.earned ? "1px solid #FFD4B8" : "1px solid #F0E4DA",
              boxShadow: badge.earned ? "0 0 0 2px #FFE0C7, 0 4px 14px rgba(232,96,26,0.18)" : "none",
              opacity: badge.earned ? 1 : 0.45,
            }}>
              <span style={{ fontSize: 22, marginBottom: 4, filter: badge.earned ? "none" : "grayscale(100%)" }}>{badge.emoji}</span>
              <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 9, fontWeight: 600, textAlign: "center", lineHeight: 1.2, color: "#1A0E06" }}>{badge.label}</span>
              {!badge.earned && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, lineHeight: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}>🔒</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit form (inline above menu when editing) */}
      {editing && (
        <div className="px-3 mb-3">
          <div className="rounded-[16px] p-4 space-y-3" style={{ background: "#FFFFFF", border: "1px solid #F0E4DA" }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontFamily: "'Outfit',system-ui", fontSize: 10, fontWeight: 700, color: "#9A7B66", letterSpacing: "0.1em", textTransform: "uppercase" }}>Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm" style={{ background: "var(--input-bg)", border: "none", fontFamily: "'Outfit',system-ui" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontFamily: "'Outfit',system-ui", fontSize: 10, fontWeight: 700, color: "#9A7B66", letterSpacing: "0.1em", textTransform: "uppercase" }}>Due date</label>
              <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm" style={{ background: "var(--input-bg)", border: "none", fontFamily: "'Outfit',system-ui" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-[10px] text-sm" style={{ background: "#FFFFFF", border: "1px solid #F0E4DA", color: "#9A7B66", fontFamily: "'Outfit',system-ui" }}>Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-[20px] text-sm" style={{ background: "#E8601A", color: "#FFFFFF", fontFamily: "'Outfit',system-ui", fontWeight: 700, border: "none" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Menu list */}
      <div className="px-3 mb-5">
        <div style={{ background: "#FFFFFF", border: "1px solid #F0E4DA", borderRadius: 18, overflow: "hidden" }}>
          {menuItems.map((row, idx, arr) => (
            <button key={row.label} onClick={row.action} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", background: "transparent", border: "none",
              borderBottom: idx === arr.length - 1 ? "none" : "1px solid #F5EBE0",
              cursor: "pointer",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: "#FDE8D8",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <row.Icon size={16} color="#E8601A" strokeWidth={2.2} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontFamily: "'Outfit',system-ui", fontSize: 14, fontWeight: 500, color: "#1A0E06" }}>
                {row.label}
              </span>
              <span style={{ fontFamily: "'Outfit',system-ui", fontSize: 18, color: "#C0907A" }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 8. Subtle sign out */}
      <div style={{ textAlign: "center", padding: "8px 20px 12px" }}>
        <button onClick={handleSignOut} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Outfit',system-ui", fontSize: 12, color: "#9A7B66",
          textDecoration: "underline", textUnderlineOffset: 3,
        }}>
          Sign out
        </button>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default Profile;
