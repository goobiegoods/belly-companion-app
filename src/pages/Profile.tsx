import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getDaysToGo, getWeekData } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BADGES = [
  { emoji: "🌱", label: "First check-in", earned: true },
  { emoji: "📚", label: "First lesson", earned: true },
  { emoji: "💬", label: "Community", earned: true },
  { emoji: "🔥", label: "7-day streak", earned: false },
  { emoji: "🌸", label: "Week 20", earned: false },
  { emoji: "👶", label: "Birth ready", earned: false },
];

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
  const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

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

  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      {/* Hero */}
      <div className="rounded-b-[24px] px-5 pt-8 pb-6 text-center" style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)", borderTop: "none" }}>
        <div className="mx-auto mb-3 flex items-center justify-center"
          style={{ width: 70, height: 70, borderRadius: "50%", background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.25)" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: "#FF6520" }}>{initials}</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: "white" }}>{titleCase(profile?.first_name || "Mama")}</h1>
        <p className="text-[11px] mt-1" style={{ color: "var(--w50)", fontFamily: "'Outfit', system-ui" }}>
          Week {currentWeek} • Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span className="inline-block mt-2 text-[10px] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontFamily: "'Outfit', system-ui" }}>
            {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-2 px-5 -mt-3 mb-5">
        {[
          { label: "Week", value: currentWeek },
          { label: "Days to go", value: daysToGo },
          { label: "Streak", value: "3🔥" },
        ].map(stat => (
          <div key={stat.label} className="flex-1 rounded-[14px] p-3 text-center" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: "white", letterSpacing: -1 }}>{stat.value}</p>
            <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="px-5 mb-5">
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>MY ACHIEVEMENTS</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {BADGES.map(badge => (
            <div key={badge.label} className="rounded-[12px] p-2.5 flex flex-col items-center min-w-[60px] relative"
              style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", opacity: badge.earned ? 1 : 0.22, filter: badge.earned ? "none" : "grayscale(1)" }}>
              <span className="text-[20px] mb-1">{badge.emoji}</span>
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, textAlign: "center", lineHeight: 1.2, color: "var(--w70)" }}>{badge.label}</span>
              {!badge.earned && <span className="absolute top-1 right-1 text-[8px]">🔒</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>MY JOURNEY</p>
          <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)" }}>
            {editing ? (
              <div className="p-4 space-y-3">
                <div>
                  <label style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, display: "block", marginBottom: 4 }}>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm belly-input-focus" style={{ background: "var(--input-bg)", border: "none", color: "#3A1A00", fontFamily: "'Outfit', system-ui" }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, display: "block", marginBottom: 4 }}>Due date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-[10px] px-3 text-sm belly-input-focus" style={{ background: "var(--input-bg)", border: "none", color: "#3A1A00", fontFamily: "'Outfit', system-ui" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-[10px] text-sm belly-btn-press" style={{ background: "var(--c2)", border: "1px solid var(--c2-border)", color: "white", fontFamily: "'Outfit', system-ui" }}>Cancel</button>
                  <button onClick={handleSave} className="flex-1 h-10 rounded-[10px] text-sm font-semibold belly-btn-primary" style={{ background: "white", color: "#FF6520", borderRadius: 20, fontFamily: "'Outfit', system-ui", fontWeight: 700 }}>Save</button>
                </div>
              </div>
            ) : (
              <>
                {[
                  { icon: "✏️", label: "Edit pregnancy details", action: () => setEditing(true) },
                  { icon: "📔", label: "Journal & Symptom Tracker", action: () => navigate("/journal") },
                  { icon: "📚", label: "My Courses", action: () => navigate("/courses") },
                  { icon: "🛍️", label: "My Orders", action: () => navigate("/orders") },
                ].map((row, i, arr) => (
                  <button key={row.label} onClick={row.action} className="w-full p-4 flex items-center justify-between text-left"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>{row.icon}</div>
                      <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 600, color: "white" }}>{row.label}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.32)" }}>→</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>PREMIUM</p>
          {profile?.is_premium ? (
            <div className="rounded-[14px] p-4 text-center" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: "white" }}>You're a Premium mama! 🌟</p>
            </div>
          ) : (
            <button onClick={() => setShowPremium(true)} className="w-full rounded-[14px] p-5 text-left belly-card-interactive"
              style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(20px)" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>Unlock Premium</p>
              <p className="text-[11px] mb-3" style={{ color: "var(--w70)", fontFamily: "'Outfit', system-ui" }}>All courses + unlimited doula access</p>
              <ul className="space-y-1 mb-3">
                {["Unlimited AI doula messages", "All premium courses", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--w70)", fontFamily: "'Outfit', system-ui" }}>
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ background: "white", color: "#FF6520", fontFamily: "'Outfit', system-ui", fontWeight: 700 }}>Go Pro →</span>
            </button>
          )}
        </div>

        <div>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: "var(--w40)", fontWeight: 600 }}>ACCOUNT</p>
          <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)" }}>
            <button onClick={handleSignOut} className="w-full p-4 text-left text-[13px]" style={{ color: "var(--w70)", fontFamily: "'Outfit', system-ui" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {showPremium && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full rounded-t-[24px] overflow-hidden sheet-enter" style={{ background: "rgba(200,80,10,0.95)", backdropFilter: "blur(20px)" }}>
            <div className="p-6 text-center" style={{ background: "rgba(255,255,255,0.22)" }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white" }}>Go Premium</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--w70)", fontFamily: "'Outfit', system-ui" }}>Your complete pregnancy companion</p>
            </div>
            <div className="p-5 space-y-4">
              <ul className="space-y-2">
                {["Unlimited AI doula messages", "All premium courses unlocked", "Priority human doula review", "Downloadable birth plan", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[13px] flex items-center gap-2" style={{ color: "white", fontFamily: "'Outfit', system-ui" }}>
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <div className="flex-1 rounded-[14px] p-3 text-center belly-card-interactive" style={{ background: "var(--c1)", border: "1px solid var(--c1-border)" }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 900, color: "white" }}>$9.99</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, color: "var(--w50)" }}>/month</p>
                </div>
                <div className="flex-1 rounded-[14px] p-3 text-center belly-card-interactive relative" style={{ border: "2px solid white" }}>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "white", color: "#FF6520", fontFamily: "'Outfit', system-ui" }}>SAVE 50%</span>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 900, color: "white" }}>$59.99</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, color: "var(--w50)" }}>/year</p>
                </div>
              </div>
              <button className="w-full h-12 rounded-[20px] text-sm font-semibold belly-btn-primary" style={{ background: "white", color: "#FF6520", fontFamily: "'Outfit', system-ui", fontWeight: 700 }}>
                Start free trial
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-center text-[12px] py-2" style={{ color: "var(--w40)", fontFamily: "'Outfit', system-ui" }}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
