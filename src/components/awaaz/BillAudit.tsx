import { useEffect, useRef, useState } from "react";
import {
  Zap,
  Calculator,
  Lightbulb,
  TrendingDown,
  TriangleAlert as AlertTriangle,
  Plug,
  RotateCcw,
  SolarPanel,
  BatteryCharging,
  CircleCheck as CheckCircle2,
  ShieldCheck,
  Ghost,
  Wallet,
  Users,
  Sparkles,
} from "lucide-react";
import {
  calculateSolar,
  defaultAppliances,
  discos,
  slabBreakdownFor,
  pkr,
  type Appliance,
  type SolarType,
} from "@/lib/awaaz-data";
import {
  applyPreset,
  budgetGuard,
  calculateVampire,
  defaultStandbyDevices,
  householdPresets,
  lifelineStatus,
  presetUnits,
  type BudgetVerdict,
  type PresetId,
  type SlabStatus,
  type StandbyDevice,
  type VampireResult,
} from "@/lib/awaaz-household";
import { BillScanner } from "@/components/awaaz/BillScanner";
import type { BillScan } from "@/lib/bill-scan.functions";
import type { AdvisorContext } from "@/lib/advisor-engine";
import { useLiveRates } from "@/lib/live-sync";
import { usePersistentState } from "@/lib/use-persistent-state";
import { ShareReportButton } from "@/components/awaaz/ShareReportButton";

type Result = {
  billedUnits: number;
  estimatedUnits: number;
  slabRows: ReturnType<typeof slabBreakdownFor>;
  energyCost: number;
  taxes: number;
  fixed: number;
  total: number;
  perAppliance: {
    name: string;
    units: number;
    cost: number;
    share: number;
    tip: string;
    optimizedUnits: number;
    optimizedCost: number;
    optimizedShare: number;
    reductionPct: number;
  }[];
  savings: number;
  gap: number;
  solar: ReturnType<typeof calculateSolar>;
  lifeline: SlabStatus;
  vampire: VampireResult;
  budget: BudgetVerdict;
};

/** Realistic unit reduction per appliance if the household follows the Awaaz-e-Pakistan tips. */
const reductionByAppliance: Record<string, number> = {
  ac: 0.28,
  fridge: 0.12,
  fan: 0.35,
  geyser: 0.4,
  iron: 0.25,
  lights: 0.5,
  washing: 0.2,
  tv: 0.3,
};

const reductionFor = (id: string) => reductionByAppliance[id] ?? 0.15;

