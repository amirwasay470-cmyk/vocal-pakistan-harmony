import { useMemo, useState } from "react";
import {
  Flame,
  Cylinder,
  Cable,
  Gauge,
  Users,
  Utensils,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  BookmarkPlus,
  CheckCircle2,
  Wrench,
  CookingPot,
  CircleDot,
  Wind,
  Receipt,
} from "lucide-react";
import { pkr } from "@/lib/awaaz-data";
import { SectionHead, Field } from "@/components/awaaz/BillAudit";

type MethodId = "lpg" | "pipeline";
type SlabId = "protectedLow" | "protectedHigh" | "nonProtectedMid" | "nonProtectedHigh";
type LoadId = "light" | "medium" | "heavy";
type TipId = "leak" | "cooker" | "cookware";

/** LPG domestic cylinder reference. */
const CYLINDER_KG = 11.8;
const CYLINDER_PRICE = 3052; // Rs per 11.8 kg cylinder
const CYLINDER_PER_KG = CYLINDER_PRICE / CYLINDER_KG; // ≈ 258.65
const CYLINDER_DELIVERY = 80; // Rs delivery / handling overhead per cylinder

type Slab = {
  id: SlabId;
  name: string;
  band: "Protected" | "Non-protected";
  rate: number; // Rs per MMBTU
  fixed: number; // fixed monthly meter charge (Rs)
};

const slabs: Slab[] = [
  { id: "protectedLow", name: "Protected · low", band: "Protected", rate: 200, fixed: 10 },
  { id: "protectedHigh", name: "Protected · high", band: "Protected", rate: 350, fixed: 10 },
  { id: "nonProtectedMid", name: "Non-protected · mid", band: "Non-protected", rate: 1500, fixed: 460 },
  { id: "nonProtectedHigh", name: "Non-protected · top", band: "Non-protected", rate: 4200, fixed: 460 },
];

type CookingLoad = {
  id: LoadId;
  label: string;
  people: string;
  /** Suggested cylinders per month for LPG households. */
  cylinders: number;
  /** Suggested MMBTU per month for pipeline households. */
  mmbtu: number;
};

const loads: CookingLoad[] = [
  { id: "light", label: "Light", people: "1–2 people", cylinders: 1, mmbtu: 2.5 },
  { id: "medium", label: "Medium", people: "3–5 people", cylinders: 2, mmbtu: 5 },
  { id: "heavy", label: "Heavy", people: "6+ people", cylinders: 3, mmbtu: 8 },
];

type Tip = {
  id: TipId;
  name: string;
  short: string;
  icon: React.ReactNode;
  /** Fraction of variable gas burn saved. */
  saving: number;
  note: string;
};

const tips: Tip[] = [
  {
    id: "leak",
    name: "Pressure check & regulator leakage test",
    short: "Leak check",
    icon: <Wrench className="h-4 w-4" />,
    saving: 0.08,
    note: "A soapy-water test on the regulator and hose catches invisible leaks that quietly drain a cylinder — about 8% back.",
  },
  {
    id: "cooker",
    name: "Pressure cooker for lentils & meat",
    short: "Pressure cooker",
    icon: <CookingPot className="h-4 w-4" />,
    saving: 0.25,
    note: "Daal and meat cook in a fraction of the time under pressure — cutting the gas those dishes burn by up to 40%.",
  },
  {
    id: "cookware",
    name: "Flat-bottom cookware matching the burner",
    short: "Right cookware",
    icon: <CircleDot className="h-4 w-4" />,
    saving: 0.1,
    note: "Flat pots sized to the flame stop heat escaping around the edges of an open burner — roughly 10% saved.",
  },
];

