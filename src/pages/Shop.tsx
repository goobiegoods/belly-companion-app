import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { kits, remedies, teas, homeopathyCourses, SHOP_DISCLAIMER, Product } from "@/data/shopData";
import { getHomeopathyLessonContent } from "@/data/homeopathyLessons";
import { LessonContent } from "@/data/lessonContent";
import { ShoppingBag, X, Plus, Minus, Check, ChevronRight, Lock, Save } from "lucide-react";
import { toast } from "sonner";

interface CartItem { product: Product; qty: number }

const Shop = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"remedies" | "learn">("remedies");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    setOrdering(true);
    const items = cart.map(i => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price }));
    await supabase.from("orders" as any).insert({ user_id: user.id, items, total: cartTotal, status: "pending" } as any);
    setCart([]); setShowCart(false); setOrdering(false);
    toast.success("Order received! 🌸 We'll be in touch within 24 hours with shipping details.");
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
      <div className="min-h-screen flex flex-col page-enter" style={{ background: "transparent" }}>
        <div className="flex items-center justify-between px-4 py-3 belly-glass-nav" style={{ borderBottom: "1px solid rgba(255,228,212,0.6)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <p className="text-[13px] font-semibold truncate max-w-[180px]" style={{ color: "#2A1200" }}>{course.title}</p>
          <span className="text-[10px] px-2 py-1 rounded-full belly-badge-glass" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>{selectedLesson + 1}/{course.lessonCount}</span>
        </div>
        <div className="px-5 pt-5 pb-6 belly-hero-gradient">
          <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.5)" }}>LESSON {selectedLesson + 1}</p>
          <h1 className="font-display text-[22px] font-bold mb-3" style={{ color: "#2A1200" }}>{lesson.title}</h1>
          <span className="inline-block text-[11px] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.35)", color: "#2A1200" }}>{lesson.duration} min read</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
          <p className="font-display text-[15px] leading-[1.75]" style={{ color: "#2A1200" }}>{lesson.intro}</p>
          <div className="rounded-r-[12px] p-4" style={{ background: "rgba(255,244,238,0.9)", borderLeft: "3px solid #FFB899" }}>
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "#D4906A" }}>What you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#FFB899" }} />
                  <p className="text-[13px]" style={{ color: "#2A1200" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-[16px] font-bold mb-2" style={{ color: "#2A1200" }}>{section.heading}</h2>
              <p className="text-[13px] leading-[1.75] mb-3" style={{ color: "#2A1200" }}>{section.body}</p>
              {section.tip && (
                <div className="belly-glass-card rounded-[12px] p-3">
                  <p className="text-[11px] font-bold mb-1" style={{ color: "#D4906A" }}>💡 Tip:</p>
                  <p className="text-[12px]" style={{ color: "#2A1200" }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div className="belly-glass-card rounded-[14px] p-4">
            <p className="font-display text-[13px] font-bold mb-1" style={{ color: "#2A1200" }}>Did you know? 🌸</p>
            <p className="text-[12px]" style={{ color: "rgba(42,18,0,0.75)" }}>{lesson.didYouKnow}</p>
          </div>
          <div className="belly-glass-card rounded-[14px] p-4">
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "#D4906A" }}>Reflect 💭</p>
            <p className="font-display text-[14px] italic mb-3" style={{ color: "#2A1200" }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full rounded-[10px] p-3 text-[13px] resize-none min-h-[80px] font-display italic belly-input-focus"
              style={{ background: "rgba(255,248,245,0.9)", border: "1px solid rgba(255,228,212,0.8)", color: "#2A1200" }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 rounded-[12px] px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>
              Save my reflection 💭
            </button>
            {reflectionSaved && <p className="text-[12px] mt-1.5" style={{ color: "#A8D4B8" }}>Saved 🌸</p>}
          </div>
          <div>
            <p className="font-display text-[15px] font-bold mb-3" style={{ color: "#2A1200" }}>Quick check ✓</p>
            <p className="text-[13px] mb-3" style={{ color: "#2A1200" }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,228,212,0.8)", bg = "rgba(255,255,255,0.75)";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "#A8D4B8"; bg = "rgba(240,250,244,0.9)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "#FFB899"; bg = "rgba(255,244,238,0.9)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "#A8D4B8"; bg = "rgba(240,250,244,0.9)"; }
                return (
                  <button key={i} disabled={quizSubmitted} onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); }}
                    className="w-full text-left rounded-[12px] p-3 text-[13px] transition-all belly-card-interactive"
                    style={{ background: bg, border: `1.5px solid ${borderColor}`, color: "#2A1200" }}>
                    {opt}{quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 belly-glass-card rounded-[12px] p-3">
                <p className="text-[13px] font-bold mb-1" style={{ color: "#2A1200" }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌸" : "Almost! Here's why..."}</p>
                <p className="text-[12px]" style={{ color: "rgba(42,18,0,0.75)" }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "#2A1200" }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#D4B0A0" }}>Key takeaway</p>
            <p className="font-display text-[14px] leading-[1.6]" style={{ color: "#FFF4EE" }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3 belly-glass-nav" style={{ borderTop: "1px solid rgba(255,228,212,0.6)" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 rounded-[12px] text-[13px] font-semibold belly-btn-press" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>← Previous</button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 rounded-[12px] text-[14px] font-bold disabled:opacity-50 belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>
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
      <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 belly-glass-nav" style={{ borderBottom: "1px solid rgba(255,228,212,0.6)" }}>
          <button onClick={() => setSelectedCourse(null)} className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <h1 className="font-display text-[16px] font-bold" style={{ color: "#2A1200" }}>{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full belly-glass-card rounded-[18px] p-4 flex items-center gap-3 text-left belly-card-interactive">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: completed ? "#A8D4B8" : "rgba(255,240,232,0.8)", color: completed ? "white" : "#D4906A" }}>
                  {completed ? <Check size={14} /> : lesson.number}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{lesson.title}</p>
                  <p className="text-[10px]" style={{ color: "#D4B0A0" }}>{lesson.duration} min</p>
                </div>
                <ChevronRight size={16} style={{ color: "#D4B0A0" }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MAIN SHOP ---
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-1">
        <h1 className="font-display text-[26px] font-bold tracking-[-0.5px]" style={{ color: "#2A1200" }}>Belly Shop</h1>
        <p className="text-[12px]" style={{ color: "#D4B0A0" }}>Natural remedies, delivered to you</p>
      </div>
      <div className="flex gap-2 px-5 my-3">
        {(["remedies", "learn"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-[12px] font-medium capitalize transition-all belly-btn-press"
            style={{ background: tab === t ? "#FFB899" : "rgba(255,240,232,0.8)", color: tab === t ? "#2A1200" : "#D4906A", fontWeight: tab === t ? 600 : 500 }}>{t}</button>
        ))}
      </div>

      {tab === "remedies" ? (
        <>
          <div className="mx-4 mb-4 p-5 rounded-[20px] belly-hero-gradient relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.45)" }}>CURATED FOR PREGNANCY</p>
            <h2 className="font-display text-[20px] font-bold mb-1" style={{ color: "#2A1200" }}>Natural support for every trimester</h2>
            <p className="text-[12px] mb-3" style={{ color: "rgba(42,18,0,0.6)" }}>Homeopathic remedies + herbal teas, carefully selected for pregnancy safety</p>
            <span className="inline-block text-[11px] px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.35)", color: "#2A1200" }}>Shop all →</span>
          </div>

          <p className="px-5 text-[10px] uppercase tracking-[0.12em] mb-2" style={{ color: "#D4B0A0" }}>Remedy kits</p>
          <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar mb-5" style={{ paddingRight: 32 }}>
            {kits.map(kit => (
              <div key={kit.id} className="min-w-[180px] rounded-[18px] overflow-hidden belly-glass-card shrink-0 belly-card-interactive">
                <div className="h-[80px] flex items-center justify-center belly-hero-gradient">
                  <span className="text-[40px]">{kit.emoji}</span>
                </div>
                <div className="p-3">
                  {kit.tag && <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold belly-badge-glass mb-1 inline-block" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>{kit.tag}</span>}
                  <p className="font-display text-[13px] font-bold" style={{ color: "#2A1200" }}>{kit.name}</p>
                  <p className="text-[11px] my-1" style={{ color: "#D4906A" }}>{kit.description}</p>
                  {kit.contents?.map((c, i) => <p key={i} className="text-[10px]" style={{ color: "#D4B0A0" }}>{c}</p>)}
                  <p className="font-display text-[16px] font-bold mt-2" style={{ color: "#2A1200" }}>${kit.price}</p>
                  <button onClick={() => addToCart(kit)} className="w-full mt-2 rounded-[10px] py-2 text-[11px] font-bold belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>Add to cart →</button>
                </div>
              </div>
            ))}
          </div>

          <p className="px-5 text-[10px] uppercase tracking-[0.12em] mb-2" style={{ color: "#D4B0A0" }}>Individual remedies</p>
          <div className="px-5 space-y-2 mb-5">
            {remedies.map(rem => (
              <div key={rem.id} className="belly-glass-card rounded-[16px] p-[13px_15px] flex items-center gap-3 belly-card-interactive">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0" style={{ background: "rgba(255,240,232,0.8)" }}>{rem.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{rem.name}</p>
                  {rem.brand && <p className="text-[10px]" style={{ color: "#D4B0A0" }}>{rem.brand}</p>}
                  <p className="text-[11px]" style={{ color: "#D4906A" }}>{rem.use}</p>
                  {rem.safe && <p className="text-[10px] mt-0.5" style={{ color: "#A8D4B8" }}>✓ Pregnancy safe</p>}
                  {rem.tag && <span className="text-[9px] px-2 py-0.5 rounded-full inline-block mt-0.5 belly-badge-glass" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>{rem.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>${rem.price}</p>
                  {rem.unit && <p className="text-[9px]" style={{ color: "#D4B0A0" }}>{rem.unit}</p>}
                  <button onClick={() => addToCart(rem)} className="mt-1 rounded-[16px] px-3 py-1 text-[10px] font-bold belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>Add</button>
                </div>
              </div>
            ))}
          </div>

          <p className="px-5 text-[10px] uppercase tracking-[0.12em] mb-2" style={{ color: "#D4B0A0" }}>Herbal teas</p>
          <div className="px-5 space-y-2 mb-5">
            {teas.map(tea => (
              <div key={tea.id} className="belly-glass-card rounded-[16px] p-[13px_15px] flex items-center gap-3 belly-card-interactive">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] shrink-0" style={{ background: "rgba(255,240,232,0.8)" }}>{tea.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{tea.name}</p>
                  <p className="text-[11px]" style={{ color: "#D4906A" }}>{tea.use}</p>
                  {tea.tag && <span className="text-[9px] px-2 py-0.5 rounded-full inline-block mt-0.5 belly-badge-glass" style={{ background: "rgba(255,240,232,0.8)", color: "#D4906A" }}>{tea.tag}</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>${tea.price}</p>
                  {tea.unit && <p className="text-[9px]" style={{ color: "#D4B0A0" }}>{tea.unit}</p>}
                  <button onClick={() => addToCart(tea)} className="mt-1 rounded-[16px] px-3 py-1 text-[10px] font-bold belly-btn-primary" style={{ background: "#FFB899", color: "#2A1200" }}>Add</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 belly-glass-card rounded-[12px] p-3">
            <p className="text-[10px]" style={{ color: "#D4B0A0" }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      ) : (
        <>
          <div className="mx-4 mb-4 p-5 rounded-[20px] belly-hero-gradient relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.45)" }}>INTRO TO HOMEOPATHY</p>
            <h2 className="font-display text-[20px] font-bold mb-1" style={{ color: "#2A1200" }}>Learn the gentle art of natural healing</h2>
            <p className="text-[12px]" style={{ color: "rgba(42,18,0,0.6)" }}>Evidence-informed courses on using homeopathic remedies safely during pregnancy</p>
          </div>
          <div className="px-5 space-y-3 mb-5">
            {homeopathyCourses.map(course => {
              const isLocked = course.isPremium && !profile?.is_premium;
              const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
              const progress = courseCompletions / course.lessonCount;
              return (
                <button key={course.id} onClick={() => !isLocked && setSelectedCourse(course.id)}
                  className="w-full belly-glass-card rounded-[18px] text-left belly-card-interactive"
                  style={{ opacity: isLocked ? 0.5 : 1 }}>
                  <div className="flex items-start gap-3 p-[14px_16px_10px]">
                    <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "rgba(255,240,232,0.8)" }}>
                      {isLocked ? <Lock size={18} style={{ color: "#D4B0A0" }} /> : course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{course.title}</p>
                      <p className="text-[10.5px]" style={{ color: "#D4B0A0" }}>{course.lessonCount} lessons · {course.duration} min</p>
                      <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "#D4906A" }}>{course.description}</p>
                    </div>
                    <span className="text-[12px] font-bold shrink-0 mt-2" style={{ color: "#D4906A" }}>
                      {isLocked ? <span className="text-[10px] px-2 py-1 rounded-full belly-badge-glass" style={{ background: "rgba(255,244,238,0.9)", border: "1px solid #FFCDB4", color: "#D4906A" }}>🔒 Premium</span>
                        : courseCompletions > 0 ? "Continue →" : "Start →"}
                    </span>
                  </div>
                  {courseCompletions > 0 && !isLocked && (
                    <div className="px-4 pb-2">
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,240,232,0.8)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "#FFB899" }} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {course.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full belly-badge-glass" style={{ background: "rgba(255,244,238,0.9)", border: "1px solid rgba(255,205,180,0.6)", color: "#D4906A" }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mx-5 mb-5 belly-glass-card rounded-[12px] p-3">
            <p className="text-[10px]" style={{ color: "#D4B0A0" }}>{SHOP_DISCLAIMER}</p>
          </div>
        </>
      )}

      {cartCount > 0 && tab === "remedies" && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center belly-btn-primary z-40"
          style={{ background: "#FFB899", boxShadow: "0 4px 16px rgba(42,18,0,0.15)" }}>
          <ShoppingBag size={20} style={{ color: "#2A1200" }} />
          <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#FF6B6B" }}>
            {cartCount}
          </div>
        </button>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end" onClick={() => setShowCart(false)}>
          <div className="w-full rounded-t-[24px] max-h-[70vh] flex flex-col sheet-enter"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,228,212,0.6)" }}>
              <h2 className="font-display text-[20px] font-bold" style={{ color: "#2A1200" }}>Your cart</h2>
              <button onClick={() => setShowCart(false)}><X size={20} style={{ color: "#D4906A" }} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>{item.product.name}</p>
                    <p className="text-[11px]" style={{ color: "#D4906A" }}>${(item.product.price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center belly-btn-press" style={{ background: "rgba(255,240,232,0.8)" }}><Minus size={12} style={{ color: "#D4906A" }} /></button>
                    <span className="text-[13px] font-semibold w-5 text-center" style={{ color: "#2A1200" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center belly-btn-press" style={{ background: "rgba(255,240,232,0.8)" }}><Plus size={12} style={{ color: "#D4906A" }} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 px-5 pb-6 pt-3" style={{ borderTop: "1px solid rgba(255,228,212,0.6)" }}>
              <div className="flex justify-between mb-3">
                <span className="text-[13px] font-semibold" style={{ color: "#2A1200" }}>Subtotal</span>
                <span className="font-display text-[16px] font-bold" style={{ color: "#2A1200" }}>${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={placeOrder} disabled={ordering}
                className="w-full h-12 rounded-[14px] text-[14px] font-bold belly-btn-primary disabled:opacity-50" style={{ background: "#FFB899", color: "#2A1200" }}>
                {ordering ? "Placing order..." : "Place order →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
