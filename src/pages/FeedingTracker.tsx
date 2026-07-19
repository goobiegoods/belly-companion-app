import { useEffect, useMemo, useState } from "react";
import { Baby, Milk, Droplets } from "lucide-react";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Kind = "breast" | "bottle" | "pump";

interface FeedLog {
  id: string;
  kind: Kind;
  side: string | null;
  duration_seconds: number | null;
  amount_ml: number | null;
  bottle_type: string | null;
  notes: string | null;
  logged_at: string;
}

const ICONS: Record<Kind, typeof Baby> = { breast: Baby, bottle: Milk, pump: Droplets };
const LABEL: Record<Kind, string> = { breast: "Breastfeed", bottle: "Bottle", pump: "Pump" };
const SUBLABEL: Record<Kind, string> = { breast: "Log session", bottle: "Log amount", pump: "Log output" };
const TILE_CLASS: Record<Kind, string> = {
  breast: "gh-tile-teal",
  bottle: "gh-tile-ember",
  pump: "gh-tile-magenta",
};
const ICON_COLOR: Record<Kind, string> = {
  breast: "var(--teal)",
  bottle: "var(--ember)",
  pump: "var(--magenta)",
};

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
const fmtDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
const fmtAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const dim = "rgba(251,238,224,0.7)";
const faint = "rgba(251,238,224,0.55)";

const StatCell = ({ value, label, sub }: { value: string; label: string; sub: string }) => (
  <div style={{ textAlign: "center" }}>
    <div className="font-gh-mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--gold)", lineHeight: 1.1 }}>
      {value}
    </div>
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: dim,
        marginTop: 5,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 9.5, color: faint, marginTop: 1 }}>{sub}</div>
  </div>
);

