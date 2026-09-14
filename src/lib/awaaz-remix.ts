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
  steps: string[];
  proTip?: string;
  pantryExtras?: string[];
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
    idea: "Spread crushed tamatar and chilli on stale roti, top with cheese or paneer, and crisp it on a tawa with the lid on.",
    savesPkr: 280,
    steps: [
      "Prepare Base & Pan: Bachi hui roti ko dono taraf halka sa ghee ya oil lagayein aur tawa medium aanch par 1 minute garam karein.",
      "Sauce & Tomato Layer: Ek katoray mein mashed tamatar, chutki kali mirch, kuti laal mirch (chilli flakes), aur namak mila kar roti par barabar phelayein.",
      "Topping: Upar se baareek kata pyaz, hari mirch, aur cheese ya crushed paneer phaila dein.",
      "Cover & Crisp: Tawa ko kisi plate ya patilay ke dhakkan se 3-4 minute dhaanp dein taake cheese pighal jaye aur nichla hissa nihayat crispy ban jaye.",
      "Finish & Serve: Taway se utaar kar chaat masala chirkein aur slice karke garam garam pesh karein.",
    ],
    proTip:
      "Aanch bilkul halki (dum) rakhein taake roti jalay nahi balkay thin-crust pizza jaisi khasta banay.",
    pantryExtras: ["Chilli flakes", "Kali mirch", "Ghee / Oil"],
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
    steps: [
      "Thicken Yesterday's Daal: Raat ki bachi hui daal ko bowl mein lein; agar patli ho to aanch par 2 minute pakayein taake paani kam ho jaye.",
      "Mash Potatoes & Aromatics: 2 ublay hue aloo mash karein. Is mein daal, baareek kata pyaz, hari mirch, hara dhania, zeera powder, aur garam masala achi tarah mix karein.",
      "Binding & Shaping: 2-3 chamach double roti ka choora (breadcrumbs) ya sooji shamil karein taake mixture bind ho jaye. Haath par halka oil laga kar gol tikkian banayein.",
      "Shallow Fry: Non-stick pan mein 2-3 khane ke chamach oil garam karein aur cutlets ko medium aanch par dono taraf sunehra aur khasta hone tak tal lein.",
      "Serve: Garam chai, pudinay ke raite ya tomato ketchup ke sath pesh karein.",
    ],
    proTip: "Aloo thanday hone par mash karein; garam aloo mixture ko patla kar dete hain.",
    pantryExtras: ["Breadcrumbs / Sooji", "Zeera powder", "Garam masala"],
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
    steps: [
      "Mash Cold Rice: Fridge ke thanday bache chawal ko haathon ya fork se halka sa mash karein taake daane aapas mein jud sakein.",
      "Aromatics & Spices: Baareek kata pyaz, 2 hari mirchein, hara dhania, kuti laal mirch, namak, aur 1 phenta hua anda shamil karein.",
      "Binding: 2 chamach besan ya cornflour milayein taake kebab fry karte waqt taway par tootne se bachein.",
      "Shape & Pan-Fry: Shami kebab jaisi gol tikkian banayein. Pan mein halka sa oil garam karke darmiyani aanch par dono taraf se golden brown fry karein.",
      "Serve: Upar se chatpata chaat masala chirkein aur dahi ke sath nosh farmayein.",
    ],
    proTip:
      "Fridge ke thanday chawal mein moisture kam hota hai, is se kebab bahar se extra crispy bante hain.",
    pantryExtras: ["Besan / Cornflour", "Kuti laal mirch", "Chaat masala"],
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
    steps: [
      "Evaporate Salan Gravy: Bache hue salan (chicken, gosht ya aloo) ko pan mein tez aanch par 2-3 minute pakayein jab tak shorba bilkul khushk ho jaye.",
      "Shred Meat: Gosht ya chicken ke tukron ko kaantay (fork) se resha resha kar lein aur haddian alag kar dein.",
      "Pairay & Dough Rolling: Gunday aate ke do chotay pairay bana kar dono ko bail lein. Ek roti par sukha hua salan phelayein aur kinaray chor dein.",
      "Seal & Light Roll: Doosri roti upar rakh kar kinaray ungli se daba kar lock karein, phir halkay haath se belan pher lein.",
      "Tawa Griddle: Garam taway par ghee ya oil lagate hue dono taraf se chamach se daba kar kurkura sunehra paratha tayaar karein.",
    ],
    proTip: "Salan ko pehle mukammal thanda kar lein; garam stuffing parathay ko phaar deti hai.",
    pantryExtras: ["Gunda hua aata", "Desi ghee / Cooking oil"],
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
    steps: [
      "Crisp Roti Croutons: Bachi hui basi roti ke 1 inch chokor tukray kaat lein. Taway par 1 chamach oil mein papdi ki tarah karara fry ya toast karein.",
      "Season Dahi: Dahi mein chutki cheeni, kala namak, aur bhuna zeera daal kar achi tarah creamy phent lein.",
      "Assemble Platter: Chaat ki plate mein kurkuri roti ke tukray phailayein; upar ublay aloo ke tukray aur kata pyaz daalein.",
      "Drizzle Chutneys: Phenta hua dahi, meethi imli ki chatni aur teekhi hari chatni upar khoob daalein.",
      "Garnish & Serve: Chaat masala aur hara dhania chirak kar foran pesh karein taake roti ki crunchiness barqaraar rahay.",
    ],
    proTip:
      "Air fryer ya taway par roti 2 minute mein behtareen papdi ban jati hai jo market ki fried papdi se kahin zyada sehatmand hai.",
    pantryExtras: ["Imli chatni", "Kala namak", "Bhuna zeera"],
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
    steps: [
      "Blend Daal Base: Bachi hui daal ko blender mein 1 cup paani aur 1 tamatar ke sath 30 second smooth blend kar lein.",
      "Aromatic Tadka: Deghchi mein 1 chamach makhan ya ghee garam karein, kata lehsan aur zeera daal kar 30 second kadkayein.",
      "Simmer & Season: Blended daal shamil karein, halki aanch par 5-7 minute ubaal aane dein. Kali mirch aur namak check karke adjust karein.",
      "Citrus Kick: Choolay se utaar kar aadhay leemo ka ras aur kata hua hara dhania nichor dein.",
      "Serve with Croutons: Roti ke tawa-toasted tukray daal kar garma-garam bowl mein serve karein.",
    ],
    proTip:
      "Sardiyon mein ye shorba galay aur hazmay ke liye behtareen hai aur gas ka kharcha bhi sirf 5-7 minute hai.",
    pantryExtras: ["Lehsan", "Leemo", "Kali mirch", "Makhan"],
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
    steps: [
      "Crush Cooked Rice: Pake hue bache chawal ko haathon se ya blender mein thora sa doodh daal kar dardara pees lein.",
      "Boil Milk: Patilay mein 3 cup doodh ubaalein aur us mein 2 sabz elaichi koot kar shamil karein.",
      "Simmer Together: Pise hue chawal ubalte doodh mein daalein aur aanch halki karke musalsal chamach chalayein taake talay na lagay.",
      "Sweeten: Jab kheer garhi ho jaye (12-15 minute), 4-5 chamach cheeni ya condensed milk shamil karein.",
      "Cool & Garnish: Badam, pista ya kewra water daal kar fridge mein thanda karein aur mazaydaar meetha pesh karein.",
    ],
    proTip:
      "Pehle se pake chawal se kheer banne mein aam kheer ke muqablay aadhay se bhi kam gas aur waqt lagta hai.",
    pantryExtras: ["Doodh (Milk)", "Sabz Elaichi", "Cheeni"],
  },
  {
    id: "rx-anda-bread",
    title: "Anda Bread Roll",
    urdu: "انڈا بریڈ رول",
    emoji: "🌯",
    needs: ["bread", "anda"],
    minutes: 15,
    idea: "Flatten stale bread, fill with spiced aloo or salan, roll, dip in egg and fry golden.",
    savesPkr: 190,
    steps: [
      "Flatten Slices: Bachi hui bread ke kinare kaat lein aur belan se daba kar patla flatten kar lein.",
      "Prepare Stuffing: Katoray mein mash kiya aloo ya bacha hua salan, hari mirch aur namak mila kar filling tayaar karein.",
      "Roll & Seal: Bread ke darmayan filling rakhein, kinaray par paani ki ungli pher kar tight roll bana lein.",
      "Egg Wash: Anday mein chutki namak aur kali mirch daal kar phent lein, aur roll ko anday mein achi tarah dip karein.",
      "Pan-Fry Golden: Frying pan mein 2 chamach oil mein har taraf ghuma kar sunehra fry karein.",
    ],
    proTip:
      "Agar bread purani aur sookhi ho to rolling se pehle halka sa paani ka spray karein taake tutay nahi.",
    pantryExtras: ["Kali mirch", "Cooking oil"],
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
    steps: [
      "Wash & Chop: Murjhai hui palak ko dho kar baareek kaat lein.",
      "Tadka Base: Pan mein 1 chamach tel garam karein, kata pyaz, adrak lehsan paste aur hari mirch 2 minute sautey karein.",
      "Tomato Masala: Kata tamatar, haldi, laal mirch aur namak daal kar masala bhun lein jab tak tel alag ho jaye.",
      "Wilt Spinach & Add Paneer: Palak daal kar 3 minute pakayein jab tak wo narm ho jaye. Phir crumbled paneer daal kar halkay haath se mix karein.",
      "Dum & Serve: Thora sa pisa garam masala aur makhan daal kar 2 minute dum dein aur garam roti ke sath pesh karein.",
    ],
    proTip:
      "Paneer ko aakhir mein daalein aur zyada na pakayein taake paneer narm aur malai jaisa rahay.",
    pantryExtras: ["Adrak lehsan paste", "Haldi", "Garam masala"],
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
    steps: [
      "Separate Rice Grains: Fridge ke thanday chawal ko haath se alag alag daanay kar lein. Matar aur gajar baareek kaat lein.",
      "Quick Scramble: Kadhai mein 1 chamach tel daal kar 1 anda scramble karein aur plate mein nikaal lein.",
      "High Flame Stir-Fry: Kadhai tez aanch par garam karein. Lehsan, hari mirch, matar aur gajar ko tez flame par 2 minute toss karein.",
      "Toss Rice & Sauces: Chawal, 1 chamach soya sauce, 1/2 chamach sirka, kali mirch aur namak daal kar tez aanch par 3 minute musalsal hilayein.",
      "Combine & Serve: Scrambled anda aur hara pyaz mila kar dhuwaan nikalte hue garam garam serve karein.",
    ],
    proTip:
      "Flame tez hona zaroori hai taake chawal steam ho kar chipkein nahi balkay restaurant jaisa wok-flavor aaye.",
    pantryExtras: ["Soya sauce", "Sirka", "Kali mirch"],
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
    steps: [
      "Rough Mash: Bache ublay aloo ko mota mota tor lein (bilkul paste na banayein balkay tukray rahein).",
      "Gravy Tadka: Deghchi mein 2 chamach tel garam karein, zeera, rai daana aur kata pyaz sunehra fry karein.",
      "Bhunai: Tamatar paste, haldi, dhania powder, namak aur laal mirch daal kar tel nikalne tak bhunein.",
      "Simmer: Aloo aur 1.5 cup paani shamil karein. Dhaank kar darmiyani aanch par 6-8 minute pakaayein.",
      "Thickening Secret: Ek do aloo ke tukron ko chamach ki pusht se salan mein ghol dein taake shorba garha aur lazeez ban jaye.",
    ],
    proTip: "Aakhir mein kasuri methi hath se masal kar daal dein, dhabba style khushboo aayegi.",
    pantryExtras: ["Zeera", "Haldi", "Kasuri methi"],
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
    steps: [
      "Aerate Daal: Bachi hui daal mein 1 chamach sooji aur ek chutki meetha soda milayein. Kaantay se 2 minute khoob phenten taake mixture phool jaye.",
      "Fry Baray: Pan mein tel garam karein. Chamach se chotay baray daal kar medium aanch par dono taraf sunehra tal lein.",
      "Warm Water Soak: Baray nikaal kar foran neel-garm namak walay paani mein 5 minute bhigo dein, phir hatheliyon se narm daba kar paani nichor lein.",
      "Creamy Yogurt: Dahi ko thori cheeni aur bhuna zeera daal kar smooth phent kar baray ke upar ulat dein.",
      "Chaat Topping: Imli chatni, pudina chatni aur chaat masala chirak kar thanda karke serve karein.",
    ],
    proTip:
      "Neel-garm paani mein bhigone se sara faltu tail nikal jata hai aur baray rooi jaisay mulayam ho jaate hain.",
    pantryExtras: ["Meetha soda", "Sooji", "Imli chatni", "Chaat masala"],
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
