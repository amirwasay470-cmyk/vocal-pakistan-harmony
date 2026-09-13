import { groceries, type City, type MarketPrice } from "./awaaz-data";

export type Category = "staple" | "fresh" | "dairy" | "meat" | "other";

export type PriceCard = {
  id: string;
  name: string;
  urdu: string;
  unit: string;
  category: Category;
  options: MarketPrice[];
  verifiedMinutesAgo: number;
  verifierName: string;
};

const KEYWORDS: { match: string[]; category: Category; unit: string; urdu?: string }[] = [
  {
    match: [
      "atta",
      "flour",
      "rice",
      "chawal",
      "sugar",
      "cheeni",
      "daal",
      "dal",
      "lentil",
      "chana",
      "masoor",
      "moong",
      "maash",
      "besan",
      "suji",
      "salt",
      "namak",
      "tea",
      "chai",
      "oil",
      "ghee",
      "tel",
    ],
    category: "staple",
    unit: "1 kg",
  },
  {
    match: [
      "tomato",
      "tamatar",
      "onion",
      "pyaz",
      "potato",
      "aloo",
      "lemon",
      "nimbu",
      "spinach",
      "palak",
      "bhindi",
      "karela",
      "gobi",
      "cabbage",
      "carrot",
      "gajar",
      "apple",
      "seb",
      "banana",
      "kela",
      "mango",
      "aam",
      "orange",
      "kinnow",
      "matar",
      "peas",
      "adrak",
      "ginger",
      "lehsan",
      "garlic",
      "mirch",
      "chilli",
      "dhania",
      "coriander",
      "sabzi",
      "fruit",
    ],
    category: "fresh",
    unit: "1 kg",
  },
  {
    match: [
      "milk",
      "doodh",
      "yogurt",
      "dahi",
      "curd",
      "butter",
      "makhan",
      "cheese",
      "paneer",
      "cream",
      "balai",
      "egg",
      "anda",
    ],
    category: "dairy",
    unit: "1 kg / litre",
  },
  {
    match: [
      "chicken",
      "murghi",
      "beef",
      "gosht",
      "mutton",
      "bakra",
      "fish",
      "machli",
      "keema",
      "qeema",
    ],
    category: "meat",
    unit: "1 kg",
  },
];

const BASE_PRICE: Record<Category, number> = {
  staple: 320,
  fresh: 130,
  dairy: 300,
  meat: 900,
  other: 250,
};

export function categorize(name: string): Category {
  const n = name.toLowerCase();
  for (const k of KEYWORDS) if (k.match.some((m) => n.includes(m))) return k.category;
  return "other";
}

function unitFor(cat: Category) {
  return KEYWORDS.find((k) => k.category === cat)?.unit ?? "1 unit";
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const SOURCE_SETS: Record<City, { market: string; km: number; note: string; kind: string }[]> = {
  Karachi: [
    { market: "Sabzi Mandi, Super Highway", km: 6.4, note: "Wholesale crate rate", kind: "mandi" },
    { market: "Khula Bazaar (Sunday)", km: 4.2, note: "Weekend open market", kind: "bazaar" },
    { market: "Utility Store", km: 1.8, note: "Government capped rate", kind: "utility" },
    { market: "Neighbourhood Kiryana", km: 0.4, note: "Nearest, loose sale", kind: "kiryana" },
    { market: "Chain Supermarket", km: 3.1, note: "Pre-packed, card accepted", kind: "super" },
  ],
  Lahore: [
    { market: "Badami Bagh Mandi", km: 8.2, note: "Wholesale crate rate", kind: "mandi" },
    { market: "Sasta Bazaar, Township", km: 3.8, note: "Subsidised weekly bazaar", kind: "bazaar" },
    { market: "Utility Store", km: 2.2, note: "Government capped rate", kind: "utility" },
    { market: "Kiryana Store", km: 0.5, note: "Home delivery available", kind: "kiryana" },
    { market: "Chain Supermarket", km: 4.0, note: "Weekend discount", kind: "super" },
  ],
  Islamabad: [
    { market: "Fruit & Veg Mandi, I-11", km: 7.1, note: "Wholesale crate rate", kind: "mandi" },
    {
      market: "Sunday Bazaar (Peshawar Mor)",
      km: 5.5,
      note: "Government rate list",
      kind: "bazaar",
    },
    { market: "Utility Store", km: 2.0, note: "Government capped rate", kind: "utility" },
    { market: "Kiryana Store", km: 0.6, note: "Nearest option", kind: "kiryana" },
    { market: "Chain Supermarket", km: 3.6, note: "Loyalty points", kind: "super" },
  ],
};

const MULT: Record<string, Record<Category, number>> = {
  mandi: { staple: 0.9, fresh: 0.72, dairy: 1.04, meat: 0.86, other: 0.88 },
  bazaar: { staple: 0.94, fresh: 0.8, dairy: 1.0, meat: 0.92, other: 0.92 },
  utility: { staple: 0.88, fresh: 0.98, dairy: 0.94, meat: 0.97, other: 0.95 },
  kiryana: { staple: 1.1, fresh: 1.18, dairy: 0.99, meat: 1.12, other: 1.12 },
  super: { staple: 1.06, fresh: 1.32, dairy: 1.02, meat: 1.2, other: 1.18 },
};

const VERIFIERS = ["Ayesha", "Bilal", "Faiza", "Hamza", "Nadia", "Usman", "Zainab", "Imran"];

export function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

export function buildPriceCard(rawName: string, city: City): PriceCard {
  const name = rawName.trim();
  const id = slugify(name);

  const known = groceries.find(
    (g) => g.id === id || g.name.toLowerCase().includes(name.toLowerCase()) || g.urdu === name,
  );

  const seed = hash(id + city);

  if (known) {
    const options = [...(known.prices[city] ?? [])].sort((a, b) => a.price - b.price);
    return {
      id: known.id,
      name: known.name,
      urdu: known.urdu,
      unit: known.unit,
      category: categorize(known.name),
      options,
      verifiedMinutesAgo: (seed % 55) + 4,
      verifierName: VERIFIERS[seed % VERIFIERS.length]!,
    };
  }

  const category = categorize(name);
  const base = BASE_PRICE[category] * (0.75 + (seed % 60) / 100);
  const options = SOURCE_SETS[city]
    .map((s) => ({
      market: s.market,
      price: Math.round((base * MULT[s.kind]![category]) / 5) * 5,
      distanceKm: s.km,
      note: s.note,
    }))
    .sort((a, b) => a.price - b.price);

  return {
    id,
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    urdu: "—",
    unit: unitFor(category),
    category,
    options,
    verifiedMinutesAgo: (seed % 55) + 4,
    verifierName: VERIFIERS[seed % VERIFIERS.length]!,
  };
}

export function routingAdvice(category: Category): string {
  switch (category) {
    case "staple":
      return "Buy at Utility Store / Sasta Bazaar — capped rates on packaged staples.";
    case "fresh":
      return "Buy at Khula Bazaar or Sabzi Mandi — fresh produce is cheapest early morning.";
    case "dairy":
      return "Buy at the utility store or your local dairy/kiryana — freshness matters more than the small saving.";
    case "meat":
      return "Buy at the wholesale poultry/meat point — order a day ahead for the best rate.";
    default:
      return "Compare kiryana and supermarket rates — savings here are modest.";
  }
}
