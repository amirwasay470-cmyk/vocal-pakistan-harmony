import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Flame,
  Wheat,
  Drumstick,
  Droplets,
  Carrot,
  Building2,
  Store,
  Info,
  Scale,
  Plus,
  Trash2,
} from "lucide-react";
import { pkr, type City } from "@/lib/awaaz-data";
import { ESSENTIAL_COMMODITIES, type EssentialCommodity } from "@/lib/awaaz-market-intel";
import { usePersistentState } from "@/lib/use-persistent-state";
import { ShareReportButton } from "@/components/awaaz/ShareReportButton";

type Props = {
  city: City;
  onCityChange: (c: City) => void;
  customItems?: EssentialCommodity[];
  onRemoveCustomItem?: (id: string) => void;
  onOpenAddModal?: () => void;
};

export function DailyCommodityRateBoard({
  city,
  onCityChange,
  customItems = [],
  onRemoveCustomItem,
  onOpenAddModal,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    atta: "10kg",
    chicken: "meat",
  });
  const [weightUnit, setWeightUnit] = usePersistentState<"kg" | "pau" | "mann">(
    "awaaz_market_weight_unit",
    "kg",
  );

  const allItems = [...ESSENTIAL_COMMODITIES, ...customItems];

  const filtered = allItems.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  const toggleVariant = (itemId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variantId }));
  };

  const getCategoryIcon = (cat: EssentialCommodity["category"]) => {
    switch (cat) {
      case "staple":
        return <Wheat className="h-4 w-4" />;
      case "poultry":
        return <Drumstick className="h-4 w-4" />;
      case "oil":
        return <Droplets className="h-4 w-4" />;
      case "vegetable":
        return <Carrot className="h-4 w-4" />;
    }
  };

  return (
    <div className="tab-enter space-y-5">
      {/* City selector, weight unit shortcut and filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary" />
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value as City)}
              className="input-base min-h-10 pl-9 pr-8 text-xs font-semibold"
            >
              <option value="Karachi">Karachi Division</option>
              <option value="Lahore">Lahore District</option>
              <option value="Islamabad">Islamabad Capital Territory</option>
            </select>
          </div>

          {/* Smart Weight Unit Toggle Shortcut */}
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface/80 p-1 text-xs font-semibold">
            <Scale className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground mr-1">Unit:</span>
            <button
              type="button"
              onClick={() => setWeightUnit("kg")}
              className={`rounded-md px-2 py-0.5 text-xs transition ${
                weightUnit === "kg"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              1 KG (کلو)
            </button>
            <button
              type="button"
              onClick={() => setWeightUnit("pau")}
              className={`rounded-md px-2 py-0.5 text-xs transition ${
                weightUnit === "pau"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pau (پاؤ)
            </button>
            <button
              type="button"
              onClick={() => setWeightUnit("mann")}
              className={`rounded-md px-2 py-0.5 text-xs transition ${
                weightUnit === "mann"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mann (من / 40kg)
            </button>
          </div>
        </div>

        {/* Share Daily Bazaar Rate Sheet & Add Custom Item */}
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
          <ShareReportButton
            title={`Daily Bazaar Price Basket (${city})`}
            urduTitle="روزانہ سرکاری ریٹ لسٹ و مارکیٹ بھاؤ"
            category="bazaar"
            totalCostLabel="DC Rate Basket vs Open Market"
            totalCostValue={`Live Verified (${city})`}
            advice="Morning Mandi arrivals (6 AM - 8 AM) provide best vegetable rates. Check official DC price app before paying retail vendors."
            breakdown={filtered.slice(0, 5).map((item) => {
              const r = item.rates[city];
              return {
                label: `${item.name} (${item.urdu})`,
                value: `DC: Rs. ${r.dcOfficial}/${item.unit} · Market: Rs. ${r.openMarket}/${item.unit}`,
              };
            })}
          />
        </div>

        {/* Filter categories */}
        <div className="w-full flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-surface/80 p-1 text-xs">
          {[
            { id: "all", label: "All Essentials" },
            { id: "staple", label: "Flour & Sugar" },
            { id: "vegetable", label: "Vegetables" },
            { id: "poultry", label: "Poultry" },
            { id: "oil", label: "Cooking Oil" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                categoryFilter === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {filtered.map((item) => {
          const rateData = item.rates[city];
          const activeVariantId = selectedVariants[item.id];
          const activeVariant = item.variants?.find((v) => v.id === activeVariantId);
          const multiplier = activeVariant?.multiplier ?? 1;

          const isPerKg = item.unit === "kg" && !activeVariant;
          const unitScale = isPerKg
            ? weightUnit === "pau"
              ? 0.25
              : weightUnit === "mann"
                ? 40
                : 1
            : 1;

          const displayUnit = isPerKg
            ? weightUnit === "pau"
              ? "250g (پاؤ)"
              : weightUnit === "mann"
                ? "40kg (من)"
                : "1 kg (کلو)"
            : (activeVariant?.unit ?? item.unit);

          const dcRate = Math.round(rateData.dcOfficial * multiplier * unitScale);
          const marketRate = Math.round(rateData.openMarket * multiplier * unitScale);
          const diffPct = Math.round(((marketRate - dcRate) / Math.max(1, dcRate)) * 100);

          const isSurge = rateData.supplyStatus === "surge";
          const isModerating = rateData.supplyStatus === "moderating";

          return (
            <div
              key={item.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 ${
                isSurge
                  ? "border-[var(--warning)]/40 ring-1 ring-[var(--warning)]/20"
                  : "border-border/80"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                    {getCategoryIcon(item.category)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold tracking-tight text-foreground">
                        {item.name}
                      </h4>
                      {item.id.startsWith("custom-") && (
                        <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.urdu} ·{" "}
                      <span className="font-medium text-foreground/80">{displayUnit}</span>
                    </p>
                  </div>
                </div>

                {/* Status indicator or Delete button for custom */}
                <div className="flex items-center gap-1.5">
                  {item.id.startsWith("custom-") && onRemoveCustomItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveCustomItem(item.id)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition"
                      title="Remove custom item"
                      aria-label={`Remove custom item ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {isSurge ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/15 px-2.5 py-0.5 text-[11px] font-bold text-[var(--warning)]">
                      <Flame className="h-3 w-3" /> Surge
                    </span>
                  ) : isModerating ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="h-3 w-3" /> Easing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <CheckCircle2 className="h-3 w-3" /> Stable
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Toggles (e.g. 10kg vs 20kg, Meat vs Live) */}
              {item.variants && (
                <div className="mt-3 flex gap-1.5 rounded-lg border border-border/70 bg-surface/70 p-1 text-xs">
                  {item.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVariant(item.id, v.id)}
                      className={`flex-1 rounded-md py-1 text-center text-xs font-semibold transition ${
                        activeVariantId === v.id
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Dual Rates Comparison Display */}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-surface/50 p-3">
                {/* Official DC Rate */}
                <div className="border-r border-border/60 pr-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-3 w-3" /> DC Official Rate
                  </div>
                  <p className="mt-1 text-base font-bold text-foreground">{pkr(dcRate)}</p>
                  <p
                    className="text-[10px] text-muted-foreground line-clamp-1"
                    title={rateData.dcNote}
                  >
                    {rateData.dcNote}
                  </p>
                </div>

                {/* Open Market Retail Rate */}
                <div className="pl-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--warning)]">
                    <Store className="h-3 w-3" /> Open Market
                  </div>
                  <p className="mt-1 text-base font-bold text-[var(--warning)]">
                    {pkr(marketRate)}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-[var(--warning)]">+{diffPct}%</span> vs DC
                    cap
                  </div>
                </div>
              </div>

              {/* Weekly Trend Indicator & Micro Note */}
              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                <div className="flex items-center gap-1">
                  {rateData.weeklyChangePct > 0 ? (
                    <span className="flex items-center gap-0.5 font-bold text-rose-500 text-[11px]">
                      <TrendingUp className="h-3.5 w-3.5" /> +{rateData.weeklyChangePct}% 7-day
                    </span>
                  ) : rateData.weeklyChangePct < 0 ? (
                    <span className="flex items-center gap-0.5 font-bold text-emerald-500 text-[11px]">
                      <TrendingDown className="h-3.5 w-3.5" /> {rateData.weeklyChangePct}% 7-day
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 font-medium text-muted-foreground text-[11px]">
                      <Minus className="h-3.5 w-3.5" /> 0.0% 7-day
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] text-muted-foreground text-right truncate max-w-[140px]"
                  title={rateData.marketNote}
                >
                  {rateData.marketNote}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <span className="font-semibold text-foreground">
            District Administration (DC) Rate Notice:
          </span>{" "}
          DC official price lists are published daily by municipal authorities and enforce price
          ceilings at government-authorized Model Bazaars and Utility Stores. Open market retail
          rates reflect street thelas, independent kiryana grocers, and supermarkets where transport
          margins apply.
        </div>
      </div>
    </div>
  );
}
