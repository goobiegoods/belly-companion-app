import { useNavigate } from "react-router-dom";

const PremiumSuccess = () => {
  const navigate = useNavigate();
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
        maxWidth: 340, marginBottom: 32,
      }}>
        Your 7-day free trial has started. Enjoy unlimited doula access, all premium courses, and more. 🌸
      </p>
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
