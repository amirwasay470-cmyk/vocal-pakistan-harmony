import { useMemo, useState } from "react";
import {
  Ghost,
  Activity,
  Plug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { defaultStandbyDevices, calculateVampire, type StandbyDevice } from "@/lib/awaaz-household";
import {
  analyzeMeterHealth,
  smartPlugSchedules,
  type MeterHealth,
  type SmartPlugSchedule,
} from "@/lib/awaaz-solar";
import { pkr, slabBreakdownFor } from "@/lib/awaaz-data";
import { SectionHead, Stat, EmptyState } from "@/components/awaaz/BillAudit";

type Props = {
  billedUnits: number;
  estimatedUnits: number;
  discoId: string;
  appliances: { name: string; watts: number; hours: number; qty: number; tip: string }[];
};

export function VampireDetector({ billedUnits, estimatedUnits, discoId, appliances }: Props) {
  const [devices, setDevices] = useState<StandbyDevice[]>(defaultStandbyDevices);
  const [analyzed, setAnalyzed] = useState<{
    vampire: ReturnType<typeof calculateVampire>;
    meter: MeterHealth;
    schedules: SmartPlugSchedule[];
  } | null>(null);

  const disco = useMemo(() => {
    // We need the disco object for rates — import from data
    return null;
  }, []);

  const toggleDevice = (id: string) => {
    setDevices((list) =>
      list.map((d) =>
        d.id === id
          ? {
              ...d,
              qty: d.qty > 0 ? 0 : (defaultStandbyDevices.find((x) => x.id === id)?.qty ?? 1),
            }
          : d,
      ),
    );
  };

  const analyze = () => {
    const activeDevices = devices.filter((d) => d.qty > 0);
    // Get marginal rate from slab breakdown
    const slabRows = slabBreakdownFor(billedUnits, getDiscoSlabs(discoId));
    const marginalRate = slabRows.at(-1)?.rate ?? 13.5;
    const taxRate = getDiscoTax(discoId);
    const effectiveRate = marginalRate * (1 + taxRate);

    const vampire = calculateVampire(activeDevices, effectiveRate);
    const meter = analyzeMeterHealth(billedUnits, estimatedUnits, vampire.monthlyUnits);
    const schedules = smartPlugSchedules(
      vampire.monthlyCost,
      activeDevices.map((d) => ({
        name: d.name,
        urdu: d.urdu,
        watts: d.watts,
        qty: d.qty,
        tip: d.tip,
      })),
      effectiveRate,
    );

    setAnalyzed({ vampire, meter, schedules });
  };

  const totalWaste = analyzed?.vampire.monthlyCost ?? 0;
  const yearlyWaste = analyzed?.vampire.yearlyCost ?? 0;
  const potentialSavings = analyzed?.schedules.reduce((s, sch) => s + sch.savingsPkr, 0) ?? 0;

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Ghost className="h-5 w-5" />}
        title="Vampire Load & Meter Health Detector"
        subtitle="Find hidden standby power drains, detect meter anomalies, and get smart plug schedules to stop the waste."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Input panel */}
        <div className="glass-card p-5 sm:p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
              <Plug className="h-4 w-4 text-amber-400" /> Standby Devices
            </h3>
            <span className="badge-warning">{devices.filter((d) => d.qty > 0).length} active</span>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Tap the devices that stay plugged in 24/7 at your home — even when not in use.
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultStandbyDevices.map((d) => {
              const on = (devices.find((s) => s.id === d.id)?.qty ?? 0) > 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDevice(d.id)}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                    on
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/[0.16] hover:text-white"
                  }`}
                >
                  {d.name} · {d.watts}W
                </button>
              );
            })}
          </div>

          {/* Quick context */}
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3.5 text-xs text-muted-foreground">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Connected from Bill Audit
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/[0.04] bg-black/20 p-2">
                <span className="block text-[10px] text-muted-foreground">Billed</span>
                <span className="font-mono text-xs font-bold text-white">{billedUnits} kWh</span>
              </div>
              <div className="rounded-lg border border-white/[0.04] bg-black/20 p-2">
                <span className="block text-[10px] text-muted-foreground">Estimated</span>
                <span className="font-mono text-xs font-bold text-white">
                  {Math.round(estimatedUnits)} kWh
                </span>
              </div>
              <div className="rounded-lg border border-white/[0.04] bg-black/20 p-2">
                <span className="block text-[10px] text-muted-foreground">Tracked</span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {appliances.length} items
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button onClick={analyze} className="btn-primary w-full">
              <Activity className="h-4 w-4" /> Analyze vampire load & meter
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!analyzed ? (
            <EmptyState
              icon={<Ghost className="h-6 w-6" />}
              title="No analysis yet"
              text="Select your standby devices on the left, then tap Analyze to see how much money is wasted monthly, whether your meter has anomalies, and smart plug schedules to eliminate the drain."
            />
          ) : (
            <div className="tab-enter space-y-4">
              {/* Vampire waste headline */}
              <div className="dashboard-card p-5 sm:p-6 border-amber-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="badge-warning">Standby Energy Loss</span>
                    <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-amber-400">
                      {pkr(totalWaste)}
                    </p>
                    <p className="text-xs text-slate-300">
                      {Math.round(analyzed.vampire.monthlyUnits)} units burned monthly with no
                      active utility
                    </p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                    <Ghost className="h-7 w-7 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Standby load" value={`${Math.round(analyzed.vampire.watts)} W`} />
                  <Stat label="Monthly waste" value={pkr(totalWaste)} accent />
                  <Stat label="Yearly waste" value={pkr(yearlyWaste)} />
                </div>
              </div>

              {/* Meter health */}
              <div
                className={`rounded-2xl border p-5 backdrop-blur-md ${
                  analyzed.meter.status === "healthy"
                    ? "border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : analyzed.meter.status === "suspicious"
                      ? "border-amber-500/40 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                      : "border-rose-500/40 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {analyzed.meter.status === "healthy" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  ) : analyzed.meter.status === "suspicious" ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{analyzed.meter.title}</p>
                      <span
                        className={
                          analyzed.meter.status === "healthy"
                            ? "badge-safe"
                            : analyzed.meter.status === "suspicious"
                              ? "badge-warning"
                              : "badge-critical"
                        }
                      >
                        {analyzed.meter.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {analyzed.meter.message}
                    </p>

                    {/* Gap visualization */}
                    <div className="mt-3.5 rounded-xl border border-white/[0.06] bg-black/25 p-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estimated vs Billed Spread</span>
                        <span
                          className={`font-bold font-mono ${analyzed.meter.gapUnits > 0 ? "text-rose-400" : "text-emerald-400"}`}
                        >
                          {analyzed.meter.gapUnits > 0 ? "+" : ""}
                          {Math.round(analyzed.meter.gapUnits)} units (
                          {analyzed.meter.gapPct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="mb-1 text-[10px] text-muted-foreground">
                            Appliance Estimate
                          </p>
                          <div className="progress-track">
                            <div
                              className="progress-fill-emerald"
                              style={{
                                width: `${Math.min(100, (estimatedUnits / Math.max(billedUnits, estimatedUnits, 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-[10px] text-muted-foreground">
                            Actual DISCO Billed
                          </p>
                          <div className="progress-track">
                            <div
                              className={
                                analyzed.meter.gapUnits > 0
                                  ? "progress-fill-danger"
                                  : "progress-fill-amber"
                              }
                              style={{
                                width: `${Math.min(100, (billedUnits / Math.max(billedUnits, estimatedUnits, 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flags */}
                    {(analyzed.meter.possibleFaultyMeter || analyzed.meter.possibleTheft) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analyzed.meter.possibleFaultyMeter && (
                          <span className="badge-critical">
                            Possible Faulty Meter / Running Fast
                          </span>
                        )}
                        {analyzed.meter.possibleTheft && (
                          <span className="badge-critical">Possible Theft / Shared Kunda Load</span>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Lightbulb className="h-3.5 w-3.5 text-emerald-400" /> Corrective Actions
                      </p>
                      <ul className="space-y-1.5">
                        {analyzed.meter.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device breakdown */}
              <div className="glass-card p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-white tracking-tight">
                  Vampire Drain Sources
                </h4>
                <div className="space-y-2">
                  {analyzed.vampire.rows.map((r) => (
                    <div
                      key={r.name}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.05] bg-slate-900/60 p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.tip}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-extrabold text-amber-400">{pkr(r.cost)}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {Math.round(r.units)} kWh/mo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart plug schedules */}
              {analyzed.schedules.length > 0 && (
                <div className="dashboard-card p-5 sm:p-6 border-emerald-500/30">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                      <Clock className="h-4 w-4 text-emerald-400" /> Smart Plug Automated Schedules
                    </h4>
                    <span className="badge-safe">
                      <Zap className="h-3 w-3" /> Save {pkr(potentialSavings)}/mo
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Set these schedules on smart plugs or timer switches to eliminate standby waste
                    automatically.
                  </p>
                  <div className="mt-4 space-y-3">
                    {analyzed.schedules.map((sch) => (
                      <div key={sch.device} className="rounded-xl border bg-surface/60 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium">
                              {sch.device}
                              <span
                                className="text-xs font-normal text-muted-foreground"
                                dir="rtl"
                                lang="ur"
                              >
                                {sch.urdu}
                              </span>
                              {sch.priority === "high" && (
                                <span className="consumption-badge">High priority</span>
                              )}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <strong className="text-foreground">{sch.action}</strong> —{" "}
                              {sch.schedule}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-bold text-primary">{pkr(sch.savingsPkr)}</p>
                            <p className="text-xs text-muted-foreground">saved/mo</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Implementing all schedules can save approximately{" "}
                      <strong>{pkr(potentialSavings)}</strong> per month — that's{" "}
                      <strong>{pkr(potentialSavings * 12)}</strong> per year.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get disco slab data without importing the full discos array circularly
function getDiscoSlabs(discoId: string) {
  const rates: Record<string, number[]> = {
    "k-electric": [13.5, 18.95, 24.9, 32.03, 37.8, 43.5],
    lesco: [14.2, 19.5, 25.6, 33.1, 38.9, 44.8],
    gepco: [13.8, 19.1, 25.2, 32.6, 38.3, 44.1],
    fesco: [13.6, 18.8, 24.7, 31.9, 37.5, 43.2],
    iesco: [14.5, 20.1, 26.4, 34, 39.8, 45.6],
    pesco: [14, 19.6, 25.8, 33.3, 39.1, 44.9],
    hesco: [13.3, 18.5, 24.3, 31.5, 37.1, 42.8],
    qesco: [13.1, 18.2, 24, 31.2, 36.8, 42.5],
    mepco: [13.7, 19, 25, 32.3, 37.9, 43.6],
  };
  const r = rates[discoId] ?? rates["k-electric"]!;
  return [
    { upTo: 100, rate: r[0]!, label: "1–100 units" },
    { upTo: 200, rate: r[1]!, label: "101–200 units" },
    { upTo: 300, rate: r[2]!, label: "201–300 units" },
    { upTo: 400, rate: r[3]!, label: "301–400 units" },
    { upTo: 700, rate: r[4]!, label: "401–700 units" },
    { upTo: Infinity, rate: r[5]!, label: "Above 700 units" },
  ];
}

function getDiscoTax(discoId: string): number {
  const taxes: Record<string, number> = {
    "k-electric": 0.31,
    lesco: 0.3,
    gepco: 0.3,
    fesco: 0.29,
    iesco: 0.31,
    pesco: 0.3,
    hesco: 0.28,
    qesco: 0.28,
    mepco: 0.29,
  };
  return taxes[discoId] ?? 0.31;
}
