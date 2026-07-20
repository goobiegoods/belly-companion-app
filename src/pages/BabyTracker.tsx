import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";
import PremiumUpgradeSheet from "@/components/PremiumUpgradeSheet";
import { toast } from "sonner";
import { Lock, Sparkles, Baby, ChevronRight, Leaf } from "lucide-react";

// Same symptom vocabulary as Journal so quick-logged entries look native there.
const SYMPTOMS = [
  "Nausea", "Fatigue", "Back pain", "Heartburn", "Swelling",
  "Headache", "Insomnia", "Mood changes", "Cravings", "Other",
];

const KICKS_UNLOCK_WEEK = 16;

const getFruitName = (babySize: string) =>
  babySize.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();

const Stat = ({ value, unit, label }: { value: string; unit: string; label: string }) => (
  <div>
    <div className="font-gh-mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--cream)" }}>
      {value}
      <span style={{ fontSize: 12, opacity: 0.7 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 10.5, color: "rgba(251,238,224,0.55)", marginTop: 3 }}>{label}</div>
  </div>
);

const BabyTracker = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const weekData = getWeekData(selectedWeek);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [kickCount, setKickCount] = useState(0);
  const [showWeekLock, setShowWeekLock] = useState(false);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [savingSymptoms, setSavingSymptoms] = useState(false);

  const kicksUnlocked = currentWeek >= KICKS_UNLOCK_WEEK;

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.children[selectedWeek - 1] as HTMLElement;
      el?.scrollIntoView({ inline: "center", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real data: today's kicks come back from Supabase, so the count survives reloads.
  useEffect(() => {
    if (!user?.id) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    supabase
      .from("kick_counts")
      .select("count")
      .eq("user_id", user.id)
      .gte("recorded_at", todayStart.toISOString())
      .then(({ data }) => {
        if (data) setKickCount(data.reduce((sum, row) => sum + (row.count ?? 1), 0));
      });
  }, [user?.id]);

  const addKick = async () => {
    setKickCount((k) => k + 1);
    navigator.vibrate?.(8);
    if (user) {
      await supabase.from("kick_counts").insert({ user_id: user.id, count: 1 });
    }
  };

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  // Quick-log writes the exact shape Journal saves/reads (mood is nullable in journal_entries).
  const logSymptoms = async () => {
    if (!user || selectedSymptoms.length === 0) return;
    setSavingSymptoms(true);
    navigator.vibrate?.(8);
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      date: today,
      mood: null,
      symptoms: selectedSymptoms,
      note: null,
      week_number: currentWeek,
    });
    setSavingSymptoms(false);
    if (error) {
      toast.error("Something went wrong. Try again.");
      return;
    }
    toast.success("Symptoms logged in your journal");
    setSelectedSymptoms([]);
  };

  const fruitName = getFruitName(weekData.babySize);
  const currentData = getWeekData(currentWeek);

  const pickWeek = (w: number) => {
    if (w > currentWeek && !profile?.is_premium) {
      setShowWeekLock(true);
      return;
    }
    setSelectedWeek(w);
  };

  const askBella = () =>
    navigate("/ask", {
      state: { prefill: `What should I know about week ${selectedWeek} of pregnancy?` },
    });

  return (
    <SceneBackground scene="baby">
      <GhHeader
        brand="Baby's world"
        tag={`week ${currentWeek} · ${getFruitName(currentData.babySize)} · ~${currentData.babyLength}`}
        weekPill={`wk ${currentWeek}`}
        glowStyle={{
          left: -40, right: "auto", top: -70,
          background:
            "radial-gradient(circle at 35% 35%, rgba(180,240,230,0.7), rgba(44,156,143,0.2) 55%, transparent 75%)",
        }}
      />

      <div style={{ padding: "12px 16px 110px" }}>
        {/* Size hero */}
        <GlassCard style={{ textAlign: "center", paddingBottom: 22 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{weekData.emoji}</div>
          <div
            className="font-gh-serif"
            style={{ fontStyle: "italic", fontSize: 14, color: "var(--gold)", marginBottom: 16 }}
          >
            about the size of a {fruitName}
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "stretch" }}>
            <Stat
              value={weekData.babyWeight === "N/A" ? "—" : weekData.babyWeight.replace(/[a-z]+$/i, "")}
              unit={weekData.babyWeight === "N/A" ? "" : weekData.babyWeight.replace(/^[\d.]+/, "")}
              label="weight"
            />
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
            <Stat
              value={weekData.babyLength === "N/A" ? "—" : weekData.babyLength.replace(/[a-z]+$/i, "")}
              unit={weekData.babyLength === "N/A" ? "" : weekData.babyLength.replace(/^[\d.]+/, "")}
              label="length"
            />
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
            <Stat value={String(selectedWeek)} unit="w" label="age" />
          </div>
        </GlassCard>

        {/* Week browser */}
        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}
        >
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => {
            const isSelected = w === selectedWeek;
            const isLocked = w > currentWeek && !profile?.is_premium;
            return (
              <button
                key={w}
                onClick={() => pickWeek(w)}
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "6px 11px",
                  borderRadius: 20,
                  flexShrink: 0,
                  cursor: "pointer",
                  ...(isSelected
                    ? { background: "var(--gold)", color: "var(--night)", fontWeight: 600, border: "1px solid transparent" }
                    : {
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: isLocked ? "rgba(251,238,224,0.35)" : "rgba(251,238,224,0.6)",
                      }),
                }}
              >
                w{w}{isLocked ? " 🔒" : ""}
              </button>
            );
          })}
        </div>

        {/* Development */}
        <GlassCard>
          <div className="gh-section-label">baby development</div>
          <div className="font-gh-serif" style={{ fontSize: 14.5, lineHeight: 1.6, marginTop: 4 }}>
            {weekData.developmentHighlight}
          </div>
        </GlassCard>

        {/* Your body this week — real maternal data from pregnancyWeeks */}
        <GlassCard>
          <div className="gh-section-label">
            {selectedWeek === currentWeek ? "your body this week" : `your body · week ${selectedWeek}`}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, marginBottom: 12 }}>
            {weekData.momSymptoms.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "5px 11px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(251,238,224,0.85)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Leaf size={15} strokeWidth={1.8} style={{ stroke: "var(--teal)", flexShrink: 0, marginTop: 2 }} />
            <div
              className="font-gh-serif"
              style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: "var(--cream)", opacity: 0.9 }}
            >
              {weekData.naturalTip}
            </div>
          </div>
        </GlassCard>

        {/* Kick counter — locked before ~week 16, persisted to kick_counts after */}
        {kicksUnlocked ? (
          <button
            onClick={addKick}
            className="gh-glass-subtle belly-btn-press"
            style={{ width: "100%", padding: "16px 8px", textAlign: "center", cursor: "pointer", marginBottom: 12 }}
          >
            <div className="font-gh-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--gold)" }}>
              {kickCount}
            </div>
            <div style={{ fontSize: 10, color: "rgba(251,238,224,0.6)", marginTop: 3 }}>kicks today</div>
            <div
              style={{
                fontSize: 10, marginTop: 9, fontWeight: 600,
                background: "linear-gradient(135deg, var(--teal), var(--gold))",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}
            >
              + Kick
            </div>
          </button>
        ) : (
          <div
            className="gh-glass-subtle"
            style={{ padding: "18px 16px", textAlign: "center", marginBottom: 12 }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%", margin: "0 auto 10px",
                background: "rgba(242,182,71,0.14)", border: "1px solid rgba(242,182,71,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Lock size={17} strokeWidth={1.8} style={{ stroke: "var(--gold)" }} />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 4 }}>
              Kick counting starts around week 16
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(251,238,224,0.65)", lineHeight: 1.5 }}>
              Most mamas feel the first flutters between 16 and 22 weeks — the counter will open up then.
            </div>
          </div>
        )}

        {/* Log a symptom — quick-log into journal_entries (replaces the old local-only contraction timer) */}
        <GlassCard>
          <div className="gh-section-label">log a symptom</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, marginBottom: 12 }}>
            {SYMPTOMS.map((s) => {
              const on = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`gh-pill belly-btn-press${on ? " gh-pill-filled" : ""}`}
                  aria-pressed={on}
                  style={{ fontSize: 12, padding: "6px 13px" }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <button
            onClick={logSymptoms}
            disabled={selectedSymptoms.length === 0 || savingSymptoms}
            className="belly-btn-press"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
              borderRadius: 14, padding: "12px 14px", border: "none",
              opacity: selectedSymptoms.length === 0 || savingSymptoms ? 0.5 : 1,
              cursor: selectedSymptoms.length === 0 || savingSymptoms ? "default" : "pointer",
              boxShadow: "0 6px 18px -6px rgba(232,98,46,0.55)",
            }}
          >
            {savingSymptoms ? "Saving..." : "Save to journal"}
          </button>
          <button
            onClick={() => navigate("/journal")}
            className="belly-btn-press"
            style={{
              marginTop: 10, background: "none", border: "none", padding: 0, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "var(--gold)",
            }}
          >
            Add mood or a note in Journal →
          </button>
        </GlassCard>

        {/* Ask Bella shortcut */}
        <button
          onClick={askBella}
          className="gh-glass-subtle belly-btn-press"
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "13px 14px", cursor: "pointer", textAlign: "left", marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "rgba(181,56,107,0.22)", border: "1px solid rgba(181,56,107,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Sparkles size={16} strokeWidth={1.8} style={{ stroke: "var(--gold)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>
              Ask Bella about week {selectedWeek}
            </div>
            <div style={{ fontSize: 11, color: "rgba(251,238,224,0.6)", marginTop: 2 }}>
              What should I know right now?
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.8} style={{ stroke: "rgba(251,238,224,0.5)", flexShrink: 0 }} />
        </button>

        {/* How your baby feels inside → /learn */}
        <button
          onClick={() => navigate("/learn")}
          className="gh-glass-subtle belly-btn-press"
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "13px 14px", cursor: "pointer", textAlign: "left",
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "rgba(44,156,143,0.22)", border: "1px solid rgba(44,156,143,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Baby size={16} strokeWidth={1.8} style={{ stroke: "var(--teal)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>
              How your baby feels inside
            </div>
            <div style={{ fontSize: 11, color: "rgba(251,238,224,0.6)", marginTop: 2 }}>
              Step into their world — warmth, sound, and your heartbeat
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.8} style={{ stroke: "rgba(251,238,224,0.5)", flexShrink: 0 }} />
        </button>
      </div>

      <PremiumUpgradeSheet open={showWeekLock} onClose={() => setShowWeekLock(false)} />
    </SceneBackground>
  );
};

export default BabyTracker;
