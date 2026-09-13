/** "Jugaad Kitchen" — visual pantry grid + Desi Remix transformation engine. */

export type PantryItem = {
  id: string;
  /** the label used by the existing recipe matcher */
  match: string;
  name: string;
  urdu: string;
  emoji: string;
  /** typical PKR value of the leftover portion that would otherwise be binned */
  wastePkr: number;
};

export const pantryGrid: PantryItem[] = [
  { id: "roti", match: "Roti / Naan", name: "Roti", urdu: "روٹی", emoji: "🫓", wastePkr: 40 },
  { id: "daal", match: "Daal", name: "Daal", urdu: "دال", emoji: "🥣", wastePkr: 90 },
  { id: "rice", match: "Cooked Rice", name: "Rice", urdu: "چاول", emoji: "🍚", wastePkr: 80 },
  { id: "salan", match: "Chicken Qorma", name: "Salan", urdu: "سالن", emoji: "🍛", wastePkr: 220 },
  { id: "aloo", match: "Boiled Potatoes", name: "Aloo", urdu: "آلو", emoji: "🥔", wastePkr: 50 },
  { id: "pyaz", match: "Onion", name: "Pyaz", urdu: "پیاز", emoji: "🧅", wastePkr: 35 },
  { id: "tamatar", match: "Tomatoes", name: "Tamatar", urdu: "ٹماٹر", emoji: "🍅", wastePkr: 45 },
  { id: "anda", match: "Eggs", name: "Anday", urdu: "انڈے", emoji: "🥚", wastePkr: 60 },
  { id: "dahi", match: "Yogurt", name: "Dahi", urdu: "دہی", emoji: "🥛", wastePkr: 70 },
  { id: "paneer", match: "Paneer", name: "Paneer", urdu: "پنیر", emoji: "🧀", wastePkr: 150 },
  { id: "palak", match: "Spinach (Palak)", name: "Palak", urdu: "پالک", emoji: "🥬", wastePkr: 55 },
  {
    id: "bread",
    match: "Bread Slices",
    name: "Bread",
    urdu: "ڈبل روٹی",
    emoji: "🍞",
    wastePkr: 45,
  },
  { id: "matar", match: "Peas", name: "Matar", urdu: "مٹر", emoji: "🫛", wastePkr: 50 },
  { id: "gajar", match: "Carrots", name: "Gajar", urdu: "گاجر", emoji: "🥕", wastePkr: 40 },
  {
    id: "mirch",
    match: "Green Chillies",
    name: "Hari Mirch",
    urdu: "ہری مرچ",
    emoji: "🌶️",
    wastePkr: 20,
  },
  { id: "dhania", match: "Coriander", name: "Dhania", urdu: "دھنیا", emoji: "🌿", wastePkr: 20 },
];

export type Remix = {
  id: string;
  title: string;
  urdu: string;
  emoji: string;
  /** pantry ids required */
  needs: string[];
  minutes: number;
  idea: string;
  savesPkr: number;
};

