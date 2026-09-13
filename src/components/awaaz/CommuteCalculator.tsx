import { useMemo, useState } from "react";
import {
  Bike,
  Car,
  Bus,
  Fuel,
  Route,
  CalendarDays,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  BookmarkPlus,
  CheckCircle2,
  Gauge,
  Droplets,
  Wrench,
  Navigation,
  Flame,
} from "lucide-react";
import { pkr } from "@/lib/awaaz-data";
import { SectionHead, Field } from "@/components/awaaz/BillAudit";
import { CyberProgressRing } from "@/components/awaaz/CyberProgressRing";

type VehicleId = "bike70" | "bike125" | "smallCar" | "suv" | "public";
type FuelId = "petrol" | "diesel" | "lpg";
type StrategyId = "tuneup" | "route" | "transit";

type Vehicle = {
  id: VehicleId;
  name: string;
  icon: React.ReactNode;
  /** Fuel economy in km per litre. `null` for fare-based public transport. */
  kmPerLitre: number | null;
  /** Flat fare per km used only for public transport / van. */
  farePerKm?: number;
};

type FuelType = {
  id: FuelId;
  name: string;
  /** Reference retail rate in PKR. */
  price: number;
  /** Sold-by unit shown in the UI. */
  unit: string;
};

type Strategy = {
  id: StrategyId;
  name: string;
  short: string;
  icon: React.ReactNode;
  note: string;
};

const vehicles: Vehicle[] = [
  { id: "bike70", name: "70cc Bike", icon: <Bike className="h-5 w-5" />, kmPerLitre: 50 },
  { id: "bike125", name: "125cc Bike", icon: <Bike className="h-5 w-5" />, kmPerLitre: 40 },
  { id: "smallCar", name: "Small Car (1000cc)", icon: <Car className="h-5 w-5" />, kmPerLitre: 14 },
  { id: "suv", name: "Sedan / SUV", icon: <Car className="h-5 w-5" />, kmPerLitre: 9 },
  {
    id: "public",
    name: "Public Transport / Van",
    icon: <Bus className="h-5 w-5" />,
    kmPerLitre: null,
    farePerKm: 14,
  },
];

/** Live reference rates for Pakistan. */
const fuelTypes: FuelType[] = [
  { id: "petrol", name: "Petrol", price: 373.0, unit: "L" },
  { id: "diesel", name: "Diesel", price: 403.32, unit: "L" },
  { id: "lpg", name: "LPG", price: 258, unit: "kg" },
];

/** Flat fare assumed when shifting to a local van / bus. */
const TRANSIT_FARE_PER_KM = 14;
/** Fraction of a working week shifted to transit under the 2-days plan (2 of ~5.5). */
const TRANSIT_SHIFT_FRACTION = 2 / 5.5;

const strategies: Strategy[] = [
  {
    id: "tuneup",
    name: "Tune-up & Correct Tyre Pressure",
    short: "Tune-up",
    icon: <Wrench className="h-4 w-4" />,
    note: "Regular oil & spark-plug service plus proper PSI keeps the engine efficient — about 10% less fuel.",
  },
  {
    id: "route",
    name: "Route Shift to Avoid Peak Gridlock",
    short: "Route shift",
    icon: <Navigation className="h-4 w-4" />,
    note: "Bypassing heavy traffic blockades cuts idling and stop-start burn — roughly 15% saved.",
  },
  {
    id: "transit",
    name: "Public Transit / Local Van Combo",
    short: "Transit combo",
    icon: <Bus className="h-4 w-4" />,
    note: "Shift 2 days a week onto a local van or bus and leave the vehicle parked those days.",
  },
];

const STRATEGY_FLAT_SAVING: Record<Exclude<StrategyId, "transit">, number> = {
  tuneup: 0.1,
  route: 0.15,
};

