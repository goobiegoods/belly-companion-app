import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, ChefHat, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedRecipes } from "@/contexts/SavedRecipesContext";
import { getRecipesForWeek, getUniqueVitaminsForWeek, CATEGORY_GRADIENTS } from "@/data/recipesData";
import { getCurrentWeek } from "@/data/pregnancyWeeks";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";

const CATEGORIES = ["All", "Breakfast", "Smoothie", "Snack", "Dinner", "Tea"] as const;

const CREAM_70 = "rgba(251,238,224,0.7)";
const CREAM_55 = "rgba(251,238,224,0.55)";

const Recipes = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedRecipes();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const weekRecipes = getRecipesForWeek(currentWeek);
  const vitamins = getUniqueVitaminsForWeek(currentWeek);
  const filtered = activeCategory === "All" ? weekRecipes : weekRecipes.filter(r => r.category === activeCategory);
  const whyQuote = weekRecipes[0]?.whyThisWeek?.split(/(?<=\.)\s/)[0] || "";

  return (
    <SceneBackground scene="baby">
      <GhHeader brand="Nourish" tag="recipes for two" brandSize={20} weekPill={`wk ${currentWeek}`} />

      <div style={{ padding: "4px 16px 110px" }}>
        {/* This week's nutrients */}
        <GlassCard>
          <div className="gh-section-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Leaf size={12} strokeWidth={1.8} style={{ color: "var(--teal)" }} />
            this week's nutrients
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {vitamins.slice(0, 8).map(v => (
              <span
                key={v.name}
                className="font-gh-mono"
                style={{
                  fontSize: 10, letterSpacing: "0.04em",
                  color: "var(--cream)",
                  background: "rgba(44,156,143,0.22)",
                  border: "1px solid rgba(44,156,143,0.4)",
                  borderRadius: 10, padding: "4px 9px",
                }}
              >
                {v.name}
              </span>
            ))}
          </div>
          <p className="font-gh-serif" style={{ fontSize: 12.5, fontStyle: "italic", lineHeight: 1.55, color: CREAM_70 }}>
            {whyQuote}
          </p>
        </GlassCard>

        {/* Category filter */}
        <div className="hide-scrollbar" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 0 12px" }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`belly-btn-press ${active ? "gh-pill gh-pill-filled" : "gh-pill"}`}
                style={{ flexShrink: 0 }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Recipe cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(recipe => {
            const isSaved = savedIds.has(recipe.id);
            const firstSentence = recipe.whyThisWeek.split(/(?<=\.)\s/)[0] || recipe.whyThisWeek;
            return (
              <div
                key={recipe.id}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="gh-glass-subtle belly-card-interactive"
                style={{ padding: "14px 14px 13px", position: "relative" }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(recipe.id); }}
                  aria-label={isSaved ? "Unsave" : "Save"}
                  className="gh-icon-btn belly-btn-press"
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.1)" }}
                >
                  <Heart
                    size={15}
                    strokeWidth={1.8}
                    style={{
                      color: isSaved ? "var(--magenta)" : CREAM_70,
                      fill: isSaved ? "var(--magenta)" : "none",
                    }}
                  />
                </button>

                <h3 className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--cream)", lineHeight: 1.3, paddingRight: 40, marginBottom: 5 }}>
                  {recipe.title}
                </h3>

                <div className="font-gh-mono" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: CREAM_55, marginBottom: 9 }}>
                  <Clock size={11} strokeWidth={1.8} />
                  <span>{recipe.prepTime} min</span>
                  <span style={{ opacity: 0.6 }}>·</span>
                  <span>{recipe.category.toLowerCase()}</span>
                </div>

                <p style={{ fontSize: 12, color: CREAM_70, lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {firstSentence}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
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
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "44px 16px" }}>
              <ChefHat size={30} strokeWidth={1.8} style={{ color: CREAM_55, marginBottom: 10 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>No recipes in this category</p>
              <p className="font-gh-serif" style={{ fontSize: 12, fontStyle: "italic", color: CREAM_55, marginTop: 4 }}>
                Try another category or check next week
              </p>
            </div>
          )}
        </div>
      </div>
    </SceneBackground>
  );
};

export default Recipes;
