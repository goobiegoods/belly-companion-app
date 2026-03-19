export interface LessonSection {
  heading: string;
  body: string;
  tip?: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  title: string;
  duration: number;
  intro: string;
  whatYoullLearn: string[];
  sections: LessonSection[];
  didYouKnow: string;
  reflection: string;
  quiz: LessonQuiz;
  keyTakeaway: string;
}

export const firstTrimesterLessons: LessonContent[] = [
  {
    id: "c1-L1",
    title: "Welcome to the First Trimester",
    duration: 8,
    intro: "Weeks 1–13 are a whirlwind of change — mostly invisible to the outside world but enormous on the inside. Your body is working harder than you realize, building an entirely new human from scratch. You may not look pregnant yet, but everything is already in motion.",
    whatYoullLearn: [
      "What's happening inside your body during weeks 1–13",
      "Why you feel so exhausted even this early",
      "Common first trimester symptoms explained",
      "How to honor your body's signals"
    ],
    sections: [
      {
        heading: "What's actually happening in there",
        body: "From the moment of implantation, your body kicks into overdrive. Human chorionic gonadotropin (hCG) — the pregnancy hormone — starts rising rapidly, doubling every 48–72 hours. This is what makes your pregnancy test positive, but it's also behind many of the symptoms you're feeling. Your uterus is growing, blood volume is increasing, and your body is building the placenta — an entirely new organ that will nourish your baby for the next 9 months.",
        tip: "The fatigue in the first trimester is your body building the placenta — one of the most complex organs in nature. Rest without guilt."
      },
      {
        heading: "Your body right now",
        body: "Breast tenderness, bloating, mood swings, heightened smell sensitivity, and overwhelming fatigue are all completely normal. These symptoms are driven by the dramatic rise in progesterone and estrogen. Some women experience all of these, others just a few. There's no 'right' way to feel in the first trimester — your experience is valid whatever it looks like."
      }
    ],
    didYouKnow: "Your baby's heart begins beating around week 6 — before most moms even know they're pregnant.",
    reflection: "What feels most surprising or overwhelming about your body right now?",
    quiz: {
      question: "When does the placenta typically take over hormone production?",
      options: ["Week 4", "Week 10–12", "Week 20", "At birth"],
      correctIndex: 1,
      explanation: "The placenta takes over hormone production around weeks 10–12, which is often when first trimester symptoms start to ease."
    },
    keyTakeaway: "Your first trimester is a time of invisible but incredible transformation. Every symptom is your body doing extraordinary work to grow new life."
  },
  {
    id: "c1-L2",
    title: "Nausea & Morning Sickness: What Helps",
    duration: 7,
    intro: "Morning sickness is one of the most common — and most misnamed — pregnancy symptoms. It can strike any time of day and affects up to 80% of pregnant women. You are not alone, and it does get better.",
    whatYoullLearn: [
      "Why morning sickness happens and when it peaks",
      "Natural remedies that actually work",
      "Dietary strategies to manage nausea",
      "When to talk to your care provider about severe nausea"
    ],
    sections: [
      {
        heading: "Why it happens",
        body: "The exact cause of morning sickness isn't fully understood, but it's strongly linked to the surge in hCG and estrogen during the first trimester. It typically peaks around weeks 8–10 and begins to improve by weeks 12–14. Some researchers believe nausea may actually be protective, steering pregnant women away from potentially harmful foods during the most vulnerable period of development."
      },
      {
        heading: "Natural relief that works",
        body: "Ginger tea is one of the most well-studied natural remedies for pregnancy nausea. Other approaches that many women find helpful include eating small, frequent meals throughout the day, choosing cold foods over hot (which produce less smell), wearing acupressure wristbands, taking vitamin B6 supplements (with your provider's guidance), keeping lemon slices nearby to sniff, and eating a few plain crackers before getting out of bed in the morning.",
        tip: "Keep plain crackers on your nightstand. Eating a few before you even sit up can make a real difference."
      }
    ],
    didYouKnow: "Nausea is often a sign of a healthy pregnancy — studies show it correlates with lower miscarriage risk.",
    reflection: "What triggers your nausea most? Tracking patterns can help you stay one step ahead.",
    quiz: {
      question: "Which vitamin has been shown to reduce pregnancy nausea?",
      options: ["Vitamin C", "Vitamin D", "Vitamin B6", "Iron"],
      correctIndex: 2,
      explanation: "Vitamin B6 (pyridoxine) has been shown in multiple studies to help reduce pregnancy-related nausea and is often recommended by care providers."
    },
    keyTakeaway: "Morning sickness is temporary and manageable. Small, consistent strategies like ginger, frequent snacks, and B6 can make a real difference in how you feel."
  },
  {
    id: "c1-L3",
    title: "Food, Cravings & What to Avoid",
    duration: 8,
    intro: "Eating well in the first trimester can feel impossible when the smell of your favorite food makes you queasy. Give yourself grace — survival eating is real, and it won't last forever.",
    whatYoullLearn: [
      "Essential nutrients for early pregnancy",
      "Foods to avoid and why",
      "Understanding cravings and what they mean",
      "Simple strategies for eating well when nothing sounds good"
    ],
    sections: [
      {
        heading: "What to eat",
        body: "Focus on folate-rich foods like leafy greens, beans, and fortified cereals. Iron from lean meats, spinach, and lentils supports your increasing blood volume. Protein from eggs, nuts, and lean meats helps your baby's rapid cell growth. Stay hydrated — aim for at least 8 glasses of water daily. When big meals feel impossible, small frequent snacks are your best friend.",
        tip: "If vegetables make you gag right now, try sneaking spinach into a fruit smoothie — the sweetness masks the taste completely."
      },
      {
        heading: "What to avoid",
        body: "Raw or undercooked fish, deli meats, unpasteurized cheeses, and high-mercury fish (shark, swordfish, king mackerel) should be avoided. Limit caffeine to under 200mg daily (about one small coffee). Alcohol should be completely avoided. These guidelines exist because your immune system changes during pregnancy, making you more susceptible to foodborne illness."
      },
      {
        heading: "Understanding cravings",
        body: "Cravings are extremely common and can range from the mundane (pickles, ice cream) to the unusual. Some researchers believe cravings may signal nutritional needs — craving red meat might indicate low iron, for example. Pica — craving non-food items like ice, dirt, or chalk — can indicate iron deficiency and should always be mentioned to your care provider."
      }
    ],
    didYouKnow: "Craving ice or non-food items (pica) can indicate iron deficiency — always worth mentioning to your midwife.",
    reflection: "Have your eating habits changed since getting pregnant? What are you craving and what are you avoiding?",
    quiz: {
      question: "Which food should be avoided during pregnancy?",
      options: ["Cooked salmon", "Pasteurized cheese", "Soft-boiled eggs", "Roasted nuts"],
      correctIndex: 2,
      explanation: "Soft-boiled eggs carry a risk of salmonella because they're not fully cooked. Fully cooked eggs are perfectly safe during pregnancy."
    },
    keyTakeaway: "Perfect nutrition isn't the goal right now — eating what you can keep down is enough. Focus on folate, iron, protein, and hydration when you're able."
  },
  {
    id: "c1-L4",
    title: "Your Emotions in the First Trimester",
    duration: 7,
    intro: "The emotional rollercoaster of early pregnancy is real and valid. One moment you're overjoyed, the next you're in tears over nothing obvious. Hormones are powerful, and your life is changing in profound ways — give yourself permission to feel all of it.",
    whatYoullLearn: [
      "Why mood swings happen in early pregnancy",
      "The difference between normal emotions and perinatal anxiety/depression",
      "How to support your mental health during pregnancy",
      "When and how to seek professional support"
    ],
    sections: [
      {
        heading: "What's normal",
        body: "Mood swings, unexpected crying, anxiety about the future, and even ambivalence about a wanted pregnancy are all normal. Progesterone and estrogen affect neurotransmitters in your brain, which directly impacts your mood. You might feel disconnected from the pregnancy, especially before you can feel movement — that's okay too. There's no single 'right' emotional response to being pregnant.",
        tip: "If you're feeling overwhelmed, try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste."
      },
      {
        heading: "Supporting yourself",
        body: "Talk to your partner, a trusted friend, or a therapist about how you're really feeling. Journaling can help you process emotions you're not ready to say out loud. Gentle movement like walking or prenatal yoga releases endorphins. If you feel persistently sad, anxious, or hopeless for more than two weeks, reach out to your care provider — perinatal mood disorders are common and very treatable."
      }
    ],
    didYouKnow: "Up to 20% of pregnant women experience anxiety or depression during pregnancy — it's more common than postpartum depression and just as treatable.",
    reflection: "Have you been able to share how you're really feeling with someone you trust?",
    quiz: {
      question: "What percentage of pregnant women experience significant anxiety or depression during pregnancy?",
      options: ["5%", "10%", "20%", "35%"],
      correctIndex: 2,
      explanation: "About 20% of pregnant women experience significant anxiety or depression. It's important to know this is common and that help is available."
    },
    keyTakeaway: "Your emotions during pregnancy are valid — all of them. Feeling everything deeply is not weakness; it's your brain adapting to one of life's biggest transitions."
  },
  {
    id: "c1-L5",
    title: "Your First Prenatal Visit",
    duration: 8,
    intro: "Your first prenatal appointment is a big milestone. It can feel overwhelming with all the information, tests, and questions — but it's also your first real chance to build a relationship with the person guiding your care.",
    whatYoullLearn: [
      "What to expect at your first appointment",
      "Which tests and screenings are standard",
      "What the dating scan shows",
      "Questions to bring to your care provider"
    ],
    sections: [
      {
        heading: "What to expect",
        body: "Your first prenatal visit usually happens between weeks 8–12. Expect blood tests (to check your blood type, iron levels, immunity to certain diseases), a urine test, blood pressure measurement, a detailed medical history review, and confirmation of your estimated due date. This appointment typically takes longer than follow-ups — often 45–60 minutes."
      },
      {
        heading: "The dating scan",
        body: "Your dating scan (usually between weeks 8–12) uses ultrasound to measure your baby and confirm how far along you are. You'll see the heartbeat, and the sonographer will measure the crown-to-rump length to calculate your due date. This is often an emotional moment — it's okay to cry, laugh, or feel nothing at all.",
        tip: "Write your questions down the night before. It's very easy to forget everything once you're in the room."
      },
      {
        heading: "Questions to ask your care provider",
        body: "Here are some great questions to bring along:\n• What prenatal vitamins do you recommend?\n• What symptoms should I call about urgently?\n• What are my options for prenatal screening tests?\n• How often will my appointments be?\n• What exercise is safe for me right now?\n• Who should I contact if I have concerns outside office hours?\n• What's your approach to birth plans?\n• Can I bring my partner to future appointments?\n• Are there any dietary supplements I should add or avoid?\n• When will I have my next ultrasound?"
      }
    ],
    didYouKnow: "Your due date is an estimate — only about 5% of babies are born on their exact due date.",
    reflection: "What are your top 3 questions for your first prenatal visit?",
    quiz: {
      question: "What does a dating scan primarily determine?",
      options: ["Baby's sex", "Gestational age and due date", "Genetic abnormalities", "Baby's weight"],
      correctIndex: 1,
      explanation: "A dating scan primarily determines gestational age and estimated due date by measuring the baby's size."
    },
    keyTakeaway: "Your first prenatal visit is the beginning of a partnership with your care provider. Come prepared with questions, and remember — no question is too small or silly to ask."
  },
  {
    id: "c1-L6",
    title: "First Trimester Self-Care",
    duration: 7,
    intro: "Self-care in the first trimester isn't bubble baths and face masks (though those are lovely too). It's about protecting your energy, honoring your body's signals, and building habits that will carry you through all 40 weeks.",
    whatYoullLearn: [
      "How to optimize sleep during early pregnancy",
      "Safe movement and exercise guidelines",
      "What to stop or adjust now",
      "Building emotional resilience for the journey ahead"
    ],
    sections: [
      {
        heading: "Sleep and rest",
        body: "You need more sleep right now — your body is doing extraordinary work even while you rest. Naps are not laziness; they're recovery. From around 28 weeks, sleeping on your left side is recommended to improve blood flow to your baby and kidneys, but for now, sleep however is most comfortable. If insomnia strikes, try a consistent bedtime routine, limit screens before bed, and keep your room cool and dark."
      },
      {
        heading: "Safe movement",
        body: "Walking, swimming, and prenatal yoga are excellent choices throughout pregnancy. If you were active before pregnancy, you can generally continue your routine with modifications. Avoid contact sports, anything with a fall risk, and exercises that involve lying flat on your back after the first trimester. The most important rule: listen to your body. If something doesn't feel right, stop.",
        tip: "A 20-minute walk outdoors combines exercise, fresh air, and natural light — all of which improve mood and sleep quality."
      },
      {
        heading: "What to stop now",
        body: "Stop alcohol completely. Check all medications and supplements with your care provider — some common ones (like ibuprofen and certain herbal teas) aren't safe during pregnancy. Avoid excess vitamin A (found in liver and some supplements). If you smoke, talk to your provider about support to quit — it's one of the most impactful things you can do for your baby's health."
      },
      {
        heading: "Emotional self-care",
        body: "Protect your peace from unsolicited opinions and horror stories. It's okay to set boundaries with well-meaning family members. Reduce stress where you can — delegate tasks, say no to commitments that drain you, and prioritize rest over productivity. You are growing a human. That is enough."
      }
    ],
    didYouKnow: "Sleeping on your left side improves blood flow to your baby and kidneys — a small habit with real benefits.",
    reflection: "What's one self-care habit you can commit to this week?",
    quiz: {
      question: "From around which week is sleeping on your left side particularly recommended?",
      options: ["Week 4", "Week 16", "Week 28", "Week 36"],
      correctIndex: 2,
      explanation: "From around week 28, sleeping on your left side is recommended to optimize blood flow to the uterus and kidneys."
    },
    keyTakeaway: "Self-care in pregnancy means protecting your energy and honoring what your body needs. Small, consistent habits now build a strong foundation for the months ahead."
  }
];

