export type Appliance = {
  id: string;
  name: string;
  watts: number;
  hours: number;
  qty: number;
  tip: string;
};

export const defaultAppliances: Appliance[] = [
  {
    id: "ac",
    name: "Air Conditioner (1 ton)",
    watts: 1200,
    hours: 8,
    qty: 1,
    tip: "Set to 26°C and use with a ceiling fan — every degree lower adds roughly 6% to the bill.",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    watts: 150,
    hours: 24,
    qty: 1,
    tip: "Keep it away from the stove and clean the back coils twice a year.",
  },
  {
    id: "fan",
    name: "Ceiling Fan",
    watts: 80,
    hours: 14,
    qty: 4,
    tip: "Switching old fans to inverter fans (35W) can save close to 60% of fan usage.",
  },
  {
    id: "geyser",
    name: "Electric Geyser",
    watts: 1500,
    hours: 2,
    qty: 1,
    tip: "Lower the thermostat to 50°C and insulate the tank; in summer, switch it off entirely.",
  },
  {
    id: "iron",
    name: "Iron",
    watts: 1000,
    hours: 0.5,
    qty: 1,
    tip: "Iron a full week's clothes in one session instead of daily short bursts.",
  },
  {
    id: "lights",
    name: "Lights (LED/Saver)",
    watts: 15,
    hours: 6,
    qty: 10,
    tip: "Replace any remaining bulbs or tube lights with 9W LEDs.",
  },
  {
    id: "washing",
    name: "Washing Machine",
    watts: 500,
    hours: 1,
    qty: 1,
    tip: "Run full loads on cold wash and dry clothes in sunlight instead of the spin dryer.",
  },
  {
    id: "tv",
    name: "LED TV",
    watts: 90,
    hours: 5,
    qty: 1,
    tip: "Standby draw is real — use a switchboard button to cut power at night.",
  },
];

// Simplified protected-consumer style slab structure (PKR per unit)
export const slabs = [
  { upTo: 100, rate: 13.5, label: "1–100 units" },
  { upTo: 200, rate: 18.95, label: "101–200 units" },
  { upTo: 300, rate: 24.9, label: "201–300 units" },
  { upTo: 400, rate: 32.03, label: "301–400 units" },
  { upTo: 700, rate: 37.8, label: "401–700 units" },
  { upTo: Infinity, rate: 43.5, label: "Above 700 units" },
];

export function slabBreakdown(units: number) {
  return slabBreakdownFor(units, slabs);
}

export type DiscoSlab = { upTo: number; rate: number; label: string };
export type Disco = {
  id: string;
  name: string;
  city: string;
  slabs: DiscoSlab[];
  taxRate: number;
  fixedCharges: number;
};

const makeDiscoSlabs = (rates: number[]): DiscoSlab[] => [
  { upTo: 100, rate: rates[0]!, label: "1–100 units" },
  { upTo: 200, rate: rates[1]!, label: "101–200 units" },
  { upTo: 300, rate: rates[2]!, label: "201–300 units" },
  { upTo: 400, rate: rates[3]!, label: "301–400 units" },
  { upTo: 700, rate: rates[4]!, label: "401–700 units" },
  { upTo: Infinity, rate: rates[5]!, label: "Above 700 units" },
];

export const discos: Disco[] = [
  ["k-electric", "K-Electric", "Karachi", [13.5, 18.95, 24.9, 32.03, 37.8, 43.5], 0.31, 320],
  ["lesco", "LESCO", "Lahore", [14.2, 19.5, 25.6, 33.1, 38.9, 44.8], 0.3, 300],
  ["gepco", "GEPCO", "Gujranwala", [13.8, 19.1, 25.2, 32.6, 38.3, 44.1], 0.3, 290],
  ["fesco", "FESCO", "Faisalabad", [13.6, 18.8, 24.7, 31.9, 37.5, 43.2], 0.29, 280],
  ["iesco", "IESCO", "Islamabad", [14.5, 20.1, 26.4, 34, 39.8, 45.6], 0.31, 340],
  ["pesco", "PESCO", "Peshawar", [14, 19.6, 25.8, 33.3, 39.1, 44.9], 0.3, 310],
  ["hesco", "HESCO", "Hyderabad", [13.3, 18.5, 24.3, 31.5, 37.1, 42.8], 0.28, 270],
  ["qesco", "QESCO", "Quetta", [13.1, 18.2, 24, 31.2, 36.8, 42.5], 0.28, 260],
  ["mepco", "MEPCO", "Multan", [13.7, 19, 25, 32.3, 37.9, 43.6], 0.29, 285],
].map(([id, name, city, rates, taxRate, fixedCharges]) => ({
  id: id as string,
  name: name as string,
  city: city as string,
  slabs: makeDiscoSlabs(rates as number[]),
  taxRate: taxRate as number,
  fixedCharges: fixedCharges as number,
}));

export function slabBreakdownFor(units: number, slabList: DiscoSlab[]) {
  const rows: { label: string; units: number; rate: number; amount: number }[] = [];
  let remaining = Math.max(units, 0);
  let previous = 0;
  for (const slab of slabList) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, slab.upTo - previous);
    rows.push({ label: slab.label, units: take, rate: slab.rate, amount: take * slab.rate });
    remaining -= take;
    previous = slab.upTo;
  }
  return rows;
}

export type SolarType = "none" | "on-grid" | "off-grid" | "hybrid";
export type SolarResult = {
  generation: number;
  selfConsumed: number;
  exported: number;
  billAfterSolar: number;
  monthlySavings: number;
  independence: number;
  backupHours: number;
  summary: string;
};

