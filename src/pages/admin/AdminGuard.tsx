import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Loader = ({ msg }: { msg: string }) => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', system-ui",
      fontSize: 13,
      letterSpacing: 0.5,
    }}
  >
    {msg}
  </div>
);

const Denied = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12,
      fontFamily: "'Outfit', system-ui",
    }}
  >
    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, margin: 0 }}>Admin only</p>
    <p style={{ fontSize: 13, color: "#888", margin: 0 }}>You don't have access to this area.</p>
    <a href="/" style={{ marginTop: 8, color: "#FF8C42", fontSize: 13, textDecoration: "none" }}>← Back to app</a>
  </div>
);

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const location = useLocation();

  if (loading || roleLoading) return <Loader msg="Loading admin…" />;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (!isAdmin) return <Denied />;
  return <>{children}</>;
};

export default AdminGuard;
