// Build-time feature flags (client env, baked at build — flipping one means
// a redeploy). HARD_PAYWALL stays OFF until Stripe live keys are in; "1" (or
// "true") locks free users behind the post-welcome trial wall.
export const parseFlag = (v: unknown): boolean => v === "1" || v === "true";

export const HARD_PAYWALL = parseFlag(import.meta.env.VITE_HARD_PAYWALL);
