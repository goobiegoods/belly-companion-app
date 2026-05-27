import { useEffect, useRef, useState } from "react";
import AppHeader, { HeaderGhostPill } from "@/components/AppHeader";

type Phase = { label: string; sec: number };
const PHASES: Phase[] = [
  { label: "Inhale", sec: 4 },
  { label: "Hold",   sec: 7 },
  { label: "Exhale", sec: 8 },
];

const CATS = ["All", "Breathing", "Sleep", "Meditation", "Anxiety"];

const SESSIONS = [
  { emoji: "😴", title: "Sleep stories", count: 6, cat: "Sleep" },
  { emoji: "🧘", title: "Body scan",     count: 4, cat: "Meditation" },
  { emoji: "💆", title: "Anxiety relief", count: 8, cat: "Anxiety" },
];

const BreathingCircle = ({ size = 90 }: { size?: number }) => {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const idxRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const phase = PHASES[idxRef.current];
      // animate to target scale
      if (phase.label === "Inhale") setScale(1.18);
      else if (phase.label === "Hold") setScale(1.18);
      else setScale(1);
      const t = setTimeout(() => {
        if (cancelled) return;
        idxRef.current = (idxRef.current + 1) % PHASES.length;
        setIdx(idxRef.current);
        tick();
      }, phase.sec * 1000);
      return () => clearTimeout(t);
    };
    tick();
    return () => { cancelled = true; };
  }, []);

  const phase = PHASES[idx];
  const duration = phase.label === "Inhale" ? "4s" : phase.label === "Hold" ? "7s" : "8s";
  const transitionDur = phase.label === "Hold" ? 0 : phase.sec;

  return (
    <div style={{ position: "relative", width: size + 24, height: size + 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "8px auto" }}>
      <span style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
      <span style={{ position: "absolute", inset: -4, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(255,255,255,0.14)",
        border: "3px solid rgba(255,255,255,0.42)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transform: `scale(${scale})`,
        transition: `transform ${transitionDur}s ease-in-out`,
      }}>
        <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{phase.label}</span>
        <span style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginTop: 4 }}>{duration}</span>
      </div>
    </div>
  );
};

const BellyBreathe = () => {
  const [cat, setCat] = useState("All");
  const [full, setFull] = useState(false);

  const visible = cat === "All" ? SESSIONS : SESSIONS.filter(s => s.cat === cat);

  return (
    <div className="min-h-screen page-enter" style={{ background: "#F0E8DC", paddingBottom: 110, position: "relative", overflow: "hidden" }}>
      <AppHeader right={<HeaderGhostPill>breathe</HeaderGhostPill>} />
      <span className="belly-watermark" style={{ top: 70, left: -8, fontSize: 88 }}>breathe</span>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: "10px 16px 6px" }}>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 20, fontWeight: 800, color: "#1A0E06" }}>Belly</p>
          <p className="font-display" style={{ fontSize: 26, fontStyle: "italic", color: "#E8702A", lineHeight: 1.05, marginTop: -2 }}>breathe & rest</p>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "#C0907A", fontWeight: 600, marginTop: 4 }}>Guided calm for you and baby</p>
        </div>

        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, padding: "10px 14px 12px", overflowX: "auto" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={c === cat ? "belly-pill-orange" : "belly-pill-neutral"}
              style={{ flexShrink: 0, cursor: "pointer", fontWeight: c === cat ? 700 : 500 }}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured */}
        <div style={{ padding: "0 11px", marginBottom: 10 }}>
          <div style={{
            background: "linear-gradient(135deg, #E8702A 0%, #C84E08 100%)",
            borderRadius: 20, padding: 18, position: "relative", overflow: "hidden",
            boxShadow: "0 6px 20px rgba(232,112,42,0.45)",
          }}>
            <span style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.09)" }} />
            <span style={{ position: "absolute", bottom: -25, left: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, letterSpacing: "0.14em", color: "rgba(255,255,255,0.70)", fontWeight: 700, textTransform: "uppercase" }}>FEATURED</p>
            <BreathingCircle />
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 14, fontWeight: 800, color: "#fff", textAlign: "center", marginTop: 6 }}>4-7-8 Breath</p>
            <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 10, color: "rgba(255,255,255,0.78)", textAlign: "center", marginTop: 2 }}>
              Calm your nervous system in 60 seconds
            </p>
            <button onClick={() => setFull(true)} className="belly-press-scale" style={{
              display: "block", margin: "12px auto 0", background: "rgba(255,255,255,0.20)",
              border: "0.5px solid rgba(255,255,255,0.30)", borderRadius: 10, padding: "9px 18px",
              fontFamily: "'Nunito',system-ui", fontWeight: 800, fontSize: 11, color: "#fff", cursor: "pointer",
            }}>Start breathing →</button>
          </div>
        </div>

        {/* Category cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, padding: "0 11px", marginBottom: 10 }}>
          {visible.map(s => (
            <div key={s.title} className="belly-card" style={{ padding: 12, textAlign: "center", borderRadius: 14 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, fontWeight: 700, color: "#7A4818", lineHeight: 1.3 }}>{s.title}</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 8, color: "#C0A888", marginTop: 2 }}>{s.count} sessions</p>
            </div>
          ))}
        </div>

        {/* Continue */}
        <div style={{ padding: "0 12px" }}>
          <div className="belly-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, background: "#FAEADA",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
            }}>🌙</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="belly-eyebrow" style={{ marginBottom: 2 }}>CONTINUE</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, fontWeight: 700, color: "#1A0E06" }}>Evening wind-down</p>
              <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 9, color: "#C0A888" }}>10 min · Sleep</p>
            </div>
            <button onClick={() => setFull(true)} className="belly-press-scale" style={{
              width: 28, height: 28, borderRadius: "50%", background: "#E8702A", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(232,112,42,0.4)",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {full && (
        <div onClick={() => setFull(false)} style={{
          position: "fixed", inset: 0, zIndex: 300, background: "linear-gradient(160deg, #E8702A 0%, #C84E08 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 11, letterSpacing: "0.14em", color: "rgba(255,255,255,0.70)", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>4-7-8 BREATH</p>
          <BreathingCircle size={180} />
          <p style={{ fontFamily: "'Nunito',system-ui", fontSize: 12, color: "rgba(255,255,255,0.80)", marginTop: 28 }}>Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
};

export default BellyBreathe;
