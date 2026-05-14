interface Props {
  status?: string;
}

const DoulaLoadingState = ({ status = "Bella is reading your context…" }: Props) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--color-accent-light)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: 14,
    }}>🌸</div>
    <div className="v2-card" style={{ padding: "12px 14px", borderRadius: "18px 18px 18px 4px", maxWidth: "85%", flex: 1 }}>
      <div style={{
        height: 10, borderRadius: 6, marginBottom: 6,
        background: "linear-gradient(90deg, var(--color-bg-card-subtle) 25%, var(--color-border-default) 50%, var(--color-bg-card-subtle) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }} />
      <div style={{
        height: 10, width: "70%", borderRadius: 6, marginBottom: 10,
        background: "linear-gradient(90deg, var(--color-bg-card-subtle) 25%, var(--color-border-default) 50%, var(--color-bg-card-subtle) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }} />
      <p style={{
        fontFamily: "'Outfit', system-ui", fontSize: 12, fontStyle: "italic",
        color: "var(--color-text-muted)", marginBottom: 8,
      }}>{status}</p>
      <div style={{ display: "inline-flex", gap: 4 }}>
        {[0, 0.15, 0.3].map(d => (
          <span key={d} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-accent-primary)",
            animation: `typingBounce 1.2s infinite ${d}s`,
            display: "inline-block",
          }} />
        ))}
      </div>
    </div>
  </div>
);

export default DoulaLoadingState;
