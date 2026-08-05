import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../../api/belly-chat";
// Golden fixtures captured byte-for-byte from api/belly-chat.ts BEFORE the
// season change (git 9a40467). If these tests fail, the pregnant-user prompt
// has drifted — that is a regression unless intentionally re-baselined.
import goldenSystem from "./fixtures/bella-system-prompt.golden.txt?raw";
import goldenSafety from "./fixtures/bella-safety-addition.golden.txt?raw";

// Normalize line endings so git eol config can never cause false failures;
// content identity is what we are proving.
const norm = (s: string) => s.replace(/\r\n/g, "\n");

describe("buildSystemPrompt — pregnant path is byte-identical to pre-season-change prompt", () => {
  it("text-only prompt matches the golden fixture exactly", () => {
    expect(norm(buildSystemPrompt({ isPregnant: true, hasImage: false }))).toBe(norm(goldenSystem));
  });

  it("image prompt matches golden system + safety addition exactly", () => {
    expect(norm(buildSystemPrompt({ isPregnant: true, hasImage: true }))).toBe(
      norm(goldenSystem) + norm(goldenSafety),
    );
  });

  it("pregnant prompt contains no {seasonLabel} placeholder (replaceAll is a no-op)", () => {
    expect(buildSystemPrompt({ isPregnant: true, hasImage: true })).not.toContain("{seasonLabel}");
  });
});

describe("buildSystemPrompt — non-pregnant variant", () => {
  const text = buildSystemPrompt({ isPregnant: false, hasImage: false });
  const image = buildSystemPrompt({ isPregnant: false, hasImage: true });

  it("swaps the pregnancy context lines for a season line (guards the exact-match replace)", () => {
    expect(text).toContain("- Life season: {seasonLabel}");
    expect(text).not.toContain("- Current week: {currentWeek}");
    expect(text).not.toContain("- Pregnancy number: {pregnancyNumber}");
  });

  it("appends the season override", () => {
    expect(text).toContain("NOT currently pregnant");
    expect(text).toContain("SEASON OVERRIDE");
  });

  it("neutralizes the image-safety pregnancy phrasing", () => {
    expect(image).not.toContain("specific reasoning for pregnancy, referencing the actual week");
    expect(image).not.toContain("pregnancy-safe alternative");
    expect(image).toContain("her current life season");
  });
});
