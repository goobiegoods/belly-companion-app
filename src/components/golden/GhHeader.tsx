import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
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

/** Small circle button in the header's top-right — one tap straight to Learn. */
export function LearnButton() {
  const navigate = useNavigate();
  return (
    <button className="gh-icon-btn" aria-label="Learn" onClick={() => navigate("/learn")}>
      <BookOpen size={15} strokeWidth={1.8} style={{ color: "var(--cream)" }} />
    </button>
  );
}

/**
 * Shared Golden Hour header: glow orb + brand row (optional Bella orb, brand,
 * mono tag) + right controls (Learn button and either a week pill or custom
 * content). Extra header content (greeting, progress bar, journey arc) renders
 * as children.
 */
export function GhHeader({
  brand,
  tag,
  brandSize = 22,
  showOrb = false,
  showLearn = true,
  weekPill,
  right,
  glowStyle,
  children,
}: {
  brand: string;
  tag: string;
  brandSize?: number;
  showOrb?: boolean;
  showLearn?: boolean;
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
          {showLearn && <LearnButton />}
          {weekPill && <div className="gh-week-pill">{weekPill}</div>}
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}
