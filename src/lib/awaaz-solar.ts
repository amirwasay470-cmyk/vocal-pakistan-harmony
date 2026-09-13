import { slabBreakdownFor, pkr, type Disco } from "./awaaz-data";

export type SolarTier = "entry" | "balanced" | "premium";

export type SolarSystem = {
  kw: number;
  panels: number;
  batteryKwh: number;
  tier: SolarTier;
  upfrontCost: number;
  monthlyGeneration: number;
  selfConsumed: number;
  exported: number;
  billAfterSolar: number;
  monthlySavings: number;
  yearlySavings: number;
  paybackMonths: number;
  paybackYears: number;
  backupHours: number;
  independencePct: number;
  co2SavedYearly: number;
  treesEquivalent: number;
};

export type SolarInput = {
  monthlyUnits: number;
  disco: Disco;
  sunlightHours: number;
  tier: SolarTier;
  batteryKwh: number;
  loadSheddingHours: number;
};

// Pakistani market solar pricing (PKR per watt, per kWh battery) — 2025 estimates
export const solarPricing = {
  panelPerWatt: { entry: 95, balanced: 110, premium: 140 } as Record<SolarTier, number>,
  inverterPerWatt: { entry: 18, balanced: 22, premium: 32 } as Record<SolarTier, number>,
  batteryPerKwh: 65000,
  installationPct: 0.12,
  miscFixed: 25000,
};

export const sunlightByCity: { city: string; hours: number; note: string }[] = [
  { city: "Karachi", hours: 5.2, note: "Coastal — strong year-round sun" },
  { city: "Lahore", hours: 5.0, note: "Good sun, winter dip in Dec–Jan" },
  { city: "Islamabad", hours: 4.8, note: "Moderate, some haze in winter" },
  { city: "Multan", hours: 5.4, note: "Best in Punjab — hot and clear" },
  { city: "Quetta", hours: 5.5, note: "Highest altitude sun" },
  { city: "Peshawar", hours: 5.1, note: "Good, slight summer dust" },
  { city: "Hyderabad", hours: 5.3, note: "Very strong coastal sun" },
  { city: "Faisalabad", hours: 5.0, note: "Similar to Lahore" },
  { city: "Gujranwala", hours: 4.9, note: "Moderate Punjab sun" },
];

export function recommendedSystemSize(units: number, sunlightHours: number): number {
  const dailyKwh = units / 30;
  const systemKw = dailyKwh / (sunlightHours * 0.77);
  return Math.max(1, Math.round(systemKw * 2) / 2);
}

export function calculateSolarSystem(input: SolarInput): SolarSystem {
  const { monthlyUnits, disco, sunlightHours, tier, batteryKwh, loadSheddingHours } = input;

  const systemKw = recommendedSystemSize(monthlyUnits, sunlightHours);
  const panels = Math.ceil((systemKw * 1000) / 550);

  const panelCost = systemKw * 1000 * solarPricing.panelPerWatt[tier]!;
  const inverterCost = systemKw * 1000 * solarPricing.inverterPerWatt[tier]!;
  const batteryCost = batteryKwh * solarPricing.batteryPerKwh;
  const subtotal = panelCost + inverterCost + batteryCost + solarPricing.miscFixed;
  const installation = subtotal * solarPricing.installationPct;
  const upfrontCost = Math.round(subtotal + installation);

  const monthlyGeneration = systemKw * sunlightHours * 0.77 * 30;
  const daytimeLoad = monthlyUnits * 0.45;
  const selfConsumed = Math.min(monthlyGeneration, daytimeLoad);
  const exported = Math.max(0, monthlyGeneration - selfConsumed);

  const imports = Math.max(0, monthlyUnits - selfConsumed);
  const afterRows = slabBreakdownFor(imports, disco.slabs);
  const afterEnergy = afterRows.reduce((s, r) => s + r.amount, 0);
  const netMeteringCredit = exported * disco.slabs.at(-1)!.rate * 0.6;
  const billAfterSolar = Math.max(
    0,
    afterEnergy * (1 + disco.taxRate) + disco.fixedCharges - netMeteringCredit,
  );

  const baseRows = slabBreakdownFor(monthlyUnits, disco.slabs);
  const baseEnergy = baseRows.reduce((s, r) => s + r.amount, 0);
  const baseBill = baseEnergy * (1 + disco.taxRate) + disco.fixedCharges;
  const monthlySavings = Math.max(0, baseBill - billAfterSolar);
  const yearlySavings = monthlySavings * 12;
  const paybackMonths = monthlySavings > 0 ? upfrontCost / monthlySavings : Infinity;
  const paybackYears = paybackMonths / 12;

  const backupHours = batteryKwh > 0 ? (batteryKwh * 0.8) / 1.5 : 0;
  const independencePct = monthlyUnits > 0 ? (selfConsumed / monthlyUnits) * 100 : 0;

  const co2SavedYearly = (selfConsumed + exported) * 12 * 0.4;
  const treesEquivalent = Math.round(co2SavedYearly / 21);

  return {
    kw: systemKw,
    panels,
    batteryKwh,
    tier,
    upfrontCost,
    monthlyGeneration,
    selfConsumed,
    exported,
    billAfterSolar,
    monthlySavings,
    yearlySavings,
    paybackMonths,
    paybackYears,
    backupHours,
    independencePct,
    co2SavedYearly,
    treesEquivalent,
  };
}

