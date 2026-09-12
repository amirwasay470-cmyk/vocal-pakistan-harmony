import { useMemo, useState } from "react";
import {
  Gauge,
  ScanLine,
  Camera,
  Upload,
  LoaderCircle,
  TriangleAlert as AlertTriangle,
  TrendingDown,
  Lightbulb,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  discos,
  slabBreakdownFor,
  pkr,
  type Appliance,
} from "@/lib/awaaz-data";
import {
  lifelineStatus,
  type SlabStatus,
} from "@/lib/awaaz-household";
import { SectionHead, Field, Stat, EmptyState } from "@/components/awaaz/BillAudit";

type DualBar = {
  appliance: Appliance;
  currentUnits: number;
  currentCost: number;
  optimizedUnits: number;
  optimizedCost: number;
  savings: number;
  savingsPct: number;
};

const OPTIMIZED_FACTORS: Record<string, { hoursMul: number; wattsMul: number; tip: string }> = {
  ac: { hoursMul: 0.75, wattsMul: 0.85, tip: "Set to 26°C + ceiling fan — saves 25% runtime." },
  fridge: { hoursMul: 1, wattsMul: 0.9, tip: "Clean coils, keep away from stove — 10% less draw." },
  iron: { hoursMul: 0.4, wattsMul: 1, tip: "Iron a full week in one session — 60% less standby." },
  fan: { hoursMul: 0.85, wattsMul: 0.44, tip: "Switch to 35W inverter fans — 56% less power." },
  geyser: { hoursMul: 0.5, wattsMul: 1, tip: "Lower thermostat to 50°C, insulate tank — 50% runtime." },
  lights: { hoursMul: 1, wattsMul: 0.6, tip: "Replace all bulbs with 9W LEDs — 40% less draw." },
  washing: { hoursMul: 0.7, wattsMul: 0.9, tip: "Full loads, cold wash — 30% less energy." },
  tv: { hoursMul: 0.8, wattsMul: 1, tip: "Cut standby with board switch — 20% less hours." },
};

const DANGER_TIERS = [
  { threshold: 50, label: "Lifeline (≤50)", tone: "good" as const },
  { threshold: 100, label: "Lifeline (≤100)", tone: "good" as const },
  { threshold: 200, label: "Protected (≤200)", tone: "warn" as const },
  { threshold: 300, label: "Unprotected (≤300)", tone: "bad" as const },
  { threshold: 400, label: "High (≤400)", tone: "bad" as const },
  { threshold: 700, label: "Very High (≤700)", tone: "bad" as const },
];

