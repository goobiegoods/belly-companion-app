import { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const NAV = [
  { to: "/admin", label: "Overview", icon: "📊", end: true },
  { to: "/admin/orders", label: "Orders", icon: "🛍️" },
  { to: "/admin/users", label: "Users", icon: "👤" },
  { to: "/admin/community", label: "Community", icon: "💬" },
  { to: "/admin/products", label: "Products", icon: "🌿" },
];

const AdminShell = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: "100vh", background: "#0F0F11", color: "#F5F5F7", fontFamily: "'Outfit', system-ui" }}>
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "#16161A", borderRight: "1px solid #26262C", padding: "24px 12px", flexShrink: 0 }}>
        <div style={{ padding: "0 12px 24px", borderBottom: "1px solid #26262C", marginBottom: 16 }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: "#FF8C42", letterSpacing: -0.5 }}>belly</p>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "#7A7A85", marginTop: 2 }}>ADMIN</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? "#FF8C42" : "#C8C8D0",
                background: isActive ? "rgba(255,140,66,0.10)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ position: "absolute", bottom: 16, left: 12, width: 216 }}>
          <NavLink to="/" style={{ display: "block", padding: "10px 12px", borderRadius: 10, fontSize: 12, color: "#7A7A85", textDecoration: "none" }}>
            ← Back to app
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 40px", overflow: "auto" }}>{children}</main>
    </div>
  </div>
);

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  if (loading || isAdmin === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F11", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui" }}>
        Loading admin…
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F11", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui", flexDirection: "column", gap: 12 }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700 }}>Admin only</p>
        <p style={{ fontSize: 13, color: "#7A7A85" }}>You don't have access to this area.</p>
        <NavLink to="/" style={{ marginTop: 8, color: "#FF8C42", fontSize: 13, textDecoration: "none" }}>← Back to app</NavLink>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
};

export default AdminLayout;
