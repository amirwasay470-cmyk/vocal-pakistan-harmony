import { useMemo, useState } from "react";
import {
  Sun,
  BatteryCharging,
  Wallet,
  Clock,
  Leaf,
  TrendingDown,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  calculateSolarSystem,
  recommendedSystemSize,
  sunlightByCity,
  solarPricing,
  type SolarTier,
  type SolarSystem,
} from "@/lib/awaaz-solar";
import { discos, pkr, slabBreakdownFor } from "@/lib/awaaz-data";
import { SectionHead, Field, Stat, EmptyState } from "@/components/awaaz/BillAudit";
import { CyberProgressRing } from "@/components/awaaz/CyberProgressRing";

type Props = {
  monthlyUnits: number;
  discoId: string;
};

export function SolarCalculator({ monthlyUnits, discoId }: Props) {
  const [units, setUnits] = useState(monthlyUnits || 412);
  const [city, setCity] = useState("Karachi");
  const [tier, setTier] = useState<SolarTier>("balanced");
  const [batteryKwh, setBatteryKwh] = useState(10);
  const [loadSheddingHours, setLoadSheddingHours] = useState(4);
  const [calculated, setCalculated] = useState<SolarSystem | null>(null);

  const disco = discos.find((d) => d.id === discoId) ?? discos[0]!;
  const sunlight = sunlightByCity.find((s) => s.city === city) ?? sunlightByCity[0]!;
  const recommendedKw = useMemo(
    () => recommendedSystemSize(units, sunlight.hours),
    [units, sunlight.hours],
  );

  const calculate = () => {
    setCalculated(
      calculateSolarSystem({
        monthlyUnits: units,
        disco,
        sunlightHours: sunlight.hours,
        tier,
        batteryKwh,
        loadSheddingHours,
      }),
    );
  };

  const tierLabel: Record<SolarTier, string> = {
    entry: "Entry (Chinese panels, PWM)",
    balanced: "Balanced (Tier-2, hybrid inverter)",
    premium: "Premium (Tier-1, MPPT, warranty)",
  };

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Sun className="h-5 w-5" />}
        title="Smart Solar & Inverter Calculator"
        subtitle="Right-size your solar system with real Pakistani pricing, sunlight hours, and payback analysis."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Inputs */}
        <div className="glass-card p-5 sm:p-6 shadow-md">
          <h3 className="mb-4 text-base font-bold text-white tracking-tight">
            Your Household Setup
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly units (kWh)">
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="input-base"
              />
            </Field>
            <Field label="City (for sunlight hours)">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input-base">
                {sunlightByCity.map((s) => (
                  <option key={s.city} value={s.city}>
                    {s.city} ({s.hours}h avg)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="DISCO (for tariff)">
              <select value={discoId} onChange={(e) => {}} className="input-base" disabled>
                {discos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.city})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Daily load-shedding hours">
              <input
                type="number"
                min="0"
                max="12"
                value={loadSheddingHours}
                onChange={(e) => setLoadSheddingHours(Number(e.target.value))}
                className="input-base"
              />
            </Field>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-300">Solar system quality tier</p>
            <div className="grid grid-cols-3 gap-2">
              {(["entry", "balanced", "premium"] as SolarTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-all duration-200 active:scale-95 ${
                    tier === t
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/[0.16] hover:text-white"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  <span className="mt-1 block text-[10px] font-normal opacity-80">
                    Rs {solarPricing.panelPerWatt[t]}/W
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={`Battery backup: ${batteryKwh} kWh`}>
              <input
                type="range"
                min="0"
                max="40"
                step="2.5"
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </Field>
            <div className="flex items-end">
              <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs shadow-inner">
                <p className="font-bold text-emerald-400">Recommended System Size</p>
                <p className="mt-0.5 text-lg font-extrabold text-white">
                  {recommendedKw} kW system
                </p>
                <p className="text-slate-300">
                  {Math.ceil((recommendedKw * 1000) / 550)} panels · covers ~
                  {Math.round(((recommendedKw * sunlight.hours * 0.77 * 30) / units) * 100)}% of
                  usage
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button onClick={calculate} className="btn-primary w-full">
              <Zap className="h-4 w-4" /> Calculate solar investment
            </button>
          </div>

          <p className="mt-3.5 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            Pricing uses 2025 Pakistani market estimates: panels Rs{" "}
            {solarPricing.panelPerWatt[tier]}/W, inverter Rs {solarPricing.inverterPerWatt[tier]}/W,
            battery Rs {solarPricing.batteryPerKwh.toLocaleString()}/kWh, plus 12% installation.
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!calculated ? (
            <EmptyState
              icon={<Sun className="h-6 w-6" />}
              title="No calculation yet"
              text="Enter your monthly units and city, then tap Calculate to see your recommended system size, upfront cost, payback period, and battery backup hours."
            />
          ) : (
            <div className="tab-enter space-y-4">
              {/* Headline investment */}
              <div className="dashboard-card p-5 sm:p-6 border-emerald-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="badge-safe">Recommended Architecture</span>
                    <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-white">
                      {calculated.kw} kW
                    </p>
                    <p className="text-xs text-slate-300">
                      {calculated.panels} Tier-1 panels · {tierLabel[calculated.tier]}
                    </p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                    <Sun className="h-7 w-7 animate-pulse" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Upfront cost" value={pkr(calculated.upfrontCost)} accent />
                  <Stat label="Monthly saving" value={pkr(calculated.monthlySavings)} />
                  <Stat label="Payback" value={`${calculated.paybackYears.toFixed(1)} yrs`} />
                  <Stat label="Bill after solar" value={pkr(calculated.billAfterSolar)} />
                </div>
              </div>

              {/* Payback breakdown */}
              <div className="glass-card p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                  <Clock className="h-4 w-4 text-emerald-400" /> Investment & Payback Horizon
                </h4>
                <div className="space-y-3 text-sm">
                  <PaybackRow
                    label="Upfront investment"
                    value={pkr(calculated.upfrontCost)}
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                  />
                  <PaybackRow
                    label="Monthly savings on bill"
                    value={pkr(calculated.monthlySavings)}
                    icon={<TrendingDown className="h-4 w-4 text-emerald-400" />}
                  />
                  <PaybackRow
                    label="Yearly savings"
                    value={pkr(calculated.yearlySavings)}
                    icon={<TrendingDown className="h-4 w-4 text-emerald-400" />}
                  />
                  <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                    <span className="flex items-center gap-2 font-bold text-white">
                      <Clock className="h-4 w-4 text-emerald-400" /> Payback period
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {isFinite(calculated.paybackYears)
                        ? `${calculated.paybackYears.toFixed(1)} years`
                        : "N/A"}
                    </span>
                  </div>
                  {isFinite(calculated.paybackYears) && calculated.paybackYears <= 5 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>
                        High Yield: pays for itself in{" "}
                        <strong>{calculated.paybackYears.toFixed(1)} years</strong>, generating{" "}
                        <strong>{pkr(calculated.yearlySavings)}</strong> annual net liquidity
                        afterwards.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Battery & backup */}
              <div className="cyber-glass-card p-5.5">
                <h4 className="mb-4 flex items-center justify-between gap-2 text-sm font-bold text-white tracking-tight">
                  <span className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-emerald-400" /> Battery & Load-Shedding
                    Backup
                  </span>
                  <span className="terminal-badge text-[10px]">STORAGE TELEMETRY</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-5 items-center mb-4">
                  <CyberProgressRing
                    value={Math.round(calculated.independencePct)}
                    max={100}
                    label="Grid Independence"
                    unit="%"
                    size={130}
                    icon={Sun}
                    thresholds={{ warning: 40, critical: 75 }}
                    inverseUrgency={true}
                    subtext="Solar + Battery autonomy ratio"
                  />

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Stat label="Battery capacity" value={`${calculated.batteryKwh} kWh`} />
                      <Stat
                        label="Backup hours"
                        value={`${calculated.backupHours.toFixed(1)} hrs`}
                        accent
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Essential load backup</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {calculated.backupHours.toFixed(1)} hours (fans + lights + fridge)
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill-emerald"
                          style={{
                            width: `${Math.min(100, (calculated.backupHours / Math.max(loadSheddingHours, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {calculated.backupHours >= loadSheddingHours
                          ? `Battery covers your full ${loadSheddingHours}h daily load-shedding with room to spare.`
                          : `Battery covers ${calculated.backupHours.toFixed(1)}h of your ${loadSheddingHours}h daily load-shedding — consider a larger battery.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy flow */}
              <div className="glass-card p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-white tracking-tight">
                  Monthly Energy Flow
                </h4>
                <div className="space-y-3 text-sm">
                  <FlowRow
                    label="Solar generation"
                    value={`${Math.round(calculated.monthlyGeneration)} kWh`}
                    pct={100}
                    color="bg-emerald-400"
                  />
                  <FlowRow
                    label="Self-consumed (daytime use)"
                    value={`${Math.round(calculated.selfConsumed)} kWh`}
                    pct={
                      calculated.monthlyGeneration > 0
                        ? (calculated.selfConsumed / calculated.monthlyGeneration) * 100
                        : 0
                    }
                    color="bg-emerald-500/70"
                  />
                  <FlowRow
                    label="Exported to grid (net-metering)"
                    value={`${Math.round(calculated.exported)} kWh`}
                    pct={
                      calculated.monthlyGeneration > 0
                        ? (calculated.exported / calculated.monthlyGeneration) * 100
                        : 0
                    }
                    color="bg-teal-400"
                  />
                </div>
              </div>

              {/* Environmental impact */}
              <div className="glass-card p-5 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                  <Leaf className="h-4 w-4 text-emerald-400" /> Environmental Impact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label="CO₂ saved yearly"
                    value={`${Math.round(calculated.co2SavedYearly)} kg`}
                    accent
                  />
                  <Stat label="Equivalent to" value={`${calculated.treesEquivalent} trees`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaybackRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function FlowRow({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
