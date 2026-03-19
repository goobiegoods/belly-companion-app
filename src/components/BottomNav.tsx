import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, MessageCircle, Users, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/baby", icon: Heart, label: "Baby" },
  { path: "/ask", icon: MessageCircle, label: "Ask" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/me", icon: User, label: "Me" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-belly-card-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] belly-btn-press"
            >
              <Icon size={20} className={active ? "text-belly-accent" : "text-belly-text-hint"} />
              <span className={`text-[9px] uppercase tracking-[0.07em] ${active ? "text-belly-accent font-semibold" : "text-belly-text-hint"}`}>
                {label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-belly-accent" />}
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
