import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedRecipes } from "@/contexts/SavedRecipesContext";
import { getRecipesForWeek, getUniqueVitaminsForWeek, CATEGORY_GRADIENTS } from "@/data/recipesData";
import { getCurrentWeek } from "@/data/pregnancyWeeks";

const CATEGORIES = ["All", "Breakfast", "Smoothie", "Snack", "Dinner", "Tea"] as const;

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
    <div style={{ background: "transparent", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "white", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>← Home</button>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 12, fontWeight: 700, color: "white" }}>Week {currentWeek} Recipes</span>
        <span style={{ fontSize: 16 }}>🍽️</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any }}>
        {/* Nutrition hero — keep amber gradient as accent */}
        <div style={{ margin: "7px 11px 0", borderRadius: 16, padding: "12px 14px", background: "linear-gradient(135deg, #E89020, #F4A830, #FFCC60)", boxShadow: "0 6px 20px rgba(220,140,20,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -8, top: -8, width: 65, height: 65, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", fontWeight: 600, marginBottom: 6 }}>This week's key nutrients</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {vitamins.slice(0, 8).map(v => (
              <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "3px 8px", fontSize: 7, color: "white", fontWeight: 600 }}>
                {v.emoji} {v.name}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 9, color: "rgba(255,255,255,0.78)", fontStyle: "italic", lineHeight: 1.45 }}>{whyQuote}</p>
        </div>

        <div style={{ display: "flex", gap: 5, padding: "7px 11px 4px", overflowX: "auto" }} className="hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              flexShrink: 0, border: activeCategory === cat ? "none" : "1px solid var(--c1-border)", cursor: "pointer",
              borderRadius: 10, padding: "5px 12px", fontSize: 10, fontWeight: activeCategory === cat ? 700 : 500,
              background: activeCategory === cat ? "white" : "var(--c1)",
              color: activeCategory === cat ? "#FF6520" : "white",
              fontFamily: "'Outfit', system-ui",
            }}>{cat}</button>
          ))}
        </div>

        <div style={{ padding: "4px 0 24px" }}>
          {filtered.map(recipe => {
            const isSaved = savedIds.has(recipe.id);
            const firstSentence = recipe.whyThisWeek.split(/(?<=\.)\s/)[0] || recipe.whyThisWeek;
            return (
              <div key={recipe.id} style={{ margin: "4px 11px", borderRadius: 15, overflow: "hidden", background: "var(--c1)", border: "1px solid var(--c1-border)", backdropFilter: "blur(14px)" }}>
                <div onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ background: CATEGORY_GRADIENTS[recipe.category] || CATEGORY_GRADIENTS.Breakfast, height: 68, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
                  <span style={{ fontSize: 30 }}>{recipe.emoji}</span>
                  <span style={{ position: "absolute", top: 6, right: 8, background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 8, color: "white", fontWeight: 600 }}>{recipe.prepTime} min</span>
                  <span style={{ position: "absolute", top: 6, left: 8, background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 8, color: "white", fontWeight: 600 }}>{recipe.category}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(recipe.id); }} style={{ position: "absolute", bottom: 6, right: 8, background: "none", border: "none", fontSize: 14, cursor: "pointer" }}>
                    {isSaved ? "❤️" : "🤍"}
                  </button>
                </div>
                <div onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ padding: "8px 11px 10px", cursor: "pointer" }}>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2 }}>{recipe.title}</p>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, color: "var(--w70)", lineHeight: 1.4, marginBottom: 5 }}>{firstSentence}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 5 }}>
                    {recipe.vitamins.map(v => (
                      <span key={v.name} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 6px", fontSize: 8, color: "white", fontWeight: 600 }}>
                        {v.emoji} {v.name} {v.amount}
                      </span>
                    ))}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 8px" }}>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "white", fontWeight: 600, marginBottom: 2 }}>Why this week 🌿</p>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "var(--w70)", lineHeight: 1.45 }}>{recipe.whyThisWeek}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🍽️</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "white", fontWeight: 600 }}>No recipes in this category</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "var(--w50)", fontStyle: "italic" }}>Try another category or check next week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
