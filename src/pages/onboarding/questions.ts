// Onboarding question definitions: one question per screen, branching by season.
// Answers are stored as readable labels in profiles.onboarding_answers — they
// are fed verbatim into Bella's opening message on /welcome, so keep them
// human-sounding.

export type Season =
  | "pregnant"
  | "trying_to_conceive"
  | "postpartum"
  | "raising_little_ones"
  | "general_wellness";

export interface Question {
  id: string;
  kind: "select" | "multiselect" | "dueDate";
  prompt: string;
  sub?: string;
  options?: string[];
}

export const SEASON_OPTIONS: { value: Season; label: string; sub: string }[] = [
  { value: "pregnant", label: "Pregnant", sub: "Growing a little one" },
  { value: "trying_to_conceive", label: "Trying to Conceive", sub: "On the path to pregnancy" },
  { value: "postpartum", label: "Postpartum", sub: "Recovering with a new baby" },
  { value: "raising_little_ones", label: "Raising Little Ones", sub: "In the thick of motherhood" },
  { value: "general_wellness", label: "General Wellness", sub: "Caring for myself" },
];

export const SEASON_LABELS: Record<Season, string> = {
  pregnant: "Pregnant",
  trying_to_conceive: "Trying to Conceive",
  postpartum: "Postpartum",
  raising_little_ones: "Raising Little Ones",
  general_wellness: "General Wellness",
};

const PHILOSOPHY: Question = {
  id: "philosophy",
  kind: "select",
  prompt: "How do you like to approach your wellness?",
  sub: "There's no wrong answer",
  options: [
    "As natural as possible",
    "A mix of natural & conventional",
    "Evidence-first",
    "Still figuring it out",
  ],
};

export const BRANCHES: Record<Season, Question[]> = {
  pregnant: [
    {
      id: "dueDate",
      kind: "dueDate",
      prompt: "When is your baby due?",
      sub: "Or tell us your current week — we'll work it out",
    },
    {
      id: "firstPregnancy",
      kind: "select",
      prompt: "Is this your first pregnancy?",
      options: ["Yes, my first", "No, my second", "Third or more"],
    },
    {
      id: "provider",
      kind: "select",
      prompt: "Are you working with a midwife or OB?",
      options: ["Yes", "Not yet"],
    },
    {
      id: "struggle",
      kind: "select",
      prompt: "What's been hardest lately?",
      sub: "So Bella knows where to start",
      options: [
        "Nausea & fatigue",
        "Sleep",
        "Anxiety & mood",
        "Aches & pains",
        "Knowing what's safe to eat",
        "Just want guidance",
      ],
    },
    PHILOSOPHY,
  ],
  postpartum: [
    {
      id: "babyAge",
      kind: "select",
      prompt: "How old is your baby?",
      options: ["0–6 weeks", "6 weeks–3 months", "3–6 months", "6–12 months", "Over a year"],
    },
    {
      id: "recovery",
      kind: "select",
      prompt: "How is your recovery going?",
      sub: "Honestly — this stays between us",
      options: ["Healing well", "Up and down", "Struggling", "Exhausted but okay"],
    },
    {
      id: "struggle",
      kind: "select",
      prompt: "What's been hardest lately?",
      sub: "So Bella knows where to start",
      options: [
        "Sleep deprivation",
        "Feeding",
        "Body recovery",
        "Mood & overwhelm",
        "Feeling like myself again",
      ],
    },
  ],
  raising_little_ones: [
    {
      id: "childrenAges",
      kind: "multiselect",
      prompt: "How old are your little ones?",
      sub: "Choose all that apply",
      options: ["Under 1", "1–2", "3–4", "5+"],
    },
    {
      id: "dailyChallenge",
      kind: "select",
      prompt: "What's your biggest daily challenge?",
      options: [
        "Tantrums & big feelings",
        "Sleep & routines",
        "Picky eating",
        "My patience & burnout",
        "Screens & stimulation",
      ],
    },
    {
      id: "mainInterest",
      kind: "select",
      prompt: "What would help you most right now?",
      options: [
        "Natural remedies for kids",
        "Family nutrition",
        "Gentle parenting",
        "My own wellness",
      ],
    },
  ],
  trying_to_conceive: [
    {
      id: "tryingDuration",
      kind: "select",
      prompt: "How long have you been trying?",
      sub: "Every path here looks different",
      options: ["Just started", "3–6 months", "6–12 months", "Over a year"],
    },
    {
      id: "mainFocus",
      kind: "select",
      prompt: "What's your main focus?",
      options: [
        "Cycle awareness",
        "Fertility nutrition",
        "Reducing stress",
        "Understanding my body",
      ],
    },
    PHILOSOPHY,
  ],
  general_wellness: [
    {
      id: "mainGoal",
      kind: "select",
      prompt: "What's your main goal?",
      options: ["More energy", "Better sleep", "Hormone balance", "Stress & mood", "Overall vitality"],
    },
    {
      id: "interests",
      kind: "multiselect",
      prompt: "What draws you in?",
      sub: "Choose all that apply",
      options: ["Herbal remedies", "Nutrition & recipes", "Mindfulness", "Movement", "Community"],
    },
  ],
};

// "Yes, my first" → 1, "No, my second" → 2, "Third or more" → 3.
export const pregnancyNumberFromAnswer = (answer: string | undefined): number => {
  if (answer === "No, my second") return 2;
  if (answer === "Third or more") return 3;
  return 1;
};
