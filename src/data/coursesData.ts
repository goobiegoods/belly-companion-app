export interface Course {
  id: string;
  title: string;
  category: string;
  lessonCount: number;
  isPremium: boolean;
  description: string;
}

export const coursesData: Course[] = [
  { id: "c1", title: "First Trimester Basics", category: "Your trimester", lessonCount: 6, isPremium: false, description: "Everything you need to know about weeks 1–13" },
  { id: "c2", title: "Managing Morning Sickness Naturally", category: "Your trimester", lessonCount: 5, isPremium: false, description: "Natural remedies to ease nausea and vomiting" },
  { id: "c3", title: "Second Trimester: What to Expect", category: "Your trimester", lessonCount: 7, isPremium: false, description: "Your body and baby during the golden trimester" },
  { id: "c4", title: "Third Trimester Prep", category: "Your trimester", lessonCount: 8, isPremium: true, description: "Preparing your body and mind for the final stretch" },
  { id: "c5", title: "Natural Remedies During Pregnancy", category: "Natural wellness", lessonCount: 6, isPremium: false, description: "Safe, effective natural remedies for common pregnancy issues" },
  { id: "c6", title: "Nutrition & Herbal Safety", category: "Natural wellness", lessonCount: 7, isPremium: true, description: "What to eat, what herbs are safe, and what to avoid" },
  { id: "c7", title: "Sleep & Rest Techniques", category: "Natural wellness", lessonCount: 5, isPremium: false, description: "Natural ways to improve sleep quality during pregnancy" },
  { id: "c8", title: "Stress & Anxiety Support", category: "Natural wellness", lessonCount: 6, isPremium: true, description: "Mindfulness, breathing, and natural stress relief" },
  { id: "c9", title: "Birth Plan Basics", category: "Birth preparation", lessonCount: 5, isPremium: false, description: "How to create a birth plan that works for you" },
  { id: "c10", title: "Breathing & Pain Management", category: "Birth preparation", lessonCount: 8, isPremium: true, description: "Natural pain management techniques for labor" },
  { id: "c11", title: "What Happens During Labor", category: "Birth preparation", lessonCount: 6, isPremium: false, description: "Understanding the stages of labor and delivery" },
  { id: "c12", title: "Postpartum Planning", category: "Birth preparation", lessonCount: 7, isPremium: true, description: "Preparing for recovery and life with your newborn" },
];
