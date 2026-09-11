import type { Appliance } from "./awaaz-data";
import type { Disco } from "./awaaz-data";
import { slabBreakdownFor, pkr } from "./awaaz-data";
import { lifelineStatus, calculateVampire, type StandbyDevice, type BudgetVerdict } from "./awaaz-household";

export type AdvisorContext = {
  appliances: Appliance[];
  disco: Disco;
  billedUnits: number;
  billAmount: number;
  budget: number;
  standby: StandbyDevice[];
  budgetVerdict: BudgetVerdict | null;
  hasResult: boolean;
  estimatedUnits: number;
  totalBill: number;
  savings: number;
  perAppliance: { name: string; units: number; cost: number; share: number; tip: string }[];
  lifelineTier: string;
  unprotected: boolean;
  unitsToNextTier: number | null;
  vampireMonthlyCost: number;
};

export type AdvisorResponse = {
  tag: "saving" | "warning" | "tip";
  tagLabel: string;
  urdu: string;
  romanUrdu: string;
};

type Intent = "slab" | "appliance" | "bill" | "saving" | "greeting" | "general";

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  if (/(salam|hello|hi|assalam|namaste|hey|salam|adaab)/i.test(lower)) return "greeting";
  if (/(slab|tariff|rate|protected|unprotected|lifeline|unit)/i.test(lower)) return "slab";
  if (/(appliance|ac|fan|fridge|light|tv|iron|heater|motor|geyser|washing|plug|device)/i.test(lower))
    return "appliance";
  if (/(bill|amount|payment|cost|mahina|month|spend|budget|cross|over)/i.test(lower)) return "bill";
  if (/(save|saving|kam|reduce|cut|tip|advice|madad|bachat|kam\skaro|bachao)/i.test(lower))
    return "saving";
  return "general";
}

function topConsumers(appliances: Appliance[], n = 3) {
  return [...appliances]
    .map((a) => ({
      ...a,
      monthlyKwh: (a.watts * a.hours * a.qty * 30) / 1000,
    }))
    .sort((a, b) => (b as any).monthlyKwh - (a as any).monthlyKwh)
    .slice(0, n);
}

function generateGreeting(ctx: AdvisorContext): AdvisorResponse {
  const slabPart = ctx.unprotected
    ? `آپ فی الحال غیر محفوظ سلاب میں ہیں — ${ctx.billedUnits} یونٹس، ${pkr(ctx.totalBill)} بل۔`
    : ctx.unitsToNextTier !== null
      ? `آپ محفوظ سلاب میں ہیں — ${ctx.billedUnits} یونٹس، ${pkr(ctx.totalBill)} بل۔ ${ctx.unitsToNextTier} یونٹس کا فاصلہ ہے۔`
      : `${ctx.billedUnits} یونٹس، ${pkr(ctx.totalBill)} بل۔`;
  const slabPartRoman = ctx.unprotected
    ? `Aap filhal ghair-mehfooz slab mein hain — ${ctx.billedUnits} units, ${pkr(ctx.totalBill)} bill.`
    : ctx.unitsToNextTier !== null
      ? `Aap mehfooz slab mein hain — ${ctx.billedUnits} units, ${pkr(ctx.totalBill)} bill. ${ctx.unitsToNextTier} units ka fasla hai.`
      : `${ctx.billedUnits} units, ${pkr(ctx.totalBill)} bill.`;

  return {
    tag: "tip",
    tagLabel: "Welcome",
    urdu: `السلام علیکم! میں آپ کا AI Energy Advisor ہوں۔ ${slabPart} آپ ${ctx.appliances.length} اپلائنسز ٹریک کر رہے ہیں (${ctx.disco.name}، ${ctx.disco.city})۔ میں آپ کو بجلی بچانے، سلاب سے بچنے، اور بل کم کرنے میں مدد دے سکتا ہوں۔ کیا پوچھنا چاہتے ہیں؟`,
    romanUrdu: `Assalam o alaikum! Main aap ka AI Energy Advisor hoon. ${slabPartRoman} Aap ${ctx.appliances.length} appliances track kar rahe hain (${ctx.disco.name}, ${ctx.disco.city}). Main aap ko bijli bachane, slab se bachne, aur bill kam karne mein madad de sakta hoon. Kya poochna chahte hain?`,
  };
}

