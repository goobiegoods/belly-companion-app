import { ReactNode, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminGuard } from "./AdminGuard";
import { C, fontTitle, fontUI } from "@/components/admin/ui";

type NavItem = { to: string; label: string; icon: string; end?: boolean };

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: "📊", end: true },
      { to: "/admin/analytics", label: "Analytics", icon: "📈" },
    ],
  },
  {
    section: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: "📦" },
      { to: "/admin/promo-codes", label: "Promo Codes", icon: "🏷️" },
      { to: "/admin/products", label: "Products", icon: "🛍️" },
    ],
  },
  {
    section: "Users",
    items: [
      { to: "/admin/users", label: "All Users", icon: "👤" },
      { to: "/admin/premium", label: "Premium Members", icon: "⭐" },
      { to: "/admin/chats", label: "Doula Chat Logs", icon: "💬" },
    ],
  },
  {
    section: "Community",
    items: [{ to: "/admin/community", label: "All Posts", icon: "📝" }],
  },
  {
    section: "System",
    items: [
      { to: "/admin/broadcast", label: "Broadcast", icon: "📣" },
      { to: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

const LiveDot = () => {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const ch = supabase.channel("admin-presence").subscribe((status) => {
      setLive(status === "SUBSCRIBED");
    });
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px 14px" }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: live ? "#22c55e" : "#444",
          boxShadow: live ? "0 0 8px rgba(34,197,94,0.6)" : "none",
        }}
      />
      <span style={{ ...fontUI, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: live ? "#22c55e" : "#444" }}>
        {live ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  );
};

const Footer = () => {
  const { user } = useAuth();
  const initial = (user?.email ?? "?").slice(0, 1).toUpperCase();
  return (
    <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 10px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,140,66,0.15)",
            color: C.orange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...fontUI,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ ...fontUI, fontSize: 11, color: "#bbb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email ?? "—"}
          </p>
          <p style={{ ...fontUI, fontSize: 9, color: C.muted, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>Admin</p>
        </div>
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          ...fontUI,
          width: "100%",
          background: "transparent",
          border: `1px solid ${C.border}`,
          color: "#888",
          fontSize: 11,
          padding: "7px",
          borderRadius: 7,
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
};

const Sidebar = () => (
  <aside
    style={{
      width: 220,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}
  >
    <div style={{ padding: "20px 16px 6px" }}>
      <p style={{ ...fontTitle, fontSize: 20, color: C.orange, margin: 0 }}>belly</p>
      <p style={{ ...fontUI, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#333", marginTop: 2 }}>
        ADMIN · v1.0
      </p>
    </div>

    <LiveDot />

    <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
      {NAV.map((group) => (
        <div key={group.section} style={{ marginBottom: 14 }}>
          <p
            style={{
              ...fontUI,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: "#333",
              textTransform: "uppercase",
              padding: "6px 12px",
              margin: 0,
            }}
          >
            {group.section}
          </p>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? C.orange : "#555",
                background: isActive ? "rgba(255,140,66,0.12)" : "transparent",
                textDecoration: "none",
                transition: "background 120ms, color 120ms",
                ...fontUI,
              })}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
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
      <main style={{ flex: 1, padding: "28px 32px", overflowX: "hidden" }}>{children}</main>
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
