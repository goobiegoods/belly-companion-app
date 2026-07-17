import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { kits as staticKits, remedies as staticRemedies, teas as staticTeas, homeopathyCourses, SHOP_DISCLAIMER, Product } from "@/data/shopData";
import { getCurrentWeek, getWeekData } from "@/data/pregnancyWeeks";
import { getHomeopathyLessonContent } from "@/data/homeopathyLessons";
import { LessonContent } from "@/data/lessonContent";
import { Check, ChevronRight, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { SceneBackground, GhHeader, GlassCard } from "@/components/golden";

function useShopProducts() {
  const [kits, setKits] = useState<Product[]>(staticKits);
  const [remedies, setRemedies] = useState<Product[]>(staticRemedies);
  const [teas, setTeas] = useState<Product[]>(staticTeas);
  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      if (!data || data.length === 0) return;
      const map = (row: any): Product => ({
        id: row.id, name: row.name, price: Number(row.price), emoji: row.emoji,
        type: row.category as any, description: row.description,
        tag: row.tag ?? undefined, brand: row.brand ?? undefined,
        unit: row.unit ?? undefined, use: row.use_case ?? undefined,
        contents: row.contents ?? undefined,
        stripePriceId: row.stripe_price_id || undefined,
      });
      setKits(data.filter((r: any) => r.category === "kit").map(map));
      setRemedies(data.filter((r: any) => r.category === "remedy").map(map));
      setTeas(data.filter((r: any) => r.category === "tea").map(map));
    });
  }, []);
  return { kits, remedies, teas };
}

const CATEGORY_PILLS = ["Remedies", "Teas", "Kits"] as const;
type CategoryPill = (typeof CATEGORY_PILLS)[number];

const TRIMESTER_WORDS = ["", "first", "second", "third"];

