import { ReactNode, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminGuard } from "./AdminGuard";
import { C, fontTitle, fontUI } from "@/components/admin/ui";

type NavItem = { to: string; label: string; icon: string; end?: boolean };

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Live",
    items: [{ to: "/admin", label: "Mission Control", icon: "⚡", end: true }],
  },
  {
    section: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders & Revenue", icon: "💰" },
      { to: "/admin/products", label: "Content Manager", icon: "🛍️" },
      { to: "/admin/promo-codes", label: "Promo Codes", icon: "🏷️" },
    ],
  },
  {
    section: "Users",
    items: [
      { to: "/admin/users", label: "All Users", icon: "👤" },
      { to: "/admin/premium", label: "Premium Members", icon: "⭐" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { to: "/admin/ai", label: "Bella AI Insights", icon: "🤖" },
      { to: "/admin/community", label: "Community", icon: "📝" },
      { to: "/admin/broadcast", label: "Broadcast", icon: "📣" },
    ],
  },
  {
    section: "Support",
    items: [{ to: "/admin/support", label: "Support Tickets", icon: "🎫" }],
  },
  {
    section: "System",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: "📈" },
      { to: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

const LiveIndicator = () => {
  const [live, setLive] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const ch = supabase.channel("app-presence");
    ch.on("presence", { event: "sync" }, () => {
      setOnlineCount(Object.keys(ch.presenceState()).length);
    })
    .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: live ? "#22c55e" : "#444",
        boxShadow: live ? "0 0 8px rgba(34,197,94,0.7)" : "none",
        flexShrink: 0,
      }} />
      <span style={{ ...fontUI, fontSize: 10, color: live ? "#22c55e" : "#444", fontWeight: 700, letterSpacing: 1 }}>
        {live ? `LIVE · ${onlineCount} ONLINE` : "CONNECTING…"}
      </span>
    </div>
  );
};

const Footer = () => {
  const { user } = useAuth();
  const initial = (user?.email ?? "?").slice(0, 1).toUpperCase();
  return (
    <div style={{ padding: "12px 12px 16px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 10px" }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(232,112,42,0.18)", color: C.orange,
          display: "flex", alignItems: "center", justifyContent: "center",
          ...fontUI, fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{initial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ ...fontUI, fontSize: 11, color: "#bbb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email ?? "—"}
          </p>
          <p style={{ ...fontUI, fontSize: 9, color: C.muted, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>Administrator</p>
        </div>
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{ ...fontUI, width: "100%", background: "transparent", border: `1px solid ${C.border}`, color: "#666", fontSize: 11, padding: "7px", borderRadius: 7, cursor: "pointer" }}
      >
        Sign out
      </button>
    </div>
  );
};

const Sidebar = () => (
  <aside style={{
    width: 224, background: C.sidebar, borderRight: `1px solid ${C.border}`,
    flexShrink: 0, display: "flex", flexDirection: "column",
    height: "100vh", position: "sticky", top: 0,
  }}>
    <div style={{ padding: "22px 16px 8px" }}>
      <p style={{ ...fontTitle, fontSize: 22, color: C.orange, margin: 0, letterSpacing: "-0.5px" }}>belly</p>
      <p style={{ ...fontUI, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#383838", marginTop: 2, textTransform: "uppercase" }}>
        Admin Console
      </p>
    </div>

    <LiveIndicator />

    <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
      {NAV.map((group) => (
        <div key={group.section} style={{ marginBottom: 16 }}>
          <p style={{ ...fontUI, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#333", textTransform: "uppercase", padding: "4px 12px", margin: "0 0 2px" }}>
            {group.section}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 12px", borderRadius: 8,
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? C.orange : "#555",
                background: isActive ? "rgba(232,112,42,0.12)" : "transparent",
                textDecoration: "none", transition: "background 120ms, color 120ms",
                ...fontUI,
              })}
            >
              <span style={{ fontSize: 13, opacity: 0.9 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>

    <Footer />
  </aside>
);

const AdminShell = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: "100vh", background: C.bg, color: C.white, ...fontUI }}>
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", overflowX: "hidden", maxWidth: "calc(100vw - 224px)" }}>{children}</main>
    </div>
  </div>
);

const AdminLayout = () => (
  <AdminGuard>
    <AdminShell>
      <Outlet />
    </AdminShell>
  </AdminGuard>
);

export default AdminLayout;