export function BillAudit({
  onContextChange,
}: {
  onContextChange?: (ctx: AdvisorContext) => void;
}) {
  const { power: electricityRates } = useLiveRates();
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [preset, setPreset] = useState<PresetId | null>(null);
  const [discoId, setDiscoId] = usePersistentState<string>("awaaz_disco_id", "k-electric");
  const [billedUnits, setBilledUnits] = usePersistentState<number>("awaaz_billed_units", 412);
  const [billAmount, setBillAmount] = usePersistentState<number>("awaaz_bill_amount", 18500);
  const [budget, setBudget] = usePersistentState<number>("awaaz_budget", 20000);
  const [solarType, setSolarType] = usePersistentState<SolarType>("awaaz_solar_type", "none");
  const [systemKw, setSystemKw] = usePersistentState<number>("awaaz_system_kw", 5);
  const [batteryKwh, setBatteryKwh] = usePersistentState<number>("awaaz_battery_kwh", 10);
  const [billViewPeriod, setBillViewPeriod] = usePersistentState<"monthly" | "daily">(
    "awaaz_bill_view_period",
    "monthly",
  );
  const [standby, setStandby] = useState<StandbyDevice[]>(defaultStandbyDevices);
  const [result, setResult] = useState<Result | null>(null);
  const [scannedTaxes, setScannedTaxes] = useState<number | null>(null);
  const [scannedSlab, setScannedSlab] = useState<string | null>(null);
  const [pendingAudit, setPendingAudit] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const disco = discos.find((item) => item.id === discoId) ?? discos[0]!;

  const applyScan = (scan: BillScan, scroll = false) => {
    if (scan.units !== null && scan.units > 0) {
      setBilledUnits(Math.round(scan.units));
      setPreset(null);
    }
    if (scan.billAmount !== null && scan.billAmount > 0) setBillAmount(Math.round(scan.billAmount));
    setScannedTaxes(scan.taxes !== null && scan.taxes > 0 ? scan.taxes : null);
    setScannedSlab(scan.slab);
    if (scan.disco) {
      const key = scan.disco.toLowerCase().replace(/[^a-z]/g, "");
      const match = discos.find((d) => key.includes(d.id.replace(/[^a-z]/g, "")));
      if (match) setDiscoId(match.id);
    }
    // Run the full slab-wise audit as soon as the new values are committed.
    setPendingAudit(true);
    if (scroll) {
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        120,
      );
    }
  };

  const update = (id: string, field: "watts" | "hours" | "qty", value: number) => {
    setPreset(null);
    setAppliances((list) =>
      list.map((a) => (a.id === id ? { ...a, [field]: Number.isFinite(value) ? value : 0 } : a)),
    );
  };

  const handleApplyPreset = (id: PresetId) => {
    const p = householdPresets.find((h) => h.id === id)!;
    const list = applyPreset(p);
    setAppliances(list);
    setPreset(id);
    setBilledUnits(Math.round(presetUnits(p)));
    setResult(null);
  };

  const toggleStandby = (id: string) =>
    setStandby((list) =>
      list.map((d) =>
        d.id === id
          ? {
              ...d,
              qty: d.qty > 0 ? 0 : (defaultStandbyDevices.find((x) => x.id === id)?.qty ?? 1),
            }
          : d,
      ),
    );

  const reset = () => {
    setAppliances(defaultAppliances);
    setPreset(null);
    setDiscoId("k-electric");
    setBilledUnits(412);
    setBillAmount(18500);
    setBudget(20000);
    setSolarType("none");
    setSystemKw(5);
    setBatteryKwh(10);
    setStandby(defaultStandbyDevices);
    setScannedTaxes(null);
    setScannedSlab(null);
    setResult(null);
  };

  const audit = () => {
    const per = appliances.map((a) => {
      const units = (a.watts * a.hours * a.qty * 30) / 1000;
      return { name: a.name, units, tip: a.tip, reduction: reductionFor(a.id) };
    });
    const estimatedUnits = per.reduce((s, p) => s + p.units, 0);
    const units = Math.max(billedUnits, 0);
    const slabRows = slabBreakdownFor(units, disco.slabs);
    const energyCost = slabRows.reduce((s, r) => s + r.amount, 0);
    const taxes = energyCost * disco.taxRate;
    const fixed = disco.fixedCharges;
    const total = energyCost + taxes + fixed;
    const marginalRate = slabRows.at(-1)?.rate ?? disco.slabs[0]!.rate;

    const perAppliance = per
      .map((p) => {
        const optimizedUnits = p.units * (1 - p.reduction);
        return {
          name: p.name,
          units: p.units,
          cost: p.units * marginalRate * 1.29,
          share: estimatedUnits ? (p.units / estimatedUnits) * 100 : 0,
          tip: p.tip,
          optimizedUnits,
          optimizedCost: optimizedUnits * marginalRate * 1.29,
          optimizedShare: estimatedUnits ? (optimizedUnits / estimatedUnits) * 100 : 0,
          reductionPct: p.reduction * 100,
        };
      })
      .sort((a, b) => b.units - a.units);

    const top3 = perAppliance.slice(0, 3).reduce((s, p) => s + p.cost, 0);
    const solar = calculateSolar(solarType, units, systemKw, batteryKwh, disco);
    const projected = solarType === "none" ? total : solar.billAfterSolar;

    setResult({
      billedUnits: units,
      estimatedUnits,
      slabRows,
      energyCost,
      taxes,
      fixed,
      total,
      perAppliance,
      savings: top3 * 0.22,
      gap: estimatedUnits - units,
      solar,
      lifeline: lifelineStatus(units),
      vampire: calculateVampire(
        standby.filter((d) => d.qty > 0),
        marginalRate * (1 + disco.taxRate),
      ),
      budget: budgetGuard(projected, budget),
    });
  };

  // Runs after the scanned values are committed to state.
  useEffect(() => {
    if (!pendingAudit) return;
    setPendingAudit(false);
    audit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAudit]);

  // Report live context to the Energy Advisor
  useEffect(() => {
    if (!onContextChange) return;
    const lifeline = lifelineStatus(billedUnits);
    const activeStandby = standby.filter((d) => d.qty > 0);
    const marginalRate =
      slabBreakdownFor(billedUnits, disco.slabs).at(-1)?.rate ?? disco.slabs[0]!.rate;
    const vampire = calculateVampire(activeStandby, marginalRate * (1 + disco.taxRate));
    const estimatedUnits = appliances.reduce(
      (s, a) => s + (a.watts * a.hours * a.qty * 30) / 1000,
      0,
    );
    const slabRows = slabBreakdownFor(billedUnits, disco.slabs);
    const energyCost = slabRows.reduce((s, r) => s + r.amount, 0);
    const total = energyCost * (1 + disco.taxRate) + disco.fixedCharges;
    const perAppliance = appliances
      .map((a) => {
        const units = (a.watts * a.hours * a.qty * 30) / 1000;
        return {
          name: a.name,
          units,
          cost: units * marginalRate * 1.29,
          share: estimatedUnits ? (units / estimatedUnits) * 100 : 0,
          tip: a.tip,
        };
      })
      .sort((a, b) => b.units - a.units);
    const top3 = perAppliance.slice(0, 3).reduce((s, p) => s + p.cost, 0);
    const projected = result ? (solarType === "none" ? total : result.solar.billAfterSolar) : total;
    onContextChange({
      appliances,
      disco,
      billedUnits,
      billAmount,
      budget,
      standby,
      budgetVerdict: result?.budget ?? budgetGuard(projected, budget),
      hasResult: result !== null,
      estimatedUnits,
      totalBill: result ? result.total : total,
      savings: result?.savings ?? top3 * 0.22,
      perAppliance,
      lifelineTier: lifeline.tier,
      unprotected: lifeline.tier === "unprotected",
      unitsToNextTier: lifeline.unitsToNextTier,
      vampireMonthlyCost: result?.vampire.monthlyCost ?? vampire.monthlyCost,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliances, discoId, billedUnits, billAmount, budget, standby, result]);

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Zap className="h-5 w-5" />}
        title="Utility Bill Audit & Energy Calculator"
        subtitle="Audit your DISCO tariff, find energy hogs, guard your budget and model solar savings."
      />

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-primary" /> One-tap household presets
          </h3>
          <span className="status-badge">
            <Sparkles className="h-3 w-3" /> New here? Start with a preset
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {householdPresets.map((p) => {
            const active = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                aria-pressed={active}
                className={`preset-chip ${active ? "preset-chip-active" : ""}`}
              >
                <span className="text-sm font-bold">
                  {p.label}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{p.urdu}</span>
                </span>
                <span className="text-xs text-muted-foreground">{p.people}</span>
                <span className="mt-1 text-xs font-semibold text-primary">
                  ≈ {Math.round(presetUnits(p))} units / month
                </span>
              </button>
            );
          })}
        </div>
        {preset && (
          <p className="tab-enter mt-3 rounded-xl bg-primary/10 p-3 text-xs">
            {householdPresets.find((p) => p.id === preset)!.note} You can still fine-tune every
            appliance below.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="dashboard-card p-5.5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">Your latest bill</h3>
            <span className="status-badge">
              <CheckCircle2 className="h-3 w-3" /> Tariff-aware
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Distribution company (DISCO)">
              <select
                value={discoId}
                onChange={(e) => setDiscoId(e.target.value)}
                className="input-base"
              >
                {discos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.city})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Units billed (kWh)">
              <input
                type="number"
                value={billedUnits}
                onChange={(e) => {
                  setBilledUnits(Number(e.target.value));
                  setPreset(null);
                }}
                className="input-base"
              />
            </Field>
            <Field label="Bill amount (PKR)">
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="input-base"
              />
            </Field>
            <Field label="Monthly budget limit (PKR)">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="input-base"
              />
            </Field>
          </div>

          <BillScanner
            onExtract={(scan) => applyScan(scan)}
            onApply={(scan) => applyScan(scan, true)}
          />

          {scannedTaxes !== null && (
            <p className="mt-3 rounded-xl bg-warning/10 p-3 text-xs">
              Taxes printed on your bill: {pkr(scannedTaxes)}
              {scannedSlab ? ` · Tariff slab on bill: ${scannedSlab}` : ""}
            </p>
          )}

          <LifelineIndicator units={billedUnits} />

          <div className="mt-6 neon-card p-4">
            <div className="flex items-center gap-2">
              <SolarPanel className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Solar tier</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["none", "on-grid", "off-grid", "hybrid"] as SolarType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSolarType(type)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm capitalize transition ${
                    solarType === type
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {type === "none" ? "No solar" : type.replace("-", " ")}
                </button>
              ))}
            </div>
            {solarType !== "none" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={`Solar capacity: ${systemKw} kW`}>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={systemKw}
                    onChange={(e) => setSystemKw(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </Field>
                <Field label={`Battery storage: ${batteryKwh} kWh`}>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={batteryKwh}
                    onChange={(e) => setBatteryKwh(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </Field>
              </div>
            )}
          </div>

          <h3 className="mt-6 mb-3 text-base font-semibold">Appliances at home</h3>
          <div className="space-y-3">
            {appliances.map((a) => (
              <div key={a.id} className="rounded-xl border bg-surface/60 p-3">
                <div className="mb-2 flex min-w-0 items-center gap-2">
                  <Plug className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium">{a.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniField label="Watts">
                    <input
                      type="number"
                      value={a.watts}
                      onChange={(e) => update(a.id, "watts", Number(e.target.value))}
                      className="input-base"
                    />
                  </MiniField>
                  <MiniField label="Hrs/day">
                    <input
                      type="number"
                      step="0.5"
                      value={a.hours}
                      onChange={(e) => update(a.id, "hours", Number(e.target.value))}
                      className="input-base"
                    />
                  </MiniField>
                  <MiniField label="Qty">
                    <input
                      type="number"
                      value={a.qty}
                      onChange={(e) => update(a.id, "qty", Number(e.target.value))}
                      className="input-base"
                    />
                  </MiniField>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 mb-1 flex items-center gap-2 text-base font-semibold">
            <Ghost className="h-4 w-4 text-warning" /> Standby “vampire” devices
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Tap the things that stay plugged in 24 hours a day.
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultStandbyDevices.map((d) => {
              const on = (standby.find((s) => s.id === d.id)?.qty ?? 0) > 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleStandby(d.id)}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                    on
                      ? "border-warning bg-warning/15 text-warning"
                      : "bg-surface text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {d.name} · {d.watts}W
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={audit} className="btn-primary">
              <Calculator className="h-4 w-4" /> Audit my bill
            </button>
            <button onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-20 space-y-4">
          {!result ? (
            <EmptyState
              icon={<Zap className="h-6 w-6" />}
              title="No audit yet"
              text="Pick a household preset or fill your details, then tap “Audit my bill” to see your slab-wise breakdown, budget guard and hidden standby drain."
            />
          ) : (
            <div className="tab-enter space-y-4">
              {/* Unit & Period Toggle Shortcut */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card/60 px-4 py-2.5">
                <span className="text-xs font-bold text-foreground">
                  ⚡ Bill Calculation View (بل دیکھنے کا طریقہ):
                </span>
                <div className="flex rounded-lg border border-border bg-secondary/60 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBillViewPeriod("monthly")}
                    className={`rounded-md px-3 py-1 transition ${
                      billViewPeriod === "monthly"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly (ماہانہ بل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillViewPeriod("daily")}
                    className={`rounded-md px-3 py-1 transition ${
                      billViewPeriod === "daily"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Daily Burn (روزانہ خرچ)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Units billed" value={`${result.billedUnits}`} />
                <Stat label="Estimated use" value={`${Math.round(result.estimatedUnits)}`} />
                <Stat
                  label={billViewPeriod === "daily" ? "Daily burn" : "Bill estimate"}
                  value={
                    billViewPeriod === "daily" ? `${pkr(result.total / 30)}/day` : pkr(result.total)
                  }
                />
                <Stat label="Possible saving" value={pkr(result.savings)} accent />
              </div>

              <BudgetGuardCard verdict={result.budget} budget={budget} />

              {solarType !== "none" && <SolarSummary result={result.solar} type={solarType} />}

              <VampireCard result={result.vampire} />

              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                  Math.abs(result.gap) > result.billedUnits * 0.15
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-primary/30 bg-primary/10"
                }`}
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  {Math.abs(result.gap) > result.billedUnits * 0.15
                    ? `Your appliances explain about ${Math.round(result.estimatedUnits)} units, but you were billed ${result.billedUnits}. A gap of ${Math.abs(Math.round(result.gap))} units is large — check the meter reading dates, a possible faulty meter, or shared/neighbouring load.`
                    : `Your usage pattern matches the billed units closely (${Math.abs(Math.round(result.gap))} units difference). The bill looks genuine — savings must come from usage habits.`}
                </p>
              </div>

              <div className="dashboard-card p-5.5">
                <h4 className="mb-3 text-sm font-semibold">
                  Slab-wise breakdown — {disco.name}, {disco.city}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Slab</th>
                        <th className="py-2 text-right font-medium">Units</th>
                        <th className="py-2 text-right font-medium">Rate</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.slabRows.map((r) => (
                        <tr key={r.label} className="border-b last:border-0">
                          <td className="py-2">{r.label}</td>
                          <td className="py-2 text-right">{Math.round(r.units)}</td>
                          <td className="py-2 text-right">{r.rate.toFixed(2)}</td>
                          <td className="py-2 text-right font-medium">{pkr(r.amount)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2 text-muted-foreground" colSpan={3}>
                          Taxes, FPA & surcharges ({Math.round(disco.taxRate * 100)}%)
                        </td>
                        <td className="py-2 text-right">{pkr(result.taxes)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-muted-foreground" colSpan={3}>
                          Fixed & meter charges
                        </td>
                        <td className="py-2 text-right">{pkr(result.fixed)}</td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-2 font-semibold" colSpan={3}>
                          Estimated total
                        </td>
                        <td className="py-2 text-right font-semibold text-primary">
                          {pkr(result.total)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 text-muted-foreground" colSpan={3}>
                          You entered
                        </td>
                        <td className="py-1 text-right">{pkr(billAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Instant WhatsApp & Copy Share Button */}
                <div className="mt-4 border-t border-border/80 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      📲 Share Bill Breakdown (فیملی کے ساتھ شیئر کریں):
                    </span>
                  </div>
                  <ShareReportButton
                    title={`Electricity Bill Audit — ${disco.name}`}
                    urduTitle="بجلی کا بل و سلیب رپورٹ"
                    category="bill"
                    totalCostLabel={
                      billViewPeriod === "daily" ? "Daily Power Cost" : "Estimated Total Bill"
                    }
                    totalCostValue={
                      billViewPeriod === "daily"
                        ? `${pkr(result.total / 30)} / day`
                        : pkr(result.total)
                    }
                    dailyBurnValue={`${pkr(result.total / 30)} / day`}
                    savingsValue={`${pkr(result.savings)} / month`}
                    breakdown={[
                      { label: "DISCO", value: disco.name },
                      { label: "Billed Units", value: `${result.billedUnits} units` },
                      {
                        label: "Active Slab",
                        value: result.slabRows.at(-1)?.label ?? "Protected",
                      },
                      { label: "Energy Charge", value: pkr(result.energyCost) },
                      { label: "Taxes & FPA Surcharges", value: pkr(result.taxes) },
                      { label: "Fixed & Meter Rent", value: pkr(result.fixed) },
                    ]}
                    advice={`Following top appliance savings tips cuts roughly ${pkr(result.savings)} from your next bill.`}
                  />
                </div>
              </div>

              <div className="dashboard-card p-5.5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">Where your units go</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-4 rounded-full bg-gradient-to-r from-destructive via-warning to-primary" />
                      Now
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-4 rounded-full bg-primary/60" />
                      After Awaaz tips
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {result.perAppliance.map((p) => (
                    <div key={p.name}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2 truncate">
                          {p.share > 20 && <span className="consumption-badge">High</span>}
                          {p.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {Math.round(p.units)} units · {pkr(p.cost)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${p.share > 20 ? "bg-gradient-to-r from-destructive via-warning to-primary" : "bg-gradient-to-r from-primary/40 to-primary"}`}
                          style={{ width: `${Math.min(100, p.share)}%` }}
                        />
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary/60">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-700"
                          style={{ width: `${Math.min(100, p.optimizedShare)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="trend-down">−{Math.round(p.reductionPct)}%</span>
                        <span>
                          {Math.round(p.optimizedUnits)} units · {pkr(p.optimizedCost)} after
                          following the tips (saves {pkr(p.cost - p.optimizedCost)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm">
                  Follow every appliance tip and your monthly usage drops to about{" "}
                  <strong>
                    {Math.round(result.perAppliance.reduce((s, p) => s + p.optimizedUnits, 0))}{" "}
                    units
                  </strong>{" "}
                  — roughly{" "}
                  <strong>
                    {pkr(result.perAppliance.reduce((s, p) => s + (p.cost - p.optimizedCost), 0))}
                  </strong>{" "}
                  saved a month.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-warning" /> Appliance coach — top actions
                </h4>
                <ul className="space-y-3">
                  {result.perAppliance.slice(0, 4).map((p) => (
                    <li key={p.name} className="flex gap-3 text-sm">
                      <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        <strong>{p.name}:</strong> {p.tip}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm">
                  Acting on the top three alone can cut roughly{" "}
                  <strong>{pkr(result.savings)}</strong> from next month's bill.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LifelineIndicator({ units }: { units: number }) {
  const status = lifelineStatus(units);
  const tone =
    status.tone === "good"
      ? "border border-emerald-500/40 bg-emerald-950/30"
      : status.tone === "warn"
        ? "border border-amber-500/40 bg-amber-950/30"
        : "border border-rose-500/40 bg-rose-950/30";

  const badgeCls =
    status.tone === "good"
      ? "badge-safe"
      : status.tone === "warn"
        ? "badge-warning"
        : "badge-critical";

  return (
    <div className={`mt-5 rounded-2xl p-4.5 backdrop-blur-md ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 w-full">
          <ShieldCheck
            className={`mt-0.5 h-6 w-6 shrink-0 ${
              status.tone === "good"
                ? "text-emerald-400"
                : status.tone === "warn"
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-base font-bold text-white tracking-tight">{status.title}</p>
              <span className={badgeCls}>
                {status.tone === "good"
                  ? "Protected (200U Lifeline Safe)"
                  : status.tone === "warn"
                    ? "Khatray Ki Ghanti (Near 200U)"
                    : "Surcharge Active (Non-Protected)"}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{status.message}</p>
            {status.unitsToNextTier !== null && (
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2.5 flex-1 max-w-sm overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      status.tone === "good" ? "progress-fill-emerald" : "progress-fill-amber"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, ((200 - status.unitsToNextTier) / 200) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {Math.max(0, Math.round(status.unitsToNextTier))} Units Bachay Hain
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetGuardCard({ verdict, budget }: { verdict: BudgetVerdict; budget: number }) {
  const isOver = verdict.status === "over";
  const isClose = verdict.status === "close";

  const cls = isOver
    ? "border border-rose-500/40 bg-rose-950/25"
    : isClose
      ? "border border-amber-500/40 bg-amber-950/25"
      : "border border-emerald-500/40 bg-emerald-950/25";

  const barCls = isOver
    ? "progress-fill-danger"
    : isClose
      ? "progress-fill-amber"
      : "progress-fill-emerald";

  const badgeCls = isOver ? "badge-critical" : isClose ? "badge-warning" : "badge-safe";

  return (
    <div className={`rounded-2xl p-5 backdrop-blur-md ${cls}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <p className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
          <Wallet
            className={`h-5 w-5 ${isOver ? "text-rose-400" : isClose ? "text-amber-400" : "text-emerald-400"}`}
          />
          Ghar Ka Monthly Bijli Budget Guard
        </p>
        <span className={badgeCls}>{verdict.headline}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Andaza Kharcha (Projected Bill)
            </span>
            <p className="mt-0.5 text-3xl font-black tracking-tight text-white">
              {pkr(Math.round((budget * verdict.usedPct) / 100))}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                (Budget Had: {pkr(budget)})
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{Math.round(verdict.usedPct)}%</span>
            <span className="block text-xs text-muted-foreground">Budget Istemal</span>
          </div>
        </div>

        <div className="progress-track">
          <div className={barCls} style={{ width: `${Math.min(100, verdict.usedPct)}%` }} />
        </div>

        <p className="text-sm leading-relaxed text-slate-300 pt-1">
          {verdict.difference > 0 ? (
            <span className="font-bold text-rose-400">
              Khabardaar: Aapka bill budget se {pkr(verdict.difference)} barh gaya hai!{" "}
            </span>
          ) : (
            <span className="font-bold text-emerald-400">
              Shabash: Aapke paas abhi {pkr(Math.abs(verdict.difference))} ki bachat ka margin
              mojood hai.{" "}
            </span>
          )}
          {verdict.advice}
        </p>
      </div>
    </div>
  );
}

function VampireCard({ result }: { result: VampireResult }) {
  if (result.rows.length === 0) return null;
  return (
    <div className="warn-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Ghost className="h-4 w-4 text-warning" /> Standby vampire power
        </p>
        <span className="warn-badge">{Math.round(result.watts)} W always on</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-warning">{pkr(result.monthlyCost)}</p>
      <p className="text-sm text-muted-foreground">
        {Math.round(result.monthlyUnits)} units a month wasted while nothing is being used — about{" "}
        {pkr(result.yearlyCost)} a year.
      </p>
      <ul className="mt-4 space-y-2">
        {result.rows.slice(0, 4).map((r) => (
          <li
            key={r.name}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl bg-surface/60 p-3 text-sm"
          >
            <span className="min-w-0">
              <span className="font-medium">{r.name}</span>
              <span className="block text-xs text-muted-foreground">{r.tip}</span>
            </span>
            <span className="shrink-0 font-semibold">{pkr(r.cost)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolarSummary({ result, type }: { result: Result["solar"]; type: SolarType }) {
  const title =
    type === "hybrid"
      ? "Estimated bill after hybrid solar"
      : type === "off-grid"
        ? "Off-grid independence"
        : "Net-metering savings";
  return (
    <div className="neon-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{pkr(result.billAfterSolar)}</p>
          <p className="text-sm text-muted-foreground">
            {pkr(result.monthlySavings)} estimated monthly reduction
          </p>
        </div>
        {type === "off-grid" ? (
          <BatteryCharging className="h-7 w-7 text-primary" />
        ) : (
          <SolarPanel className="h-7 w-7 text-primary" />
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Generation" value={`${Math.round(result.generation)} kWh`} accent />
        <Stat label="Solar offset" value={`${Math.round(result.selfConsumed)} kWh`} />
        <Stat label="Grid export" value={`${Math.round(result.exported)} kWh`} />
        <Stat label="Backup" value={`${result.backupHours.toFixed(1)} hrs`} />
      </div>
      <p className="mt-4 rounded-xl bg-background/40 p-3 text-sm">{result.summary}</p>
    </div>
  );
}

export function SectionHead({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.01] ${
        accent
          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-slate-900/85 to-slate-950/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_8px_30px_rgba(0,0,0,0.45)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]"
          : "border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.4)] hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p
        className={`mt-1.5 truncate font-mono text-xl font-black tracking-tight ${
          accent ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-md p-10 text-center shadow-inner">
      <span className="mb-3.5 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
        {icon}
      </span>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
