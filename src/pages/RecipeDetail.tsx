import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSavedRecipes } from "@/contexts/SavedRecipesContext";
import { getRecipeById, CATEGORY_GRADIENTS } from "@/data/recipesData";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentWeek } from "@/data/pregnancyWeeks";

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
      <div style={{ background: "transparent", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>🍽️</p>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "white", fontWeight: 600 }}>Recipe not found</p>
        <button onClick={() => navigate("/recipes")} style={{ marginTop: 12, background: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "#FF6520", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>← Back to recipes</button>
      </div>
    );
  }

  const handleShare = async () => {
    const text = `Week ${currentWeek} recipe from Belly 🌸\n\n${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => '• ' + i.amount + ' ' + i.name).join('\n')}\n\nInstructions:\n${recipe.instructions.map((s, i) => (i + 1) + '. ' + s).join('\n')}`;
    try {
      await navigator.share({ title: recipe.title, text });
    } catch { /* cancelled */ }
  };

  return (
    <div style={{ background: "transparent", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => navigate("/recipes")} style={{ background: "none", border: "none", color: "white", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>← Recipes</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => toggleSave(recipe.id)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>
            {isSaved ? "❤️" : "🤍"}
          </button>
          <button onClick={handleShare} style={{ background: "white", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 9, fontWeight: 700, color: "#FF6520", cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>Share ↗</button>
        </div>
      </div>

      {/* Hero — keep amber gradient as accent */}
      <div style={{ background: CATEGORY_GRADIENTS[recipe.category] || CATEGORY_GRADIENTS.Breakfast, height: 90, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: 44 }}>{recipe.emoji}</span>
        <span style={{ position: "absolute", bottom: 8, left: 12, background: "rgba(255,255,255,0.25)", borderRadius: 8, padding: "3px 10px", fontSize: 8, color: "white", fontWeight: 600 }}>
          {recipe.prepTime} min · {recipe.category} · Week {currentWeek}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 13px 32px", WebkitOverflowScrolling: "touch" as any }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "white", marginBottom: 3, lineHeight: 1.3 }}>{recipe.title}</h1>
        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, color: "var(--w70)", fontStyle: "italic", lineHeight: 1.55, marginBottom: 7 }}>{recipe.whyThisWeek.split(/(?<=\.)\s/)[0]}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 7 }}>
          {recipe.vitamins.map(v => (
            <span key={v.name} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 7, padding: "3px 7px", fontSize: 8, color: "white", fontWeight: 600 }}>
              {v.emoji} {v.name} {v.amount}
            </span>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "white", fontWeight: 600, marginBottom: 2 }}>Why your baby needs this in week {currentWeek} 🌿</p>
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: "var(--w70)", lineHeight: 1.55 }}>{recipe.whyThisWeek}</p>
        </div>

        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, marginBottom: 4 }}>
          Ingredients <span style={{ textTransform: "none", fontSize: 8, color: "var(--w40)" }}>(tap any to see alternatives)</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {recipe.ingredients.map((ing, idx) => {
            const isOpen = expandedIngredient === idx;
            return (
              <div key={idx} onClick={() => setExpandedIngredient(isOpen ? null : idx)} style={{
                background: isOpen ? "rgba(255,255,255,0.18)" : "var(--c1)",
                border: isOpen ? "1px solid rgba(255,255,255,0.3)" : "1px solid var(--c1-border)",
                borderRadius: 9, padding: isOpen ? "7px 10px" : "6px 10px", cursor: "pointer",
                transition: "all 200ms ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, fontWeight: 500, color: "white" }}>{ing.amount} {ing.name}</span>
                  <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px", fontSize: 8, color: "var(--w50)" }}>
                    {"★".repeat(ing.nutrientRating)}
                  </span>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 4, background: "rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 8px" }}>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "white", fontWeight: 600, marginBottom: 1 }}>Natural alternatives 🌱</p>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 8, color: "var(--w70)", lineHeight: 1.5 }}>{ing.alternatives}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--w40)", fontWeight: 600, marginBottom: 5, marginTop: 8 }}>How to make it</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {recipe.instructions.map((step, idx) => (
            <div key={idx} style={{ background: "var(--c1)", border: "1px solid var(--c1-border)", borderRadius: 10, padding: "8px 10px", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.2)", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {idx + 1}
              </div>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "var(--w70)", lineHeight: 1.55, fontWeight: 400 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
