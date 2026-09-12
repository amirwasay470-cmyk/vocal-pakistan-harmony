import { useMemo, useState } from "react";
import { Sliders, Wallet, TrendingDown, RotateCcw, Zap, Clock } from "lucide-react";
import { discos, slabBreakdownFor, pkr } from "@/lib/awaaz-data";
import { SectionHead, Stat } from "@/components/awaaz/BillAudit";

type BudgetAppliance = {
  id: string;
  name: string;
  watts: number;
  hours: number;
  qty: number;
  icon: string;
  maxHours: number;
};

const DEFAULT_BUDGET_APPLIANCES: BudgetAppliance[] = [
  { id: "ac", name: "Inverter AC (1 ton)", watts: 1200, hours: 8, qty: 1, icon: "AC", maxHours: 24 },
  { id: "fridge", name: "Refrigerator", watts: 150, hours: 24, qty: 1, icon: "FR", maxHours: 24 },
  { id: "iron", name: "Iron", watts: 1000, hours: 0.5, qty: 1, icon: "IR", maxHours: 24 },
  { id: "pump", name: "Water Pump", watts: 750, hours: 1, qty: 1, icon: "WP", maxHours: 24 },
  { id: "fan", name: "Ceiling Fans", watts: 80, hours: 14, qty: 4, icon: "FN", maxHours: 24 },
  { id: "lights", name: "Lights (LED)", watts: 15, hours: 6, qty: 10, icon: "LT", maxHours: 24 },
  { id: "tv", name: "LED TV", watts: 90, hours: 5, qty: 1, icon: "TV", maxHours: 24 },
  { id: "washing", name: "Washing Machine", watts: 500, hours: 1, qty: 1, icon: "WM", maxHours: 24 },
  { id: "geyser", name: "Electric Geyser", watts: 1500, hours: 2, qty: 1, icon: "GY", maxHours: 24 },
];

export function ApplianceBudgeter() {
  const [discoId, setDiscoId] = useState("k-electric");
  const [appliances, setAppliances] = useState<BudgetAppliance[]>(DEFAULT_BUDGET_APPLIANCES);

  const disco = discos.find((d) => d.id === discoId) ?? discos[0]!;

  const calc = useMemo(() => {
    const slabRows = slabBreakdownFor(
      appliances.reduce((s, a) => s + (a.watts * a.hours * a.qty * 30) / 1000, 0),
      disco.slabs,
    );
    const energyCost = slabRows.reduce((s, r) => s + r.amount, 0);
    const total = energyCost * (1 + disco.taxRate) + disco.fixedCharges;
    const marginalRate = slabRows.at(-1)?.rate ?? disco.slabs[0]!.rate;
    const rate = marginalRate * 1.29;

    const rows = appliances.map((a) => {
      const dailyKwh = (a.watts * a.hours * a.qty) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const dailyCost = dailyKwh * rate;
      const monthlyCost = monthlyKwh * rate;
      return { ...a, dailyKwh, monthlyKwh, dailyCost, monthlyCost };
    });

    const totalDailyKwh = rows.reduce((s, r) => s + r.dailyKwh, 0);
    const totalDailyCost = rows.reduce((s, r) => s + r.dailyCost, 0);
    const totalMonthlyCost = rows.reduce((s, r) => s + r.monthlyCost, 0);

    return {
      rows,
      totalDailyKwh,
      totalDailyCost,
      totalMonthlyCost,
      totalBill: total,
      marginalRate,
      rate,
    };
  }, [appliances, disco]);

  const updateHours = (id: string, hours: number) => {
    setAppliances((list) => list.map((a) => (a.id === id ? { ...a, hours } : a)));
  };

  const reset = () => {
    setAppliances(DEFAULT_BUDGET_APPLIANCES);
  };

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Sliders className="h-5 w-5" />}
        title="Appliance Budgeter"
        subtitle="Drag the sliders to see how daily usage hours impact your power drain and monthly bill in real time."
      />

      {/* DISCO selector */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Distribution company (DISCO)</span>
          <select value={discoId} onChange={(e) => setDiscoId(e.target.value)} className="input-base">
            {discos.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
            ))}
          </select>
        </label>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Daily power drain" value={`${calc.totalDailyKwh.toFixed(1)} kWh`} />
        <Stat label="Daily cost" value={pkr(calc.totalDailyCost)} />
        <Stat label="Monthly cost" value={pkr(calc.totalMonthlyCost)} accent />
        <Stat label="Est. total bill" value={pkr(calc.totalBill)} />
      </div>

      {/* Sliders */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Adjust daily usage hours</h3>
          <button onClick={reset} className="btn-ghost text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        <div className="space-y-5">
          {calc.rows.map((r) => (
            <div key={r.id} className="rounded-xl border bg-surface/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                    {r.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.watts}W · {r.qty} {r.qty > 1 ? "units" : "unit"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="flex items-center gap-1 text-sm font-bold text-amber-400">
                    <Clock className="h-3.5 w-3.5" /> {r.hours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-muted-foreground">{pkr(r.monthlyCost)}/mo</p>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={r.maxHours}
                step={0.5}
                value={r.hours}
                onChange={(e) => updateHours(r.id, Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0h</span>
                <span className="font-semibold text-foreground">
                  {r.dailyKwh.toFixed(2)} kWh/day
                </span>
                <span>{r.maxHours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact summary */}
      <div className="neon-card p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Financial impact summary</h3>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Daily power drain</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{calc.totalDailyKwh.toFixed(1)} kWh</p>
            <p className="mt-1 text-xs text-muted-foreground">at {pkr(calc.rate)}/unit effective rate</p>
          </div>
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Monthly financial impact</p>
            <p className="mt-1 text-2xl font-bold text-primary">{pkr(calc.totalMonthlyCost)}</p>
            <p className="mt-1 text-xs text-muted-foreground">from appliances alone (excl. taxes & FPA)</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Reducing AC from 8h to 6h and geyser from 2h to 1h can save approximately{" "}
            <strong className="text-primary">{pkr(calc.marginalRate * 1.29 * 30 * (2 * 1.2 + 1 * 1.5))}</strong> per month.
          </p>
        </div>
      </div>
    </div>
  );
}
