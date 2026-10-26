/** "Jugaad Kitchen" — visual pantry grid + Desi Remix transformation engine.
 * STRICT ZERO-EXTRA-GROCERY: Every transformation uses ONLY selected leftovers + basic kitchen staples (ghee, salt, spices).
 */

export type PantryItem = {
  id: string;
  /** the label used by the recipe matcher */
  match: string;
  name: string;
  urdu: string;
  emoji: string;
  /** typical PKR value of the leftover portion that would otherwise be binned */
  wastePkr: number;
};

export const pantryGrid: PantryItem[] = [
  {
    id: "salan",
    match: "Leftover Salan",
    name: "Leftover Salan",
    urdu: "بچا ہوا سالن",
    emoji: "🍛",
    wastePkr: 320,
  },
  {
    id: "rice",
    match: "Cooked Rice",
    name: "Leftover Rice",
    urdu: "پکے ہوئے چاول",
    emoji: "🍚",
    wastePkr: 140,
  },
  {
    id: "roti",
    match: "Roti / Naan",
    name: "Roti / Chapati",
    urdu: "روٹی / چپاتی",
    emoji: "🫓",
    wastePkr: 60,
  },
  {
    id: "daal",
    match: "Daal",
    name: "Leftover Daal",
    urdu: "بچی ہوئی دال",
    emoji: "🥣",
    wastePkr: 130,
  },
  {
    id: "aloo",
    match: "Boiled Potatoes",
    name: "Boiled Potatoes",
    urdu: "ابلے ہوئے آلو",
    emoji: "🥔",
    wastePkr: 80,
  },
  { id: "anda", match: "Eggs", name: "Anday", urdu: "انڈے", emoji: "🥚", wastePkr: 90 },
  { id: "tamatar", match: "Tomatoes", name: "Tamatar", urdu: "ٹماٹر", emoji: "🍅", wastePkr: 50 },
  { id: "pyaz", match: "Onion", name: "Pyaz", urdu: "پیاز", emoji: "🧅", wastePkr: 40 },
  { id: "dahi", match: "Yogurt", name: "Dahi", urdu: "دہی", emoji: "🥛", wastePkr: 80 },
  {
    id: "bread",
    match: "Bread Slices",
    name: "Bread Slices",
    urdu: "ڈبل روٹی",
    emoji: "🍞",
    wastePkr: 60,
  },
  { id: "palak", match: "Spinach (Palak)", name: "Palak", urdu: "پالک", emoji: "🥬", wastePkr: 50 },
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
  /** pantry ids required — STRICT: every single one must be present in user leftovers */
  needs: string[];
  minutes: number;
  servings: string;
  idea: string;
  savesPkr: number;
  steps: string[];
  proTip?: string;
  /** Standard pantry staples already present in every home kitchen (never bought extra) */
  pantryExtras?: string[];
};

