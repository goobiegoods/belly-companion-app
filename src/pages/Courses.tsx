import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coursesData } from "@/data/coursesData";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ChevronRight, Check } from "lucide-react";

const Courses = () => {
  const { user, profile } = useAuth();
  const [completions, setCompletions] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_completions").select("lesson_id").eq("user_id", user.id)
      .then(({ data }) => setCompletions(data?.map(d => d.lesson_id) || []));
  }, [user]);

  const getLessonsForCourse = (courseId: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${courseId}-L${i + 1}`,
      number: i + 1,
      title: `Lesson ${i + 1}`,
      duration: 5 + Math.floor(Math.random() * 10),
    }));

  const totalLessons = coursesData.reduce((sum, c) => sum + c.lessonCount, 0);
  const completedCount = completions.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const completeLesson = async (lessonId: string) => {
    if (!user || completions.includes(lessonId)) return;
    await supabase.from("lesson_completions").insert({ user_id: user.id, lesson_id: lessonId });
    setCompletions(prev => [...prev, lessonId]);
  };

  const categories = [...new Set(coursesData.map(c => c.category))];

  if (selectedCourse) {
    const course = coursesData.find(c => c.id === selectedCourse)!;
    const lessons = getLessonsForCourse(course.id, course.lessonCount);

    if (selectedLesson !== null) {
      const lesson = lessons[selectedLesson];
      return (
        <div className="min-h-screen bg-belly-bg pb-20">
          <div className="px-5 pt-5 pb-3 bg-card border-b border-belly-card-border flex items-center gap-3">
            <button onClick={() => setSelectedLesson(null)} className="text-belly-accent text-sm">← Back</button>
            <h1 className="font-display text-[16px] font-bold text-foreground">{lesson.title}</h1>
          </div>
          <div className="px-5 py-6">
            <h2 className="font-display text-[20px] font-bold text-foreground mb-4">{course.title}: {lesson.title}</h2>
            <div className="bg-card border border-belly-card-border rounded-card p-5 mb-4">
              <p className="text-[13px] text-foreground leading-relaxed">
                This lesson covers important aspects of {course.title.toLowerCase()}. Understanding these concepts will help you navigate your pregnancy journey with more confidence and knowledge.
              </p>
              <p className="text-[13px] text-foreground leading-relaxed mt-3">
                Remember, every pregnancy is unique. Take what resonates with you and always consult your care provider for personalized guidance.
              </p>
            </div>
            {!completions.includes(lesson.id) ? (
              <button onClick={() => completeLesson(lesson.id)} className="w-full h-11 rounded-input bg-primary text-primary-foreground text-sm font-semibold belly-btn-press">
                Mark as complete ✓
              </button>
            ) : (
              <div className="text-center text-belly-accent text-sm font-medium">✓ Completed</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-belly-bg pb-20">
        <div className="px-5 pt-5 pb-3 bg-card border-b border-belly-card-border flex items-center gap-3">
          <button onClick={() => setSelectedCourse(null)} className="text-belly-accent text-sm">← Back</button>
          <h1 className="font-display text-[16px] font-bold text-foreground">{course.title}</h1>
        </div>
        <div className="px-5 py-4 space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completions.includes(lesson.id);
            return (
              <button key={lesson.id} onClick={() => setSelectedLesson(i)} className="w-full bg-card border border-belly-card-border rounded-card p-4 flex items-center gap-3 belly-press text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${completed ? "bg-belly-success text-white" : "bg-belly-icon-bg text-belly-accent"}`}>
                  {completed ? <Check size={14} /> : lesson.number}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-foreground">{lesson.title}</p>
                  <p className="text-[10px] text-belly-text-muted">{lesson.duration} min</p>
                </div>
                <ChevronRight size={16} className="text-belly-text-hint" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-belly-bg pb-20">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-[22px] font-bold text-foreground">Your courses</h1>
        <p className="text-[11px] text-belly-text-muted">Learn at your own pace</p>
      </div>

      {/* Progress card */}
      <div className="px-5 mb-5">
        <div className="bg-primary rounded-hero p-5">
          <p className="text-primary-foreground text-sm mb-2">You're {progressPercent}% through your journey</p>
          <div className="h-1.5 rounded bg-white/30 mb-2">
            <div className="h-full rounded bg-white transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-primary-foreground/70 text-[11px]">{completedCount} lessons completed · {totalLessons - completedCount} to go</p>
        </div>
      </div>

      {/* Course categories */}
      {categories.map(category => (
        <div key={category} className="mb-5">
          <p className="px-5 text-[10px] uppercase tracking-[0.1em] text-belly-text-hint mb-2">{category}</p>
          <div className="px-5 space-y-2">
            {coursesData.filter(c => c.category === category).map(course => {
              const isLocked = course.isPremium && !profile?.is_premium;
              const courseCompletions = completions.filter(id => id.startsWith(course.id)).length;
              return (
                <button
                  key={course.id}
                  onClick={() => !isLocked && setSelectedCourse(course.id)}
                  className={`w-full bg-card border border-belly-card-border rounded-card p-4 flex items-center gap-3 belly-press text-left ${isLocked ? "opacity-60" : ""}`}
                >
                  <div className="w-10 h-10 rounded-icon bg-belly-icon-bg flex items-center justify-center shrink-0">
                    {isLocked ? <Lock size={16} className="text-belly-text-hint" /> : <span className="text-lg">📖</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[13px] font-bold text-foreground">{course.title}</p>
                    <p className="text-[10px] text-belly-text-muted">{course.lessonCount} lessons</p>
                    {courseCompletions > 0 && !isLocked && (
                      <div className="h-1 rounded bg-belly-icon-bg mt-1.5 w-full">
                        <div className="h-full rounded bg-belly-accent" style={{ width: `${(courseCompletions / course.lessonCount) * 100}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-belly-accent font-medium">
                    {isLocked ? "🔒" : courseCompletions > 0 ? "Continue →" : "Start →"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Courses;
