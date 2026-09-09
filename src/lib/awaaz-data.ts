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

export function calculateSolar(type: SolarType, units: number, systemKw: number, batteryKwh: number, disco: Disco): SolarResult {
  if (type === "none") return { generation: 0, selfConsumed: 0, exported: 0, billAfterSolar: 0, monthlySavings: 0, independence: 0, backupHours: 0, summary: "" };
  const generation = systemKw * 5 * 0.77 * 30;
  const daytimeLoad = units * 0.45;
  const batteryBuffer = batteryKwh * 30 * 0.8;
  const selfConsumed = type === "on-grid" ? Math.min(generation, daytimeLoad) : type === "hybrid" ? Math.min(generation, daytimeLoad + batteryBuffer) : Math.min(generation, units);
  const exported = type === "off-grid" ? 0 : Math.max(0, generation - selfConsumed);
  const imports = Math.max(0, units - selfConsumed);
  const afterRows = slabBreakdownFor(imports, disco.slabs);
  const afterEnergy = afterRows.reduce((sum, row) => sum + row.amount, 0);
  const baseRows = slabBreakdownFor(units, disco.slabs);
  const baseEnergy = baseRows.reduce((sum, row) => sum + row.amount, 0);
  const baseBill = baseEnergy * (1 + disco.taxRate) + disco.fixedCharges;
  const solarBill = Math.max(0, afterEnergy * (1 + disco.taxRate) + disco.fixedCharges - exported * disco.slabs.at(-1)!.rate * 0.6);
  const backupHours = batteryKwh * 0.8 / 1.5;
  const independence = units ? selfConsumed / units * 100 : 0;
  const summary = type === "off-grid" ? `${Math.round(independence)}% grid-independent with approximately ${backupHours.toFixed(1)} hours of essential-load backup.` : `${Math.round(selfConsumed)} kWh offsets household use and ${Math.round(exported)} kWh is exported for net-metering credit.`;
  return { generation, selfConsumed, exported, billAfterSolar: solarBill, monthlySavings: baseBill - solarBill, independence, backupHours, summary };
}

export type Recipe = {
  id: string;
  name: string;
  urdu: string;
  minutes: number;
  serves: number;
  uses: string[];
  pantry: string[];
  steps: string[];
  costPkr: number;
};

export const ingredients = [
  "Roti / Naan",
  "Cooked Rice",
  "Daal",
  "Chicken Qorma",
  "Boiled Potatoes",
  "Tomatoes",
  "Onion",
  "Eggs",
  "Yogurt",
  "Paneer",
  "Spinach (Palak)",
  "Bread Slices",
  "Peas",
  "Carrots",
  "Green Chillies",
  "Coriander",
];

