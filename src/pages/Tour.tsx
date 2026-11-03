import { useNavigate } from "react-router-dom";
import { SceneBackground, GhHeader, GlassCard, BellaOrb } from "@/components/golden";

/**
 * "How to use Belly" — one scrollable tour of everything inside, in Bella's
 * voice. Linked from Today, Me, and the welcome emails (/tour).
 */
type Stop = { emoji: string; title: string; text: string; to: string; cta: string; soon?: boolean };

const STOPS: Stop[] = [
  { emoji: "💬", title: "Ask me anything", text: "Cramps, cravings, sleep, herbs, what's normal. Day or night, I'm here, and I'll always tell you when it's time to call your provider.", to: "/ask", cta: "Ask Bella" },
  { emoji: "🌸", title: "Your week, explained", text: "What's happening with your body and your baby this week, in plain, gentle words.", to: "/baby", cta: "See this week" },
  { emoji: "📷", title: "Safety scan", text: "Snap any label (lotion, snack, cleaner) and I'll read the ingredients with you.", to: "/ask", cta: "Try a scan" },
  { emoji: "🎓", title: "Courses", text: "Short lessons on trimesters, sleep, birth plans, labor and postpartum. Finish one in a single sitting.", to: "/courses", cta: "Start a lesson" },
  { emoji: "🥣", title: "Recipes for every stage", text: "Nourishing, simple meals matched to where you are right now.", to: "/recipes", cta: "Find a recipe" },
  { emoji: "🫶", title: "The Mamas circle", text: "Ask, vent, celebrate with mamas who are going through it with you.", to: "/community", cta: "Say hello" },
  { emoji: "🌿", title: "The Apothecary", text: "Loose-leaf organic teas, elixirs and gentle remedies, chosen for each season of motherhood. Dozens of blends are on their way.", to: "/shop", cta: "Get notified", soon: true },
  { emoji: "✨", title: "Little helpers", text: "Your journal, a calming breath, sleep rescue for 3am, and your journey timeline, all in one place.", to: "/journal", cta: "Open journal" },
];

export default function Tour() {
  const navigate = useNavigate();
  return (
    <SceneBackground scene="today">
      <GhHeader brand="belly" tag="virtual doula" brandSize={26}>
        <div className="font-gh-serif" style={{ position: "relative", zIndex: 2, fontSize: 24, fontWeight: 500, marginTop: 16, lineHeight: 1.25 }}>
          Everything inside Belly
          <span style={{ display: "block", fontSize: 14, fontStyle: "italic", opacity: 0.8, fontWeight: 400, marginTop: 4 }}>
            a little tour, from me to you
          </span>
        </div>
      </GhHeader>
      <div style={{ padding: "12px 16px 110px", display: "flex", flexDirection: "column", gap: 12 }}>
        <GlassCard>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <BellaOrb size={36} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(251,238,224,0.85)" }}>
              Hi mama, I'm Bella. Here's everything I can do for you. Tap any card to jump right in.
            </p>
          </div>
        </GlassCard>
        {STOPS.map((s) => (
          <GlassCard key={s.title}>
            <button
              onClick={() => navigate(s.to)}
              style={{ all: "unset", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", width: "100%" }}
            >
              <div style={{ fontSize: 26, lineHeight: 1, width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 14, background: "rgba(255,255,255,0.1)", flexShrink: 0 }}>
                {s.emoji}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p className="font-gh-serif" style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>{s.title}</p>
                  {s.soon && <span style={{ fontSize: 10.5, fontWeight: 600, color: "#150A1F", background: "#F2B647", borderRadius: 999, padding: "2px 8px" }}>coming soon</span>}
                </div>
                <p style={{ margin: "4px 0 8px", fontSize: 13, lineHeight: 1.5, color: "rgba(251,238,224,0.75)" }}>{s.text}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F2B647" }}>{s.cta} →</span>
              </div>
            </button>
          </GlassCard>
        ))}
      </div>
    </SceneBackground>
  );
}
