import { useMemo, useState } from "react";
import { Swords, Building2, Info, TrendingUp, Receipt } from "lucide-react";
import { discos, pkr } from "@/lib/awaaz-data";
import { tariffBreakdown, warRoomDiscos, type TariffComponent } from "@/lib/awaaz-tariff";
import { SectionHead, Stat } from "@/components/awaaz/BillAudit";

export function TariffWarRoom() {
  const [discoId, setDiscoId] = useState<string>("k-electric");
  const [units, setUnits] = useState(412);

  const breakdown = useMemo(() => tariffBreakdown(units, discoId), [units, discoId]);

  const discoOptions = discos.filter((d) => (warRoomDiscos as readonly string[]).includes(d.id));

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Swords className="h-5 w-5" />}
        title="Tariff War Room"
        subtitle="Demystify the hidden billing components — FPA, quarterly adjustments, GST, and surcharges — across DISCOs."
      />

      {/* DISCO region selector */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">DISCO region selector</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {discoOptions.map((d) => {
            const active = d.id === discoId;
            return (
              <button
                key={d.id}
                onClick={() => setDiscoId(d.id)}
                aria-pressed={active}
                className={`preset-chip ${active ? "preset-chip-active" : ""}`}
              >
                <span className="text-sm font-bold">{d.name}</span>
                <span className="text-xs text-muted-foreground">{d.city}</span>
                <span className="mt-1 text-xs font-semibold text-primary">
                  Tax: {Math.round(d.taxRate * 100)}% · Fixed: {pkr(d.fixedCharges)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Monthly units (kWh)</span>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="input-base"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Quick adjust</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </label>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Energy cost" value={pkr(breakdown.energyCost)} />
        <Stat label="FPA + Quarterly" value={pkr(breakdown.fpa + breakdown.quarterlyAdjustment)} />
        <Stat label="GST + Surcharges" value={pkr(breakdown.gst + breakdown.surcharges)} />
        <Stat label="Total bill" value={pkr(breakdown.total)} accent />
      </div>

      {/* Visual breakdown bars */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Bill component breakdown — {breakdown.disco.name}</h3>
        </div>

        {/* Stacked bar */}
        <div className="mb-6">
          <div className="flex h-8 overflow-hidden rounded-lg">
            {breakdown.components.map((c) => (
              <div
                key={c.id}
                className={`${c.color} transition-all duration-700`}
                style={{ width: `${c.pct}%` }}
                title={`${c.label}: ${pkr(c.amount)} (${Math.round(c.pct)}%)`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {breakdown.components.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded ${c.color}`} />
                <span className="text-muted-foreground">{c.label}</span>
                <span className="font-semibold">{Math.round(c.pct)}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* Individual component bars */}
        <div className="space-y-4">
          {breakdown.components.map((c) => (
            <ComponentBar key={c.id} component={c} total={breakdown.total} />
          ))}
        </div>
      </div>

      {/* Hidden charges callout */}
      <div className="warn-card p-5">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-semibold">Hidden charges you're paying</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs font-semibold text-amber-400">Fuel Price Adjustment (FPA)</p>
            <p className="mt-1 text-2xl font-bold">{pkr(breakdown.fpa)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Set monthly by NEPRA based on international fuel prices. You can't control it, but it fluctuates — check your bill each month.
            </p>
          </div>
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs font-semibold text-amber-400">Quarterly Tariff Adjustment</p>
            <p className="mt-1 text-2xl font-bold">{pkr(breakdown.quarterlyAdjustment)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              NEPRA revises this every 3 months. It's added on top of your slab rate without changing the slab label on your bill.
            </p>
          </div>
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs font-semibold text-rose-400">GST (18%)</p>
            <p className="mt-1 text-2xl font-bold">{pkr(breakdown.gst)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied on energy cost + FPA + quarterly adjustment. The tax compounds on the hidden charges too.
            </p>
          </div>
          <div className="rounded-xl bg-background/40 p-4">
            <p className="text-xs font-semibold text-violet-400">Misc. Surcharges</p>
            <p className="mt-1 text-2xl font-bold">{pkr(breakdown.surcharges)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              TV license fee, radio fee, meter rent, and other small charges that add up every month.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            On a {units} kWh bill with {breakdown.disco.name}, you pay{" "}
            <strong className="text-amber-400">
              {pkr(breakdown.total - breakdown.energyCost - breakdown.fixedCharges)}
            </strong>{" "}
            in charges beyond the actual electricity you consumed — that's{" "}
            <strong className="text-amber-400">
              {Math.round(((breakdown.total - breakdown.energyCost - breakdown.fixedCharges) / breakdown.total) * 100)}%
            </strong>{" "}
            of your total bill.
          </p>
        </div>
      </div>
    </div>
  );
}

function ComponentBar({ component, total }: { component: TariffComponent; total: number }) {
  const pct = total > 0 ? (component.amount / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded ${component.color}`} />
          <span className="font-medium">{component.label}</span>
        </span>
        <span className="font-semibold">
          {pkr(component.amount)} <span className="text-xs font-normal text-muted-foreground">({Math.round(pct)}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${component.color} transition-all duration-700`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{component.description}</p>
    </div>
  );
}