export function CommuteCalculator() {
  const [dailyKm, setDailyKm] = useState(30);
  const [vehicleId, setVehicleId] = useState<VehicleId>("smallCar");
  const [fuelId, setFuelId] = useState<FuelId>("petrol");
  const [fuelPrice, setFuelPrice] = useState(375.82);
  const [days, setDays] = useState(22);
  const [strategyId, setStrategyId] = useState<StrategyId>("tuneup");
  const [saved, setSaved] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const fuel = fuelTypes.find((f) => f.id === fuelId)!;
  const strategy = strategies.find((s) => s.id === strategyId)!;
  const isPublic = vehicle.kmPerLitre === null;

  const result = useMemo(() => {
    const monthlyKm = dailyKm * days;

    let currentCost: number;
    let litres: number;
    if (isPublic) {
      currentCost = monthlyKm * (vehicle.farePerKm ?? 0);
      litres = 0;
    } else {
      litres = monthlyKm / (vehicle.kmPerLitre as number);
      currentCost = litres * fuelPrice;
    }

    // Optimized full-month cost under the chosen local strategy.
    let optimizedCost: number;
    if (strategyId === "transit") {
      const shiftedFuelCost = currentCost * TRANSIT_SHIFT_FRACTION;
      const shiftedFareCost = monthlyKm * TRANSIT_SHIFT_FRACTION * TRANSIT_FARE_PER_KM;
      optimizedCost = currentCost - shiftedFuelCost + shiftedFareCost;
    } else {
      optimizedCost = currentCost * (1 - STRATEGY_FLAT_SAVING[strategyId]);
    }
    optimizedCost = Math.max(0, optimizedCost);

    const savings = currentCost - optimizedCost;
    const savingsPct = currentCost > 0 ? (savings / currentCost) * 100 : 0;

    return {
      current: currentCost,
      litres,
      monthlyKm,
      optimized: optimizedCost,
      savings,
      savingsPct,
      yearlySavings: savings * 12,
    };
  }, [vehicle, isPublic, dailyKm, days, fuelPrice, strategyId]);

  const barMax = Math.max(result.current, 1);
  const optimizedPct = Math.max(4, (result.optimized / barMax) * 100);

  function selectFuel(f: FuelType) {
    setFuelId(f.id);
    setFuelPrice(f.price);
    setSaved(false);
  }

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Route className="h-5 w-5" />}
        title="Daily Commute & Fuel Burn Calculator"
        subtitle="See exactly how much fuel your daily travel burns each month — and how much smart local habits save."
      />

      {/* ── Live fuel-price ticker ─────────────────────────── */}
      <div className="glass-card p-4 sm:p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold text-white tracking-tight">
            <Flame className="h-3.5 w-3.5 text-amber-400" /> Pakistan Reference Fuel Rates (OGRA)
          </p>
          <span className="badge-warning">Tap to sync rate</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {fuelTypes.map((f) => {
            const active = f.id === fuelId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFuel(f)}
                aria-pressed={active}
                disabled={isPublic}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  active
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-white/[0.16] hover:bg-slate-900/80"
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${active ? "text-emerald-300" : "text-slate-400"}`}
                >
                  <Droplets className="h-3 w-3 text-emerald-400" /> {f.name}
                </span>
                <span
                  className={`mt-1 text-base font-extrabold ${active ? "text-white" : "text-slate-200"}`}
                >
                  Rs {f.price.toLocaleString("en-PK")}
                </span>
                <span className="text-[10px] text-muted-foreground">per {f.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* ── Inputs ─────────────────────────────────────────── */}
        <div className="glass-card p-5 sm:p-6 shadow-md">
          <h3 className="mb-4 text-base font-bold text-white tracking-tight">
            Your Commute Pattern
          </h3>

          {/* Distance slider */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Route className="h-3.5 w-3.5 text-emerald-400" /> Daily round-trip distance
              </span>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 font-mono">
                {dailyKm} KM
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={dailyKm}
              onChange={(e) => {
                setDailyKm(Number(e.target.value));
                setSaved(false);
              }}
              className="w-full accent-emerald-400"
              aria-label="Daily round-trip distance in kilometres"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>5 KM</span>
              <span>100 KM</span>
            </div>
          </div>

          {/* Vehicle selector */}
          <p className="mb-2 text-xs font-semibold text-slate-300">Vehicle type</p>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {vehicles.map((v) => {
              const active = v.id === vehicleId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVehicleId(v.id);
                    setSaved(false);
                  }}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200 active:scale-95 ${
                    active
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/[0.16] hover:text-white"
                  }`}
                >
                  <span className={active ? "text-emerald-400" : "text-slate-400"}>{v.icon}</span>
                  <span className="text-xs font-bold leading-tight">{v.name}</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {v.kmPerLitre ? `${v.kmPerLitre} km/l` : `Rs ${v.farePerKm}/km fare`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fuel price + days */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${fuel.name} price (PKR / ${fuel.unit})`}>
              <div className="relative">
                <Fuel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => {
                    setFuelPrice(Number(e.target.value));
                    setSaved(false);
                  }}
                  className="input-base pl-9"
                  disabled={isPublic}
                />
              </div>
              {isPublic && (
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Public transport uses a flat fare, not a fuel price.
                </span>
              )}
            </Field>

            <Field label="Days travelled per month">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={days}
                  onChange={(e) => {
                    setDays(Number(e.target.value));
                    setSaved(false);
                  }}
                  className="input-base pl-9"
                />
              </div>
            </Field>
          </div>

          {/* Quick consumption chips */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat
              icon={<Gauge className="h-3.5 w-3.5" />}
              label="Monthly KM"
              value={`${Math.round(result.monthlyKm)}`}
            />
            <MiniStat
              icon={<Droplets className="h-3.5 w-3.5" />}
              label="Fuel used"
              value={isPublic ? "—" : `${result.litres.toFixed(1)} ${fuel.unit}`}
            />
            <MiniStat
              icon={<Fuel className="h-3.5 w-3.5" />}
              label="Rate"
              value={isPublic ? "Fare" : `Rs ${Math.round(fuelPrice)}`}
            />
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Full-month projected burn */}
          <div className="cyber-glass-card p-5.5">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <h4 className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                <Flame className="h-4 w-4 text-amber-400" /> Full-Month Fuel & Commute Burn
              </h4>
              <span className="terminal-badge text-[10px]">L/KM TELEMETRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
              <CyberProgressRing
                value={result.current}
                max={25000}
                label="Fuel Spend"
                unit="PKR"
                size={130}
                icon={Fuel}
                thresholds={{ warning: 60, critical: 85 }}
                formatValue={(val) => `Rs. ${Math.round(val).toLocaleString()}`}
                subtext={`Baseline Rs. 25,000 allowance`}
              />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.08] bg-slate-950/80 p-3.5 shadow-inner">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5 text-emerald-400" /> Total Fuel / Mo
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-white">
                      {isPublic ? "—" : `${result.litres.toFixed(1)}`}
                      {!isPublic && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          {fuel.unit}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 shadow-inner">
                    <p className="flex items-center gap-1 text-[11px] text-amber-300">
                      <Fuel className="h-3.5 w-3.5 text-amber-400" /> Projected Cash Burn
                    </p>
                    <p className="mt-1 text-2xl font-black text-amber-400">{pkr(result.current)}</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  At {Math.round(result.monthlyKm)} KM over {days} active travel days, your annual
                  fuel outlay reaches{" "}
                  <strong className="text-white font-mono">{pkr(result.current * 12)}</strong> if
                  unadjusted.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy selector */}
          <div className="glass-card p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-white tracking-tight">
              Select Savings Strategy
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {strategies.map((s) => {
                const active = s.id === strategyId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStrategyId(s.id);
                      setSaved(false);
                    }}
                    aria-pressed={active}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-200 active:scale-95 ${
                      active
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                        : "border-white/[0.08] bg-slate-900/60 text-slate-400 hover:border-white/[0.16] hover:text-white"
                    }`}
                  >
                    <span className={active ? "text-emerald-400" : "text-slate-400"}>{s.icon}</span>
                    <span className="text-xs font-bold leading-tight">{s.short}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">{strategy.note}</p>
          </div>

          {/* Savings badge */}
          <div className="dashboard-card p-5 sm:p-6 border-emerald-500/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge-safe">Targeted Monthly Liquidity</span>
                <p className="mt-1.5 text-3xl font-extrabold text-emerald-400">
                  {pkr(result.savings)}
                </p>
                <p className="text-xs text-slate-300">
                  per month · {pkr(result.yearlySavings)} annual retainable capital
                </p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <PiggyBank className="h-6 w-6 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Dual-bar comparison */}
          <div className="glass-card p-5 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white tracking-tight">
              <TrendingDown className="h-4 w-4 text-emerald-400" /> Full-Month Burn Comparison
            </h4>

            <div className="space-y-5">
              {/* Current / high-cost */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Fuel className="h-3.5 w-3.5 text-rose-400" /> Current Baseline (Now)
                  </span>
                  <span className="font-extrabold font-mono text-amber-400">
                    {pkr(result.current)}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-danger" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Optimized */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                    {strategy.icon} With {strategy.short}
                  </span>
                  <span className="font-extrabold font-mono text-emerald-400">
                    {pkr(result.optimized)}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill-emerald" style={{ width: `${optimizedPct}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 text-xs">
              <span className="text-slate-300">Effective Cash Reduction</span>
              <span className="font-extrabold font-mono text-emerald-400">
                −{Math.round(result.savingsPct)}% · {pkr(result.savings)}/mo
              </span>
            </div>
          </div>

          {/* Rich Pakistani Commuter Fuel-Saving Playbook footer */}
          <div className="dashboard-card p-5 sm:p-6 border-amber-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Pakistani Commuter Fuel-Saving Playbook
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Hyper-localized driving & maintenance strategies for {vehicle.name}
                  </p>
                </div>
              </div>
              <span className="badge-safe">Save ~{pkr(result.savings)}/mo</span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Proven, everyday practices tailored for Pakistani traffic conditions and road quality
              to cut fuel burn by 15–25%:
            </p>

            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-bold">
                  <Gauge className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-white">
                    Maintain Correct Tyre Pressure at Pump Nitrogen Stands:
                  </span>{" "}
                  <span className="text-slate-300">
                    Check PSI weekly at local PSO, Shell, or Total digital air/nitrogen stands (or
                    tyre puncture shops). Under-inflated tyres increase rolling friction on potholed
                    city asphalt, draining 5% to 8% more fuel every kilometer.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-amber-500/30 bg-amber-500/20 text-amber-400 font-bold">
                  <Navigation className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-white">
                    Plan Alternate Routes to Dodge Peak-Hour Gridlocks:
                  </span>{" "}
                  <span className="text-slate-300">
                    Check real-time traffic to bypass major choke points (e.g. Shahrah-e-Faisal,
                    Canal Road, or Islamabad Expressway bottlenecks). Idling in 1st-gear clutch
                    crawl burns up to 1.5 litres of fuel per hour with zero progress.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-bold">
                  <Wrench className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-white">
                    Stick to Regular Engine Oil & Air Filter Changes:
                  </span>{" "}
                  <span className="text-slate-300">
                    Replace engine oil every 3,000–5,000 km and clean the air filter every 1,500 km.
                    Heavy dust and urban smog rapidly choke filters, causing rich combustion and
                    sluggish mileage.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-bold">
                  <Droplets className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-white">
                    Avoid Aggressive Sudden Acceleration in Heavy Traffic:
                  </span>{" "}
                  <span className="text-slate-300">
                    Ease onto the throttle rather than gunning the engine between speed breakers and
                    traffic signals. Smooth, progressive acceleration preserves engine momentum and
                    cuts up to 15% off fuel consumption.
                  </span>
                </div>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setSaved(true)}
              className="btn-primary mt-4 w-full justify-center"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Saved to My Plan
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" /> Save to My Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-surface p-2.5">
      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function adviceFor(vehicle: Vehicle, strategy: Strategy, savings: number, isPublic: boolean) {
  const amount = pkr(savings);
  if (isPublic) {
    return `You're already on a low-cost mode. Splitting a rickshaw or catching an off-peak van still trims about ${amount}/month.`;
  }
  switch (strategy.id) {
    case "tuneup":
      return `Keeping your ${vehicle.name} tuned with correct tyre pressure recovers roughly ${amount}/month in wasted fuel.`;
    case "route":
      return `Leaving 15 minutes earlier to dodge peak gridlock cuts idling burn — about ${amount}/month back in your pocket.`;
    case "transit":
      return `Parking the ${vehicle.name} two days a week and taking a local van saves close to ${amount}/month.`;
    default:
      return `This habit saves roughly ${amount}/month.`;
  }
}
