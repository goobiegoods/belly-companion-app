import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  signBonus,
  verifyBonus,
  BONUS_WINDOW_MS,
  BONUS_GRACE_MS,
  variantFor,
  cleanEmail,
  cleanStage,
  cleanKey,
  checkoutAllowed,
  originAllowed,
} from "../../api/_lib/funnel";

const env = { ...process.env };
beforeEach(() => {
  process.env.FUNNEL_SIGNING_SECRET = "test-secret-test-secret-test-secret-123";
});
afterEach(() => {
  process.env = { ...env };
});

describe("bonus token (server-enforced 5-minute window)", () => {
  it("accepts a fresh token", async () => {
    const { token } = await signBonus();
    expect(await verifyBonus(token)).toBe(true);
  });
  it("rejects after window + grace", async () => {
    const t0 = Date.now();
    const { token } = await signBonus(t0);
    expect(await verifyBonus(token, t0 + BONUS_WINDOW_MS + BONUS_GRACE_MS - 1)).toBe(true);
    expect(await verifyBonus(token, t0 + BONUS_WINDOW_MS + BONUS_GRACE_MS + 1)).toBe(false);
  });
  it("rejects tampered payloads and foreign signatures", async () => {
    const { token } = await signBonus();
    const [p, s] = token.split(".");
    const forged = btoa(JSON.stringify({ k: "bonus", exp: Date.now() + 1e12 })).replace(/=+$/, "");
    expect(await verifyBonus(`${forged}.${s}`)).toBe(false);
    expect(await verifyBonus(`${p}.AAAA${s.slice(4)}`)).toBe(false);
    process.env.FUNNEL_SIGNING_SECRET = "another-secret-another-secret-another-1";
    expect(await verifyBonus(token)).toBe(false);
  });
  it("rejects junk", async () => {
    for (const j of [undefined, null, "", "a.b", 42, "x".repeat(500)]) expect(await verifyBonus(j)).toBe(false);
  });
});

describe("pricing comes from server config only", () => {
  it("unknown variants fall back to the founding $89/yr offer", () => {
    expect(variantFor("zzz").unitAmount).toBe(8900);
    expect(variantFor(undefined).trialDays).toBe(7);
    expect(variantFor("a").bonusTrialDays).toBe(14);
  });
});

describe("live-mode safety switch", () => {
  it("blocks when no key", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(checkoutAllowed().ok).toBe(false);
  });
  it("allows test keys", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    expect(checkoutAllowed().ok).toBe(true);
  });
  it("blocks live keys unless explicitly approved", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_123";
    delete process.env.FUNNEL_LIVE_APPROVED;
    expect(checkoutAllowed().ok).toBe(false);
    process.env.FUNNEL_LIVE_APPROVED = "true";
    expect(checkoutAllowed().ok).toBe(false);
    process.env.FUNNEL_LIVE_APPROVED = "yes";
    expect(checkoutAllowed().ok).toBe(true);
  });
});

describe("input hygiene", () => {
  it("emails", () => {
    expect(cleanEmail(" Mama@Example.COM ")).toBe("mama@example.com");
    expect(cleanEmail("nope")).toBeNull();
    expect(cleanEmail("a@b")).toBeNull();
    expect(cleanEmail("<x>@y.com")).toBeNull();
  });
  it("stages + product keys", () => {
    expect(cleanStage("pregnant")).toBe("pregnant");
    expect(cleanStage("hacker")).toBeNull();
    expect(cleanKey("tea_raspberry-leaf")).toBe("tea_raspberry-leaf");
    expect(cleanKey("DROP TABLE")).toBeNull();
  });
  it("origins", () => {
    const r = (o?: string) => new Request("https://x/api", { method: "POST", headers: o ? { origin: o } : {} });
    expect(originAllowed(r("https://meetbelly.com"))).toBe(true);
    expect(originAllowed(r("https://evil.example"))).toBe(false);
    expect(originAllowed(r())).toBe(true);
  });
});
