import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellaOrb } from "./BellaOrb";

/** Soft pulsing glow orb behind the header. */
export function GlowOrb({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="gh-glow-orb"
      aria-hidden
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(3px)",
        animation: "ghOrbPulse 3.2s ease-in-out infinite",
        zIndex: 0,
        width: 210,
        height: 210,
        right: -50,
        top: -80,
        background:
          "radial-gradient(circle at 35% 35%, rgba(255,230,190,0.85), rgba(245,169,71,0.2) 55%, transparent 75%)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

const MENU_ITEMS: { label: string; to: string }[] = [
  { label: "My profile", to: "/me" },
  { label: "Journal", to: "/journal" },
  { label: "My orders", to: "/orders" },
  { label: "Courses", to: "/courses" },
  { label: "Can't sleep", to: "/cant-sleep" },
];

/** The ⋯ overflow menu every reference header carries. */
export function OverflowMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="gh-icon-btn" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 38,
            right: 0,
            zIndex: 40,
            minWidth: 168,
            background: "rgba(21,10,31,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            borderRadius: 14,
            padding: 6,
            boxShadow: "0 16px 40px -12px rgba(0,0,0,0.7)",
          }}
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                setOpen(false);
                navigate(item.to);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                color: "var(--cream)",
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 12px",
                borderRadius: 9,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Shared Golden Hour header: glow orb + brand row (optional Bella orb, brand,
 * mono tag) + right controls (⋯ menu and either a week pill or custom content).
 * Extra header content (greeting, progress bar, journey arc) renders as children.
 */
export function GhHeader({
  brand,
  tag,
  brandSize = 22,
  showOrb = false,
  showMenu = true,
  weekPill,
  right,
  glowStyle,
  children,
}: {
  brand: string;
  tag: string;
  brandSize?: number;
  showOrb?: boolean;
  showMenu?: boolean;
  weekPill?: string;
  right?: ReactNode;
  glowStyle?: React.CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div style={{ position: "relative", padding: "14px 18px 16px", zIndex: 10 }}>
      <GlowOrb style={glowStyle} />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {showOrb && <BellaOrb size={28} />}
          <div>
            <div className="gh-brand" style={{ fontSize: brandSize }}>
              {brand}
            </div>
            <div className="gh-brand-tag">{tag}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showMenu && <OverflowMenu />}
          {weekPill && <div className="gh-week-pill">{weekPill}</div>}
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}
