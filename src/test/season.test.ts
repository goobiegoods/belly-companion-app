import { describe, it, expect } from "vitest";
import { isPregnantSeason, seasonLabel, seasonTip, SEASON_TIPS } from "@/lib/season";

describe("isPregnantSeason", () => {
  it("treats null/undefined profile as pregnant (legacy)", () => {
    expect(isPregnantSeason(null)).toBe(true);
    expect(isPregnantSeason(undefined)).toBe(true);
  });

  it("treats null season as pregnant (legacy accounts)", () => {
    expect(isPregnantSeason({ season: null })).toBe(true);
  });

  it('treats "pregnant" as pregnant', () => {
    expect(isPregnantSeason({ season: "pregnant" })).toBe(true);
  });

  it.each(["trying_to_conceive", "postpartum", "raising_little_ones", "general_wellness"])(
    "treats %s as not pregnant",
    (season) => {
      expect(isPregnantSeason({ season })).toBe(false);
    },
  );
});

describe("seasonLabel", () => {
  it("maps every season", () => {
    expect(seasonLabel("pregnant")).toBe("Pregnant");
    expect(seasonLabel("trying_to_conceive")).toBe("Trying to conceive");
    expect(seasonLabel("postpartum")).toBe("Postpartum");
    expect(seasonLabel("raising_little_ones")).toBe("Raising little ones");
    expect(seasonLabel("general_wellness")).toBe("Wellness");
    expect(seasonLabel(null)).toBe("Pregnant");
    expect(seasonLabel("something_unknown")).toBe("Motherhood");
  });
});

describe("seasonTip", () => {
  it("has a line for every non-pregnant season and a safe fallback", () => {
    for (const s of ["trying_to_conceive", "postpartum", "raising_little_ones", "general_wellness"]) {
      expect(seasonTip(s)).toBeTruthy();
      expect(seasonTip(s)).not.toMatch(/week|pregnan/i);
    }
    expect(seasonTip(null)).toBe(SEASON_TIPS.general_wellness);
  });
});