function generateSlabAdvice(ctx: AdvisorContext): AdvisorResponse {
  const status = lifelineStatus(ctx.billedUnits);
  const marginalRate = ctx.disco.slabs.find((s) => s.upTo >= ctx.billedUnits)?.rate ?? ctx.disco.slabs[0]!.rate;

  if (ctx.unprotected) {
    return {
      tag: "warning",
      tagLabel: "Unprotected Slab",
      urdu: `آپ فی الحال "${status.title}" میں ہیں۔ آپ کی شرح ${marginalRate.toFixed(2)} روپے فی یونٹ ہے اور بل ${pkr(ctx.totalBill)} ہے۔ ${ctx.unitsToNextTier !== null ? `محفوظ سلاب میں واپس آنے کے لیے ${ctx.unitsToNextTier} یونٹس کم استعمال کریں۔` : "چھ مہینے تک 200 یونٹس سے کم استعمال کرنے پر محفوظ حیثیت بحال ہو گی۔"} ${ctx.disco.name} کے ٹیرف کے مطابق، ہر اضافی یونٹ ${marginalRate.toFixed(2)} روپے میں پڑتا ہے۔`,
      romanUrdu: `Aap filhal "${status.title}" mein hain. Aap ki rate ${marginalRate.toFixed(2)} rupey per unit hai aur bill ${pkr(ctx.totalBill)} hai. ${ctx.unitsToNextTier !== null ? `Mehfooz slab mein wapis aane ke liye ${ctx.unitsToNextTier} units kam istemaal karein.` : "Chay mahine tak 200 units se kam istemaal karne par mehfooz haisat bahal ho gi."} ${ctx.disco.name} ke tariff ke mutabiq, har izafi unit ${marginalRate.toFixed(2)} rupey mein parta hai.`,
    };
  }

  return {
    tag: "saving",
    tagLabel: "Protected Slab",
    urdu: `خوشخبری! آپ "${status.title}" میں ہیں۔ آپ کی شرح ${marginalRate.toFixed(2)} روپے فی یونٹ ہے اور بل ${pkr(ctx.totalBill)} ہے۔ ${ctx.unitsToNextTier !== null ? `محفوظ حیثیت برقرار رکھنے کے لیے ${ctx.unitsToNextTier} یونٹس کے اندر رہیں۔ اگر 200 یونٹس سے تجاوز کر گیا تو آپ چھ مہینے کے لیے محفوظ درجہ کھو بیٹھیں گے۔` : ""}`,
    romanUrdu: `Khushkhabri! Aap "${status.title}" mein hain. Aap ki rate ${marginalRate.toFixed(2)} rupey per unit hai aur bill ${pkr(ctx.totalBill)} hai. ${ctx.unitsToNextTier !== null ? `Mehfooz haisat barqarar rakhne ke liye ${ctx.unitsToNextTier} units ke andar rahein. Agar 200 units se tajawaz kar gaye to aap chay mahine ke liye mehfooz darja kho baithein ge.` : ""}`,
  };
}

function generateApplianceAdvice(ctx: AdvisorContext): AdvisorResponse {
  if (ctx.appliances.length === 0) {
    return {
      tag: "tip",
      tagLabel: "Appliance Tip",
      urdu: "آپ نے ابھی کوئی اپلائنس نہیں بتائی۔ اپنے گھر کے آلات درج کریں تاکہ میں بتا سکوں کون سا زیادہ بجلی استعمال کر رہا ہے۔",
      romanUrdu: "Aap ne abhi koi appliance nahi batayi. Apne ghar ke alaat enter karein taake main bata sakoon kaun sa zyada bijli istemaal kar raha hai.",
    };
  }

  const top = topConsumers(ctx.appliances);
  const topItem = top[0]!;
  const topKwh = (topItem.watts * topItem.hours * topItem.qty * 30) / 1000;
  const names = top.map((a) => a.name).join("، ");
  const namesRoman = top.map((a) => a.name).join(", ");
  const marginalRate = ctx.disco.slabs.find((s) => s.upTo >= ctx.billedUnits)?.rate ?? ctx.disco.slabs[0]!.rate;
  const saveRs = Math.round(topKwh * 0.25 * marginalRate * 1.29);

  return {
    tag: "tip",
    tagLabel: "Appliance Insight",
    urdu: `آپ کے سب سے زیادہ بجلی استعمال کرنے والے آلات: ${names}۔ ${topItem.name} سب سے زیادہ استعمال کرتا ہے — تقریباً ${Math.round(topKwh)} یونٹس ماہانہ۔ ${topItem.tip} اگر آپ اس کے استعمال میں 25% کمی کر دیں تو تقریباً ${pkr(saveRs)} ماہانہ بچ سکتے ہیں۔`,
    romanUrdu: `Aap ke sab se zyada bijli istemaal karne wale alaat: ${namesRoman}. ${topItem.name} sab se zyada istemaal karta hai — taqreeban ${Math.round(topKwh)} units mahana. ${topItem.tip} Agar aap is ke istemaal mein 25% kami kar dein to taqreeban ${pkr(saveRs)} mahana bach sakte hain.`,
  };
}

