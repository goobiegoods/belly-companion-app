import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coursesData, Course } from "@/data/coursesData";
import { getLessonContent, LessonContent, getLessonDescription } from "@/data/lessonContent";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ChevronRight, Check, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const FILTER_TABS = ["All", "Trimester", "Wellness", "Birth prep"];
const CATEGORY_MAP: Record<string, string> = {
  Trimester: "Your trimester",
  Wellness: "Natural wellness",
  "Birth prep": "Birth preparation",
};

const Courses = () => {
  const { user, profile } = useAuth();
  const [completions, setCompletions] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id)
      .then(({ data }) => setCompletions(data?.map(d => d.lesson_id) || []));
  }, [user]);

  const totalLessons = coursesData.reduce((s, c) => s + c.lessonCount, 0);
  const completedCount = completions.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const totalHours = Math.round(coursesData.reduce((s, c) => s + c.duration, 0) / 60);
  const completedHours = totalHours > 0 ? Math.max(0, totalHours - Math.round((totalLessons - completedCount) * 7 / 60)) : 0;
  const hoursLeft = totalHours - completedHours;

  const completeLesson = async (lessonId: string) => {
    if (!user || completions.includes(lessonId)) return;
    await supabase.from("lesson_completions").insert({ user_id: user.id, lesson_id: lessonId });
    setCompletions(prev => [...prev, lessonId]);
  };

  const saveReflection = useCallback(async (lessonId: string, text: string) => {
    if (!user || !text.trim()) return;
    await supabase.from("lesson_reflections" as any).upsert({ user_id: user.id, lesson_id: lessonId, reflection_text: text } as any, { onConflict: "user_id,lesson_id" } as any);
  }, [user]);

  const saveQuizAttempt = async (lessonId: string, option: string, correct: boolean) => {
    if (!user) return;
    await supabase.from("quiz_attempts" as any).insert({ user_id: user.id, lesson_id: lessonId, selected_option: option, is_correct: correct } as any);
  };

  const completeCourse = async (courseId: string, lessonsCount: number) => {
    if (!user) return;
    await supabase.from("course_completions" as any).insert({ user_id: user.id, course_id: courseId, lessons_count: lessonsCount } as any);
  };

  const filteredCourses = activeFilter === "All" ? coursesData : coursesData.filter(c => c.category === CATEGORY_MAP[activeFilter]);
  const categories = [...new Set(filteredCourses.map(c => c.category))];
  const continueCourses = coursesData.filter(c => {
    const count = completions.filter(id => id.startsWith(c.id)).length;
    return count > 0 && count < c.lessonCount;
  });

  // --- COURSE COMPLETION ---
  if (showCompletion && selectedCourse) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "transparent" }}>
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <Check size={36} style={{ color: "#FF6520" }} />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8 }}>Course complete! 🌸</h1>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: "white", marginBottom: 4 }}>{course.title}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", marginBottom: 8 }}>{course.lessonCount} lessons · {course.duration} min</p>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontStyle: "italic", color: "rgba(255,255,255,0.70)", textAlign: "center", marginBottom: 32 }}>
          You've taken a beautiful step on your pregnancy journey. Be proud of yourself, mama. 🌸
        </p>
        <button onClick={() => { setShowCompletion(false); setSelectedCourse(null); setSelectedLesson(null); }}
          className="w-full max-w-xs h-12 rounded-[14px] text-[14px] font-bold mb-3 belly-btn-primary" style={{ background: "white", color: "#FF6520" }}>
          Back to courses
        </button>
      </div>
    );
  }

  // --- LESSON READER ---
  if (selectedCourse && selectedLesson !== null) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    const lesson: LessonContent = getLessonContent(course.id, selectedLesson);
    const lessonId = `${course.id}-L${selectedLesson + 1}`;
    const isCompleted = completions.includes(lessonId);
    const isLast = selectedLesson === course.lessonCount - 1;

    const handleComplete = async () => {
      await completeLesson(lessonId);
      if (isLast) { await completeCourse(course.id, course.lessonCount); setShowCompletion(true); }
      else { toast.success("Lesson complete! ✓"); setSelectedLesson(selectedLesson + 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(255,140,66,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
            style={{ color: "white", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13 }}>← Back</button>
          <p className="truncate max-w-[180px]" style={{ color: "white", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16 }}>{course.title}</p>
          <span style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)", borderRadius: 20, padding: "4px 10px", color: "white", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 11 }}>
            Lesson {selectedLesson + 1} of {course.lessonCount}
          </span>
        </div>
        <div className="px-5 pt-5 pb-6 relative">
          <p style={{ fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>LESSON {selectedLesson + 1}</p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 800, color: "white", marginBottom: 12 }}>{lesson.title}</h1>
          <span style={{ display: "inline-block", fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 600, padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)", color: "white", marginBottom: 12 }}>{lesson.duration} min read</span>
          <div className="flex gap-1.5">
            {Array.from({ length: course.lessonCount }, (_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                background: i < selectedLesson ? "rgba(255,255,255,0.70)" : i === selectedLesson ? "white" : "transparent",
                border: i > selectedLesson ? "1.5px solid rgba(255,255,255,0.6)" : "none"
              }} />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.75, fontWeight: 400, color: "rgba(255,255,255,0.88)" }}>{lesson.intro}</p>
          <div style={{ background: "rgba(255,255,255,0.20)", border: "1.5px solid rgba(255,255,255,0.32)", borderRadius: 18, padding: "16px 18px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <p style={{ fontSize: 10, fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>What you'll learn</p>
            <div className="space-y-2">
              {lesson.whatYoullLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgba(255,255,255,0.60)" }} />
                  <p style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.88)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "white", margin: "20px 0 8px" }}>{section.heading}</h2>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.80)", marginBottom: 12 }}>{section.body}</p>
              {section.tip && (
                <div style={{ background: "rgba(255,240,180,0.15)", border: "1px solid rgba(255,220,120,0.25)", borderRadius: 16, padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "white", marginBottom: 4 }}>💡 Tip:</p>
                  <p style={{ fontSize: 12, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.85)" }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}
          <div style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.26)", borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>Did you know? 🌸</p>
            <p style={{ fontSize: 12, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.80)" }}>{lesson.didYouKnow}</p>
          </div>
          <div style={{ background: "rgba(220,200,255,0.12)", border: "1px solid rgba(200,170,255,0.20)", borderRadius: 16, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Reflect 💭</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontStyle: "italic", color: "white", marginBottom: 12 }}>{lesson.reflection}</p>
            <textarea value={reflectionText} onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..." className="w-full resize-none min-h-[80px]"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: 12, fontSize: 13, fontFamily: "'Outfit', sans-serif", fontStyle: "italic", color: "white" }} />
            <button disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => { await saveReflection(lessonId, reflectionText); setReflectionSaved(true); }}
              className="mt-2 disabled:opacity-50" style={{ borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, background: "white", color: "#FF6520", border: "none" }}>
              Save my reflection 💭
            </button>
            {reflectionSaved && <p style={{ fontSize: 12, color: "rgba(200,255,220,0.95)", marginTop: 6 }}>Saved 🌸</p>}
          </div>
          <div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "white", marginBottom: 12 }}>Quick check ✓</p>
            <p style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "white", marginBottom: 12 }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "rgba(255,255,255,0.26)", bg = "rgba(255,255,255,0.18)", textColor = "white";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "rgba(100,220,130,0.45)"; bg = "rgba(100,220,130,0.25)"; textColor = "rgba(200,255,220,0.95)"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "rgba(255,130,130,0.35)"; bg = "rgba(255,100,100,0.20)"; textColor = "rgba(255,200,200,0.95)"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "rgba(100,220,130,0.45)"; bg = "rgba(100,220,130,0.25)"; textColor = "rgba(200,255,220,0.95)"; }
                return (
                  <button key={i} disabled={quizSubmitted}
                    onClick={() => { setQuizAnswer(i); setQuizSubmitted(true); saveQuizAttempt(lessonId, opt, isCorrect); }}
                    className="w-full text-left transition-all"
                    style={{ background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: 12, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: textColor }}>
                    {opt}{quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div style={{ marginTop: 12, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌸" : "Almost! Here's why..."}</p>
                <p style={{ fontSize: 12, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.80)" }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>
          <div className="rounded-[14px] p-4" style={{ background: "#2A1200" }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#D4B0A0" }}>Key takeaway</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, lineHeight: 1.6, color: "#FFF4EE" }}>{lesson.keyTakeaway}</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3" style={{ background: "rgba(255,140,66,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setReflectionSaved(false); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 rounded-[12px] text-[13px] font-semibold" style={{ background: "rgba(255,255,255,0.20)", color: "white" }}>← Previous</button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 rounded-[12px] text-[14px] font-bold disabled:opacity-50" style={{ background: "white", color: "#FF6520" }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete course 🌸" : "Complete & continue →"}
          </button>
        </div>
      </div>
    );
  }

  // --- LESSON LIST ---
  if (selectedCourse) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
      id: `${course.id}-L${i + 1}`, number: i + 1,
      title: getLessonContent(course.id, i).title,
      duration: getLessonContent(course.id, i).duration,
      description: getLessonDescription(course.id, i),
    }));
    const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
    const courseProgress = courseCompletions / course.lessonCount;

    return (
      <div className="min-h-screen pb-20" style={{ background: "transparent" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,228,212,0.6)" }}>
          <button onClick={() => setSelectedCourse(null)} className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
        </div>

        {/* Course Hero Card */}
        <div style={{
          margin: "8px 16px 0", borderRadius: 18, padding: 16,
          background: "linear-gradient(135deg, #FF7E48, #FFA070, #FFBE98)",
          boxShadow: "0 8px 24px rgba(255,110,60,0.2)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -12, top: -12, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 28, marginBottom: 6, display: "block" }}>{course.emoji}</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{course.title}</p>
          <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, marginBottom: 8, maxWidth: "75%" }}>{course.description}</p>
          <div className="flex gap-1.5">
            {[`${course.lessonCount} lessons`, `${course.duration} min total`, course.isPremium ? "Premium" : "Free"].map(label => (
              <span key={label} style={{
                background: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.3)",
                borderRadius: 8, padding: "2px 8px", fontSize: 6.5, color: "white",
              }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "8px 16px 4px" }}>
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontSize: 6.5, textTransform: "uppercase", letterSpacing: "0.11em", color: "rgba(200,88,40,0.45)", fontWeight: 600 }}>Your progress</p>
            <p style={{ fontSize: 7, color: "#D4906A", fontWeight: 600 }}>{courseCompletions} of {course.lessonCount}</p>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,170,130,0.2)" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${courseProgress * 100}%`, background: "linear-gradient(90deg, #FF7840, #FFBA90)", transition: "width 300ms ease" }} />
          </div>
        </div>

        {/* Lesson rows */}
        <div className="px-4 py-3 space-y-[6px]">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            const isNext = !completed && i === courseCompletions;
            const cardBg = completed
              ? "rgba(235,252,240,0.8)" : isNext
              ? "rgba(255,242,234,0.9)" : "rgba(255,255,255,0.72)";
            const cardBorder = completed
              ? "rgba(140,210,160,0.25)" : isNext
              ? "rgba(255,140,90,0.3)" : "rgba(255,170,130,0.2)";
            const cardShadow = isNext ? "0 2px 12px rgba(255,120,64,0.1)" : "none";

            return (
              <button key={lesson.id}
                onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full text-left"
                style={{ borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 10, background: cardBg, border: `0.5px solid ${cardBorder}`, boxShadow: cardShadow }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: completed ? "linear-gradient(135deg, #60C080, #40A060)" : isNext ? "linear-gradient(135deg, #FF7840, #FFA070)" : "rgba(255,200,170,0.3)",
                  color: completed || isNext ? "white" : "#D4906A",
                  boxShadow: completed ? "0 2px 8px rgba(60,160,80,0.3)" : isNext ? "0 2px 8px rgba(255,120,64,0.3)" : "none",
                }}>
                  {completed ? <Check size={13} /> : lesson.number}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 600, color: "#A84E28", lineHeight: 1.3 }}>{lesson.title}</p>
                  <p style={{ fontSize: 7.5, color: "#C4906A", lineHeight: 1.45, fontWeight: 400, marginTop: 2 }} className="line-clamp-2">{lesson.description}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span style={{ fontSize: 6, textTransform: "uppercase", color: "#D4906A", fontWeight: 500 }}>{lesson.duration} min</span>
                    <span style={{
                      fontSize: 6, textTransform: "uppercase", fontWeight: 600,
                      color: completed ? "#40A060" : isNext ? "#FF7840" : "rgba(180,100,60,0.38)",
                    }}>{completed ? "✓ Complete" : isNext ? "Up next" : ""}</span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: "#D4B0A0", flexShrink: 0, marginTop: 4 }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MAIN COURSE LIST ---
  return (
    <div className="min-h-screen pb-20 page-enter" style={{ background: "transparent" }}>
      <div className="px-5 pt-5 pb-1">
        <h1 className="font-display text-[26px] font-bold" style={{ color: "#2A1200" }}>Your courses</h1>
        <p className="text-[12px]" style={{ color: "#D4B0A0" }}>Learn at your own pace · {coursesData.length} courses</p>
      </div>
      <div className="mx-4 mt-3 mb-4 p-[18px_20px] rounded-[20px] relative overflow-hidden belly-hero-gradient">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.5)" }}>YOUR PROGRESS</p>
        <p className="font-display text-[18px] font-bold mb-2" style={{ color: "#2A1200" }}>{completedCount} of {totalLessons} lessons completed</p>
        <div className="h-1.5 rounded-[4px] mb-3" style={{ background: "rgba(42,18,0,0.12)" }}>
          <div className="h-full rounded-[4px] transition-all" style={{ width: `${progressPercent}%`, background: "rgba(42,18,0,0.35)" }} />
        </div>
        <div className="flex gap-2">
          {[`${progressPercent}% complete`, `~${hoursLeft}h left`].map(label => (
            <span key={label} className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.35)", color: "#2A1200" }}>{label}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto hide-scrollbar">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveFilter(tab)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all belly-btn-press"
            style={{
              background: activeFilter === tab ? "#FFB899" : "rgba(255,240,232,0.8)",
              color: activeFilter === tab ? "#2A1200" : "#D4906A",
              fontWeight: activeFilter === tab ? 600 : 500,
              border: activeFilter === tab ? "none" : "1px solid rgba(255,228,212,0.6)"
            }}>
            {tab}
          </button>
        ))}
      </div>
      {activeFilter === "All" && continueCourses.length > 0 && (
        <div className="mb-2">
          <p className="px-5 pt-2 pb-2 text-[10px] uppercase tracking-[0.1em]" style={{ color: "#D4B0A0" }}>Continue learning</p>
          <div className="px-5 space-y-2">
            {continueCourses.map(course => <CourseCard key={course.id} course={course} completions={completions} profile={profile} onSelect={setSelectedCourse} />)}
          </div>
        </div>
      )}
      {categories.map(category => (
        <div key={category} className="mb-2">
          <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-[0.1em]" style={{ color: "#D4B0A0" }}>{category}</p>
          <div className="px-5 space-y-2">
            {filteredCourses.filter(c => c.category === category).map(course => (
              <CourseCard key={course.id} course={course} completions={completions} profile={profile} onSelect={setSelectedCourse} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function CourseCard({ course, completions, profile, onSelect }: { course: Course; completions: string[]; profile: any; onSelect: (id: string) => void }) {
  const isLocked = course.isPremium && !profile?.is_premium;
  const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
  const progress = courseCompletions / course.lessonCount;

  return (
    <button onClick={() => !isLocked && onSelect(course.id)}
      className="w-full belly-glass-card rounded-[18px] text-left belly-card-interactive"
      style={{ opacity: isLocked ? 0.5 : 1 }}>
      <div className="flex items-start gap-3 p-[14px_16px_10px]">
        <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "rgba(255,240,232,0.8)" }}>
          {isLocked ? <Lock size={18} style={{ color: "#D4B0A0" }} /> : course.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9.5px] uppercase" style={{ color: "#D4906A" }}>{course.category}</p>
          <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>{course.title}</p>
          <p className="text-[10.5px]" style={{ color: "#D4B0A0" }}>{course.lessonCount} lessons · {course.duration} min</p>
        </div>
        <span className="text-[12px] font-bold shrink-0 mt-2" style={{ color: "#D4906A" }}>
          {isLocked ? (
            <span className="text-[10px] px-2 py-1 rounded-full belly-badge-glass" style={{ background: "rgba(255,244,238,0.9)", border: "1px solid #FFCDB4", color: "#D4906A" }}>🔒 Premium</span>
          ) : courseCompletions > 0 ? "Continue →" : "Start →"}
        </span>
      </div>
      {courseCompletions > 0 && !isLocked && (
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full" style={{ background: "rgba(255,240,232,0.8)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "#FFB899" }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: "#D4B0A0" }}>{courseCompletions} of {course.lessonCount} lessons · {Math.round(progress * 100)}% complete</p>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {course.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full belly-badge-glass" style={{ background: "rgba(255,244,238,0.9)", border: "1px solid rgba(255,205,180,0.6)", color: "#D4906A" }}>{tag}</span>
        ))}
      </div>
    </button>
  );
}

export default Courses;
