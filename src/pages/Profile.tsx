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
    <div className="min-h-screen pb-20 page-enter" style={{ background: "#FEF8F4" }}>
      <div className="belly-hero-gradient rounded-b-[24px] px-5 pt-8 pb-6 text-center">
        <div className="w-[60px] h-[60px] rounded-full bg-white mx-auto mb-3 flex items-center justify-center"
          style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.4), 0 0 0 7px rgba(255,255,255,0.14)" }}>
          <span className="font-display text-2xl font-semibold" style={{ color: "#FF7840" }}>{initials}</span>
        </div>
        <h1 className="font-display text-[20px] font-semibold" style={{ color: "#FFF8F4" }}>{titleCase(profile?.first_name || "Mama")}</h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          Week {currentWeek} • Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span className="inline-block mt-2 text-[10px] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
          </span>
        )}
      </div>

      <div className="flex gap-2 px-5 -mt-3 mb-5">
        {[
          { label: "Week", value: currentWeek },
          { label: "Days to go", value: daysToGo },
          { label: "Streak", value: "3🔥" },
        ].map(stat => (
          <div key={stat.label} className="flex-1 belly-glass-card rounded-[14px] p-3 text-center">
            <p className="font-display text-[20px]" style={{ fontWeight: 300, color: "#FF7840" }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: "#C4906A" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 mb-5">
        <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>MY ACHIEVEMENTS</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {BADGES.map(badge => (
            <div key={badge.label} className="belly-glass-card rounded-[12px] p-2.5 flex flex-col items-center min-w-[60px] relative"
              style={{ opacity: badge.earned ? 1 : 0.22, filter: badge.earned ? "none" : "grayscale(1)" }}>
              <span className="text-[20px] mb-1">{badge.emoji}</span>
              <span className="text-[8px] text-center leading-tight" style={{ color: "#C4906A" }}>{badge.label}</span>
              {!badge.earned && <span className="absolute top-1 right-1 text-[8px]">🔒</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>MY JOURNEY</p>
          <div className="belly-glass-card rounded-[14px] overflow-hidden">
            {editing ? (
              <div className="p-4 space-y-3">
                <div>
                  <label style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.4)", fontWeight: 600, display: "block", marginBottom: 4 }}>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-[10px] border px-3 text-sm belly-input-focus" style={{ borderColor: "rgba(255,170,130,0.22)", background: "rgba(255,255,255,0.68)" }} />
                </div>
                <div>
                  <label style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.4)", fontWeight: 600, display: "block", marginBottom: 4 }}>Due date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-[10px] border px-3 text-sm belly-input-focus" style={{ borderColor: "rgba(255,170,130,0.22)", background: "rgba(255,255,255,0.68)" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-[10px] text-sm belly-btn-press" style={{ border: "0.5px solid rgba(255,170,130,0.22)", color: "#C4906A" }}>Cancel</button>
                  <button onClick={handleSave} className="flex-1 h-10 rounded-[10px] text-sm font-semibold belly-btn-primary" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)", color: "white" }}>Save</button>
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
                    style={{ borderBottom: i < arr.length - 1 ? "0.5px solid rgba(255,170,130,0.1)" : "none" }}>
                    <span className="text-[13px]" style={{ color: "#A84E28" }}>{row.icon} {row.label}</span>
                    <span style={{ color: "#C4906A" }}>→</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>PREMIUM</p>
          {profile?.is_premium ? (
            <div className="belly-glass-card rounded-[14px] p-4 text-center">
              <p className="font-display text-[14px] font-semibold" style={{ color: "#A84E28" }}>You're a Premium mama! 🌟</p>
            </div>
          ) : (
            <button onClick={() => setShowPremium(true)} className="w-full belly-hero-gradient rounded-[14px] p-5 text-left belly-card-interactive">
              <p className="font-display text-[16px] font-semibold mb-1" style={{ color: "white" }}>Unlock Premium</p>
              <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>All courses + unlimited doula access</p>
              <ul className="space-y-1 mb-3">
                {["Unlimited AI doula messages", "All premium courses", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[11px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <span className="text-[11px] font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)", color: "white" }}>Upgrade →</span>
            </button>
          )}
        </div>

        <div>
          <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", marginBottom: 8, color: "rgba(200,88,40,0.4)", fontWeight: 600 }}>ACCOUNT</p>
          <div className="belly-glass-card rounded-[14px] overflow-hidden">
            <button onClick={handleSignOut} className="w-full p-4 text-left text-[13px]" style={{ color: "#C4906A" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {showPremium && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full rounded-t-[24px] overflow-hidden sheet-enter" style={{ background: "#FEF8F4" }}>
            <div className="belly-hero-gradient p-6 text-center">
              <p className="font-display text-[22px] font-semibold" style={{ color: "white" }}>Go Premium</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>Your complete pregnancy companion</p>
            </div>
            <div className="p-5 space-y-4">
              <ul className="space-y-2">
                {["Unlimited AI doula messages", "All premium courses unlocked", "Priority human doula review", "Downloadable birth plan", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[13px] flex items-center gap-2" style={{ color: "#A84E28" }}>
                    <span style={{ color: "#FF7840" }}>✓</span> {b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <div className="flex-1 belly-glass-card rounded-[14px] p-3 text-center belly-card-interactive">
                  <p className="font-display text-[18px] font-semibold" style={{ color: "#A84E28" }}>$9.99</p>
                  <p className="text-[10px]" style={{ color: "#C4906A" }}>/month</p>
                </div>
                <div className="flex-1 rounded-[14px] p-3 text-center belly-card-interactive relative" style={{ border: "2px solid #FF7840" }}>
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#FF7840", color: "white" }}>SAVE 50%</span>
                  <p className="font-display text-[18px] font-semibold" style={{ color: "#A84E28" }}>$59.99</p>
                  <p className="text-[10px]" style={{ color: "#C4906A" }}>/year</p>
                </div>
              </div>
              <button className="w-full h-12 rounded-[12px] text-sm font-semibold belly-btn-primary" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)", color: "white" }}>
                Start free trial
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-center text-[12px] py-2" style={{ color: "rgba(180,100,60,0.38)" }}>
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
