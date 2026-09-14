import { useMemo, useState } from "react";
import {
  Flame,
  Cylinder,
  Cable,
  Gauge,
  Users,
  Utensils,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  BookmarkPlus,
  CheckCircle2,
  Wrench,
  CookingPot,
  CircleDot,
  Wind,
  Receipt,
  Sparkles,
  Timer,
  Check,
  ShieldCheck,
  Clock,
  Zap,
  Info,
} from "lucide-react";
import { pkr } from "@/lib/awaaz-data";
import { SectionHead, Field } from "@/components/awaaz/BillAudit";
import { GasBillScanner, type GasBillParseResult } from "@/components/awaaz/GasBillScanner";

export type PipelineSchedule = "full24" | "mealtimes" | "lowPressure" | "zeroGas" | "noConnection";

export type CylinderSizeId = "4kg" | "6kg" | "10kg" | "11.8kg" | "15kg" | "custom";

export type SlabId = "protectedLow" | "protectedHigh" | "nonProtectedMid" | "nonProtectedHigh";

export type HybridTipId = "timing" | "kettle" | "cooker" | "leak";

export const PIPELINE_SCHEDULES: {
  id: PipelineSchedule;
  title: string;
  hours: string;
  desc: string;
}[] = [
  {
    id: "mealtimes",
    title: "Mealtimes Only (Subah, Dopehar, Raat)",
    hours: "6–8 Hours / Day",
    desc: "Subah 6–9 AM, Dopehar 12–2 PM, Raat 7–10 PM gas aati hai (Standard Pakistani City Schedule).",
  },
  {
    id: "lowPressure",
    title: "Kam Pressure (Slow Cooking)",
    hours: "3–4 Hours / Day",
    desc: "Sui gas aati hai magar aag bohat halki hoti hai, handi aur chai banne mein der lagti hai.",
  },
  {
    id: "full24",
    title: "24 Ghantay Mukammal Pressure",
    hours: "24 Hours Normal",
    desc: "Khush-naseeb ilaqa jahan Sui Gas har waqt behtareen pressure ke sath mojood hai.",
  },
  {
    id: "zeroGas",
    title: "Shadeed Load-Shedding (Na Hone Ke Barabar)",
    hours: "0–1 Hour / Day",
    desc: "Gas bilkul nahi aati ya sirf raat 2 bajay aati hai. Kitchen 95% cylinder par munhasir hai.",
  },
  {
    id: "noConnection",
    title: "Ghar Mein Sui Gas Connection Nahi Hai",
    hours: "0 Hours",
    desc: "100% LPG cylinder par khana banta hai (Pendu ilaqa ya nai society).",
  },
];

export const CYLINDER_SIZES: {
  id: CylinderSizeId;
  label: string;
  kg: number;
  popularFor: string;
}[] = [
  { id: "4kg", label: "4 KG (Chota)", kg: 4, popularFor: "Chai, nashta aur emergency backup" },
  { id: "6kg", label: "6 KG (Darmiyana)", kg: 6, popularFor: "1-2 hafte ki handi aur backup" },
  { id: "10kg", label: "10 KG (Compact)", kg: 10, popularFor: "Apartment / small family" },
  {
    id: "11.8kg",
    label: "11.8 KG (Standard OGRA)",
    kg: 11.8,
    popularFor: "Official domestic cylinder",
  },
  { id: "15kg", label: "15 KG (Bara)", kg: 15, popularFor: "Bari joint family ya commercial" },
];

export const PIPELINE_SLABS: {
  id: SlabId;
  name: string;
  band: "Protected" | "Non-protected";
  rate: number;
  fixed: number;
}[] = [
  {
    id: "protectedLow",
    name: "Protected · Tier 1 (0–0.5 hm³)",
    band: "Protected",
    rate: 200,
    fixed: 10,
  },
  {
    id: "protectedHigh",
    name: "Protected · Tier 2 (0.5–1.0 hm³)",
    band: "Protected",
    rate: 350,
    fixed: 10,
  },
  {
    id: "nonProtectedMid",
    name: "Non-Protected · Mid Tier",
    band: "Non-protected",
    rate: 1500,
    fixed: 460,
  },
  {
    id: "nonProtectedHigh",
    name: "Non-Protected · Top Tier",
    band: "Non-protected",
    rate: 4200,
    fixed: 460,
  },
];

