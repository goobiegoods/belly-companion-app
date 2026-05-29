export interface RecipeIngredient {
  name: string;
  amount: string;
  nutrientRating: 1 | 2 | 3;
  alternatives: string;
}

export interface RecipeVitamin {
  name: string;
  amount: string;
  emoji: string;
}

export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  category: 'Breakfast' | 'Smoothie' | 'Snack' | 'Dinner' | 'Tea';
  prepTime: number;
  ingredients: RecipeIngredient[];
  vitamins: RecipeVitamin[];
  whyThisWeek: string;
  instructions: string[];
  weekRange: [number, number];
}

export const recipes: Recipe[] = [
  // ══════════════════════════════════════════════
  // FIRST TRIMESTER (Weeks 1-13)
  // Focus: Folate, B6, B12, Iron, Zinc, Vitamin C
  // ══════════════════════════════════════════════

  {
    id: 'r1',
    title: "Morning Folate Power Bowl",
    emoji: "🥣",
    category: 'Breakfast',
    prepTime: 5,
    weekRange: [1, 13],
    ingredients: [
      { name: "Cooked lentils", amount: "½ cup", nutrientRating: 3, alternatives: "Black beans or chickpeas provide similar folate. Edamame is another excellent option." },
      { name: "Baby spinach", amount: "1 cup", nutrientRating: 3, alternatives: "Asparagus tips, romaine lettuce, or broccoli florets are all high-folate alternatives." },
      { name: "Avocado", amount: "¼", nutrientRating: 2, alternatives: "Hemp seeds or sunflower seed butter provide similar healthy fats without the texture." },
      { name: "Lemon juice", amount: "1 tbsp", nutrientRating: 1, alternatives: "Orange juice increases iron absorption just as effectively as lemon." },
      { name: "Pumpkin seeds", amount: "2 tbsp", nutrientRating: 2, alternatives: "Sunflower seeds or hemp hearts provide similar zinc and magnesium." },
    ],
    vitamins: [
      { name: "Folate", amount: "220mcg", emoji: "🧬" },
      { name: "Iron", amount: "8mg", emoji: "🩸" },
      { name: "Magnesium", amount: "60mg", emoji: "⚡" },
    ],
    whyThisWeek: "Your baby's neural tube is forming in the first 28 days — folate is the single most critical nutrient right now, reducing neural tube defects by up to 70%. Every bite of this bowl is protective.",
    instructions: [
      "Warm lentils in a small pan with a pinch of cumin",
      "Layer spinach, lentils, and sliced avocado in a bowl",
      "Squeeze lemon over everything and top with pumpkin seeds",
      "Season with sea salt and a drizzle of olive oil",
    ],
  },
  {
    id: 'r2',
    title: "Ginger & Lemon Anti-Nausea Tonic",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 5,
    weekRange: [6, 14],
    ingredients: [
      { name: "Fresh ginger root", amount: "1 inch", nutrientRating: 3, alternatives: "Crystallised ginger or ginger powder work well. Peppermint leaves are equally effective for nausea relief." },
      { name: "Lemon", amount: "½ squeezed", nutrientRating: 2, alternatives: "Lime juice or orange juice. Add a slice of orange for a sweeter version." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Maple syrup or a Medjool date blended in for natural sweetness without refined sugar." },
      { name: "Filtered water", amount: "300ml", nutrientRating: 1, alternatives: "Coconut water adds electrolytes and extra nausea-fighting properties." },
    ],
    vitamins: [
      { name: "Vitamin C", amount: "25mg", emoji: "🍊" },
      { name: "B6", amount: "trace", emoji: "🌿" },
      { name: "Potassium", amount: "40mg", emoji: "⚡" },
    ],
    whyThisWeek: "Morning sickness peaks between weeks 6-10 as hCG surges. Ginger contains gingerols that directly calm the vagus nerve — the same nerve responsible for nausea signals. This tonic works within 15 minutes.",
    instructions: [
      "Peel and finely slice the ginger root",
      "Add to 300ml just-boiled water (not boiling — let it cool 2 minutes first to preserve enzymes)",
      "Steep for 8-10 minutes, covered",
      "Strain, add lemon juice and honey",
      "Sip slowly before getting out of bed",
    ],
  },
  {
    id: 'r3',
    title: "B6 Banana Walnut Overnight Oats",
    emoji: "🥣",
    category: 'Breakfast',
    prepTime: 5,
    weekRange: [1, 13],
    ingredients: [
      { name: "Rolled oats", amount: "½ cup", nutrientRating: 2, alternatives: "Quinoa flakes are gluten-free and higher in protein. Buckwheat groats provide more B vitamins." },
      { name: "Banana", amount: "1 ripe", nutrientRating: 3, alternatives: "Mango is equally high in B6. Sweet potato is the highest food source of B6 overall." },
      { name: "Walnuts", amount: "2 tbsp", nutrientRating: 3, alternatives: "Flaxseeds or chia seeds provide similar omega-3. Brazil nuts add selenium." },
      { name: "Oat milk", amount: "200ml", nutrientRating: 2, alternatives: "Almond milk or coconut milk. For extra calcium use fortified soy milk." },
      { name: "Cinnamon", amount: "½ tsp", nutrientRating: 1, alternatives: "Cardamom is warming and Ayurvedic tradition considers it supportive in pregnancy." },
    ],
    vitamins: [
      { name: "B6", amount: "0.6mg", emoji: "🌿" },
      { name: "Omega-3", amount: "1.2g", emoji: "🧠" },
      { name: "Magnesium", amount: "55mg", emoji: "⚡" },
    ],
    whyThisWeek: "Vitamin B6 is clinically proven to reduce pregnancy nausea. Walnuts provide the ALA omega-3 fatty acids your baby's first brain cells need from the very beginning of neural development.",
    instructions: [
      "Mash half the banana into the oats",
      "Pour in oat milk and stir well",
      "Top with sliced banana and walnuts",
      "Refrigerate overnight or for at least 2 hours",
      "Add cinnamon and a drizzle of honey before serving",
    ],
  },
  {
    id: 'r4a',
    title: "Zinc-Boosting Pumpkin Seed Smoothie",
    emoji: "🥤",
    category: 'Smoothie',
    prepTime: 3,
    weekRange: [1, 13],
    ingredients: [
      { name: "Pumpkin seeds", amount: "3 tbsp", nutrientRating: 3, alternatives: "Cashews or hemp seeds are also zinc-rich. Sunflower seeds work as a nut-free option." },
      { name: "Frozen berries", amount: "1 cup", nutrientRating: 2, alternatives: "Fresh strawberries or kiwi for extra vitamin C to boost zinc absorption." },
      { name: "Banana", amount: "1", nutrientRating: 2, alternatives: "Avocado for creaminess without the sweetness." },
      { name: "Coconut yoghurt", amount: "½ cup", nutrientRating: 2, alternatives: "Greek yoghurt for extra protein, or silken tofu for a high-protein vegan option." },
      { name: "Spinach", amount: "1 handful", nutrientRating: 2, alternatives: "Kale or Swiss chard. The berries mask the green flavour completely." },
    ],
    vitamins: [
      { name: "Zinc", amount: "4mg", emoji: "🔬" },
      { name: "Vitamin C", amount: "60mg", emoji: "🍊" },
      { name: "Folate", amount: "80mcg", emoji: "🧬" },
    ],
    whyThisWeek: "Zinc is essential for the rapid cell division happening as your embryo grows from 1 cell to millions. Low zinc is linked to longer labours and lower birth weight — this smoothie delivers 40% of your daily need.",
    instructions: [
      "Add all ingredients to a blender",
      "Blend on high for 45 seconds until smooth",
      "Pour into a glass and top with extra pumpkin seeds",
      "Drink immediately for maximum nutrient absorption",
    ],
  },
  {
    id: 'r4b',
    title: "Sweet Potato & White Bean Toast",
    emoji: "🍠",
    category: 'Snack',
    prepTime: 8,
    weekRange: [1, 13],
    ingredients: [
      { name: "Sweet potato", amount: "½ medium, mashed", nutrientRating: 3, alternatives: "Butternut squash or carrot purée provide similar beta-carotene and B6." },
      { name: "White beans", amount: "¼ cup", nutrientRating: 3, alternatives: "Chickpeas or butter beans. Hummus is a convenient pre-made alternative." },
      { name: "Sourdough bread", amount: "1 slice", nutrientRating: 2, alternatives: "Rye bread or gluten-free seeded bread. Rice cakes for a lighter option." },
      { name: "Lemon zest", amount: "pinch", nutrientRating: 1, alternatives: "Orange zest or a sprinkle of sumac for a citrusy kick." },
    ],
    vitamins: [
      { name: "B6", amount: "0.4mg", emoji: "🌿" },
      { name: "Folate", amount: "90mcg", emoji: "🧬" },
      { name: "Iron", amount: "3mg", emoji: "🩸" },
    ],
    whyThisWeek: "Sweet potato is the richest whole-food source of vitamin B6, which your body needs to metabolise the surge of hormones in early pregnancy. The white beans add gentle iron and folate without heaviness.",
    instructions: [
      "Microwave or roast sweet potato until soft, then mash",
      "Mash white beans with a fork and mix with lemon zest",
      "Toast the sourdough bread",
      "Layer sweet potato mash then white bean mixture on toast",
      "Season with sea salt, black pepper, and a drizzle of olive oil",
    ],
  },
  {
    id: 'r4c',
    title: "Vitamin C Citrus & Kiwi Bowl",
    emoji: "🥝",
    category: 'Snack',
    prepTime: 3,
    weekRange: [1, 13],
    ingredients: [
      { name: "Kiwi", amount: "2", nutrientRating: 3, alternatives: "Strawberries or papaya provide excellent vitamin C. Guava has even more." },
      { name: "Orange segments", amount: "1 orange", nutrientRating: 3, alternatives: "Grapefruit or mandarin segments. Blood oranges are especially rich in antioxidants." },
      { name: "Coconut yoghurt", amount: "½ cup", nutrientRating: 2, alternatives: "Greek yoghurt for extra protein and probiotics." },
      { name: "Hemp seeds", amount: "1 tbsp", nutrientRating: 2, alternatives: "Chia seeds or ground flaxseed for omega-3." },
    ],
    vitamins: [
      { name: "Vitamin C", amount: "180mg", emoji: "🍊" },
      { name: "Folate", amount: "65mcg", emoji: "🧬" },
      { name: "Omega-3", amount: "0.8g", emoji: "🧠" },
    ],
    whyThisWeek: "Vitamin C is critical for collagen synthesis — it's building the scaffolding that holds your baby's cells together as they multiply. It also dramatically increases iron absorption from plant foods.",
    instructions: [
      "Slice kiwis and segment the orange",
      "Layer coconut yoghurt in a bowl",
      "Arrange fruit on top",
      "Sprinkle with hemp seeds and serve immediately",
    ],
  },
  {
    id: 'r4d',
    title: "Gentle Iron Lentil Soup",
    emoji: "🍲",
    category: 'Dinner',
    prepTime: 20,
    weekRange: [4, 13],
    ingredients: [
      { name: "Red lentils", amount: "¾ cup", nutrientRating: 3, alternatives: "Yellow split peas or mung beans cook just as quickly and are equally gentle on the stomach." },
      { name: "Carrot", amount: "1 diced", nutrientRating: 2, alternatives: "Sweet potato or butternut squash for extra beta-carotene." },
      { name: "Cumin", amount: "1 tsp", nutrientRating: 1, alternatives: "Coriander or turmeric. Both aid digestion in early pregnancy." },
      { name: "Lemon juice", amount: "2 tbsp", nutrientRating: 2, alternatives: "Apple cider vinegar helps iron absorption similarly." },
      { name: "Garlic", amount: "2 cloves", nutrientRating: 1, alternatives: "Ginger if garlic triggers nausea. Leek for a milder allium flavour." },
    ],
    vitamins: [
      { name: "Iron", amount: "12mg", emoji: "🩸" },
      { name: "Folate", amount: "240mcg", emoji: "🧬" },
      { name: "Zinc", amount: "3mg", emoji: "🔬" },
      { name: "B6", amount: "0.5mg", emoji: "🌿" },
    ],
    whyThisWeek: "Your blood volume is already starting to increase. Iron from lentils, paired with vitamin C from the lemon, creates the most absorbable plant-iron combination. This soup is gentle enough for even the most nauseous days.",
    instructions: [
      "Sauté garlic and cumin in olive oil for 1 minute",
      "Add diced carrot and cook 3 minutes",
      "Add lentils and 500ml water, bring to boil",
      "Simmer 15 minutes until lentils are soft",
      "Stir in lemon juice, season, and serve with sourdough",
    ],
  },
  {
    id: 'r4e',
    title: "Chamomile & Honey Calm Tea",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 5,
    weekRange: [1, 13],
    ingredients: [
      { name: "Chamomile flowers", amount: "1 tbsp dried", nutrientRating: 2, alternatives: "Lemon balm or passionflower are equally calming and pregnancy-safe in moderate amounts." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Manuka honey has additional antibacterial properties. Date syrup for a mineral-rich sweetener." },
      { name: "Lemon slice", amount: "1", nutrientRating: 1, alternatives: "Orange slice or fresh mint leaves for a different flavour profile." },
    ],
    vitamins: [
      { name: "Calcium", amount: "15mg", emoji: "🦴" },
      { name: "Magnesium", amount: "8mg", emoji: "⚡" },
    ],
    whyThisWeek: "The first trimester is emotionally intense as hormones surge. Chamomile contains apigenin, which binds to GABA receptors in the brain — the same pathway targeted by anti-anxiety medications, but gentle and natural.",
    instructions: [
      "Boil water and let it cool for 2 minutes",
      "Pour over chamomile flowers in a mug",
      "Cover and steep for 5-7 minutes",
      "Strain, add honey and lemon slice",
      "Sip slowly in a quiet moment",
    ],
  },

  // ══════════════════════════════════════════════
  // SECOND TRIMESTER (Weeks 14-26)
  // Focus: Iron, Calcium, Omega-3, Vit D, Protein, Magnesium
  // ══════════════════════════════════════════════

  {
    id: 'r4',
    title: "Iron-Rich Lentil & Spinach Bowl",
    emoji: "🥗",
    category: 'Breakfast',
    prepTime: 5,
    weekRange: [14, 26],
    ingredients: [
      { name: "Red lentils", amount: "½ cup cooked", nutrientRating: 3, alternatives: "Black lentils contain even more iron. Kidney beans or black beans are equally iron-dense." },
      { name: "Baby spinach", amount: "2 cups", nutrientRating: 3, alternatives: "Nettle leaf (dried or fresh) has more iron than spinach. Dandelion greens, watercress, or Swiss chard work beautifully." },
      { name: "Pumpkin seeds", amount: "2 tbsp", nutrientRating: 3, alternatives: "Hemp hearts or sunflower seeds. Blackstrap molasses stirred in adds significant iron." },
      { name: "Lemon juice", amount: "1 tbsp", nutrientRating: 2, alternatives: "Vitamin C from any citrus dramatically increases non-heme iron absorption — never skip this." },
      { name: "Tahini", amount: "1 tbsp", nutrientRating: 2, alternatives: "Hummus, sesame oil, or almond butter all provide calcium and healthy fats." },
    ],
    vitamins: [
      { name: "Iron", amount: "18mg", emoji: "🩸" },
      { name: "Folate", amount: "180mcg", emoji: "🧬" },
      { name: "Magnesium", amount: "72mg", emoji: "⚡" },
      { name: "Zinc", amount: "4mg", emoji: "🔬" },
    ],
    whyThisWeek: "Baby's circulatory system is now fully functioning at week 16. Your blood volume increases by 50% during pregnancy — iron is what makes that expansion possible. This bowl delivers your most bioavailable plant-based iron source.",
    instructions: [
      "Warm lentils with a pinch of cumin and turmeric",
      "Wilt spinach in the same pan for 60 seconds",
      "Transfer to bowl, top with pumpkin seeds",
      "Whisk tahini with lemon juice and 2 tbsp water",
      "Drizzle dressing over bowl and season with sea salt",
    ],
  },
  {
    id: 'r5',
    title: "Golden Brain-Building Smoothie",
    emoji: "🥤",
    category: 'Smoothie',
    prepTime: 3,
    weekRange: [14, 26],
    ingredients: [
      { name: "Frozen mango", amount: "1 cup", nutrientRating: 2, alternatives: "Papaya is equally rich in vitamin C and digestive enzymes. Frozen pineapple works well." },
      { name: "Ground flaxseed", amount: "1 tbsp", nutrientRating: 3, alternatives: "Chia seeds provide identical omega-3 ALA. Algae-based DHA drops are the most bioavailable." },
      { name: "Coconut milk", amount: "½ cup", nutrientRating: 2, alternatives: "Full-fat oat milk or almond milk. Goat's milk for those who tolerate dairy." },
      { name: "Banana", amount: "1", nutrientRating: 2, alternatives: "Avocado creates a creamier texture and adds healthy fats. Mango doubles the vitamin C." },
      { name: "Turmeric", amount: "¼ tsp", nutrientRating: 2, alternatives: "Fresh ginger provides similar anti-inflammatory properties. Cinnamon for warmth." },
    ],
    vitamins: [
      { name: "Omega-3", amount: "1.8g", emoji: "🧠" },
      { name: "Vitamin C", amount: "45mg", emoji: "🍊" },
      { name: "Calcium", amount: "85mg", emoji: "🦴" },
      { name: "Potassium", amount: "420mg", emoji: "⚡" },
    ],
    whyThisWeek: "Baby's brain is growing at its fastest rate — 250,000 new neurons per minute between weeks 14-20. Omega-3 DHA is the primary structural fat in brain tissue. Feed those neurons every single day.",
    instructions: [
      "Add all ingredients to blender",
      "Blend on high for 60 seconds until completely smooth",
      "Add a pinch of black pepper (activates turmeric)",
      "Pour immediately and drink within 10 minutes",
      "Add ice if preferred cold",
    ],
  },
  {
    id: 'r6',
    title: "Calcium Sesame Noodle Bowl",
    emoji: "🍜",
    category: 'Dinner',
    prepTime: 15,
    weekRange: [14, 28],
    ingredients: [
      { name: "Soba noodles", amount: "80g", nutrientRating: 2, alternatives: "Rice noodles for gluten-free. Zucchini noodles for a lighter option." },
      { name: "Edamame", amount: "½ cup", nutrientRating: 3, alternatives: "Tofu cubes or tempeh provide similar plant protein and calcium." },
      { name: "Tahini", amount: "3 tbsp", nutrientRating: 3, alternatives: "Almond butter provides similar calcium. White bean paste is another high-calcium option." },
      { name: "Sesame seeds", amount: "2 tbsp", nutrientRating: 3, alternatives: "Hemp seeds contain more omega-3. Chia seeds provide calcium and omega-3." },
      { name: "Cucumber", amount: "½", nutrientRating: 1, alternatives: "Sugar snap peas, shredded cabbage, or ribboned carrot all work beautifully." },
    ],
    vitamins: [
      { name: "Calcium", amount: "220mg", emoji: "🦴" },
      { name: "Protein", amount: "18g", emoji: "💪" },
      { name: "Iron", amount: "6mg", emoji: "🩸" },
      { name: "Zinc", amount: "3mg", emoji: "🔬" },
    ],
    whyThisWeek: "Baby's skeleton is ossifying — 200 bones are hardening from cartilage to bone. Calcium from tahini and sesame is more bioavailable than dairy for many women, and sesame seeds are one of the richest plant sources on earth.",
    instructions: [
      "Cook soba noodles per packet, rinse cold",
      "Whisk tahini, soy sauce, lime juice, sesame oil, ginger, and a splash of water into a sauce",
      "Toss noodles in sauce",
      "Top with edamame, cucumber, sesame seeds",
      "Add chilli flakes and spring onion to serve",
    ],
  },
  {
    id: 'r6a',
    title: "Protein-Packed Quinoa Snack Cups",
    emoji: "🥙",
    category: 'Snack',
    prepTime: 10,
    weekRange: [14, 26],
    ingredients: [
      { name: "Cooked quinoa", amount: "½ cup", nutrientRating: 3, alternatives: "Cooked millet or amaranth are equally protein-rich ancient grains." },
      { name: "Cherry tomatoes", amount: "6 halved", nutrientRating: 2, alternatives: "Sun-dried tomatoes are more concentrated. Roasted red pepper for sweetness." },
      { name: "Feta cheese", amount: "2 tbsp crumbled", nutrientRating: 2, alternatives: "Nutritional yeast for a dairy-free cheesy flavour with added B12." },
      { name: "Mint leaves", amount: "6 fresh", nutrientRating: 1, alternatives: "Basil or parsley. Dill is wonderful with feta." },
      { name: "Olive oil", amount: "1 tbsp", nutrientRating: 2, alternatives: "Avocado oil or hemp seed oil for extra omega-3." },
    ],
    vitamins: [
      { name: "Protein", amount: "12g", emoji: "💪" },
      { name: "Iron", amount: "4mg", emoji: "🩸" },
      { name: "Calcium", amount: "95mg", emoji: "🦴" },
      { name: "B12", amount: "0.3mcg", emoji: "🧬" },
    ],
    whyThisWeek: "Your baby's muscles are developing rapidly and protein demand increases by 25g/day in the second trimester. Quinoa is a complete protein — one of the only plant foods containing all 9 essential amino acids.",
    instructions: [
      "Mix cooked quinoa with halved tomatoes and crumbled feta",
      "Tear mint leaves and fold through",
      "Drizzle with olive oil and a squeeze of lemon",
      "Season with salt and pepper",
      "Serve in small cups or lettuce wraps",
    ],
  },
  {
    id: 'r6b',
    title: "Vitamin D Mushroom & Egg Scramble",
    emoji: "🍳",
    category: 'Breakfast',
    prepTime: 8,
    weekRange: [14, 26],
    ingredients: [
      { name: "Eggs", amount: "2", nutrientRating: 3, alternatives: "Silken tofu scramble with nutritional yeast provides similar protein and B12." },
      { name: "Shiitake mushrooms", amount: "4 sliced", nutrientRating: 3, alternatives: "Maitake or portobello mushrooms. Leave mushrooms in sunlight for 30 mins to boost their vitamin D." },
      { name: "Spinach", amount: "1 cup", nutrientRating: 2, alternatives: "Kale, rocket, or watercress all add iron and folate." },
      { name: "Ghee", amount: "1 tsp", nutrientRating: 2, alternatives: "Coconut oil or olive oil. Ghee is Ayurvedically prized in pregnancy for building ojas (vitality)." },
    ],
    vitamins: [
      { name: "Vitamin D", amount: "200IU", emoji: "☀️" },
      { name: "Protein", amount: "16g", emoji: "💪" },
      { name: "B12", amount: "1.2mcg", emoji: "🧬" },
      { name: "Iron", amount: "4mg", emoji: "🩸" },
    ],
    whyThisWeek: "Vitamin D is crucial for calcium absorption — without it, the calcium you eat can't reach your baby's developing bones. Sun-exposed mushrooms are one of the only non-animal food sources of vitamin D2.",
    instructions: [
      "Heat ghee in a pan over medium heat",
      "Sauté sliced mushrooms until golden, about 4 minutes",
      "Add spinach and wilt for 30 seconds",
      "Push to one side, crack in eggs, and scramble gently",
      "Season with sea salt, pepper, and a pinch of turmeric",
    ],
  },
  {
    id: 'r6c',
    title: "Omega-3 Berry Chia Pudding",
    emoji: "🫐",
    category: 'Snack',
    prepTime: 5,
    weekRange: [14, 26],
    ingredients: [
      { name: "Chia seeds", amount: "3 tbsp", nutrientRating: 3, alternatives: "Flaxseeds provide similar omega-3 but create a different texture. Basil seeds (sabja) are an Ayurvedic alternative." },
      { name: "Coconut milk", amount: "200ml", nutrientRating: 2, alternatives: "Oat milk or almond milk. Full-fat versions give creamier results." },
      { name: "Mixed berries", amount: "½ cup", nutrientRating: 2, alternatives: "Pomegranate seeds are rich in antioxidants. Passion fruit adds folate." },
      { name: "Maple syrup", amount: "1 tsp", nutrientRating: 1, alternatives: "Raw honey, date syrup, or mashed banana for natural sweetness." },
    ],
    vitamins: [
      { name: "Omega-3", amount: "2.5g", emoji: "🧠" },
      { name: "Calcium", amount: "130mg", emoji: "🦴" },
      { name: "Vitamin C", amount: "30mg", emoji: "🍊" },
      { name: "Magnesium", amount: "50mg", emoji: "⚡" },
    ],
    whyThisWeek: "Chia seeds are the richest plant source of omega-3 ALA, which your body converts to DHA for baby's rapidly developing brain. They also absorb 12x their weight in water, helping prevent the constipation common in the second trimester.",
    instructions: [
      "Mix chia seeds with coconut milk and maple syrup",
      "Stir well to prevent clumping",
      "Refrigerate for at least 2 hours or overnight",
      "Top with berries before serving",
      "Store covered in the fridge for up to 3 days",
    ],
  },
  {
    id: 'r6d',
    title: "Calcium-Rich Nettle Infusion",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 5,
    weekRange: [14, 26],
    ingredients: [
      { name: "Dried nettle leaf", amount: "2 tbsp", nutrientRating: 3, alternatives: "Oat straw is equally mineral-rich. Red raspberry leaf after 28 weeks strengthens the uterus." },
      { name: "Dried red raspberry leaf", amount: "1 tbsp", nutrientRating: 2, alternatives: "Peppermint or lemon balm for flavour. Alfalfa adds vitamin K." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Stevia or unsweetened. Many women grow to love the earthy flavour plain." },
    ],
    vitamins: [
      { name: "Calcium", amount: "160mg", emoji: "🦴" },
      { name: "Iron", amount: "6mg", emoji: "🩸" },
      { name: "Vitamin K", amount: "90mcg", emoji: "🌿" },
      { name: "Magnesium", amount: "45mg", emoji: "⚡" },
    ],
    whyThisWeek: "Nettle is the single most mineral-dense herb safe in pregnancy. Midwives have used it for centuries to build blood, strengthen bones, and reduce leg cramps. One cup delivers more calcium than a glass of milk.",
    instructions: [
      "Place nettle and raspberry leaf in a large mason jar",
      "Pour 500ml just-boiled water over the herbs",
      "Cover and steep for a minimum of 4 hours (overnight is best)",
      "Strain, add honey, and drink warm or over ice",
      "Make a batch of 1 litre and sip throughout the day",
    ],
  },
  {
    id: 'r6e',
    title: "Magnesium Mango Lassi",
    emoji: "🥭",
    category: 'Smoothie',
    prepTime: 3,
    weekRange: [14, 26],
    ingredients: [
      { name: "Ripe mango", amount: "1 cup chopped", nutrientRating: 3, alternatives: "Frozen mango works perfectly. Papaya is another tropical fruit rich in enzymes." },
      { name: "Full-fat yoghurt", amount: "½ cup", nutrientRating: 2, alternatives: "Coconut yoghurt for dairy-free. Kefir adds probiotics for gut health." },
      { name: "Cardamom", amount: "¼ tsp ground", nutrientRating: 1, alternatives: "Vanilla extract or rose water for a different Ayurvedic twist." },
      { name: "Magnesium powder", amount: "½ tsp", nutrientRating: 3, alternatives: "A handful of cashews blended in provides natural magnesium. Cacao powder adds both magnesium and iron." },
    ],
    vitamins: [
      { name: "Magnesium", amount: "100mg", emoji: "⚡" },
      { name: "Vitamin C", amount: "60mg", emoji: "🍊" },
      { name: "Calcium", amount: "110mg", emoji: "🦴" },
      { name: "Probiotics", amount: "1B CFU", emoji: "🦠" },
    ],
    whyThisWeek: "Magnesium prevents the leg cramps, insomnia, and headaches that plague the second trimester. The traditional Ayurvedic lassi is considered one of the most nourishing drinks in pregnancy — cooling, grounding, and deeply satisfying.",
    instructions: [
      "Blend mango, yoghurt, and cardamom until smooth",
      "Add magnesium powder and blend for 10 more seconds",
      "Pour into a glass with a few ice cubes",
      "Dust the top with a pinch of cardamom",
      "Drink in the afternoon for an energy boost",
    ],
  },

  // ══════════════════════════════════════════════
  // THIRD TRIMESTER (Weeks 27-40)
  // Focus: DHA, Vitamin K, Magnesium, Iron, Collagen, Protein, Vit D
  // ══════════════════════════════════════════════

  {
    id: 'r7',
    title: "Magnesium Sleep Elixir",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 5,
    weekRange: [27, 40],
    ingredients: [
      { name: "Oat straw herb", amount: "1 tsp dried", nutrientRating: 3, alternatives: "Chamomile flowers are equally calming. Lemon balm tea is a beautiful gentle alternative." },
      { name: "Nettle leaf", amount: "1 tsp dried", nutrientRating: 3, alternatives: "Red raspberry leaf after 32 weeks is the traditional uterine tonic. Alfalfa is rich in vitamin K." },
      { name: "Magnesium glycinate powder", amount: "½ tsp", nutrientRating: 3, alternatives: "A cup of warm coconut milk provides natural magnesium. Dark chocolate 85%+ is a delicious magnesium source." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Medjool date syrup or maple syrup. Leave out entirely for a purely herbal tonic." },
    ],
    vitamins: [
      { name: "Magnesium", amount: "120mg", emoji: "⚡" },
      { name: "Iron", amount: "4mg", emoji: "🩸" },
      { name: "Calcium", amount: "55mg", emoji: "🦴" },
      { name: "Vitamin K", amount: "80mcg", emoji: "🌿" },
    ],
    whyThisWeek: "Sleep becomes increasingly difficult in the third trimester. Magnesium relaxes smooth muscle, reduces restless legs, and calms the nervous system. Oat straw is a traditional nervine tonic used by midwives for centuries for exactly this.",
    instructions: [
      "Bring 350ml water to just below boiling",
      "Add oat straw and nettle, steep covered for 10 mins",
      "Strain into a mug",
      "Stir in magnesium powder until dissolved",
      "Add honey and drink warm 30 minutes before bed",
    ],
  },
  {
    id: 'r8',
    title: "Third Trimester Protein Power Dinner",
    emoji: "🍲",
    category: 'Dinner',
    prepTime: 20,
    weekRange: [28, 40],
    ingredients: [
      { name: "Salmon fillet", amount: "150g", nutrientRating: 3, alternatives: "Sardines are higher in DHA and calcium from bones. For plant-based: tofu + algae DHA drops." },
      { name: "Sweet potato", amount: "1 medium", nutrientRating: 3, alternatives: "Butternut squash or pumpkin. Carrots provide beta-carotene but less vitamin D." },
      { name: "Kale", amount: "2 cups", nutrientRating: 3, alternatives: "Cavolo nero or chard. Broccoli provides similar vitamin K and calcium." },
      { name: "Garlic", amount: "2 cloves", nutrientRating: 2, alternatives: "Onion or leek. Ginger adds warmth and anti-inflammatory benefits." },
      { name: "Olive oil", amount: "2 tbsp", nutrientRating: 2, alternatives: "Avocado oil for high heat. Coconut oil adds antimicrobial medium-chain fatty acids." },
    ],
    vitamins: [
      { name: "DHA", amount: "1.2g", emoji: "🧠" },
      { name: "Vitamin D", amount: "400IU", emoji: "☀️" },
      { name: "Protein", amount: "34g", emoji: "💪" },
      { name: "Vitamin K", amount: "180mcg", emoji: "🌿" },
      { name: "Iron", amount: "5mg", emoji: "🩸" },
    ],
    whyThisWeek: "Baby is laying down fat stores and the brain is making its final critical DHA deposits. Vitamin D primes baby's immune system for the outside world. This is the most nutrient-dense single meal you can eat in your third trimester.",
    instructions: [
      "Preheat oven to 200°C. Cube sweet potato, toss in olive oil and sea salt, roast 20 mins",
      "Season salmon with lemon zest, garlic, olive oil",
      "Place salmon on baking sheet, roast 12-15 mins",
      "Sauté kale with garlic in olive oil until wilted",
      "Plate together, squeeze fresh lemon over all",
    ],
  },
  {
    id: 'r8a',
    title: "DHA-Rich Sardine Toast",
    emoji: "🐟",
    category: 'Snack',
    prepTime: 5,
    weekRange: [27, 40],
    ingredients: [
      { name: "Sardines in olive oil", amount: "1 tin", nutrientRating: 3, alternatives: "Mackerel or anchovies are equally DHA-rich. For plant-based: walnut pâté with algae DHA." },
      { name: "Sourdough bread", amount: "1 slice", nutrientRating: 2, alternatives: "Rye bread or seeded crackers. Cucumber rounds for a grain-free option." },
      { name: "Lemon juice", amount: "1 tbsp", nutrientRating: 1, alternatives: "Capers or pickled onion add similar acidity." },
      { name: "Avocado", amount: "¼ mashed", nutrientRating: 2, alternatives: "Cream cheese or hummus as a base spread." },
    ],
    vitamins: [
      { name: "DHA", amount: "1.4g", emoji: "🧠" },
      { name: "Calcium", amount: "180mg", emoji: "🦴" },
      { name: "Vitamin D", amount: "250IU", emoji: "☀️" },
      { name: "Protein", amount: "22g", emoji: "💪" },
    ],
    whyThisWeek: "Sardines are a pregnancy superfood — the soft bones provide more calcium than milk, the DHA supports baby's final brain development sprint, and they're one of the lowest-mercury fish available.",
    instructions: [
      "Toast the sourdough bread",
      "Spread mashed avocado on the toast",
      "Arrange sardines on top and mash lightly with a fork",
      "Squeeze lemon juice over everything",
      "Season with sea salt, pepper, and a drizzle of olive oil",
    ],
  },
  {
    id: 'r8b',
    title: "Vitamin K Green Goddess Bowl",
    emoji: "🥬",
    category: 'Breakfast',
    prepTime: 8,
    weekRange: [27, 40],
    ingredients: [
      { name: "Kale", amount: "2 cups chopped", nutrientRating: 3, alternatives: "Broccoli, Brussels sprouts, or asparagus are all vitamin K powerhouses." },
      { name: "Eggs", amount: "2 soft-boiled", nutrientRating: 3, alternatives: "Tofu scramble or tempeh strips. Smoked salmon for extra DHA." },
      { name: "Avocado", amount: "½", nutrientRating: 2, alternatives: "Tahini drizzle or hummus for healthy fats." },
      { name: "Sauerkraut", amount: "2 tbsp", nutrientRating: 2, alternatives: "Kimchi or pickled vegetables. Any fermented food supports gut health." },
      { name: "Hemp seeds", amount: "1 tbsp", nutrientRating: 2, alternatives: "Pumpkin seeds for zinc or sunflower seeds for vitamin E." },
    ],
    vitamins: [
      { name: "Vitamin K", amount: "280mcg", emoji: "🌿" },
      { name: "Protein", amount: "20g", emoji: "💪" },
      { name: "Folate", amount: "140mcg", emoji: "🧬" },
      { name: "Probiotics", amount: "1B CFU", emoji: "🦠" },
    ],
    whyThisWeek: "Vitamin K is essential for blood clotting — both yours during delivery and baby's in the first days of life. Building your stores now ensures baby receives adequate vitamin K through breast milk from day one.",
    instructions: [
      "Massage kale with a drizzle of olive oil and lemon juice",
      "Soft-boil eggs: 6.5 minutes in boiling water, then ice bath",
      "Arrange kale in a bowl, add sliced avocado",
      "Halve the eggs and place on top",
      "Add sauerkraut, sprinkle hemp seeds, season with salt",
    ],
  },
  {
    id: 'r8c',
    title: "Collagen-Rich Bone Broth",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 10,
    weekRange: [30, 40],
    ingredients: [
      { name: "Bone broth", amount: "1 cup", nutrientRating: 3, alternatives: "Mushroom broth with seaweed provides plant-based collagen-building amino acids. Miso soup adds probiotics." },
      { name: "Turmeric", amount: "½ tsp", nutrientRating: 2, alternatives: "Ginger for warmth. Black pepper is essential to activate turmeric's curcumin." },
      { name: "Garlic", amount: "1 clove minced", nutrientRating: 1, alternatives: "Ginger or lemongrass for a different flavour profile." },
      { name: "Sea salt", amount: "pinch", nutrientRating: 1, alternatives: "Miso paste adds umami and probiotics. Coconut aminos for a soy-free option." },
    ],
    vitamins: [
      { name: "Collagen", amount: "10g", emoji: "✨" },
      { name: "Calcium", amount: "45mg", emoji: "🦴" },
      { name: "Magnesium", amount: "30mg", emoji: "⚡" },
      { name: "Protein", amount: "8g", emoji: "💪" },
    ],
    whyThisWeek: "Collagen builds the elastic tissue in your perineum, cervix, and skin — all of which need to stretch dramatically during birth. Drinking bone broth in the final weeks is a traditional preparation for an easier delivery.",
    instructions: [
      "Heat bone broth in a small saucepan",
      "Add turmeric, garlic, and a pinch of black pepper",
      "Simmer gently for 5 minutes",
      "Strain into a mug",
      "Sip warm — drink 1-2 cups daily in the final weeks",
    ],
  },
  {
    id: 'r8d',
    title: "Date & Almond Energy Bites",
    emoji: "🍪",
    category: 'Snack',
    prepTime: 10,
    weekRange: [34, 40],
    ingredients: [
      { name: "Medjool dates", amount: "6 pitted", nutrientRating: 3, alternatives: "Dried figs are equally iron-rich. Dried apricots provide more beta-carotene." },
      { name: "Almonds", amount: "½ cup", nutrientRating: 3, alternatives: "Cashews or macadamia nuts. Sunflower seeds for a nut-free option." },
      { name: "Cacao powder", amount: "1 tbsp", nutrientRating: 2, alternatives: "Carob powder for a caffeine-free version with natural sweetness." },
      { name: "Coconut oil", amount: "1 tbsp melted", nutrientRating: 2, alternatives: "Almond butter or tahini as a binding agent." },
      { name: "Sea salt", amount: "pinch", nutrientRating: 1, alternatives: "Vanilla extract or orange zest for flavour variation." },
    ],
    vitamins: [
      { name: "Iron", amount: "4mg", emoji: "🩸" },
      { name: "Magnesium", amount: "80mg", emoji: "⚡" },
      { name: "Protein", amount: "8g", emoji: "💪" },
      { name: "Potassium", amount: "350mg", emoji: "⚡" },
    ],
    whyThisWeek: "Clinical research shows eating 6 dates daily from week 36 significantly shortens labour, increases cervical dilation at admission, and reduces the need for induction. These bites make that dose delicious.",
    instructions: [
      "Blend almonds in a food processor until coarsely ground",
      "Add dates, cacao, coconut oil, and salt",
      "Process until the mixture sticks together when pressed",
      "Roll into 12 small balls",
      "Refrigerate for 30 minutes, then store in the fridge for up to a week",
    ],
  },
  {
    id: 'r8e',
    title: "Iron & Protein Black Bean Tacos",
    emoji: "🌮",
    category: 'Dinner',
    prepTime: 15,
    weekRange: [27, 40],
    ingredients: [
      { name: "Black beans", amount: "1 cup cooked", nutrientRating: 3, alternatives: "Pinto beans or kidney beans. Lentils cook faster and provide similar nutrition." },
      { name: "Corn tortillas", amount: "3 small", nutrientRating: 2, alternatives: "Lettuce wraps for grain-free. Whole wheat tortillas for more fibre." },
      { name: "Avocado", amount: "½ sliced", nutrientRating: 2, alternatives: "Guacamole or cashew cream for a different texture." },
      { name: "Lime juice", amount: "2 tbsp", nutrientRating: 2, alternatives: "Lemon juice works similarly for iron absorption." },
      { name: "Red onion", amount: "¼ diced", nutrientRating: 1, alternatives: "Pickled jalapeños or radish for crunch." },
    ],
    vitamins: [
      { name: "Iron", amount: "8mg", emoji: "🩸" },
      { name: "Protein", amount: "18g", emoji: "💪" },
      { name: "Folate", amount: "180mcg", emoji: "🧬" },
      { name: "Vitamin C", amount: "20mg", emoji: "🍊" },
    ],
    whyThisWeek: "Iron needs peak in the third trimester as you prepare your blood stores for birth — you'll lose around 500ml during delivery. Black beans are one of the most iron-dense foods and the lime ensures maximum absorption.",
    instructions: [
      "Heat black beans with cumin, paprika, and garlic",
      "Warm tortillas in a dry pan for 30 seconds each side",
      "Fill tortillas with beans and sliced avocado",
      "Top with diced red onion and fresh coriander",
      "Squeeze lime over everything and serve with salsa",
    ],
  },
  {
    id: 'r8f',
    title: "Red Raspberry Leaf Labour Prep Tea",
    emoji: "🍵",
    category: 'Tea',
    prepTime: 5,
    weekRange: [32, 40],
    ingredients: [
      { name: "Red raspberry leaf", amount: "2 tbsp dried", nutrientRating: 3, alternatives: "Nettle leaf can be blended in for extra minerals. Alfalfa adds vitamin K." },
      { name: "Rose hips", amount: "1 tsp", nutrientRating: 2, alternatives: "Hibiscus petals add vitamin C and a beautiful pink colour." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Date syrup or plain. Many midwives recommend it unsweetened." },
    ],
    vitamins: [
      { name: "Iron", amount: "3mg", emoji: "🩸" },
      { name: "Calcium", amount: "60mg", emoji: "🦴" },
      { name: "Vitamin C", amount: "35mg", emoji: "🍊" },
      { name: "Magnesium", amount: "25mg", emoji: "⚡" },
    ],
    whyThisWeek: "Red raspberry leaf has been used by midwives for thousands of years to tone the uterine muscles. Studies show women who drink it from week 32 have shorter second stages of labour and lower rates of forceps delivery.",
    instructions: [
      "Place raspberry leaf and rose hips in a teapot",
      "Pour 400ml boiling water over the herbs",
      "Cover and steep for 15 minutes minimum",
      "Strain into a mug, add honey if desired",
      "Drink 2-3 cups daily from week 32 onwards",
    ],
  },
  {
    id: 'r8g',
    title: "Prep Day Power Smoothie",
    emoji: "🥤",
    category: 'Smoothie',
    prepTime: 3,
    weekRange: [27, 40],
    ingredients: [
      { name: "Frozen blueberries", amount: "1 cup", nutrientRating: 3, alternatives: "Açaí powder or frozen mixed berries. Pomegranate seeds for extra antioxidants." },
      { name: "Almond butter", amount: "2 tbsp", nutrientRating: 3, alternatives: "Peanut butter, cashew butter, or sunflower seed butter." },
      { name: "Banana", amount: "1 frozen", nutrientRating: 2, alternatives: "Avocado for lower sugar and more healthy fats." },
      { name: "Oat milk", amount: "250ml", nutrientRating: 2, alternatives: "Coconut milk for more medium-chain fatty acids." },
      { name: "Cacao nibs", amount: "1 tbsp", nutrientRating: 2, alternatives: "Cacao powder for smoother texture. Carob for caffeine-free." },
    ],
    vitamins: [
      { name: "Iron", amount: "3mg", emoji: "🩸" },
      { name: "Protein", amount: "14g", emoji: "💪" },
      { name: "Magnesium", amount: "75mg", emoji: "⚡" },
      { name: "Vitamin C", amount: "40mg", emoji: "🍊" },
    ],
    whyThisWeek: "Blueberries are one of nature's highest antioxidant foods — they protect both your cells and baby's from oxidative stress during the intense growth of the third trimester. The almond butter adds the sustained protein energy you need now.",
    instructions: [
      "Add all ingredients to blender",
      "Blend until completely smooth, about 60 seconds",
      "Pour into a large glass",
      "Top with a few extra blueberries and cacao nibs",
      "Drink immediately for maximum antioxidant benefit",
    ],
  },

  // ══════════════════════════════════════════════
  // CROSS-TRIMESTER / FULL PREGNANCY
  // ══════════════════════════════════════════════

  {
    id: 'r9',
    title: "Prenatal Green Goddess Smoothie",
    emoji: "🥬",
    category: 'Smoothie',
    prepTime: 3,
    weekRange: [1, 40],
    ingredients: [
      { name: "Spinach", amount: "2 cups", nutrientRating: 3, alternatives: "Kale or Swiss chard. Frozen spinach is just as nutritious." },
      { name: "Banana", amount: "1 frozen", nutrientRating: 2, alternatives: "Mango for more vitamin C. Pear for a gentler flavour." },
      { name: "Almond butter", amount: "1 tbsp", nutrientRating: 2, alternatives: "Tahini or sunflower seed butter. Adds protein and healthy fats." },
      { name: "Coconut water", amount: "250ml", nutrientRating: 2, alternatives: "Plain water or oat milk. Coconut water provides natural electrolytes." },
      { name: "Ground flaxseed", amount: "1 tbsp", nutrientRating: 3, alternatives: "Chia seeds or hemp hearts for similar omega-3." },
    ],
    vitamins: [
      { name: "Folate", amount: "150mcg", emoji: "🧬" },
      { name: "Iron", amount: "4mg", emoji: "🩸" },
      { name: "Omega-3", amount: "1.6g", emoji: "🧠" },
      { name: "Potassium", amount: "500mg", emoji: "⚡" },
    ],
    whyThisWeek: "This all-trimester smoothie delivers folate, iron, omega-3, and potassium in every sip. It's the single most efficient way to pack multiple pregnancy-critical nutrients into 3 minutes of prep time.",
    instructions: [
      "Add spinach and coconut water to blender first",
      "Blend until spinach is fully broken down",
      "Add banana, almond butter, and flaxseed",
      "Blend until smooth and creamy",
      "Drink immediately — the folate degrades with time",
    ],
  },
  {
    id: 'r10',
    title: "Warming Turmeric Golden Milk",
    emoji: "🥛",
    category: 'Tea',
    prepTime: 5,
    weekRange: [1, 40],
    ingredients: [
      { name: "Coconut milk", amount: "250ml", nutrientRating: 2, alternatives: "Oat milk or almond milk. Cow's milk if tolerated well." },
      { name: "Turmeric", amount: "1 tsp", nutrientRating: 3, alternatives: "Fresh turmeric root grated is even more potent." },
      { name: "Cinnamon", amount: "½ tsp", nutrientRating: 1, alternatives: "Cardamom or ginger for different warming qualities." },
      { name: "Black pepper", amount: "pinch", nutrientRating: 1, alternatives: "Essential — increases turmeric absorption by 2000%. Don't skip this." },
      { name: "Raw honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Maple syrup or date syrup. Jaggery is traditional in Ayurveda." },
    ],
    vitamins: [
      { name: "Curcumin", amount: "200mg", emoji: "✨" },
      { name: "Calcium", amount: "40mg", emoji: "🦴" },
      { name: "Manganese", amount: "1mg", emoji: "🔬" },
    ],
    whyThisWeek: "Turmeric's curcumin is nature's most powerful anti-inflammatory compound. It supports healthy placental function, reduces pregnancy-related joint pain, and helps prevent gestational diabetes. Drink it warm before bed.",
    instructions: [
      "Warm coconut milk in a small saucepan over medium heat",
      "Add turmeric, cinnamon, and black pepper, whisk well",
      "Heat until just steaming — do not boil",
      "Pour into a mug and stir in honey",
      "Drink warm — this is a beautiful bedtime ritual",
    ],
  },
  {
    id: 'r11',
    title: "Energising Trail Mix Snack Box",
    emoji: "🥜",
    category: 'Snack',
    prepTime: 2,
    weekRange: [1, 40],
    ingredients: [
      { name: "Almonds", amount: "10", nutrientRating: 3, alternatives: "Cashews, pistachios, or macadamia nuts. Rotate weekly for variety." },
      { name: "Dried apricots", amount: "4", nutrientRating: 3, alternatives: "Dried figs, raisins, or goji berries. All provide natural iron." },
      { name: "Dark chocolate chips", amount: "1 tbsp", nutrientRating: 2, alternatives: "Cacao nibs for sugar-free. Carob chips for caffeine-free." },
      { name: "Pumpkin seeds", amount: "1 tbsp", nutrientRating: 3, alternatives: "Sunflower seeds or hemp hearts." },
    ],
    vitamins: [
      { name: "Iron", amount: "3mg", emoji: "🩸" },
      { name: "Magnesium", amount: "65mg", emoji: "⚡" },
      { name: "Zinc", amount: "2mg", emoji: "🔬" },
      { name: "Vitamin E", amount: "4mg", emoji: "✨" },
    ],
    whyThisWeek: "This snack box is your pregnancy emergency kit — keep it in your bag for energy dips, nausea prevention, and blood sugar stabilisation. The combination of protein, healthy fats, and natural sugars provides sustained energy for hours.",
    instructions: [
      "Measure all ingredients into a small container",
      "Mix gently",
      "Keep in your bag, desk, or bedside table",
      "Eat a small handful whenever energy dips",
      "Make 5 portions on Sunday for the whole week",
    ],
  },
  {
    id: 'r12',
    title: "Nourishing Chickpea & Sweet Potato Stew",
    emoji: "🍲",
    category: 'Dinner',
    prepTime: 20,
    weekRange: [1, 40],
    ingredients: [
      { name: "Chickpeas", amount: "1 cup cooked", nutrientRating: 3, alternatives: "White beans or lentils. Canned is perfectly nutritious." },
      { name: "Sweet potato", amount: "1 cubed", nutrientRating: 3, alternatives: "Butternut squash or pumpkin for similar nutrients." },
      { name: "Coconut milk", amount: "200ml", nutrientRating: 2, alternatives: "Tomato-based broth for a lighter version." },
      { name: "Spinach", amount: "2 cups", nutrientRating: 3, alternatives: "Kale or Swiss chard — add at the end to preserve nutrients." },
      { name: "Cumin & coriander", amount: "1 tsp each", nutrientRating: 1, alternatives: "Garam masala or curry powder for a more complex spice profile." },
    ],
    vitamins: [
      { name: "Iron", amount: "8mg", emoji: "🩸" },
      { name: "Folate", amount: "200mcg", emoji: "🧬" },
      { name: "Protein", amount: "16g", emoji: "💪" },
      { name: "B6", amount: "0.8mg", emoji: "🌿" },
      { name: "Vitamin C", amount: "30mg", emoji: "🍊" },
    ],
    whyThisWeek: "This stew delivers iron, folate, protein, and vitamin B6 in every spoonful — the four nutrients most commonly deficient in pregnancy. Make a big batch and eat it for days. Your body will thank you.",
    instructions: [
      "Sauté cumin and coriander in coconut oil for 1 minute",
      "Add cubed sweet potato and cook 5 minutes",
      "Pour in chickpeas and coconut milk, bring to simmer",
      "Cook 15 minutes until sweet potato is tender",
      "Stir in spinach, season with salt and lime juice",
    ],
  },

  // ══════════════════════════════════════════════
  // EXPANDED LIBRARY — T1 (weeks 1-13)
  // ══════════════════════════════════════════════
  {
    id: 'r30', title: "Folate Avocado & Egg Toast", emoji: "🥑", category: 'Breakfast', prepTime: 7, weekRange: [1, 13],
    ingredients: [
      { name: "Sourdough bread", amount: "1 slice", nutrientRating: 2, alternatives: "Rye, spelt, or gluten-free seeded bread." },
      { name: "Avocado", amount: "½", nutrientRating: 3, alternatives: "Hummus or white-bean mash for a different folate source." },
      { name: "Egg", amount: "1 soft-boiled", nutrientRating: 3, alternatives: "Marinated tofu slice or smoked salmon for omega-3." },
      { name: "Lemon juice", amount: "1 tsp", nutrientRating: 1, alternatives: "Apple cider vinegar or lime juice." },
      { name: "Chilli flakes", amount: "pinch", nutrientRating: 1, alternatives: "Black pepper or sumac." },
    ],
    vitamins: [
      { name: "Folate", amount: "120mcg", emoji: "🧬" }, { name: "Choline", amount: "150mg", emoji: "🧠" }, { name: "Protein", amount: "12g", emoji: "💪" },
    ],
    whyThisWeek: "Choline from the egg works hand-in-hand with folate to close baby's neural tube and build the hippocampus — the brain's memory centre. This pairing is one of the most powerful brain-protective breakfasts you can eat in early pregnancy.",
    instructions: ["Soft-boil the egg for 6 minutes, then cool in iced water", "Toast the sourdough until crisp", "Mash avocado with lemon juice and salt", "Spread on toast, top with peeled, halved egg", "Finish with chilli flakes and a drizzle of olive oil"],
  },
  {
    id: 'r31', title: "Baked Cinnamon Apple Oats", emoji: "🍎", category: 'Breakfast', prepTime: 10, weekRange: [1, 13],
    ingredients: [
      { name: "Rolled oats", amount: "½ cup", nutrientRating: 2, alternatives: "Quinoa flakes or buckwheat for gluten-free." },
      { name: "Apple", amount: "1 diced", nutrientRating: 2, alternatives: "Pear, peach, or stewed plums." },
      { name: "Cinnamon", amount: "1 tsp", nutrientRating: 2, alternatives: "Cardamom or vanilla bean." },
      { name: "Walnuts", amount: "2 tbsp", nutrientRating: 3, alternatives: "Pecans, almonds, or hemp hearts." },
      { name: "Oat milk", amount: "200ml", nutrientRating: 2, alternatives: "Coconut milk for richness." },
    ],
    vitamins: [
      { name: "Fibre", amount: "8g", emoji: "🌾" }, { name: "B6", amount: "0.4mg", emoji: "🌿" }, { name: "Omega-3", amount: "1.1g", emoji: "🧠" },
    ],
    whyThisWeek: "Soluble fibre from oats and pectin from apple ease the constipation that's already starting as progesterone slows digestion. The slow-burn carbs also stabilise blood sugar — a key driver of first-trimester nausea.",
    instructions: ["Combine oats, milk, half the apple, and cinnamon in a small oven dish", "Bake at 180°C for 20 minutes until set", "Top with remaining apple and walnuts", "Drizzle with maple syrup or honey", "Serve warm"],
  },
  {
    id: 'r32', title: "Sweet Potato Breakfast Hash", emoji: "🍠", category: 'Breakfast', prepTime: 15, weekRange: [1, 13],
    ingredients: [
      { name: "Sweet potato", amount: "1 medium, diced", nutrientRating: 3, alternatives: "Butternut squash or carrot." },
      { name: "Red pepper", amount: "½ diced", nutrientRating: 2, alternatives: "Courgette or mushrooms." },
      { name: "Egg", amount: "1", nutrientRating: 3, alternatives: "Scrambled tofu with turmeric." },
      { name: "Smoked paprika", amount: "½ tsp", nutrientRating: 1, alternatives: "Cumin or oregano." },
      { name: "Spinach", amount: "1 handful", nutrientRating: 2, alternatives: "Kale or rocket." },
    ],
    vitamins: [
      { name: "B6", amount: "0.6mg", emoji: "🌿" }, { name: "Vitamin C", amount: "90mg", emoji: "🍊" }, { name: "Beta-carotene", amount: "12mg", emoji: "🥕" },
    ],
    whyThisWeek: "Sweet potato is the single richest whole-food source of B6, the nutrient clinically proven to ease first-trimester nausea. Pepper's vitamin C helps you absorb the iron from spinach in the same pan.",
    instructions: ["Pan-fry sweet potato in olive oil for 8 minutes", "Add pepper and paprika, cook 4 minutes more", "Stir in spinach until just wilted", "Make a well, crack in the egg, cover and cook to taste", "Season and serve hot"],
  },
  {
    id: 'r33', title: "Ginger Pear Anti-Nausea Smoothie", emoji: "🍐", category: 'Smoothie', prepTime: 3, weekRange: [1, 13],
    ingredients: [
      { name: "Ripe pear", amount: "1", nutrientRating: 2, alternatives: "Apple or banana." },
      { name: "Fresh ginger", amount: "1 inch", nutrientRating: 3, alternatives: "Ginger powder ¼ tsp." },
      { name: "Coconut water", amount: "200ml", nutrientRating: 2, alternatives: "Plain water with a pinch of salt." },
      { name: "Greek yoghurt", amount: "½ cup", nutrientRating: 2, alternatives: "Coconut yoghurt or silken tofu." },
      { name: "Lemon juice", amount: "1 tsp", nutrientRating: 1, alternatives: "Lime juice." },
    ],
    vitamins: [
      { name: "B6", amount: "0.3mg", emoji: "🌿" }, { name: "Potassium", amount: "380mg", emoji: "⚡" }, { name: "Probiotics", amount: "1B CFU", emoji: "🦠" },
    ],
    whyThisWeek: "Pear's gentle sweetness settles a queasy stomach without spiking blood sugar. Ginger's gingerols act on the vagus nerve within minutes, and the electrolytes in coconut water rehydrate after morning sickness.",
    instructions: ["Peel and roughly chop the pear and ginger", "Add everything to a blender", "Blend on high for 45 seconds", "Pour into a tall glass", "Sip slowly — keep at bedside for morning"],
  },
  {
    id: 'r34', title: "Mango Mint Hydration Cooler", emoji: "🥭", category: 'Smoothie', prepTime: 3, weekRange: [1, 13],
    ingredients: [
      { name: "Frozen mango", amount: "1 cup", nutrientRating: 3, alternatives: "Pineapple or papaya." },
      { name: "Fresh mint", amount: "8 leaves", nutrientRating: 2, alternatives: "Basil or lemon balm." },
      { name: "Coconut water", amount: "250ml", nutrientRating: 2, alternatives: "Watermelon juice." },
      { name: "Lime", amount: "½ squeezed", nutrientRating: 2, alternatives: "Lemon." },
    ],
    vitamins: [
      { name: "Vitamin C", amount: "65mg", emoji: "🍊" }, { name: "Vitamin A", amount: "1800IU", emoji: "👁️" }, { name: "Electrolytes", amount: "—", emoji: "⚡" },
    ],
    whyThisWeek: "First-trimester dehydration is sneaky — even mild fluid loss intensifies fatigue and nausea. This cooler rehydrates with natural electrolytes while the cool mint settles the stomach.",
    instructions: ["Blend mango, mint, coconut water, and lime", "Taste and adjust lime", "Pour over ice", "Garnish with a mint sprig", "Drink within minutes for the brightest flavour"],
  },
  {
    id: 'r35', title: "Rosemary Chickpea Crackers", emoji: "🌾", category: 'Snack', prepTime: 20, weekRange: [1, 13],
    ingredients: [
      { name: "Chickpea flour", amount: "1 cup", nutrientRating: 3, alternatives: "Lentil flour or whole-wheat flour." },
      { name: "Olive oil", amount: "3 tbsp", nutrientRating: 2, alternatives: "Avocado oil." },
      { name: "Fresh rosemary", amount: "1 tbsp chopped", nutrientRating: 1, alternatives: "Thyme or oregano." },
      { name: "Sea salt", amount: "½ tsp", nutrientRating: 1, alternatives: "Smoked salt." },
    ],
    vitamins: [
      { name: "Folate", amount: "100mcg", emoji: "🧬" }, { name: "Iron", amount: "3mg", emoji: "🩸" }, { name: "Protein", amount: "7g", emoji: "💪" },
    ],
    whyThisWeek: "When toast feels like the only thing you can stomach, these crackers smuggle real folate and iron into a salty, savoury snack — perfect for the gentle-flavour cravings of weeks 6–10.",
    instructions: ["Whisk chickpea flour with 90ml water, olive oil, rosemary, and salt", "Spread thinly on a parchment-lined tray", "Bake at 200°C for 15 minutes until crisp", "Cool then break into shards", "Store in an airtight jar for up to a week"],
  },
  {
    id: 'r36', title: "Hummus & Cucumber Boats", emoji: "🥒", category: 'Snack', prepTime: 5, weekRange: [1, 13],
    ingredients: [
      { name: "Hummus", amount: "½ cup", nutrientRating: 3, alternatives: "White-bean dip or baba ganoush." },
      { name: "Cucumber", amount: "1, halved lengthwise", nutrientRating: 2, alternatives: "Celery sticks or endive leaves." },
      { name: "Cherry tomatoes", amount: "6, halved", nutrientRating: 2, alternatives: "Diced red pepper." },
      { name: "Sumac", amount: "pinch", nutrientRating: 1, alternatives: "Smoked paprika or za'atar." },
    ],
    vitamins: [
      { name: "Folate", amount: "85mcg", emoji: "🧬" }, { name: "Protein", amount: "8g", emoji: "💪" }, { name: "Hydration", amount: "high", emoji: "💧" },
    ],
    whyThisWeek: "Cool, crunchy, and salt-balanced — exactly what early pregnancy taste buds want. The chickpeas deliver folate without any cooking smells that might trigger nausea.",
    instructions: ["Scoop seeds from cucumber halves", "Fill the troughs with hummus", "Press cherry tomatoes into the hummus", "Dust with sumac and drizzle olive oil", "Cut into bite-size pieces"],
  },
  {
    id: 'r37', title: "Raspberry Coconut Yoghurt Parfait", emoji: "🍓", category: 'Snack', prepTime: 4, weekRange: [1, 13],
    ingredients: [
      { name: "Coconut yoghurt", amount: "¾ cup", nutrientRating: 2, alternatives: "Greek yoghurt or skyr." },
      { name: "Raspberries", amount: "½ cup", nutrientRating: 3, alternatives: "Strawberries or blackberries." },
      { name: "Granola", amount: "3 tbsp", nutrientRating: 2, alternatives: "Crushed walnuts or hemp seeds." },
      { name: "Chia seeds", amount: "1 tsp", nutrientRating: 2, alternatives: "Flax or sesame seeds." },
    ],
    vitamins: [
      { name: "Vitamin C", amount: "30mg", emoji: "🍊" }, { name: "Probiotics", amount: "2B CFU", emoji: "🦠" }, { name: "Omega-3", amount: "0.9g", emoji: "🧠" },
    ],
    whyThisWeek: "Probiotic foods early in pregnancy build the maternal microbiome baby will inherit at birth. The vitamin C from raspberries also primes iron absorption from any greens or beans eaten later in the day.",
    instructions: ["Layer half the yoghurt in a glass", "Add half the berries and granola", "Repeat layers", "Top with chia seeds", "Eat immediately or chill for an hour"],
  },
  {
    id: 'r38', title: "Lemon Ginger Miso Soup", emoji: "🍜", category: 'Dinner', prepTime: 10, weekRange: [1, 13],
    ingredients: [
      { name: "White miso paste", amount: "2 tbsp", nutrientRating: 3, alternatives: "Chickpea miso for soy-free." },
      { name: "Silken tofu", amount: "150g cubed", nutrientRating: 3, alternatives: "Cooked white beans or shredded chicken." },
      { name: "Fresh ginger", amount: "1 tbsp grated", nutrientRating: 3, alternatives: "Ginger powder ½ tsp." },
      { name: "Wakame seaweed", amount: "1 tbsp dried", nutrientRating: 3, alternatives: "Spinach or chard." },
      { name: "Lemon juice", amount: "1 tbsp", nutrientRating: 2, alternatives: "Rice vinegar." },
    ],
    vitamins: [
      { name: "Iodine", amount: "120mcg", emoji: "🌊" }, { name: "Probiotics", amount: "1B CFU", emoji: "🦠" }, { name: "Protein", amount: "14g", emoji: "💪" },
    ],
    whyThisWeek: "Iodine demand jumps 50% in the first trimester to build baby's thyroid — and a baby's first thyroid hormones determine IQ. Sea vegetables are the most reliable, gentle iodine source.",
    instructions: ["Soak wakame in 600ml warm water for 5 minutes", "Bring water and wakame to a gentle simmer", "Turn off heat, whisk miso in (never boil miso)", "Add tofu and ginger", "Finish with lemon juice and serve"],
  },
  {
    id: 'r39', title: "White Bean & Tomato Stew", emoji: "🍲", category: 'Dinner', prepTime: 20, weekRange: [1, 13],
    ingredients: [
      { name: "Cannellini beans", amount: "1 can", nutrientRating: 3, alternatives: "Butter beans or chickpeas." },
      { name: "Tomato passata", amount: "400ml", nutrientRating: 2, alternatives: "Fresh tomatoes blended." },
      { name: "Garlic", amount: "3 cloves", nutrientRating: 2, alternatives: "Leek for milder flavour." },
      { name: "Rosemary", amount: "1 sprig", nutrientRating: 1, alternatives: "Thyme or oregano." },
      { name: "Baby spinach", amount: "2 cups", nutrientRating: 3, alternatives: "Kale or chard." },
    ],
    vitamins: [
      { name: "Folate", amount: "260mcg", emoji: "🧬" }, { name: "Iron", amount: "7mg", emoji: "🩸" }, { name: "Lycopene", amount: "12mg", emoji: "🍅" },
    ],
    whyThisWeek: "A one-pot iron-and-folate workhorse that doubles down on neural-tube protection in the window when it matters most. Cooked tomato's lycopene is a powerful placental antioxidant.",
    instructions: ["Sauté garlic and rosemary in olive oil 2 minutes", "Add passata and beans, simmer 12 minutes", "Stir in spinach until wilted", "Season generously, finish with olive oil", "Serve with sourdough"],
  },
  {
    id: 'r40', title: "Gentle Pumpkin Lentil Curry", emoji: "🎃", category: 'Dinner', prepTime: 25, weekRange: [1, 13],
    ingredients: [
      { name: "Red lentils", amount: "¾ cup", nutrientRating: 3, alternatives: "Yellow split peas or mung dal." },
      { name: "Pumpkin", amount: "2 cups cubed", nutrientRating: 3, alternatives: "Butternut squash or sweet potato." },
      { name: "Coconut milk", amount: "200ml", nutrientRating: 2, alternatives: "Cashew cream." },
      { name: "Mild curry powder", amount: "1 tbsp", nutrientRating: 1, alternatives: "Garam masala (use less)." },
      { name: "Lime", amount: "½ squeezed", nutrientRating: 2, alternatives: "Lemon." },
    ],
    vitamins: [
      { name: "Iron", amount: "10mg", emoji: "🩸" }, { name: "Beta-carotene", amount: "14mg", emoji: "🥕" }, { name: "Folate", amount: "200mcg", emoji: "🧬" },
    ],
    whyThisWeek: "Mildly spiced and naturally sweet — gentle on a queasy stomach while delivering the iron and folate your body is screaming for as blood volume begins its climb.",
    instructions: ["Bloom curry powder in coconut oil 1 minute", "Add pumpkin and lentils, stir to coat", "Pour in coconut milk and 500ml water", "Simmer 20 minutes until everything is soft", "Finish with lime juice and salt"],
  },
  {
    id: 'r41', title: "Peppermint Nausea Tea", emoji: "🌿", category: 'Tea', prepTime: 4, weekRange: [1, 13],
    ingredients: [
      { name: "Fresh peppermint", amount: "10 leaves", nutrientRating: 3, alternatives: "Dried peppermint 1 tsp or spearmint." },
      { name: "Lemon slice", amount: "1", nutrientRating: 1, alternatives: "Cucumber slice." },
      { name: "Raw honey", amount: "1 tsp optional", nutrientRating: 1, alternatives: "Leave plain." },
    ],
    vitamins: [
      { name: "Menthol", amount: "active", emoji: "🌿" }, { name: "Vitamin C", amount: "8mg", emoji: "🍊" },
    ],
    whyThisWeek: "Peppermint's menthol relaxes the smooth muscle of the stomach lining and quiets nausea signals, often within minutes. A pregnancy-safe rescue brew for the wave of queasiness between meals.",
    instructions: ["Crush mint leaves lightly in your hand", "Place in a mug with lemon slice", "Pour over 300ml just-boiled water", "Steep 5 minutes covered", "Add honey if desired and sip warm"],
  },
  {
    id: 'r42', title: "Lemon Balm Calm Tea", emoji: "🍋", category: 'Tea', prepTime: 5, weekRange: [1, 13],
    ingredients: [
      { name: "Dried lemon balm", amount: "1 tbsp", nutrientRating: 3, alternatives: "Fresh lemon balm 2 tbsp or chamomile." },
      { name: "Lavender buds", amount: "½ tsp", nutrientRating: 2, alternatives: "Rose petals or skip." },
      { name: "Honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Maple syrup or none." },
    ],
    vitamins: [
      { name: "Rosmarinic acid", amount: "active", emoji: "🌿" }, { name: "Magnesium", amount: "12mg", emoji: "⚡" },
    ],
    whyThisWeek: "Hormonal anxiety is real in the first trimester. Lemon balm has well-documented anxiolytic effects without any sedation — safe to sip morning or night when your nervous system needs a pause.",
    instructions: ["Place herbs in a teapot", "Pour over 350ml just-off-boil water", "Steep covered 8 minutes", "Strain into a mug", "Sweeten if desired and sip slowly"],
  },

  // ══════════════════════════════════════════════
  // EXPANDED LIBRARY — T2 (weeks 14-26)
  // ══════════════════════════════════════════════
  {
    id: 'r43', title: "Smoked Salmon Avocado Toast", emoji: "🐟", category: 'Breakfast', prepTime: 6, weekRange: [14, 26],
    ingredients: [
      { name: "Sourdough", amount: "1 slice", nutrientRating: 2, alternatives: "Rye or pumpernickel." },
      { name: "Smoked salmon", amount: "50g", nutrientRating: 3, alternatives: "Smoked trout or sardines." },
      { name: "Avocado", amount: "½", nutrientRating: 2, alternatives: "Cream cheese or hummus." },
      { name: "Capers", amount: "1 tsp", nutrientRating: 1, alternatives: "Chopped dill pickle." },
      { name: "Dill", amount: "1 tbsp fresh", nutrientRating: 1, alternatives: "Chives or parsley." },
    ],
    vitamins: [
      { name: "DHA", amount: "0.9g", emoji: "🧠" }, { name: "Vitamin D", amount: "300IU", emoji: "☀️" }, { name: "Protein", amount: "18g", emoji: "💪" },
    ],
    whyThisWeek: "Baby's brain is gaining 250,000 neurons a minute — DHA is the structural fat those neurons need. Cold-smoked salmon (chilled, from a reputable source) is a safe, delicious twice-a-week pregnancy staple.",
    instructions: ["Toast sourdough until crisp", "Mash avocado with lemon and salt", "Spread on toast", "Drape over salmon, scatter capers and dill", "Finish with cracked pepper"],
  },
  {
    id: 'r44', title: "Cottage Cheese Berry Bowl", emoji: "🫐", category: 'Breakfast', prepTime: 4, weekRange: [14, 26],
    ingredients: [
      { name: "Cottage cheese", amount: "¾ cup", nutrientRating: 3, alternatives: "Ricotta or thick Greek yoghurt." },
      { name: "Mixed berries", amount: "1 cup", nutrientRating: 3, alternatives: "Sliced peach or fig." },
      { name: "Granola", amount: "2 tbsp", nutrientRating: 2, alternatives: "Toasted oats or pecans." },
      { name: "Almond butter", amount: "1 tbsp", nutrientRating: 2, alternatives: "Tahini or sunflower butter." },
    ],
    vitamins: [
      { name: "Calcium", amount: "220mg", emoji: "🦴" }, { name: "Protein", amount: "22g", emoji: "💪" }, { name: "Vitamin C", amount: "40mg", emoji: "🍊" },
    ],
    whyThisWeek: "Baby's skeleton is mineralising rapidly. Cottage cheese delivers a hefty calcium plus protein dose that keeps blood sugar stable through the morning — no mid-morning crash, no sugar craving.",
    instructions: ["Spoon cottage cheese into a bowl", "Top with berries", "Sprinkle granola", "Drizzle almond butter", "Add a pinch of cinnamon"],
  },
  {
    id: 'r45', title: "Beetroot Orange Power Smoothie", emoji: "🥤", category: 'Smoothie', prepTime: 4, weekRange: [14, 26],
    ingredients: [
      { name: "Cooked beetroot", amount: "1 small", nutrientRating: 3, alternatives: "Raw grated beet or pomegranate juice." },
      { name: "Orange", amount: "1 peeled", nutrientRating: 3, alternatives: "Mandarin or grapefruit." },
      { name: "Greek yoghurt", amount: "½ cup", nutrientRating: 2, alternatives: "Coconut yoghurt." },
      { name: "Ginger", amount: "1 inch", nutrientRating: 2, alternatives: "Pinch of cinnamon." },
      { name: "Chia seeds", amount: "1 tbsp", nutrientRating: 2, alternatives: "Flaxseed." },
    ],
    vitamins: [
      { name: "Folate", amount: "150mcg", emoji: "🧬" }, { name: "Nitrates", amount: "high", emoji: "❤️" }, { name: "Vitamin C", amount: "110mg", emoji: "🍊" },
    ],
    whyThisWeek: "Beetroot's natural nitrates open blood vessels and lower the rising blood pressure of mid-pregnancy. Orange's vitamin C makes the iron from the beet and yoghurt's calcium maximally absorbable.",
    instructions: ["Add all ingredients to a blender", "Blend on high 60 seconds", "Pour over ice", "Top with chia seeds", "Drink within 15 minutes"],
  },
  {
    id: 'r46', title: "Calcium Green Goddess Smoothie", emoji: "🥬", category: 'Smoothie', prepTime: 3, weekRange: [14, 26],
    ingredients: [
      { name: "Kale", amount: "1 cup", nutrientRating: 3, alternatives: "Collard greens or spinach." },
      { name: "Frozen pineapple", amount: "1 cup", nutrientRating: 2, alternatives: "Frozen mango." },
      { name: "Fortified plant milk", amount: "250ml", nutrientRating: 3, alternatives: "Cow's milk." },
      { name: "Tahini", amount: "1 tbsp", nutrientRating: 3, alternatives: "Almond butter." },
      { name: "Banana", amount: "1", nutrientRating: 2, alternatives: "Avocado." },
    ],
    vitamins: [
      { name: "Calcium", amount: "350mg", emoji: "🦴" }, { name: "Vitamin K", amount: "150mcg", emoji: "🌿" }, { name: "Magnesium", amount: "60mg", emoji: "⚡" },
    ],
    whyThisWeek: "Three of the best plant-based calcium sources in one glass. Pineapple's vitamin C improves absorption, and the calcium goes straight to the skeleton baby is building this trimester.",
    instructions: ["Add kale and milk to blender first", "Blend until liquid is bright green", "Add remaining ingredients", "Blend until creamy", "Drink fresh"],
  },
  {
    id: 'r47', title: "Almond Date Energy Balls", emoji: "🌰", category: 'Snack', prepTime: 10, weekRange: [14, 26],
    ingredients: [
      { name: "Medjool dates", amount: "8 pitted", nutrientRating: 3, alternatives: "Dried figs." },
      { name: "Almonds", amount: "½ cup", nutrientRating: 3, alternatives: "Walnuts or cashews." },
      { name: "Oats", amount: "¼ cup", nutrientRating: 2, alternatives: "Buckwheat groats." },
      { name: "Cacao", amount: "1 tbsp", nutrientRating: 2, alternatives: "Carob powder." },
      { name: "Sea salt", amount: "pinch", nutrientRating: 1, alternatives: "Vanilla extract." },
    ],
    vitamins: [
      { name: "Iron", amount: "3mg", emoji: "🩸" }, { name: "Magnesium", amount: "70mg", emoji: "⚡" }, { name: "Protein", amount: "6g", emoji: "💪" },
    ],
    whyThisWeek: "Mid-pregnancy energy needs jump. These bites give you sustained fuel from dates' natural sugars plus the slow-release protein and magnesium your muscles crave as baby grows heavier.",
    instructions: ["Pulse almonds in a food processor until coarse", "Add the rest, process until it clumps", "Roll into 14 balls", "Chill 30 minutes", "Store in the fridge up to a week"],
  },
  {
    id: 'r48', title: "Yoghurt Cucumber Tzatziki Plate", emoji: "🥒", category: 'Snack', prepTime: 6, weekRange: [14, 26],
    ingredients: [
      { name: "Greek yoghurt", amount: "1 cup", nutrientRating: 3, alternatives: "Coconut yoghurt with lemon." },
      { name: "Cucumber", amount: "½ grated", nutrientRating: 2, alternatives: "Courgette grated." },
      { name: "Garlic", amount: "1 clove", nutrientRating: 1, alternatives: "Chives or skip." },
      { name: "Pitta bread", amount: "1", nutrientRating: 2, alternatives: "Carrot sticks or seeded crackers." },
      { name: "Olives", amount: "6", nutrientRating: 2, alternatives: "Sun-dried tomatoes." },
    ],
    vitamins: [
      { name: "Calcium", amount: "260mg", emoji: "🦴" }, { name: "Probiotics", amount: "3B CFU", emoji: "🦠" }, { name: "Protein", amount: "16g", emoji: "💪" },
    ],
    whyThisWeek: "A cooling, mineral-rich snack that hydrates and calms heartburn — which often starts around week 20. Probiotics here also support baby's gut microbiome through the placenta.",
    instructions: ["Squeeze water out of grated cucumber", "Mix with yoghurt, crushed garlic, salt, and dill", "Drizzle with olive oil", "Warm pitta and cut into triangles", "Serve with olives on the side"],
  },
  {
    id: 'r49', title: "Magnesium Nut & Seed Clusters", emoji: "🍫", category: 'Snack', prepTime: 12, weekRange: [14, 26],
    ingredients: [
      { name: "Dark chocolate 85%", amount: "100g", nutrientRating: 3, alternatives: "Carob chips for caffeine-free." },
      { name: "Almonds", amount: "¼ cup", nutrientRating: 3, alternatives: "Cashews or hazelnuts." },
      { name: "Pumpkin seeds", amount: "¼ cup", nutrientRating: 3, alternatives: "Sunflower seeds." },
      { name: "Dried cranberries", amount: "2 tbsp", nutrientRating: 2, alternatives: "Goji berries or raisins." },
      { name: "Sea salt flakes", amount: "pinch", nutrientRating: 1, alternatives: "Skip." },
    ],
    vitamins: [
      { name: "Magnesium", amount: "120mg", emoji: "⚡" }, { name: "Iron", amount: "4mg", emoji: "🩸" }, { name: "Zinc", amount: "3mg", emoji: "🔬" },
    ],
    whyThisWeek: "Leg cramps and restless legs begin in T2 — both signs of climbing magnesium demand. Dark chocolate is one of the highest food sources, paired here with the seed minerals your nervous system needs.",
    instructions: ["Melt chocolate over a bain-marie", "Stir in nuts, seeds, and cranberries", "Spoon clusters onto parchment", "Sprinkle salt flakes", "Set in the fridge 20 minutes"],
  },
  {
    id: 'r50', title: "Sweet Potato Black Bean Tacos", emoji: "🌮", category: 'Dinner', prepTime: 20, weekRange: [14, 26],
    ingredients: [
      { name: "Sweet potato", amount: "1 large cubed", nutrientRating: 3, alternatives: "Butternut squash." },
      { name: "Black beans", amount: "1 cup", nutrientRating: 3, alternatives: "Pinto or kidney beans." },
      { name: "Corn tortillas", amount: "4", nutrientRating: 2, alternatives: "Lettuce wraps." },
      { name: "Avocado", amount: "1 sliced", nutrientRating: 2, alternatives: "Guacamole." },
      { name: "Lime & coriander", amount: "to serve", nutrientRating: 2, alternatives: "Lemon and parsley." },
    ],
    vitamins: [
      { name: "Iron", amount: "7mg", emoji: "🩸" }, { name: "Folate", amount: "200mcg", emoji: "🧬" }, { name: "Beta-carotene", amount: "10mg", emoji: "🥕" },
    ],
    whyThisWeek: "Iron and folate stay top-priority in mid-pregnancy. Sweet potato's vitamin A is critical for baby's lungs and eyes, and lime's vitamin C makes the bean iron beautifully absorbable.",
    instructions: ["Roast sweet potato at 220°C for 18 minutes", "Warm beans with cumin and garlic", "Heat tortillas 30 seconds each side", "Fill with sweet potato, beans, avocado", "Top with coriander and a big squeeze of lime"],
  },
  {
    id: 'r51', title: "Sardine Lemon Pasta", emoji: "🍝", category: 'Dinner', prepTime: 15, weekRange: [14, 26],
    ingredients: [
      { name: "Wholemeal spaghetti", amount: "100g", nutrientRating: 2, alternatives: "Gluten-free pasta or courgette noodles." },
      { name: "Sardines in oil", amount: "1 tin", nutrientRating: 3, alternatives: "Mackerel or anchovies." },
      { name: "Garlic", amount: "2 cloves", nutrientRating: 2, alternatives: "Leek." },
      { name: "Lemon zest & juice", amount: "1", nutrientRating: 2, alternatives: "Preserved lemon." },
      { name: "Parsley", amount: "handful chopped", nutrientRating: 2, alternatives: "Rocket or basil." },
    ],
    vitamins: [
      { name: "DHA", amount: "1.4g", emoji: "🧠" }, { name: "Calcium", amount: "210mg", emoji: "🦴" }, { name: "Vitamin D", amount: "280IU", emoji: "☀️" },
    ],
    whyThisWeek: "A pregnancy power-dinner: sardine bones provide bioavailable calcium, the fish itself is one of the lowest-mercury seafoods, and DHA is feeding the explosion of baby's brain growth.",
    instructions: ["Cook pasta in salted water", "Sizzle garlic in sardine oil 1 minute", "Add sardines and break up gently", "Toss with pasta, lemon, and parsley", "Finish with a splash of pasta water and olive oil"],
  },
  {
    id: 'r52', title: "Sesame Broccoli Tofu Stir-Fry", emoji: "🥦", category: 'Dinner', prepTime: 15, weekRange: [14, 26],
    ingredients: [
      { name: "Firm tofu", amount: "200g cubed", nutrientRating: 3, alternatives: "Tempeh or chicken thigh." },
      { name: "Broccoli", amount: "1 head florets", nutrientRating: 3, alternatives: "Tenderstem or pak choi." },
      { name: "Tamari", amount: "2 tbsp", nutrientRating: 1, alternatives: "Coconut aminos." },
      { name: "Sesame seeds", amount: "2 tbsp", nutrientRating: 3, alternatives: "Pumpkin seeds." },
      { name: "Ginger & garlic", amount: "1 inch + 2 cloves", nutrientRating: 2, alternatives: "Chilli for warmth." },
    ],
    vitamins: [
      { name: "Calcium", amount: "320mg", emoji: "🦴" }, { name: "Vitamin K", amount: "120mcg", emoji: "🌿" }, { name: "Protein", amount: "24g", emoji: "💪" },
    ],
    whyThisWeek: "Sesame and tofu are both calcium superstars, and broccoli's vitamin K helps that calcium land in baby's growing bones rather than your arteries. A clean plant-based powerhouse.",
    instructions: ["Sear tofu in sesame oil until golden, set aside", "Stir-fry broccoli with ginger and garlic 4 minutes", "Return tofu, add tamari", "Toss with sesame seeds", "Serve over brown rice"],
  },
  {
    id: 'r53', title: "Kale Quinoa Power Salad", emoji: "🥗", category: 'Dinner', prepTime: 18, weekRange: [14, 26],
    ingredients: [
      { name: "Quinoa", amount: "¾ cup dry", nutrientRating: 3, alternatives: "Buckwheat or millet." },
      { name: "Kale", amount: "2 cups massaged", nutrientRating: 3, alternatives: "Spinach or rocket." },
      { name: "Roasted chickpeas", amount: "1 cup", nutrientRating: 3, alternatives: "White beans." },
      { name: "Pomegranate seeds", amount: "¼ cup", nutrientRating: 2, alternatives: "Dried cranberries." },
      { name: "Tahini lemon dressing", amount: "3 tbsp", nutrientRating: 3, alternatives: "Olive oil + lemon." },
    ],
    vitamins: [
      { name: "Iron", amount: "9mg", emoji: "🩸" }, { name: "Folate", amount: "210mcg", emoji: "🧬" }, { name: "Protein", amount: "20g", emoji: "💪" },
    ],
    whyThisWeek: "Complete plant protein, plant iron, and folate in a single bowl — exactly what your expanding blood volume demands. Massaging the kale makes it gentle on a tender stomach.",
    instructions: ["Cook quinoa per packet", "Massage kale with olive oil, salt, and lemon", "Toss everything together", "Drizzle tahini dressing", "Top with pomegranate seeds"],
  },
  {
    id: 'r54', title: "Ginger Turmeric Latte", emoji: "☕", category: 'Tea', prepTime: 6, weekRange: [14, 26],
    ingredients: [
      { name: "Oat milk", amount: "250ml", nutrientRating: 2, alternatives: "Coconut or almond milk." },
      { name: "Fresh turmeric", amount: "1 inch grated", nutrientRating: 3, alternatives: "1 tsp ground turmeric." },
      { name: "Fresh ginger", amount: "1 inch grated", nutrientRating: 2, alternatives: "Ginger powder." },
      { name: "Black pepper", amount: "pinch", nutrientRating: 1, alternatives: "Essential — don't skip." },
      { name: "Honey", amount: "1 tsp", nutrientRating: 1, alternatives: "Maple syrup." },
    ],
    vitamins: [
      { name: "Curcumin", amount: "180mg", emoji: "✨" }, { name: "Calcium", amount: "180mg", emoji: "🦴" },
    ],
    whyThisWeek: "Mid-pregnancy joint and back stiffness responds beautifully to curcumin's anti-inflammatory action. The black pepper boosts absorption by 2000% — non-negotiable for the latte to actually work.",
    instructions: ["Warm milk gently", "Whisk in turmeric, ginger, and pepper", "Heat until just steaming", "Strain into a mug", "Stir in honey and sip slowly"],
  },

  // ══════════════════════════════════════════════
  // EXPANDED LIBRARY — T3 (weeks 27-40)
  // ══════════════════════════════════════════════
  {
    id: 'r55', title: "Date Tahini Overnight Oats", emoji: "🥣", category: 'Breakfast', prepTime: 5, weekRange: [27, 40],
    ingredients: [
      { name: "Rolled oats", amount: "½ cup", nutrientRating: 2, alternatives: "Quinoa flakes." },
      { name: "Medjool dates", amount: "3 chopped", nutrientRating: 3, alternatives: "Dried figs." },
      { name: "Tahini", amount: "2 tbsp", nutrientRating: 3, alternatives: "Almond butter." },
      { name: "Oat milk", amount: "200ml", nutrientRating: 2, alternatives: "Coconut milk." },
      { name: "Cinnamon", amount: "½ tsp", nutrientRating: 1, alternatives: "Cardamom." },
    ],
    vitamins: [
      { name: "Iron", amount: "4mg", emoji: "🩸" }, { name: "Calcium", amount: "180mg", emoji: "🦴" }, { name: "Magnesium", amount: "90mg", emoji: "⚡" },
    ],
    whyThisWeek: "Dates from week 36 are clinically proven to shorten labour and improve cervical ripeness. Tahini layers on calcium and the slow-release energy your big-belly mornings need.",
    instructions: ["Combine everything in a jar", "Stir well, cover, refrigerate overnight", "Top with extra date pieces", "Add a drizzle of tahini", "Eat cold or warm gently"],
  },
  {
    id: 'r56', title: "Oat Banana Protein Pancakes", emoji: "🥞", category: 'Breakfast', prepTime: 12, weekRange: [27, 40],
    ingredients: [
      { name: "Rolled oats", amount: "1 cup", nutrientRating: 2, alternatives: "Buckwheat flour." },
      { name: "Banana", amount: "1 ripe", nutrientRating: 2, alternatives: "Apple sauce." },
      { name: "Egg", amount: "2", nutrientRating: 3, alternatives: "Flax eggs." },
      { name: "Greek yoghurt", amount: "½ cup", nutrientRating: 3, alternatives: "Coconut yoghurt." },
      { name: "Cinnamon", amount: "1 tsp", nutrientRating: 1, alternatives: "Vanilla." },
    ],
    vitamins: [
      { name: "Protein", amount: "26g", emoji: "💪" }, { name: "Calcium", amount: "200mg", emoji: "🦴" }, { name: "Choline", amount: "250mg", emoji: "🧠" },
    ],
    whyThisWeek: "Baby's brain is making its final wave of choline-dependent connections. These pancakes deliver a serious protein and choline punch in food that feels like a treat.",
    instructions: ["Blend oats into flour", "Add banana, eggs, yoghurt, cinnamon — blend smooth", "Cook small pancakes in a non-stick pan", "Flip when bubbles form", "Serve with berries and maple syrup"],
  },
  {
    id: 'r57', title: "Coconut Rice Porridge", emoji: "🍚", category: 'Breakfast', prepTime: 18, weekRange: [27, 40],
    ingredients: [
      { name: "Jasmine rice", amount: "½ cup", nutrientRating: 2, alternatives: "Arborio rice for creamier." },
      { name: "Coconut milk", amount: "250ml", nutrientRating: 3, alternatives: "Whole milk." },
      { name: "Cardamom pods", amount: "3", nutrientRating: 2, alternatives: "Cinnamon stick." },
      { name: "Mango", amount: "½ diced", nutrientRating: 2, alternatives: "Papaya or banana." },
      { name: "Toasted coconut", amount: "1 tbsp", nutrientRating: 2, alternatives: "Almonds." },
    ],
    vitamins: [
      { name: "Easy carbs", amount: "—", emoji: "🌾" }, { name: "Electrolytes", amount: "—", emoji: "⚡" }, { name: "Vitamin C", amount: "30mg", emoji: "🍊" },
    ],
    whyThisWeek: "Gentle, soothing, easy to digest when heartburn rules. This porridge is the Ayurvedic kitchari of pregnancy — nourishment without taxing your now-compressed digestive system.",
    instructions: ["Simmer rice in coconut milk and 200ml water with cardamom", "Stir often, 15 minutes until creamy", "Spoon into a bowl", "Top with mango and toasted coconut", "Add a touch of honey if desired"],
  },
  {
    id: 'r58', title: "Pregnancy Cherry Magnesium Smoothie", emoji: "🍒", category: 'Smoothie', prepTime: 3, weekRange: [27, 40],
    ingredients: [
      { name: "Frozen cherries", amount: "1 cup", nutrientRating: 3, alternatives: "Frozen blueberries." },
      { name: "Banana", amount: "1", nutrientRating: 2, alternatives: "Avocado." },
      { name: "Almond butter", amount: "2 tbsp", nutrientRating: 3, alternatives: "Cashew butter." },
      { name: "Oat milk", amount: "250ml", nutrientRating: 2, alternatives: "Coconut milk." },
      { name: "Cacao powder", amount: "1 tbsp", nutrientRating: 2, alternatives: "Carob." },
    ],
    vitamins: [
      { name: "Magnesium", amount: "110mg", emoji: "⚡" }, { name: "Melatonin", amount: "active", emoji: "🌙" }, { name: "Protein", amount: "12g", emoji: "💪" },
    ],
    whyThisWeek: "Tart cherries are nature's highest source of melatonin — a gentle, food-based way to support the sleep that disappears in late pregnancy. Magnesium relaxes leg cramps too.",
    instructions: ["Blend everything until creamy", "Pour into a glass", "Sprinkle cacao on top", "Drink 1–2 hours before bed", "Magic for restless nights"],
  },
  {
    id: 'r59', title: "Pumpkin Spice Calcium Smoothie", emoji: "🎃", category: 'Smoothie', prepTime: 4, weekRange: [27, 40],
    ingredients: [
      { name: "Pumpkin purée", amount: "½ cup", nutrientRating: 3, alternatives: "Cooked sweet potato." },
      { name: "Greek yoghurt", amount: "½ cup", nutrientRating: 3, alternatives: "Coconut yoghurt." },
      { name: "Fortified milk", amount: "200ml", nutrientRating: 3, alternatives: "Soy milk." },
      { name: "Pumpkin pie spice", amount: "1 tsp", nutrientRating: 1, alternatives: "Cinnamon + ginger." },
      { name: "Maple syrup", amount: "1 tbsp", nutrientRating: 1, alternatives: "Honey." },
    ],
    vitamins: [
      { name: "Calcium", amount: "400mg", emoji: "🦴" }, { name: "Vitamin A", amount: "8000IU", emoji: "👁️" }, { name: "Protein", amount: "18g", emoji: "💪" },
    ],
    whyThisWeek: "Baby's bones harden quickly in T3 and will pull calcium from you if your intake falls short. This smoothie packs half a day's calcium in one cosy glass.",
    instructions: ["Blend all ingredients until silky", "Pour over ice", "Top with a pinch of cinnamon", "Drink as a snack between meals", "Adds 18g protein effortlessly"],
  },
  {
    id: 'r60', title: "Berry Beet Iron Smoothie", emoji: "🍓", category: 'Smoothie', prepTime: 4, weekRange: [27, 40],
    ingredients: [
      { name: "Cooked beetroot", amount: "1", nutrientRating: 3, alternatives: "Pomegranate juice." },
      { name: "Frozen strawberries", amount: "1 cup", nutrientRating: 3, alternatives: "Mixed berries." },
      { name: "Spinach", amount: "1 handful", nutrientRating: 3, alternatives: "Kale." },
      { name: "Orange juice", amount: "200ml fresh", nutrientRating: 3, alternatives: "Pineapple juice." },
      { name: "Ground flax", amount: "1 tbsp", nutrientRating: 2, alternatives: "Chia seeds." },
    ],
    vitamins: [
      { name: "Iron", amount: "5mg", emoji: "🩸" }, { name: "Folate", amount: "160mcg", emoji: "🧬" }, { name: "Vitamin C", amount: "140mg", emoji: "🍊" },
    ],
    whyThisWeek: "Late pregnancy iron stores must carry baby through the first six months of life — they pull what they need from you. Vitamin C from the OJ triples plant-iron absorption from beet, spinach, and berries.",
    instructions: ["Blend on high until completely smooth", "Pour into a tall glass", "Sip slowly with breakfast", "Daily through the final trimester", "Watch your energy lift"],
  },
  {
    id: 'r61', title: "Labour Prep Energy Bites", emoji: "🌰", category: 'Snack', prepTime: 10, weekRange: [34, 40],
    ingredients: [
      { name: "Medjool dates", amount: "10", nutrientRating: 3, alternatives: "Dried figs." },
      { name: "Cashews", amount: "½ cup", nutrientRating: 3, alternatives: "Almonds." },
      { name: "Coconut flakes", amount: "¼ cup", nutrientRating: 2, alternatives: "Hemp seeds." },
      { name: "Tahini", amount: "2 tbsp", nutrientRating: 3, alternatives: "Almond butter." },
      { name: "Vanilla", amount: "1 tsp", nutrientRating: 1, alternatives: "Cinnamon." },
    ],
    vitamins: [
      { name: "Iron", amount: "4mg", emoji: "🩸" }, { name: "Magnesium", amount: "85mg", emoji: "⚡" }, { name: "Glucose", amount: "fast", emoji: "⚡" },
    ],
    whyThisWeek: "Each bite delivers roughly one date — six a day from week 36 is the research-backed dose for shorter, smoother labour. Pop them in your hospital bag for active labour fuel too.",
    instructions: ["Pulse cashews until coarse", "Add the rest, process until clumpy", "Roll into 16 balls", "Coat in extra coconut", "Refrigerate in an airtight container"],
  },
  {
    id: 'r62', title: "Sweet Potato Wedges with Herbed Yoghurt", emoji: "🍠", category: 'Snack', prepTime: 25, weekRange: [27, 40],
    ingredients: [
      { name: "Sweet potato", amount: "1 large", nutrientRating: 3, alternatives: "Butternut squash wedges." },
      { name: "Olive oil", amount: "2 tbsp", nutrientRating: 2, alternatives: "Avocado oil." },
      { name: "Smoked paprika", amount: "1 tsp", nutrientRating: 1, alternatives: "Cumin." },
      { name: "Greek yoghurt", amount: "½ cup", nutrientRating: 3, alternatives: "Coconut yoghurt." },
      { name: "Dill & lemon", amount: "to taste", nutrientRating: 2, alternatives: "Mint." },
    ],
    vitamins: [
      { name: "Vitamin A", amount: "12000IU", emoji: "👁️" }, { name: "B6", amount: "0.6mg", emoji: "🌿" }, { name: "Calcium", amount: "120mg", emoji: "🦴" },
    ],
    whyThisWeek: "Late-pregnancy hunger comes in waves — this satisfies sweet/salty/creamy all at once with vitamin A for baby's last lung-development sprint and yoghurt's calcium and probiotics.",
    instructions: ["Cut sweet potato into wedges", "Toss with oil, paprika, salt", "Roast at 220°C for 22 minutes", "Mix yoghurt with dill, lemon, salt", "Serve hot with the dip"],
  },
  {
    id: 'r63', title: "Slow-Cooked Coconut Dal", emoji: "🍛", category: 'Dinner', prepTime: 35, weekRange: [27, 40],
    ingredients: [
      { name: "Red lentils", amount: "1 cup", nutrientRating: 3, alternatives: "Mung dal." },
      { name: "Coconut milk", amount: "200ml", nutrientRating: 2, alternatives: "Cashew cream." },
      { name: "Onion & garlic", amount: "1 + 3 cloves", nutrientRating: 2, alternatives: "Leek." },
      { name: "Tomato", amount: "2 chopped", nutrientRating: 2, alternatives: "Passata." },
      { name: "Curry spices", amount: "1 tbsp", nutrientRating: 1, alternatives: "Garam masala." },
    ],
    vitamins: [
      { name: "Iron", amount: "11mg", emoji: "🩸" }, { name: "Folate", amount: "180mcg", emoji: "🧬" }, { name: "Protein", amount: "20g", emoji: "💪" },
    ],
    whyThisWeek: "Soul food for the final stretch — easy on the digestion, big on protein and iron, and the kind of slow-cooked meal that freezes brilliantly in batches for the postpartum weeks.",
    instructions: ["Sauté onion, garlic, and spices in coconut oil", "Add tomato, cook 5 minutes", "Add lentils, coconut milk, and 600ml water", "Simmer 25 minutes until thick", "Finish with lime and coriander"],
  },
  {
    id: 'r64', title: "Roasted Cod with Greens", emoji: "🐟", category: 'Dinner', prepTime: 25, weekRange: [27, 40],
    ingredients: [
      { name: "Cod fillet", amount: "150g", nutrientRating: 3, alternatives: "Haddock or pollock." },
      { name: "Cherry tomatoes", amount: "1 cup", nutrientRating: 2, alternatives: "Sliced courgette." },
      { name: "Cavolo nero", amount: "2 cups", nutrientRating: 3, alternatives: "Kale or chard." },
      { name: "Olive oil & lemon", amount: "3 tbsp + 1", nutrientRating: 2, alternatives: "Capers." },
      { name: "Garlic", amount: "3 cloves", nutrientRating: 2, alternatives: "Shallot." },
    ],
    vitamins: [
      { name: "Protein", amount: "30g", emoji: "💪" }, { name: "Vitamin K", amount: "200mcg", emoji: "🌿" }, { name: "Vitamin D", amount: "200IU", emoji: "☀️" },
    ],
    whyThisWeek: "Low-mercury, high-protein, easy to digest — exactly the dinner profile your stretched stomach needs. Vitamin K from greens builds the clotting reserves you'll need at birth.",
    instructions: ["Roast tomatoes with garlic and olive oil 10 minutes at 200°C", "Add cod fillet on top, season", "Roast 12 more minutes", "Sauté cavolo nero with garlic and lemon", "Plate together with all the pan juices"],
  },
  {
    id: 'r65', title: "Chickpea Spinach Coconut Curry", emoji: "🥥", category: 'Dinner', prepTime: 25, weekRange: [27, 40],
    ingredients: [
      { name: "Chickpeas", amount: "2 cans", nutrientRating: 3, alternatives: "White beans." },
      { name: "Spinach", amount: "4 cups", nutrientRating: 3, alternatives: "Kale or chard." },
      { name: "Coconut milk", amount: "400ml", nutrientRating: 2, alternatives: "Tomato passata." },
      { name: "Onion, garlic, ginger", amount: "1, 3, 1 inch", nutrientRating: 2, alternatives: "Leek." },
      { name: "Curry powder", amount: "1 tbsp", nutrientRating: 1, alternatives: "Garam masala." },
    ],
    vitamins: [
      { name: "Iron", amount: "10mg", emoji: "🩸" }, { name: "Folate", amount: "240mcg", emoji: "🧬" }, { name: "Protein", amount: "22g", emoji: "💪" },
    ],
    whyThisWeek: "One-pot iron, folate, and protein dinner that scales easily — make a double batch for postpartum freezer stock. Future-you will weep with gratitude.",
    instructions: ["Sauté onion, garlic, ginger 4 minutes", "Add curry powder, cook 1 minute", "Pour in chickpeas and coconut milk", "Simmer 15 minutes", "Stir in spinach until just wilted, finish with lime"],
  },
  {
    id: 'r66', title: "Hibiscus Rosehip Iced Tea", emoji: "🌺", category: 'Tea', prepTime: 8, weekRange: [27, 40],
    ingredients: [
      { name: "Dried hibiscus", amount: "2 tbsp", nutrientRating: 3, alternatives: "Rose petals." },
      { name: "Rose hips", amount: "1 tbsp", nutrientRating: 3, alternatives: "Acerola powder." },
      { name: "Lemon", amount: "½ squeezed", nutrientRating: 2, alternatives: "Lime." },
      { name: "Honey", amount: "1 tbsp", nutrientRating: 1, alternatives: "Maple syrup." },
    ],
    vitamins: [
      { name: "Vitamin C", amount: "70mg", emoji: "🍊" }, { name: "Antioxidants", amount: "high", emoji: "✨" },
    ],
    whyThisWeek: "Iron stores need vitamin C to lock in — this iced tea delivers a beautiful dose without caffeine. Hibiscus is also gently cooling for the late-pregnancy heat most mamas feel.",
    instructions: ["Pour 600ml boiled water over herbs", "Steep 10 minutes", "Strain and add honey while warm", "Chill until cold", "Serve over ice with lemon"],
  },

  // ══════════════════════════════════════════════
  // EXPANDED LIBRARY — Universal (weeks 1-40)
  // ══════════════════════════════════════════════
  {
    id: 'r67', title: "Mineral Replenishing Broth", emoji: "🍵", category: 'Tea', prepTime: 15, weekRange: [1, 40],
    ingredients: [
      { name: "Vegetable scraps", amount: "3 cups", nutrientRating: 2, alternatives: "Pre-made vegetable broth." },
      { name: "Kombu seaweed", amount: "1 strip", nutrientRating: 3, alternatives: "Wakame." },
      { name: "Shiitake mushrooms", amount: "4 dried", nutrientRating: 3, alternatives: "Fresh mushrooms." },
      { name: "Ginger", amount: "1 inch", nutrientRating: 2, alternatives: "Turmeric." },
      { name: "Miso paste", amount: "1 tbsp", nutrientRating: 3, alternatives: "Tamari." },
    ],
    vitamins: [
      { name: "Iodine", amount: "100mcg", emoji: "🌊" }, { name: "Electrolytes", amount: "—", emoji: "⚡" }, { name: "Glutamine", amount: "—", emoji: "✨" },
    ],
    whyThisWeek: "A daily cup of mineral broth is one of the most-quietly-powerful pregnancy rituals — iodine for baby's thyroid, electrolytes for hydration, glutamine to soothe the gut at any stage.",
    instructions: ["Simmer scraps, kombu, mushrooms, ginger in 1.5L water 45 minutes", "Strain", "Whisk in miso off the heat", "Sip warm from a mug", "Freeze remainder in cubes"],
  },
  {
    id: 'r68', title: "Everyday Anti-Inflammatory Salad", emoji: "🥗", category: 'Snack', prepTime: 8, weekRange: [1, 40],
    ingredients: [
      { name: "Rocket", amount: "2 cups", nutrientRating: 3, alternatives: "Mixed leaves or spinach." },
      { name: "Walnuts", amount: "2 tbsp", nutrientRating: 3, alternatives: "Hemp seeds." },
      { name: "Pomegranate seeds", amount: "¼ cup", nutrientRating: 3, alternatives: "Dried cranberries." },
      { name: "Goat's cheese", amount: "30g optional", nutrientRating: 2, alternatives: "Avocado." },
      { name: "Olive oil & lemon", amount: "2 tbsp + ½", nutrientRating: 2, alternatives: "Balsamic." },
    ],
    vitamins: [
      { name: "Omega-3", amount: "1.4g", emoji: "🧠" }, { name: "Antioxidants", amount: "high", emoji: "✨" }, { name: "Folate", amount: "90mcg", emoji: "🧬" },
    ],
    whyThisWeek: "A pregnancy-long staple — omega-3, anti-inflammatory polyphenols, and folate in a 5-minute side that pairs with literally anything. Eat it 3 times a week.",
    instructions: ["Pile rocket on a plate", "Scatter walnuts and pomegranate", "Crumble cheese if using", "Whisk oil with lemon, salt, pepper", "Dress just before eating"],
  },
];

export function getRecipesForWeek(week: number): Recipe[] {
  return recipes.filter(r => week >= r.weekRange[0] && week <= r.weekRange[1]);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}

export function getUniqueVitaminsForWeek(week: number): RecipeVitamin[] {
  const weekRecipes = getRecipesForWeek(week);
  const seen = new Set<string>();
  const result: RecipeVitamin[] = [];
  for (const r of weekRecipes) {
    for (const v of r.vitamins) {
      if (!seen.has(v.name)) {
        seen.add(v.name);
        result.push(v);
      }
    }
  }
  return result;
}

export const CATEGORY_GRADIENTS: Record<string, string> = {
  Breakfast: "linear-gradient(135deg,#E89020,#F4A830,#FFCC60)",
  Smoothie: "linear-gradient(135deg,#F0A020,#F8C040,#FFD870)",
  Snack: "linear-gradient(135deg,#FF9060,#FFBC80)",
  Dinner: "linear-gradient(135deg,#D07818,#E89030,#F8B850)",
  Tea: "linear-gradient(135deg,#C87828,#E09840,#F8B860)",
};
