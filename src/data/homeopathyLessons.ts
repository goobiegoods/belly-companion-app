import { LessonContent } from "./lessonContent";

const h1Lessons: LessonContent[] = [
  {
    id: "h1-L1", title: "What is Homeopathy?", duration: 7,
    intro: "Homeopathy is a 200-year-old system of natural medicine developed by German physician Samuel Hahnemann. It's based on two core principles: that \"like cures like\" and that extreme dilution potentiates a remedy's effect. Let's explore what this really means for you as a mama-to-be.",
    whatYoullLearn: ["The Law of Similars and how it works", "How homeopathic pellets are made", "What the current research says", "Why millions of families use homeopathy worldwide"],
    sections: [
      { heading: "The Law of Similars", body: "The core principle of homeopathy is beautifully simple: a substance that causes symptoms in a healthy person can cure similar symptoms in a sick person. For example, chopping an onion makes your eyes water and nose run. In homeopathy, Allium Cepa — made from red onion — is used to treat colds with those exact watery-eyed, runny-nose symptoms. This isn't as strange as it sounds — it's similar to how vaccines use a tiny amount of a pathogen to stimulate immunity.", tip: "Think of it like this: the remedy speaks the same language as your symptoms, which helps your body recognize what needs healing." },
      { heading: "How Pellets Are Made", body: "Homeopathic remedies go through a process called serial dilution and succussion (vigorous shaking). The dilution scale tells you how many times a remedy has been diluted. 6c means diluted 1:100 six times. 30c means thirty times. 200c means two hundred times. Counter-intuitively, higher numbers aren't \"stronger\" in the conventional sense — they're considered to work on a deeper, more constitutional level. Most over-the-counter remedies are 6c or 30c, which are gentle and safe for self-care.", tip: "For pregnancy, 30c is the most commonly recommended potency for self-use. It's gentle enough for everyday symptoms but effective enough to notice a difference." },
      { heading: "What the Research Says", body: "Homeopathy exists in a fascinating space between tradition and modern science. Some randomized controlled trials show effects beyond placebo, particularly for conditions like ear infections in children and upper respiratory infections. The mechanism isn't fully understood by conventional science, and this is where much of the debate lives. What's undeniable is the clinical experience: homeopathy has been practiced continuously for over 200 years, is integrated into healthcare systems across Europe, India, and South America, and millions of families — including many pregnant women — report meaningful benefits." }
    ],
    didYouKnow: "France's national health service covered homeopathy for over 60 years. It remains one of the most widely used complementary medicine systems in Europe, with over 100 million users across the EU alone.",
    reflection: "Have you ever used a natural remedy that surprised you with its effectiveness? What was it?",
    quiz: { question: "What does the homeopathic principle 'like cures like' mean?", options: ["Similar symptoms need similar environments", "A substance causing symptoms in health can treat them in illness", "Only natural substances can treat natural illnesses", "Remedies work best when taken with similar foods"], correctIndex: 1, explanation: "The Law of Similars states that a substance which produces symptoms in a healthy person can cure those same symptoms in someone who is unwell. This is the foundational principle of all homeopathic practice." },
    keyTakeaway: "Homeopathy is a gentle, time-tested system of medicine based on the principle that 'like cures like.' While the scientific mechanism is still debated, its 200-year track record and widespread global use make it worth understanding — especially during pregnancy when gentle approaches matter most."
  },
  {
    id: "h1-L2", title: "A Brief History of Homeopathy", duration: 7,
    intro: "Understanding where homeopathy came from helps us appreciate why it's still so widely used today. From an 18th-century German physician's frustration with bloodletting to modern maternity wards in Europe — this is the story of a gentle revolution in medicine.",
    whatYoullLearn: ["Who Samuel Hahnemann was", "Why he rejected conventional medicine of his time", "How homeopathy spread globally", "Its role in modern healthcare"],
    sections: [
      { heading: "Samuel Hahnemann's Discovery", body: "In the late 1700s, Dr. Samuel Hahnemann was a respected German physician who became increasingly disillusioned with the brutal medical practices of his era — bloodletting, purging, and toxic mercury treatments. He famously said he would rather stop practicing than continue harming his patients. His breakthrough came while translating a medical text about cinchona bark (the source of quinine) and its effect on malaria. He tested the bark on himself and noticed it produced malaria-like symptoms — fever and chills. This observation led him to develop the principle of 'like cures like.'" },
      { heading: "Global Spread", body: "Homeopathy spread rapidly across Europe in the early 1800s, partly because it offered a gentler alternative during devastating cholera epidemics — and homeopathic hospitals had notably better survival rates. It reached America by the 1830s, where it flourished. By 1900, there were 22 homeopathic medical schools in the US alone. In India, homeopathy became so popular that it's now recognized as a national system of medicine with over 200,000 registered practitioners.", tip: "The British Royal Family has used homeopathy for generations — the late Queen Elizabeth II was known to travel with a homeopathic remedy kit." },
      { heading: "Homeopathy Today", body: "Today homeopathy is used by an estimated 500 million people worldwide. In Switzerland, it's covered by national health insurance. In Germany, about 60% of the population has used homeopathic remedies. Many European maternity units, particularly in France and Germany, offer homeopathic support during pregnancy and labor. While it faces skepticism in some scientific circles, its safety profile — especially during pregnancy — makes it an appealing option for many families." }
    ],
    didYouKnow: "During the great cholera epidemic of 1854 in London, patients treated at the London Homeopathic Hospital had a mortality rate of 16.4% compared to 51.8% at the nearby Middlesex Hospital.",
    reflection: "What drew you to learning about homeopathy? Was it a recommendation, personal experience, or simple curiosity?",
    quiz: { question: "Who is considered the founder of homeopathy?", options: ["Hippocrates", "Samuel Hahnemann", "Edward Jenner", "Louis Pasteur"], correctIndex: 1, explanation: "Samuel Hahnemann, a German physician, developed homeopathy in the late 18th century after becoming disillusioned with the harsh medical practices of his time." },
    keyTakeaway: "Homeopathy has a rich 200-year history that spans continents and cultures. Its enduring popularity, particularly in pregnancy care, speaks to its gentle approach and the deep trust families place in it."
  },
  {
    id: "h1-L3", title: "How to Take Homeopathic Remedies", duration: 7,
    intro: "Taking homeopathic remedies isn't like popping a vitamin — there's a simple but specific way to use them for best results. Let's walk through everything you need to know about dosing, timing, and what to avoid.",
    whatYoullLearn: ["How to take pellets correctly", "Dosing frequency guidelines", "What can interfere with remedies", "When to increase or decrease doses"],
    sections: [
      { heading: "The Basics of Taking Pellets", body: "Homeopathic pellets are small, white, sugar-based spheres that dissolve under your tongue. The standard dose is typically 3-5 pellets (or as directed on the tube). Place them under your tongue and let them dissolve completely — don't chew or swallow them whole. Your mouth should be clean: avoid eating, drinking, or brushing your teeth for 15 minutes before and after taking a remedy. This gives the remedy the best chance to be absorbed through the mucous membranes of your mouth.", tip: "Try not to touch the pellets with your fingers — tip them from the tube cap directly into your mouth. This preserves the remedy's potency." },
      { heading: "How Often to Take Them", body: "For acute symptoms (sudden onset, like nausea or a headache), you might take a 30c dose every 30 minutes to 2 hours for the first few doses, then spread out as symptoms improve. For chronic or ongoing symptoms, you might take a dose 1-3 times daily. The golden rule is: when you notice improvement, STOP dosing. Let the remedy do its work. Only repeat if symptoms return. More is not better in homeopathy — it's about finding the minimum effective dose." },
      { heading: "What to Avoid", body: "Certain substances are believed to antidote (cancel out) homeopathic remedies. The most commonly cited are: strong mint (including mint toothpaste), camphor and menthol, coffee (especially strong coffee), and eucalyptus. Not all homeopaths agree on which antidotes matter, but during pregnancy, switching to a non-mint toothpaste is an easy precaution. Also avoid strong essential oils near your remedy storage.", tip: "Keep your remedies in a cool, dark place away from electronic devices, strong smells, and direct sunlight. They're surprisingly long-lasting when stored properly — some practitioners report using remedies that are decades old." }
    ],
    didYouKnow: "Homeopathic remedies have no known drug interactions because of their extreme dilution. This is one reason many OBs and midwives are comfortable with pregnant patients using them alongside conventional care.",
    reflection: "Do you currently take any supplements or remedies during your pregnancy? How might homeopathy fit into your existing routine?",
    quiz: { question: "What should you do when your symptoms start improving after taking a homeopathic remedy?", options: ["Double the dose for faster results", "Stop taking the remedy and let it work", "Switch to a higher potency immediately", "Continue taking it at the same frequency"], correctIndex: 1, explanation: "In homeopathy, when symptoms improve, you should stop dosing. The remedy has stimulated your body's healing response, and continuing to take it can actually interfere with that process." },
    keyTakeaway: "Taking homeopathic remedies is simple: dissolve pellets under a clean tongue, dose based on symptom intensity, and — crucially — stop when you feel better. Less is more in homeopathy."
  },
  {
    id: "h1-L4", title: "Homeopathy vs. Herbal Medicine", duration: 7,
    intro: "People often confuse homeopathy with herbal medicine, but they're quite different systems. Understanding the distinction will help you make more informed choices about which natural approaches are right for your pregnancy.",
    whatYoullLearn: ["Key differences between homeopathy and herbalism", "When each approach might be more appropriate", "Safety considerations during pregnancy", "How they can complement each other"],
    sections: [
      { heading: "The Core Difference", body: "Herbal medicine uses plants in their whole or concentrated form — tinctures, teas, capsules, and extracts. The active compounds are physically present and measurable. Ginger tea for nausea, raspberry leaf for uterine toning, chamomile for sleep — these contain real, detectable plant chemicals. Homeopathy, on the other hand, uses highly diluted preparations where the original substance may no longer be physically present. The mechanism is energetic rather than chemical. Both can be effective, but they work through fundamentally different principles." },
      { heading: "Safety in Pregnancy", body: "This distinction matters during pregnancy. Herbal medicines, because they contain active compounds, can have real contraindications — some herbs stimulate uterine contractions, affect blood clotting, or interact with medications. You need to be careful about which herbs you use, especially in the first and third trimesters. Homeopathic remedies, due to their extreme dilution, have an excellent safety profile in pregnancy. There are no known side effects, no drug interactions, and no risk of overdose in the conventional sense. This is why many midwives and OBs who are cautious about herbs still feel comfortable with homeopathy.", tip: "Always tell your care provider about both herbal AND homeopathic remedies you're using. Even though homeopathy is very safe, open communication with your healthcare team is essential." },
      { heading: "Using Both Together", body: "Many pregnant women use both herbal and homeopathic approaches — and they can work beautifully together. For example, you might drink ginger tea (herbal) for everyday nausea prevention while keeping Nux Vomica 30c (homeopathic) for acute nausea episodes. Or use raspberry leaf tea (herbal) in the third trimester for uterine toning while taking Caulophyllum 30c (homeopathic) for birth preparation. The key is understanding what each does and why you're using it." }
    ],
    didYouKnow: "In Germany, pharmacists are trained in both conventional medicine AND natural therapeutics including homeopathy and herbal medicine. Patients can get personalized advice on combining approaches safely.",
    reflection: "Have you used herbal teas or supplements during your pregnancy? How do you feel about adding homeopathic remedies to your wellness toolkit?",
    quiz: { question: "What is the main difference between herbal medicine and homeopathy?", options: ["Herbal medicine is newer than homeopathy", "Herbal medicine contains measurable active compounds; homeopathy uses extreme dilution", "Homeopathy uses only plants while herbalism uses minerals too", "They are essentially the same thing with different names"], correctIndex: 1, explanation: "The key difference is that herbal medicine uses plants with measurable active compounds, while homeopathy uses preparations diluted to the point where the original substance may no longer be physically present. They work through fundamentally different mechanisms." },
    keyTakeaway: "Homeopathy and herbal medicine are distinct systems that can complement each other beautifully during pregnancy. Homeopathy's ultra-diluted preparations offer exceptional safety, while herbs provide direct biochemical support. Understanding both gives you more tools for a healthy pregnancy."
  }
];