export function getLessonContent(courseId: string, lessonIndex: number): LessonContent {
  if (courseId === "c1" && lessonIndex < firstTrimesterLessons.length) {
    return firstTrimesterLessons[lessonIndex];
  }
  // Generate placeholder content for other courses
  const lessonNum = lessonIndex + 1;
  return {
    id: `${courseId}-L${lessonNum}`,
    title: `Lesson ${lessonNum}`,
    duration: 5 + Math.floor(Math.random() * 8),
    intro: "This lesson covers important aspects of your pregnancy journey. Understanding these concepts will help you navigate with more confidence and knowledge. Every pregnancy is unique — take what resonates with you.",
    whatYoullLearn: [
      "Key concepts for this stage of pregnancy",
      "Practical tips you can use today",
      "What to discuss with your care provider",
    ],
    sections: [
      {
        heading: "Understanding the basics",
        body: "Every pregnancy journey is different, and this lesson will help you understand what's happening in your body right now. Knowledge is empowering — the more you understand, the more confident you'll feel making decisions about your care.",
        tip: "Take notes as you read. Writing things down helps you remember and gives you a list of questions for your next appointment."
      },
      {
        heading: "Practical guidance",
        body: "Remember that every pregnancy is unique. Take what resonates with you and always consult your care provider for personalized guidance. Trust your instincts — you know your body better than anyone."
      }
    ],
    didYouKnow: "Your body is doing incredible work right now, even when you can't see or feel it. Trust the process.",
    reflection: "What's on your mind about this topic? Writing it down can help you process your thoughts.",
    quiz: {
      question: "What's the most important thing during pregnancy?",
      options: ["Following every rule perfectly", "Listening to your body and care provider", "Avoiding all stress", "Eating only organic food"],
      correctIndex: 1,
      explanation: "The most important thing is listening to your body and maintaining open communication with your care provider."
    },
    keyTakeaway: "Trust your body, stay curious, and don't hesitate to reach out to your care provider with any questions or concerns."
  };
}
