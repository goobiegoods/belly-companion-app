import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

type IconName = "today" | "baby" | "ask" | "mamas" | "shop" | "journey";

const Icon = ({ name, active }: { name: IconName; active: boolean }) => {
  const stroke = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
  const sw = 1.6;
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, shapeRendering: "geometricPrecision" as const, style: { display: "block" } };
  switch (name) {
    case "today":
      return <svg {...common}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>;
    case "baby":
      return <svg {...common}><path d="M20.8 6.6a5 5 0 0 0-8.8-2.2 5 5 0 0 0-8.8 2.2c0 6.2 8.8 11 8.8 11s8.8-4.8 8.8-11z"/></svg>;
    case "ask":
      return <svg {...common}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/></svg>;
    case "mamas":
      return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M14.5 20c0-2.4 1.6-4.4 3.5-5"/></svg>;
    case "shop":
      return <svg {...common}><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8a3 3 0 1 1 6 0"/></svg>;
    case "journey":
      return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.7-3.6 3.8-6 7.5-6s6.8 2.4 7.5 6"/></svg>;
  }
};

const tabs: { path: string; icon: IconName; label: string }[] = [
  { path: "/", icon: "today", label: "Today" },
  { path: "/baby", icon: "baby", label: "Baby" },
  { path: "/ask", icon: "ask", label: "Ask Bella" },
  { path: "/community", icon: "mamas", label: "Mamas" },
  { path: "/shop", icon: "shop", label: "Shop" },
  { path: "/me", icon: "journey", label: "Journey" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 z-50 rounded-t-[20px] shadow-[0_-6px_20px_rgba(232,96,26,0.27)] border-t border-orange-200/40" style={{
      width: "min(768px, 100%)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#D4500F",
    }}>
      <div className="flex items-center justify-around" style={{ padding: "10px 4px 14px" }}>
        {tabs.map(({ path, icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center belly-press-scale relative"
              style={{ minWidth: 48, paddingTop: 4, paddingBottom: 4 }}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon name={icon} active={active} />
                {path === "/shop" && cartCount > 0 && (
                  <div className="absolute flex items-center justify-center" style={{
                    top: -5, right: -8, minWidth: 16, height: 16, padding: "0 4px",
                    borderRadius: 999, background: "#FFFFFF",
                    border: "2px solid #C85818",
                    fontFamily: "'Nunito',system-ui", fontWeight: 700, fontSize: 9,
                    color: "#C85818", lineHeight: 1,
                  }}>{cartCount > 9 ? "9+" : cartCount}</div>
                )}
              </div>
              <span style={{
                fontFamily: "'Nunito',system-ui",
                fontSize: 10, fontWeight: 700,
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                marginTop: 4, letterSpacing: 0.2,
              }}>{label}</span>
              {active && (
                <span style={{
                  position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)",
                  width: 16, height: 2, borderRadius: 2, background: "#FFFFFF",
                }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ height: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
};

export default BottomNav;