const h2Lessons: LessonContent[] = [
  {
    id: "h2-L1", title: "Is Homeopathy Safe in Pregnancy?", duration: 7,
    intro: "This is the question every pregnant mama asks first — and it's the right one. Let's look at the evidence, the expert opinions, and what you need to know to feel confident about using homeopathy during your pregnancy.",
    whatYoullLearn: ["Safety evidence for homeopathy in pregnancy", "What OBs and midwives say", "Which trimester considerations matter", "Red flags and when NOT to self-treat"],
    sections: [
      { heading: "The Safety Profile", body: "Homeopathic remedies in standard potencies (6c, 12c, 30c) have an exceptional safety record in pregnancy. Because the remedies are diluted far beyond the point where any original molecule remains detectable, there is no risk of toxicity, no risk of teratogenicity (birth defects), and no drug interactions. The WHO acknowledges that homeopathy, when used as a complementary approach, poses no known risks. In practice, millions of pregnant women worldwide use homeopathic remedies — particularly in Europe, where many maternity units include homeopathic protocols." },
      { heading: "What Healthcare Providers Say", body: "Midwives tend to be the most supportive of homeopathy in pregnancy, with surveys showing that 40-60% of midwives in the UK, Germany, and France either recommend or are comfortable with patients using homeopathic remedies. OB/GYN attitudes vary more widely, but many appreciate that homeopathy's safety profile makes it preferable to certain medications during pregnancy. The key is always transparency — tell your provider what you're using.", tip: "Frame it positively: 'I'm interested in using homeopathic remedies like Nux Vomica for my nausea. Are you comfortable with that?' Most providers will appreciate your openness." },
      { heading: "When NOT to Self-Treat", body: "While homeopathy is safe, there are situations where you should NOT rely on self-treatment alone: high blood pressure or preeclampsia symptoms, unexplained bleeding at any stage, severe persistent vomiting (hyperemesis), signs of preterm labor, any condition requiring urgent medical attention. Homeopathy works best as a complement to — not a replacement for — proper prenatal care. Use it for everyday pregnancy discomforts, but always keep your medical team informed and involved." }
    ],
    didYouKnow: "A 2016 observational study of over 3,000 pregnant women in France found that those who used homeopathy had comparable or better pregnancy outcomes than those who didn't, with no adverse effects attributed to the remedies.",
    reflection: "What concerns, if any, do you have about using homeopathy during your pregnancy? Writing them down can help you have a productive conversation with your care provider.",
    quiz: { question: "Why are homeopathic remedies considered safe during pregnancy?", options: ["They contain high doses of natural herbs", "They are FDA-approved for pregnancy", "The extreme dilution means no risk of toxicity or drug interactions", "They've only been used for a few years"], correctIndex: 2, explanation: "The extreme dilution process means standard homeopathic remedies contain no detectable molecules of the original substance, eliminating risks of toxicity, side effects, or drug interactions." },
    keyTakeaway: "Homeopathic remedies in standard potencies are considered very safe during pregnancy due to their extreme dilution. They work best as a complement to conventional prenatal care — never as a replacement for it."
  },
  {
    id: "h2-L2", title: "Understanding Potencies: 6c, 30c, 200c", duration: 7,
    intro: "Those numbers on homeopathic tubes — 6c, 30c, 200c — aren't random. They tell you how the remedy was prepared and guide you on when to use each strength. Let's decode them together.",
    whatYoullLearn: ["What the numbers and letters mean", "Which potencies to use for what", "Pregnancy-specific potency guidelines", "How to choose between potencies"],
    sections: [
      { heading: "Decoding the Label", body: "The 'c' stands for centesimal, meaning each dilution step is 1:100. So 6c means the original substance was diluted 1:100 six times. 30c means thirty times. 200c means two hundred times. The higher the number, the MORE diluted the remedy is. There are also 'x' potencies (decimal, 1:10 dilution) — 6x is less diluted than 6c. For pregnancy self-care, you'll mostly encounter 6c and 30c." },
      { heading: "Which Potency When", body: "In general: 6c is for physical, local symptoms — think digestive issues, muscle aches, minor complaints. Take it more frequently (3-4 times daily). 30c is the workhorse potency for most acute pregnancy symptoms — nausea, emotional swings, sleep issues, general malaise. Take it 1-3 times daily, or every 30 min to 2 hours for acute flare-ups. 200c is for more intense situations — labor support, significant emotional events, deep-acting symptoms. Best used under practitioner guidance, not for everyday self-care.", tip: "When in doubt, 30c is almost always a safe choice for pregnancy self-care. It's effective enough for most symptoms but gentle enough for regular use." },
      { heading: "Pregnancy-Specific Guidelines", body: "For pregnancy, most homeopaths recommend: First trimester — stick to 30c for nausea, fatigue, and emotional adjustment. Second trimester — 30c for round ligament pain, energy fluctuations, and mood support. Third trimester — 30c for birth prep remedies like Caulophyllum, and 200c potencies reserved for labor itself. Avoid using 200c or higher potencies regularly during pregnancy without guidance from a qualified homeopath. These higher potencies are more likely to produce a healing crisis (temporary symptom worsening) which, while not dangerous, can be uncomfortable." }
    ],
    didYouKnow: "In France, pharmacists routinely help pregnant women select the right potency for their symptoms. Homeopathic consultations are built into the prenatal care pathway at many French maternity centers.",
    reflection: "Have you seen potency numbers on homeopathic products before? Did they confuse you? How does understanding them change your confidence level?",
    quiz: { question: "Which potency is generally recommended for everyday pregnancy self-care?", options: ["6x — the lowest dilution", "30c — the standard acute potency", "200c — the strongest option", "1M — for deep constitutional treatment"], correctIndex: 1, explanation: "30c is the most commonly recommended potency for pregnancy self-care. It's effective for most acute symptoms, gentle enough for regular use, and widely available at pharmacies and health food stores." },
    keyTakeaway: "For pregnancy, 30c is your go-to potency for most symptoms. Save 6c for very mild local complaints and 200c for labor support under practitioner guidance. When in doubt, 30c is safe and effective."
  },
  {
    id: "h2-L3", title: "Dosing: How Much and How Often", duration: 7,
    intro: "One of the most common mistakes with homeopathy is dosing like conventional medicine — more pills, more often. Homeopathy follows a completely different logic. Let's master the art of dosing.",
    whatYoullLearn: ["Standard dosing for pregnancy", "Acute vs. chronic dosing schedules", "The 'stop when better' rule", "What to do if symptoms worsen"],
    sections: [
      { heading: "The Standard Dose", body: "A single dose of a homeopathic remedy is typically 3-5 pellets (or one full capful from a tube). Despite what intuition tells you, taking more pellets doesn't make the dose stronger — it's the frequency that matters, not the quantity. Think of each dose as a signal to your body. One clear signal is all you need at a time." },
      { heading: "Acute vs. Chronic Dosing", body: "For acute symptoms (sudden nausea, a headache, a panic episode): take one dose every 30 minutes for the first 2 hours, then space out to every 2-4 hours. If you've taken 6 doses with no improvement, it's probably not the right remedy — try a different one. For ongoing/chronic symptoms (daily morning sickness, persistent fatigue): take one dose 2-3 times daily for up to a week. Then reassess. If you're improving, reduce to once daily. If you're well, stop completely.", tip: "Keep a simple log: date, remedy, potency, number of doses, and how you felt. This is invaluable for figuring out what works for you — and for sharing with your homeopath or midwife." },
      { heading: "The Golden Rules", body: "Rule 1: STOP when you feel better. The remedy has done its job — continuing to take it can actually reverse your improvement. Rule 2: If symptoms return, restart dosing. But if you find yourself constantly needing to re-dose, consult a practitioner — you may need a different remedy or potency. Rule 3: A brief worsening of symptoms after taking a remedy (called an 'aggravation') can actually be a good sign — it means the remedy is working. Wait it out. If it's too uncomfortable, stop dosing and the aggravation will pass quickly." }
    ],
    didYouKnow: "In a well-chosen remedy, many women notice improvement within 15-30 minutes for acute symptoms. If nothing has changed after 3 doses, it's unlikely to be the right match — and that's perfectly normal. Homeopathy is about finding the right remedy, not forcing the wrong one.",
    reflection: "How does the 'less is more' approach of homeopathic dosing compare to your experience with conventional medicine?",
    quiz: { question: "What should you do when your symptoms improve with a homeopathic remedy?", options: ["Increase the dose for faster healing", "Stop taking the remedy", "Switch to a higher potency", "Take it for 7 more days to prevent relapse"], correctIndex: 1, explanation: "The golden rule of homeopathic dosing is to stop when symptoms improve. The remedy has stimulated your body's healing response, and continuing to dose can actually interfere with recovery." },
    keyTakeaway: "Homeopathic dosing is about frequency, not quantity. Dose more often for acute symptoms, less often for chronic ones, and always stop when you feel better. Less really is more."
  },
  {
    id: "h2-L4", title: "First Trimester Remedies", duration: 7,
    intro: "The first trimester is a whirlwind of hormonal changes, and it's when many mamas first discover homeopathy — often out of sheer desperation with nausea. Here are the most helpful remedies for weeks 1-13.",
    whatYoullLearn: ["Top remedies for first trimester symptoms", "How to match your nausea type to the right remedy", "Support for first trimester fatigue and mood", "When to seek additional help"],
    sections: [
      { heading: "Nausea — Finding Your Match", body: "Not all nausea is the same, and this is where homeopathy shines. Nux Vomica 30c: best for nausea that's worse in the morning, with irritability and sensitivity to smells. You feel like you need to vomit but can't. Digestive issues and constipation may accompany it. Sepia 30c: nausea triggered by the smell or thought of food. You feel drained, indifferent, and emotionally flat. You might not want to be touched. Exhaustion is deep. Ipecacuanha 30c: constant, relentless nausea with or without vomiting. Your tongue looks clean despite feeling sick. Nothing seems to relieve it. Pulsatilla 30c: nausea worse in warm rooms, better in fresh air. You feel weepy, clingy, and crave comfort. Rich or fatty foods make it worse.", tip: "Read through all the options and pick the one that sounds most like YOU — not just your nausea symptoms, but your emotional state and what makes it better or worse. That's the homeopathic way." },
      { heading: "Fatigue Support", body: "First trimester fatigue is legendary, and while rest is the true remedy, homeopathy can take the edge off. Sepia 30c (again!) is the top choice when fatigue comes with emotional withdrawal and indifference. Kali Phos 6x is excellent for mental exhaustion — when your brain feels foggy and you can't concentrate. It's a wonderful nerve tonic. Phosphoric Acid 30c is for fatigue that comes with sadness or grief — maybe you've had previous pregnancy losses and this pregnancy feels emotionally heavy." },
      { heading: "Emotional Adjustment", body: "Hormones are wild in the first trimester, and emotional symptoms deserve attention too. Ignatia 30c is the #1 remedy for emotional shock, anxiety about the pregnancy, grief over a changed identity, or rapid mood swings. Pulsatilla 30c is for when you feel vulnerable, teary, and need extra nurturing. You might cry at commercials and need your partner close. Arsenicum Album 30c is for anxious, restless worry — constantly Googling symptoms, fear that something is wrong, need for control and reassurance." }
    ],
    didYouKnow: "A 2012 study in the Journal of Alternative and Complementary Medicine found that pregnant women using homeopathy for nausea reported significantly better quality of life scores compared to those using conventional anti-nausea medication alone.",
    reflection: "Which first trimester symptom has been hardest for you? Can you identify which remedy description matches your experience most closely?",
    quiz: { question: "Which remedy is best for nausea that's worse in the morning with irritability and sensitivity to smells?", options: ["Pulsatilla 30c", "Sepia 30c", "Nux Vomica 30c", "Ipecacuanha 30c"], correctIndex: 2, explanation: "Nux Vomica is the classic remedy for morning-worse nausea accompanied by irritability, smell sensitivity, the urge to vomit without being able to, and digestive disturbance." },
    keyTakeaway: "The first trimester is where many mamas discover homeopathy's power. The key is matching your unique symptom picture — not just the physical symptoms, but your emotional state and what makes things better or worse."
  },
  {
    id: "h2-L5", title: "When to See a Professional Homeopath", duration: 7,
    intro: "Self-care with homeopathy is wonderful for everyday pregnancy symptoms, but there are times when working with a qualified practitioner takes your care to the next level. Let's explore when and why.",
    whatYoullLearn: ["Signs you need professional homeopathic guidance", "How to find a qualified practitioner", "What to expect in a consultation", "How professional care differs from self-care"],
    sections: [
      { heading: "When Self-Care Isn't Enough", body: "Consider seeing a professional homeopath when: your symptoms aren't responding to self-selected remedies after reasonable trial, you're dealing with complex or chronic symptoms, you want constitutional treatment for overall pregnancy wellness, you're preparing for labor and want a personalized birth protocol, or you have a history of complicated pregnancies and want additional support. A professional can select from thousands of remedies — far more than the common ones available in health stores." },
      { heading: "Finding a Qualified Practitioner", body: "Look for practitioners registered with recognized bodies like the Society of Homeopaths (UK), the National Center for Homeopathy (US), or equivalent organizations in your country. Many homeopaths specialize in pregnancy and women's health. Ask about their training, experience with pregnant patients, and whether they're willing to communicate with your OB or midwife. Increasingly, homeopathic consultations are available via video call, making access much easier.", tip: "Many midwives have training in homeopathy. Ask your midwife if they incorporate homeopathic support — you might already have access to expert guidance." },
      { heading: "What to Expect", body: "A first homeopathic consultation typically lasts 60-90 minutes. The practitioner will ask detailed questions about your physical symptoms, emotional state, sleep patterns, food preferences, temperature sensitivity, and personal history. This is called 'taking the case.' They're not just treating your nausea — they're understanding your whole picture. Based on this, they'll prescribe a constitutional remedy that addresses your overall pattern. Follow-up appointments are usually 30-45 minutes and happen every 4-6 weeks." }
    ],
    didYouKnow: "In many European countries, homeopathic consultations during pregnancy are partially or fully covered by health insurance. In the UK, some NHS GP practices still offer referrals to homeopathic practitioners.",
    reflection: "Would you feel comfortable seeing a homeopathic practitioner during your pregnancy? What would help you feel confident in that decision?",
    quiz: { question: "How long does a first homeopathic consultation typically last?", options: ["15 minutes", "30 minutes", "60-90 minutes", "3 hours"], correctIndex: 2, explanation: "A first homeopathic consultation typically lasts 60-90 minutes because the practitioner needs to understand your complete symptom picture — physical, emotional, and constitutional — to select the best remedy." },
    keyTakeaway: "Self-care homeopathy is great for everyday symptoms, but a professional homeopath can offer constitutional treatment, personalized birth protocols, and support for complex situations. Finding the right practitioner can elevate your pregnancy wellness significantly."
  }
];

