import { CSSProperties, ReactNode } from "react";

/** Frosted glass card — the Golden Hour surface for all content blocks. */
export function GlassCard({
  children,
  className = "",
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={`gh-glass ${className}`}
      style={{ padding: "16px 16px 18px", marginBottom: 12, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