function generateBillAdvice(ctx: AdvisorContext): AdvisorResponse {
  const verdict = ctx.budgetVerdict;
  if (!verdict) {
    return {
      tag: "tip",
      tagLabel: "Bill Info",
      urdu: `آپ کا بل ${pkr(ctx.billAmount)} ہے (${ctx.billedUnits} یونٹس، ${ctx.disco.name})۔ "Audit my bill" پر ٹیپ کریں تاکہ میں مکمل تجزیہ کر سکوں۔`,
      romanUrdu: `Aap ka bill ${pkr(ctx.billAmount)} hai (${ctx.billedUnits} units, ${ctx.disco.name}). "Audit my bill" par tap karein taake main mukammal tajziya kar sakoon.`,
    };
  }

  if (verdict.status === "over") {
    return {
      tag: "warning",
      tagLabel: "Budget Crossed",
      urdu: `آپ کا بل آپ کی ${pkr(ctx.budget)} کی حد سے ${pkr(verdict.difference)} زیادہ ہے! ${verdict.advice} ${ctx.vampireMonthlyCost > 0 ? `اس کے علاوہ، آپ کے اسٹینڈ بائی آلات ماہانہ ${pkr(ctx.vampireMonthlyCost)} ضائع کر رہے ہیں۔` : ""}`,
      romanUrdu: `Aap ka bill aap ki ${pkr(ctx.budget)} ki hud se ${pkr(verdict.difference)} zyada hai! ${verdict.advice} ${ctx.vampireMonthlyCost > 0 ? `Is ke ilawa, aap ke standby alaat mahana ${pkr(ctx.vampireMonthlyCost)} zaya kar rahe hain.` : ""}`,
    };
  }

  if (verdict.status === "close") {
    return {
      tag: "warning",
      tagLabel: "Near Budget Limit",
      urdu: `آپ کا بل آپ کی حد کے ${Math.round(verdict.usedPct)}% پر ہے — ${pkr(Math.abs(verdict.difference))} کا فاصلہ بچا ہے۔ ${verdict.advice}`,
      romanUrdu: `Aap ka bill aap ki hud ke ${Math.round(verdict.usedPct)}% par hai — ${pkr(Math.abs(verdict.difference))} ka fasla bacha hai. ${verdict.advice}`,
    };
  }

  return {
    tag: "saving",
    tagLabel: "Within Budget",
    urdu: `آپ کا بل آپ کی ${pkr(ctx.budget)} کی حد کے اندر ہے (${Math.round(verdict.usedPct)}%)۔ ${pkr(Math.abs(verdict.difference))} کا فاصلہ بچا ہے۔ ${verdict.advice}`,
    romanUrdu: `Aap ka bill aap ki ${pkr(ctx.budget)} ki hud ke andar hai (${Math.round(verdict.usedPct)}%). ${pkr(Math.abs(verdict.difference))} ka fasla bacha hai. ${verdict.advice}`,
  };
}

