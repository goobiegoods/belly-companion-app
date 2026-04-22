const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.18)",
      borderBottom: "1px solid rgba(255,255,255,0.25)",
      padding: "8px 16px",
      textAlign: "center",
      fontFamily: "'Outfit', system-ui",
      fontSize: 11,
      color: "#fff",
    }}>
      All payments are in test mode. Use card 4242 4242 4242 4242.
    </div>
  );
}