const FeedingTracker = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FeedLog[]>([]);
  const [openSheet, setOpenSheet] = useState<Kind | null>(null);

  const fetchLogs = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("feed_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(200);
    if (data) setLogs(data as any);
  };

  useEffect(() => { fetchLogs(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return logs.filter(l => new Date(l.logged_at) >= start);
  }, [logs]);

  const totalMl = today.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
  const lastLog = today[0];
  const sinceLast = lastLog ? fmtAgo(lastLog.logged_at) : "—";

  // 7-day chart
  const week = useMemo(() => {
    const days: { label: string; feeds: number; ml: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayLogs = logs.filter(l => {
        const t = new Date(l.logged_at);
        return t >= d && t < next;
      });
      days.push({
        label: d.toLocaleDateString([], { weekday: "narrow" }),
        feeds: dayLogs.length,
        ml: dayLogs.reduce((s, l) => s + (l.amount_ml || 0), 0),
      });
    }
    return days;
  }, [logs]);

  const maxFeeds = Math.max(1, ...week.map(d => d.feeds));
  const avgFeeds = (week.reduce((s, d) => s + d.feeds, 0) / 7).toFixed(1);
  const avgMl = Math.round(week.reduce((s, d) => s + d.ml, 0) / 7);

  const deleteLog = async (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    await supabase.from("feed_logs").delete().eq("id", id);
  };

  return (
    <SceneBackground scene="baby">
      <GhHeader
        brand="Feeding"
        tag="every feed, remembered"
        brandSize={20}
        weekPill="today"
        glowStyle={{
          left: -40, right: "auto", top: -70,
          background:
            "radial-gradient(circle at 35% 35%, rgba(180,240,230,0.7), rgba(44,156,143,0.2) 55%, transparent 75%)",
        }}
      />

      <div style={{ padding: "12px 16px 110px" }}>
        {/* Today totals */}
        <GlassCard>
          <div className="gh-section-label">today's summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 2 }}>
            <StatCell value={today.length.toString()} label="feeds" sub="today" />
            <StatCell value={totalMl > 0 ? totalMl.toString() : "—"} label="ml" sub="total" />
            <StatCell value={sinceLast} label="since" sub="last feed" />
          </div>
        </GlassCard>

        {/* Quick log */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 12 }}>
          {(["breast", "bottle", "pump"] as Kind[]).map(k => {
            const Icon = ICONS[k];
            const selected = openSheet === k;
            return (
              <button
                key={k}
                onClick={() => setOpenSheet(k)}
                className={`gh-tile ${TILE_CLASS[k]} belly-btn-press`}
                style={{
                  border: selected ? "1px solid var(--gold)" : undefined,
                  color: "var(--cream)",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  style={{ color: ICON_COLOR[k], marginBottom: 6 }}
                  aria-hidden
                />
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--cream)" }}>{LABEL[k]}</div>
                <div style={{ fontSize: 9, color: faint, marginTop: 2 }}>{SUBLABEL[k]}</div>
              </button>
            );
          })}
        </div>

        {/* Today's log */}
        <div className="gh-section-label">today's log</div>
        {today.length === 0 ? (
          <div className="gh-glass-subtle" style={{ padding: "16px 14px", marginBottom: 12 }}>
            <p style={{ fontSize: 11.5, color: faint, textAlign: "center" }}>
              No feeds logged today. Tap any button above to start.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
            {today.map(log => {
              const Icon = ICONS[log.kind];
              return (
                <div
                  key={log.id}
                  className="gh-glass-subtle"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}
                >
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid var(--glass-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon size={15} strokeWidth={1.8} style={{ color: ICON_COLOR[log.kind] }} aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cream)" }}>
                        {LABEL[log.kind]}
                      </span>
                      {log.side && (
                        <span
                          style={{
                            fontSize: 8.5, fontFamily: "'JetBrains Mono', monospace",
                            textTransform: "uppercase", letterSpacing: "0.08em",
                            padding: "2px 7px", borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.2)", color: dim,
                          }}
                        >
                          {log.side}
                        </span>
                      )}
                    </div>
                    <div
                      className="font-gh-mono"
                      style={{ fontSize: 9.5, color: faint, marginTop: 3 }}
                    >
                      {fmtTime(log.logged_at)}
                      {log.duration_seconds ? ` · ${fmtDuration(log.duration_seconds)}` : ""}
                      {log.amount_ml ? ` · ${log.amount_ml} ml` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="belly-btn-press"
                    style={{
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                      padding: "5px 12px", borderRadius: 14,
                      background: "transparent", color: dim,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    Done
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly summary */}
        <div className="gh-section-label">last 7 days</div>
        <GlassCard>
          <svg width="100%" height="70" viewBox="0 0 280 70" preserveAspectRatio="none">
            {week.map((d, i) => {
              const x = i * 40 + 8;
              const h = (d.feeds / maxFeeds) * 48;
              return (
                <g key={i}>
                  <rect x={x} y={56 - h} width={22} height={Math.max(h, 2)} rx={4}
                    fill={d.feeds > 0 ? "var(--gold)" : "rgba(251,238,224,0.15)"} opacity={0.9} />
                  <text x={x + 11} y={68} textAnchor="middle" fontSize="9"
                    fill="rgba(251,238,224,0.55)" fontFamily="'JetBrains Mono', monospace">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: "flex", gap: 9, marginTop: 10 }}>
            <div className="gh-glass-subtle" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
              <div className="font-gh-mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--gold)" }}>
                {avgFeeds}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: faint, marginTop: 4,
                }}
              >
                avg feeds/day
              </div>
            </div>
            <div className="gh-glass-subtle" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
              <div className="font-gh-mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--teal)" }}>
                {avgMl || "—"}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: faint, marginTop: 4,
                }}
              >
                avg ml/day
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {openSheet && (
        <LogSheet
          kind={openSheet}
          onClose={() => setOpenSheet(null)}
          onSaved={(optimistic) => {
            if (optimistic) setLogs(prev => [optimistic, ...prev]);
            setOpenSheet(null);
            fetchLogs();
          }}
        />
      )}
    </SceneBackground>
  );
};

const sheetFieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid var(--glass-border)",
  borderRadius: 14,
  padding: "12px 14px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 13,
  color: "var(--cream)",
  outline: "none",
};

