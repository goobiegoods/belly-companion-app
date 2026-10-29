import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Two-factor gate for the admin console.
 *
 * Admin access requires an authenticator-app code (Supabase TOTP, session at
 * AAL2). The database enforces the same thing: has_role(…, 'admin') only
 * returns true for an AAL2 session (migration 20261029000000_admin_mfa.sql),
 * so this screen is the friendly front door, not the lock.
 */

const S = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 14, fontFamily: "'Outfit',system-ui,sans-serif", padding: 24, textAlign: "center" as const },
  h1: { fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, margin: 0 },
  sub: { fontSize: 14, color: "#aaaaaa", margin: 0, maxWidth: 360, lineHeight: 1.5 },
  input: { width: 200, fontSize: 24, letterSpacing: "0.3em", textAlign: "center" as const, padding: "10px 12px", borderRadius: 10, border: "1px solid #333", background: "#141414", color: "#fff" },
  btn: { marginTop: 4, background: "#FF8C42", color: "#0a0a0a", border: 0, borderRadius: 10, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  err: { fontSize: 13, color: "#ef4444", margin: 0 },
  qr: { width: 200, height: 200, background: "#fff", borderRadius: 12, padding: 10 },
  code: { fontSize: 12, color: "#aaaaaa", wordBreak: "break-all" as const, maxWidth: 320 },
};

type Phase =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "error"; message: string };

export const AdminMfaGate = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled) return;
      if (error) return setPhase({ kind: "error", message: error.message });
      if (aal.currentLevel === "aal2") return setPhase({ kind: "ok" });

      const { data: factors, error: fErr } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (fErr) return setPhase({ kind: "error", message: fErr.message });
      const verified = factors.totp.find((f) => f.status === "verified");
      if (verified) return setPhase({ kind: "verify", factorId: verified.id });

      // No verified factor yet: clear half-finished enrollments, then enroll.
      for (const f of factors.all.filter((f) => f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data: en, error: eErr } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Belly admin" });
      if (cancelled) return;
      if (eErr) return setPhase({ kind: "error", message: eErr.message });
      setPhase({ kind: "enroll", factorId: en.id, qr: en.totp.qr_code, secret: en.totp.secret });
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async (factorId: string) => {
    if (!/^\d{6}$/.test(code)) return setErr("Enter the 6-digit code from your authenticator app.");
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (error) return setErr("That code didn't work. Wait for a fresh code and try again.");
    setPhase({ kind: "ok" });
  };

  if (phase.kind === "ok") return <>{children}</>;

  if (phase.kind === "loading") {
    return <div style={S.page}><p style={S.sub}>Checking two-factor…</p></div>;
  }

  if (phase.kind === "error") {
    return (
      <div style={S.page}>
        <p style={S.h1}>Two-factor unavailable</p>
        <p style={S.sub}>{phase.message}</p>
      </div>
    );
  }

  const codeField = (factorId: string) => (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(factorId); }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
    >
      <input
        id="admin-mfa-code"
        style={S.input}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        autoFocus
        aria-label="6-digit code"
      />
      {err && <p style={S.err}>{err}</p>}
      <button type="submit" style={S.btn} disabled={busy}>{busy ? "Checking…" : "Unlock admin"}</button>
    </form>
  );

  if (phase.kind === "verify") {
    return (
      <div style={S.page}>
        <p style={S.h1}>Admin two-factor</p>
        <p style={S.sub}>Open your authenticator app and enter the 6-digit code for Belly admin.</p>
        {codeField(phase.factorId)}
      </div>
    );
  }

  return (
    <div style={S.page}>
      <p style={S.h1}>Set up two-factor</p>
      <p style={S.sub}>Scan this with Google Authenticator, 1Password or Authy, then enter the 6-digit code it shows. You'll need a code each time you open admin.</p>
      <img src={phase.qr} alt="Two-factor QR code" style={S.qr} />
      <p style={S.code}>Can't scan? Enter this key: {phase.secret}</p>
      {codeField(phase.factorId)}
    </div>
  );
};

export default AdminMfaGate;
