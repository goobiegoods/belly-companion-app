import { describe, it, expect } from "vitest";
import { resolveHardPaywall, type GateProfile } from "@/lib/paywallGate";
import { parseFlag } from "@/lib/flags";

const freeUser: GateProfile = { is_premium: false, season: "pregnant", welcome_completed_at: null };

const args = (over: Partial<Parameters<typeof resolveHardPaywall>[0]> = {}) => ({
  enabled: true,
  profile: freeUser,
  localTasteDone: false,
  pathname: "/",
  ...over,
});

describe("resolveHardPaywall", () => {
  it("flag OFF: always passes, whatever the entitlement or taste state", () => {
    expect(resolveHardPaywall(args({ enabled: false }))).toBe("pass");
    expect(resolveHardPaywall(args({ enabled: false, localTasteDone: true }))).toBe("pass");
    expect(
      resolveHardPaywall(
        args({ enabled: false, profile: { ...freeUser, welcome_completed_at: "2026-08-06T00:00:00Z" } })
      )
    ).toBe("pass");
  });

  it("premium users (promo Pros, subscribers, trialing) never see the wall", () => {
    expect(resolveHardPaywall(args({ profile: { ...freeUser, is_premium: true } }))).toBe("pass");
    expect(
      resolveHardPaywall(
        args({ profile: { ...freeUser, is_premium: true, welcome_completed_at: "2026-08-06T00:00:00Z" } })
      )
    ).toBe("pass");
  });

  it("free user who hasn't had the taste is sent to /welcome", () => {
    expect(resolveHardPaywall(args())).toBe("welcome");
  });

  it("locks once the taste is used — DB column or localStorage fallback", () => {
    expect(
      resolveHardPaywall(args({ profile: { ...freeUser, welcome_completed_at: "2026-08-06T00:00:00Z" } }))
    ).toBe("lock");
    expect(resolveHardPaywall(args({ localTasteDone: true }))).toBe("lock");
  });

  it("null-season legacy accounts count as taste-used (no /welcome redirect loop)", () => {
    expect(resolveHardPaywall(args({ profile: { ...freeUser, season: null } }))).toBe("lock");
  });

  it("/premium-success stays reachable while locked so checkout can complete", () => {
    expect(resolveHardPaywall(args({ localTasteDone: true, pathname: "/premium-success" }))).toBe("pass");
  });
});

describe("parseFlag", () => {
  it('accepts "1" and "true" only', () => {
    expect(parseFlag("1")).toBe(true);
    expect(parseFlag("true")).toBe(true);
    expect(parseFlag("0")).toBe(false);
    expect(parseFlag("")).toBe(false);
    expect(parseFlag(undefined)).toBe(false);
  });
});
