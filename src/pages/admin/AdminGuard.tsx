import { Component, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AdminMfaGate } from "./AdminMfaGate";

const S = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 16, fontFamily: "'Outfit',system-ui,sans-serif", padding: 24 },
  h1: { fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, margin: 0, color: "#ffffff" },
  sub: { fontSize: 14, color: "#aaaaaa", margin: 0 },
  link: { marginTop: 8, color: "#FF8C42", fontSize: 14, textDecoration: "none", border: "1px solid #FF8C42", borderRadius: 8, padding: "8px 20px" },
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={S.page}>
          <p style={S.h1}>Admin Error</p>
          <p style={S.sub}>A rendering error occurred. Check the browser console.</p>
          <code style={{ fontSize: 11, color: "#ef4444", background: "#1a0000", padding: "10px 16px", borderRadius: 8, maxWidth: 600, wordBreak: "break-all" as const }}>{this.state.error}</code>
          <a href="/admin" style={S.link}>↺ Reload admin</a>
        </div>
      );
    }
    return this.props.children;
  }
}

const Loading = () => (
  <div style={S.page}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #FF8C42", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    <p style={S.sub}>Loading admin dashboard…</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Denied = ({ email, id, reason }: { email?: string; id: string; reason: string }) => (
  <div style={S.page}>
    <p style={S.h1}>Access denied</p>
    <p style={S.sub}>Logged in as <strong style={{ color: "#fff" }}>{email}</strong> — {reason}</p>
    <p style={{ ...S.sub, fontSize: 12 }}>User ID: {id}</p>
    <a href="/" style={S.link}>← Back to app</a>
  </div>
);

/** Role check runs only after two-factor: the database answers has_role(admin) for AAL2 sessions only. */
const RoleCheck = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return <Loading />;
  if (!isAdmin) return <Denied email={user?.email} id={user?.id ?? ""} reason="no admin role found." />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  // Email check is client-side defense-in-depth only — RLS (has_role, AAL2) remains the real enforcement.
  const isAllowedEmail = user.email?.toLowerCase() === "orelfitch@gmail.com";
  if (!isAllowedEmail) return <Denied email={user.email} id={user.id} reason="this account is not authorized for admin." />;

  return (
    <AdminMfaGate>
      <RoleCheck>{children}</RoleCheck>
    </AdminMfaGate>
  );
};

export default AdminGuard;