function generateSavingAdvice(ctx: AdvisorContext): AdvisorResponse {
  const tips: string[] = [];
  const tipsRoman: string[] = [];

  if (ctx.appliances.length > 0) {
    const top = topConsumers(ctx.appliances, 1);
    const topItem = top[0]!;
    const topKwh = (topItem.watts * topItem.hours * topItem.qty * 30) / 1000;
    tips.push(`${topItem.name} کو کم استعمال کریں — یہ ${Math.round(topKwh)} یونٹس ماہانہ کھاتا ہے۔ ${topItem.tip}`);
    tipsRoman.push(`${topItem.name} ko kam istemaal karein — yeh ${Math.round(topKwh)} units mahana khata hai. ${topItem.tip}`);
  }

  tips.push("انورجی سیور LED بلب استعمال کریں — یہ 80% کم بجلی استعمال کرتے ہیں۔");
  tipsRoman.push("Energy-saver LED bulb istemaal karein — yeh 80% kam bijli istemaal karte hain.");

  tips.push("AC کو 26 ڈگری پر رکھیں — ہر ڈگری کم کرنے سے 6% بجلی بچتی ہے۔");
  tipsRoman.push("AC ko 26 degree par rakhein — har degree kam karne se 6% bijli bachti hai.");

  if (ctx.unprotected && ctx.unitsToNextTier !== null) {
    tips.push(`آپ غیر محفوظ سلاب میں ہیں۔ ${ctx.unitsToNextTier} یونٹس کم استعمال کریں تو محفوظ سلاب میں واپس آ سکیں گے۔`);
    tipsRoman.push(`Aap ghair-mehfooz slab mein hain. ${ctx.unitsToNextTier} units kam istemaal karein to mehfooz slab mein wapas aa sakenge.`);
  }

  if (ctx.vampireMonthlyCost > 0) {
    tips.push(`اسٹینڈ بائی آلات بند کریں — ${pkr(ctx.vampireMonthlyCost)} ماہانہ ضائع ہو رہے ہیں۔`);
    tipsRoman.push(`Standby alaat band karein — ${pkr(ctx.vampireMonthlyCost)} mahana zaya ho rahe hain.`);
  }

  tips.push("استعمال نہ کرنے پر آلات کو سوئچ بورڈ سے بند کریں۔");
  tipsRoman.push("Istemaal na karne par alaat ko switchboard se band karein.");

  return {
    tag: "saving",
    tagLabel: "Saving Tips",
    urdu: tips.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    romanUrdu: tipsRoman.map((t, i) => `${i + 1}. ${t}`).join("\n"),
  };
}

function generateGeneralAdvice(ctx: AdvisorContext): AdvisorResponse {
  const slabInfo = ctx.unprotected
    ? `آپ غیر محفوظ سلاب میں ہیں`
    : `آپ محفوظ سلاب میں ہیں`;
  const slabInfoRoman = ctx.unprotected
    ? `Aap ghair-mehfooz slab mein hain`
    : `Aap mehfooz slab mein hain`;

  return {
    tag: "tip",
    tagLabel: "General Advice",
    urdu: `میں آپ کی بجلی کی کھپت کا تجزیہ کر سکتا ہوں۔ ${slabInfo}، ${ctx.billedUnits} یونٹس، ${pkr(ctx.totalBill)} بل (${ctx.disco.name})۔ آپ ${ctx.appliances.length} اپلائنسز ٹریک کر رہے ہیں۔ آپ مجھ سے سلاب، اپلائنسز، بل، یا بچت کے بارے میں پوچھ سکتے ہیں۔`,
    romanUrdu: `Main aap ki bijli ki khaapt ka tajziya kar sakta hoon. ${slabInfoRoman}, ${ctx.billedUnits} units, ${pkr(ctx.totalBill)} bill (${ctx.disco.name}). Aap ${ctx.appliances.length} appliances track kar rahe hain. Aap mujh se slab, appliances, bill, ya bachat ke baray mein pooch sakte hain.`,
  };
}

export function generateAdvice(message: string, ctx: AdvisorContext): AdvisorResponse {
  const intent = detectIntent(message);
  switch (intent) {
    case "greeting":
      return generateGreeting(ctx);
    case "slab":
      return generateSlabAdvice(ctx);
    case "appliance":
      return generateApplianceAdvice(ctx);
    case "bill":
      return generateBillAdvice(ctx);
    case "saving":
      return generateSavingAdvice(ctx);
    default:
      return generateGeneralAdvice(ctx);
  }
}

export const SUGGESTION_CHIPS = [
  "میرا سلاب کیا ہے؟",
  "بجلی کیسے بچاؤں؟",
  "کون سی اپلائنس زیادہ بجلی کھاتی ہے؟",
  "میرا بل بجٹ کے اندر ہے؟",
];

export const INITIAL_GREETING =
  "Assalam o alaikum! Main aap ka AI Energy Advisor hoon. Apne bijli ke sawal poochein — slab, appliances, bill, ya bachat ke baray mein.";