const LogSheet = ({ kind, onClose, onSaved }: { kind: Kind; onClose: () => void; onSaved: (optimistic?: FeedLog) => void }) => {
  const { user } = useAuth();
  const [side, setSide] = useState<string>("Both");
  const [ml, setMl] = useState("");
  const [bottleType, setBottleType] = useState("breast_milk");
  const [notes, setNotes] = useState("");
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (timerStart === null) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - timerStart) / 1000)), 500);
    return () => clearInterval(iv);
  }, [timerStart]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload: any = { user_id: user.id, kind, notes: notes.trim() || null };
    if (kind === "breast") {
      payload.side = side;
      payload.duration_seconds = elapsed;
    } else if (kind === "bottle") {
      payload.amount_ml = parseInt(ml) || null;
      payload.bottle_type = bottleType;
    } else {
      payload.side = side;
      payload.amount_ml = parseInt(ml) || null;
    }
    const { data, error } = await supabase.from("feed_logs").insert(payload).select().single();
    setSaving(false);
    if (error) { toast.error("Couldn't save feed"); return; }
    const mlNum = parseInt(ml) || 0;
    if (kind === "bottle") toast.success(`Bottle logged — ${mlNum}ml saved`);
    else if (kind === "pump") toast.success(`Pump logged — ${mlNum}ml saved`);
    else toast.success("Breastfeed logged");
    onSaved((data as FeedLog) || undefined);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,4,18,0.6)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-down" style={{
        width: "100%", maxWidth: 430,
        background: "rgba(21,10,31,0.94)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--glass-border)", borderTop: "none",
        borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
        boxShadow: "0 20px 60px -12px rgba(0,0,0,0.7)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        color: "var(--cream)",
      }}>
        <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "18px 18px 16px" }}>
          <h2 className="font-gh-serif" style={{ fontSize: 21, fontStyle: "italic", fontWeight: 600, color: "var(--gold)", marginBottom: 16 }}>
            Log {LABEL[kind].toLowerCase()}
          </h2>

          {(kind === "breast" || kind === "pump") && (
            <>
              <p className="gh-section-label" style={{ marginBottom: 7 }}>side</p>
              <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                {["Left", "Right", "Both"].map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className={side === s ? "gh-pill gh-pill-filled belly-btn-press" : "gh-pill belly-btn-press"}
                    style={{ fontWeight: side === s ? 600 : 500 }}>{s}</button>
                ))}
              </div>
            </>
          )}

          {kind === "breast" && (
            <>
              <p className="gh-section-label" style={{ marginBottom: 7 }}>duration</p>
              <div className="gh-glass-subtle" style={{
                padding: "16px 16px", display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 16,
              }}>
                <span className="font-gh-mono" style={{ fontSize: 34, fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                </span>
                <button onClick={() => timerStart ? setTimerStart(null) : setTimerStart(Date.now() - elapsed * 1000)}
                  className="belly-btn-press"
                  style={{
                    padding: "9px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg, var(--gold), var(--ember))",
                    color: "var(--night)",
                  }}>
                  {timerStart ? "Stop" : elapsed > 0 ? "Resume" : "Start"}
                </button>
              </div>
            </>
          )}

          {kind === "bottle" && (
            <>
              <p className="gh-section-label" style={{ marginBottom: 7 }}>type</p>
              <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                  { k: "breast_milk", label: "Breast milk" },
                  { k: "formula", label: "Formula" },
                  { k: "water", label: "Water" },
                ].map(t => (
                  <button key={t.k} onClick={() => setBottleType(t.k)}
                    className={bottleType === t.k ? "gh-pill gh-pill-filled belly-btn-press" : "gh-pill belly-btn-press"}
                    style={{ fontWeight: bottleType === t.k ? 600 : 500 }}>{t.label}</button>
                ))}
              </div>
            </>
          )}

          {(kind === "bottle" || kind === "pump") && (
            <>
              <p className="gh-section-label" style={{ marginBottom: 7 }}>amount (ml)</p>
              <input
                value={ml} onChange={(e) => setMl(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric" placeholder="120"
                style={{
                  ...sheetFieldStyle,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15, marginBottom: 16,
                }}
              />
            </>
          )}

          <p className="gh-section-label" style={{ marginBottom: 7 }}>notes</p>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..." rows={2}
            style={{ ...sheetFieldStyle, resize: "none", marginBottom: 4 }}
          />
        </div>

        <div style={{
          flexShrink: 0, borderTop: "1px solid var(--glass-border)",
          padding: "12px 18px 4px",
        }}>
          <button onClick={save} disabled={saving}
            className="belly-btn-press"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 14.5,
              borderRadius: 16, padding: 14, border: "none",
              opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer",
              boxShadow: "0 8px 24px -8px rgba(242,182,71,0.5)",
            }}>
            {saving ? "Saving..." : "Save log"}
          </button>
        </div>
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "8px 0 12px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(251,238,224,0.25)" }} />
        </div>
      </div>
    </div>
  );
};

export default FeedingTracker;
