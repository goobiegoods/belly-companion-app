export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  use: string;
  price: number;
  unit?: string;
  tag?: string;
  emoji: string;
  type: "kit" | "remedy" | "tea";
  contents?: string[];
  safe?: boolean;
}

export const kits: Product[] = [
  { id: "kit-1", name: "First Trimester Relief Kit", description: "For nausea, fatigue & mood shifts", use: "", price: 34.99, emoji: "🌿", type: "kit", tag: "Most popular", contents: ["Nux Vomica 30c", "Sepia 30c", "Ginger Blend Tea"] },
  { id: "kit-2", name: "Second Trimester Glow Kit", description: "For energy, round ligament pain & skin", use: "", price: 32.99, emoji: "🌸", type: "kit", contents: ["Arnica Montana 30c", "Chamomilla 30c", "Rose Hip Tea"] },
  { id: "kit-3", name: "Third Trimester Prep Kit", description: "For birth prep, back pain & rest", use: "", price: 36.99, emoji: "🌙", type: "kit", tag: "Best seller", contents: ["Caulophyllum 30c", "Cimicifuga 30c", "Raspberry Leaf Tea"] },
  { id: "kit-4", name: "Labor & Birth Support Kit", description: "For labor support, energy & recovery", use: "", price: 38.99, emoji: "👶", type: "kit", contents: ["Arnica 200c", "Kali Phos 6x", "Lavender Tea"] },
];

export const remedies: Product[] = [
  { id: "rem-1", name: "Nux Vomica 30c", brand: "Boiron", use: "Nausea, digestive upset, irritability", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-2", name: "Sepia 30c", brand: "Boiron", use: "Fatigue, mood swings, low libido", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-3", name: "Arnica Montana 30c", brand: "Boiron", use: "Muscle soreness, bruising, trauma", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-4", name: "Pulsatilla 30c", brand: "Boiron", use: "Emotional sensitivity, sinus congestion, baby positioning", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-5", name: "Chamomilla 30c", brand: "Boiron", use: "Irritability, pain sensitivity, insomnia", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-6", name: "Caulophyllum 30c", brand: "Boiron", use: "Birth preparation, uterine toning (third trimester only)", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", tag: "Third trimester +" },
  { id: "rem-7", name: "Kali Phos 6x", brand: "Boiron", use: "Nervous exhaustion, anxiety, mental fatigue", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
  { id: "rem-8", name: "Ignatia 30c", brand: "Boiron", use: "Grief, emotional shock, anticipatory anxiety", price: 9.99, unit: "80 pellets", emoji: "💊", type: "remedy", safe: true },
];

export const teas: Product[] = [
  { id: "tea-1", name: "Ginger & Lemon Pregnancy Tea", use: "Nausea relief, digestion, energy", price: 14.99, unit: "20 sachets", emoji: "🍵", type: "tea", tag: "First trimester favorite" },
  { id: "tea-2", name: "Raspberry Leaf Tea", use: "Uterine toning, birth prep", price: 12.99, unit: "20 sachets", emoji: "🍵", type: "tea", tag: "Third trimester only" },
  { id: "tea-3", name: "Chamomile & Lavender Calm Tea", use: "Anxiety, insomnia, relaxation", price: 13.99, unit: "20 sachets", emoji: "🍵", type: "tea" },
  { id: "tea-4", name: "Nettle & Oat Straw Nourish Tea", use: "Iron support, mineral boost, energy", price: 13.99, unit: "20 sachets", emoji: "🍵", type: "tea" },
];

export interface HomeopathyCourse {
  id: string;
  title: string;
  emoji: string;
  lessonCount: number;
  duration: number;
  tags: string[];
  description: string;
  isPremium: boolean;
}

export const homeopathyCourses: HomeopathyCourse[] = [
  { id: "h1", title: "What is Homeopathy?", emoji: "💊", lessonCount: 4, duration: 28, tags: ["Beginner", "What to expect", "History"], description: "The principles of homeopathy, how pellets work, the \"like cures like\" concept, and what the research says.", isPremium: false },
  { id: "h2", title: "Homeopathy in Pregnancy — The Basics", emoji: "🤱", lessonCount: 5, duration: 35, tags: ["Safety", "First trimester", "Dosing"], description: "Which remedies are safe in pregnancy, how to read potencies (6c, 30c, 200c), dosing frequency, and when to stop.", isPremium: false },
  { id: "h3", title: "The Top 10 Pregnancy Remedies", emoji: "🌿", lessonCount: 10, duration: 55, tags: ["Remedies", "Symptoms", "Boiron"], description: "A deep-dive on the 10 most used homeopathic remedies in pregnancy — Nux Vomica, Sepia, Arnica, Pulsatilla, and more.", isPremium: false },
  { id: "h4", title: "Homeopathy for Labor & Birth", emoji: "👶", lessonCount: 6, duration: 42, tags: ["Labor", "Birth prep", "Advanced"], description: "Using remedies during labor, transition, and immediately postpartum. What to pack in your birth kit.", isPremium: true },
  { id: "h5", title: "Building Your Home Remedy Kit", emoji: "🧺", lessonCount: 4, duration: 30, tags: ["Practical", "Shopping guide", "Storage"], description: "What to buy, where to buy it, how to store remedies, and how to build a kit for your whole family.", isPremium: true },
];

export const SHOP_DISCLAIMER = "Homeopathic remedies are not FDA-evaluated. Always consult your OB or midwife before starting any new supplement or remedy during pregnancy. Belly provides these products for informational and wellness purposes only.";
