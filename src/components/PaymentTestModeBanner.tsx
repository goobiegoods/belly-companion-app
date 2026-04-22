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
      Test mode · use card <strong>4242 4242 4242 4242</strong> · any future date · any CVC
      <a
        href="https://docs.stripe.com/testing#cards"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginLeft: 8, textDecoration: "underline", color: "#fff", opacity: 0.8 }}
      >
        more cards
      </a>
    </div>
  );
}
