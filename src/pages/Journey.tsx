import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { getStreak } from "@/lib/streak";
import { SceneBackground, GhHeader, GlassCard, BellaOrb } from "@/components/golden";
import { useVvLock } from "@/lib/viewport";
import { Check, ChevronRight, Lock, Flame, NotebookPen, Package, Plus, Sparkles, User, X } from "lucide-react";
import { toast } from "sonner";

interface Milestone {
  week: number;
  title: string;
  tone: "teal" | "magenta";
}

const MILESTONES: Milestone[] = [
  { week: 6, title: "Heartbeat first detected", tone: "teal" },
  { week: 12, title: "First trimester complete", tone: "teal" },
  { week: 20, title: "Anatomy scan day", tone: "magenta" },
  { week: 28, title: "Third trimester begins", tone: "magenta" },
];

type TimelineItem = {
  key: string;
  date: Date;
  title: string;
  state: "done" | "now" | "future";
  tone?: "teal" | "magenta";
  isCustom?: boolean;
};

const dayMs = 24 * 60 * 60 * 1000;

const YOURS_LINKS = [
  {
    to: "/me", label: "My profile", sub: "due date, name, premium",
    icon: User, rgb: "242,182,71",
  },
  {
    to: "/journal", label: "Journal", sub: "mood, symptoms, notes",
    icon: NotebookPen, rgb: "44,156,143",
  },
  {
    to: "/orders", label: "My orders", sub: "bella's apothecary deliveries",
    icon: Package, rgb: "181,56,107",
  },
];

