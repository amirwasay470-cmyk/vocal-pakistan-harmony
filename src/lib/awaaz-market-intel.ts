import { type City } from "./awaaz-data";

export type EssentialCommodity = {
  id: string;
  name: string;
  urdu: string;
  category: "staple" | "vegetable" | "poultry" | "oil";
  unit: string;
  // Variants (e.g. 10kg vs 20kg for Atta, Live vs Meat for Chicken)
  variants?: { id: string; label: string; unit: string; multiplier: number }[];
  // Baseline rates per city
  rates: Record<
    City,
    {
      dcOfficial: number; // Official DC / Utility store ceiling
      openMarket: number; // Open market general retail rate
      weeklyChangePct: number; // % change vs last week
      supplyStatus: "stable" | "surge" | "moderating" | "seasonal_high";
      dcNote: string;
      marketNote: string;
    }
  >;
};

export const ESSENTIAL_COMMODITIES: EssentialCommodity[] = [
  {
    id: "atta",
    name: "Wheat Flour (Atta)",
    urdu: "گندم کا آٹا",
    category: "staple",
    unit: "10 kg bag",
    variants: [
      { id: "10kg", label: "10 kg bag", unit: "10 kg bag", multiplier: 1 },
      { id: "20kg", label: "20 kg bag", unit: "20 kg bag", multiplier: 1.95 },
    ],
    rates: {
      Karachi: {
        dcOfficial: 1180,
        openMarket: 1390,
        weeklyChangePct: -1.8,
        supplyStatus: "stable",
        dcNote: "Government subsidised flour at Utility Stores",
        marketNote: "Chakki & branded fine flour selling higher in local retail",
      },
      Lahore: {
        dcOfficial: 1140,
        openMarket: 1350,
        weeklyChangePct: -2.4,
        supplyStatus: "stable",
        dcNote: "Punjab Food Dept subsidised green bags",
        marketNote: "Open market mills flour steady following provincial release",
      },
      Islamabad: {
        dcOfficial: 1200,
        openMarket: 1420,
        weeklyChangePct: 0.5,
        supplyStatus: "stable",
        dcNote: "ICT Administration fair price shops",
        marketNote: "Sector Kiryana stores charging retail packaging markup",
      },
    },
  },
  {
    id: "sugar",
    name: "Sugar (Cheeni)",
    urdu: "چینی (ریفائنڈ)",
    category: "staple",
    unit: "1 kg",
    rates: {
      Karachi: {
        dcOfficial: 140,
        openMarket: 165,
        weeklyChangePct: 2.1,
        supplyStatus: "moderating",
        dcNote: "Utility Stores Corporation ration quota",
        marketNote: "Jodia Bazaar wholesale steady, retail adds Rs 15-20 margin",
      },
      Lahore: {
        dcOfficial: 138,
        openMarket: 160,
        weeklyChangePct: 1.2,
        supplyStatus: "moderating",
        dcNote: "District administration controlled rate",
        marketNote: "Akbari Mandi wholesale Rs 146/kg, retail loose Rs 160",
      },
      Islamabad: {
        dcOfficial: 142,
        openMarket: 168,
        weeklyChangePct: 1.8,
        supplyStatus: "moderating",
        dcNote: "Utility store price cap",
        marketNote: "Local grocers stocking branded 1kg packets at Rs 175",
      },
    },
  },
  {
    id: "chicken",
    name: "Broiler Chicken",
    urdu: "برائلر مرغی",
    category: "poultry",
    unit: "1 kg meat",
    variants: [
      { id: "meat", label: "Clean Meat (Gosht)", unit: "1 kg meat", multiplier: 1 },
      { id: "live", label: "Live Bird (Zinda)", unit: "1 kg live", multiplier: 0.65 },
    ],
    rates: {
      Karachi: {
        dcOfficial: 535,
        openMarket: 610,
        weeklyChangePct: 4.8,
        supplyStatus: "surge",
        dcNote: "Karachi Commissionerate daily chicken circular",
        marketNote: "Feed cost and poultry farm supply crunch in interior Sindh",
      },
      Lahore: {
        dcOfficial: 495,
        openMarket: 565,
        weeklyChangePct: 3.5,
        supplyStatus: "surge",
        dcNote: "Lahore DC daily meat bulletin",
        marketNote: "Tollinton market wholesale up due to broiler mortality",
      },
      Islamabad: {
        dcOfficial: 520,
        openMarket: 595,
        weeklyChangePct: 5.1,
        supplyStatus: "surge",
        dcNote: "ICT Food Directorate rate list",
        marketNote: "Rawalpindi wholesale mandi rate fluctuations impacting capital",
      },
    },
  },
  {
    id: "oil",
    name: "Cooking Oil / Ghee",
    urdu: "کوکنگ آئل / بناسپتی گھی",
    category: "oil",
    unit: "1 Litre / kg pouch",
    rates: {
      Karachi: {
        dcOfficial: 485,
        openMarket: 555,
        weeklyChangePct: -0.8,
        supplyStatus: "stable",
        dcNote: "Subsidized utility brand palm olein blend",
        marketNote: "Tier-1 national brands retailing between Rs 550 - 580",
      },
      Lahore: {
        dcOfficial: 475,
        openMarket: 545,
        weeklyChangePct: -1.2,
        supplyStatus: "stable",
        dcNote: "Subsidized kiosk quota price",
        marketNote: "Loose tin refill at wholesale mandi at Rs 515/kg",
      },
      Islamabad: {
        dcOfficial: 490,
        openMarket: 565,
        weeklyChangePct: 0.0,
        supplyStatus: "stable",
        dcNote: "USC subsidized 1L pouch",
        marketNote: "Branded canola/sunflower blends commanding Rs 620+",
      },
    },
  },
  {
    id: "onion",
    name: "Onions (Pyaz)",
    urdu: "پیاز (درمیانی)",
    category: "vegetable",
    unit: "1 kg",
    rates: {
      Karachi: {
        dcOfficial: 75,
        openMarket: 98,
        weeklyChangePct: -5.4,
        supplyStatus: "moderating",
        dcNote: "Sabzi Mandi DC notified first grade",
        marketNote: "Fresh Sindh crop arrivals easing market pressure",
      },
      Lahore: {
        dcOfficial: 70,
        openMarket: 90,
        weeklyChangePct: -6.2,
        supplyStatus: "moderating",
        dcNote: "Badami Bagh auction guideline rate",
        marketNote: "Local supply inflow stabilizing retail carts",
      },
      Islamabad: {
        dcOfficial: 78,
        openMarket: 105,
        weeklyChangePct: -3.8,
        supplyStatus: "moderating",
        dcNote: "I-11 Mandi official market committee rate",
        marketNote: "Sector carts adding transit & sorting premium",
      },
    },
  },
  {
    id: "potato",
    name: "Potatoes (Aloo)",
    urdu: "آلو (نیا / سفید)",
    category: "vegetable",
    unit: "1 kg",
    rates: {
      Karachi: {
        dcOfficial: 62,
        openMarket: 82,
        weeklyChangePct: 1.5,
        supplyStatus: "stable",
        dcNote: "Official notified auction ceiling",
        marketNote: "Cold storage supplies meeting metropolitan demand",
      },
      Lahore: {
        dcOfficial: 55,
        openMarket: 72,
        weeklyChangePct: 0.8,
        supplyStatus: "stable",
        dcNote: "Punjab market committee rate",
        marketNote: "Punjab potato belt close proximity keeps rates lowest",
      },
      Islamabad: {
        dcOfficial: 65,
        openMarket: 85,
        weeklyChangePct: 2.2,
        supplyStatus: "stable",
        dcNote: "ICT agriculture rate circular",
        marketNote: "Clean washed grade A potatoes at retail Rs 85-90",
      },
    },
  },
  {
    id: "tomato",
    name: "Tomatoes (Tamatar)",
    urdu: "ٹماٹر (تازہ فارمی)",
    category: "vegetable",
    unit: "1 kg",
    rates: {
      Karachi: {
        dcOfficial: 95,
        openMarket: 145,
        weeklyChangePct: 18.5,
        supplyStatus: "surge",
        dcNote: "Auction benchmark (short supply)",
        marketNote: "Monsoon highway disruptions pinching Balochistan crate arrivals",
      },
      Lahore: {
        dcOfficial: 90,
        openMarket: 138,
        weeklyChangePct: 16.2,
        supplyStatus: "surge",
        dcNote: "Market committee control rate",
        marketNote: "High transit spoilage pushing street thela rates up to Rs 150",
      },
      Islamabad: {
        dcOfficial: 98,
        openMarket: 155,
        weeklyChangePct: 21.0,
        supplyStatus: "surge",
        dcNote: "Official mandi list ceiling",
        marketNote: "Severe supply tightness; Itwar Bazaar cheapest outlet",
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Channel Comparison Profiles                                        */
/* ------------------------------------------------------------------ */

export type ChannelId = "itwar_bazaar" | "kirana" | "superstore";

export type SourcingChannel = {
  id: ChannelId;
  name: string;
  tagline: string;
  examples: string[];
  priceMultiplier: number;
  convenienceRating: number; // 1-5
  qualityRating: number; // 1-5
  paymentModes: string;
  bestFor: string;
  drawbacks: string;
};

export const SOURCING_CHANNELS: Record<ChannelId, SourcingChannel> = {
  itwar_bazaar: {
    id: "itwar_bazaar",
    name: "Sunday & Itwar Bazaars",
    tagline: "Subsidized direct farmers & wholesale weekly market",
    examples: [
      "Sunday Bazaar Peshawar Mor (ISB)",
      "Itwar Bazaar Clifton / Gulshan (KHI)",
      "Model Bazaar Township (LHR)",
    ],
    priceMultiplier: 0.84, // ~16% below retail
    convenienceRating: 3,
    qualityRating: 4,
    paymentModes: "Cash only (occasional Easypaisa)",
    bestFor: "Fresh produce (tomatoes, onions, potatoes), bulk greens, seasonal fruits",
    drawbacks: "Open once or twice weekly; requires travel and carrying heavy sacks",
  },
  kirana: {
    id: "kirana",
    name: "Neighborhood Kirana Stores",
    tagline: "Corner general merchants & thela carts within 200m",
    examples: ["Mohalla General Store", "Street Sabzi Cart", "Local Milk & Dairy Shop"],
    priceMultiplier: 1.0, // standard benchmark
    convenienceRating: 5,
    qualityRating: 3.5,
    paymentModes: "Cash, Khata / Monthly credit, Raast",
    bestFor: "Urgent daily essentials, emergency milk, loose spices, khata ledger flexibility",
    drawbacks: "Higher markups (+15-25% on vegetables); loose weights occasionally inaccurate",
  },
  superstore: {
    id: "superstore",
    name: "Large-Scale Supermarkets",
    tagline: "Organized hypermarkets and national retail chains",
    examples: [
      "Imtiaz Super Market",
      "Carrefour Pakistan",
      "Naheed Supermarket",
      "Metro Cash & Carry",
    ],
    priceMultiplier: 1.08, // higher on fresh, competitive on dry staples
    convenienceRating: 4.5,
    qualityRating: 4.5,
    paymentModes: "Credit/Debit Cards, Loyalty Points, Digital Wallets",
    bestFor: "Branded packaged staples, bundle promotions, certified hygienic meat, card cashbacks",
    drawbacks: "Highest prices on fresh vegetables (+30-40%); impulsive aisle spending traps",
  },
};

/* ------------------------------------------------------------------ */
/* Standard Household Weekly Basket Definition                        */
/* ------------------------------------------------------------------ */

export type BasketItem = {
  id: string;
  commodityId: string;
  name: string;
  urdu: string;
  defaultQty: number;
  unit: string;
  baseRatePerUnit: Record<City, number>; // open market baseline
};

export const STANDARD_WEEKLY_BASKET: BasketItem[] = [
  {
    id: "b-atta",
    commodityId: "atta",
    name: "Wheat Flour (Atta)",
    urdu: "گندم کا آٹا",
    defaultQty: 1, // 1 bag of 10kg
    unit: "10kg bag",
    baseRatePerUnit: { Karachi: 1390, Lahore: 1350, Islamabad: 1420 },
  },
  {
    id: "b-sugar",
    commodityId: "sugar",
    name: "Refined Sugar",
    urdu: "چینی",
    defaultQty: 2,
    unit: "kg",
    baseRatePerUnit: { Karachi: 165, Lahore: 160, Islamabad: 168 },
  },
  {
    id: "b-chicken",
    commodityId: "chicken",
    name: "Broiler Chicken Meat",
    urdu: "مرغی گوشت",
    defaultQty: 2,
    unit: "kg",
    baseRatePerUnit: { Karachi: 610, Lahore: 565, Islamabad: 595 },
  },
  {
    id: "b-oil",
    commodityId: "oil",
    name: "Cooking Oil / Ghee",
    urdu: "کوکنگ آئل",
    defaultQty: 2,
    unit: "litre",
    baseRatePerUnit: { Karachi: 555, Lahore: 545, Islamabad: 565 },
  },
  {
    id: "b-onion",
    commodityId: "onion",
    name: "Onions (Pyaz)",
    urdu: "پیاز",
    defaultQty: 3,
    unit: "kg",
    baseRatePerUnit: { Karachi: 98, Lahore: 90, Islamabad: 105 },
  },
  {
    id: "b-potato",
    commodityId: "potato",
    name: "Potatoes (Aloo)",
    urdu: "آلو",
    defaultQty: 3,
    unit: "kg",
    baseRatePerUnit: { Karachi: 82, Lahore: 72, Islamabad: 85 },
  },
  {
    id: "b-tomato",
    commodityId: "tomato",
    name: "Tomatoes (Tamatar)",
    urdu: "ٹماٹر",
    defaultQty: 2,
    unit: "kg",
    baseRatePerUnit: { Karachi: 145, Lahore: 138, Islamabad: 155 },
  },
  {
    id: "b-daal",
    commodityId: "daal",
    name: "Daal Chana",
    urdu: "دال چنا",
    defaultQty: 1,
    unit: "kg",
    baseRatePerUnit: { Karachi: 330, Lahore: 315, Islamabad: 340 },
  },
  {
    id: "b-rice",
    commodityId: "rice",
    name: "Basmati Rice (Kernel)",
    urdu: "باسمتی چاول",
    defaultQty: 2,
    unit: "kg",
    baseRatePerUnit: { Karachi: 290, Lahore: 275, Islamabad: 300 },
  },
];

/* Channel price multipliers per commodity category */
export const CHANNEL_CATEGORY_MULTIPLIERS: Record<ChannelId, Record<string, number>> = {
  itwar_bazaar: {
    staple: 0.9,
    poultry: 0.88,
    oil: 0.94,
    vegetable: 0.72, // biggest savings on vegetables!
  },
  kirana: {
    staple: 1.0,
    poultry: 1.0,
    oil: 1.0,
    vegetable: 1.0,
  },
  superstore: {
    staple: 0.96, // hypermarkets offer slight bundle discounts on branded staples
    poultry: 1.08,
    oil: 0.98,
    vegetable: 1.32, // fresh produce at superstores carries heavy packaging markup
  },
};

export function calculateChannelBasket(
  city: City,
  quantities: Record<string, number>,
): Record<
  ChannelId,
  {
    total: number;
    breakdown: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
  }
> {
  const result: Record<
    ChannelId,
    {
      total: number;
      breakdown: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
    }
  > = {
    itwar_bazaar: { total: 0, breakdown: [] },
    kirana: { total: 0, breakdown: [] },
    superstore: { total: 0, breakdown: [] },
  };

  STANDARD_WEEKLY_BASKET.forEach((item) => {
    const qty = quantities[item.id] ?? item.defaultQty;
    if (qty <= 0) return;

    const baseRate = item.baseRatePerUnit[city];
    const category =
      item.id.includes("atta") ||
      item.id.includes("sugar") ||
      item.id.includes("daal") ||
      item.id.includes("rice")
        ? "staple"
        : item.id.includes("chicken")
          ? "poultry"
          : item.id.includes("oil")
            ? "oil"
            : "vegetable";

    (["itwar_bazaar", "kirana", "superstore"] as ChannelId[]).forEach((ch) => {
      const mult = CHANNEL_CATEGORY_MULTIPLIERS[ch][category] ?? 1;
      const unitPrice = Math.round(baseRate * mult);
      const lineTotal = unitPrice * qty;

      result[ch].total += lineTotal;
      result[ch].breakdown.push({
        name: item.name,
        qty,
        unitPrice,
        lineTotal,
      });
    });
  });

  return result;
}

/* ------------------------------------------------------------------ */
/* Inflation Surge & Seasonal Substitution Intelligence               */
/* ------------------------------------------------------------------ */

export type InflationAlert = {
  id: string;
  item: string;
  urdu: string;
  severity: "high" | "moderate" | "favorable";
  weeklySurge: string;
  driverReason: string;
  recommendedAction: string;
  culinarySubstitution: {
    title: string;
    description: string;
    estimatedSavingsMonthly: number;
  };
};

export const INFLATION_ALERTS: InflationAlert[] = [
  {
    id: "tomato-surge",
    item: "Tomatoes (Tamatar)",
    urdu: "ٹماٹر کی قیمت میں تیزی",
    severity: "high",
    weeklySurge: "+18% to +21% jump across provincial wholesale mandis",
    driverReason: "Supply gap between Balochistan harvest transit rains and KPK new crop arrivals.",
    recommendedAction:
      "Avoid buying ripe tomatoes from neighborhood thelas at Rs 150/kg; utilize culinary curd and tamarind bases.",
    culinarySubstitution: {
      title: "Dahi (Yogurt) + Imli Pulp Gravy Base",
      description:
        "Whisk 2 tablespoons of sour curd (dahi) with 1 tsp tamarind (imli) water or amchur powder when frying bhuna onions. It produces the identical tangy, velvety richness in chicken qorma, aloo salan, and daal without using expensive fresh tomatoes.",
      estimatedSavingsMonthly: 1200,
    },
  },
  {
    id: "poultry-spike",
    item: "Broiler Chicken (Murghi)",
    urdu: "مرغی اور فیڈ کی قیمت",
    severity: "high",
    weeklySurge: "+4.5% to +5.1% over past 10 days",
    driverReason:
      "Soybean meal and poultry feed import tariff adjustments, plus farm summer mortalities.",
    recommendedAction: "Swap two weekly chicken dinner rotations with whole pulses or egg curries.",
    culinarySubstitution: {
      title: "Kala Chana & Lobia (Black-Eyed Peas) Protein Swap",
      description:
        "Black chickpeas (kala chana) and white lobia deliver 22g-24g of high-quality plant protein per 100g at Rs 320/kg (versus chicken meat at Rs 600/kg). Cook with cumin, ginger, and green chillies for a robust family dinner at 1/3rd the cost.",
      estimatedSavingsMonthly: 2400,
    },
  },
  {
    id: "oil-efficiency",
    item: "Cooking Oil / Banaspati Ghee",
    urdu: "کوکنگ آئل میں بچت کے طریقے",
    severity: "moderate",
    weeklySurge: "Stable at elevated levels (Rs 540 - 580/L)",
    driverReason: "Global crude palm oil import prices hovering near peak corridor.",
    recommendedAction:
      "Measure oil consumption with a brush or tablespoon rather than free-pouring from pouches.",
    culinarySubstitution: {
      title: "Stainless Steel Dispenser & Water-Steam Searing",
      description:
        "Using a fine-pour nozzle dispenser or silicone oil brush on tawa rotis reduces family monthly oil consumption from 4 litres down to 2.5 litres without altering flavor, eliminating over-greasy curries.",
      estimatedSavingsMonthly: 850,
    },
  },
  {
    id: "onion-stretching",
    item: "Onions (Pyaz)",
    urdu: "پیاز کے کم خرچ طریقے",
    severity: "moderate",
    weeklySurge: "Moderating (-5%), but retail markups remain steep",
    driverReason:
      "Sindh crop harvest entering full season, though transit costs keep street carts high.",
    recommendedAction: "Bulk purchase 5kg mesh sacks from Itwar Bazaar or Sabzi Mandi on weekends.",
    culinarySubstitution: {
      title: "Boiled Onion-Yogurt Paste Gravy Thickener",
      description:
        "Boil 1 onion with 2 cloves of garlic, puree in a blender with 1 tbsp curd. This thick paste creates twice the gravy volume with half the raw onions, completely bypassing the need to deep-fry multiple onions.",
      estimatedSavingsMonthly: 650,
    },
  },
];

export const SEASONAL_PRODUCE_CALENDAR = {
  peakSeasonBargains: [
    {
      name: "White Potatoes (Naya Aloo)",
      urdu: "نیا آلو",
      reason: "Abundant Punjab harvest, rock-bottom rates",
    },
    {
      name: "Spinach (Palak)",
      urdu: "دیسی پالک",
      reason: "Direct local leafy greens, Rs 40-50/bunch",
    },
    {
      name: "Lauki / Bottle Gourd",
      urdu: "لوکی / کدو",
      reason: "Peak summer/monsoon harvest, cooling & budget-friendly",
    },
    {
      name: "Tinda / Round Gourd",
      urdu: "ٹنڈے",
      reason: "Plentiful supply, ideal daal/meat pairing",
    },
  ],
  offSeasonPremiumsToAvoid: [
    {
      name: "Green Peas (Matar)",
      urdu: "مٹر",
      reason: "Cold storage / imported, commanding Rs 380-450/kg (wait for winter)",
    },
    {
      name: "Cauliflower (Phool Gobi)",
      urdu: "پھول گوبھی",
      reason: "Early crop carries high pest-spray overhead and premium rates",
    },
    {
      name: "Capsicum (Shimla Mirch)",
      urdu: "شملہ مرچ",
      reason: "Tunnel-grown greenhouse batches priced at steep luxury margins",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Interactive Market AI Advisor Engine Responses                     */
/* ------------------------------------------------------------------ */

export type MarketAdvisorResponse = {
  tag: "surge" | "saving" | "bazaar" | "substitution";
  tagLabel: string;
  urdu: string;
  romanUrdu: string;
  keyPoints: string[];
};

export function getMarketAdvisorAdvice(query: string, city: City): MarketAdvisorResponse {
  const q = query.toLowerCase();

  if (
    q.includes("tamatar") ||
    q.includes("tomato") ||
    q.includes("substitute") ||
    q.includes("khatas")
  ) {
    return {
      tag: "substitution",
      tagLabel: "Tomato Inflation Strategy",
      urdu: `ٹماٹر کے متبادل: ٹماٹر اس وقت بلوچستان کی بارشوں اور کچی سپلائی کی وجہ سے ${city} میں 140 سے 160 روپے کلو تک جا رہا ہے۔ سالن کی گریوی کے لیے دہی (2 کھانے کے چمچ) اور املی کا گودا استعمال کریں۔ چکن قورمہ اور دال میں ذائقہ یکساں رہے گا اور ماہانہ 1,200 روپے سے زائد کی بچت ہو گی۔ اتوار بازار سے تھوک ریٹ پر کریٹ لینا بھی انفرادی ٹھیلوں سے 35% سستا پڑتا ہے۔`,
      romanUrdu: `Tamatar ke mutabadil: Tamatar is waqt Balochistan supply disruptions ki wajah se ${city} mein Rs 140-160/kg tak ja raha hai. Salan ki gravy ke liye dahi (2 tbsp) aur imli ka gooda istemaal karein. Chicken qorma aur daal mein zaiqa barabar rahega aur mahana Rs 1,200+ ki bachat hogi. Itwar bazaar se mandi rate par lena street thelay se 35% sasta parta hai.`,
      keyPoints: [
        "Use 2 tbsp dahi + 1 tsp imli pulp in salan gravy",
        "Avoid retail thela carts charging Rs 150-160/kg",
        "Itwar Bazaar offers direct crates at ~Rs 95-100/kg",
      ],
    };
  }

  if (
    q.includes("chicken") ||
    q.includes("murghi") ||
    q.includes("protein") ||
    q.includes("gosht")
  ) {
    return {
      tag: "surge",
      tagLabel: "Poultry Budget Balancing",
      urdu: `مرغی کی قیمت پر حکمتِ عملی: برائلر مرغی کا گوشت فیڈ کی قیمت کی وجہ سے ${city} میں 600 روپے کلو سے اوپر ہے۔ ہفتے میں 2 دن چکن کی جگہ کالا چنا، سفید لوبیا، یا انڈے کا سالن بنائیں جو 22 گرام پروٹین فی پلیٹ صرف 90 روپے فی فرد میں فراہم کرتا ہے بنسبت مرغی کے 220 روپے کے۔`,
      romanUrdu: `Murghi ki qeemat par hikmat-e-amli: Broiler chicken meat feed cost ki wajah se ${city} mein Rs 600/kg se upar hai. Hafte mein 2 din chicken ki jagah Kala Chana, Safaid Lobia, ya Anda salan banayein jo 22g protein per plate sirf Rs 90/person mein deta hai banisbat murghi ke Rs 220 ke.`,
      keyPoints: [
        "Rotate 2 weekly chicken meals with Kala Chana or Lobia",
        "Buy live bird at wholesale poultry mandi to save cutting margins",
        "Saves ~Rs 2,400 to Rs 3,200 monthly per household",
      ],
    };
  }

  if (
    q.includes("oil") ||
    q.includes("ghee") ||
    q.includes("tel") ||
    q.includes("cheeni") ||
    q.includes("sugar")
  ) {
    return {
      tag: "saving",
      tagLabel: "Staples & Ghee Optimization",
      urdu: `گھی اور کوکنگ آئل کی بچت: کوکنگ آئل کے لیے سپرے یا باریک نوزل والا ڈسپنسر استعمال کریں تاکہ پورنگ میں ضرورت سے زیادہ آئل نہ گرے۔ روٹی اور پراٹھے پر برش سے تیل لگانے سے ماہانہ کھپت 4 لیٹر سے کم ہو کر 2.5 لیٹر رہ جاتی ہے، جس سے ماہانہ 900 روپے فوری بچتے ہیں۔ چینی یوٹیلیٹی اسٹور سے سرکاری قیمت پر خریدیں۔`,
      romanUrdu: `Ghee aur cooking oil ki bachat: Cooking oil ke liye fine nozzle dispenser ya spray bottle istemaal karein. Roti/parathay par brush se tail lagane se mahana khapat 4L se 2.5L ho jati hai, jis se mahana Rs 900 foran bachte hain. Cheeni Utility Store se sarkari rate par lein.`,
      keyPoints: [
        "Switch to nozzle dispenser & brush application for rotis",
        "Reduces household consumption from 4L to 2.5L monthly",
        "Purchase sugar in 5kg bags from Utility Stores or Akbari/Jodia Mandi",
      ],
    };
  }

  if (
    q.includes("bazaar") ||
    q.includes("itwar") ||
    q.includes("imtiaz") ||
    q.includes("superstore") ||
    q.includes("where")
  ) {
    return {
      tag: "bazaar",
      tagLabel: "Bazaar vs Superstore Strategy",
      urdu: `خریداری کی درست تقسیم: تازہ سبزیاں اور پھل صرف اتوار / ماڈل بازار سے خریدیں جہاں قیمتیں سپر اسٹور سے 30% سے 40% کم ہوتی ہیں۔ جبکہ پیک شدہ برانڈڈ اشیاء (چائے، صابن، شیمپو، چاول) امتیاز یا کیریفور سے بنڈل آفرز پر لیں کیونکہ وہاں کریڈٹ کارڈ کیش بیک اور ڈسکاؤنٹ ہوتا ہے۔ قریبی کریانہ صرف ہنگامی ضرورت کے لیے استعمال کریں۔`,
      romanUrdu: `Khareedari ki durust taqseem: Taza sabziyan aur phal sirf Itwar / Model Bazaar se khareedein jahan qeematein superstore se 30% to 40% sasti hoti hain. Jabkay packaged branded rashan (chai, soap, basmati rice) Imtiaz ya Carrefour se bundle offers par lein. Mohalla kiryana sirf emergency ke liye rakhein.`,
      keyPoints: [
        "Buy all fresh produce at weekly Itwar Bazaar (saves 30-40%)",
        "Buy branded packaged dry ration in monthly bulk at superstores",
        "Reserve corner kiryana stores strictly for emergency top-ups",
      ],
    };
  }

  // Default general advice
  return {
    tag: "saving",
    tagLabel: "Hyperlocal Market Intelligence",
    urdu: `${city} کے لیے جامع مشورہ: ہفتہ وار راشن کی درست منصوبہ بندی سے آپ ماہانہ 4,500 سے 6,000 روپے تک بچا سکتے ہیں۔ سب سے سستا آپشن اتوار بازار ہے جو کریانہ سے 16% اور سپر اسٹور سے 24% سستا پڑتا ہے۔ اس ہفتے ٹماٹر اور چکن کی قیمتیں اوپر ہیں جبکہ آٹا، آلو اور پیاز مستحکم ہیں۔`,
    romanUrdu: `${city} ke liye jame mashwara: Hafte-war rashan ki durust planning se aap mahana Rs 4,500 se 6,000 tak bacha sakte hain. Sab se sasta option Itwar Bazaar hai jo kiryana se 16% aur superstore se 24% sasta parta hai. Is hafte tamatar aur chicken ki qeematein upar hain jabkay atta, aloo aur pyaz mustahkam hain.`,
    keyPoints: [
      `Cheapest weekly basket in ${city}: Itwar Bazaar saves ~Rs 1,200/wk`,
      "Vegetable surge alert: Use dahi/imli substitution for tomatoes",
      "Official DC rates available at designated Model Bazaars & Utility Stores",
    ],
  };
}