export function GasCookingCalculator() {
  const [method, setMethod] = useState<MethodId>("lpg");
  const [cylinders, setCylinders] = useState(2);
  const [mmbtu, setMmbtu] = useState(5);
  const [slabId, setSlabId] = useState<SlabId>("protectedHigh");
  const [loadId, setLoadId] = useState<LoadId>("medium");
  const [tipId, setTipId] = useState<TipId>("cooker");
  const [saved, setSaved] = useState(false);

  const slab = slabs.find((s) => s.id === slabId)!;
  const load = loads.find((l) => l.id === loadId)!;
  const tip = tips.find((t) => t.id === tipId)!;
  const isLpg = method === "lpg";

  const result = useMemo(() => {
    let variableCost: number;
    let fixedCost: number;

    if (isLpg) {
      variableCost = cylinders * CYLINDER_PRICE;
      fixedCost = cylinders * CYLINDER_DELIVERY;
    } else {
      variableCost = mmbtu * slab.rate;
      fixedCost = slab.fixed;
    }

    const current = variableCost + fixedCost;
    const optimizedVariable = variableCost * (1 - tip.saving);
    const optimized = optimizedVariable + fixedCost;
    const savings = variableCost * tip.saving;
    const savingsPct = current > 0 ? (savings / current) * 100 : 0;

    return {
      variableCost,
      fixedCost,
      current,
      optimized,
      savings,
      savingsPct,
      yearlySavings: savings * 12,
      kg: isLpg ? cylinders * CYLINDER_KG : 0,
    };
  }, [isLpg, cylinders, mmbtu, slab, tip]);

  const barMax = Math.max(result.current, 1);
  const optimizedPct = Math.max(4, (result.optimized / barMax) * 100);

  function applyLoad(l: CookingLoad) {
    setLoadId(l.id);
    setCylinders(l.cylinders);
    setMmbtu(l.mmbtu);
    setSaved(false);
  }

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Flame className="h-5 w-5" />}
        title="Cylinder vs. Pipeline Cooking Cost Calculator"
        subtitle="See what your kitchen really burns each month on LPG or Sui gas — and how small habits trim the bill."
      />

      {/* ── Live utility-rate ticker ───────────────────────── */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Receipt className="h-3.5 w-3.5 text-[var(--warning)]" /> Reference cooking-energy rates
          </p>
          <span className="text-[10px] text-muted-foreground">Indicative only</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Cylinder className="h-3 w-3" /> LPG Cylinder (11.8 kg)
            </span>
            <span className="mt-0.5 block text-sm font-bold text-foreground">Rs {CYLINDER_PRICE.toLocaleString("en-PK")}</span>
            <span className="text-[10px] text-muted-foreground">≈ Rs {CYLINDER_PER_KG.toFixed(2)}/kg</span>
          </div>
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Cable className="h-3 w-3" /> Piped Sui Gas (SSGC/SNGPL)
            </span>
            <span className="mt-0.5 block text-sm font-bold text-foreground">Rs 200 – 4,200 / MMBTU</span>
            <span className="text-[10px] text-muted-foreground">Protected to non-protected slabs + fixed charges</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* ── Inputs ─────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Your kitchen</h3>

          {/* Method selector */}
          <p className="mb-2 text-xs font-medium text-muted-foreground">Main cooking method</p>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {([
              { id: "lpg" as MethodId, name: "Mostly LPG Cylinder", icon: <Cylinder className="h-5 w-5" /> },
              { id: "pipeline" as MethodId, name: "Piped Sui Gas", icon: <Cable className="h-5 w-5" /> },
            ]).map((m) => {
              const active = m.id === method;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setSaved(false);
                  }}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className={active ? "text-primary" : "text-foreground/70"}>{m.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Cooking load / family size */}
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Household cooking load
          </p>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {loads.map((l) => {
              const active = l.id === loadId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => applyLoad(l)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Utensils className="h-3 w-3" /> {l.label}
                  </span>
                  <span className="text-[10px] font-normal opacity-70">{l.people}</span>
                </button>
              );
            })}
          </div>

          {/* Usage input — depends on method */}
          {isLpg ? (
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Cylinder className="h-3.5 w-3.5" /> Cylinders used per month
                </span>
                <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">
                  {cylinders} {cylinders === 1 ? "cylinder" : "cylinders"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={cylinders}
                onChange={(e) => {
                  setCylinders(Number(e.target.value));
                  setSaved(false);
                }}
                className="w-full accent-[var(--primary)]"
                aria-label="Cylinders used per month"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>1</span>
                <span>4</span>
              </div>
            </div>
          ) : (
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <Field label="Estimated gas units (MMBTU / month)">
                <div className="relative">
                  <Gauge className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={mmbtu}
                    onChange={(e) => {
                      setMmbtu(Number(e.target.value));
                      setSaved(false);
                    }}
                    className="input-base pl-9"
                  />
                </div>
              </Field>
              <Field label="Tariff slab">
                <select
                  value={slabId}
                  onChange={(e) => {
                    setSlabId(e.target.value as SlabId);
                    setSaved(false);
                  }}
                  className="input-base"
                >
                  {slabs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Rs {s.rate.toLocaleString("en-PK")}/MMBTU
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* Quick chips */}
          <div className="grid grid-cols-3 gap-2">
            <MiniStat
              icon={<Flame className="h-3.5 w-3.5" />}
              label={isLpg ? "Gas / month" : "Units"}
              value={isLpg ? `${result.kg.toFixed(1)} kg` : `${mmbtu} MMBTU`}
            />
            <MiniStat
              icon={<Gauge className="h-3.5 w-3.5" />}
              label="Rate"
              value={isLpg ? `Rs ${Math.round(CYLINDER_PER_KG)}/kg` : `Rs ${slab.rate}/MMBTU`}
            />
            <MiniStat
              icon={<Receipt className="h-3.5 w-3.5" />}
              label="Fixed cost"
              value={pkr(result.fixedCost)}
            />
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Monthly projection */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-[var(--warning)]" /> Monthly cooking-energy burn
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-surface p-3">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Flame className="h-3 w-3" /> Total cash burn
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--warning)]">{pkr(result.current)}</p>
              </div>
              <div className="rounded-xl border bg-surface p-3">
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Receipt className="h-3 w-3" /> Yearly projection
                </p>
                <p className="mt-1 text-2xl font-bold">{pkr(result.current * 12)}</p>
              </div>
            </div>
            {/* Fixed vs variable breakdown */}
            <div className="mt-3 space-y-1.5">
              <BreakdownRow
                label={isLpg ? "Cylinder gas cost" : "Metered gas cost"}
                value={result.variableCost}
                total={result.current}
                tone="var(--warning)"
              />
              <BreakdownRow
                label={isLpg ? "Delivery / handling" : "Fixed meter charge"}
                value={result.fixedCost}
                total={result.current}
                tone="var(--muted-foreground)"
              />
            </div>
          </div>

          {/* Tip selector */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold">Pick a kitchen fix</h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {tips.map((t) => {
                const active = t.id === tipId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTipId(t.id);
                      setSaved(false);
                    }}
                    aria-pressed={active}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-foreground/70"}>{t.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{t.short}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{tip.note}</p>
          </div>

          {/* Savings badge */}
          <div className="neon-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">This fix saves you</p>
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
              <TrendingDown className="h-4 w-4 text-primary" /> Wasteful vs. optimized cooking
            </h4>

            <div className="space-y-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Wind className="h-3.5 w-3.5 text-[var(--danger)]" /> Wasteful habit (now)
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

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    {tip.icon} With {tip.short}
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
                  {adviceFor(method, tip, load, result.savings)}
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

function BreakdownRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total > 0 ? Math.max(2, (value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground/80">{pkr(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function adviceFor(method: MethodId, tip: Tip, load: CookingLoad, savings: number) {
  const amount = pkr(savings);
  switch (tip.id) {
    case "leak":
      return `A quick soapy-water leak test on your ${method === "lpg" ? "cylinder regulator" : "meter connection"} for a ${load.label.toLowerCase()} kitchen can recover about ${amount}/month.`;
    case "cooker":
      return `Cooking daal and meat in a pressure cooker for a ${load.people} household saves close to ${amount}/month in gas.`;
    case "cookware":
      return `Matching flat pots to your burner size stops wasted heat — roughly ${amount}/month back in your pocket.`;
    default:
      return `This fix saves roughly ${amount}/month.`;
  }
}
