import { useEffect, useMemo, useState } from "react";
import AppHeader, { HeaderGhostPill } from "@/components/AppHeader";
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

const EMOJI: Record<Kind, string> = { breast: "🤱", bottle: "🍼", pump: "💧" };
const LABEL: Record<Kind, string> = { breast: "Breastfeed", bottle: "Bottle", pump: "Pump" };
const SUBLABEL: Record<Kind, string> = { breast: "Log session", bottle: "Log amount", pump: "Log output" };

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
    <div className="min-h-screen page-enter" style={{ background: "#F0E8DC", paddingBottom: 110, position: "relative", overflow: "hidden" }}>
      <AppHeader right={<HeaderGhostPill>today</HeaderGhostPill>} />
      <span className="belly-watermark" style={{ top: 70, right: -8, fontSize: 80 }}>feeds</span>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: "10px 16px 6px" }}>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 20, fontWeight: 800, color: "#1A0E06" }}>Feeding</p>
          <p className="font-display" style={{ fontSize: 26, fontStyle: "italic", color: "#E8702A", lineHeight: 1.05, marginTop: -2 }}>tracker</p>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "#C0907A", fontWeight: 600, marginTop: 4 }}>Log breast + bottle feeds easily</p>
        </div>

        {/* Summary */}
        <div style={{ padding: "10px 10px 0" }}>
          <div style={{
            background: "linear-gradient(135deg, #E8702A 0%, #C84E08 100%)",
            borderRadius: 18, padding: 14, position: "relative", overflow: "hidden",
            boxShadow: "0 4px 16px rgba(232,112,42,0.40)",
          }}>
            <span style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.09)" }} />
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, letterSpacing: "0.14em", color: "rgba(255,255,255,0.68)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>TODAY'S SUMMARY</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
              {[
                { val: today.length.toString(), label: "FEEDS", sub: "today" },
                { val: totalMl > 0 ? totalMl.toString() : "—", label: "ML", sub: "total" },
                { val: sinceLast, label: "SINCE", sub: "last feed" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 6px", textAlign: "center",
                  border: "0.5px solid rgba(255,255,255,0.25)",
                }}>
                  <p className="font-display" style={{ fontSize: 22, fontStyle: "italic", color: "#fff", lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, letterSpacing: "0.1em", color: "rgba(255,255,255,0.75)", fontWeight: 700, marginTop: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 7.5, color: "rgba(255,255,255,0.55)" }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick log */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, padding: "10px 10px 0" }}>
          {(["breast", "bottle", "pump"] as Kind[]).map(k => (
            <button key={k} onClick={() => setOpenSheet(k)} className="belly-card belly-press-scale" style={{
              padding: 12, textAlign: "center", borderRadius: 14, cursor: "pointer",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{EMOJI[k]}</div>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 800, color: "#A84818" }}>{LABEL[k]}</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "#C0A888", marginTop: 2 }}>{SUBLABEL[k]}</p>
            </button>
          ))}
        </div>

        {/* Today's log */}
        <div style={{ padding: "12px 12px 0" }}>
          <p className="belly-eyebrow" style={{ marginBottom: 6 }}>TODAY'S LOG</p>
          <div className="belly-card" style={{ padding: 0, overflow: "hidden" }}>
            {today.length === 0 ? (
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, color: "#C0907A", textAlign: "center", padding: 18 }}>
                No feeds logged today. Tap any button above to start.
              </p>
            ) : today.map((log, i) => (
              <div key={log.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderBottom: i < today.length - 1 ? "0.5px solid rgba(232,112,42,0.12)" : "none",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: "#FAEADA",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                }}>{EMOJI[log.kind]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 700, color: "#1A0E06" }}>{LABEL[log.kind]}</p>
                  <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8.5, color: "#C0A888" }}>
                    {fmtTime(log.logged_at)}
                    {log.duration_seconds ? ` · ${fmtDuration(log.duration_seconds)}` : ""}
                    {log.amount_ml ? ` · ${log.amount_ml} ml` : ""}
                    {log.side ? ` · ${log.side}` : ""}
                  </p>
                </div>
                <button onClick={() => deleteLog(log.id)} className="belly-pill-orange belly-press-scale" style={{ cursor: "pointer", fontSize: 9 }}>Done</button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly summary */}
        <div style={{ padding: "12px 12px 0" }}>
          <p className="belly-eyebrow" style={{ marginBottom: 6 }}>LAST 7 DAYS</p>
          <div className="belly-card" style={{ padding: 14 }}>
            <svg width="100%" height="70" viewBox="0 0 280 70" preserveAspectRatio="none">
              {week.map((d, i) => {
                const x = i * 40 + 8;
                const h = (d.feeds / maxFeeds) * 48;
                return (
                  <g key={i}>
                    <rect x={x} y={56 - h} width={22} height={h} rx={4} fill="#E8702A" opacity={0.85} />
                    <text x={x + 11} y={68} textAnchor="middle" fontSize="9" fill="#C0907A" fontFamily="Nunito" fontWeight={600}>{d.label}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1, background: "#FAEADA", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                <p className="font-display" style={{ fontSize: 18, fontStyle: "italic", color: "#A84818" }}>{avgFeeds}</p>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "#C0907A", fontWeight: 700, letterSpacing: "0.1em" }}>AVG FEEDS/DAY</p>
              </div>
              <div style={{ flex: 1, background: "#F0E8DC", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                <p className="font-display" style={{ fontSize: 18, fontStyle: "italic", color: "#7A5038" }}>{avgMl || "—"}</p>
                <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "#A08060", fontWeight: 700, letterSpacing: "0.1em" }}>AVG ML/DAY</p>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
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
    if (kind === "bottle") toast.success(`✓ Bottle logged — ${mlNum}ml saved!`);
    else if (kind === "pump") toast.success(`✓ Pump logged — ${mlNum}ml saved!`);
    else toast.success("✓ Breastfeed logged!");
    onSaved((data as FeedLog) || undefined);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(40,20,5,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-enter" style={{
        width: "100%", maxWidth: 430, background: "#F0E8DC",
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        boxShadow: "0 -10px 40px rgba(40,20,5,0.18)",
        maxHeight: "85vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 18px 16px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.15)" }} />
        </div>
        <h2 className="font-display" style={{ fontSize: 22, fontStyle: "italic", color: "#E8702A", marginBottom: 14 }}>
          Log {LABEL[kind].toLowerCase()}
        </h2>

        {(kind === "breast" || kind === "pump") && (
          <>
            <p className="belly-eyebrow" style={{ marginBottom: 6 }}>SIDE</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["Left", "Right", "Both"].map(s => (
                <button key={s} onClick={() => setSide(s)}
                  className={side === s ? "belly-pill-orange" : "belly-pill-neutral"}
                  style={{ cursor: "pointer", fontWeight: side === s ? 700 : 500 }}>{s}</button>
              ))}
            </div>
          </>
        )}

        {kind === "breast" && (
          <>
            <p className="belly-eyebrow" style={{ marginBottom: 6 }}>DURATION</p>
            <div style={{
              background: "#FFFFFF", border: "1.5px solid rgba(232,112,42,0.18)", borderRadius: 16,
              padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
            }}>
              <span className="font-display" style={{ fontSize: 28, fontStyle: "italic", color: "#A84818" }}>
                {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
              </span>
              <button onClick={() => timerStart ? setTimerStart(null) : setTimerStart(Date.now() - elapsed * 1000)}
                className="belly-btn-primary-v4" style={{ padding: "8px 16px", fontSize: 11 }}>
                {timerStart ? "Stop" : elapsed > 0 ? "Resume" : "Start"}
              </button>
            </div>
          </>
        )}

        {kind === "bottle" && (
          <>
            <p className="belly-eyebrow" style={{ marginBottom: 6 }}>TYPE</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { k: "breast_milk", label: "Breast milk" },
                { k: "formula", label: "Formula" },
                { k: "water", label: "Water" },
              ].map(t => (
                <button key={t.k} onClick={() => setBottleType(t.k)}
                  className={bottleType === t.k ? "belly-pill-orange" : "belly-pill-neutral"}
                  style={{ cursor: "pointer", fontWeight: bottleType === t.k ? 700 : 500 }}>{t.label}</button>
              ))}
            </div>
          </>
        )}

        {(kind === "bottle" || kind === "pump") && (
          <>
            <p className="belly-eyebrow" style={{ marginBottom: 6 }}>AMOUNT (ML)</p>
            <input
              value={ml} onChange={(e) => setMl(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric" placeholder="120"
              style={{
                width: "100%", background: "#FFFFFF", border: "1.5px solid rgba(232,112,42,0.18)",
                borderRadius: 16, padding: "12px 14px", fontFamily: "'Nunito',system-ui", fontSize: 14,
                color: "#1A0E06", marginBottom: 14, outline: "none",
              }}
            />
          </>
        )}

        <p className="belly-eyebrow" style={{ marginBottom: 6 }}>NOTES</p>
        <textarea
          value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..." rows={2}
          style={{
            width: "100%", background: "#FFFFFF", border: "1.5px solid rgba(232,112,42,0.18)",
            borderRadius: 16, padding: "12px 14px", fontFamily: "'Nunito',system-ui", fontSize: 13,
            color: "#1A0E06", resize: "none", outline: "none", marginBottom: 16,
          }}
        />

        <button onClick={save} disabled={saving} className="belly-btn-primary-v4"
          style={{ width: "100%", fontSize: 13, padding: 14, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "Save feed"}
        </button>
      </div>
    </div>
  );
};

export default FeedingTracker;
