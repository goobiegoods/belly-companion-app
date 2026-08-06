import posthog from "posthog-js";

// PRIVACY CONTRACT: Belly handles pregnancy/health data. Analytics may only
// ever send event names and the minimal safe metadata whitelisted at the call
// sites — never chat content, due dates, children's ages, onboarding answers,
// or anything else health-related. All PostHog privacy config lives here.

let initialized = false;

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return; // dev/test without a token: every call below no-ops

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // No automatic capture of clicks/inputs/forms — users type health
    // concerns into this app.
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    // Never inject remote scripts (also keeps the CSP script-src untouched).
    disable_external_dependency_loading: true,
    // Anonymous visitors don't create person profiles (free-tier friendly).
    person_profiles: "identified_only",
    // SPA: pageviews are captured manually on route change.
    capture_pageview: false,
  });
  initialized = true;
}

type SafeProps = Record<string, string | number | boolean | null>;

export function track(event: string, props?: SafeProps) {
  if (!initialized) return;
  posthog.capture(event, props);
}

export function identifyUser(
  userId: string,
  props: { season: string | null; is_premium: boolean }
) {
  if (!initialized) return;
  posthog.identify(userId, props);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}

export function trackPageview() {
  if (!initialized) return;
  posthog.capture("$pageview");
}
