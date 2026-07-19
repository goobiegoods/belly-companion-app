import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Clock, Share2, ChefHat } from "lucide-react";
import { useSavedRecipes } from "@/contexts/SavedRecipesContext";
import { getRecipeById, CATEGORY_GRADIENTS } from "@/data/recipesData";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { SceneBackground, GlassCard } from "@/components/golden";

const CREAM_70 = "rgba(251,238,224,0.7)";
const CREAM_55 = "rgba(251,238,224,0.55)";

const BackArrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

/** Nutrient rating rendered as 1-3 gold dots (no glyphs). */
const RatingDots = ({ rating }: { rating: number }) => (
  <span style={{ display: "inline-flex", gap: 3, alignItems: "center", flexShrink: 0 }}>
    {[1, 2, 3].map(i => (
      <span
        key={i}
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: i <= rating ? "var(--gold)" : "rgba(251,238,224,0.2)",
        }}
      />
    ))}
  </span>
);

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedRecipes();
  const { profile } = useAuth();
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);

  const recipe = getRecipeById(id || "");
  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const isSaved = recipe ? savedIds.has(recipe.id) : false;

  if (!recipe) {
    return (
      <SceneBackground scene="baby">
        <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "0 24px", textAlign: "center" }}>
          <ChefHat size={32} strokeWidth={1.8} style={{ color: CREAM_55, marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>Recipe not found</p>
          <button
            onClick={() => navigate("/recipes")}
            className="belly-btn-press"
            style={{
              marginTop: 16,
              background: "linear-gradient(135deg, var(--gold), var(--ember))",
              color: "var(--night)",
              border: "none", borderRadius: 14, padding: "11px 22px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Back to recipes
          </button>
        </div>
      </SceneBackground>
    );
  }

  const handleShare = async () => {
    const text = `Week ${currentWeek} recipe from Belly\n\n${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => '• ' + i.amount + ' ' + i.name).join('\n')}\n\nInstructions:\n${recipe.instructions.map((s, i) => (i + 1) + '. ' + s).join('\n')}`;
    try {
      await navigator.share({ title: recipe.title, text });
    } catch { /* cancelled */ }
  };

  return (
    <SceneBackground scene="baby">
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 4px" }}>
        <button onClick={() => navigate("/recipes")} aria-label="Back to recipes" className="gh-icon-btn belly-btn-press" style={{ color: "var(--cream)" }}>
          <BackArrow />
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => toggleSave(recipe.id)}
            aria-label={isSaved ? "Unsave" : "Save"}
            className="gh-icon-btn belly-btn-press"
          >
            <Heart
              size={15}
              strokeWidth={1.8}
              style={{ color: isSaved ? "var(--magenta)" : CREAM_70, fill: isSaved ? "var(--magenta)" : "none" }}
            />
          </button>
          <button onClick={handleShare} aria-label="Share recipe" className="gh-icon-btn belly-btn-press" style={{ color: CREAM_70 }}>
            <Share2 size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div style={{ padding: "10px 16px 40px" }}>
        {/* Title + meta */}
        <h1 className="gh-brand" style={{ fontSize: 24, lineHeight: 1.2, marginBottom: 9 }}>{recipe.title}</h1>
        <div className="font-gh-mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: CREAM_55, marginBottom: 10 }}>
          <Clock size={11.5} strokeWidth={1.8} />
          <span>{recipe.prepTime} min</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>{recipe.category.toLowerCase()}</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>week {currentWeek}</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {recipe.vitamins.map(v => (
            <span
              key={v.name}
              className="font-gh-mono"
              style={{
                fontSize: 9.5, color: "var(--gold)",
                background: "rgba(242,182,71,0.14)",
                border: "1px solid rgba(242,182,71,0.3)",
                borderRadius: 8, padding: "3px 8px",
              }}
            >
              {v.name} {v.amount}
            </span>
          ))}
        </div>

        {/* Why this week */}
        <GlassCard>
          <div className="gh-section-label">why this week</div>
          <p className="font-gh-serif" style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.6, color: CREAM_70 }}>
            {recipe.whyThisWeek}
          </p>
        </GlassCard>

        {/* Ingredients */}
        <GlassCard>
          <div className="gh-section-label">
            ingredients{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, color: CREAM_55, fontSize: 9.5 }}>— tap for alternatives</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recipe.ingredients.map((ing, idx) => {
              const isOpen = expandedIngredient === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedIngredient(isOpen ? null : idx)}
                  className="belly-card-interactive"
                  style={{
                    background: isOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12, padding: "9px 11px",
                    transition: "background 200ms ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 12.2l2.4 2.4 4.6-5" />
                    </svg>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--cream)", lineHeight: 1.4 }}>
                      <span className="font-gh-mono" style={{ fontSize: 11, color: "var(--gold)", marginRight: 6 }}>{ing.amount}</span>
                      {ing.name}
                    </span>
                    <RatingDots rating={ing.nutrientRating} />
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <p className="font-gh-mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 4 }}>
                        natural alternatives
                      </p>
                      <p style={{ fontSize: 11.5, color: CREAM_70, lineHeight: 1.55 }}>{ing.alternatives}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Steps */}
        <GlassCard>
          <div className="gh-section-label">steps</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {recipe.instructions.map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="font-gh-mono" style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, flexShrink: 0, lineHeight: 1.55, minWidth: 20 }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.55 }}>{step}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SceneBackground>
  );
};

export default RecipeDetail;