export function calculateSolar(
  type: SolarType,
  units: number,
  systemKw: number,
  batteryKwh: number,
  disco: Disco,
): SolarResult {
  if (type === "none")
    return {
      generation: 0,
      selfConsumed: 0,
      exported: 0,
      billAfterSolar: 0,
      monthlySavings: 0,
      independence: 0,
      backupHours: 0,
      summary: "",
    };
  const generation = systemKw * 5 * 0.77 * 30;
  const daytimeLoad = units * 0.45;
  const batteryBuffer = batteryKwh * 30 * 0.8;
  const selfConsumed =
    type === "on-grid"
      ? Math.min(generation, daytimeLoad)
      : type === "hybrid"
        ? Math.min(generation, daytimeLoad + batteryBuffer)
        : Math.min(generation, units);
  const exported = type === "off-grid" ? 0 : Math.max(0, generation - selfConsumed);
  const imports = Math.max(0, units - selfConsumed);
  const afterRows = slabBreakdownFor(imports, disco.slabs);
  const afterEnergy = afterRows.reduce((sum, row) => sum + row.amount, 0);
  const baseRows = slabBreakdownFor(units, disco.slabs);
  const baseEnergy = baseRows.reduce((sum, row) => sum + row.amount, 0);
  const baseBill = baseEnergy * (1 + disco.taxRate) + disco.fixedCharges;
  const solarBill = Math.max(
    0,
    afterEnergy * (1 + disco.taxRate) +
      disco.fixedCharges -
      exported * disco.slabs.at(-1)!.rate * 0.6,
  );
  const backupHours = (batteryKwh * 0.8) / 1.5;
  const independence = units ? (selfConsumed / units) * 100 : 0;
  const summary =
    type === "off-grid"
      ? `${Math.round(independence)}% grid-independent with approximately ${backupHours.toFixed(1)} hours of essential-load backup.`
      : `${Math.round(selfConsumed)} kWh offsets household use and ${Math.round(exported)} kWh is exported for net-metering credit.`;
  return {
    generation,
    selfConsumed,
    exported,
    billAfterSolar: solarBill,
    monthlySavings: baseBill - solarBill,
    independence,
    backupHours,
    summary,
  };
}

export type RecipeBudgetBreakdown = {
  leftoverRescuePkr: number;
  freshStaplesPkr: number;
  totalCostPkr: number;
  costPerPersonPkr: number;
  notes: string;
};

export type Recipe = {
  id: string;
  name: string;
  urdu: string;
  minutes: number;
  prepMinutes: number;
  cookTimeFormatted: string;
  serves: number;
  portionSize: string;
  uses: string[];
  pantry: string[];
  steps: string[];
  costPkr: number;
  cookingStyle: string;
  repurposingTip: string;
  budgetBreakdown: RecipeBudgetBreakdown;
};

export const ingredients = [
  "Leftover Salan",
  "Cooked Rice",
  "Roti / Naan",
  "Daal",
  "Boiled Potatoes",
  "Chicken Qorma",
  "Tomatoes",
  "Onion",
  "Eggs",
  "Yogurt",
  "Paneer",
  "Spinach (Palak)",
  "Bread Slices",
  "Green Chillies",
  "Coriander",
];

