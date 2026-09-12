import { discos, slabBreakdownFor, pkr, type Disco } from "./awaaz-data";

export type TariffComponent = {
  id: string;
  label: string;
  urdu: string;
  amount: number;
  pct: number;
  color: string;
  description: string;
};

export type TariffBreakdown = {
  disco: Disco;
  energyCost: number;
  fpa: number;
  quarterlyAdjustment: number;
  gst: number;
  surcharges: number;
  fixedCharges: number;
  total: number;
  components: TariffComponent[];
};

const FPA_RATE: Record<string, number> = {
  "k-electric": 0.085,
  lesco: 0.072,
  iesco: 0.068,
  fesco: 0.065,
  gepco: 0.067,
  pesco: 0.07,
  hesco: 0.078,
  qesco: 0.082,
  mepco: 0.069,
};

const QUARTERLY_RATE: Record<string, number> = {
  "k-electric": 0.035,
  lesco: 0.03,
  iesco: 0.028,
  fesco: 0.026,
  gepco: 0.027,
  pesco: 0.029,
  hesco: 0.032,
  qesco: 0.034,
  mepco: 0.028,
};

const SURCHARGE_FLAT: Record<string, number> = {
  "k-electric": 85,
  lesco: 75,
  iesco: 80,
  fesco: 70,
  gepco: 72,
  pesco: 78,
  hesco: 68,
  qesco: 65,
  mepco: 74,
};

export function tariffBreakdown(units: number, discoId: string): TariffBreakdown {
  const disco = discos.find((d) => d.id === discoId) ?? discos[0]!;
  const slabRows = slabBreakdownFor(units, disco.slabs);
  const energyCost = slabRows.reduce((s, r) => s + r.amount, 0);

  const fpa = energyCost * (FPA_RATE[disco.id] ?? 0.07);
  const quarterlyAdjustment = energyCost * (QUARTERLY_RATE[disco.id] ?? 0.03);
  const gstRate = disco.taxRate;
  const gst = (energyCost + fpa + quarterlyAdjustment) * gstRate;
  const surcharges = SURCHARGE_FLAT[disco.id] ?? 75;
  const fixedCharges = disco.fixedCharges;
  const total = energyCost + fpa + quarterlyAdjustment + gst + surcharges + fixedCharges;

  const components: TariffComponent[] = [
    {
      id: "energy",
      label: "Actual kWh Consumption",
      urdu: "اصل استعمالی یونٹس",
      amount: energyCost,
      pct: total > 0 ? (energyCost / total) * 100 : 0,
      color: "bg-emerald-500",
      description: `Your ${Math.round(units)} kWh billed at slab rates totalling ${pkr(energyCost)}.`,
    },
    {
      id: "fpa",
      label: "Fuel Price Adjustment (FPA)",
      urdu: "فیول پرائس ایڈجسٹمنٹ",
      amount: fpa,
      pct: total > 0 ? (fpa / total) * 100 : 0,
      color: "bg-amber-500",
      description: `Monthly fuel-cost adjustment set by NEPRA. This month: ${pkr(fpa)}.`,
    },
    {
      id: "quarterly",
      label: "Quarterly Tariff Adjustment",
      urdu: "سہ ماہی ٹیرف ایڈجسٹمنٹ",
      amount: quarterlyAdjustment,
      pct: total > 0 ? (quarterlyAdjustment / total) * 100 : 0,
      color: "bg-sky-500",
      description: `NEPRA quarterly revision surcharge: ${pkr(quarterlyAdjustment)}.`,
    },
    {
      id: "gst",
      label: `GST (${Math.round(gstRate * 100)}%)`,
      urdu: "جی ایس ٹی",
      amount: gst,
      pct: total > 0 ? (gst / total) * 100 : 0,
      color: "bg-rose-500",
      description: `General Sales Tax applied on energy + FPA + quarterly: ${pkr(gst)}.`,
    },
    {
      id: "surcharges",
      label: "Misc. Surcharges",
      urdu: "متفرق سرچارجز",
      amount: surcharges,
      pct: total > 0 ? (surcharges / total) * 100 : 0,
      color: "bg-violet-500",
      description: `TV fee, radio fee, meter rent and other fixed surcharges: ${pkr(surcharges)}.`,
    },
    {
      id: "fixed",
      label: "Fixed & Meter Charges",
      urdu: "مستقل چارجز",
      amount: fixedCharges,
      pct: total > 0 ? (fixedCharges / total) * 100 : 0,
      color: "bg-slate-500",
      description: `Monthly fixed connection and meter rent: ${pkr(fixedCharges)}.`,
    },
  ];

  return { disco, energyCost, fpa, quarterlyAdjustment, gst, surcharges, fixedCharges, total, components };
}

export const warRoomDiscos = ["lesco", "k-electric", "iesco", "fesco"] as const;
export type WarRoomDiscoId = (typeof warRoomDiscos)[number];
