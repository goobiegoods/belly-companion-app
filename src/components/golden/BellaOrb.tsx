import { CSSProperties } from "react";

/** Bella's living avatar — a pulsing gold/ember orb (the redesign's signature element). */
export function BellaOrb({
  size = 26,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`gh-bella-orb ${className}`}
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        background:
          "radial-gradient(circle at 35% 30%, #fff2d8, var(--gold) 45%, var(--ember) 100%)",
        boxShadow: "0 0 10px rgba(242,182,71,0.7)",
        animation: "bellaPulse 2.8s ease-in-out infinite",
        ...style,
      }}
    />
  );
}