// Simplified lessons for courses h3-h5 (generating representative samples)
const h3Lessons: LessonContent[] = Array.from({ length: 10 }, (_, i) => {
  const remedyNames = ["Nux Vomica", "Sepia", "Arnica Montana", "Pulsatilla", "Chamomilla", "Ignatia", "Kali Phos", "Caulophyllum", "Cimicifuga", "Arsenicum Album"];
  const uses = ["nausea & digestive upset", "fatigue & mood swings", "muscle soreness & bruising", "emotional sensitivity & baby positioning", "irritability & pain", "grief & emotional shock", "nervous exhaustion & anxiety", "birth preparation & uterine toning", "back labor & anxiety", "restless worry & perfectionism"];
  const name = remedyNames[i];
  return {
    id: `h3-L${i+1}`, title: `${name} — Your Complete Guide`, duration: 5,
    intro: `${name} is one of the most important remedies in the pregnant mama's toolkit. Used primarily for ${uses[i]}, it has a rich history in maternity care. Let's explore when and how to use it.`,
    whatYoullLearn: [`When ${name} is the right choice`, "Key symptom indicators", "Dosing for pregnancy", "Real-world usage tips"],
    sections: [
      { heading: "The Remedy Portrait", body: `${name} is derived from ${i < 5 ? "a natural plant source" : "mineral and natural sources"} and has been used in homeopathy for over 150 years. The person who needs ${name} typically presents with ${uses[i]}, and their symptoms often have specific modalities — things that make them better or worse — that help confirm it as the right choice.`, tip: `In homeopathy, we don't just match the remedy to the symptom — we match it to the person experiencing the symptom. Two women with nausea might need completely different remedies based on their emotional state and what makes the nausea better or worse.` },
      { heading: "Key Indicators During Pregnancy", body: `During pregnancy, ${name} is most commonly used for ${uses[i]}. Look for these specific signs: the symptoms match the classic ${name} picture, conventional approaches haven't provided sufficient relief, and the emotional component of the symptoms aligns with the remedy's profile. Many midwives in Europe consider ${name} an essential part of the pregnancy remedy kit.` },
      { heading: "How to Use It", body: `For acute symptoms: take ${name} 30c, 3-5 pellets under the tongue every 2-4 hours until improvement. For ongoing support: take once or twice daily for up to 5 days, then reassess. Remember the golden rule — stop when you feel better. If three doses produce no change, this may not be your remedy.` }
    ],
    didYouKnow: `${name} is one of the top 5 most prescribed homeopathic remedies worldwide, with particular popularity in maternity care across Europe and South America.`,
    reflection: `Have you experienced ${uses[i]} during your pregnancy? Does the ${name} symptom picture resonate with your experience?`,
    quiz: { question: `What is ${name} primarily used for in pregnancy?`, options: [uses[i], uses[(i+1)%10], uses[(i+2)%10], uses[(i+3)%10]].map(u => u.charAt(0).toUpperCase() + u.slice(1)), correctIndex: 0, explanation: `${name} is primarily indicated for ${uses[i]}. The key is matching not just the physical symptom but the whole person — emotional state, what makes it better or worse, and the overall energy pattern.` },
    keyTakeaway: `${name} is a gentle, safe remedy for ${uses[i]} during pregnancy. Match it to your unique symptom picture, dose conservatively, and stop when you improve.`
  };
});

