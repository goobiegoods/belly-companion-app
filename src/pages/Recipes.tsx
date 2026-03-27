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
    <div style={{ background: "#FEF8F4", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#FF7840", fontSize: 7.5, fontWeight: 600, cursor: "pointer" }}>← Home</button>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 12, fontWeight: 600, color: "#C85828" }}>Week {currentWeek} Recipes</span>
        <span style={{ fontSize: 16 }}>🍽️</span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any }}>
        {/* Nutrition hero */}
        <div style={{ margin: "7px 11px 0", borderRadius: 16, padding: "12px 14px", background: "linear-gradient(135deg, #E89020, #F4A830, #FFCC60)", boxShadow: "0 6px 20px rgba(220,140,20,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -8, top: -8, width: 65, height: 65, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <p style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", fontWeight: 600, marginBottom: 6 }}>This week's key nutrients</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {vitamins.slice(0, 8).map(v => (
              <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "3px 8px", fontSize: 7, color: "white", fontWeight: 600 }}>
                {v.emoji} {v.name}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.78)", fontStyle: "italic", fontFamily: "Georgia, serif", lineHeight: 1.45 }}>{whyQuote}</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 5, padding: "7px 11px 4px", overflowX: "auto" }} className="hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              flexShrink: 0, border: "none", cursor: "pointer",
              borderRadius: 10, padding: "5px 12px", fontSize: 8, fontWeight: activeCategory === cat ? 600 : 500,
              background: activeCategory === cat ? "linear-gradient(145deg, #FF7840, #FFAB80)" : "rgba(255,255,255,0.65)",
              color: activeCategory === cat ? "white" : "#C4784A",
              ...(activeCategory !== cat ? { border: "0.5px solid rgba(255,200,100,0.3)" } : {}),
            }}>{cat}</button>
          ))}
        </div>

        {/* Recipe cards */}
        <div style={{ padding: "4px 0 24px" }}>
          {filtered.map(recipe => {
            const isSaved = savedIds.has(recipe.id);
            const firstSentence = recipe.whyThisWeek.split(/(?<=\.)\s/)[0] || recipe.whyThisWeek;
            return (
              <div key={recipe.id} style={{ margin: "4px 11px", borderRadius: 15, overflow: "hidden", background: "rgba(255,255,255,0.72)", border: "0.5px solid rgba(255,200,100,0.22)", backdropFilter: "blur(12px)", boxShadow: "0 1px 8px rgba(220,160,20,0.05)" }}>
                {/* Header */}
                <div onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ background: CATEGORY_GRADIENTS[recipe.category] || CATEGORY_GRADIENTS.Breakfast, height: 68, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
                  <span style={{ fontSize: 30 }}>{recipe.emoji}</span>
                  <span style={{ position: "absolute", top: 6, right: 8, background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 6, color: "white", fontWeight: 600 }}>{recipe.prepTime} min</span>
                  <span style={{ position: "absolute", top: 6, left: 8, background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 6, color: "white", fontWeight: 600 }}>{recipe.category}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(recipe.id); }} style={{ position: "absolute", bottom: 6, right: 8, background: "none", border: "none", fontSize: 14, cursor: "pointer", transition: "transform 300ms", transform: isSaved ? "scale(1.2)" : "scale(1)" }}>
                    {isSaved ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Body */}
                <div onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ padding: "8px 11px 10px", cursor: "pointer" }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 600, color: "#A84E28", marginBottom: 2 }}>{recipe.title}</p>
                  <p style={{ fontSize: 7.5, color: "#C4906A", lineHeight: 1.4, marginBottom: 5 }}>{firstSentence}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 5 }}>
                    {recipe.vitamins.map(v => (
                      <span key={v.name} style={{ background: "rgba(220,160,20,0.12)", border: "0.5px solid rgba(220,160,20,0.25)", borderRadius: 6, padding: "2px 6px", fontSize: 6.5, color: "#907020", fontWeight: 600 }}>
                        {v.emoji} {v.name} {v.amount}
                      </span>
                    ))}
                  </div>
                  <div style={{ background: "rgba(255,210,60,0.1)", border: "0.5px solid rgba(220,160,20,0.22)", borderRadius: 8, padding: "5px 8px" }}>
                    <p style={{ fontSize: 6.5, color: "#907020", fontWeight: 600, marginBottom: 2 }}>Why this week 🌿</p>
                    <p style={{ fontSize: 6.5, color: "#B09040", lineHeight: 1.45 }}>{recipe.whyThisWeek}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🍽️</p>
              <p style={{ fontSize: 13, color: "#A84E28", fontWeight: 600 }}>No recipes in this category</p>
              <p style={{ fontSize: 11, color: "#D4906A", fontStyle: "italic" }}>Try another category or check next week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
