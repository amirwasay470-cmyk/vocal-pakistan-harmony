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
  { id: "petrol", name: "Petrol", price: 375.82, unit: "L" },
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
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-[var(--warning)]" /> Pakistan reference fuel rates
          </p>
          <span className="text-[10px] text-muted-foreground">Tap to link your fuel</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fuelTypes.map((f) => {
            const active = f.id === fuelId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFuel(f)}
                aria-pressed={active}
                disabled={isPublic}
                className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                  active
                    ? "border-primary bg-primary/15"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Droplets className="h-3 w-3" /> {f.name}
                </span>
                <span
                  className={`mt-0.5 text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}
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
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Your commute</h3>

          {/* Distance slider */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Route className="h-3.5 w-3.5" /> Daily round-trip distance
              </span>
              <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">
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
              className="w-full accent-[var(--primary)]"
              aria-label="Daily round-trip distance in kilometres"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>5 KM</span>
              <span>100 KM</span>
            </div>
          </div>

          {/* Vehicle selector */}
          <p className="mb-2 text-xs font-medium text-muted-foreground">Vehicle type</p>
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
                  className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className={active ? "text-primary" : "text-foreground/70"}>{v.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{v.name}</span>
                  <span className="text-[10px] font-normal opacity-70">
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
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-[var(--warning)]" /> Full-month projected burn
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-surface p-3">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Droplets className="h-3 w-3" /> Total fuel this month
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {isPublic ? "—" : `${result.litres.toFixed(1)}`}
                  {!isPublic && (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {fuel.unit}
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border bg-surface p-3">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Fuel className="h-3 w-3" /> Projected cash cost
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--warning)]">
                  {pkr(result.current)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              At {Math.round(result.monthlyKm)} KM over {days} days, this is what your current habit
              costs — roughly {pkr(result.current * 12)} a year if it stays the same.
            </p>
          </div>

          {/* Strategy selector */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold">Pick a local saving habit</h4>
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
                    className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-foreground/70"}>{s.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{s.short}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {strategy.note}
            </p>
          </div>

          {/* Savings badge */}
          <div className="neon-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">This habit saves you</p>
                <p className="mt-1 text-3xl font-bold text-primary">{pkr(result.savings)}</p>
                <p className="text-sm text-muted-foreground">
                  per month · {pkr(result.yearlySavings)} a year
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <PiggyBank className="h-6 w-6" />
              </span>
            </div>
          </div>

          {/* Dual-bar comparison */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="h-4 w-4 text-primary" /> Full-month burn compared
            </h4>

            <div className="space-y-5">
              {/* Current / high-cost */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Fuel className="h-3.5 w-3.5 text-[var(--danger)]" /> Current habit (now)
                  </span>
                  <span className="font-bold text-[var(--warning)]">{pkr(result.current)}</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: "100%",
                      background: "linear-gradient(90deg, var(--danger), var(--warning))",
                    }}
                  />
                </div>
              </div>

              {/* Optimized */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    {strategy.icon} With {strategy.short}
                  </span>
                  <span className="font-bold text-primary">{pkr(result.optimized)}</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${optimizedPct}%`,
                      background:
                        "linear-gradient(90deg, color-mix(in oklab, var(--primary) 55%, transparent), var(--primary))",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2.5 text-xs">
              <span className="text-muted-foreground">Cut from your monthly burn</span>
              <span className="font-bold text-primary">
                −{Math.round(result.savingsPct)}% · {pkr(result.savings)}
              </span>
            </div>
          </div>

          {/* Advice footer */}
          <div className="warn-card p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Smart tip for you</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {adviceFor(vehicle, strategy, result.savings, isPublic)}
                </p>
              </div>
            </div>

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
