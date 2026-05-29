import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedRecipes } from "@/contexts/SavedRecipesContext";
import { getRecipesForWeek, getUniqueVitaminsForWeek, CATEGORY_GRADIENTS } from "@/data/recipesData";
import { getCurrentWeek } from "@/data/pregnancyWeeks";

const CATEGORIES = ["All", "Breakfast", "Smoothie", "Snack", "Dinner", "Tea"] as const;

// Readability tokens — never light text on light bg
const SURFACE_WHITE = "#FFFFFF";
const SURFACE_PEACH = "#FDF6F0";
const BORDER_SOFT = "#F0E6DD";
const BORDER_PEACH = "#F1E2D2";
const TEXT_DARK = "#1a1a1a";
const TEXT_MID = "#555";
const TEXT_HINT = "#777";
const PILL_BG = "#FDE8D8";
const PILL_BORDER = "#F6D2B6";
const PILL_TEXT = "#B84A10";
const ACCENT = "#E8601A";

const HERO_PALETTE = ["#4a7c40","#d4920a","#6b8f3a","#8b4a42","#c47820","#b05a30","#a03060","#7a5030"];
const getHeroColor = (idx: number) => HERO_PALETTE[idx % HERO_PALETTE.length];
const isLightHex = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // relative luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
};

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
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#E8601A", boxShadow: "0 2px 8px rgba(120,60,10,0.18)" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', system-ui" }}>← Home</button>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: "white" }}>Week {currentWeek} Recipes</span>
        <span style={{ fontSize: 18 }}>🍽️</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any }}>
        {/* Nutrition hero — darkened amber for white-text contrast on every week */}
        <div style={{ margin: "7px 11px 0", borderRadius: 16, padding: "12px 14px", background: "linear-gradient(135deg, #D4500F, #E8731A, #F0934A)", boxShadow: "0 6px 20px rgba(120,60,10,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -8, top: -8, width: 65, height: 65, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.78)", fontWeight: 600, marginBottom: 6 }}>This week's key nutrients</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {vitamins.slice(0, 8).map(v => (
              <span key={v.name} style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "3px 8px", fontSize: 7, color: "white", fontWeight: 600 }}>
                {v.emoji} {v.name}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 9, color: "rgba(255,255,255,0.92)", fontStyle: "italic", lineHeight: 1.45 }}>{whyQuote}</p>
        </div>

        <div style={{ display: "flex", gap: 5, padding: "7px 11px 4px", overflowX: "auto" }} className="hide-scrollbar">
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                flexShrink: 0, border: active ? "none" : `1px solid #EADFD2`, cursor: "pointer",
                borderRadius: 10, padding: "5px 12px", fontSize: 10, fontWeight: active ? 700 : 600,
                background: active ? ACCENT : SURFACE_WHITE,
                color: active ? "white" : TEXT_DARK,
                fontFamily: "'Outfit', system-ui",
              }}>{cat}</button>
            );
          })}
        </div>

        <div style={{ padding: "6px 0 24px" }}>
          {filtered.map((recipe, idx) => {
            const isSaved = savedIds.has(recipe.id);
            const firstSentence = recipe.whyThisWeek.split(/(?<=\.)\s/)[0] || recipe.whyThisWeek;
            const heroColor = getHeroColor(idx);
            const titleColor = isLightHex(heroColor) ? "#1a1a1a" : "#FFFFFF";
            const heartShadow = titleColor === "#FFFFFF" ? "0 2px 6px rgba(0,0,0,0.35)" : "0 1px 2px rgba(0,0,0,0.15)";
            return (
              <div key={recipe.id} onClick={() => navigate(`/recipes/${recipe.id}`)} style={{ margin: "10px 11px", borderRadius: 24, overflow: "hidden", background: SURFACE_WHITE, border: `1px solid ${BORDER_SOFT}`, boxShadow: "0 6px 18px rgba(120,60,10,0.08)", cursor: "pointer" }}>
                {/* Hero */}
                <div style={{ background: heroColor, height: 180, padding: 16, position: "relative", display: "flex", flexDirection: "column" }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(recipe.id); }} aria-label={isSaved ? "Unsave" : "Save"} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", fontSize: 20, lineHeight: 1, cursor: "pointer", color: titleColor, textShadow: heartShadow, padding: 4 }}>
                    {isSaved ? "♥" : "♡"}
                  </button>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 18px" }}>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: titleColor, textAlign: "center", margin: 0 }}>{recipe.title}</h3>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ background: "rgba(0,0,0,0.28)", borderRadius: 8, padding: "4px 10px", fontSize: 10, color: "white", fontWeight: 600, fontFamily: "'Outfit', system-ui" }}>{recipe.category}</span>
                    <span style={{ background: "rgba(0,0,0,0.28)", borderRadius: 8, padding: "4px 10px", fontSize: 10, color: "white", fontWeight: 600, fontFamily: "'Outfit', system-ui" }}>{recipe.prepTime} min</span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "12px 14px 14px" }}>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "#666", fontStyle: "italic", lineHeight: 1.4, marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstSentence}</p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {recipe.vitamins.map(v => (
                      <span key={v.name} style={{ background: PILL_BG, border: `1px solid ${PILL_BORDER}`, borderRadius: 8, padding: "3px 8px", fontSize: 9, color: PILL_TEXT, fontWeight: 600, fontFamily: "'Outfit', system-ui" }}>
                        {v.emoji} {v.name} {v.amount}
                      </span>
                    ))}
                  </div>

                  <div style={{ background: SURFACE_PEACH, borderLeft: `3px solid ${ACCENT}`, borderRadius: "0 8px 8px 0", padding: "8px 10px", marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9, color: PILL_TEXT, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Why this week 🌱</p>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 9.5, color: "#666", lineHeight: 1.5 }}>{recipe.whyThisWeek}</p>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); navigate(`/recipes/${recipe.id}`); }} style={{ width: "100%", background: ACCENT, color: "white", border: "none", borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', system-ui", cursor: "pointer" }}>
                    View full recipe →
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🍽️</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 13, color: "white", fontWeight: 600 }}>No recipes in this category</p>
              <p style={{ fontFamily: "'Outfit', system-ui", fontSize: 11, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>Try another category or check next week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