export const recipes: Recipe[] = [
  {
    id: "r1",
    name: "Leftover Rice Chicken Biryani Bowl",
    urdu: "بچے چاول کی بریانی",
    minutes: 20,
    serves: 3,
    uses: ["Cooked Rice", "Chicken Qorma", "Onion", "Yogurt"],
    pantry: ["Biryani masala", "Oil", "Lemon"],
    steps: [
      "Fry sliced onion in 2 tbsp oil until golden brown.",
      "Add the leftover qorma with 2 tbsp yogurt and 1 tsp biryani masala; cook 5 minutes.",
      "Layer the cooked rice on top, sprinkle 2 tbsp water, cover and steam on low for 8 minutes.",
      "Fluff gently, finish with lemon and coriander.",
    ],
    costPkr: 120,
  },
  {
    id: "r2",
    name: "Daal Ke Cutlets",
    urdu: "دال کے کٹلٹس",
    minutes: 25,
    serves: 4,
    uses: ["Daal", "Boiled Potatoes", "Onion", "Green Chillies", "Coriander"],
    pantry: ["Breadcrumbs", "Salt", "Red chilli", "Oil"],
    steps: [
      "Mash the leftover daal with boiled potatoes until the mixture holds shape.",
      "Mix in chopped onion, green chillies, coriander, salt and red chilli.",
      "Shape into patties and coat in breadcrumbs.",
      "Shallow fry 3 minutes per side until crisp. Serve with imli chutney.",
    ],
    costPkr: 90,
  },
  {
    id: "r3",
    name: "Roti Ka Churma Chaat",
    urdu: "روٹی چاٹ",
    minutes: 12,
    serves: 2,
    uses: ["Roti / Naan", "Yogurt", "Onion", "Tomatoes", "Coriander"],
    pantry: ["Chaat masala", "Imli chutney", "Oil"],
    steps: [
      "Cut leftover roti into squares and crisp them in a dry pan or air fryer.",
      "Top with whisked yogurt, chopped onion and tomato.",
      "Drizzle imli chutney, dust with chaat masala and coriander.",
    ],
    costPkr: 60,
  },
  {
    id: "r4",
    name: "Anda Bread Roll",
    urdu: "انڈا بریڈ رول",
    minutes: 15,
    serves: 2,
    uses: ["Bread Slices", "Eggs", "Boiled Potatoes", "Green Chillies"],
    pantry: ["Salt", "Zeera", "Oil"],
    steps: [
      "Mash potatoes with salt, zeera and chopped chillies.",
      "Flatten bread slices, fill with the mash and roll tightly.",
      "Dip in beaten egg and shallow fry until golden.",
    ],
    costPkr: 70,
  },
  {
    id: "r5",
    name: "Palak Paneer Bhurji",
    urdu: "پالک پنیر بھُرجی",
    minutes: 18,
    serves: 3,
    uses: ["Spinach (Palak)", "Paneer", "Tomatoes", "Onion"],
    pantry: ["Garlic", "Haldi", "Oil"],
    steps: [
      "Sauté onion and garlic, add chopped tomato and haldi.",
      "Add chopped spinach and cook until wilted.",
      "Crumble in paneer, toss 3 minutes and serve with roti.",
    ],
    costPkr: 180,
  },
  {
    id: "r6",
    name: "Veg Pulao Fried Rice",
    urdu: "سبزی فرائیڈ رائس",
    minutes: 14,
    serves: 3,
    uses: ["Cooked Rice", "Peas", "Carrots", "Eggs", "Onion"],
    pantry: ["Soy sauce", "Black pepper", "Oil"],
    steps: [
      "Scramble the eggs in hot oil and set aside.",
      "Stir-fry onion, carrot and peas on high heat for 3 minutes.",
      "Add cooked rice, soy sauce and pepper; toss for 4 minutes, fold the egg back in.",
    ],
    costPkr: 110,
  },
  {
    id: "r7",
    name: "Aloo Tamatar Salan",
    urdu: "آلو ٹماٹر سالن",
    minutes: 22,
    serves: 4,
    uses: ["Boiled Potatoes", "Tomatoes", "Onion", "Green Chillies"],
    pantry: ["Haldi", "Dhania powder", "Oil"],
    steps: [
      "Brown onions, add tomatoes with haldi and dhania powder until oil separates.",
      "Add cubed boiled potatoes and 1 cup water; simmer 10 minutes.",
      "Finish with green chillies and coriander.",
    ],
    costPkr: 85,
  },
  {
    id: "r8",
    name: "Dahi Baray Style Daal Balls",
    urdu: "دہی بڑے",
    minutes: 30,
    serves: 4,
    uses: ["Daal", "Yogurt", "Coriander"],
    pantry: ["Baking soda", "Chaat masala", "Oil"],
    steps: [
      "Whip leftover daal with a pinch of baking soda until light.",
      "Drop spoonfuls into hot oil and fry until golden.",
      "Soak in warm water 5 minutes, squeeze, and top with whisked yogurt and chaat masala.",
    ],
    costPkr: 130,
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

const mk = (
  market: string,
  price: number,
  distanceKm: number,
  note: string,
): MarketPrice => ({ market, price, distanceKm, note });

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
