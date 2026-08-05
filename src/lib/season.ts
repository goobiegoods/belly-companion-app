/**
 * Season helpers. A user is on the pregnancy track when season is null
 * (legacy accounts onboarded before seasons existed) or "pregnant" — their
 * experience must stay exactly as it was. Everyone else gets the neutral
 * motherhood framing. Keep this predicate in sync with HomePage.tsx's inline
 * check and the server-side copy in api/belly-chat.ts.
 */
export const isPregnantSeason = (p?: { season: string | null } | null): boolean =>
  !p?.season || p.season === "pregnant";

export const SEASON_LABELS: Record<string, string> = {
  pregnant: "Pregnant",
  trying_to_conceive: "Trying to conceive",
  postpartum: "Postpartum",
  raising_little_ones: "Raising little ones",
  general_wellness: "Wellness",
};

export const seasonLabel = (season?: string | null): string =>
  SEASON_LABELS[season ?? "pregnant"] ?? "Motherhood";

/** One warm Bella line per non-pregnant season — /ask idle card + Journey note. */
export const SEASON_TIPS: Record<string, string> = {
  trying_to_conceive:
    "Your body is preparing in ways you can't see yet. Nourish it gently — warm foods, steady sleep, and patience with yourself.",
  postpartum:
    "Every day you recover is a moment earned. Rest is not a luxury right now, mama — it is the work.",
  raising_little_ones:
    "The days are long and the years are short. Take one small moment today that belongs only to you.",
  general_wellness:
    "Caring for yourself is not selfish — it is the foundation everything else stands on. Start small today.",
};

export const seasonTip = (season?: string | null): string =>
  SEASON_TIPS[season ?? ""] ?? SEASON_TIPS.general_wellness;