export const HYBRID_TIPS = [
  {
    id: "timing" as HybridTipId,
    name: "Heavy Cooking Strictly Sui Gas Timing Pe",
    short: "Sui Gas Timing Shift",
    icon: <Clock className="h-4 w-4" />,
    savingFraction: 0.22,
    note: "Gosht, daal aur channay sirf Sui Gas pressure hours mein ubaalen. Sui gas pe cost Rs. 15 hoti hai jabke cylinder pe Rs. 95 lagte hain.",
  },
  {
    id: "cooker" as HybridTipId,
    name: "Whistle Pressure Cooker Ka Istemal",
    short: "Pressure Cooker",
    icon: <CookingPot className="h-4 w-4" />,
    savingFraction: 0.18,
    note: "Pressure cooker gas ka waqt 40% kam kar deta hai. Mahana LPG aur Sui gas dono mein bari bachat.",
  },
  {
    id: "kettle" as HybridTipId,
    name: "Paani Ubalne Ke Liye Electric Kettle Swap",
    short: "Electric Kettle Swap",
    icon: <Zap className="h-4 w-4" />,
    savingFraction: 0.12,
    note: "Drinking water aur chai ka paani gas cylinder ke bajaye electric kettle mein ubaalna 60% sasta parta hai.",
  },
  {
    id: "leak" as HybridTipId,
    name: "Regulator & Nozzle Sabun Paani Test",
    short: "Leakage Check",
    icon: <Wrench className="h-4 w-4" />,
    savingFraction: 0.08,
    note: "Sabun ke jhag se regulator aur rubber pipe ki leakage check karein. Chupi hui gas leak mahana 1–2 kg gas zaya karti hai.",
  },
];

