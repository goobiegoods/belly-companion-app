import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

type IconName = "today" | "baby" | "ask" | "mamas" | "shop" | "journey";

const Icon = ({ name, active }: { name: IconName; active: boolean }) => {
  const stroke = active ? "var(--gold)" : "rgba(251,238,224,0.55)";
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    shapeRendering: "geometricPrecision" as const,
    style: { display: "block" },
  };
  switch (name) {
    case "today":
      return <svg {...common}><path d="M3 11l9-7 9 7M5 10v9h14v-9" /></svg>;
    case "baby":
      return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M6 20c0-4 3-6 6-6s6 2 6 6" /></svg>;
    case "ask":
      return <svg {...common}><path d="M4 5h16v11H8l-4 4V5z" /></svg>;
    case "mamas":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-2.5 2-4 4.5-4s3.5 1.5 3.5 3" /></svg>;
    case "shop":
      return <svg {...common}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>;
    case "journey":
      return <svg {...common}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></svg>;
  }
};

const tabs: { path: string; icon: IconName; label: string }[] = [
  { path: "/", icon: "today", label: "Today" },
  { path: "/baby", icon: "baby", label: "Baby" },
  { path: "/ask", icon: "ask", label: "Ask Bella" },
  { path: "/community", icon: "mamas", label: "Mamas" },
  { path: "/shop", icon: "shop", label: "Shop" },
  { path: "/journey", icon: "journey", label: "Journey" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <nav
      className="gh-bottom-nav fixed bottom-0 z-50"
      style={{
        width: "min(430px, 100%)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,6,16,0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="flex items-center justify-around" style={{ padding: "11px 4px 13px" }}>
        {tabs.map(({ path, icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center belly-press-scale relative"
              style={{ minWidth: 48, paddingTop: 2, paddingBottom: 2, gap: 4 }}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon name={icon} active={active} />
                {path === "/shop" && cartCount > 0 && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      top: -5, right: -8, minWidth: 15, height: 15, padding: "0 4px",
                      borderRadius: 999, background: "var(--gold)",
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 9,
                      color: "var(--night)", lineHeight: 1,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 9.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--gold)" : "rgba(251,238,224,0.55)",
                  letterSpacing: 0.2,
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  style={{
                    width: 3, height: 3, borderRadius: "50%",
                    background: "var(--gold)", marginTop: -1,
                  }}
                />
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