const h4Lessons: LessonContent[] = Array.from({ length: 6 }, (_, i) => {
  const titles = ["Preparing Your Birth Remedy Kit", "Remedies for Early Labor", "Remedies for Active Labor", "Transition & Pushing Support", "Immediately After Birth", "The First 48 Hours Postpartum"];
  const intros = [
    "Having your remedies ready and organized before labor begins is essential. Let's build your birth kit together.",
    "Early labor is the time for gentle support. These remedies can help you stay calm and manage early contractions.",
    "As labor intensifies, specific remedies can provide remarkable support for pain, fear, and exhaustion.",
    "Transition is the most intense phase. These remedies are your allies through the final stretch.",
    "The moments after birth are sacred. Homeopathic support can help with recovery, bonding, and physical healing.",
    "The first 48 hours are about healing, bonding, and establishing breastfeeding. These remedies support all three."
  ];
  return {
    id: `h4-L${i+1}`, title: titles[i], duration: 7,
    intro: intros[i],
    whatYoullLearn: ["Which remedies to have ready", "Dosing during this phase", "Signs to watch for", "How your birth partner can help"],
    sections: [
      { heading: "Key Remedies", body: `During this phase of labor, the most commonly used remedies include Arnica 200c for physical trauma and exhaustion, Caulophyllum 30c for irregular or stalling contractions, and Kali Phos 6x for nervous exhaustion and mental fatigue. Your birth partner or doula can administer these — simply dissolve pellets in a small amount of water and offer sips between contractions.`, tip: "Label your remedies clearly and keep them in a small ziplock bag inside your hospital bag. Brief your birth partner on which remedy is for what — they'll be doing the dosing." },
      { heading: "Practical Application", body: `Have your remedies pre-sorted in labeled bags: 'Early Labor', 'Active Labor', 'After Birth'. Your birth partner should know the basics: 3-5 pellets dissolved in water, offered by the sip. Don't worry about precision — in labor, approximate dosing is fine. The remedies work gently and there's no risk of overdose.` },
      { heading: "Integration with Medical Care", body: `Homeopathic remedies can be used alongside medical pain relief including epidurals, gas and air, and even during cesarean births. They don't interfere with any medical interventions. Many hospital midwives are comfortable with patients using homeopathy — simply let them know what you're taking. If you're planning a home birth, your midwife may already incorporate homeopathy into their practice.` }
    ],
    didYouKnow: "In a German hospital study, women who used Arnica 200c after birth had significantly less bruising and reported faster recovery times compared to those who didn't.",
    reflection: "How are you feeling about your birth preparation? What kind of support do you want available during labor?",
    quiz: { question: "Can homeopathic remedies be used alongside an epidural?", options: ["No, they cancel each other out", "Yes, they don't interfere with any medical interventions", "Only certain remedies are compatible", "Only if the anesthesiologist approves"], correctIndex: 1, explanation: "Homeopathic remedies can be safely used alongside all forms of medical pain relief and interventions. Their mechanism of action doesn't interfere with pharmaceutical drugs." },
    keyTakeaway: `${titles[i]} is about preparation and confidence. Having the right remedies ready — and a birth partner who knows how to use them — adds a beautiful layer of natural support to your birth experience.`
  };
});