/** Creative "second life" transformations, keyed on the tapped pantry tiles. */
export const remixes: Remix[] = [
  {
    id: "rx-roti-pizza",
    title: "Roti Pizza",
    urdu: "روٹی پیزا",
    emoji: "🍕",
    needs: ["roti", "tamatar"],
    minutes: 10,
    idea: "Spread crushed tamatar and chilli on stale roti, top with anything cheesy, and crisp it on a tawa with the lid on.",
    savesPkr: 280,
  },
  {
    id: "rx-daal-cutlet",
    title: "Daal Ke Cutlets",
    urdu: "دال کے کٹلٹس",
    emoji: "🥙",
    needs: ["daal", "aloo"],
    minutes: 25,
    idea: "Mash yesterday's daal with aloo, bind with breadcrumbs, and shallow-fry into crisp evening cutlets.",
    savesPkr: 320,
  },
  {
    id: "rx-rice-kebab",
    title: "Chawal Ke Kebab",
    urdu: "چاول کے کباب",
    emoji: "🍢",
    needs: ["rice", "pyaz"],
    minutes: 18,
    idea: "Bind cold rice with pyaz, egg and green chilli, then pan-fry into tikkis that taste nothing like leftovers.",
    savesPkr: 260,
  },
  {
    id: "rx-salan-paratha",
    title: "Salan Stuffed Paratha",
    urdu: "سالن پراٹھا",
    emoji: "🥟",
    needs: ["salan"],
    minutes: 15,
    idea: "Dry out the leftover salan on high heat, stuff it into paratha dough, and griddle for a full breakfast.",
    savesPkr: 400,
  },
  {
    id: "rx-roti-churma",
    title: "Roti Churma Chaat",
    urdu: "روٹی چاٹ",
    emoji: "🥗",
    needs: ["roti", "dahi"],
    minutes: 12,
    idea: "Crisp roti squares, smother with dahi, imli chutney and chaat masala for an instant iftar-style chaat.",
    savesPkr: 240,
  },
  {
    id: "rx-daal-soup",
    title: "Daal Shorba",
    urdu: "دال شوربہ",
    emoji: "🍲",
    needs: ["daal", "tamatar"],
    minutes: 14,
    idea: "Blend daal with tomato, garlic and a lemon squeeze into a thin winter shorba served with roti croutons.",
    savesPkr: 210,
  },
  {
    id: "rx-rice-kheer",
    title: "Quick Chawal Kheer",
    urdu: "چاول کی کھیر",
    emoji: "🍮",
    needs: ["rice", "dahi"],
    minutes: 22,
    idea: "Simmer leftover rice in milk with sugar and elaichi — dessert from what was heading to the bin.",
    savesPkr: 300,
  },
  {
    id: "rx-anda-bread",
    title: "Anda Bread Roll",
    urdu: "انڈا بریڈ رول",
    emoji: "🌯",
    needs: ["bread", "anda"],
    minutes: 15,
    idea: "Flatten stale bread, fill with spiced aloo, roll, dip in egg and fry golden.",
    savesPkr: 190,
  },
  {
    id: "rx-palak-bhurji",
    title: "Palak Paneer Bhurji",
    urdu: "پالک پنیر بھُرجی",
    emoji: "🥘",
    needs: ["palak", "paneer"],
    minutes: 18,
    idea: "Wilt tired palak with tomato and crumble paneer through it for a fresh sabzi.",
    savesPkr: 350,
  },
  {
    id: "rx-veg-fried-rice",
    title: "Desi Fried Rice",
    urdu: "دیسی فرائیڈ رائس",
    emoji: "🍛",
    needs: ["rice", "matar"],
    minutes: 14,
    idea: "Toss cold rice on high flame with matar, gajar and scrambled anda — the wok heat hides the leftovers.",
    savesPkr: 230,
  },
  {
    id: "rx-aloo-tamatar",
    title: "Aloo Tamatar Salan",
    urdu: "آلو ٹماٹر سالن",
    emoji: "🥔",
    needs: ["aloo", "tamatar"],
    minutes: 22,
    idea: "Turn boiled aloo and soft tomatoes into a thin salan that stretches to feed the whole family with roti.",
    savesPkr: 200,
  },
  {
    id: "rx-dahi-baray",
    title: "Dahi Baray from Daal",
    urdu: "دہی بڑے",
    emoji: "🍡",
    needs: ["daal", "dahi"],
    minutes: 30,
    idea: "Whip the daal light with a pinch of soda, fry into baray and soak in dahi with chaat masala.",
    savesPkr: 340,
  },
];

export type RemixMatch = Remix & { have: string[]; missing: string[]; score: number };

export function remixFor(selectedIds: string[]): RemixMatch[] {
  return remixes
    .map((r) => {
      const have = r.needs.filter((n) => selectedIds.includes(n));
      const missing = r.needs.filter((n) => !selectedIds.includes(n));
      return { ...r, have, missing, score: have.length / r.needs.length };
    })
    .filter((r) => r.have.length > 0)
    .sort((a, b) => b.score - a.score || b.savesPkr - a.savesPkr);
}

/** Weekly grocery savings from rescuing the tapped leftovers. */
export function weeklySavings(selectedIds: string[], cookedIds: string[]) {
  const rescued = pantryGrid.filter((p) => selectedIds.includes(p.id));
  const potential = rescued.reduce((s, p) => s + p.wastePkr, 0) * 3; // roughly 3 leftover cycles a week
  const banked = remixes
    .filter((r) => cookedIds.includes(r.id))
    .reduce((s, r) => s + r.savesPkr, 0);
  return { potential, banked, monthly: banked * 4 };
}

export const pantryById = Object.fromEntries(pantryGrid.map((p) => [p.id, p]));