const Journey = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weeksLeft = Math.max(0, 40 - currentWeek);
  const dueDateLabel = profile?.due_date
    ? new Date(profile.due_date).toLocaleDateString(undefined, { month: "long", day: "numeric" })
    : null;

  const arcLabel =
    currentWeek >= 37 ? "almost there — the glow is at its brightest"
    : currentWeek >= 27 ? "the glow is warming up"
    : currentWeek >= 14 ? "the golden middle"
    : "the first flicker of the glow";

  // Back-date the due date by 40 weeks to estimate a real calendar date for each
  // system milestone's week number, so it can sort/count down alongside custom moments.
  const conceptionDate = useMemo(() => {
    if (!profile?.due_date) return null;
    const d = new Date(profile.due_date);
    d.setDate(d.getDate() - 280);
    return d;
  }, [profile?.due_date]);

  const weekDate = (week: number): Date | null => {
    if (!conceptionDate) return null;
    const d = new Date(conceptionDate);
    d.setDate(d.getDate() + week * 7);
    return d;
  };

  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null);
  useEffect(() => {
    if (user?.id) getStreak(user.id).then(setStreak);
  }, [user?.id]);

  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentDate, setMomentDate] = useState("");
  const [saving, setSaving] = useState(false);
  useVvLock(showAdd);

  const customMilestones = profile?.custom_milestones ?? [];

  const timelineItems: TimelineItem[] = useMemo(() => {
    const today = new Date();
    const items: TimelineItem[] = [];

    MILESTONES.forEach((m) => {
      const d = weekDate(m.week) ?? today;
      items.push({
        key: `system-${m.week}`,
        date: d,
        title: m.title,
        state: m.week < currentWeek ? "done" : m.week > currentWeek ? "future" : "now",
        tone: m.tone,
      });
    });

    customMilestones.forEach((cm) => {
      const d = new Date(cm.date);
      items.push({
        key: `custom-${cm.id}`,
        date: d,
        title: cm.title,
        state: d.getTime() <= today.getTime() ? "done" : "future",
        isCustom: true,
      });
    });

    items.push({ key: "now", date: today, title: "You are here, mama", state: "now" });

    if (profile?.due_date && currentWeek < 40) {
      items.push({
        key: "due",
        date: new Date(profile.due_date),
        title: dueDateLabel ? `Due date · ${dueDateLabel}` : "Due date",
        state: "future",
      });
    }

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, JSON.stringify(customMilestones), profile?.due_date, conceptionDate]);

  const nextUp = useMemo(
    () => timelineItems.filter((it) => it.state === "future").sort((a, b) => a.date.getTime() - b.date.getTime())[0],
    [timelineItems]
  );

  const countdown = useMemo(() => {
    if (!nextUp) return null;
    const remaining = Math.max(0, nextUp.date.getTime() - tick);
    const days = Math.floor(remaining / dayMs);
    const hours = Math.floor((remaining % dayMs) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    return { days, hours, minutes, seconds };
  }, [nextUp, tick]);

  const doneCount = timelineItems.filter((it) => it.state === "done").length;

  const saveMoment = async () => {
    if (!user || !momentTitle.trim() || !momentDate) return;
    setSaving(true);
    const next = [...customMilestones, { id: crypto.randomUUID(), title: momentTitle.trim(), date: momentDate }];
    const { error } = await supabase
      .from("profiles")
      .update({ custom_milestones: next as unknown as import("@/integrations/supabase/types").Json })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save that moment — try again.");
      return;
    }
    await refreshProfile();
    toast.success("Moment added to your journey.");
    setShowAdd(false);
    setMomentTitle("");
    setMomentDate("");
  };

  const dotVisual = (item: TimelineItem) => {
    if (item.key === "now") {
      return {
        style: {
          background: "var(--gold)",
          border: "2px solid rgba(21,10,31,0.8)",
          boxShadow: "0 0 0 4px rgba(242,182,71,0.35)",
          animation: "bellaPulse 2.4s ease-in-out infinite",
        } as React.CSSProperties,
        icon: null,
      };
    }
    if (item.state === "done") {
      return {
        style: {
          background: item.tone === "magenta" ? "var(--magenta)" : "var(--teal)",
          border: "2px solid rgba(21,10,31,0.8)",
        } as React.CSSProperties,
        icon: <Check size={8} strokeWidth={3} color="var(--night)" />,
      };
    }
    return {
      style: { background: "transparent", border: "2px dashed rgba(255,255,255,0.4)" } as React.CSSProperties,
      icon: <Lock size={7} strokeWidth={2.5} color="rgba(251,238,224,0.55)" />,
    };
  };

  return (
    <SceneBackground scene="journey">
      <GhHeader
        brand="Your journey"
        tag="40 weeks, one glow"
        brandSize={20}
        showOrb
        weekPill={`wk ${currentWeek}`}
        glowStyle={{ right: -40, top: -60 }}
      >
        {/* 40-week arc */}
        <div style={{ position: "relative", zIndex: 2, marginTop: 18 }}>
          <div
            style={{
              height: 9, borderRadius: 6,
              background: "linear-gradient(90deg, #5dd6c4 0%, var(--magenta) 50%, var(--gold) 100%)",
              position: "relative",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute", top: "50%",
                left: `${Math.min(98, Math.round((currentWeek / 40) * 100))}%`,
                width: 16, height: 16, borderRadius: "50%",
                background: "var(--cream)", border: "3px solid var(--gold)",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 12px rgba(242,182,71,0.8)",
              }}
            />
          </div>
          <div className="font-gh-mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 9.5, color: "rgba(251,238,224,0.6)" }}>
            <span>T1</span><span>T2</span><span>T3</span><span>birth</span>
          </div>
          <div className="font-gh-mono" style={{ textAlign: "center", fontSize: 11, color: "var(--gold)", marginTop: 9 }}>
            week {currentWeek} of 40 — {arcLabel}
          </div>
        </div>
      </GhHeader>

      <div style={{ padding: "12px 16px 110px" }}>
        {/* Next up: live countdown to the nearest milestone */}
        <GlassCard>
          <div className="gh-section-label">next up</div>
          {nextUp && countdown ? (
            <>
              <div className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--cream)", marginTop: 4 }}>
                {nextUp.title}
              </div>
              <div className="font-gh-mono" style={{ display: "flex", gap: 10, marginTop: 10 }}>
                {[
                  { label: "days", value: countdown.days },
                  { label: "hrs", value: countdown.hours },
                  { label: "min", value: countdown.minutes },
                  { label: "sec", value: countdown.seconds },
                ].map((seg) => (
                  <div key={seg.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, color: "var(--gold)", lineHeight: 1 }}>
                      {String(seg.value).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: 8.5, color: "rgba(251,238,224,0.5)", marginTop: 3, letterSpacing: "0.06em" }}>
                      {seg.label}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="font-gh-serif" style={{ fontSize: 14, marginTop: 4, opacity: 0.85 }}>
              Every moment so far is yours, mama.
            </div>
          )}
        </GlassCard>

        {/* Moments earned: real streak + unlocked milestone count */}
        <GlassCard>
          <div className="gh-section-label">moments earned</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "9px 12px" }}>
              <Flame size={16} color="var(--ember)" />
              <div>
                <div className="font-gh-mono" style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.1 }}>
                  {streak?.current ?? 0}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(251,238,224,0.55)" }}>day streak</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "9px 12px" }}>
              <Sparkles size={16} color="var(--gold)" />
              <div>
                <div className="font-gh-mono" style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.1 }}>
                  {doneCount}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(251,238,224,0.55)" }}>moments unlocked</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Your space: profile / journal / orders (moved here from the old header menu) */}
        <GlassCard>
          <div className="gh-section-label">your space</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {YOURS_LINKS.map(({ to, label, sub, icon: Icon, rgb }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="belly-btn-press"
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  textAlign: "left", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
                  padding: "11px 12px", cursor: "pointer", color: "var(--cream)",
                }}
              >
                <div
                  style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.4)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon size={17} strokeWidth={1.8} style={{ color: `rgb(${rgb})` }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="font-gh-serif" style={{ fontSize: 14.5, fontWeight: 500, display: "block" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 11.5, color: "rgba(251,238,224,0.6)" }}>{sub}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="gh-section-label">your timeline</div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ content: '""', position: "absolute", left: 5, top: 4, bottom: 4, width: 2, background: "rgba(255,255,255,0.2)" }} />
            {timelineItems.map((item) => {
              const { style, icon } = dotVisual(item);
              return (
                <div key={item.key} style={{ position: "relative", marginBottom: 17, opacity: item.state === "future" ? 0.55 : 1 }}>
                  <div style={{ position: "absolute", left: -24, top: 3, width: 12, height: 12, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
                    {icon}
                  </div>
                  <div className="font-gh-mono" style={{ fontSize: 10, color: "rgba(251,238,224,0.55)" }}>
                    {item.key === "now" || item.key === "due" ? "" : item.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                  <div
                    className="font-gh-serif"
                    style={{
                      fontSize: 14, marginTop: 2,
                      color: item.state === "now" ? "var(--gold)" : "var(--cream)",
                      fontWeight: item.state === "now" ? 500 : 400,
                    }}
                  >
                    {item.title}
                    {item.isCustom && (
                      <span style={{ fontSize: 10, color: "var(--gold)", opacity: 0.7, marginLeft: 6 }}>· your moment</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="gh-pill"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Plus size={13} />
            <span>Add your own moment</span>
          </button>
        </GlassCard>

        {/* Bella's note */}
        <GlassCard
          style={{
            background: "linear-gradient(135deg, rgba(44,156,143,0.35), rgba(181,56,107,0.35))",
            display: "flex", alignItems: "center", gap: 13,
          }}
        >
          <BellaOrb size={44} />
          <div>
            <b className="font-gh-serif" style={{ fontSize: 14.5, fontWeight: 500, display: "block" }}>Bella's note</b>
            <span style={{ fontSize: 12, opacity: 0.85 }}>
              {weeksLeft > 0
                ? `${weeksLeft === 1 ? "One week" : `${weeksLeft} weeks`} left — the glow gets warmer from here.`
                : "You made it to the threshold, mama — the glow is yours now."}
            </span>
          </div>
        </GlassCard>
      </div>

      {showAdd && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end"
          style={{ background: "rgba(10,6,16,0.6)" }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full flex flex-col sheet-enter relative"
            style={{
              background: "linear-gradient(180deg, #2a1430 0%, #1c0e24 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderBottom: "none",
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              maxHeight: "min(70dvh, calc(var(--vvh, 100dvh) - 40px))", maxWidth: 430, margin: "0 auto",
              color: "var(--cream)", fontFamily: "'Inter', system-ui",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div style={{ width: 44, height: 5, borderRadius: 5, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <button
              onClick={() => setShowAdd(false)}
              aria-label="Close"
              className="gh-icon-btn"
              style={{ position: "absolute", top: 14, right: 14 }}
            >
              <X size={15} />
            </button>

            <div className="px-5 pt-3 pb-2 shrink-0">
              <h2 className="font-gh-serif" style={{ fontSize: 20, fontWeight: 500, fontStyle: "italic" }}>Add your own moment</h2>
              <p style={{ fontSize: 12, color: "rgba(251,238,224,0.6)", marginTop: 2 }}>
                First kick, baby shower, a name you finally agreed on — it belongs on your timeline.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-5" style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
              <p className="gh-section-label" style={{ marginBottom: 8 }}>moment</p>
              <input
                value={momentTitle}
                onChange={(e) => setMomentTitle(e.target.value)}
                placeholder="First kick..."
                className="w-full text-[15px] outline-none mb-4"
                style={{ background: "rgba(0,0,0,0.25)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px" }}
              />

              <p className="gh-section-label" style={{ marginBottom: 8 }}>date</p>
              <input
                type="date"
                value={momentDate}
                onChange={(e) => setMomentDate(e.target.value)}
                className="w-full text-[15px] outline-none mb-2"
                style={{ background: "rgba(0,0,0,0.25)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", colorScheme: "dark" }}
              />
            </div>

            <div
              className="shrink-0 px-5"
              style={{
                paddingTop: 12,
                paddingBottom: "max(20px, env(safe-area-inset-bottom))",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                background: "#1c0e24",
              }}
            >
              <button
                onClick={saveMoment}
                disabled={!momentTitle.trim() || !momentDate || saving}
                className="w-full belly-btn-press"
                style={{
                  background: "linear-gradient(135deg, var(--gold), var(--ember))",
                  color: "var(--night)",
                  fontWeight: 700, fontSize: 15,
                  borderRadius: 999, height: 52, border: "none",
                  opacity: (!momentTitle.trim() || !momentDate || saving) ? 0.4 : 1,
                  cursor: (!momentTitle.trim() || !momentDate || saving) ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save to my journey"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </SceneBackground>
  );
};

export default Journey;