export const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Degh-Style Heavy Salan Dum Pulao (Family Degh)",
    urdu: "دیغی سالن دم پلاؤ (فیملی سائز - بچے سالن اور چاول کا مستند ملاپ)",
    minutes: 180,
    prepMinutes: 15,
    cookTimeFormatted: "3 Hours (Slow Degh Dum & Steam Infusion)",
    serves: 6,
    portionSize: "Serves 5–6 (Generous Family Degh · Covers Dinner + Next Day Lunch)",
    uses: ["Leftover Salan", "Cooked Rice"],
    pantry: [
      "Basic kitchen spices (whole zeera, kali mirch, laung, daalchini)",
      "Desi ghee / cooking oil (2 tbsp)",
      "Namak (salt to taste)",
      "1/2 cup water",
    ],
    steps: [
      "Heavy Degh Prep: In a thick-bottomed steel deghchi or cast iron pot, warm 2 tablespoons of desi ghee with whole cumin and black pepper.",
      "Salan Base Layer: Tip in yesterday's leftover chicken, mutton, or beef salan (approx 3-4 cups with gravy). Warm gently on low heat for 5 minutes so the rich marrow roghan loosens and bubbles.",
      "Fluffed Leftover Rice Layer: Gently break up cold leftover boiled or steamed rice with your hands to loosen grains. Heap over the bubbling salan without mixing, forming a tall dome.",
      "Kapray Ka Dum (30-Minute Low Dum): Drizzle 2 tbsp warm water along the edges. Wrap the pot lid in a clean kitchen towel (kapray ka dum), place a flat tawa underneath, and let it slow-steam on the lowest possible flame for 30 minutes (or slow-simmer up to 3 hours for deep deghi infusing).",
      "Royal Deghi Reveal: Remove lid. Gently fold from bottom to top with a flat saucer or wide skimmer ladle. The golden meat gravy will coat every rice grain in authentic amber degh color.",
    ],
    costPkr: 520,
    cookingStyle: "Slow Degh Dum & Steam Infusion (3 Hours)",
    repurposingTip:
      "Leftover Salan Pulao tastes even richer the next morning! Reheat in a covered pan with a splash of milk and brown onions for an effortless family lunch.",
    budgetBreakdown: {
      leftoverRescuePkr: 780,
      freshStaplesPkr: 60,
      totalCostPkr: 520,
      costPerPersonPkr: 86,
      notes:
        "100% Zero-Extra-Grocery: Requires NO outside grocery shopping. Uses exclusively selected home leftovers + kitchen spices and oil/ghee.",
    },
  },
  {
    id: "r2",
    name: "Traditional Pakistani Roti Churma / Salan Roti Kutti",
    urdu: "روایتی سالن روٹی کُٹّی / چُورما (بچی روٹی اور سالن کا دیسی ذائقہ)",
    minutes: 30,
    prepMinutes: 10,
    cookTimeFormatted: "30 Min (Slow Gravy Reduction & Tawa Bhunai)",
    serves: 6,
    portionSize: "Serves 5–6 (Traditional Hearty Family Platter)",
    uses: ["Roti / Naan", "Leftover Salan"],
    pantry: [
      "Desi ghee / cooking oil (2 tbsp)",
      "Roasted cumin powder (bhuna zeera)",
      "Chilli flakes / kali mirch",
      "Salt to taste",
    ],
    steps: [
      "Shredding Stale Rotis: Take 5 to 6 leftover chapatis or naans. Tear or chop them into bite-sized 1-inch squares or rustic flakes.",
      "Salan Shorba Elevation: Pour leftover chicken, beef, or vegetable salan into a wide iron karahi. Add 1/2 cup water, pinch of salt, and roasted cumin; bring to a rolling simmer.",
      "The Churma Absorption: Tip in the shredded roti pieces. Stir continuously on medium heat as the dry rotis eagerly soak in every drop of the spiced bone broth and gravy.",
      "Ghee Bhunai Sizzle: Add 2 generous spoonfuls of pure desi ghee. Fry vigorously for 6 minutes until the roti edges crisp up slightly and the roghan shines on the pan surface.",
      "Platter Assembly: Heap steaming hot onto a traditional brass or clay thali. Top with a pinch of black pepper and serve with hot chai.",
    ],
    costPkr: 380,
    cookingStyle: "Slow Gravy Reduction & Tawa Bhunai (30 Min)",
    repurposingTip:
      "Any remaining churma can be pressed flat into a hot tawa with a drizzle of oil to make crunchy 'Churma Papri' for evening snacks.",
    budgetBreakdown: {
      leftoverRescuePkr: 620,
      freshStaplesPkr: 40,
      totalCostPkr: 380,
      costPerPersonPkr: 63,
      notes:
        "100% Zero-Extra-Grocery: Salvages stale rotis and yesterday's salan into a wholesome 6-person meal.",
    },
  },
  {
    id: "r3",
    name: "Badi Family-Sized Daal Aloo Cutlet Platter (20 Cutlets)",
    urdu: "بڑی فیملی دال آلو کٹلٹس پلیٹر (20 کرسپی کٹلٹس - شام اور رات کا کھانا)",
    minutes: 45,
    prepMinutes: 15,
    cookTimeFormatted: "45 Min (Slow Daal Reduction & Golden Tawa Fry)",
    serves: 6,
    portionSize: "Serves 5–6 (Yields 20 Large Cutlets · Covers Dinner + Evening Tea)",
    uses: ["Daal", "Boiled Potatoes"],
    pantry: [
      "Cooking oil / ghee for shallow frying (4 tbsp)",
      "Kitchen spices (salt, red chilli powder, zeera, haldi)",
      "Crushed coriander seeds (sabut dhania)",
    ],
    steps: [
      "Thickening the Daal: Pour 2 cups of leftover daal (chana, maash, or moong-masoor) into a non-stick pan. Cook over medium-high heat for 6 minutes until all excess liquid evaporates into a thick paste.",
      "Potato Core Mashing: Peel and coarsely mash 4-5 boiled potatoes in a wide mixing bowl. Combine with the reduced daal paste while warm.",
      "Spicing from the Masala Dabba: Fold in 1 tsp salt, 1 tsp red chilli flakes, 1 tsp roasted crushed cumin, and a pinch of turmeric. No external sauces needed.",
      "Shaping 20 Large Cutlets: Lightly grease hands with oil. Shape the mixture into 20 uniform, plump, round shami-style cutlets.",
      "Tawa Crisp Shallow Fry: Heat 3 tablespoons of cooking oil on a flat tawa. Fry cutlets 4-5 at a time over medium heat for 4 minutes per side until crackling golden brown.",
    ],
    costPkr: 440,
    cookingStyle: "Slow Daal Reduction & Golden Tawa Fry (45 Min)",
    repurposingTip:
      "Freeze 10 uncooked cutlets on a flat tray! Fry directly from frozen for sudden evening guests or morning tiffin rolls.",
    budgetBreakdown: {
      leftoverRescuePkr: 540,
      freshStaplesPkr: 50,
      totalCostPkr: 440,
      costPerPersonPkr: 73,
      notes:
        "100% Zero-Extra-Grocery: Combines leftover daal and boiled potatoes with standard household spices.",
    },
  },
  {
    id: "r4",
    name: "Royal Slow-Cooked Leftover Haleem (Authentic Ghota Dum)",
    urdu: "شاہی دھیمی آنچ حلیم / کھچڑا (5.5 گھنٹے دیسی گھوٹا اور دم)",
    minutes: 330,
    prepMinutes: 20,
    cookTimeFormatted: "5.5 Hours (Slow Pot Simmer & Traditional Wooden Ghota)",
    serves: 6,
    portionSize: "Serves 6 (Large Dawat Pot · Yields 2 Full Family Meals)",
    uses: ["Leftover Salan", "Daal", "Cooked Rice"],
    pantry: [
      "Water (6-8 cups)",
      "Desi ghee / cooking oil (3 tbsp)",
      "Basic spices (haldi, garam masala, laal mirch, zeera, salt)",
    ],
    steps: [
      "Pot Assembly & Slow Simmer (4 Hours): In a large heavy-bottomed pot, combine leftover meat salan (chicken or beef), leftover daal, and cooked rice. Pour in 6 cups of warm water with turmeric and salt. Set on ultra-low flame to slow-simmer for 4 hours until all grains and meat collapse completely.",
      "Shredding the Meat: Use two forks or a masher inside the pot to shred the softened meat cuts into fine, velvety strands (resha).",
      "The Master Ghota (25 Minutes): Take a wooden madhani (churner) or potato masher. Work vigorously in circular motions for 20-25 minutes. The starch from the cooked rice and daal meshes with the meat fibers into a thick, elastic, royal haleem texture.",
      "Desi Ghee Tarka: In a frying ladle, heat 3 tbsp pure desi ghee with cumin seeds and red chilli powder until smoking hot. Pour sizzling into the bubbling pot with an exhilarating roar.",
      "Low Heat Dum: Cover tightly with a heavy lid and let it rest on gentle dum for 30 minutes before serving in deep bowls.",
    ],
    costPkr: 680,
    cookingStyle: "Royal Slow 5.5-Hour Dum & Traditional Ghota",
    repurposingTip:
      "Leftover Haleem freezes exceptionally well for 2 weeks! Reheat gently with 3 tablespoons hot water on low heat for the ultimate comfort meal.",
    budgetBreakdown: {
      leftoverRescuePkr: 920,
      freshStaplesPkr: 80,
      totalCostPkr: 680,
      costPerPersonPkr: 113,
      notes:
        "100% Zero-Extra-Grocery: Reinvents three common fridge leftovers (meat salan + daal + rice) into a royal family feast.",
    },
  },
  {
    id: "r5",
    name: "Traditional Desi Khichdi & Daal Chawal Tawa Bhuna",
    urdu: "روایتی دیسی کھچڑی و دال چاول تڑکہ (بچے دال چاول کا شاندار مصرف)",
    minutes: 35,
    prepMinutes: 10,
    cookTimeFormatted: "35 Min (Desi Ghee Tarka & Gentle Dum)",
    serves: 6,
    portionSize: "Serves 5–6 (Wholesome Comfort Food Feast)",
    uses: ["Cooked Rice", "Daal"],
    pantry: [
      "Pure desi ghee (2 tbsp)",
      "Whole cumin seeds (sabut zeera)",
      "Red chilli powder & salt to taste",
      "1/4 cup water",
    ],
    steps: [
      "Sizzle Ghee Tarka: In a deep handi or wok, heat 2 tablespoons of desi ghee. Add 1 tablespoon whole cumin seeds and let them sizzle and darken for 30 seconds.",
      "Merge Daal & Cold Rice: Pour in 2-3 cups of leftover daal and 3-4 cups of cold cooked rice. Add 1/4 cup water and a pinch of salt.",
      "Gentle Bhunai: Stir carefully over medium heat for 6 minutes, allowing the lentils to coat every rice grain without turning them mushy.",
      "The 15-Minute Dum: Cover with a heavy lid over a low flame. Allow the rice to absorb the daal essence in gentle steam for 15 minutes.",
      "Serve Piping Hot: Ladle into wide terracotta plates. Rich, soothing, and packed with homestyle flavor.",
    ],
    costPkr: 320,
    cookingStyle: "Desi Ghee Tarka & Gentle Dum (35 Min)",
    repurposingTip:
      "Any extra khichdi can be mashed with a spoonful of rice flour or besan next morning to shallow-fry into crunchy morning snack tikkis.",
    budgetBreakdown: {
      leftoverRescuePkr: 480,
      freshStaplesPkr: 40,
      totalCostPkr: 320,
      costPerPersonPkr: 53,
      notes:
        "100% Zero-Extra-Grocery: Pure comfort food crafted entirely from yesterday's daal and rice.",
    },
  },
  {
    id: "r6",
    name: "Khandani Aloo Salan Dum (Double-Volume Family Handi)",
    urdu: "خاندانی آلو سالن دم (بچے سالن کو دُگنا فیملی ہانڈی میں بدلیں)",
    minutes: 120,
    prepMinutes: 15,
    cookTimeFormatted: "2 Hours (Slow Earthenware Handi Dum)",
    serves: 6,
    portionSize: "Serves 5–6 (Doubled Family Curry Handi)",
    uses: ["Leftover Salan", "Boiled Potatoes"],
    pantry: [
      "Desi ghee / cooking oil (2 tbsp)",
      "Spices (zeera, haldi, laal mirch, salt)",
      "Warm water (1.5 cups)",
    ],
    steps: [
      "Rustic Potato Halving: Cut boiled potatoes into generous, rustic halves or quarters.",
      "Infuse Earthen Handi: Warm leftover meat/chicken salan in a clay handi or heavy pot with 1.5 cups of warm water. Bring to a gentle simmer.",
      "Toss Potatoes: Slip the potato chunks directly into the simmering gravy. Add half a teaspoon of roasted cumin and red chilli powder.",
      "The 45-Minute Low Dum: Cover the pot tightly. Simmer on low heat for 45 minutes (or up to 2 hours in a clay pot) so the potatoes absorb the meat marrow flavor right to their core.",
      "Gravy Thickening Secret: Lightly crush two potato pieces against the side of the pot with a wooden spoon. This instantly transforms the shorba into a velvety, thick restaurant gravy.",
    ],
    costPkr: 460,
    cookingStyle: "Slow Earthenware Handi Dum (2 Hours)",
    repurposingTip:
      "Aloo salan shorba is legendary leftover gold: pour over cold boiled rice or enjoy with hot morning tandoori rotis.",
    budgetBreakdown: {
      leftoverRescuePkr: 700,
      freshStaplesPkr: 45,
      totalCostPkr: 460,
      costPerPersonPkr: 77,
      notes:
        "100% Zero-Extra-Grocery: Stretches a small bowl of salan to feed an entire 6-person household.",
    },
  },
  {
    id: "r7",
    name: "Traditional Shahi Dalcha / Daal Gosht Dum Handi",
    urdu: "روایتی شاہی دالچہ گوشت دم ہانڈی (دال اور گوشت کا شاہی ملاپ)",
    minutes: 150,
    prepMinutes: 15,
    cookTimeFormatted: "2.5 Hours (Slow Clay Handi Simmer & Royal Ghee Tarka)",
    serves: 6,
    portionSize: "Serves 5–6 (Rich Mughlai Handi Feast)",
    uses: ["Leftover Salan", "Daal"],
    pantry: [
      "Pure desi ghee (2 tbsp)",
      "Garlic cloves / whole zeera / round red chillies",
      "Garam masala & salt",
      "1 cup water",
    ],
    steps: [
      "Pot Union: In a heavy clay handi, combine leftover meat salan and leftover daal with 1 cup of water.",
      "Slow Simmer (1 Hour): Heat on medium until bubbling, then reduce to the lowest flame and simmer for 60-90 minutes so the distinct textures melt together.",
      "Coarse Texture Whisk: Lightly whisk with a wooden spoon or dal madhani to blend the lentil gravy around the tender meat pieces.",
      "Royal Sizzling Ghee Tarka: In a ladle, heat desi ghee with whole cumin and crushed red chillies until crackling. Pour hot over the bubbling dalcha with an aromatic hiss.",
      "Handi Dum (25 Minutes): Seal lid for 25 minutes before serving with hot rotis or boiled rice.",
    ],
    costPkr: 550,
    cookingStyle: "Slow Clay Handi Simmer & Royal Ghee Tarka (2.5 Hours)",
    repurposingTip:
      "Dalcha gets even better when rested overnight in the fridge. Warm up next afternoon for an effortless royal meal.",
    budgetBreakdown: {
      leftoverRescuePkr: 840,
      freshStaplesPkr: 60,
      totalCostPkr: 550,
      costPerPersonPkr: 92,
      notes:
        "100% Zero-Extra-Grocery: Merges leftover daal and salan into a celebratory Lahori dawat dish.",
    },
  },
  {
    id: "r8",
    name: "Traditional Daal Bhari Missi Roti & Tawa Platter",
    urdu: "روایتی دال بھری مصالحے دار مِسی روٹی پلیٹر",
    minutes: 30,
    prepMinutes: 10,
    cookTimeFormatted: "30 Min (Crisp Tawa Griddling with Ghee)",
    serves: 6,
    portionSize: "Serves 5–6 (Crisp Tawa Paratha Platter)",
    uses: ["Roti / Naan", "Daal"],
    pantry: ["Desi ghee / cooking oil (3 tbsp)", "Red chilli powder, salt, and crushed cumin"],
    steps: [
      "Prepare Daal Spread: Take cold, thickened leftover daal. Stir in extra cumin, red chilli, and a pinch of salt.",
      "Coat the Rotis: Generously smear a thick layer of seasoned daal across one side of leftover rotis or naans.",
      "Tawa Griddle: Heat a cast-iron tawa with 1 tbsp of ghee. Place the roti daal-side down first for 3 minutes on medium-low flame.",
      "Flip & Crisp: Brush ghee on the back side, flip, and press gently with a flat spatula until both sides are blistered, golden, and deeply crispy.",
      "Platter Presentation: Slice diagonally and serve steaming hot with chai or pickles.",
    ],
    costPkr: 310,
    cookingStyle: "Crisp Tawa Griddling with Ghee (30 Min)",
    repurposingTip:
      "Crisp Missi Rotis stay crunchy for hours. Pack them into children's school lunchboxes or office tiffin boxes.",
    budgetBreakdown: {
      leftoverRescuePkr: 420,
      freshStaplesPkr: 35,
      totalCostPkr: 310,
      costPerPersonPkr: 52,
      notes:
        "100% Zero-Extra-Grocery: Replaces market papri with wholesome high-protein lentil bread.",
    },
  },
  {
    id: "r9",
    name: "Aloo Masala Tawa Roti Rolls Platter (12 Large Rolls)",
    urdu: "آلو مصالحہ توا روٹی رولز (12 باربی کیو سٹائل رولز)",
    minutes: 30,
    prepMinutes: 10,
    cookTimeFormatted: "30 Min (Golden Tawa Crisping)",
    serves: 6,
    portionSize: "Serves 5–6 (Yields 10–12 Large Rolls · Full Dinner)",
    uses: ["Roti / Naan", "Boiled Potatoes"],
    pantry: [
      "Desi ghee / cooking oil (3 tbsp)",
      "Kitchen spices (salt, red chilli, cumin powder, chaat masala)",
    ],
    steps: [
      "Spicy Potato Mash: Mash boiled potatoes thoroughly with salt, red chilli powder, roasted cumin, and chaat masala.",
      "Roll Assembly: Spread a thick cylindrical log of the spiced potato filling across the center of each stale chapati.",
      "Tight Rolling: Roll the chapati tightly into a wrap. Lightly moisten the edge with water to secure the seal.",
      "Tawa Toasting: Heat ghee on the tawa. Roll the wraps over medium flame for 4 minutes until the exterior turns flaky, crisp, and golden brown.",
      "Cut & Enjoy: Cut diagonally into restaurant-style halves and serve hot.",
    ],
    costPkr: 340,
    cookingStyle: "Golden Tawa Crisping (30 Min)",
    repurposingTip:
      "Any leftover filling makes sensational samosa stuffing or morning toast spreads.",
    budgetBreakdown: {
      leftoverRescuePkr: 460,
      freshStaplesPkr: 35,
      totalCostPkr: 340,
      costPerPersonPkr: 57,
      notes:
        "100% Zero-Extra-Grocery: Restaurant-style paratha rolls crafted strictly from leftover rotis and potatoes.",
    },
  },
  {
    id: "r10",
    name: "Degh-Style Aloo Tehri & Spiced Tawa Rice",
    urdu: "دیغی آلو تاہری و مصالحے دار چاول (فیملی سائز - پیلے خوشبودار چاول)",
    minutes: 75,
    prepMinutes: 15,
    cookTimeFormatted: "1 Hr 15 Min (Spiced Tawa Bhunai & 30-Min Dum)",
    serves: 6,
    portionSize: "Serves 5–6 (Festive Yellow Rice Pot)",
    uses: ["Cooked Rice", "Boiled Potatoes"],
    pantry: [
      "Desi ghee / cooking oil (3 tbsp)",
      "Turmeric powder (haldi) for golden amber color",
      "Whole cumin seeds, cloves, salt",
      "1/3 cup water",
    ],
    steps: [
      "Turmeric & Cumin Sizzle: In a heavy pan, warm oil or ghee with turmeric, cumin seeds, and a pinch of salt until aromatic.",
      "Potato Glazing: Toss potato cubes into the golden oil for 5 minutes until coated in brilliant amber turmeric hue.",
      "Fold Cold Rice: Add fluffed leftover cooked rice and 1/3 cup water. Mix gently with a wide wooden spoon.",
      "Tawa Dum (25 Minutes): Seal the pot with a heavy lid and steam over low flame for 25 minutes until each rice grain is fragrant, separate, and tinted gold.",
      "Serve: Spoon hot onto wide platters; the ultimate comforting family weekend lunch.",
    ],
    costPkr: 360,
    cookingStyle: "Spiced Tawa Bhunai & 30-Min Dum (1.25 Hours)",
    repurposingTip:
      "Leftover Tehri makes incredible crispy fried rice the next day when tossed in a screaming hot wok.",
    budgetBreakdown: {
      leftoverRescuePkr: 490,
      freshStaplesPkr: 40,
      totalCostPkr: 360,
      costPerPersonPkr: 60,
      notes:
        "100% Zero-Extra-Grocery: Authentic traditional Tehri portioned for a full family without market shopping.",
    },
  },
  {
    id: "r11",
    name: "Highway Shinwari Shredded Meat Bhunai (Dry Karahi)",
    urdu: "ہائی وے شنواری بھنا گوشت کڑاہی (فیملی سائز - خشک روغنی بھنائی)",
    minutes: 45,
    prepMinutes: 10,
    cookTimeFormatted: "45 Min (High-Flame Iron Karahi Bhunai)",
    serves: 5,
    portionSize: "Serves 4–5 (Concentrated Highway Shinwari Karahi)",
    uses: ["Leftover Salan"],
    pantry: [
      "Cooking oil / desi ghee (2 tbsp)",
      "Freshly crushed black peppercorns (kali mirch)",
      "Salt to taste",
    ],
    steps: [
      "Gravy Evaporation: Empty leftover meat salan into a cast iron karahi. Turn heat to medium-high and boil down until the excess shorba fully evaporates.",
      "Meat Shredding: With two forks, shred the meat cuts right inside the skillet so they absorb the concentrated spice oils into fine strands.",
      "The Shinwari Bhunai: Add 2 tbsp of desi ghee and freshly crushed black pepper. Sauté relentlessly on ferocious high flame for 8 minutes until a glistening dark glaze forms.",
      "Smoky Finishing Sear: Press the shredded meat gently against the hot iron rim of the karahi for 60 seconds to lock in authentic dhaba char.",
      "Serve Straight from Karahi: Take the smoking cast-iron wok directly to the dinner table with hot tandoori rotis.",
    ],
    costPkr: 420,
    cookingStyle: "High-Flame Iron Karahi Bhunai (45 Min)",
    repurposingTip:
      "Tuck any remaining shredded meat into warm rotis with a dash of black pepper for sensational next-day rolls.",
    budgetBreakdown: {
      leftoverRescuePkr: 600,
      freshStaplesPkr: 30,
      totalCostPkr: 420,
      costPerPersonPkr: 84,
      notes:
        "100% Zero-Extra-Grocery: Upgrades leftover curry into an upscale highway dhabba specialty.",
    },
  },
  {
    id: "r12",
    name: "Dhaba-Style Double Tarka Daal Handi",
    urdu: "ڈھابہ ڈبل تڑکہ دال ہانڈی (مٹی کی ہانڈی والا اصلی تڑکہ)",
    minutes: 60,
    prepMinutes: 10,
    cookTimeFormatted: "1 Hour (Clay Handi Slow Simmer & Double Ghee Tarka)",
    serves: 5,
    portionSize: "Serves 4–5 (Full Earthenware Handi)",
    uses: ["Daal"],
    pantry: [
      "Desi ghee (3 tbsp)",
      "Whole cumin seeds, dried round red chillies, crushed garlic cloves",
      "Pinch of salt and red chilli powder",
    ],
    steps: [
      "Handi Slow Reduction: Pour leftover daal into a clay handi or pot. Simmer gently on low flame for 20 minutes to restore its rich, silky thickness.",
      "Aromatic First Infusion: Stir in half a tsp of roasted ground cumin, a pinch of turmeric, and adjust salt to season the simmer.",
      "The Roaring Ghee Tarka: In an iron ladle, heat pure desi ghee until smoking. Drop in sliced garlic cloves, whole cumin seeds, and dried red chillies until crackling and deep golden brown.",
      "The Double Sizzle Lid Trap: Pour half the sizzling tarka directly into the pot and immediately slam the lid shut for 2 minutes to trap the billowing smoky garlic aromatics.",
      "Final Crown Presentation: Remove lid, drizzle the remaining golden ghee tarka over the top surface, and serve bubbling hot.",
    ],
    costPkr: 280,
    cookingStyle: "Clay Handi Slow Simmer & Double Ghee Tarka (1 Hour)",
    repurposingTip:
      "Thickened tarka daal is the ultimate filling for morning 'Daal Parathas' for the family breakfast.",
    budgetBreakdown: {
      leftoverRescuePkr: 400,
      freshStaplesPkr: 40,
      totalCostPkr: 280,
      costPerPersonPkr: 56,
      notes:
        "100% Zero-Extra-Grocery: Elevates leftover daal into a restaurant-worthy clay handi course.",
    },
  },
];