const Shop = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { cartCount, addItem } = useCart();
  const { kits, remedies, teas } = useShopProducts();
  const [category, setCategory] = useState<CategoryPill>("Remedies");
  const [showLearn, setShowLearn] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentWeek = profile?.due_date ? getCurrentWeek(profile.due_date) : 20;
  const trimester = getWeekData(currentWeek).trimester;

  const addToCart = (product: Product) => {
    addItem(product);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(6);
    toast.success("Added to cart 🛍️");
    setAddedId(product.id);
    setTimeout(() => setAddedId(prev => (prev === product.id ? null : prev)), 1500);
  };

  const saveReflection = useCallback(async (lessonId: string, text: string) => {
    if (!user || !text.trim()) return;
    await supabase.from("lesson_reflections" as any).upsert({ user_id: user.id, lesson_id: lessonId, reflection_text: text } as any, { onConflict: "user_id,lesson_id" } as any);
  }, [user]);

  const completeLesson = async (lessonId: string) => {
    if (!user || completions.includes(lessonId)) return;
    await supabase.from("lesson_completions").insert({ user_id: user.id, lesson_id: lessonId });
    setCompletions(prev => [...prev, lessonId]);
  };

  // Featured kit: prefer one matching the mama's trimester, else the tagged/first one.
  const featuredKit =
    kits.find(k => k.name.toLowerCase().includes(TRIMESTER_WORDS[trimester])) ||
    kits.find(k => k.tag) ||
    kits[0];

  // --- LESSON READER (kept from the Learn feature, dark scene) ---
  if (selectedCourse && selectedLesson !== null) {
    const course = homeopathyCourses.find(c => c.id === selectedCourse)!;
    const lesson: LessonContent = getHomeopathyLessonContent(course.id, selectedLesson);
    const lessonId = `${course.id}-L${selectedLesson + 1}`;
    const isCompleted = completions.includes(lessonId);
    const isLast = selectedLesson === course.lessonCount - 1;

    const handleComplete = async () => {
      await completeLesson(lessonId);
      if (isLast) { toast.success("Course complete! ✨"); setSelectedCourse(null); setSelectedLesson(null); }
      else { toast.success("Lesson complete! ✓"); setSelectedLesson(selectedLesson + 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }
    };

    return (
      <div className="min-h-screen flex flex-col page-enter gh-scene-shop" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(10,6,16,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            style={{ color: "rgba(251,238,224,0.85)", fontWeight: 500, fontSize: 14 }}>← Back</button>
          <p className="font-semibold truncate max-w-[180px]" style={{ fontSize: 13 }}>{course.title}</p>
          <span className="font-gh-mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>{selectedLesson + 1}/{course.lessonCount}</span>
        </div>
        <div className="px-5 pt-5 pb-6">
          <p className="gh-section-label">lesson {selectedLesson + 1}</p>
          <h1 className="font-gh-serif" style={{ fontWeight: 500, fontSize: 22, marginBottom: 10, lineHeight: 1.2 }}>{lesson.title}</h1>
          <span className="font-gh-mono" style={{ display: "inline-block", fontSize: 11, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px" }}>{lesson.duration} min read</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-28 space-y-5">
          <p style={{ fontSize: 15, lineHeight: 1.75 }}>{lesson.intro}</p>
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="gh-section-label">what you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, flexShrink: 0, background: "var(--gold)" }} />
                  <p style={{ fontSize: 14, lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-gh-serif" style={{ fontWeight: 500, fontSize: 21, marginTop: 24, marginBottom: 10, lineHeight: 1.25 }}>{section.heading}</h2>
              <p style={{ color: "rgba(251,238,224,0.85)", fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{section.body}</p>
              {section.tip && (
                <div className="rounded-[12px] p-3 gh-glass-subtle">
                  <p style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>💡 Tip</p>
                  <p style={{ fontSize: 13, color: "rgba(251,238,224,0.85)", lineHeight: 1.55 }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="font-gh-serif" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Did you know? 🌿</p>
            <p style={{ fontSize: 13, color: "rgba(251,238,224,0.85)", lineHeight: 1.6 }}>{lesson.didYouKnow}</p>
          </div>
          <div className="rounded-[14px] p-4 gh-glass-subtle">
            <p className="gh-section-label">reflect 💭</p>
            <p className="font-gh-serif" style={{ fontStyle: "italic", fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full rounded-[10px] p-3 resize-none min-h-[80px] outline-none"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--cream)", fontSize: 13, lineHeight: 1.5 }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 belly-btn-press" style={{ borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)", border: "none", opacity: !reflectionText.trim() || reflectionSaved ? 0.5 : 1 }}>
              <Save size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />Save reflection
            </button>
            {reflectionSaved && <p style={{ fontSize: 12, color: "#7fe0d3", marginTop: 6 }}>Saved ✨</p>}
          </div>
          <div>
            <p className="font-gh-serif" style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Quick check ✓</p>
            <p style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,255,255,0.25)", bg = "rgba(255,255,255,0.12)";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "rgba(127,224,211,0.7)"; bg = "rgba(44,156,143,0.3)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "rgba(247,159,192,0.7)"; bg = "rgba(181,56,107,0.3)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "rgba(127,224,211,0.7)"; bg = "rgba(44,156,143,0.2)"; }
                return (
                  <button key={i} disabled={quizSubmitted} onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); }}
                    className="w-full text-left rounded-[12px] p-3 transition-all belly-card-interactive"
                    style={{ background: bg, border: `1px solid ${borderColor}`, color: "var(--cream)", fontSize: 13 }}>
                    {opt}{quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 rounded-[12px] p-3 gh-glass-subtle">
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌿" : "Almost! Here's why..."}</p>
                <p style={{ fontSize: 12, color: "rgba(251,238,224,0.85)", lineHeight: 1.55 }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "linear-gradient(140deg, rgba(242,182,71,0.35), rgba(232,98,46,0.35))", border: "1px solid var(--glass-border)" }}>
            <p className="gh-section-label">key takeaway</p>
            <p className="font-gh-serif" style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.55 }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3" style={{ background: "rgba(10,6,16,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.12)", maxWidth: 430, margin: "0 auto" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 belly-btn-press" style={{ borderRadius: 12, fontWeight: 600, fontSize: 13, background: "rgba(255,255,255,0.14)", color: "var(--cream)", border: "1px solid rgba(255,255,255,0.25)" }}>← Previous</button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 belly-btn-press" style={{ borderRadius: 12, fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg, var(--gold), var(--ember))", color: "var(--night)", border: "none", opacity: isCompleted ? 0.6 : 1 }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete course ✨" : "Complete & continue →"}
          </button>
        </div>
      </div>
    );
  }

  // --- LESSON LIST ---
  if (selectedCourse) {
    const course = homeopathyCourses.find(c => c.id === selectedCourse)!;
    const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
      id: `${course.id}-L${i + 1}`, number: i + 1,
      title: getHomeopathyLessonContent(course.id, i).title,
      duration: getHomeopathyLessonContent(course.id, i).duration,
    }));

    return (
      <div className="min-h-screen pb-24 page-enter gh-scene-shop" style={{ color: "var(--cream)", fontFamily: "'Inter', system-ui" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => setSelectedCourse(null)} style={{ color: "rgba(251,238,224,0.85)", fontWeight: 500, fontSize: 14 }}>← Back</button>
          <h1 className="font-gh-serif" style={{ fontWeight: 500, fontSize: 18 }}>{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full rounded-[18px] p-4 flex items-center gap-3 text-left belly-card-interactive gh-glass-subtle">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: completed ? "var(--teal)" : "rgba(255,255,255,0.2)", color: completed ? "var(--night)" : "var(--cream)" }}>
                  {completed ? <Check size={14} /> : lesson.number}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{lesson.title}</p>
                  <p className="font-gh-mono" style={{ fontSize: 10.5, color: "rgba(251,238,224,0.65)" }}>{lesson.duration} min</p>
                </div>
                <ChevronRight size={16} style={{ color: "rgba(251,238,224,0.6)" }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- LEARN (course list) ---
  if (showLearn) {
    return (
      <SceneBackground scene="shop">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button onClick={() => setShowLearn(false)} style={{ color: "rgba(251,238,224,0.85)", fontWeight: 500, fontSize: 14 }}>← Shop</button>
          <h1 className="font-gh-serif" style={{ fontWeight: 500, fontSize: 18, fontStyle: "italic" }}>Learn the gentle art</h1>
        </div>
        <div className="px-4 pb-28 space-y-3 pt-2">
          {homeopathyCourses.map(course => {
            const isLocked = course.isPremium && !profile?.is_premium;
            const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
            const progress = courseCompletions / course.lessonCount;
            return (
              <button key={course.id} onClick={() => !isLocked && setSelectedCourse(course.id)}
                className="w-full text-left belly-card-interactive gh-glass"
                style={{ opacity: isLocked ? 0.6 : 1, padding: 0 }}>
                <div className="flex items-start gap-3 p-[14px_16px_10px]">
                  <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "rgba(255,255,255,0.1)" }}>
                    {isLocked ? <Lock size={18} style={{ color: "rgba(251,238,224,0.6)" }} /> : course.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-gh-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--cream)" }}>{course.title}</p>
                    <p className="font-gh-mono" style={{ fontSize: 10.5, color: "rgba(251,238,224,0.6)" }}>{course.lessonCount} lessons · {course.duration} min</p>
                    <p className="line-clamp-2" style={{ fontSize: 12.5, marginTop: 4, color: "rgba(251,238,224,0.7)", lineHeight: 1.5 }}>{course.description}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 8, color: "var(--gold)" }}>
                    {isLocked ? <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "rgba(242,182,71,0.2)", color: "var(--gold)" }}>🔒 Premium</span>
                      : courseCompletions > 0 ? "Continue →" : "Start →"}
                  </span>
                </div>
                {courseCompletions > 0 && !isLocked && (
                  <div className="px-4 pb-3">
                    <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, var(--teal), var(--gold))" }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SceneBackground>
    );
  }

  // --- MAIN SHOP ---
  const ProductRow = ({ p }: { p: Product }) => (
    <div className="gh-glass-subtle" style={{ padding: "12px 14px", marginBottom: 9, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div className="font-gh-serif" style={{ fontSize: 14.5, color: "var(--cream)" }}>{p.emoji} {p.name}</div>
        <div style={{ fontSize: 11, color: "rgba(251,238,224,0.5)", marginTop: 2 }}>
          {[p.use, p.brand, p.unit].filter(Boolean).join(" · ")}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="font-gh-mono" style={{ fontSize: 14, color: "var(--gold)", fontWeight: 600 }}>${p.price}</div>
        <button onClick={() => addToCart(p)} style={{ fontSize: 11, color: addedId === p.id ? "#7fe0d3" : "#ffb187", marginTop: 3, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
          {addedId === p.id ? "✓ Added" : "Add"}
        </button>
      </div>
    </div>
  );

  const KitCard = ({ kit, recommended }: { kit: Product; recommended?: boolean }) => (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="font-gh-mono" style={{ fontSize: 10, color: "var(--gold)", letterSpacing: ".1em", marginBottom: 5, textTransform: "uppercase" }}>
            {recommended ? "remedy kit" : kit.tag || "remedy kit"}
          </div>
          <div className="font-gh-serif" style={{ fontSize: 17, fontWeight: 500, color: "var(--cream)", lineHeight: 1.3 }}>
            {kit.name}
          </div>
        </div>
        <div className="font-gh-mono" style={{ fontSize: 19, fontWeight: 600, color: "var(--gold)" }}>${kit.price}</div>
      </div>
      <div style={{ fontSize: 11.5, color: "rgba(251,238,224,0.6)", marginBottom: 13 }}>
        {kit.contents?.length ? kit.contents.join(" · ") : kit.description}
      </div>
      <button
        onClick={() => addToCart(kit)}
        className="belly-btn-press w-full"
        style={{
          background: addedId === kit.id ? "var(--teal)" : "linear-gradient(135deg, var(--gold), var(--ember))",
          borderRadius: 12, padding: 11, textAlign: "center", fontWeight: 600, fontSize: 13,
          color: "var(--night)", border: "none", cursor: "pointer",
        }}
      >
        {addedId === kit.id ? "✓ Added to cart" : "Add to cart →"}
      </button>
    </GlassCard>
  );

  return (
    <SceneBackground scene="shop">
      <GhHeader
        brand="Belly shop"
        tag="natural remedies · delivered"
        brandSize={20}
        showMenu={false}
        glowStyle={{ right: -30, top: -55 }}
        right={
          <button onClick={() => navigate("/cart")} aria-label="Open cart" className="gh-icon-btn" style={{ position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <div className="absolute flex items-center justify-center" style={{ top: -3, right: -4, minWidth: 15, height: 15, padding: "0 4px", borderRadius: 999, background: "var(--gold)", color: "var(--night)", fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                {cartCount > 9 ? "9+" : cartCount}
              </div>
            )}
          </button>
        }
      />

      <div style={{ padding: "4px 16px 110px" }}>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, marginBottom: 13, overflowX: "auto" }}>
          {CATEGORY_PILLS.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`gh-pill ${category === c ? "gh-pill-filled" : ""}`} style={{ flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>

        {category === "Remedies" && (
          <>
            <div className="gh-section-label">bella recommends for week {currentWeek}</div>
            {featuredKit && <KitCard kit={featuredKit} recommended />}
            <div className="gh-section-label">individual remedies</div>
            {remedies.map(r => <ProductRow key={r.id} p={r} />)}
          </>
        )}

        {category === "Teas" && (
          <>
            <div className="gh-section-label">herbal teas</div>
            {teas.map(t => <ProductRow key={t.id} p={t} />)}
          </>
        )}

        {category === "Kits" && (
          <>
            <div className="gh-section-label">remedy kits</div>
            {kits.map(k => <KitCard key={k.id} kit={k} />)}
          </>
        )}

        {/* Learn entry */}
        <button
          onClick={() => setShowLearn(true)}
          className="w-full text-left gh-glass-subtle belly-card-interactive"
          style={{ padding: "13px 15px", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div className="font-gh-serif" style={{ fontSize: 14.5, color: "var(--cream)" }}>🌿 Learn: intro to homeopathy</div>
            <div style={{ fontSize: 11, color: "rgba(251,238,224,0.5)", marginTop: 2 }}>{homeopathyCourses.length} short courses on gentle natural healing</div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
        </button>

        <div className="gh-glass-dark" style={{ marginTop: 12, padding: 12 }}>
          <p style={{ fontSize: 10.5, color: "rgba(251,238,224,0.5)", lineHeight: 1.5 }}>{SHOP_DISCLAIMER}</p>
        </div>
      </div>
    </SceneBackground>
  );
};

export default Shop;