export function DashboardTab({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const [discoId, setDiscoId] = useState("k-electric");
  const [units, setUnits] = useState(412);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const disco = discos.find((d) => d.id === discoId) ?? discos[0]!;
  const slabStatus = lifelineStatus(units);
  const slabRows = slabBreakdownFor(units, disco.slabs);
  const energyCost = slabRows.reduce((s, r) => s + r.amount, 0);
  const marginalRate = slabRows.at(-1)?.rate ?? disco.slabs[0]!.rate;

  const dualBars: DualBar[] = useMemo(() => {
    const baseAppliances: Appliance[] = [
      { id: "ac", name: "Inverter AC (1 ton)", watts: 1200, hours: 8, qty: 1, tip: "" },
      { id: "fridge", name: "Refrigerator", watts: 150, hours: 24, qty: 1, tip: "" },
      { id: "iron", name: "Iron", watts: 1000, hours: 0.5, qty: 1, tip: "" },
      { id: "pump", name: "Water Pump", watts: 750, hours: 1, qty: 1, tip: "" },
      { id: "fan", name: "Ceiling Fans", watts: 80, hours: 14, qty: 4, tip: "" },
    ];
    const rate = marginalRate * 1.29;
    return baseAppliances.map((a) => {
      const currentUnits = (a.watts * a.hours * a.qty * 30) / 1000;
      const currentCost = currentUnits * rate;
      const opt = OPTIMIZED_FACTORS[a.id] ?? { hoursMul: 0.8, wattsMul: 0.9, tip: "Reduce usage hours." };
      const optimizedUnits = (a.watts * opt.wattsMul * a.hours * opt.hoursMul * a.qty * 30) / 1000;
      const optimizedCost = optimizedUnits * rate;
      const savings = currentCost - optimizedCost;
      const savingsPct = currentCost > 0 ? (savings / currentCost) * 100 : 0;
      return { appliance: a, currentUnits, currentCost, optimizedUnits, optimizedCost, savings, savingsPct };
    });
  }, [marginalRate]);

  const totalCurrent = dualBars.reduce((s, d) => s + d.currentCost, 0);
  const totalOptimized = dualBars.reduce((s, d) => s + d.optimizedCost, 0);
  const totalSavings = totalCurrent - totalOptimized;
  const maxCost = Math.max(...dualBars.map((d) => Math.max(d.currentCost, d.optimizedCost)), 1);

  const dangerPct = Math.min(100, (units / 700) * 100);
  const dangerTone =
    slabStatus.tone === "good" ? "good" : slabStatus.tone === "warn" ? "warn" : "bad";

  const handleScanMock = () => {
    setScanBusy(true);
    setScanPreview(null);
    setScanResult(null);
    window.setTimeout(() => {
      setScanBusy(false);
      setScanPreview("mock");
      setScanResult("412 units · Rs 18,500 · Slab: 301–400 · K-Electric");
    }, 1400);
  };

  const applyScan = () => {
    setUnits(412);
    setDiscoId("k-electric");
  };

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Gauge className="h-5 w-5" />}
        title="Dashboard & Dual-Bar Comparison Engine"
        subtitle="Monitor your slab danger zone, scan your bill, and compare current vs. optimized appliance costs."
      />

      {/* Slab Danger Meter */}
      <SlabDangerMeter
        units={units}
        dangerPct={dangerPct}
        dangerTone={dangerTone}
        slabStatus={slabStatus}
        onUnitsChange={setUnits}
      />

      {/* Quick Bill Scan */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <ScanLine className="h-4 w-4 text-primary" /> Quick Bill Scan
          </h3>
          <span className="status-badge">
            <Sparkles className="h-3 w-3" /> OCR Mockup
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Snap a photo of your electricity bill — the app reads units, amount, and slab automatically.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={handleScanMock} disabled={scanBusy} className="btn-primary disabled:opacity-60">
            {scanBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {scanBusy ? "Reading bill…" : "Take photo"}
          </button>
          <button onClick={handleScanMock} disabled={scanBusy} className="btn-ghost disabled:opacity-60">
            <Upload className="h-4 w-4" /> Upload image
          </button>
        </div>
        {scanPreview === "mock" && scanResult && (
          <div className="tab-enter mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <ScanLine className="h-4 w-4" /> Bill read successfully
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{scanResult}</p>
            <button onClick={applyScan} className="btn-primary mt-3 w-full justify-center">
              <ArrowRight className="h-4 w-4" /> Apply to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* DISCO selector + units input */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold">Your consumption</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Distribution company (DISCO)">
            <select value={discoId} onChange={(e) => setDiscoId(e.target.value)} className="input-base">
              {discos.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
              ))}
            </select>
          </Field>
          <Field label="Monthly units (kWh)">
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="input-base"
            />
          </Field>
        </div>
      </div>

      {/* Dual-Bar Appliance Comparison */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Dual-Bar Appliance Comparison</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Optimized
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Current total" value={pkr(totalCurrent)} />
          <Stat label="Optimized total" value={pkr(totalOptimized)} accent />
          <Stat label="Monthly savings" value={pkr(totalSavings)} accent />
          <Stat label="Marginal rate" value={`Rs ${marginalRate.toFixed(2)}/unit`} />
        </div>

        <div className="space-y-5">
          {dualBars.map((d) => (
            <DualBarRow key={d.appliance.id} data={d} maxCost={maxCost} />
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-primary/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Lightbulb className="h-4 w-4" /> Awaaz-e-Pakistan guideline savings
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Following the optimized usage pattern above can save approximately{" "}
            <strong className="text-primary">{pkr(totalSavings)}</strong> per month — that's{" "}
            <strong className="text-primary">{pkr(totalSavings * 12)}</strong> a year.
          </p>
        </div>
      </div>
    </div>
  );
}

function SlabDangerMeter({
  units,
  dangerPct,
  dangerTone,
  slabStatus,
  onUnitsChange,
}: {
  units: number;
  dangerPct: number;
  dangerTone: "good" | "warn" | "bad";
  slabStatus: SlabStatus;
  onUnitsChange: (n: number) => void;
}) {
  const barColor =
    dangerTone === "good" ? "bg-emerald-500" : dangerTone === "warn" ? "bg-amber-500" : "bg-rose-500";
  const Icon = dangerTone === "good" ? ShieldCheck : dangerTone === "warn" ? ShieldAlert : AlertTriangle;
  const cardCls =
    dangerTone === "good" ? "neon-card" : dangerTone === "warn" ? "warn-card" : "rounded-2xl border border-rose-500/40 bg-rose-500/10";

  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Gauge className="h-4 w-4" /> Slab Danger Meter
        </h3>
        <span className={dangerTone === "good" ? "status-badge" : dangerTone === "warn" ? "warn-badge" : "consumption-badge"}>
          <Icon className="h-3 w-3" /> {slabStatus.title}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>0 kWh</span>
          <span className="font-bold text-foreground">{units} kWh this month</span>
          <span>700+ kWh</span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${dangerPct}%` }}
          />
          {/* Tier markers */}
          {[50, 100, 200, 300, 400, 700].map((t) => (
            <div
              key={t}
              className="absolute top-0 h-full w-px bg-foreground/20"
              style={{ left: `${Math.min(100, (t / 700) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {DANGER_TIERS.map((t) => (
            <span key={t.threshold} className={units <= t.threshold ? "font-bold text-foreground" : ""}>
              {t.threshold}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{slabStatus.message}</p>
      {slabStatus.unitsToNextTier !== null && slabStatus.unitsToNextTier > 0 && (
        <p className="mt-1 text-xs font-semibold text-primary">
          {Math.round(slabStatus.unitsToNextTier)} units of headroom before the next tier.
        </p>
      )}

      <div className="mt-4">
        <Field label="Adjust your monthly kWh to see the danger zone change">
          <input
            type="range"
            min={0}
            max={1000}
            value={units}
            onChange={(e) => onUnitsChange(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
        </Field>
      </div>
    </div>
  );
}

function DualBarRow({ data, maxCost }: { data: DualBar; maxCost: number }) {
  const currentPct = (data.currentCost / maxCost) * 100;
  const optimizedPct = (data.optimizedCost / maxCost) * 100;
  const opt = OPTIMIZED_FACTORS[data.appliance.id] ?? { tip: "Reduce usage." };

  return (
    <div className="rounded-xl border bg-surface/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Zap className="h-4 w-4 text-primary" />
          {data.appliance.name}
        </span>
        <span className="text-xs font-bold text-emerald-400">
          Save {pkr(data.savings)} ({Math.round(data.savingsPct)}%)
        </span>
      </div>

      {/* Bar 1: Current */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-rose-400">Current usage</span>
          <span className="text-muted-foreground">
            {Math.round(data.currentUnits)} units · {pkr(data.currentCost)}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-700"
            style={{ width: `${Math.min(100, currentPct)}%` }}
          />
        </div>
      </div>

      {/* Bar 2: Optimized */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-emerald-400">Optimized usage</span>
          <span className="text-muted-foreground">
            {Math.round(data.optimizedUnits)} units · {pkr(data.optimizedCost)}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
            style={{ width: `${Math.min(100, optimizedPct)}%` }}
          />
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
        {opt.tip}
      </p>
    </div>
  );
}
