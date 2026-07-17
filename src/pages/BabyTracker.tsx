import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";
import PremiumUpgradeSheet from "@/components/PremiumUpgradeSheet";

interface Contraction {
  startTime: Date;
  endTime: Date;
  duration: number;
  interval: number;
}

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
  const { profile, user } = useAuth();
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const weekData = getWeekData(selectedWeek);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [kickCount, setKickCount] = useState(0);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isTimingContraction, setIsTimingContraction] = useState(false);
  const [contractionStart, setContractionStart] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showWeekLock, setShowWeekLock] = useState(false);

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
      .gte("created_at", todayStart.toISOString())
      .then(({ data }) => {
        if (data) setKickCount(data.reduce((sum, row) => sum + (row.count ?? 1), 0));
      });
  }, [user?.id]);

  useEffect(() => {
    if (!isTimingContraction || !contractionStart) return;
    const iv = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - contractionStart.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [isTimingContraction, contractionStart]);

  const addKick = async () => {
    setKickCount((k) => k + 1);
    navigator.vibrate?.(8);
    if (user) {
      await supabase.from("kick_counts").insert({ user_id: user.id, count: 1 });
    }
  };

  const toggleContraction = () => {
    if (!isTimingContraction) {
      setContractionStart(new Date());
      setIsTimingContraction(true);
      setElapsedSeconds(0);
      navigator.vibrate?.([20, 50, 20]);
      return;
    }
    if (!contractionStart) return;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - contractionStart.getTime()) / 1000);
    const lastStart = contractions.length > 0 ? contractions[contractions.length - 1].startTime : null;
    const interval = lastStart ? Math.floor((contractionStart.getTime() - lastStart.getTime()) / 1000) : 0;
    setContractions((prev) => [...prev, { startTime: contractionStart, endTime, duration, interval }]);
    setIsTimingContraction(false);
    setContractionStart(null);
    navigator.vibrate?.(15);
  };

  const avgInterval = (() => {
    const last3 = contractions.slice(-3).filter((c) => c.interval > 0);
    if (last3.length === 0) return 0;
    return Math.round(last3.reduce((a, c) => a + c.interval, 0) / last3.length);
  })();
  const shouldAlert =
    contractions.length >= 3 && avgInterval > 0 && avgInterval <= 300 &&
    contractions.slice(-3).every((c) => c.duration >= 60);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const fruitName = getFruitName(weekData.babySize);
  const currentData = getWeekData(currentWeek);

  const pickWeek = (w: number) => {
    if (w > currentWeek && !profile?.is_premium) {
      setShowWeekLock(true);
      return;
    }
    setSelectedWeek(w);
  };

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

        {/* Counters */}
        <div style={{ display: "flex", gap: 9, marginTop: 3 }}>
          <button
            onClick={addKick}
            className="gh-glass-subtle"
            style={{ flex: 1, padding: "14px 8px", textAlign: "center", cursor: "pointer" }}
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
          <button
            onClick={toggleContraction}
            className="gh-glass-subtle"
            style={{
              flex: 1, padding: "14px 8px", textAlign: "center", cursor: "pointer",
              ...(isTimingContraction ? { borderColor: "rgba(181,56,107,0.7)" } : {}),
            }}
          >
            <div className="font-gh-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--magenta)" }}>
              {isTimingContraction ? formatTimer(elapsedSeconds) : contractions.length}
            </div>
            <div style={{ fontSize: 10, color: "rgba(251,238,224,0.6)", marginTop: 3 }}>
              {isTimingContraction ? "timing…" : "contractions"}
            </div>
            <div style={{ fontSize: 10, marginTop: 9, color: "rgba(251,238,224,0.5)" }}>
              {isTimingContraction ? "tap to stop" : "tap to time"}
            </div>
          </button>
        </div>

        {shouldAlert && (
          <div
            className="gh-glass-dark"
            style={{ marginTop: 10, padding: "12px 14px", borderColor: "rgba(232,98,46,0.6)" }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", marginBottom: 3 }}>
              Your contractions are close together
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(251,238,224,0.75)", lineHeight: 1.5 }}>
              3+ contractions lasting a minute, about {Math.round(avgInterval / 60)} min apart — it may be
              time to call your provider.
            </div>
          </div>
        )}
      </div>

      <PremiumUpgradeSheet open={showWeekLock} onClose={() => setShowWeekLock(false)} />
    </SceneBackground>
  );
};

export default BabyTracker;