export type MeterHealth = {
  status: "healthy" | "suspicious" | "warning";
  title: string;
  message: string;
  gapUnits: number;
  gapPct: number;
  possibleFaultyMeter: boolean;
  possibleTheft: boolean;
  recommendations: string[];
};

export function analyzeMeterHealth(
  billedUnits: number,
  estimatedUnits: number,
  vampireUnits: number,
): MeterHealth {
  const totalEstimated = estimatedUnits + vampireUnits;
  const gapUnits = billedUnits - totalEstimated;
  const gapPct = totalEstimated > 0 ? (Math.abs(gapUnits) / totalEstimated) * 100 : 0;

  const recommendations: string[] = [];

  if (gapPct < 10) {
    return {
      status: "healthy",
      title: "Meter reading looks accurate",
      message: `Your billed units match your estimated consumption within ${gapPct.toFixed(1)}%. The bill appears genuine.`,
      gapUnits,
      gapPct,
      possibleFaultyMeter: false,
      possibleTheft: false,
      recommendations: [
        "Keep monitoring your monthly readings to catch any sudden jumps early.",
        "Take a photo of your meter each month for your own record.",
      ],
    };
  }

  if (gapUnits > 0 && gapPct > 25) {
    recommendations.push(
      "Submit a meter-reading complaint to your DISCO — request a physical inspection.",
    );
    recommendations.push(
      "Check for hidden or shared loads: water pumps, shared stairwell lights, or a neighbour tapping your line.",
    );
    recommendations.push(
      "Inspect your meter for signs of tampering or loose wiring at the connection point.",
    );
    if (gapPct > 50) {
      recommendations.push(
        "The gap is very large — request a meter calibration test from your DISCO's engineering wing.",
      );
    }
    return {
      status: "warning",
      title: "Large gap detected — investigate",
      message: `You're billed ${Math.round(gapUnits)} units more than your appliances and standby devices explain (${gapPct.toFixed(0)}% gap). This could indicate a faulty meter, shared load, or electricity theft.`,
      gapUnits,
      gapPct,
      possibleFaultyMeter: gapPct > 25,
      possibleTheft: gapPct > 40,
      recommendations,
    };
  }

  recommendations.push(
    "Compare your last 3 months of bills — if the gap is consistent, request a meter test.",
  );
  recommendations.push(
    "Check if your meter is old (electromechanical) — older meters drift and over-record.",
  );
  return {
    status: "suspicious",
    title: "Small discrepancy noted",
    message: `There's a ${Math.round(Math.abs(gapUnits))} unit difference (${gapPct.toFixed(0)}% gap) between estimated and billed usage. This is within normal variance but worth monitoring.`,
    gapUnits,
    gapPct,
    possibleFaultyMeter: false,
    possibleTheft: false,
    recommendations,
  };
}

export type SmartPlugSchedule = {
  device: string;
  urdu: string;
  action: string;
  savingsPkr: number;
  schedule: string;
  priority: "high" | "medium" | "low";
};

export function smartPlugSchedules(
  vampireMonthlyCost: number,
  devices: { name: string; urdu: string; watts: number; qty: number; tip: string }[],
  rate: number,
): SmartPlugSchedule[] {
  const schedules: SmartPlugSchedule[] = [];

  for (const d of devices) {
    if (d.qty === 0) continue;
    const units = (d.watts * d.qty * 24 * 30) / 1000;
    const cost = units * rate;
    if (cost < 5) continue;

    let schedule = "Off 11pm–7am";
    let action = "Auto-off at night";
    let priority: "high" | "medium" | "low" = "low";

    if (d.name.includes("dispenser") || d.name.includes("hot")) {
      schedule = "Hot tank off Apr–Oct, on only 6–9am in winter";
      action = "Seasonal timer on hot tank";
      priority = "high";
    } else if (d.name.includes("UPS") || d.name.includes("inverter")) {
      schedule = "Unplug during no load-shedding";
      action = "Disconnect when grid is stable";
      priority = "high";
    } else if (d.name.includes("router") || d.name.includes("WiFi")) {
      schedule = "Off 1am–7am";
      action = "Nightly auto-off timer";
      priority = "medium";
    } else if (d.name.includes("TV") || d.name.includes("cable") || d.name.includes("dish")) {
      schedule = "Cut power at the board after use";
      action = "Switchboard cut-off";
      priority = "medium";
    } else if (d.name.includes("charger")) {
      schedule = "Unplug after device is full";
      action = "Smart plug with auto-cutoff";
      priority = "low";
    }

    schedules.push({
      device: d.name,
      urdu: d.urdu,
      action,
      savingsPkr: Math.round(cost * 0.7),
      schedule,
      priority,
    });
  }

  return schedules.sort((a, b) => b.savingsPkr - a.savingsPkr);
}
