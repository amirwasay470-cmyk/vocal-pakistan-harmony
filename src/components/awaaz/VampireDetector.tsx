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
import {
  defaultStandbyDevices,
  calculateVampire,
  type StandbyDevice,
} from "@/lib/awaaz-household";
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
          ? { ...d, qty: d.qty > 0 ? 0 : (defaultStandbyDevices.find((x) => x.id === id)?.qty ?? 1) }
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
      activeDevices.map((d) => ({ name: d.name, urdu: d.urdu, watts: d.watts, qty: d.qty, tip: d.tip })),
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
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Plug className="h-4 w-4 text-warning" /> Standby devices
            </h3>
            <span className="warn-badge">
              {devices.filter((d) => d.qty > 0).length} active
            </span>
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

          {/* Quick context */}
          <div className="mt-5 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Connected from Bill Audit</p>
            <p className="mt-1">Billed units: <strong className="text-foreground">{billedUnits}</strong> kWh</p>
            <p>Estimated appliance use: <strong className="text-foreground">{Math.round(estimatedUnits)}</strong> kWh</p>
            <p>Appliances tracked: <strong className="text-foreground">{appliances.length}</strong></p>
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
              <div className="warn-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Monthly vampire waste</p>
                    <p className="mt-1 text-3xl font-bold text-warning">{pkr(totalWaste)}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(analyzed.vampire.monthlyUnits)} units wasted while nothing is in use
                    </p>
                  </div>
                  <Ghost className="h-8 w-8 text-warning" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Standby load" value={`${Math.round(analyzed.vampire.watts)} W`} />
                  <Stat label="Monthly waste" value={pkr(totalWaste)} accent />
                  <Stat label="Yearly waste" value={pkr(yearlyWaste)} />
                </div>
              </div>

              {/* Meter health */}
              <div
                className={`rounded-2xl border p-5 ${
                  analyzed.meter.status === "healthy"
                    ? "border-primary/30 bg-primary/8"
                    : analyzed.meter.status === "suspicious"
                      ? "border-warning/40 bg-warning/8"
                      : "border-destructive/40 bg-destructive/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {analyzed.meter.status === "healthy" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  ) : analyzed.meter.status === "suspicious" ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{analyzed.meter.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{analyzed.meter.message}</p>

                    {/* Gap visualization */}
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estimated vs billed</span>
                        <span className={`font-semibold ${analyzed.meter.gapUnits > 0 ? "text-destructive" : "text-primary"}`}>
                          {analyzed.meter.gapUnits > 0 ? "+" : ""}
                          {Math.round(analyzed.meter.gapUnits)} units ({analyzed.meter.gapPct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1">
                          <p className="mb-0.5 text-[10px] text-muted-foreground">Estimated</p>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-700"
                              style={{
                                width: `${Math.min(100, (estimatedUnits / Math.max(billedUnits, estimatedUnits, 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="mb-0.5 text-[10px] text-muted-foreground">Billed</p>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${analyzed.meter.gapUnits > 0 ? "bg-destructive" : "bg-warning"}`}
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
                          <span className="consumption-badge">Possible faulty meter</span>
                        )}
                        {analyzed.meter.possibleTheft && (
                          <span className="consumption-badge">Possible theft / shared load</span>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold">
                        <Lightbulb className="h-3.5 w-3.5 text-primary" /> Recommendations
                      </p>
                      <ul className="space-y-1.5">
                        {analyzed.meter.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device breakdown */}
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-semibold">Where the vampire drain comes from</h4>
                <div className="space-y-2">
                  {analyzed.vampire.rows.map((r) => (
                    <div
                      key={r.name}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface/60 p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.tip}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold">{pkr(r.cost)}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(r.units)} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart plug schedules */}
              {analyzed.schedules.length > 0 && (
                <div className="neon-card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-primary" /> Smart plug schedules
                    </h4>
                    <span className="status-badge">
                      <Zap className="h-3 w-3" /> Save {pkr(potentialSavings)}/mo
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Set these schedules on smart plugs or timer switches to eliminate standby waste automatically.
                  </p>
                  <div className="mt-4 space-y-3">
                    {analyzed.schedules.map((sch) => (
                      <div
                        key={sch.device}
                        className="rounded-xl border bg-surface/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium">
                              {sch.device}
                              <span className="text-xs font-normal text-muted-foreground" dir="rtl" lang="ur">
                                {sch.urdu}
                              </span>
                              {sch.priority === "high" && (
                                <span className="consumption-badge">High priority</span>
                              )}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <strong className="text-foreground">{sch.action}</strong> — {sch.schedule}
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
