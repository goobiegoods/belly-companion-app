import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

/**
 * "Have a promo code?" expander used inside the premium sheets.
 * Redemption happens server-side (api/redeem-promo.ts, service role) so the
 * profiles.is_premium protection trigger is respected.
 */
export function PromoCodeRedeem() {
  const { session, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const redeem = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch("/api/redeem-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await resp.json().catch(() => ({}))) as { ok?: boolean; grantedPremium?: boolean; error?: string };
      if (!resp.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      track("promo_redeemed", { code: code.trim(), granted_premium: !!data.grantedPremium });
      setSuccess(data.grantedPremium ? "Code accepted — Belly Pro is yours 🎉" : "Code accepted!");
      await refreshProfile();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--gold)", padding: "10px 0 2px" }}>
        {success}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: 8, background: "none", border: "none",
          color: "rgba(251,238,224,0.55)", fontSize: 12, cursor: "pointer",
          fontFamily: "'Inter', sans-serif", textDecoration: "underline", textUnderlineOffset: 3,
        }}
      >
        Have a promo code?
      </button>
    );
  }

  return (
    <div style={{ paddingTop: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") redeem(); }}
          placeholder="PROMO CODE"
          autoFocus
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={64}
          style={{
            flex: 1, height: 44, borderRadius: 12, padding: "0 14px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
            color: "var(--cream)", fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.08em", outline: "none",
          }}
        />
        <button
          onClick={redeem}
          disabled={busy || !code.trim()}
          style={{
            height: 44, padding: "0 18px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)",
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
            opacity: busy || !code.trim() ? 0.6 : 1,
          }}
        >
          {busy ? "…" : "Redeem"}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: "#f28b82", marginTop: 8, textAlign: "center" }}>{error}</p>
      )}
    </div>
  );
}

export default PromoCodeRedeem;
