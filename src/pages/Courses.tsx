import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coursesData, Course } from "@/data/coursesData";
import { getLessonContent, LessonContent } from "@/data/lessonContent";
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
    await supabase.from("lesson_reflections" as any).upsert(
      { user_id: user.id, lesson_id: lessonId, reflection_text: text } as any,
      { onConflict: "user_id,lesson_id" } as any
    );
  }, [user]);

  const saveQuizAttempt = async (lessonId: string, option: string, correct: boolean) => {
    if (!user) return;
    await supabase.from("quiz_attempts" as any).insert(
      { user_id: user.id, lesson_id: lessonId, selected_option: option, is_correct: correct } as any
    );
  };

  const completeCourse = async (courseId: string, lessonsCount: number) => {
    if (!user) return;
    await supabase.from("course_completions" as any).insert(
      { user_id: user.id, course_id: courseId, lessons_count: lessonsCount } as any
    );
  };

  const filteredCourses = activeFilter === "All"
    ? coursesData
    : coursesData.filter(c => c.category === CATEGORY_MAP[activeFilter]);

  const categories = [...new Set(filteredCourses.map(c => c.category))];

  // Get "continue learning" courses
  const continueCourses = coursesData.filter(c => {
    const count = completions.filter(id => id.startsWith(c.id)).length;
    return count > 0 && count < c.lessonCount;
  });

  // --- COURSE COMPLETION SCREEN ---
  if (showCompletion && selectedCourse) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#FFB899" }}>
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6">
          <Check size={36} style={{ color: "#D4906A" }} />
        </div>
        <h1 className="font-display text-[28px] font-bold mb-2" style={{ color: "#2A1200" }}>Course complete! 🌸</h1>
        <p className="font-display text-[15px] mb-1" style={{ color: "#2A1200" }}>{course.title}</p>
        <p className="text-[13px] mb-2" style={{ color: "rgba(42,18,0,0.6)" }}>{course.lessonCount} lessons · {course.duration} min</p>
        <p className="font-display text-[15px] italic text-center mb-8" style={{ color: "rgba(42,18,0,0.7)" }}>
          You've taken a beautiful step on your pregnancy journey. Be proud of yourself, mama. 🌸
        </p>
        <button onClick={() => { setShowCompletion(false); setSelectedCourse(null); setSelectedLesson(null); }}
          className="w-full max-w-xs h-12 rounded-[14px] bg-white text-[14px] font-bold mb-3" style={{ color: "#2A1200" }}>
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
      if (isLast) {
        await completeCourse(course.id, course.lessonCount);
        setShowCompletion(true);
      } else {
        toast.success("Lesson complete! ✓");
        setSelectedLesson(selectedLesson + 1);
        setReflectionText("");
        setQuizAnswer(null);
        setQuizSubmitted(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#FFF8F5" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white" style={{ borderBottom: "1px solid #FFE4D4" }}>
          <button onClick={() => { setSelectedLesson(null); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
            className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <p className="text-[13px] font-semibold truncate max-w-[180px]" style={{ color: "#2A1200" }}>{course.title}</p>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#FFF0E8", color: "#D4906A" }}>
            Lesson {selectedLesson + 1} of {course.lessonCount}
          </span>
        </div>

        {/* Hero */}
        <div className="px-5 pt-5 pb-6 relative" style={{ background: "#FFB899" }}>
          <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.5)" }}>LESSON {selectedLesson + 1}</p>
          <h1 className="font-display text-[22px] font-bold mb-3" style={{ color: "#2A1200" }}>{lesson.title}</h1>
          <span className="inline-block text-[11px] px-3 py-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.35)", color: "#2A1200" }}>
            {lesson.duration} min read
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: course.lessonCount }, (_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                background: i < selectedLesson ? "rgba(42,18,0,0.4)" : i === selectedLesson ? "white" : "transparent",
                border: i > selectedLesson ? "1.5px solid rgba(255,255,255,0.6)" : "none"
              }} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
          {/* Block 1: Intro */}
          <p className="font-display text-[15px] leading-[1.75]" style={{ color: "#2A1200" }}>{lesson.intro}</p>

          {/* Block 2: What you'll learn */}
          <div className="rounded-r-[12px] p-4" style={{ background: "#FFF4EE", borderLeft: "3px solid #FFB899" }}>
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

          {/* Block 3: Main Sections */}
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-[16px] font-bold mb-2" style={{ color: "#2A1200" }}>{section.heading}</h2>
              <p className="text-[13px] leading-[1.75] mb-3" style={{ color: "#2A1200" }}>{section.body}</p>
              {section.tip && (
                <div className="rounded-[12px] p-3" style={{ background: "#FFF0E8" }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "#D4906A" }}>💡 Tip:</p>
                  <p className="text-[12px]" style={{ color: "#2A1200" }}>{section.tip}</p>
                </div>
              )}
            </div>
          ))}

          {/* Block 4: Did you know */}
          <div className="rounded-[14px] p-4" style={{ background: "#FFF0E8" }}>
            <p className="font-display text-[13px] font-bold mb-1" style={{ color: "#2A1200" }}>Did you know? 🌸</p>
            <p className="text-[12px]" style={{ color: "rgba(42,18,0,0.75)" }}>{lesson.didYouKnow}</p>
          </div>

          {/* Block 5: Reflection */}
          <div className="rounded-[14px] p-4" style={{ background: "#FFFFFF", border: "1px solid #FFE4D4" }}>
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "#D4906A" }}>Reflect 💭</p>
            <p className="font-display text-[14px] italic mb-3" style={{ color: "#2A1200" }}>{lesson.reflection}</p>
            <textarea
              value={reflectionText}
              onChange={e => { setReflectionText(e.target.value); setReflectionSaved(false); }}
              placeholder="Write your thoughts..."
              className="w-full rounded-[10px] p-3 text-[13px] resize-none min-h-[80px] font-display italic"
              style={{ background: "#FFF8F5", border: "1px solid #FFE4D4", color: "#2A1200" }}
            />
            <button
              disabled={!reflectionText.trim() || reflectionSaved}
              onClick={async () => {
                await saveReflection(lessonId, reflectionText);
                setReflectionSaved(true);
              }}
              className="mt-2 rounded-[12px] px-5 py-2.5 text-[13px] font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: "#FFB899", color: "#2A1200" }}>
              Save my reflection 💭
            </button>
            {reflectionSaved && (
              <p className="text-[12px] mt-1.5" style={{ color: "#C8E6C0" }}>Saved 🌸</p>
            )}
          </div>

          {/* Block 6: Quiz */}
          <div>
            <p className="font-display text-[15px] font-bold mb-3" style={{ color: "#2A1200" }}>Quick check ✓</p>
            <p className="text-[13px] mb-3" style={{ color: "#2A1200" }}>{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isSelected = quizAnswer === i;
                const isCorrect = i === lesson.quiz.correctIndex;
                let borderColor = "#FFE4D4";
                let bg = "white";
                if (quizSubmitted && isSelected && isCorrect) { borderColor = "#A8D4B8"; bg = "#F0FAF4"; }
                if (quizSubmitted && isSelected && !isCorrect) { borderColor = "#FFB899"; bg = "#FFF4EE"; }
                if (quizSubmitted && !isSelected && isCorrect) { borderColor = "#A8D4B8"; bg = "#F0FAF4"; }

                return (
                  <button key={i} disabled={quizSubmitted}
                    onClick={() => {
                      setQuizAnswer(i);
                      setQuizSubmitted(true);
                      saveQuizAttempt(lessonId, opt, isCorrect);
                    }}
                    className="w-full text-left rounded-[12px] p-3 text-[13px] transition-all"
                    style={{ background: bg, border: `1.5px solid ${borderColor}`, color: "#2A1200" }}>
                    {opt}
                    {quizSubmitted && isCorrect && " ✓"}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <div className="mt-3 rounded-[12px] p-3" style={{ background: quizAnswer === lesson.quiz.correctIndex ? "#F0FAF4" : "#FFF4EE" }}>
                <p className="text-[13px] font-bold mb-1" style={{ color: "#2A1200" }}>
                  {quizAnswer === lesson.quiz.correctIndex ? "Well done! 🌸" : "Almost! Here's why..."}
                </p>
                <p className="text-[12px]" style={{ color: "rgba(42,18,0,0.75)" }}>{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>

          {/* Block 7: Key Takeaway */}
          <div className="rounded-[14px] p-4" style={{ background: "#2A1200" }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#D4B0A0" }}>Key takeaway</p>
            <p className="font-display text-[14px] leading-[1.6]" style={{ color: "#FFF4EE" }}>{lesson.keyTakeaway}</p>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3 bg-white" style={{ borderTop: "1px solid #FFE4D4" }}>
          {selectedLesson > 0 && (
            <button onClick={() => { setSelectedLesson(selectedLesson - 1); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
              className="h-11 px-4 rounded-[12px] text-[13px] font-semibold" style={{ background: "#FFF0E8", color: "#D4906A" }}>
              ← Previous
            </button>
          )}
          <button onClick={handleComplete} disabled={isCompleted}
            className="flex-1 h-11 rounded-[12px] text-[14px] font-bold disabled:opacity-50"
            style={{ background: "#FFB899", color: "#2A1200" }}>
            {isCompleted ? "✓ Completed" : isLast ? "Complete course 🌸" : "Complete & continue →"}
          </button>
        </div>
      </div>
    );
  }

  // --- COURSE LIST (with lesson list) ---
  if (selectedCourse) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
      id: `${course.id}-L${i + 1}`,
      number: i + 1,
      title: getLessonContent(course.id, i).title,
      duration: getLessonContent(course.id, i).duration,
    }));

    return (
      <div className="min-h-screen pb-20" style={{ background: "#FFF8F5" }}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 bg-white" style={{ borderBottom: "1px solid #FFE4D4" }}>
          <button onClick={() => setSelectedCourse(null)} className="text-[12px] font-semibold" style={{ color: "#D4906A" }}>← Back</button>
          <h1 className="font-display text-[16px] font-bold" style={{ color: "#2A1200" }}>{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setSelectedLesson(i); setReflectionText(""); setQuizAnswer(null); setQuizSubmitted(false); }}
                className="w-full rounded-[18px] p-4 flex items-center gap-3 text-left active:scale-[0.975] transition-transform"
                style={{ background: "white", border: "1px solid #FFE4D4" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: completed ? "#A8D4B8" : "#FFF0E8", color: completed ? "white" : "#D4906A" }}>
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

  // --- MAIN COURSE LIST ---
  return (
    <div className="min-h-screen pb-20" style={{ background: "#FFF8F5" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-1">
        <h1 className="font-display text-[26px] font-bold" style={{ color: "#2A1200" }}>Your courses</h1>
        <p className="text-[12px]" style={{ color: "#D4B0A0" }}>Learn at your own pace · {coursesData.length} courses</p>
      </div>

      {/* Hero Progress Card */}
      <div className="mx-4 mt-3 mb-4 p-[18px_20px] rounded-[20px] relative overflow-hidden" style={{ background: "#FFB899" }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
        <p className="text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "rgba(42,18,0,0.5)" }}>YOUR PROGRESS</p>
        <p className="font-display text-[18px] font-bold mb-2" style={{ color: "#2A1200" }}>
          {completedCount} of {totalLessons} lessons completed
        </p>
        <div className="h-1.5 rounded-[4px] mb-3" style={{ background: "rgba(42,18,0,0.12)" }}>
          <div className="h-full rounded-[4px] transition-all" style={{ width: `${progressPercent}%`, background: "rgba(42,18,0,0.35)" }} />
        </div>
        <div className="flex gap-2">
          {[`${progressPercent}% complete`, `Week ${profile?.due_date ? Math.max(1, 40 - Math.ceil((new Date(profile.due_date).getTime() - Date.now()) / (7 * 86400000))) : 1} unlocked`, `~${hoursLeft}h left`].map(label => (
            <span key={label} className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.35)", color: "#2A1200" }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveFilter(tab)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeFilter === tab ? "#FFB899" : "#FFF0E8",
              color: activeFilter === tab ? "#2A1200" : "#D4906A",
              fontWeight: activeFilter === tab ? 600 : 500,
              border: activeFilter === tab ? "none" : "1px solid #FFE4D4"
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Continue Learning */}
      {activeFilter === "All" && continueCourses.length > 0 && (
        <div className="mb-2">
          <p className="px-5 pt-2 pb-2 text-[10px] uppercase tracking-[0.1em]" style={{ color: "#D4B0A0" }}>Continue learning</p>
          <div className="px-5 space-y-2">
            {continueCourses.map(course => <CourseCard key={course.id} course={course} completions={completions} profile={profile} onSelect={setSelectedCourse} />)}
          </div>
        </div>
      )}

      {/* Category Sections */}
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

function CourseCard({ course, completions, profile, onSelect }: {
  course: Course; completions: string[]; profile: any; onSelect: (id: string) => void;
}) {
  const isLocked = course.isPremium && !profile?.is_premium;
  const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
  const progress = courseCompletions / course.lessonCount;

  return (
    <button
      onClick={() => !isLocked && onSelect(course.id)}
      className="w-full rounded-[18px] text-left active:scale-[0.975] transition-transform"
      style={{ background: "white", border: "1px solid #FFE4D4", opacity: isLocked ? 0.5 : 1 }}>
      {/* Top row */}
      <div className="flex items-start gap-3 p-[14px_16px_10px]">
        <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 text-[22px]" style={{ background: "#FFF0E8" }}>
          {isLocked ? <Lock size={18} style={{ color: "#D4B0A0" }} /> : course.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9.5px] uppercase" style={{ color: "#D4906A" }}>{course.category}</p>
          <p className="font-display text-[14px] font-bold" style={{ color: "#2A1200" }}>{course.title}</p>
          <p className="text-[10.5px]" style={{ color: "#D4B0A0" }}>{course.lessonCount} lessons · {course.duration} min</p>
        </div>
        <span className="text-[12px] font-bold shrink-0 mt-2" style={{ color: "#D4906A" }}>
          {isLocked ? (
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#FFF4EE", border: "1px solid #FFCDB4", color: "#D4906A" }}>🔒 Premium</span>
          ) : courseCompletions > 0 ? "Continue →" : "Start →"}
        </span>
      </div>

      {/* Progress row */}
      {courseCompletions > 0 && !isLocked && (
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full" style={{ background: "#FFF0E8" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "#FFB899" }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: "#D4B0A0" }}>
            {courseCompletions} of {course.lessonCount} lessons · {Math.round(progress * 100)}% complete
          </p>
        </div>
      )}

      {/* Topic tags */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {course.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#FFF4EE", border: "1px solid #FFCDB4", color: "#D4906A" }}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

export default Courses;
