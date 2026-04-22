import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Heart, MessageCircle, Users, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

const tabs = [
  { path: "/", icon: Home, label: "HOME" },
  { path: "/baby", icon: Heart, label: "BABY" },
  { path: "/ask", icon: MessageCircle, label: "ASK" },
  { path: "/community", icon: Users, label: "COMMUNITY" },
  { path: "/shop", icon: ShoppingBag, label: "SHOP" },
  { path: "/me", icon: User, label: "ME" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => setUnreadNotifs(count || 0));
  }, [user, location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      maxWidth: 430,
      margin: "0 auto",
      background: "rgba(200,80,10,0.40)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      borderTop: "1px solid rgba(255,255,255,0.15)",
    }}>
      <div className="flex items-center justify-around" style={{ height: 56 }}>
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center min-w-[48px] belly-btn-press relative"
              style={{ paddingBottom: 3 }}
            >
              <div className="relative" style={{ transition: "transform 200ms ease", transform: active ? "translateY(-1px)" : "none" }}>
                <Icon size={20} style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }} />
                {path === "/community" && unreadNotifs > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "#FF6B6B" }} />
                )}
                {path === "/shop" && cartCount > 0 && (
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      top: -4, right: -4,
                      width: 16, height: 16,
                      borderRadius: "50%",
                      background: "#FF8C42",
                      border: "2px solid rgba(210,80,10,0.92)",
                      fontFamily: "'Outfit', system-ui",
                      fontWeight: 700,
                      fontSize: 9,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {label}
              </span>
              {active && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#fff",
                    marginTop: 3,
                    animation: "dotScale 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ height: "calc(8px + env(safe-area-inset-bottom))" }} />
    </nav>
  );
};

export default BottomNav;
