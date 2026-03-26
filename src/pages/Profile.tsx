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
  const weekData = getWeekData(currentWeek);
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
      <div className="belly-hero-gradient rounded-b-[24px] px-5 pt-8 pb-6 text-center">
        <div className="w-[60px] h-[60px] rounded-full bg-white mx-auto mb-3 flex items-center justify-center"
          style={{ boxShadow: "0 0 0 4px rgba(255,255,255,0.5), 0 0 0 8px rgba(255,184,153,0.2)" }}>
          <span className="font-display text-2xl font-bold" style={{ color: "#D4906A" }}>{initials}</span>
        </div>
        <h1 className="font-display text-[20px] font-bold" style={{ color: "#2A1200" }}>{titleCase(profile?.first_name || "Mama")}</h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(42,18,0,0.6)" }}>
          Week {currentWeek} • Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span className="inline-block mt-2 bg-white/30 text-[10px] px-3 py-1 rounded-full" style={{ color: "#2A1200" }}>
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
          <div key={stat.label} className="flex-1 belly-glass-card rounded-[14px] p-3 text-center">
            <p className="font-display text-[20px] font-bold" style={{ color: "#2A1200" }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: "#D4906A" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>MY ACHIEVEMENTS</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {BADGES.map(badge => (
            <div key={badge.label} className="belly-glass-card rounded-[12px] p-2.5 flex flex-col items-center min-w-[60px] relative"
              style={{ opacity: badge.earned ? 1 : 0.3, filter: badge.earned ? "none" : "grayscale(1)" }}>
              <span className="text-[20px] mb-1">{badge.emoji}</span>
              <span className="text-[8px] text-center leading-tight" style={{ color: "#D4906A" }}>{badge.label}</span>
              {!badge.earned && (
                <span className="absolute top-1 right-1 text-[8px]">🔒</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>MY JOURNEY</p>
          <div className="belly-glass-card rounded-[14px] overflow-hidden">
            {editing ? (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.1em] mb-1 block" style={{ color: "#D4B0A0" }}>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-[10px] border px-3 text-sm belly-input-focus" style={{ borderColor: "rgba(255,228,212,0.8)", background: "rgba(255,248,245,0.9)" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.1em] mb-1 block" style={{ color: "#D4B0A0" }}>Due date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-[10px] border px-3 text-sm belly-input-focus" style={{ borderColor: "rgba(255,228,212,0.8)", background: "rgba(255,248,245,0.9)" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-[10px] text-sm belly-btn-press" style={{ border: "1px solid rgba(255,228,212,0.8)", color: "#D4906A" }}>Cancel</button>
                  <button onClick={handleSave} className="flex-1 h-10 rounded-[10px] text-sm font-semibold belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="w-full p-4 flex items-center justify-between text-left" style={{ borderBottom: "1px solid rgba(255,228,212,0.4)" }}>
                  <span className="text-[13px]" style={{ color: "#2A1200" }}>✏️ Edit pregnancy details</span>
                  <span style={{ color: "#D4906A" }}>→</span>
                </button>
                <button onClick={() => navigate("/journal")} className="w-full p-4 flex items-center justify-between text-left" style={{ borderBottom: "1px solid rgba(255,228,212,0.4)" }}>
                  <span className="text-[13px]" style={{ color: "#2A1200" }}>📔 Journal & Symptom Tracker</span>
                  <span style={{ color: "#D4906A" }}>→</span>
                </button>
                <button onClick={() => navigate("/courses")} className="w-full p-4 flex items-center justify-between text-left" style={{ borderBottom: "1px solid rgba(255,228,212,0.4)" }}>
                  <span className="text-[13px]" style={{ color: "#2A1200" }}>📚 My Courses</span>
                  <span style={{ color: "#D4906A" }}>→</span>
                </button>
                <button onClick={() => navigate("/shop")} className="w-full p-4 flex items-center justify-between text-left">
                  <span className="text-[13px]" style={{ color: "#2A1200" }}>🛍️ My Orders</span>
                  <span style={{ color: "#D4906A" }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Premium */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>PREMIUM</p>
          {profile?.is_premium ? (
            <div className="belly-glass-card rounded-[14px] p-4 text-center">
              <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>You're a Premium mama! 🌟</p>
            </div>
          ) : (
            <button onClick={() => setShowPremium(true)} className="w-full belly-hero-gradient rounded-[14px] p-5 text-left belly-card-interactive">
              <p className="font-display text-[16px] font-bold mb-1" style={{ color: "#2A1200" }}>Unlock Premium</p>
              <p className="text-[11px] mb-3" style={{ color: "rgba(42,18,0,0.7)" }}>All courses + unlimited doula access</p>
              <ul className="space-y-1 mb-3">
                {["Unlimited AI doula messages", "All premium courses", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[11px] flex items-center gap-1.5" style={{ color: "rgba(42,18,0,0.8)" }}>
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <span className="bg-white/30 text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ color: "#2A1200" }}>Upgrade →</span>
            </button>
          )}
        </div>

        {/* Account */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#D4B0A0" }}>ACCOUNT</p>
          <div className="belly-glass-card rounded-[14px] overflow-hidden">
            <button onClick={handleSignOut} className="w-full p-4 text-left text-[13px]" style={{ color: "#D4906A" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Premium modal */}
      {showPremium && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[24px] overflow-hidden sheet-enter">
            <div className="belly-hero-gradient p-6 text-center">
              <p className="font-display text-[22px] font-bold" style={{ color: "#2A1200" }}>Go Premium</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(42,18,0,0.7)" }}>Your complete pregnancy companion</p>
            </div>
            <div className="p-5 space-y-4">
              <ul className="space-y-2">
                {["Unlimited AI doula messages", "All premium courses unlocked", "Priority human doula review", "Downloadable birth plan", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[13px] flex items-center gap-2" style={{ color: "#2A1200" }}>
                    <span style={{ color: "#D4906A" }}>✓</span> {b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <div className="flex-1 belly-glass-card rounded-[14px] p-3 text-center belly-card-interactive">
                  <p className="font-display text-[18px] font-bold" style={{ color: "#2A1200" }}>$9.99</p>
                  <p className="text-[10px]" style={{ color: "#D4906A" }}>/month</p>
                </div>
                <div className="flex-1 rounded-[14px] p-3 text-center belly-card-interactive relative" style={{ border: "2px solid #D4906A" }}>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#D4906A", color: "white" }}>SAVE 50%</span>
                  <p className="font-display text-[18px] font-bold" style={{ color: "#2A1200" }}>$59.99</p>
                  <p className="text-[10px]" style={{ color: "#D4906A" }}>/year</p>
                </div>
              </div>
              <button className="w-full h-12 rounded-[12px] text-sm font-semibold belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>
                Start free trial
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-center text-[12px] py-2" style={{ color: "#D4B0A0" }}>
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
