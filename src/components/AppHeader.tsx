import { ReactNode } from "react";

interface AppHeaderProps {
  right?: ReactNode;
  left?: ReactNode; // overrides logo lockup
  center?: ReactNode; // overrides logo + replaces with centered content
}

const Logo = () => (
  <div>
    <h1
      className="font-display"
      style={{
        fontStyle: "italic", fontWeight: 400,
        fontSize: 22, lineHeight: 1, color: "#FFFFFF",
        letterSpacing: -0.5,
      }}
    >
      belly
    </h1>
    <p style={{
      fontFamily: "'Nunito',system-ui", fontSize: 7,
      letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)",
      marginTop: 2, textTransform: "uppercase", fontWeight: 600,
    }}>
      Virtual Doula
    </p>
  </div>
);

const AppHeader = ({ right, left, center }: AppHeaderProps) => {
  return (
    <header className="belly-header-bar rounded-b-[40px] shadow-[0_6px_20px_rgba(232,96,26,0.27)] border-b border-orange-200/40" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 60 }}>
      <span className="belly-header-glow" aria-hidden />
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1, flex: center ? 0 : 1 }}>
        {left ?? <Logo />}
      </div>
      {center && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          {center}
        </div>
      )}
      {right && (
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          {right}
        </div>
      )}
    </header>
  );
};

export default AppHeader;

export const HeaderGhostPill = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className="belly-press-scale" style={{
    background: "rgba(255,255,255,0.2)",
    border: "0.5px solid rgba(255,255,255,0.3)",
    borderRadius: 18, padding: "4px 11px",
    fontFamily: "'Nunito',system-ui", fontSize: 10, fontWeight: 500,
    color: "#FFFFFF", cursor: onClick ? "pointer" : "default",
  }}>{children}</button>
);

export const HeaderWhitePill = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className="belly-press-scale" style={{
    background: "#FFFFFF", color: "#E8702A",
    border: "none", borderRadius: 18, padding: "5px 13px",
    fontFamily: "'Nunito',system-ui", fontWeight: 700, fontSize: 11,
    boxShadow: "0 2px 8px rgba(232,112,42,0.25)", cursor: "pointer",
  }}>{children}</button>
);
