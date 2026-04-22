import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getDaysToGo, getWeekData } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PremiumModal } from "@/components/PremiumModal";

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

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 0;
  const daysToGo = profile?.due_date ? getDaysToGo(profile.due_date) : 0;
  const initials = (profile?.first_name || "M").charAt(0).toUpperCase();

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

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase",
    letterSpacing: "0.1em", marginBottom: 8, color: "rgba(255,255,255,0.50)", fontWeight: 600
  };

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ backgroundColor: "#FF8C42", minHeight: "100vh" }}>
      {/* Topbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 20px 0" }}>
        <button onClick={() => setEditing(true)} style={{
          fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 500,
          color: "rgba(255,255,255,0.60)", background: "none", border: "none", cursor: "pointer"
        }}>Settings</button>
      </div>

      {/* Hero — no card wrapper, sits on orange */}
      <div style={{ padding: "40px 20px 16px", textAlign: "center" }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%", background: "white",
          boxShadow: "0 0 0 4px rgba(255,255,255,0.28), 0 0 0 8px rgba(255,255,255,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 10px"
        }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700, color: "#FF6520" }}>{initials}</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>
          {formatName(profile?.first_name || "Mama")}
        </h1>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
          Week {currentWeek} · Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span style={{
            display: "inline-block", marginTop: 8, fontFamily: "'Outfit', system-ui",
            fontSize: 11, fontWeight: 600, color: "white", padding: "4px 14px",
            borderRadius: 20, background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)"
          }}>
            {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-2 px-5 mb-5">
        {[
          { label: "WEEK", value: currentWeek, tight: false },
          { label: "DAYS TO GO", value: daysToGo, tight: false },
          { label: "STREAK", value: "3 🔥", tight: true },
        ].map(stat => (
          <div key={stat.label} className="flex-1 text-center" style={{
            background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 16, padding: "14px 8px", backdropFilter: "blur(14px)"
          }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: stat.tight ? -1 : -0.5 }}>{stat.value}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="px-5 mb-5">
        <p style={sectionLabelStyle}>MY ACHIEVEMENTS</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {BADGES.map(badge => (
            <div key={badge.label} className="flex flex-col items-center relative" style={{
              minWidth: 64, borderRadius: 14, padding: "10px 8px",
              background: badge.earned ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.22)",
              opacity: badge.earned ? 1 : 0.4,
            }}>
              <span style={{ fontSize: 22, marginBottom: 4, filter: badge.earned ? "none" : "grayscale(100%)" }}>{badge.emoji}</span>
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, fontWeight: 600, textAlign: "center", lineHeight: 1.2, color: "white" }}>{badge.label}</span>
              {!badge.earned && <span style={{ position: "absolute", bottom: 4, right: 4, fontSize: 10 }}>🔒</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* My Journey */}
        <div>
          <p style={sectionLabelStyle}>MY JOURNEY</p>
          {editing ? (
            <div className="rounded-[16px] p-4 space-y-3" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)" }}>
              <div>
                <label style={{ ...sectionLabelStyle, display: "block", marginBottom: 4 }}>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm belly-input-focus" style={{ background: "var(--input-bg)", border: "none", color: "#3A1A00", fontFamily: "'Outfit', system-ui" }} />
              </div>
              <div>
                <label style={{ ...sectionLabelStyle, display: "block", marginBottom: 4 }}>Due date</label>
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm belly-input-focus" style={{ background: "var(--input-bg)", border: "none", color: "#3A1A00", fontFamily: "'Outfit', system-ui" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-[10px] text-sm belly-btn-press" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)", color: "white", fontFamily: "'Outfit', system-ui" }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 h-10 rounded-[20px] text-sm font-semibold belly-btn-primary" style={{ background: "white", color: "#FF6520", fontFamily: "'Outfit', system-ui", fontWeight: 700 }}>Save</button>
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 18, overflow: "hidden" }}>
              {[
                { icon: "✏️", label: "Edit pregnancy details", action: () => setEditing(true) },
                { icon: "📔", label: "Journal & Symptom Tracker", action: () => navigate("/journal") },
                { icon: "📚", label: "My Courses", action: () => navigate("/courses") },
                { icon: "🛍️", label: "My Orders", action: () => navigate("/orders") },
              ].map((row, idx, arr) => (
                <button key={row.label} onClick={row.action} style={{
                  width: "100%",
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: idx === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    flexShrink: 0,
                  }}>{row.icon}</div>
                  <span style={{ flex: 1, textAlign: "left", fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 500, color: "white" }}>{row.label}</span>
                  <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 18, color: "rgba(255,255,255,0.35)" }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Premium */}
        <div>
          <p style={sectionLabelStyle}>PREMIUM</p>
          {profile?.is_premium ? (
            <div className="rounded-[20px] p-4 text-center" style={{ background: "rgba(255,255,255,0.24)", border: "1.5px solid rgba(255,255,255,0.40)" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: "white" }}>You're a Premium mama! 🌟</p>
            </div>
          ) : (
            <button onClick={() => setShowPremium(true)} className="w-full text-left belly-card-interactive" style={{
              background: "rgba(255,255,255,0.24)", border: "1.5px solid rgba(255,255,255,0.40)",
              borderRadius: 20, padding: "15px 14px"
            }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>⭐</div>
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white" }}>Upgrade to Pro</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.62)" }}>All courses + unlimited doula access</p>
                </div>
              </div>
              <ul className="space-y-1 mb-3 ml-[52px]">
                {["Unlimited AI doula messages", "All premium courses", "Ad-free experience"].map(b => (
                  <li key={b} style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.62)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <div className="ml-[52px]">
                <span style={{
                  fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 700,
                  background: "white", color: "#FF6520", borderRadius: 20,
                  padding: "8px 18px", display: "inline-block",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.10)"
                }}>Go Pro →</span>
              </div>
            </button>
          )}
        </div>

        {/* Account */}
        <div>
          <p style={sectionLabelStyle}>ACCOUNT</p>
          <button onClick={handleSignOut} className="w-full text-left" style={{
            background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 16, padding: "13px 14px",
            fontFamily: "'Outfit', system-ui", fontSize: 13, color: "rgba(255,255,255,0.60)"
          }}>
            Sign out
          </button>
        </div>
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default Profile;