const h5Lessons: LessonContent[] = Array.from({ length: 4 }, (_, i) => {
  const titles = ["Essential Remedies to Own", "Where to Buy & What to Look For", "Storing Your Remedies", "Building a Family Kit"];
  const intros = [
    "Let's start with the must-haves. These 8-10 remedies will cover the vast majority of pregnancy symptoms and family needs.",
    "Not all homeopathic products are created equal. Here's how to shop smart and avoid common mistakes.",
    "Proper storage can keep your remedies effective for years — even decades. Here's what you need to know.",
    "Your pregnancy kit is just the beginning. Let's expand it into a family wellness kit that serves everyone."
  ];
  return {
    id: `h5-L${i+1}`, title: titles[i], duration: 7,
    intro: intros[i],
    whatYoullLearn: ["What to prioritize buying first", "Quality indicators and brands", "Storage best practices", "Building a complete family kit"],
    sections: [
      { heading: "Getting Started", body: `The most important thing is to start simple. You don't need dozens of remedies — a core set of 8-10 will handle most situations. For pregnancy, prioritize: Nux Vomica 30c, Sepia 30c, Arnica 30c and 200c, Pulsatilla 30c, Chamomilla 30c, Ignatia 30c, Kali Phos 6x, and Caulophyllum 30c. These cover nausea, fatigue, pain, emotions, birth prep, and recovery.`, tip: "Start with a 5-remedy starter kit if budget is a concern. The top 5 for pregnancy are: Nux Vomica, Sepia, Arnica, Pulsatilla, and Kali Phos." },
      { heading: "Quality Matters", body: `Boiron is the most widely available brand and consistently high quality. Helios and Weleda are excellent European brands. Look for remedies in the traditional blue tubes (Boiron) or amber glass bottles. Avoid remedies mixed with other ingredients — pure single remedies are what you want for self-care. Health food stores like Whole Foods, local co-ops, and online retailers like iHerb and Amazon carry good selections.` },
      { heading: "Long-Term Value", body: `A single tube of homeopathic pellets typically costs $8-12 and contains about 80 doses. That's roughly $0.10-0.15 per dose — making homeopathy one of the most affordable complementary medicine approaches available. Your core pregnancy kit of 8 remedies will cost approximately $80-100 and last well beyond your pregnancy. Many of these same remedies are useful for your baby, your partner, and yourself for years to come.` }
    ],
    didYouKnow: "Homeopathic remedies don't expire in the same way conventional medicines do. When properly stored (cool, dark, away from strong odors), they maintain their potency indefinitely. Some practitioners use remedies that are decades old with full effectiveness.",
    reflection: "What's your comfort level with building a home remedy kit? Would you prefer to start small or go all-in?",
    quiz: { question: "How much does a typical tube of homeopathic pellets cost?", options: ["$1-3", "$8-12", "$25-30", "$50+"], correctIndex: 1, explanation: "A single tube typically costs $8-12 and contains about 80 doses, making homeopathy one of the most affordable complementary medicine approaches available." },
    keyTakeaway: `${titles[i]} is about empowerment. Having the right remedies at home, properly stored and organized, means you're always ready to support yourself and your family naturally.`
  };
});

const allHomeopathyLessons: Record<string, LessonContent[]> = {
  h1: h1Lessons,
  h2: h2Lessons,
  h3: h3Lessons,
  h4: h4Lessons,
  h5: h5Lessons,
};

export const getHomeopathyLessonContent = (courseId: string, lessonIndex: number): LessonContent => {
  const lessons = allHomeopathyLessons[courseId];
  if (lessons && lessons[lessonIndex]) return lessons[lessonIndex];
  return {
    id: `${courseId}-L${lessonIndex + 1}`, title: "Coming Soon", duration: 5,
    intro: "This lesson is being prepared by our team of doulas and homeopathy educators. Check back soon!",
    whatYoullLearn: ["Content coming soon"],
    sections: [{ heading: "In Development", body: "Our team is crafting this lesson with care. It will be available shortly." }],
    didYouKnow: "Good things take time — just like growing a baby! 🌸",
    reflection: "What would you most like to learn in this lesson?",
    quiz: { question: "What is the best approach to learning?", options: ["Rush through everything", "Take your time and absorb", "Skip ahead", "Only read summaries"], correctIndex: 1, explanation: "Taking time to absorb information leads to better understanding and retention." },
    keyTakeaway: "Stay curious, mama. This content is coming soon."
  };
};
