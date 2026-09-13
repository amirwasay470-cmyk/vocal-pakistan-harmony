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
  Users,
  Lightbulb,
  BookmarkPlus,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { pkr } from "@/lib/awaaz-data";
import { SectionHead, Field } from "@/components/awaaz/BillAudit";

type VehicleId = "bike70" | "bike125" | "smallCar" | "suv" | "public";

type Vehicle = {
  id: VehicleId;
  name: string;
  short: string;
  icon: React.ReactNode;
  /** Fuel economy in km per litre. `null` for fare-based public transport. */
  kmPerLitre: number | null;
  /** Flat fare per km used only for public transport / van. */
  farePerKm?: number;
};

const vehicles: Vehicle[] = [
  { id: "bike70", name: "70cc Bike", short: "70cc", icon: <Bike className="h-5 w-5" />, kmPerLitre: 50 },
  { id: "bike125", name: "125cc Bike", short: "125cc", icon: <Bike className="h-5 w-5" />, kmPerLitre: 40 },
  { id: "smallCar", name: "Small Car (1000cc)", short: "1000cc", icon: <Car className="h-5 w-5" />, kmPerLitre: 14 },
  { id: "suv", name: "Sedan / SUV", short: "SUV", icon: <Car className="h-5 w-5" />, kmPerLitre: 9 },
  { id: "public", name: "Public Transport / Van", short: "Public", icon: <Bus className="h-5 w-5" />, kmPerLitre: null, farePerKm: 14 },
];

/** Optimized plan: carpool ~3 of every ~5.5 commute days, shared between 3 riders. */
const CARPOOL_SHARE_FRACTION = 3 / 5.5;
const CARPOOL_RIDERS = 3;

function monthlyCost(vehicle: Vehicle, dailyKm: number, days: number, petrolPrice: number) {
  const monthlyKm = dailyKm * days;
  if (vehicle.kmPerLitre === null) {
    return { cost: monthlyKm * (vehicle.farePerKm ?? 0), litres: 0, monthlyKm };
  }
  const litres = monthlyKm / vehicle.kmPerLitre;
  return { cost: litres * petrolPrice, litres, monthlyKm };
}

export function CommuteCalculator() {
  const [dailyKm, setDailyKm] = useState(30);
  const [vehicleId, setVehicleId] = useState<VehicleId>("smallCar");
  const [petrolPrice, setPetrolPrice] = useState(280);
  const [days, setDays] = useState(22);
  const [saved, setSaved] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId)!;

  const result = useMemo(() => {
    const current = monthlyCost(vehicle, dailyKm, days, petrolPrice);

    // Optimized: share the carpool portion of trips among CARPOOL_RIDERS people.
    const sharedPortion = current.cost * CARPOOL_SHARE_FRACTION;
    const soloPortion = current.cost * (1 - CARPOOL_SHARE_FRACTION);
    const optimizedCost = soloPortion + sharedPortion / CARPOOL_RIDERS;

    const savings = current.cost - optimizedCost;
    const savingsPct = current.cost > 0 ? (savings / current.cost) * 100 : 0;

    return {
      current: current.cost,
      litres: current.litres,
      monthlyKm: current.monthlyKm,
      optimized: optimizedCost,
      savings,
      savingsPct,
      yearlySavings: savings * 12,
    };
  }, [vehicle, dailyKm, days, petrolPrice]);

  const barMax = Math.max(result.current, 1);
  const currentPct = 100;
  const optimizedPct = Math.max(4, (result.optimized / barMax) * 100);

  const isPublic = vehicle.kmPerLitre === null;

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Route className="h-5 w-5" />}
        title="Daily Commute & Fuel Burn Calculator"
        subtitle="See exactly how much petrol your daily travel burns each month — and how much you save by carpooling or switching modes."
      />

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
              onChange={(e) => setDailyKm(Number(e.target.value))}
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

          {/* Petrol price + days */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Petrol price (PKR / litre)">
              <div className="relative">
                <Fuel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={1}
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(Number(e.target.value))}
                  className="input-base pl-9"
                  disabled={isPublic}
                />
              </div>
              {isPublic && (
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Public transport uses a flat fare, not petrol price.
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
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="input-base pl-9"
                />
              </div>
            </Field>
          </div>

          {/* Consumption summary */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniStat icon={<Gauge className="h-3.5 w-3.5" />} label="Monthly KM" value={`${Math.round(result.monthlyKm)}`} />
            <MiniStat
              icon={<Fuel className="h-3.5 w-3.5" />}
              label="Fuel used"
              value={isPublic ? "—" : `${result.litres.toFixed(1)} L`}
            />
            <MiniStat icon={<Users className="h-3.5 w-3.5" />} label="Carpool w/" value={`${CARPOOL_RIDERS} riders`} />
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Savings badge */}
          <div className="neon-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">You could save</p>
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
              <TrendingDown className="h-4 w-4 text-primary" /> Monthly commute burn
            </h4>

            <div className="space-y-5">
              {/* Current / high-cost */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Fuel className="h-3.5 w-3.5 text-[var(--danger)]" /> Solo commute (now)
                  </span>
                  <span className="font-bold text-[var(--warning)]">{pkr(result.current)}</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${currentPct}%`,
                      background:
                        "linear-gradient(90deg, var(--danger), var(--warning))",
                    }}
                  />
                </div>
              </div>

              {/* Optimized */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Users className="h-3.5 w-3.5 text-primary" /> Carpool 3 days / week
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
                  {adviceFor(vehicle, result.savings, isPublic)}
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

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function adviceFor(vehicle: Vehicle, savings: number, isPublic: boolean) {
  const amount = pkr(savings);
  if (isPublic) {
    return `You're already on a low-cost mode. Sharing a van seat or splitting a rickshaw on peak days can still trim about ${amount}/month.`;
  }
  if (vehicle.id === "suv" || vehicle.id === "smallCar") {
    return `Carpooling 3 days a week with 2 colleagues saves approximately ${amount}/month. Keeping tyres inflated and steady speeds adds a few percent more.`;
  }
  return `Carpooling or ride-sharing on busy days saves roughly ${amount}/month. Regular tuning and correct tyre pressure keep your ${vehicle.name} at peak km/l.`;
}
