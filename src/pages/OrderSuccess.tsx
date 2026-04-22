import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 page-enter" style={{ background: "transparent" }}>
      <div style={{
        width: 84, height: 84, borderRadius: "50%", background: "rgba(255,255,255,0.22)",
        border: "1px solid rgba(255,255,255,0.32)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, fontSize: 40,
      }}>🎉</div>
      <h1 style={{
        fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: "#fff",
        textAlign: "center", letterSpacing: -1, marginBottom: 10,
      }}>Order received!</h1>
      <p style={{
        fontFamily: "'Outfit', system-ui", fontSize: 14, fontWeight: 300,
        color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 1.55,
        maxWidth: 320, marginBottom: 32,
      }}>
        We'll process your order and reach out with shipping details within 24 hours. 🌸
      </p>
      <button onClick={() => navigate("/shop")}
        style={{
          background: "#fff", color: "#FF8C42",
          fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16,
          borderRadius: 14, padding: "14px 28px", border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}>
        Back to shop
      </button>
      <button onClick={() => navigate("/orders")}
        style={{
          marginTop: 12, background: "none", color: "rgba(255,255,255,0.75)",
          fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 13,
          border: "none", cursor: "pointer", padding: "8px 16px",
        }}>
        View my orders
      </button>
    </div>
  );
};

export default OrderSuccess;
