import { useState } from "react";
import { Zap, Calculator, Lightbulb, TrendingDown, TriangleAlert as AlertTriangle, Plug, RotateCcw, SolarPanel, BatteryCharging, CircleCheck as CheckCircle2 } from "lucide-react";
import {
  calculateSolar,
  defaultAppliances,
  discos,
  slabBreakdownFor,
  pkr,
  type Appliance,
  type SolarType,
} from "@/lib/awaaz-data";

type Result = {
  billedUnits: number;
  estimatedUnits: number;
  slabRows: ReturnType<typeof slabBreakdownFor>;
  energyCost: number;
  taxes: number;
  fixed: number;
  total: number;
  perAppliance: { name: string; units: number; cost: number; share: number; tip: string }[];
  savings: number;
  gap: number;
  solar: ReturnType<typeof calculateSolar>;
};

export function BillAudit() {
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [discoId, setDiscoId] = useState("k-electric");
  const [billedUnits, setBilledUnits] = useState(412);
  const [billAmount, setBillAmount] = useState(18500);
  const [solarType, setSolarType] = useState<SolarType>("none");
  const [systemKw, setSystemKw] = useState(5);
  const [batteryKwh, setBatteryKwh] = useState(10);
  const [result, setResult] = useState<Result | null>(null);
  const disco = discos.find((item) => item.id === discoId) ?? discos[0]!;

  const update = (id: string, field: "watts" | "hours" | "qty", value: number) =>
    setAppliances((list) =>
      list.map((a) => (a.id === id ? { ...a, [field]: Number.isFinite(value) ? value : 0 } : a)),
    );

  const reset = () => {
    setAppliances(defaultAppliances);
    setDiscoId("k-electric");
    setBilledUnits(412);
    setBillAmount(18500);
    setSolarType("none");
    setSystemKw(5);
    setBatteryKwh(10);
    setResult(null);
  };

  const audit = () => {
    const per = appliances.map((a) => {
      const units = (a.watts * a.hours * a.qty * 30) / 1000;
      return { name: a.name, units, tip: a.tip };
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
      .map((p) => ({
        name: p.name,
        units: p.units,
        cost: p.units * marginalRate * 1.29,
        share: estimatedUnits ? (p.units / estimatedUnits) * 100 : 0,
        tip: p.tip,
      }))
      .sort((a, b) => b.units - a.units);

    const top3 = perAppliance.slice(0, 3).reduce((s, p) => s + p.cost, 0);
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
      solar: calculateSolar(solarType, units, systemKw, batteryKwh, disco),
    });
  };

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Zap className="h-5 w-5" />}
        title="Utility Bill Audit & Energy Calculator"
        subtitle="Audit your DISCO tariff, find energy hogs, and model solar savings."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">Your latest bill</h3>
            <span className="status-badge"><CheckCircle2 className="h-3 w-3" /> Tariff-aware</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Distribution company">
              <select value={discoId} onChange={(e) => setDiscoId(e.target.value)} className="input-base">
                {discos.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.city})</option>)}
              </select>
            </Field>
            <Field label="Units billed (kWh)">
              <input
                type="number"
                value={billedUnits}
                onChange={(e) => setBilledUnits(Number(e.target.value))}
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
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="flex items-center gap-2"><SolarPanel className="h-4 w-4 text-emerald-300" /><h3 className="text-base font-semibold">Solar system status</h3></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["none", "on-grid", "off-grid", "hybrid"] as SolarType[]).map((type) => (
                <button key={type} type="button" onClick={() => setSolarType(type)} className={`rounded-xl border px-3 py-2 text-left text-sm capitalize transition ${solarType === type ? "border-emerald-300 bg-emerald-400/15 text-emerald-200" : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"}`}>{type === "none" ? "None" : type.replace("-", " ")}</button>
              ))}
            </div>
            {solarType !== "none" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label={`Solar capacity: ${systemKw} kW`}><input type="range" min="1" max="20" value={systemKw} onChange={(e) => setSystemKw(Number(e.target.value))} className="w-full accent-emerald-400" /></Field><Field label={`Battery storage: ${batteryKwh} kWh`}><input type="range" min="0" max="40" value={batteryKwh} onChange={(e) => setBatteryKwh(Number(e.target.value))} className="w-full accent-emerald-400" /></Field></div>}
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

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={audit} className="btn-primary">
              <Calculator className="h-4 w-4" /> Audit my bill
            </button>
            <button onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {!result ? (
            <EmptyState
              icon={<Zap className="h-6 w-6" />}
              title="No audit yet"
              text="Tap “Audit my bill” to see your slab-wise breakdown, the appliances eating your units, and how much you can save."
            />
          ) : (
            <div className="tab-enter space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Units billed" value={`${result.billedUnits}`} />
                <Stat label="Estimated use" value={`${Math.round(result.estimatedUnits)}`} />
                <Stat label="Bill estimate" value={pkr(result.total)} />
                <Stat label="Possible saving" value={pkr(result.savings)} accent />
              </div>

              {solarType !== "none" && <SolarSummary result={result.solar} type={solarType} />}

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

              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-semibold">Slab-wise breakdown</h4>
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
              </div>

              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h4 className="mb-4 text-sm font-semibold">Where your units go</h4>
                <div className="space-y-3">
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
                          className={`h-full rounded-full transition-all duration-700 ${p.share > 20 ? "bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-300" : "bg-gradient-to-r from-emerald-700 to-emerald-300"}`}
                          style={{ width: `${Math.min(100, p.share)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-saffron" /> Appliance coach — top actions
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

function SolarSummary({ result, type }: { result: Result["solar"]; type: SolarType }) {
  const title = type === "hybrid" ? "Estimated Bill After Solar" : type === "off-grid" ? "Off-grid independence" : "Net-metering savings";
  return (
    <div className="solar-card rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">{title}</p><p className="mt-1 text-3xl font-bold text-emerald-200">{pkr(result.billAfterSolar)}</p><p className="text-sm text-emerald-100/70">{pkr(result.monthlySavings)} estimated monthly reduction</p></div>
        {type === "off-grid" ? <BatteryCharging className="h-7 w-7 text-emerald-300" /> : <SolarPanel className="h-7 w-7 text-emerald-300" />}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Generation" value={`${Math.round(result.generation)} kWh`} accent /><Stat label="Solar offset" value={`${Math.round(result.selfConsumed)} kWh`} /><Stat label="Grid export" value={`${Math.round(result.exported)} kWh`} /><Stat label="Backup" value={`${result.backupHours.toFixed(1)} hrs`} /></div>
      <p className="mt-4 rounded-xl bg-slate-950/30 p-3 text-sm text-emerald-100">{result.summary}</p>
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
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${accent ? "border-primary/40 bg-primary/10" : "bg-card"}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold">{value}</p>
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
    <div className="grid place-items-center rounded-2xl border border-dashed bg-card/60 p-10 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
