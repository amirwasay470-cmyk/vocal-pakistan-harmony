import type { City } from "./awaaz-data";

/** Deterministic pseudo-random so the same item/city always shows the same weekly trend. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type Trend = {
  /** percentage change vs last week, positive = costlier */
  pct: number;
  direction: "up" | "down" | "flat";
  label: string;
};

export function weeklyTrend(key: string, city: City): Trend {
  const seed = hash(`${key}|${city}`);
  const raw = ((seed % 191) - 95) / 10; // -9.5% .. +9.5%
  const pct = Math.round(raw * 10) / 10;
  const direction = pct > 0.4 ? "up" : pct < -0.4 ? "down" : "flat";
  const label =
    direction === "up"
      ? `Up ${Math.abs(pct)}% this week`
      : direction === "down"
        ? `Down ${Math.abs(pct)}% this week`
        : "Steady this week";
  return { pct, direction, label };
}

/* ------------------------------------------------------------------ */
/* Bazaar wholesale board — essentials by city & market                */
/* ------------------------------------------------------------------ */

export type BazaarMarket = { id: string; name: string; kind: string };

export const cityMarkets: Record<City, BazaarMarket[]> = {
  Karachi: [
    { id: "khi-mandi", name: "Sabzi Mandi, Super Highway", kind: "Wholesale mandi" },
    { id: "khi-jodia", name: "Jodia Bazaar", kind: "Grain & grocery wholesale" },
    { id: "khi-utility", name: "Utility Store", kind: "Government rate" },
    { id: "khi-itwar", name: "Itwar Bazaar", kind: "Weekly bazaar" },
  ],
  Lahore: [
    { id: "lhr-badami", name: "Badami Bagh Mandi", kind: "Wholesale mandi" },
    { id: "lhr-akbari", name: "Akbari Mandi", kind: "Grain & grocery wholesale" },
    { id: "lhr-utility", name: "Utility Store", kind: "Government rate" },
    { id: "lhr-sasta", name: "Sasta Bazaar, Township", kind: "Subsidised bazaar" },
  ],
  Islamabad: [
    { id: "isb-i11", name: "Fruit & Veg Mandi, I-11", kind: "Wholesale mandi" },
    { id: "isb-sunday", name: "Sunday Bazaar, Peshawar Mor", kind: "Weekly bazaar" },
    { id: "isb-utility", name: "Utility Store", kind: "Government rate" },
    { id: "isb-kiryana", name: "Sector Kiryana", kind: "Retail" },
  ],
};

export type Essential = {
  id: string;
  name: string;
  urdu: string;
  unit: string;
  /** base wholesale rate per city */
  base: Record<City, number>;
};

export const essentials: Essential[] = [
  {
    id: "atta",
    name: "Atta (Wheat Flour)",
    urdu: "آٹا",
    unit: "10 kg bag",
    base: { Karachi: 1180, Lahore: 1145, Islamabad: 1210 },
  },
  {
    id: "ghee",
    name: "Ghee / Cooking Oil",
    urdu: "گھی",
    unit: "1 kg tin",
    base: { Karachi: 560, Lahore: 548, Islamabad: 570 },
  },
  {
    id: "sugar",
    name: "Sugar (Cheeni)",
    urdu: "چینی",
    unit: "1 kg",
    base: { Karachi: 152, Lahore: 148, Islamabad: 155 },
  },
  {
    id: "rice",
    name: "Rice (Sella)",
    urdu: "چاول",
    unit: "1 kg",
    base: { Karachi: 245, Lahore: 238, Islamabad: 252 },
  },
  {
    id: "daal-chana",
    name: "Daal Chana",
    urdu: "دال چنا",
    unit: "1 kg",
    base: { Karachi: 320, Lahore: 312, Islamabad: 328 },
  },
  {
    id: "tomato",
    name: "Tomatoes",
    urdu: "ٹماٹر",
    unit: "1 kg",
    base: { Karachi: 95, Lahore: 88, Islamabad: 92 },
  },
  {
    id: "onion",
    name: "Onions (Pyaz)",
    urdu: "پیاز",
    unit: "1 kg",
    base: { Karachi: 78, Lahore: 72, Islamabad: 80 },
  },
  {
    id: "potato",
    name: "Potatoes (Aloo)",
    urdu: "آلو",
    unit: "1 kg",
    base: { Karachi: 68, Lahore: 62, Islamabad: 70 },
  },
];

const MARKET_MULT: Record<string, number> = {
  "Wholesale mandi": 1,
  "Grain & grocery wholesale": 1.02,
  "Government rate": 1.05,
  "Weekly bazaar": 1.04,
  "Subsidised bazaar": 1.01,
  Retail: 1.18,
};

export type EssentialRow = {
  id: string;
  name: string;
  urdu: string;
  unit: string;
  price: number;
  lastWeek: number;
  trend: Trend;
};

export function essentialsBoard(city: City, market: BazaarMarket): EssentialRow[] {
  const mult = MARKET_MULT[market.kind] ?? 1.05;
  return essentials.map((e) => {
    const trend = weeklyTrend(`${e.id}|${market.id}`, city);
    const price = Math.round((e.base[city] * mult) / 1) ;
    const lastWeek = Math.round(price / (1 + trend.pct / 100));
    return { id: e.id, name: e.name, urdu: e.urdu, unit: e.unit, price, lastWeek, trend };
  });
}