/** Creative "second life" family-sized transformations, strictly keyed on tapped pantry tiles. */
export const remixes: Remix[] = [
  {
    id: "rx-salan-rice-pulao",
    title: "Degh-Style Heavy Salan Pulao",
    urdu: "دیغی سالن دم پلاؤ (فیملی سائز)",
    emoji: "🍲",
    needs: ["salan", "rice"],
    minutes: 35,
    servings: "Serves 4–6 (Full Family Batch)",
    idea: "Combine cold cooked rice directly with rich leftover chicken/beef/veg salan. Steam on heavy dum for a fragrant, degh-style biryani-pulao without buying any extra meat or groceries.",
    savesPkr: 520,
    steps: [
      "Prep Salan & Gravy: Raat ka bacha hua chicken, beef ya sabzi ka salan ek bhari painday wali deghchi mein daal kar 2 minute garam karein.",
      "Layering Cold Rice: Fridge ke thanday bache hue chawal ko haath se halka khol lein aur salan ke upar barabar phaila dein.",
      "Steam Infusion & Ghee: 1 khane ka chamach desi ghee ya tail upar se chhirkein aur chutki garam masala ya kuti kali mirch daalein.",
      "The 15-Minute Dum: Deghchi ka dhakkan kisi saaf kapray (tauliya) se lapet kar aanch bilkul halki (dum) kar dein aur 15-20 minute dum dein.",
      "Gentle Fluff: Chamach ki pusht se halkay haath se neechay se upar mix karein taake salan ka roghan aur masalay chawal ke har daanay mein sama jayein.",
    ],
    proTip:
      "Thanday bache hue chawal dum par tootte nahi balkay khilay khilay degh jaisay bante hain.",
    pantryExtras: ["Desi ghee / Oil", "Garam masala", "Namak (chutki)"],
  },
  {
    id: "rx-roti-salan-churma",
    title: "Traditional Pakistani Roti Churma",
    urdu: "روایتی سالن روٹی کُٹّی / چُورما",
    emoji: "🥘",
    needs: ["roti", "salan"],
    minutes: 15,
    servings: "Serves 4–5 (Hearty Family Feast)",
    idea: "Shred stale chapatis into bite-sized pieces, toss directly into hot spiced salan gravy with roasted cumin and ghee until the rotis absorb every drop of rich gravy.",
    savesPkr: 380,
    steps: [
      "Shred Basi Roti: Bachi hui 4-6 sukhi rotian haath se chotay chotay tukron mein tor lein.",
      "Heat & Loosen Salan: Karahi mein bacha hua salan (gosht, chicken ya daal/sabzi) 1/2 cup paani ke sath ubaalein taake shorba patla aur garam ho jaye.",
      "Fold Roti Crumbs: Roti ke tukray salan mein shamil karein aur aanch darmiyani kar dein taake roti sara shorba jazb kar le.",
      "Ghee & Cumin Sear: 1 chamach ghee aur thora sa bhuna zeera daal kar 3 minute achi tarah bhunai karein jab tak roghan chamakne lagay.",
      "Garnish & Serve: Garam garam plate mein nikaalein; har niwalay mein gosht aur masalaydaar roti ka zabardast lutf aayega.",
    ],
    proTip:
      "Roti jitni purani aur khushk hogi, utna hi zyada salan ka roghan aur zaiqa jazb karegi.",
    pantryExtras: ["Desi ghee / Oil", "Bhuna zeera"],
  },
  {
    id: "rx-daal-aloo-cutlet",
    title: "Badi Family Daal Aloo Cutlet Platter",
    urdu: "بڑی فیملی دال آلو کٹلٹس پلیٹر",
    emoji: "🥙",
    needs: ["daal", "aloo"],
    minutes: 25,
    servings: "Serves 5–6 (Yields 16–20 Crisp Cutlets)",
    idea: "Thicken leftover daal and mash with boiled potatoes, seasoned with kitchen spices. Pan-fry into crisp golden cutlets that feed the entire family for dinner or evening tea.",
    savesPkr: 440,
    steps: [
      "Thicken Cold Daal: Bachi hui daal ko pan mein tez aanch par 3-4 minute pakayein jab tak wo garhi paste ban jaye.",
      "Mash with Potatoes: Ublay hue aloo ko chheel kar katoray mein achi tarah mash karein. Garhi daal shamil karein.",
      "Spice Seasoning: Namak, laal mirch, zeera powder aur chatpata masala milayein (koi bazaar ki cheez zaroori nahi).",
      "Shape 16-20 Cutlets: Haathon par halka oil laga kar shami kebab jaisi gol tikkian bana lein.",
      "Pan-Fry Crisp: Taway par 2 chamach tel garam karke dono taraf se khasta sunehra fry kar lein.",
    ],
    proTip:
      "Aloo mukammal thanday hon to tikkian taway par tootti nahi hain aur khasta banti hain.",
    pantryExtras: ["Cooking oil", "Namak", "Laal mirch", "Zeera"],
  },
  {
    id: "rx-rice-daal-khichdi",
    title: "Traditional Tawa Khichdi & Daal Chawal Bhuna",
    urdu: "روایتی تڑکہ توا کھچڑی (بچے دال چاول کا تڑکہ)",
    emoji: "🍛",
    needs: ["rice", "daal"],
    minutes: 15,
    servings: "Serves 4–6 (Comfort Food Batch)",
    idea: "Combine leftover rice and leftover daal in a smoking hot pan with zeera and red chilli tadka. Instant comfort meal for the whole family without an extra rupee spent.",
    savesPkr: 320,
    steps: [
      "Sizzle Ghee Tadka: Deghchi mein 2 chamach ghee garam karein aur sabut zeera kadkayein.",
      "Blend Daal & Rice: Bachi hui daal aur thanday bache chawal ek sath pan mein daal dein.",
      "Moisture Reduction: Halki aanch par chamach chalate hue 5-7 minute pakaayein taake daal chawal aapas mein yakjaan ho jayein.",
      "Steam (Dum): Dhakkan dhaanp kar 5 minute dum dein taake har daana khushgawar narm ban jaye.",
      "Serve: Garma-garam dhabba-style tawa khichdi tayaar hai jo bache khanon ka behtareen istemaal hai.",
    ],
    proTip:
      "Thora sa desi ghee aakhir mein daal dein, bilkul taaza bani deghi khichdi ki khushboo aayegi.",
    pantryExtras: ["Desi ghee / Oil", "Sabut zeera", "Chutki namak"],
  },
  {
    id: "rx-salan-aloo-bhuna",
    title: "Khandani Aloo Salan Dum (Double Volume Salan)",
    urdu: "خاندانی آلو سالن بھنا دم (سالن دُگنا کرنے کا گر)",
    emoji: "🥔",
    needs: ["salan", "aloo"],
    minutes: 20,
    servings: "Serves 5–6 (Doubled Family Curry)",
    idea: "Cube boiled potatoes and simmer inside leftover meat/chicken salan with a splash of water and cumin to double the curry portion, feeding 6 people with zero new groceries.",
    savesPkr: 460,
    steps: [
      "Dice Potatoes: Ublay hue aloo ko motay chokor tukron mein kaat lein.",
      "Infuse Gravy: Karahi mein bacha hua salan aur aadhha cup paani daal kar ubaal lein.",
      "Toss Aloo: Aloo ke tukray salan mein daalein taake wo shorba aur masalay jazb kar lein.",
      "Bhunai & Dum: 8-10 minute halki aanch par pakaayein jab tak gravy garhi ho jaye aur roghan upar aa jaye.",
      "Serve: Bacha hua thora sa salan pooray khandan ke liye baray saalun mein badal chuka hai.",
    ],
    proTip:
      "Ek ya do aloo ke tukron ko chamach se masal dein, gravy foran garhi aur khushgawar ho jayegi.",
    pantryExtras: ["Cooking oil", "Zeera", "Paani"],
  },
  {
    id: "rx-salan-daal-dalcha",
    title: "Traditional Shahi Dalcha Gosht Dum",
    urdu: "روایتی شاہی دالچہ گوشت دم",
    emoji: "🥣",
    needs: ["salan", "daal"],
    minutes: 25,
    servings: "Serves 5–6 (Royal Mughlai Fusion)",
    idea: "Merge leftover meat salan and leftover daal together on low heat with a sizzling ghee and zeera tarka. A legendary royal wedding dish resurrected from yesterday's pots.",
    savesPkr: 550,
    steps: [
      "Combine Pots: Ek bhari deghchi mein bachi hui daal aur bacha hua gosht/chicken salan ikatha daal dein.",
      "Simmer & Blend: 1 cup paani daal kar darmiyani aanch par ubaal aane dein. Madhani ya chamach se halka ghot lein.",
      "Ghee Tarka: Frying pan mein 2 chamach ghee garam karein, zeera aur kuti laal mirch kadka kar ubalti dalcha par daalein.",
      "Low Flame Dum: Dhakkan dhaanp kar 10 minute dum par chhor dein taake daal aur gosht ke zaaiqay yakjaan ho jayein.",
      "Family Feast: Garam roti ya bache chawal ke sath 5-6 afrad ko ba-asaani kifayat se khilayein.",
    ],
    proTip:
      "Dalcha dosray din aur bhi zyada mazedaar lagti hai kyunke masalay daal ke andar jazb ho chukay hotay hain.",
    pantryExtras: ["Desi ghee / Oil", "Zeera", "Laal mirch"],
  },
  {
    id: "rx-roti-daal-missi",
    title: "Traditional Daal Bhari Missi Tawa Roti",
    urdu: "دال بھری مصالحے دار مِسی روٹی",
    emoji: "🫓",
    needs: ["roti", "daal"],
    minutes: 15,
    servings: "Serves 4–5 (Crisp Tawa Platter)",
    idea: "Spread thick leftover daal with a sprinkle of crushed chilli on stale roti and griddle on a tawa with ghee for crisp traditional Missi rotis.",
    savesPkr: 310,
    steps: [
      "Daal Layer: Sukhi bachi hui roti par bachi hui garhi daal ki patli teh phailayein.",
      "Spice Dust: Upar chutki laal mirch, namak aur thora zeera chhirkein.",
      "Tawa Crisp: Garam taway par ghee laga kar roti ko daal wali side se pehle 2 minute sekein.",
      "Flip & Toast: Palat kar dosri taraf se bhi karara kurkura sunehra hone tak fry karein.",
      "Serve: Garam chai ya raite ke sath khayein, basi roti bilkul taaza aur khasta ban jati hai.",
    ],
    proTip: "Dono taraf chamach se daba daba kar sekein taake papdi jaisi crunchiness banay.",
    pantryExtras: ["Desi ghee / Oil", "Laal mirch", "Namak"],
  },
  {
    id: "rx-roti-aloo-rolls",
    title: "Aloo Masala Tawa Roti Rolls",
    urdu: "آلو مصالحہ توا روٹی رولز (بچوں اور فیملی کا فیورٹ)",
    emoji: "🌯",
    needs: ["roti", "aloo"],
    minutes: 15,
    servings: "Serves 4–5 (Generous Roll Platter)",
    idea: "Mash cold boiled potatoes with salt, chilli, and cumin, spread across stale rotis, roll tight and tawa-toast in ghee for restaurant-style paratha rolls without buying flour.",
    savesPkr: 340,
    steps: [
      "Mash Potato Filling: Ublay aloo ko namak, laal mirch aur zeera ke sath achi tarah masal lein.",
      "Roll Preparation: Bachi hui roti par aloo ka mixture phaila kar tight cylindrical roll bana lein.",
      "Moisten & Edge Seal: Roti ke kinaron par halka paani laga kar daba dein taake roll taway par khulay nahi.",
      "Tawa Toasting: Taway par 1-2 chamach ghee garam karke roll ko ghuma ghuma kar sunehra sek lein.",
      "Slice & Serve: Darmayan se do hissay karke serve karein; subah ka nashta ya shaam ka khana tayaar.",
    ],
    proTip: "Roti ke kinaron par halka paani laga kar daba dein taake roll taway par khulay nahi.",
    pantryExtras: ["Desi ghee / Oil", "Namak", "Laal mirch"],
  },
  {
    id: "rx-salan-bhunai",
    title: "Highway Shinwari Shredded Meat Bhunai",
    urdu: "ہائی وے شنواری بھنا گوشت کڑاہی (فیملی سائز)",
    emoji: "🥩",
    needs: ["salan"],
    minutes: 20,
    servings: "Serves 4–5 (Concentrated Rich Meat Gravy)",
    idea: "Reduce leftover meat/chicken salan gravy on high heat with ghee and black pepper until it shreds into thick, restaurant-style karahi meat clinging to the pan.",
    savesPkr: 420,
    steps: [
      "Boil Down Gravy: Karahi mein bacha hua salan tez aanch par pakayein taake faltu shorba khushk ho jaye.",
      "Shred Meat Fibers: Kaantay (fork) se gosht ya chicken ko resha resha kar lein.",
      "High Flame Bhunai: 1 chamach ghee aur kali mirch daal kar tez aanch par musalsal chamach hilayein jab tak masalay gosht se lipat jayein.",
      "Wok Glaze Sear: Kadhai ke kinaron par 1 minute gosht ko bhun kar restaurant-style wok glaze banayein.",
      "Serve: Garam rotiyon ke sath pesh karein; aisa zaiqa banega jaise abhi highway dhabay se taaza banwaya ho.",
    ],
    proTip: "Aanch tez rakhein aur chamach musalsal chalayein taake wok flavor aaye.",
    pantryExtras: ["Desi ghee / Oil", "Kali mirch"],
  },
  {
    id: "rx-rice-zeera",
    title: "Desi Ghee Zeera Tawa Rice",
    urdu: "دیسی گھی زیرہ توا چاول (خوشبودار دیغی سٹائل)",
    emoji: "🍚",
    needs: ["rice"],
    minutes: 10,
    servings: "Serves 4–5 (Aromatic Rice Transformation)",
    idea: "Transform cold clumpy rice into fragrant, separate-grain royal Zeera rice in just 10 minutes with hot desi ghee, cumin, and a covered steam.",
    savesPkr: 200,
    steps: [
      "Separate Rice Grains: Thanday bache chawal ko haath se halka alag alag khol lein.",
      "Cumin Splutter: Karahi mein 2 chamach desi ghee garam karein aur sabut zeera kadkayein.",
      "Toss & Warm: Chawal daal kar 2 minute tez aanch par halkay haath se toss karein taake har daanay par ghee lag jaye.",
      "Covered Steam (Dum): Dhakkan dhaanp kar 3-4 minute dum dein taake chawal bilkul taaza phool jayein.",
      "Serve Piping Hot: Khushbodar zeera rice plate mein nikaal kar daal ya salan ke sath lutf uthayein.",
    ],
    proTip: "Thora sa namak ghee mein pehle milane se chawal mein zaiqa barabar phelta hai.",
    pantryExtras: ["Desi ghee / Oil", "Sabut zeera", "Namak"],
  },
];

export type RemixMatch = Remix & { have: string[]; missing: string[]; score: number };

/**
 * STRICT ZERO-EXTRA-GROCERY:
 * ONLY suggest transformations where 100% of required leftovers are present in user's selection.
 * Missing items are banned.
 */
export function remixFor(selectedIds: string[]): RemixMatch[] {
  return remixes
    .map((r) => {
      const have = r.needs.filter((n) => selectedIds.includes(n));
      const missing = r.needs.filter((n) => !selectedIds.includes(n));
      return { ...r, have, missing, score: have.length / r.needs.length };
    })
    .filter((r) => r.missing.length === 0) // Strict zero-extra-grocery constraint: ALL required leftovers must be present!
    .sort((a, b) => b.savesPkr - a.savesPkr);
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
