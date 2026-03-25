import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek, getDaysToGo, getWeekData } from "@/data/pregnancyWeeks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-belly-bg pb-20 page-enter">
      {/* Hero */}
      <div className="belly-hero-gradient rounded-b-hero px-5 pt-8 pb-6 text-center">
        <div className="w-[60px] h-[60px] rounded-full bg-white mx-auto mb-3 flex items-center justify-center">
          <span className="text-belly-accent font-display text-2xl font-bold">{initials}</span>
        </div>
        <h1 className="font-display text-[20px] font-bold text-primary-foreground">{profile?.first_name || "Mama"}</h1>
        <p className="text-[11px] text-primary-foreground/60 mt-1">
          Week {currentWeek} • Due {profile?.due_date ? formatDueDate(profile.due_date) : "—"}
        </p>
        {profile?.pregnancy_number && (
          <span className="inline-block mt-2 bg-white/30 text-primary-foreground text-[10px] px-3 py-1 rounded-pill">
            {profile.pregnancy_number === 1 ? "1st" : profile.pregnancy_number === 2 ? "2nd" : "3rd+"} pregnancy
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-2 px-5 -mt-3 mb-5">
        {[
          { label: "Week", value: currentWeek },
          { label: "Days to go", value: daysToGo },
          { label: "Trimester", value: weekData.trimester },
        ].map(stat => (
          <div key={stat.label} className="flex-1 bg-belly-upsell-bg rounded-card p-3 text-center">
            <p className="font-display text-[20px] font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-belly-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="px-5 space-y-4">
        {/* My Pregnancy */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">MY PREGNANCY</p>
          <div className="bg-card border border-belly-card-border rounded-card overflow-hidden">
            {editing ? (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1 block">Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-10 rounded-input border border-belly-card-border bg-background px-3 text-sm belly-input-focus" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-1 block">Due date</label>
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="w-full h-10 rounded-input border border-belly-card-border bg-background px-3 text-sm belly-input-focus" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-input border border-belly-card-border text-sm text-belly-text-muted belly-btn-press">Cancel</button>
                  <button onClick={handleSave} className="flex-1 h-10 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press">Save</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="w-full p-4 flex items-center justify-between text-left">
                <span className="text-[13px] text-foreground">Edit pregnancy details</span>
                <span className="text-belly-accent text-sm">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">QUICK LINKS</p>
          <div className="bg-card border border-belly-card-border rounded-card overflow-hidden">
            <button onClick={() => navigate("/journal")} className="w-full p-4 flex items-center justify-between text-left border-b border-belly-divider">
              <span className="text-[13px] text-foreground">📔 Journal & Symptom Tracker</span>
              <span className="text-belly-accent text-sm">→</span>
            </button>
            <button onClick={() => navigate("/courses")} className="w-full p-4 flex items-center justify-between text-left">
              <span className="text-[13px] text-foreground">📚 My Courses</span>
              <span className="text-belly-accent text-sm">→</span>
            </button>
          </div>
        </div>

        {/* Premium */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">PREMIUM</p>
          {profile?.is_premium ? (
            <div className="bg-belly-upsell-bg border border-belly-upsell-border rounded-card p-4 text-center">
              <p className="font-display text-[14px] font-bold text-foreground">You're a Premium mama! 🌟</p>
            </div>
          ) : (
            <button onClick={() => setShowPremium(true)} className="w-full bg-primary rounded-card p-5 text-left belly-press">
              <p className="font-display text-[16px] font-bold text-primary-foreground mb-1">Unlock Premium</p>
              <p className="text-[11px] text-primary-foreground/70 mb-3">All courses + unlimited doula access</p>
              <ul className="space-y-1 mb-3">
                {["Unlimited AI doula messages", "All premium courses", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[11px] text-primary-foreground/80 flex items-center gap-1.5">
                    <span>✓</span> {b}
                  </li>
                ))}
              </ul>
              <span className="bg-white/30 text-primary-foreground text-[11px] font-medium px-3 py-1.5 rounded-pill">Upgrade →</span>
            </button>
          )}
        </div>

        {/* Account */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">ACCOUNT</p>
          <div className="bg-card border border-belly-card-border rounded-card overflow-hidden">
            <button onClick={handleSignOut} className="w-full p-4 text-left text-[13px] text-destructive">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Premium modal */}
      {showPremium && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-card w-full rounded-t-sheet overflow-hidden animate-in slide-in-from-bottom">
            <div className="bg-primary p-6 text-center">
              <p className="font-display text-[22px] font-bold text-primary-foreground">Go Premium</p>
              <p className="text-[12px] text-primary-foreground/70 mt-1">Your complete pregnancy companion</p>
            </div>
            <div className="p-5 space-y-4">
              <ul className="space-y-2">
                {["Unlimited AI doula messages", "All premium courses unlocked", "Priority human doula review", "Downloadable birth plan", "Ad-free experience"].map(b => (
                  <li key={b} className="text-[13px] text-foreground flex items-center gap-2">
                    <span className="text-belly-accent">✓</span> {b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <div className="flex-1 border border-belly-card-border rounded-card p-3 text-center belly-press">
                  <p className="font-display text-[18px] font-bold text-foreground">$9.99</p>
                  <p className="text-[10px] text-belly-text-muted">/month</p>
                </div>
                <div className="flex-1 border-2 border-belly-accent rounded-card p-3 text-center belly-press relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-belly-accent text-primary-foreground text-[9px] px-2 py-0.5 rounded-pill font-medium">SAVE 50%</span>
                  <p className="font-display text-[18px] font-bold text-foreground">$59.99</p>
                  <p className="text-[10px] text-belly-text-muted">/year</p>
                </div>
              </div>
              <button className="w-full h-12 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press">
                Start free trial
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-center text-[12px] text-belly-text-muted py-2">
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
