import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { kits, remedies, teas, homeopathyCourses, SHOP_DISCLAIMER, Product } from "@/data/shopData";
import { getHomeopathyLessonContent } from "@/data/homeopathyLessons";
import { LessonContent } from "@/data/lessonContent";
import { Check, ChevronRight, Lock, Save } from "lucide-react";
import { toast } from "sonner";

const Shop = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { cartCount, addItem } = useCart();
  const [tab, setTab] = useState<"remedies" | "learn">("remedies");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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

  // --- LESSON READER ---
  if (selectedCourse && selectedLesson !== null) {
    const course = homeopathyCourses.find(c => c.id === selectedCourse)!;
    const lesson: LessonContent = getHomeopathyLessonContent(course.id, selectedLesson);
    const lessonId = `${course.id}-L${selectedLesson + 1}`;
    const isCompleted = completions.includes(lessonId);
    const isLast = selectedLesson === course.lessonCount - 1;

    const handleComplete = async () => {
      await completeLesson(lessonId);
      if (isLast) { toast.success("Course complete! 🌸"); setSelectedCourse(null); setSelectedLesson(null); }
      else { toast.success("Lesson complete! ✓"); setSelectedLesson(selectedLesson + 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }
    };

    return (
      <div className="min-h-screen flex flex-col page-enter" style={{ background: "#FF8C42" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(210,80,10,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 14 }}>← Back</button>
          <p className="font-semibold truncate max-w-[180px]" style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>{course.title}</p>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{selectedLesson + 1}/{course.lessonCount}</span>
        </div>
        <div className="px-5 pt-5 pb-6">
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>LESSON {selectedLesson + 1}</p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>{lesson.title}</h1>
          <span style={{ display: "inline-block", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 11, color: "#fff", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 12px" }}>{lesson.duration} min read</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-28 space-y-5">
          <p style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.75 }}>{lesson.intro}</p>
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,244,238,0.96)" }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#888", marginBottom: 10 }}>What you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 7, flexShrink: 0, background: "#FF8C42" }} />
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 14, color: "#333", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 22, color: "#fff", marginTop: 24, marginBottom: 10, lineHeight: 1.25 }}>{section.heading}</h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{section.body}</p>
              {section.tip && (
                <div className="rounded-[12px] p-3" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 11, color: "#fff", marginBottom: 4 }}>💡 Tip</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 6 }}>Did you know? 🌿</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{lesson.didYouKnow}</p>
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.78)", marginBottom: 8 }}>Reflect 💭</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 14, color: "#fff", marginBottom: 10, lineHeight: 1.5 }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full rounded-[10px] p-3 resize-none min-h-[80px] belly-input-focus"
              style={{ background: "rgba(255,255,255,0.95)", border: "none", color: "#333", fontFamily: "'Outfit', sans-serif", fontSize: 13, lineHeight: 1.5 }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 belly-btn-press" style={{ borderRadius: 12, padding: "10px 18px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, background: "#fff", color: "#FF6520", border: "none", opacity: !reflectionText.trim() || reflectionSaved ? 0.5 : 1 }}>
              <Save size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />Save reflection
            </button>
            {reflectionSaved && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#B8F5C8", marginTop: 6 }}>Saved 🌸</p>}
          </div>
          <div>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 8 }}>Quick check ✓</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#fff", marginBottom: 12, lineHeight: 1.5 }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,255,255,0.25)", bg = "rgba(255,255,255,0.16)", color = "#fff";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "rgba(120,220,150,0.7)"; bg = "rgba(120,220,150,0.25)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "rgba(255,160,160,0.7)"; bg = "rgba(255,160,160,0.25)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "rgba(120,220,150,0.7)"; bg = "rgba(120,220,150,0.18)"; }
                return (
                  <button key={i} disabled={quizSubmitted} onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); }}
                    className="w-full text-left rounded-[12px] p-3 transition-all belly-card-interactive"
                    style={{ background: bg, border: `1px solid ${borderColor}`, color, fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>
                    {opt}{quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 rounded-[12px] p-3" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌿" : "Almost! Here's why..."}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "linear-gradient(140deg, #FF7E48, #FFA070)" }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>Key takeaway</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.55 }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3" style={{ background: "rgba(210,80,10,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.12)", maxWidth: 430, margin: "0 auto" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 belly-btn-press" style={{ borderRadius: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13, background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>← Previous</button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 belly-btn-primary" style={{ borderRadius: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, background: "#fff", color: "#FF6520", border: "none", opacity: isCompleted ? 0.6 : 1 }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete course 🌸" : "Complete & continue →"}
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
      <div className="min-h-screen pb-20 page-enter" style={{ background: "#FF8C42" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3" style={{ background: "rgba(210,80,10,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <button onClick={() => setSelectedCourse(null)} style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 14 }}>← Back</button>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full rounded-[18px] p-4 flex items-center gap-3 text-left belly-card-interactive"
                style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: completed ? "#40A060" : "rgba(255,255,255,0.25)", color: "#fff" }}>
                  {completed ? <Check size={14} /> : lesson.number}
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>{lesson.title}</p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.78)" }}>{lesson.duration} min</p>
                </div>
                <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MAIN SHOP ---
  const cardShadow = "0 2px 12px rgba(180,100,20,0.06)";
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
      <div style={{ background: "#E8601A", padding: "14px 16px", boxShadow: "0 2px 8px rgba(120,60,10,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.1 }}>Belly Shop</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400, fontSize: 10, fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Natural remedies, delivered to you</p>
        </div>
        <button onClick={() => navigate("/cart")} aria-label="Open cart" className="relative shrink-0"
          style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center"
              style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", color: "#E8601A", fontSize: 9, fontWeight: 700, animation: "badgePop 200ms cubic-bezier(0.34,1.56,0.64,1)" }}>
              {cartCount}
            </div>
          )}
        </button>
      </div>
      <div className="flex gap-2 px-5 my-3">
        {(["remedies", "learn"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="capitalize transition-all belly-btn-press"
            style={{
              background: tab === t ? "var(--color-accent-primary)" : "transparent",
              color: tab === t ? "#fff" : "var(--color-text-secondary)",
              fontWeight: tab === t ? 700 : 500,
              fontSize: 13,
              borderRadius: 20,
              padding: "6px 18px",
              border: tab === t ? "none" : "1px solid var(--color-border-default)",
              fontFamily: "'Outfit', sans-serif",
            }}>{t}</button>
        ))}
      </div>

      {tab === "remedies" ? (
        <>
          {/* Hero banner — white card with orange left accent */}
          <div className="mx-4 mb-4 p-5 rounded-[20px] relative overflow-hidden" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderLeft: "4px solid var(--color-accent-primary)", boxShadow: cardShadow }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.11em", marginBottom: 6, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>CURATED FOR PREGNANCY</p>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 6, lineHeight: 1.2 }}>Natural support for every trimester</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 400, marginBottom: 14, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>Homeopathic remedies + herbal teas, carefully selected for pregnancy safety</p>
            <button onClick={() => document.getElementById('remedy-kits')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: "transparent", border: "1.5px solid var(--color-accent-primary)", color: "var(--color-accent-primary)", fontSize: 13, fontWeight: 600, borderRadius: 20, padding: "7px 18px", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Shop all →</button>
          </div>

          <p id="remedy-kits" style={{ padding: "0 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 10, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>REMEDY KITS</p>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar mb-5" style={{ paddingRight: 32 }}>
            {kits.map(kit => (
              <div key={kit.id} className="min-w-[200px] shrink-0 belly-card-interactive overflow-hidden"
                style={{ background: "#FFFFFF", border: "1px solid var(--color-border-default)", borderRadius: 18, boxShadow: cardShadow, padding: 14 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--color-bg-card-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 12px" }}>
                  <span style={{ fontSize: 56, lineHeight: 1 }}>{kit.emoji}</span>
                </div>
                {kit.tag && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "var(--color-accent-light)", color: "var(--color-accent-dark)", display: "inline-block", marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>{kit.tag}</span>}
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>{kit.name}</p>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 400, margin: "4px 0 6px", fontFamily: "'Outfit', sans-serif", lineHeight: 1.45 }}>{kit.description}</p>
                {kit.contents?.map((c, i) => <p key={i} style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{c}</p>)}
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--color-accent-primary)", marginTop: 10 }}>${kit.price}</p>
                <button onClick={() => addToCart(kit)} className="w-full belly-btn-press" style={{ marginTop: 10, borderRadius: 999, padding: "10px 0", fontSize: 13, fontWeight: 700, background: addedId === kit.id ? "var(--color-success)" : "var(--color-accent-primary)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 200ms" }}>{addedId === kit.id ? "✓ Added" : "Add to cart →"}</button>
              </div>
            ))}
          </div>

          <p style={{ padding: "0 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 10, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>INDIVIDUAL REMEDIES</p>
          <div className="px-5 space-y-2 mb-5">
            {remedies.map(rem => (
              <div key={rem.id} className="flex items-center gap-3 belly-card-interactive"
                style={{ background: "#FFFFFF", border: "1px solid var(--color-border-default)", borderRadius: 16, padding: "13px 15px", boxShadow: cardShadow }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-bg-card-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>{rem.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "'Outfit', sans-serif" }}>{rem.name}</p>
                  {rem.brand && <p style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>{rem.brand}</p>}
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 400, fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{rem.use}</p>
                  {rem.safe && <p style={{ fontSize: 11, marginTop: 3, color: "var(--color-success)", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>✓ Pregnancy safe</p>}
                  {rem.tag && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, display: "inline-block", marginTop: 4, background: "var(--color-accent-light)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{rem.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--color-accent-primary)" }}>${rem.price}</p>
                  {rem.unit && <p style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>{rem.unit}</p>}
                  <button onClick={() => addToCart(rem)} className="belly-btn-press" style={{ marginTop: 6, borderRadius: 999, padding: "5px 14px", fontSize: 11, fontWeight: 700, background: addedId === rem.id ? "var(--color-success)" : "var(--color-accent-primary)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 200ms" }}>{addedId === rem.id ? "✓" : "Add"}</button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ padding: "0 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 10, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>HERBAL TEAS</p>
          <div className="px-5 space-y-2 mb-5">
            {teas.map(tea => (
              <div key={tea.id} className="flex items-center gap-3 belly-card-interactive"
                style={{ background: "#FFFFFF", border: "1px solid var(--color-border-default)", borderRadius: 16, padding: "13px 15px", boxShadow: cardShadow }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-bg-card-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>{tea.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "'Outfit', sans-serif" }}>{tea.name}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 400, fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{tea.use}</p>
                  {tea.tag && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, display: "inline-block", marginTop: 4, background: "var(--color-accent-light)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{tea.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--color-accent-primary)" }}>${tea.price}</p>
                  {tea.unit && <p style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>{tea.unit}</p>}
                  <button onClick={() => addToCart(tea)} className="belly-btn-press" style={{ marginTop: 6, borderRadius: 999, padding: "5px 14px", fontSize: 11, fontWeight: 700, background: addedId === tea.id ? "var(--color-success)" : "var(--color-accent-primary)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 200ms" }}>{addedId === tea.id ? "✓" : "Add"}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-[12px] p-3" style={{ background: "var(--color-bg-card-subtle)", border: "1px solid var(--color-border-default)" }}>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      ) : (
        <>
          <div className="mx-4 mb-4 p-5 rounded-[20px]" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", borderLeft: "4px solid var(--color-accent-primary)", boxShadow: cardShadow }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.11em", marginBottom: 6, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>INTRO TO HOMEOPATHY</p>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 6 }}>Learn the gentle art of natural healing</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 400, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>Evidence-informed courses on using homeopathic remedies safely during pregnancy</p>
          </div>
          <div className="px-5 space-y-3 mb-5">
            {homeopathyCourses.map(course => {
              const isLocked = course.isPremium && !profile?.is_premium;
              const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
              const progress = courseCompletions / course.lessonCount;
              return (
                <button key={course.id} onClick={() => !isLocked && setSelectedCourse(course.id)}
                  className="w-full text-left belly-card-interactive"
                  style={{ background: "#FFFFFF", border: "1px solid var(--color-border-default)", borderRadius: 18, boxShadow: cardShadow, opacity: isLocked ? 0.6 : 1 }}>
                  <div className="flex items-start gap-3 p-[14px_16px_10px]">
                    <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "var(--color-bg-card-subtle)" }}>
                      {isLocked ? <Lock size={18} style={{ color: "var(--color-text-muted)" }} /> : course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "'Outfit', sans-serif" }}>{course.title}</p>
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif" }}>{course.lessonCount} lessons · {course.duration} min</p>
                      <p className="line-clamp-2" style={{ fontSize: 13, marginTop: 4, color: "var(--color-text-secondary)", fontWeight: 400, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{course.description}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 8, color: "var(--color-accent-primary)", fontFamily: "'Outfit', sans-serif" }}>
                      {isLocked ? <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "var(--color-accent-light)", color: "var(--color-accent-dark)" }}>🔒 Premium</span>
                        : courseCompletions > 0 ? "Continue →" : "Start →"}
                    </span>
                  </div>
                  {courseCompletions > 0 && !isLocked && (
                    <div className="px-4 pb-2">
                      <div className="h-1 rounded-full" style={{ background: "var(--color-border-default)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "var(--color-accent-primary)" }} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {course.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--color-accent-light)", color: "var(--color-accent-dark)", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mx-5 mb-5 rounded-[12px] p-3" style={{ background: "var(--color-bg-card-subtle)", border: "1px solid var(--color-border-default)" }}>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      )}

      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Shop;
