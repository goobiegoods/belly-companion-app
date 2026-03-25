import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Heart, MessageCircle, Users, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/baby", icon: Heart, label: "Baby" },
  { path: "/ask", icon: MessageCircle, label: "Ask" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/me", icon: User, label: "Me" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-belly-card-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 min-w-[48px] belly-btn-press relative"
            >
              <div className="relative" style={{ transition: "transform 200ms ease", transform: active ? "translateY(-2px)" : "none" }}>
                <Icon size={20} className={active ? "text-belly-accent" : "text-belly-text-hint"} />
                {path === "/community" && unreadNotifs > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "#FF6B6B" }} />
                )}
              </div>
              <span className={`text-[9px] uppercase tracking-[0.07em] ${active ? "text-belly-accent font-semibold" : "text-belly-text-hint"}`}>
                {label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-belly-accent" style={{ animation: "dotScale 200ms cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
