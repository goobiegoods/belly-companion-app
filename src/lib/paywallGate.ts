// Decides what the hard paywall does with a signed-in, onboarded user on a
// protected route. Pure so the flag/entitlement matrix is unit-testable.

export interface GateProfile {
  is_premium: boolean;
  season: string | null;
  welcome_completed_at?: string | null;
}

export type GateDecision = "pass" | "welcome" | "lock";

// /premium-success must stay reachable while locked: it is Stripe's
// return_url, and the gate would otherwise swallow the page that confirms
// the trial started and flips is_premium.
const EXEMPT_PATHS = new Set(["/premium-success"]);

export function resolveHardPaywall(opts: {
  enabled: boolean;
  profile: GateProfile;
  localTasteDone: boolean;
  pathname: string;
}): GateDecision {
  const { enabled, profile, localTasteDone, pathname } = opts;
  if (!enabled) return "pass";
  if (profile.is_premium) return "pass";
  if (EXEMPT_PATHS.has(pathname)) return "pass";
  // Null-season accounts predate /welcome and can never complete it — treat
  // them as having had their taste, or this redirect ping-pongs with
  // Welcome's own "no season → home" guard.
  const tasteUsed =
    !profile.season || !!profile.welcome_completed_at || localTasteDone;
  return tasteUsed ? "lock" : "welcome";
}
