import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PremiumSuccess = () => {
  const navigate = useNavigate();
  const { refreshProfile, profile } = useAuth();
  const [polling, setPolling] = useState(true);

  // Webhook may take a few seconds to process — poll the profile until is_premium flips.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      attempts += 1;
      await refreshProfile();
      if (cancelled) return;
      if (profile?.is_premium || attempts >= 8) {
        setPolling(false);
        return;
      }
      setTimeout(tick, 1500);
    };
    tick();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 page-enter" style={{ background: "transparent" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
      <h1 style={{
        fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: "#fff",
        textAlign: "center", letterSpacing: -1, marginBottom: 10,
      }}>Welcome to Belly Premium!</h1>
      <p style={{
        fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 300,
        color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 1.55,
        maxWidth: 340, marginBottom: 12,
      }}>
        Your 7-day free trial has started. Enjoy unlimited doula access, all premium courses, and more. 🌸
      </p>
      {polling && !profile?.is_premium && (
        <p style={{
          fontFamily: "'Outfit', system-ui", fontSize: 12,
          color: "rgba(255,255,255,0.65)", marginBottom: 20, fontStyle: "italic",
        }}>
          Activating your benefits…
        </p>
      )}
      {profile?.is_premium && (
        <p style={{
          fontFamily: "'Outfit', system-ui", fontSize: 12,
          color: "rgba(255,255,255,0.85)", marginBottom: 20, fontWeight: 600,
        }}>
          ✓ All Premium features unlocked
        </p>
      )}
      <button onClick={() => navigate("/")}
        style={{
          background: "#fff", color: "#FF8C42",
          fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16,
          borderRadius: 14, padding: "14px 28px", border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}>
        Start exploring →
      </button>
    </div>
  );
};

export default PremiumSuccess;
