import { CSSProperties, ReactNode } from "react";

export type Scene = "today" | "ask" | "mamas" | "journey" | "baby" | "shop";

const SILHOUETTE_COLOR: Record<Scene, string> = {
  today: "#F2B647",
  ask: "#2C9C8F",
  mamas: "#B5386B",
  journey: "#F2B647",
  baby: "#2C9C8F",
  shop: "#E8622E",
};

const SILHOUETTE_POS: Record<Scene, CSSProperties> = {
  today: { bottom: -10, right: -40 },
  ask: { bottom: -30, right: -60 },
  mamas: { bottom: -20, left: -40 },
  journey: { top: -20, right: -50 },
  baby: { bottom: -10, right: -30 },
  shop: { bottom: -10, left: -40 },
};

/** Pregnant silhouette watermark — side profile with belly bump, per the reference SVG. */
function Silhouette({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 160 280"
      fill="none"
      aria-hidden
      style={{
        position: "absolute",
        width: 260,
        opacity: 0.14,
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      <path
        d="M80 8 C96 8 108 22 108 42 C108 54 104 62 100 70 C96 78 94 84 96 92 C100 104 112 110 114 128 C116 148 110 162 100 174 C88 186 76 196 70 214 C64 232 62 254 62 254 L42 254 C42 254 44 228 52 210 C60 192 70 180 76 164 C82 148 82 136 78 122 C74 110 62 104 58 90 C54 76 56 68 52 56 C48 42 50 24 66 14 C70 10 75 8 80 8 Z"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M96 92 C108 98 120 110 122 126 C124 142 116 154 104 162"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * Full-screen Golden Hour scene: per-screen gradient, film grain, and a
 * pregnant-silhouette watermark. Content renders above both layers.
 */
export function SceneBackground({
  scene,
  children,
  className = "",
}: {
  scene: Scene;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`gh-screen gh-scene-${scene} gh-grain ${className}`}>
      <Silhouette color={SILHOUETTE_COLOR[scene]} style={SILHOUETTE_POS[scene]} />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