export function GasCookingCalculator() {
  // Pipeline Gas State
  const [hasPipeline, setHasPipeline] = useState<boolean>(true);
  const [pipelineSchedule, setPipelineSchedule] = useState<PipelineSchedule>("mealtimes");
  const [pipelineBillMethod, setPipelineBillMethod] = useState<"billPkr" | "mmbtu">("billPkr");
  const [pipelineBillPkr, setPipelineBillPkr] = useState<number>(1850);
  const [pipelineMmbtu, setPipelineMmbtu] = useState<number>(4.0);
  const [pipelineSlabId, setPipelineSlabId] = useState<SlabId>("protectedHigh");

  // LPG Cylinder State
  const [usesLpg, setUsesLpg] = useState<boolean>(true);
  const [cylinderSizeId, setCylinderSizeId] = useState<CylinderSizeId>("11.8kg");
  const [customCylinderKg, setCustomCylinderKg] = useState<number>(10);
  const [refillsPerMonth, setRefillsPerMonth] = useState<number>(1.5);
  const [lpgRatePerKg, setLpgRatePerKg] = useState<number>(258.0);
  const [deliveryPerRefill, setDeliveryPerRefill] = useState<number>(100.0);

  // Tips & Plan Saving
  const [selectedTipId, setSelectedTipId] = useState<HybridTipId>("timing");
  const [savedPlan, setSavedPlan] = useState<boolean>(false);

  // Handle scanned gas bill
  const handleApplyGasBill = (scan: GasBillParseResult) => {
    setHasPipeline(true);
    setPipelineMmbtu(scan.unitsMmbtu);
    setPipelineSlabId(scan.slabId);
    if (scan.totalAmount > 0) {
      setPipelineBillPkr(scan.totalAmount);
      setPipelineBillMethod("billPkr");
    } else {
      setPipelineBillMethod("mmbtu");
    }
  };

  // Cylinder KG calculation
  const activeKg = useMemo(() => {
    if (cylinderSizeId === "custom") return customCylinderKg;
    const found = CYLINDER_SIZES.find((s) => s.id === cylinderSizeId);
    return found ? found.kg : 11.8;
  }, [cylinderSizeId, customCylinderKg]);

  const costPerRefill = useMemo(() => {
    return activeKg * lpgRatePerKg + deliveryPerRefill;
  }, [activeKg, lpgRatePerKg, deliveryPerRefill]);

  // Calculations
  const calculated = useMemo(() => {
    // 1. Pipeline cost
    let pipelineCost = 0;
    const slab = PIPELINE_SLABS.find((s) => s.id === pipelineSlabId) || PIPELINE_SLABS[1]!;

    if (hasPipeline && pipelineSchedule !== "noConnection") {
      if (pipelineBillMethod === "billPkr") {
        pipelineCost = Math.max(0, pipelineBillPkr);
      } else {
        pipelineCost = Math.max(0, pipelineMmbtu * slab.rate + slab.fixed);
      }
    }

    // 2. LPG cost
    let lpgCost = 0;
    let lpgKgMonthly = 0;
    if (usesLpg) {
      lpgCost = refillsPerMonth * costPerRefill;
      lpgKgMonthly = refillsPerMonth * activeKg;
    }

    // 3. Total Combined
    const totalMonthlyCost = pipelineCost + lpgCost;
    const dailyCost = totalMonthlyCost / 30;

    const pipelinePct = totalMonthlyCost > 0 ? (pipelineCost / totalMonthlyCost) * 100 : 0;
    const lpgPct = totalMonthlyCost > 0 ? (lpgCost / totalMonthlyCost) * 100 : 0;

    // 4. Savings with Tip
    const tip = HYBRID_TIPS.find((t) => t.id === selectedTipId) || HYBRID_TIPS[0]!;
    // Tip saves mainly on the expensive portion (or combined cooking burn)
    const savings = totalMonthlyCost * tip.savingFraction;
    const optimizedMonthly = Math.max(0, totalMonthlyCost - savings);
    const yearlySavings = savings * 12;

    return {
      pipelineCost,
      lpgCost,
      totalMonthlyCost,
      dailyCost,
      pipelinePct,
      lpgPct,
      lpgKgMonthly,
      savings,
      optimizedMonthly,
      yearlySavings,
      annualTotal: totalMonthlyCost * 12,
    };
  }, [
    hasPipeline,
    pipelineSchedule,
    pipelineBillMethod,
    pipelineBillPkr,
    pipelineMmbtu,
    pipelineSlabId,
    usesLpg,
    refillsPerMonth,
    costPerRefill,
    activeKg,
    selectedTipId,
  ]);

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Flame className="h-6 w-6 text-amber-400" />}
        title="Kitchen Cooking Gas & LPG Cylinder Management"
        subtitle="Sui Gas (SNGPL/SSGC) aur LPG Cylinder ka mushtarka kharcha hisab karein — aur hybrid bachat ke tareeqe dekhein."
      />

      {/* ── Official OGRA & SNGPL Reference Tariffs ───────────── */}
      <div className="glass-card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold text-white tracking-tight">
            <Receipt className="h-3.5 w-3.5 text-amber-400" /> Pakistan Reference Cooking Energy
            Rates (OGRA Domestic)
          </p>
          <span className="badge-safe">Official Benchmark</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Cylinder className="h-4 w-4" /> LPG Domestic Cylinder (OGRA)
              </span>
              <p className="text-xl font-black text-white mt-1">
                Rs. {lpgRatePerKg.toFixed(2)} / kg
              </p>
              <p className="text-[11px] text-slate-400">11.8kg Cylinder ≈ Rs. 3,050 + delivery</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950 px-2 py-1 rounded border border-amber-500/40">
                Current OGRA Rate
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Cable className="h-4 w-4" /> Sui Gas (SSGC / SNGPL)
              </span>
              <p className="text-xl font-black text-white mt-1">Rs. 200 – 4,200 / MMBTU</p>
              <p className="text-[11px] text-slate-400">
                Protected (Rs 200–350) vs Non-Protected (Rs 1,500+)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950 px-2 py-1 rounded border border-emerald-500/40">
                NEPRA/SNGPL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bill Scanner (Retained & Clutter-Free) ─────────────── */}
      <GasBillScanner onApplyBill={handleApplyGasBill} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* ── Left Column: Combined Inputs (Pipeline + LPG) ────── */}
        <div className="space-y-6">
          {/* 1. Pipeline Sui Gas Inputs */}
          <div className="glass-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cable className="h-5 w-5 text-emerald-400" />
                1. Sui Gas Pipeline Setup (SNGPL / SSGC)
              </h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <span>Connection Mojood Hai?</span>
                <input
                  type="checkbox"
                  checked={hasPipeline}
                  onChange={(e) => setHasPipeline(e.target.checked)}
                  className="h-4 w-4 accent-emerald-500 rounded"
                />
              </label>
            </div>

            {hasPipeline ? (
              <div className="space-y-4">
                {/* Pipeline Availability Schedule */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Gas Aane Ka Schedule / Pressure Ki Surat-e-Haal:
                  </label>
                  <div className="space-y-2">
                    {PIPELINE_SCHEDULES.filter((s) => s.id !== "noConnection").map((s) => {
                      const active = s.id === pipelineSchedule;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setPipelineSchedule(s.id)}
                          className={`flex items-start gap-3 w-full p-3 rounded-xl border text-left transition-all ${
                            active
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          <span
                            className={`mt-0.5 h-3.5 w-3.5 rounded-full border-2 shrink-0 ${
                              active ? "border-emerald-400 bg-emerald-400" : "border-slate-600"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white">{s.title}</span>
                              <span className="text-[11px] font-mono text-emerald-400 font-semibold shrink-0">
                                {s.hours}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              {s.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pipeline Bill Amount Input */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      Mahana Sui Gas Ka Bill (Monthly Bill):
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setPipelineBillMethod("billPkr")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          pipelineBillMethod === "billPkr"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Bill in PKR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPipelineBillMethod("mmbtu")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          pipelineBillMethod === "mmbtu"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Units (MMBTU)
                      </button>
                    </div>
                  </div>

                  {pipelineBillMethod === "billPkr" ? (
                    <div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                          Rs.
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={pipelineBillPkr}
                          onChange={(e) => setPipelineBillPkr(Math.max(0, Number(e.target.value)))}
                          className="input-base pl-10 font-bold text-lg text-white"
                          placeholder="e.g. 1850"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Aapke haliya Sui Gas bill ki kul raqam (ya bill scan karein)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Consumed MMBTU:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {pipelineMmbtu} MMBTU
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={15}
                        step={0.5}
                        value={pipelineMmbtu}
                        onChange={(e) => setPipelineMmbtu(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <select
                        value={pipelineSlabId}
                        onChange={(e) => setPipelineSlabId(e.target.value as SlabId)}
                        className="input-base text-xs"
                      >
                        {PIPELINE_SLABS.map((sl) => (
                          <option key={sl.id} value={sl.id}>
                            {sl.name} (Rs. {sl.rate}/MMBTU)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-400">
                Sui Gas connection band ya ghaib hai. Aapka pura kitchen LPG cylinder par chalta
                hai.
              </div>
            )}
          </div>

          {/* 2. LPG Cylinder Usage Inputs */}
          <div className="glass-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cylinder className="h-5 w-5 text-amber-400" />
                2. LPG Cylinder Ka Istemal (Backup / Daily)
              </h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <span>Cylinder Istemal Hota Hai?</span>
                <input
                  type="checkbox"
                  checked={usesLpg}
                  onChange={(e) => setUsesLpg(e.target.checked)}
                  className="h-4 w-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            {usesLpg ? (
              <div className="space-y-4">
                {/* Cylinder Size Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Cylinder Ka Size Muntakhib Karein:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CYLINDER_SIZES.map((cs) => {
                      const active = cs.id === cylinderSizeId;
                      return (
                        <button
                          key={cs.id}
                          type="button"
                          onClick={() => setCylinderSizeId(cs.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            active
                              ? "border-amber-500 bg-amber-950/40 text-amber-300"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          <span className="text-xs font-bold text-white block">{cs.label}</span>
                          <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">
                            Rs.{" "}
                            {Math.round(cs.kg * lpgRatePerKg + deliveryPerRefill).toLocaleString(
                              "en-PK",
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {cs.popularFor}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Refill Frequency & Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Mahana Refills:</span>
                      <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                        {refillsPerMonth} {refillsPerMonth === 1 ? "Cylinder" : "Cylinders"} / mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={4}
                      step={0.5}
                      value={refillsPerMonth}
                      onChange={(e) => setRefillsPerMonth(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5 (2 Mahine mein 1)</span>
                      <span>1 / Mahina</span>
                      <span>2 / Mahina</span>
                      <span>4 / Mahina</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      LPG Rate (PKR / kg):
                    </label>
                    <input
                      type="number"
                      min={150}
                      max={450}
                      value={lpgRatePerKg}
                      onChange={(e) => setLpgRatePerKg(Number(e.target.value))}
                      className="input-base text-sm font-bold text-white"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      1 Refill Cost:{" "}
                      <strong>Rs. {Math.round(costPerRefill).toLocaleString("en-PK")}</strong> (inc.
                      delivery)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-400">
                Aap cylinder istemal nahi karte, kitchen mukammal taur par pipeline gas par chalta
                hai.
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Unified Kitchen Totals & Hybrid Strategy ── */}
        <div className="space-y-6">
          {/* Combined Expense Card */}
          <div className="glass-card p-5 sm:p-6 space-y-4 border-amber-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-amber-400" />
                Kitchen Ka Kul Mahana Kharcha
              </h4>
              <span className="badge-safe">Combined Total</span>
            </div>

            {/* Big Combined Number */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sui Gas + LPG Cylinder Total / Month:
              </p>
              <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                Rs. {Math.round(calculated.totalMonthlyCost).toLocaleString("en-PK")}
              </p>
              <p className="text-xs text-slate-400">
                Rozana kitchen kharcha:{" "}
                <strong>Rs. {Math.round(calculated.dailyCost).toLocaleString("en-PK")}</strong> /
                din
              </p>
            </div>

            {/* Split Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Cable className="h-3 w-3" /> Piped Sui Gas:
                </span>
                <p className="text-lg font-black text-white mt-1">
                  Rs. {Math.round(calculated.pipelineCost).toLocaleString("en-PK")}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(calculated.pipelinePct)}% of kitchen budget
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  <Cylinder className="h-3 w-3" /> LPG Cylinder:
                </span>
                <p className="text-lg font-black text-white mt-1">
                  Rs. {Math.round(calculated.lpgCost).toLocaleString("en-PK")}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(calculated.lpgPct)}% of kitchen budget
                </span>
              </div>
            </div>

            {/* Visual Split Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400">
                  Sui Gas ({Math.round(calculated.pipelinePct)}%)
                </span>
                <span className="text-amber-400">
                  LPG Cylinder ({Math.round(calculated.lpgPct)}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${calculated.pipelinePct}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${calculated.lpgPct}%` }}
                />
              </div>
            </div>

            {/* Hybrid Optimization Strategy Selector */}
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                Bachat Ka Formula Muntakhib Karein (Kitchen Energy Fix):
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HYBRID_TIPS.map((tip) => {
                  const active = tip.id === selectedTipId;
                  return (
                    <button
                      key={tip.id}
                      type="button"
                      onClick={() => {
                        setSelectedTipId(tip.id);
                        setSavedPlan(false);
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {tip.icon}
                        <span>{tip.short}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {tip.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Projected Savings Banner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Bachat Baad Mahana Kharcha:
                </span>
                <p className="text-xl font-black text-emerald-400">
                  Rs. {Math.round(calculated.optimizedMonthly).toLocaleString("en-PK")} / Mahana
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saalana retainable fund: Rs.{" "}
                  {Math.round(calculated.yearlySavings).toLocaleString("en-PK")}
                </p>
              </div>
              <div className="text-right">
                <span className="badge-safe">
                  Rs. {Math.round(calculated.savings).toLocaleString("en-PK")} Bachat
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSavedPlan(true)}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              {savedPlan ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Ye Plan Save Ho Gaya Hai
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" /> Save Kitchen Energy Budget
                </>
              )}
            </button>
          </div>

          {/* Practical Awami Kitchen Rules */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Bawarchi Khanay Ke 4 Zaroori Awami Mashwaray
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">1.</span>
                <span>
                  <strong>Aag Ka Daira (Pot Boundary):</strong> Patila burner se chota na ho. Agar
                  aag bartan ke kinaray se bahar nikal rahi hai to 30% gas hawa mein zaya ho rahi
                  hai.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">2.</span>
                <span>
                  <strong>Daal Aur Channay Pehle Bhigo Kar Rakhein:</strong> Pakane se 45 minute
                  pehle daal paani mein bhigone se gas par galne ka waqt aadha reh jata hai.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">3.</span>
                <span>
                  <strong>Neeli Flame (Blue Flame) Ki Pahchan:</strong> Agar choolah peeli (yellow)
                  aag de raha hai aur bartan kaale ho rahe hain to nozzle mein kachra hai. Safai
                  karwane se 20% tez aag milti hai.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">4.</span>
                <span>
                  <strong>Cylinder Ki Hifazat:</strong> Cylinder ko hamesha seedha khara rakhein aur
                  band kamray ya base mein na rakhein. Regulator par hamesha steel clamp lagwaen.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
