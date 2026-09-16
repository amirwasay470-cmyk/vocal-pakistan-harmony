import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Store,
  Building2,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  CreditCard,
  Banknote,
  Star,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { pkr, type City } from "@/lib/awaaz-data";
import {
  SOURCING_CHANNELS,
  STANDARD_WEEKLY_BASKET,
  calculateChannelBasket,
  type ChannelId,
  type BasketItem,
} from "@/lib/awaaz-market-intel";

type Props = {
  city: City;
  customBasketItems?: BasketItem[];
  onRemoveCustomItem?: (id: string) => void;
  onOpenAddModal?: () => void;
};

export function BazaarChannelComparison({
  city,
  customBasketItems = [],
  onRemoveCustomItem,
  onOpenAddModal,
}: Props) {
  // Selected view channel for detailed card
  const [activeChannelId, setActiveChannelId] = useState<ChannelId>("itwar_bazaar");

  // User-customizable basket item quantities
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    STANDARD_WEEKLY_BASKET.forEach((item) => {
      init[item.id] = item.defaultQty;
    });
    customBasketItems.forEach((item) => {
      init[item.id] = item.defaultQty;
    });
    return init;
  });

  // Keep quantities updated if new custom items are added
  useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };
      let changed = false;
      customBasketItems.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = item.defaultQty;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [customBasketItems]);

  const allBasketItems = [...STANDARD_WEEKLY_BASKET, ...customBasketItems];

  const basketResults = calculateChannelBasket(city, quantities, customBasketItems);

  const itwarTotal = basketResults.itwar_bazaar.total;
  const kiranaTotal = basketResults.kirana.total;
  const superTotal = basketResults.superstore.total;

  const minTotal = Math.min(itwarTotal, kiranaTotal, superTotal);
  const maxTotal = Math.max(itwarTotal, kiranaTotal, superTotal);
  const weeklySavingVsKirana = Math.max(0, kiranaTotal - itwarTotal);
  const monthlySavingVsKirana = Math.round(weeklySavingVsKirana * 4.2);
  const monthlySavingVsSuper = Math.round(Math.max(0, superTotal - itwarTotal) * 4.2);

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const resetQuantities = () => {
    const init: Record<string, number> = {};
    STANDARD_WEEKLY_BASKET.forEach((item) => {
      init[item.id] = item.defaultQty;
    });
    setQuantities(init);
  };

  const channels: ChannelId[] = ["itwar_bazaar", "kirana", "superstore"];

  return (
    <div className="tab-enter space-y-6">
      {/* ── Top Summary & Savings Showcase ────────────────────── */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <span className="status-badge">Automated Weekly Basket Intelligence</span>
            <h3 className="mt-1 text-lg font-bold text-foreground">
              Hyperlocal Sourcing Channel Comparison · {city}
            </h3>
            <p className="text-xs text-muted-foreground">
              Real household basket contrasted across Sunday Bazaars, Corner Kiryana, and
              Supermarkets
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary">
              <TrendingDown className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Potential Monthly Savings
              </span>
              <span className="text-base font-extrabold text-primary">
                {pkr(monthlySavingVsKirana)} to {pkr(monthlySavingVsSuper)}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Channels Comparison Cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {channels.map((chId) => {
            const ch = SOURCING_CHANNELS[chId];
            const basket = basketResults[chId];
            const isCheapest = basket.total === minTotal;
            const isPriciest = basket.total === maxTotal;
            const isSelected = activeChannelId === chId;

            return (
              <div
                key={chId}
                onClick={() => setActiveChannelId(chId)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                    : isCheapest
                      ? "border-emerald-500/40 bg-card hover:border-emerald-500/60"
                      : "border-border/80 bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-xl ${
                        isCheapest
                          ? "bg-primary/20 text-primary"
                          : chId === "kirana"
                            ? "bg-[var(--warning)]/15 text-[var(--warning)]"
                            : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {chId === "itwar_bazaar" ? (
                        <ShoppingBag className="h-4 w-4" />
                      ) : chId === "kirana" ? (
                        <Store className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{ch.name}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{ch.tagline}</p>
                    </div>
                  </div>

                  {isCheapest && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Cheapest
                    </span>
                  )}
                  {isPriciest && (
                    <span className="rounded-full bg-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Highest
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[11px] text-muted-foreground block">
                    Weekly Basket Cost
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-foreground">
                      {pkr(basket.total)}
                    </span>
                    {chId !== "itwar_bazaar" && (
                      <span className="text-xs font-semibold text-[var(--warning)]">
                        +{pkr(basket.total - minTotal)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
                  <span>Convenience: {ch.convenienceRating}/5</span>
                  <span className="font-medium text-primary">View channel profile →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Channel Detailed Profile */}
        {activeChannelId && (
          <div className="mt-4 rounded-xl border border-primary/25 bg-surface/70 p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {SOURCING_CHANNELS[activeChannelId].name} Profile
                </span>
                <span className="text-muted-foreground">
                  ({SOURCING_CHANNELS[activeChannelId].examples.join(", ")})
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" /> Quality:{" "}
                  {SOURCING_CHANNELS[activeChannelId].qualityRating}/5
                </span>
                <span className="flex items-center gap-1">
                  {activeChannelId === "superstore" ? (
                    <CreditCard className="h-3 w-3 text-primary" />
                  ) : (
                    <Banknote className="h-3 w-3 text-primary" />
                  )}
                  {SOURCING_CHANNELS[activeChannelId].paymentModes}
                </span>
              </div>
            </div>

            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Best For:</span>
                <p className="mt-0.5 text-muted-foreground">
                  {SOURCING_CHANNELS[activeChannelId].bestFor}
                </p>
              </div>
              <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
                <span className="font-bold text-[var(--warning)]">Trade-off / Drawbacks:</span>
                <p className="mt-0.5 text-muted-foreground">
                  {SOURCING_CHANNELS[activeChannelId].drawbacks}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Interactive Weekly Basket Customizer & Itemized Breakdown ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h4 className="text-base font-bold text-foreground">
              Standard Weekly Household Basket
            </h4>
            <p className="text-xs text-muted-foreground">
              Adjust weekly quantities (+/-) for a 4-6 person Pakistani household to see tailored
              totals
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="btn-primary py-1.5 px-3 text-xs font-bold shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom Item
              </button>
            )}
            <button type="button" onClick={resetQuantities} className="btn-ghost py-1.5 px-3 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Basket
            </button>
          </div>
        </div>

        {/* Itemized Comparison Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-2.5 font-semibold">Commodity Item</th>
                <th className="pb-2.5 font-semibold text-center">Weekly Quantity</th>
                <th className="pb-2.5 font-semibold text-right">Itwar Bazaar</th>
                <th className="pb-2.5 font-semibold text-right">Neighborhood Kirana</th>
                <th className="pb-2.5 font-semibold text-right">Supermarket</th>
                <th className="pb-2.5 font-semibold text-right text-primary">Best Saving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {allBasketItems.map((item) => {
                const qty = quantities[item.id] ?? 0;
                const baseRate = item.baseRatePerUnit[city] ?? 100;
                const isCustom = item.id.startsWith("custom-");

                const itwarUnit = Math.round(
                  baseRate *
                    (item.id.includes("atta") ||
                    item.id.includes("sugar") ||
                    item.id.includes("daal") ||
                    item.id.includes("rice") ||
                    item.id.includes("milk") ||
                    item.id.includes("tea")
                      ? 0.9
                      : item.id.includes("chicken") || item.id.includes("meat")
                        ? 0.88
                        : item.id.includes("oil")
                          ? 0.94
                          : 0.72),
                );
                const kiranaUnit = baseRate;
                const superUnit = Math.round(
                  baseRate *
                    (item.id.includes("atta") ||
                    item.id.includes("sugar") ||
                    item.id.includes("daal") ||
                    item.id.includes("rice") ||
                    item.id.includes("milk") ||
                    item.id.includes("tea")
                      ? 0.96
                      : item.id.includes("chicken") || item.id.includes("meat")
                        ? 1.08
                        : item.id.includes("oil")
                          ? 0.98
                          : 1.32),
                );

                const itwarLine = itwarUnit * qty;
                const kiranaLine = kiranaUnit * qty;
                const superLine = superUnit * qty;
                const savingLine = Math.max(kiranaLine, superLine) - itwarLine;

                return (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            {isCustom && (
                              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {item.urdu} · per {item.unit}
                          </p>
                        </div>
                        {isCustom && onRemoveCustomItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveCustomItem(item.id)}
                            className="ml-auto text-muted-foreground hover:text-rose-500 p-1 transition"
                            title="Remove custom item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
                          aria-label={`Reduce ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-foreground">
                          {qty} {item.unit.split(" ")[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {pkr(itwarLine)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        @{pkr(itwarUnit)}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <span className="font-medium text-foreground">{pkr(kiranaLine)}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        @{pkr(kiranaUnit)}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <span className="font-medium text-foreground">{pkr(superLine)}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        @{pkr(superUnit)}
                      </span>
                    </td>

                    <td className="py-3 pl-2 text-right">
                      <span className="font-bold text-primary">+{pkr(savingLine)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary/30 font-bold">
                <td className="pt-3 pb-1 text-sm font-extrabold text-foreground">
                  Total Weekly Basket
                </td>
                <td className="pt-3 pb-1 text-center text-xs text-muted-foreground">
                  Combined List
                </td>
                <td className="pt-3 pb-1 text-right text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {pkr(itwarTotal)}
                </td>
                <td className="pt-3 pb-1 text-right text-sm font-extrabold text-foreground">
                  {pkr(kiranaTotal)}
                </td>
                <td className="pt-3 pb-1 text-right text-sm font-extrabold text-foreground">
                  {pkr(superTotal)}
                </td>
                <td className="pt-3 pb-1 text-right text-sm font-extrabold text-primary">
                  {pkr(weeklySavingVsKirana)}/wk
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tactical Recommendation Callout */}
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-foreground">Awaaz Smart Sourcing Blueprint:</span>
              <p className="text-muted-foreground leading-relaxed">
                Do not buy all items from a single store. Procure{" "}
                <strong>fresh vegetables & poultry</strong> from Sunday / Model Bazaars (saving up
                to 35% on perishable items), buy <strong>packaged dry staples & cooking oil</strong>{" "}
                in monthly bulk from hypermarkets (utilizing card discounts & bundle savings), and
                reserve <strong>local kiryana shops</strong> strictly for daily bread and emergency
                milk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
