export const AFFIRMATIONS = [
  "My body knows exactly what it's doing right now.",
  "Every sleepless hour is an act of love.",
  "I am stronger than I know tonight.",
  "This baby chose me for a reason.",
  "Growing a human is the hardest and most beautiful work.",
  "I trust my body's wisdom completely.",
  "Rest is not laziness — it's preparation for everything ahead.",
  "My baby feels safe because I am safe.",
  "Tomorrow I will feel this differently.",
  "I don't have to be perfect. I just have to show up.",
  "My love for this baby is already changing the world.",
  "Every kick, every nudge — we are already talking.",
  "I am exactly the mother this child needs.",
  "The fact that I'm worried means I already love deeply.",
  "My body has been preparing for this moment for generations.",
  "Discomfort is temporary. This love is forever.",
  "Tonight I breathe for two.",
  "I am held even when I feel alone at 3am.",
  "My baby hears my heartbeat and feels at home.",
  "I release what I cannot control and trust what I feel.",
  "Every part of my body is doing something miraculous right now.",
  "The tiredness I feel is just love wearing a heavy coat.",
  "I am not behind. I am right on time.",
  "Tomorrow's mama will be grateful for how tonight's mama rested.",
];

export interface QuizOption {
  text: string;
  emoji: string;
  correct: boolean;
  funFact: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const BABY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "How big is your baby at 12 weeks?",
    options: [
      { text: "A grain of rice", emoji: "🍚", correct: false, funFact: "That's closer to week 5–6." },
      { text: "A lime", emoji: "🍋", correct: true, funFact: "At 12 weeks your baby is about the size of a lime — roughly 5.5cm long and weighing around 14 grams!" },
      { text: "An avocado", emoji: "🥑", correct: false, funFact: "That's closer to week 16." },
      { text: "A mango", emoji: "🥭", correct: false, funFact: "That's around week 23." },
    ],
  },
  {
    question: "When can your baby first hear your voice?",
    options: [
      { text: "Week 8", emoji: "👂", correct: false, funFact: "The ears are forming but can't process sound yet." },
      { text: "Week 14", emoji: "👂", correct: false, funFact: "Ear structures are developing but hearing comes later." },
      { text: "Week 18–22", emoji: "👂", correct: true, funFact: "Between weeks 18 and 22, your baby's inner ear develops enough to detect sound — your voice is the most familiar!" },
      { text: "Week 30", emoji: "👂", correct: false, funFact: "By week 30 they've been listening for months." },
    ],
  },
  {
    question: "True or false: Your baby can taste what you eat?",
    options: [
      { text: "True, from week 14", emoji: "👅", correct: true, funFact: "Taste buds develop around week 14, and studies show babies swallow more amniotic fluid when it's sweet!" },
      { text: "True, but only after birth", emoji: "🍼", correct: false, funFact: "Actually, taste begins in the womb." },
      { text: "False", emoji: "❌", correct: false, funFact: "It's actually true — flavors pass into amniotic fluid." },
      { text: "Only strong flavors like garlic", emoji: "🧄", correct: false, funFact: "All flavors can pass through, not just strong ones." },
    ],
  },
  {
    question: "How many times does a fetal heart beat per minute in early pregnancy?",
    options: [
      { text: "60–80 bpm", emoji: "💓", correct: false, funFact: "That's an adult resting heart rate." },
      { text: "100–120 bpm", emoji: "💓", correct: false, funFact: "Getting closer, but it's even faster!" },
      { text: "150–170 bpm", emoji: "💓", correct: true, funFact: "A baby's heart beats 150–170 times per minute in early pregnancy — nearly twice the adult rate!" },
      { text: "200+ bpm", emoji: "💓", correct: false, funFact: "Not quite that fast." },
    ],
  },
  {
    question: "What is vernix caseosa?",
    options: [
      { text: "Baby's first stool", emoji: "💩", correct: false, funFact: "That's meconium." },
      { text: "The waxy coating protecting baby's skin", emoji: "🧴", correct: true, funFact: "Vernix is a creamy white substance that protects your baby's delicate skin from the amniotic fluid — nature's moisturizer!" },
      { text: "A pregnancy hormone", emoji: "🧬", correct: false, funFact: "It's a physical coating, not a hormone." },
      { text: "The mucus plug", emoji: "🔒", correct: false, funFact: "The mucus plug seals the cervix — different thing entirely." },
    ],
  },
  {
    question: "When do babies start dreaming in the womb?",
    options: [
      { text: "They don't dream before birth", emoji: "😴", correct: false, funFact: "REM sleep has been detected in utero!" },
      { text: "Around week 23", emoji: "💭", correct: false, funFact: "REM appears a bit later." },
      { text: "Around week 28", emoji: "💭", correct: true, funFact: "REM sleep (the dreaming phase) has been observed from around week 28 — your baby may already be dreaming about your voice!" },
      { text: "Only in the final week", emoji: "💭", correct: false, funFact: "It starts much earlier." },
    ],
  },
  {
    question: "How much amniotic fluid surrounds your baby at its peak?",
    options: [
      { text: "About 100ml", emoji: "💧", correct: false, funFact: "That's too little — just a small cup." },
      { text: "About 500ml", emoji: "💧", correct: false, funFact: "Getting closer but not quite." },
      { text: "About 800ml–1 liter", emoji: "💧", correct: true, funFact: "Amniotic fluid peaks around week 36 at roughly 800ml to 1 liter — your baby's personal swimming pool!" },
      { text: "About 3 liters", emoji: "💧", correct: false, funFact: "That would be quite a lot!" },
    ],
  },
  {
    question: "True or false: Babies can cry silently in the womb?",
    options: [
      { text: "True", emoji: "😢", correct: true, funFact: "Ultrasounds have captured silent crying motions from around week 28 — quivering chin, open mouth, and deeper breaths. Don't worry, it's thought to be practice, not distress!" },
      { text: "False", emoji: "❌", correct: false, funFact: "Actually, this has been observed on ultrasound!" },
      { text: "Only after week 36", emoji: "📅", correct: false, funFact: "It's been observed earlier, around week 28." },
      { text: "Only during labor", emoji: "🏥", correct: false, funFact: "It happens well before labor." },
    ],
  },
  {
    question: "What's the safest sleeping position during pregnancy?",
    options: [
      { text: "On your back", emoji: "🔙", correct: false, funFact: "After week 28, back sleeping can compress major blood vessels." },
      { text: "On your left side", emoji: "⬅️", correct: true, funFact: "Left side sleeping optimizes blood flow to the uterus and kidneys, and helps nutrients reach your baby more efficiently." },
      { text: "On your stomach", emoji: "⬇️", correct: false, funFact: "This becomes impossible and uncomfortable as you grow." },
      { text: "Any position is fine throughout", emoji: "🔄", correct: false, funFact: "Position matters more after week 28." },
    ],
  },
  {
    question: "How many new brain cells does a fetus create per minute in the second trimester?",
    options: [
      { text: "About 1,000", emoji: "🧠", correct: false, funFact: "Much more than that!" },
      { text: "About 100,000", emoji: "🧠", correct: false, funFact: "Even more!" },
      { text: "About 250,000", emoji: "🧠", correct: true, funFact: "Your baby creates roughly 250,000 new brain cells every single minute during the second trimester — the fastest brain growth they'll ever experience!" },
      { text: "About 1 million", emoji: "🧠", correct: false, funFact: "It's incredible but not quite that many per minute." },
    ],
  },
];

export const AFFIRMATION_CATEGORIES = [
  { emoji: "🌸", label: "Self-love", gradient: ["#2A1A40", "#4A2060"] },
  { emoji: "⭐", label: "Strength", gradient: ["#1A2840", "#204060"] },
  { emoji: "🔥", label: "Courage", gradient: ["#402018", "#603028"] },
  { emoji: "🌿", label: "Peace", gradient: ["#183028", "#204838"] },
];
