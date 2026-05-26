import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, MessageCircle, Users, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const tabs = [
  { path: "/", icon: Home, label: "Today" },
  { path: "/baby", icon: Heart, label: "Baby" },
  { path: "/ask", icon: MessageCircle, label: "Ask Bella" },
  { path: "/community", icon: Users, label: "Mamas" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/me", icon: User, label: "Journey" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      maxWidth: 430,
      margin: "0 auto",
      background: "var(--color-bg-base)",
      borderTop: "1px solid var(--color-border-default)",
    }}>
      <div className="flex items-center justify-around" style={{ height: 64 }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          const color = active ? "var(--color-accent-primary)" : "var(--color-text-muted)";
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center belly-btn-press relative"
              style={{ minWidth: 48, minHeight: 48, paddingTop: 8, paddingBottom: 6 }}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon size={22} style={{ color }} strokeWidth={active ? 2.4 : 2} />
                {path === "/shop" && cartCount > 0 && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      top: -5, right: -7,
                      minWidth: 16, height: 16, padding: "0 4px",
                      borderRadius: 999,
                      background: "var(--color-accent-primary)",
                      border: "2px solid var(--color-bg-base)",
                      fontFamily: "'Outfit', system-ui",
                      fontWeight: 700, fontSize: 9,
                      color: "#fff", lineHeight: 1,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: active ? 600 : 500,
                  color,
                  marginTop: 3,
                  letterSpacing: 0.1,
                }}
              >
                {label}
              </span>
              {active && (
                <span style={{
                  position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                  width: 22, height: 2, borderRadius: 2, background: "var(--color-accent-primary)",
                }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ height: "calc(env(safe-area-inset-bottom))" }} />
    </nav>
  );
};

export default BottomNav;
