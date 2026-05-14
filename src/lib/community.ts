// Community helpers: safe display name + sensitive content detection.

export function safeDisplayName(name: unknown): string {
  if (name == null) return "Mama";
  const s = String(name).trim();
  if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "Mama";
  return s;
}

export function titleCaseName(name: unknown): string {
  const s = safeDisplayName(name);
  return s.split(" ").filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

const SENSITIVE_KEYWORDS = [
  "premature", "preemie", "nicu", "loss", "miscarriage", "miscarry",
  "stillbirth", "stillborn", "complication", "preeclampsia", "ectopic", "grief",
];

export function isSensitiveStory(category: string, title: string, body: string): boolean {
  if ((category || "").toLowerCase() !== "story") return false;
  const text = `${title} ${body}`.toLowerCase();
  return SENSITIVE_KEYWORDS.some(k => text.includes(k));
}
