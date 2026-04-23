import { CSSProperties, ReactNode, useEffect } from "react";

export const C = {
  bg: "#0a0a0a",
  sidebar: "#080808",
  card: "#111111",
  border: "#1e1e1e",
  orange: "#FF8C42",
  white: "#ffffff",
  text: "#888888",
  muted: "#444444",
  success: "#22c55e",
  warning: "#FF8C42",
  danger: "#ef4444",
  info: "#3b82f6",
  premium: "#a855f7",
};

export const fontTitle: CSSProperties = { fontFamily: "'Fraunces', serif", fontWeight: 800, letterSpacing: -0.5 };
export const fontUI: CSSProperties = { fontFamily: "'Outfit', system-ui, sans-serif" };

export const Card = ({ children, style, padding = 18 }: { children: ReactNode; style?: CSSProperties; padding?: number }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding, ...style }}>{children}</div>
);

export const PageTitle = ({ title, right }: { title: string; right?: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
    <h1 style={{ ...fontTitle, fontSize: 28, color: C.white, margin: 0 }}>{title}</h1>
    {right}
  </div>
);

export const Label = ({ children }: { children: ReactNode }) => (
  <p style={{ ...fontUI, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase", margin: 0 }}>
    {children}
  </p>
);

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p style={{ ...fontUI, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 14px" }}>
    {children}
  </p>
);

type PillTone = "success" | "warning" | "danger" | "info" | "premium" | "neutral";
const TONE: Record<PillTone, { bg: string; fg: string }> = {
  success: { bg: "rgba(34,197,94,0.12)", fg: C.success },
  warning: { bg: "rgba(255,140,66,0.12)", fg: C.warning },
  danger: { bg: "rgba(239,68,68,0.12)", fg: C.danger },
  info: { bg: "rgba(59,130,246,0.12)", fg: C.info },
  premium: { bg: "rgba(168,85,247,0.12)", fg: C.premium },
  neutral: { bg: "rgba(255,255,255,0.05)", fg: "#aaa" },
};

export const StatusPill = ({ tone, children }: { tone: PillTone; children: ReactNode }) => {
  const t = TONE[tone];
  return (
    <span style={{ ...fontUI, display: "inline-flex", padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
};

export const MetricCard = ({ label, value, delta, deltaTone = "neutral" }: { label: string; value: string | number; delta?: string; deltaTone?: PillTone }) => (
  <Card>
    <Label>{label}</Label>
    <p style={{ ...fontTitle, fontSize: 28, color: C.white, margin: "10px 0 4px" }}>{value}</p>
    {delta && <p style={{ ...fontUI, fontSize: 11, color: TONE[deltaTone].fg, margin: 0 }}>{delta}</p>}
  </Card>
);

export const Btn = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  style?: CSSProperties;
}) => {
  const palette = {
    primary: { bg: C.orange, fg: "#1a0a00", border: C.orange },
    secondary: { bg: "transparent", fg: "#ddd", border: C.border },
    ghost: { bg: "transparent", fg: C.text, border: "transparent" },
    danger: { bg: "rgba(239,68,68,0.12)", fg: C.danger, border: "rgba(239,68,68,0.3)" },
  }[variant];
  const padding = size === "sm" ? "6px 10px" : "9px 14px";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...fontUI,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        borderRadius: 8,
        padding,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 120ms",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      ...fontUI,
      background: "#0c0c0c",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "9px 12px",
      color: C.white,
      fontSize: 13,
      outline: "none",
      width: "100%",
      ...props.style,
    }}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    style={{
      ...fontUI,
      background: "#0c0c0c",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "9px 12px",
      color: C.white,
      fontSize: 13,
      outline: "none",
      cursor: "pointer",
      ...props.style,
    }}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    style={{
      ...fontUI,
      background: "#0c0c0c",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "10px 12px",
      color: C.white,
      fontSize: 13,
      outline: "none",
      width: "100%",
      resize: "vertical",
      minHeight: 80,
      ...props.style,
    }}
  />
);

export const TabBar = ({ tabs, value, onChange }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }) => (
  <div style={{ display: "flex", gap: 4, padding: 4, background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 10, width: "fit-content", marginBottom: 18 }}>
    {tabs.map((t) => {
      const active = t.id === value;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            ...fontUI,
            background: active ? "rgba(255,140,66,0.12)" : "transparent",
            color: active ? C.orange : "#888",
            border: "none",
            padding: "7px 14px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span style={{ marginLeft: 6, fontSize: 10, color: active ? C.orange : "#555" }}>{t.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export const SlidePanel = ({ open, onClose, title, children, width = 520 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms",
          zIndex: 50,
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width,
          background: C.card,
          borderLeft: `1px solid ${C.border}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 240ms ease",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ ...fontTitle, fontSize: 20, color: C.white, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ ...fontUI, background: "transparent", border: "none", color: C.text, fontSize: 22, cursor: "pointer" }}>×</button>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</div>
      </aside>
    </>
  );
};

export const Modal = ({ open, onClose, title, children, width = 520 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
        <header style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ ...fontTitle, fontSize: 18, color: C.white, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.text, fontSize: 22, cursor: "pointer" }}>×</button>
        </header>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
};

export const Empty = ({ children }: { children: ReactNode }) => (
  <div style={{ ...fontUI, padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>{children}</div>
);

export const ago = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n >= 100 ? 0 : 2 });