export type MarketPrice = { market: string; price: number; distanceKm: number; note: string };
export type GroceryItem = {
  id: string;
  name: string;
  urdu: string;
  unit: string;
  prices: Record<string, MarketPrice[]>;
};

export const cities = ["Karachi", "Lahore", "Islamabad"] as const;
export type City = (typeof cities)[number];

const mk = (market: string, price: number, distanceKm: number, note: string): MarketPrice => ({
  market,
  price,
  distanceKm,
  note,
});

export const groceries: GroceryItem[] = [
  {
    id: "atta",
    name: "Atta (Wheat Flour)",
    urdu: "آٹا",
    unit: "10 kg bag",
    prices: {
      Karachi: [
        mk("Sabzi Mandi, Super Highway", 1180, 6.4, "Best rate on full bags"),
        mk("Utility Store", 1250, 1.8, "Subsidised, limited stock"),
        mk("Neighbourhood Kiryana", 1420, 0.4, "Convenient, priciest"),
        mk("Chain Supermarket", 1390, 3.1, "Card payments accepted"),
      ],
      Lahore: [
        mk("Badami Bagh Mandi", 1145, 8.2, "Wholesale rate"),
        mk("Utility Store", 1240, 2.2, "Subsidised"),
        mk("Kiryana Store", 1400, 0.5, "Home delivery"),
        mk("Chain Supermarket", 1365, 4.0, "Weekend discount"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 1210, 5.5, "Cheapest fresh stock"),
        mk("Utility Store", 1260, 2.0, "Subsidised"),
        mk("Kiryana Store", 1440, 0.6, "Nearest option"),
        mk("Chain Supermarket", 1410, 3.6, "Loyalty points"),
      ],
    },
  },
  {
    id: "sugar",
    name: "Sugar (Cheeni)",
    urdu: "چینی",
    unit: "1 kg",
    prices: {
      Karachi: [
        mk("Sabzi Mandi, Super Highway", 152, 6.4, "Bulk 5kg cheaper"),
        mk("Utility Store", 145, 1.8, "Capped rate"),
        mk("Neighbourhood Kiryana", 172, 0.4, "Loose sale"),
        mk("Chain Supermarket", 168, 3.1, "Branded pack"),
      ],
      Lahore: [
        mk("Badami Bagh Mandi", 148, 8.2, "Wholesale"),
        mk("Utility Store", 145, 2.2, "Capped rate"),
        mk("Kiryana Store", 170, 0.5, "Loose sale"),
        mk("Chain Supermarket", 165, 4.0, "Branded pack"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 155, 5.5, "Weekend only"),
        mk("Utility Store", 146, 2.0, "Capped rate"),
        mk("Kiryana Store", 175, 0.6, "Nearest"),
        mk("Chain Supermarket", 169, 3.6, "Branded"),
      ],
    },
  },
  {
    id: "tomato",
    name: "Tomatoes",
    urdu: "ٹماٹر",
    unit: "1 kg",
    prices: {
      Karachi: [
        mk("Sabzi Mandi, Super Highway", 95, 6.4, "Crate rate"),
        mk("Utility Store", 130, 1.8, "Limited"),
        mk("Neighbourhood Kiryana", 160, 0.4, "Thela / cart"),
        mk("Chain Supermarket", 185, 3.1, "Pre-packed"),
      ],
      Lahore: [
        mk("Badami Bagh Mandi", 88, 8.2, "Crate rate"),
        mk("Utility Store", 125, 2.2, "Limited"),
        mk("Kiryana Store", 150, 0.5, "Cart"),
        mk("Chain Supermarket", 178, 4.0, "Pre-packed"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 92, 5.5, "Government rate list"),
        mk("Utility Store", 128, 2.0, "Limited"),
        mk("Kiryana Store", 158, 0.6, "Cart"),
        mk("Chain Supermarket", 190, 3.6, "Pre-packed"),
      ],
    },
  },
  {
    id: "onion",
    name: "Onions (Pyaz)",
    urdu: "پیاز",
    unit: "1 kg",
    prices: {
      Karachi: [
        mk("Sabzi Mandi, Super Highway", 78, 6.4, "Bora rate"),
        mk("Utility Store", 95, 1.8, "Fixed"),
        mk("Neighbourhood Kiryana", 120, 0.4, "Cart"),
        mk("Chain Supermarket", 139, 3.1, "Pre-packed"),
      ],
      Lahore: [
        mk("Badami Bagh Mandi", 72, 8.2, "Bora rate"),
        mk("Utility Store", 92, 2.2, "Fixed"),
        mk("Kiryana Store", 115, 0.5, "Cart"),
        mk("Chain Supermarket", 132, 4.0, "Pre-packed"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 80, 5.5, "Weekend"),
        mk("Utility Store", 96, 2.0, "Fixed"),
        mk("Kiryana Store", 125, 0.6, "Cart"),
        mk("Chain Supermarket", 142, 3.6, "Pre-packed"),
      ],
    },
  },
  {
    id: "milk",
    name: "Fresh Milk",
    urdu: "دودھ",
    unit: "1 litre",
    prices: {
      Karachi: [
        mk("Dairy Shop (Gawala)", 220, 0.9, "Fresh, morning only"),
        mk("Utility Store", 235, 1.8, "Packed UHT"),
        mk("Neighbourhood Kiryana", 250, 0.4, "Packed"),
        mk("Chain Supermarket", 245, 3.1, "Packed, deals"),
      ],
      Lahore: [
        mk("Dairy Shop (Gawala)", 200, 1.1, "Fresh"),
        mk("Utility Store", 230, 2.2, "Packed UHT"),
        mk("Kiryana Store", 245, 0.5, "Packed"),
        mk("Chain Supermarket", 240, 4.0, "Deals"),
      ],
      Islamabad: [
        mk("Dairy Shop (Gawala)", 215, 1.4, "Fresh"),
        mk("Utility Store", 232, 2.0, "Packed UHT"),
        mk("Kiryana Store", 252, 0.6, "Packed"),
        mk("Chain Supermarket", 248, 3.6, "Deals"),
      ],
    },
  },
  {
    id: "ghee",
    name: "Cooking Oil / Ghee",
    urdu: "گھی",
    unit: "1 kg tin",
    prices: {
      Karachi: [
        mk("Sabzi Mandi, Super Highway", 560, 6.4, "Carton rate"),
        mk("Utility Store", 540, 1.8, "Subsidised brand"),
        mk("Neighbourhood Kiryana", 620, 0.4, "Single tin"),
        mk("Chain Supermarket", 599, 3.1, "Buy 2 offer"),
      ],
      Lahore: [
        mk("Akbari Mandi", 548, 7.5, "Carton rate"),
        mk("Utility Store", 535, 2.2, "Subsidised"),
        mk("Kiryana Store", 615, 0.5, "Single tin"),
        mk("Chain Supermarket", 589, 4.0, "Offer pack"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 570, 5.5, "Weekend"),
        mk("Utility Store", 542, 2.0, "Subsidised"),
        mk("Kiryana Store", 630, 0.6, "Single tin"),
        mk("Chain Supermarket", 605, 3.6, "Offer pack"),
      ],
    },
  },
  {
    id: "daal",
    name: "Daal Masoor",
    urdu: "دال مسور",
    unit: "1 kg",
    prices: {
      Karachi: [
        mk("Jodia Bazaar", 285, 7.0, "Wholesale grains"),
        mk("Utility Store", 300, 1.8, "Fixed"),
        mk("Neighbourhood Kiryana", 340, 0.4, "Loose"),
        mk("Chain Supermarket", 355, 3.1, "Branded"),
      ],
      Lahore: [
        mk("Akbari Mandi", 275, 7.5, "Wholesale grains"),
        mk("Utility Store", 298, 2.2, "Fixed"),
        mk("Kiryana Store", 335, 0.5, "Loose"),
        mk("Chain Supermarket", 349, 4.0, "Branded"),
      ],
      Islamabad: [
        mk("Sunday Bazaar (Peshawar Mor)", 290, 5.5, "Weekend"),
        mk("Utility Store", 302, 2.0, "Fixed"),
        mk("Kiryana Store", 345, 0.6, "Loose"),
        mk("Chain Supermarket", 360, 3.6, "Branded"),
      ],
    },
  },
  {
    id: "chicken",
    name: "Chicken (Live weight)",
    urdu: "مرغی",
    unit: "1 kg",
    prices: {
      Karachi: [
        mk("Poultry Wholesale Point", 465, 5.2, "Live bird"),
        mk("Utility Store", 520, 1.8, "Frozen"),
        mk("Neighbourhood Chicken Shop", 540, 0.4, "Cut & cleaned"),
        mk("Chain Supermarket", 610, 3.1, "Packed fresh"),
      ],
      Lahore: [
        mk("Poultry Wholesale Point", 450, 6.0, "Live bird"),
        mk("Utility Store", 510, 2.2, "Frozen"),
        mk("Chicken Shop", 528, 0.5, "Cut & cleaned"),
        mk("Chain Supermarket", 595, 4.0, "Packed fresh"),
      ],
      Islamabad: [
        mk("Poultry Wholesale Point", 472, 6.8, "Live bird"),
        mk("Utility Store", 525, 2.0, "Frozen"),
        mk("Chicken Shop", 550, 0.6, "Cut & cleaned"),
        mk("Chain Supermarket", 625, 3.6, "Packed fresh"),
      ],
    },
  },
];

export const pkr = (n: number) =>
  "Rs " + Math.round(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });
