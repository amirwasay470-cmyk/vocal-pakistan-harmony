import { defaultAppliances, type Appliance } from "./awaaz-data";

/* ------------------------------------------------------------------ */
/* One-tap household presets                                           */
/* ------------------------------------------------------------------ */

export type PresetId = "small" | "medium" | "joint";

export type HouseholdPreset = {
  id: PresetId;
  label: string;
  urdu: string;
  people: string;
  note: string;
  /** id -> { hours, qty } overrides applied on top of the default appliance list */
  overrides: Record<string, { hours?: number; qty?: number }>;
};

export const householdPresets: HouseholdPreset[] = [
  {
    id: "small",
    label: "Small Home",
    urdu: "چھوٹا گھر",
    people: "1–3 people · 1–2 rooms",
    note: "1 AC used lightly, 2 fans, small fridge, geyser in winter only.",
    overrides: {
      ac: { hours: 4, qty: 1 },
      fridge: { hours: 24, qty: 1 },
      fan: { hours: 12, qty: 2 },
      geyser: { hours: 1, qty: 1 },
      iron: { hours: 0.3, qty: 1 },
      lights: { hours: 5, qty: 6 },
      washing: { hours: 0.5, qty: 1 },
      tv: { hours: 4, qty: 1 },
    },
  },
  {
    id: "medium",
    label: "Medium Family",
    urdu: "درمیانہ گھرانہ",
    people: "4–6 people · 3 rooms",
    note: "1 AC most nights, 4 fans, daily washing and ironing.",
    overrides: {
      ac: { hours: 8, qty: 1 },
      fridge: { hours: 24, qty: 1 },
      fan: { hours: 14, qty: 4 },
      geyser: { hours: 2, qty: 1 },
      iron: { hours: 0.5, qty: 1 },
      lights: { hours: 6, qty: 10 },
      washing: { hours: 1, qty: 1 },
      tv: { hours: 5, qty: 1 },
    },
  },
  {
    id: "joint",
    label: "Joint Family",
    urdu: "مشترکہ خاندان",
    people: "7+ people · 5+ rooms",
    note: "2–3 ACs, 8 fans, two fridges and heavy geyser use.",
    overrides: {
      ac: { hours: 10, qty: 3 },
      fridge: { hours: 24, qty: 2 },
      fan: { hours: 16, qty: 8 },
      geyser: { hours: 3, qty: 2 },
      iron: { hours: 1, qty: 1 },
      lights: { hours: 7, qty: 18 },
      washing: { hours: 1.5, qty: 1 },
      tv: { hours: 7, qty: 2 },
    },
  },
];

export function applyPreset(preset: HouseholdPreset): Appliance[] {
  return defaultAppliances.map((a) => {
    const o = preset.overrides[a.id];
    return o ? { ...a, hours: o.hours ?? a.hours, qty: o.qty ?? a.qty } : { ...a };
  });
}

/** Rough monthly units for a preset — used for the preset preview label. */
export function presetUnits(preset: HouseholdPreset): number {
  return applyPreset(preset).reduce((sum, a) => sum + (a.watts * a.hours * a.qty * 30) / 1000, 0);
}

/* ------------------------------------------------------------------ */
/* Lifeline / protected consumer slabs                                 */
/* ------------------------------------------------------------------ */

export type SlabStatus = {
  tier: "lifeline-50" | "lifeline-100" | "protected" | "unprotected";
  title: string;
  message: string;
  tone: "good" | "warn" | "bad";
  /** units left before the next (more expensive) status begins; null when already unprotected */
  unitsToNextTier: number | null;
};

export function lifelineStatus(units: number): SlabStatus {
  if (units <= 50)
    return {
      tier: "lifeline-50",
      title: "Lifeline consumer (up to 50 units)",
      message:
        "You qualify for the cheapest lifeline tariff. Staying under 50 units keeps this protection.",
      tone: "good",
      unitsToNextTier: 50 - units,
    };
  if (units <= 100)
    return {
      tier: "lifeline-100",
      title: "Lifeline consumer (51–100 units)",
      message:
        "You are still on the lifeline rate. Crossing 100 units moves you to normal protected slabs.",
      tone: "good",
      unitsToNextTier: 100 - units,
    };
  if (units <= 200)
    return {
      tier: "protected",
      title: "Protected consumer (under 200 units)",
      message:
        "Protected consumers pay lower slab rates. Cross 200 units in a month and you lose this status for six months.",
      tone: "warn",
      unitsToNextTier: 200 - units,
    };
  return {
    tier: "unprotected",
    title: "Unprotected consumer (over 200 units)",
    message:
      "You are billed at unprotected rates. Six straight months under 200 units restores protected status.",
    tone: "bad",
    unitsToNextTier: null,
  };
}

/* ------------------------------------------------------------------ */
/* Standby ("vampire") power                                           */
/* ------------------------------------------------------------------ */

export type StandbyDevice = {
  id: string;
  name: string;
  urdu: string;
  /** standby draw in watts, per device */
  watts: number;
  qty: number;
  tip: string;
};

export const defaultStandbyDevices: StandbyDevice[] = [
  {
    id: "tv-standby",
    name: "LED TV on standby",
    urdu: "ٹی وی",
    watts: 8,
    qty: 1,
    tip: "Switch off at the board — the red light costs you all month.",
  },
  {
    id: "router",
    name: "WiFi router / ONT",
    urdu: "وائی فائی",
    watts: 10,
    qty: 1,
    tip: "Turn it off overnight if nobody is online.",
  },
  {
    id: "ups",
    name: "UPS / inverter idle draw",
    urdu: "یو پی ایس",
    watts: 25,
    qty: 1,
    tip: "An idle UPS keeps trickle-charging; unplug when load-shedding ends.",
  },
  {
    id: "microwave",
    name: "Microwave clock display",
    urdu: "مائیکروویو",
    watts: 4,
    qty: 1,
    tip: "Plug it in only while cooking.",
  },
  {
    id: "chargers",
    name: "Phone / laptop chargers left plugged",
    urdu: "چارجر",
    watts: 2,
    qty: 4,
    tip: "Pull chargers out once the phone is full.",
  },
  {
    id: "dispenser",
    name: "Water dispenser (hot tank)",
    urdu: "واٹر ڈسپنسر",
    watts: 35,
    qty: 1,
    tip: "Switch the hot tank off in summer — biggest hidden drain.",
  },
  {
    id: "setbox",
    name: "Cable box / dish receiver",
    urdu: "ریسیور",
    watts: 12,
    qty: 1,
    tip: "Receivers stay fully awake on standby; use the board switch.",
  },
];

export type VampireResult = {
  watts: number;
  monthlyUnits: number;
  monthlyCost: number;
  yearlyCost: number;
  rows: { name: string; urdu: string; units: number; cost: number; tip: string }[];
};

export function calculateVampire(devices: StandbyDevice[], rate: number): VampireResult {
  const rows = devices
    .map((d) => {
      const units = (d.watts * d.qty * 24 * 30) / 1000;
      return { name: d.name, urdu: d.urdu, units, cost: units * rate, tip: d.tip };
    })
    .sort((a, b) => b.units - a.units);
  const monthlyUnits = rows.reduce((s, r) => s + r.units, 0);
  const monthlyCost = monthlyUnits * rate;
  return {
    watts: devices.reduce((s, d) => s + d.watts * d.qty, 0),
    monthlyUnits,
    monthlyCost,
    yearlyCost: monthlyCost * 12,
    rows,
  };
}

/* ------------------------------------------------------------------ */
/* Monthly budget guard                                                */
/* ------------------------------------------------------------------ */

export type BudgetVerdict = {
  status: "safe" | "close" | "over";
  usedPct: number;
  difference: number;
  headline: string;
  advice: string;
};

export function budgetGuard(projectedBill: number, budget: number): BudgetVerdict {
  const usedPct = budget > 0 ? (projectedBill / budget) * 100 : 0;
  const difference = projectedBill - budget;
  if (usedPct > 100)
    return {
      status: "over",
      usedPct,
      difference,
      headline: "Budget crossed",
      advice:
        "Cut AC by 2 hours a night and shift ironing and washing to one weekly session to pull the bill back down.",
    };
  if (usedPct >= 85)
    return {
      status: "close",
      usedPct,
      difference,
      headline: "Close to your limit",
      advice:
        "You are near the line — trim standby devices and geyser hours for the rest of the month.",
    };
  return {
    status: "safe",
    usedPct,
    difference,
    headline: "Within budget",
    advice: "Your projected bill fits your monthly limit. Keep the same usage pattern.",
  };
}
