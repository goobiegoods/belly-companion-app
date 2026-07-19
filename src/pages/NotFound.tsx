import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SceneBackground, GlassCard, BellaOrb } from "@/components/golden";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <SceneBackground scene="today">
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <GlassCard style={{ maxWidth: 340, width: "100%", textAlign: "center", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <BellaOrb size={44} />
          </div>
          <div className="gh-section-label">404 · lost the glow</div>
          <p className="gh-brand" style={{ fontSize: 26, marginBottom: 8 }}>Page not found</p>
          <p style={{ fontSize: 13, color: "rgba(251,238,224,0.7)", marginBottom: 20, lineHeight: 1.6 }}>
            This path doesn't lead anywhere — let's get you back to the light.
          </p>
          <button
            onClick={() => navigate("/")}
            className="belly-btn-press"
            style={{
              width: "100%",
              borderRadius: 14,
              padding: "13px 0",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to Today
          </button>
        </GlassCard>
      </div>
    </SceneBackground>
  );
};

export default NotFound;
