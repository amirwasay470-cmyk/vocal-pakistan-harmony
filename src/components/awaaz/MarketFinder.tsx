import { useState } from "react";
import {
  ShoppingBasket,
  Search,
  RotateCcw,
  Award,
  Minus,
  Plus,
  BadgeCheck,
  Flag,
  Check,
  ListChecks,
  Trash2,
  Route,
  Sparkles,
  ShoppingBag,
  Scale,
  MapPin,
} from "lucide-react";
import { cities, pkr, type City } from "@/lib/awaaz-data";
import { buildPriceCard, routingAdvice, type PriceCard } from "@/lib/awaaz-market";
import { SectionHead, EmptyState, Stat } from "./BillAudit";
import { DailyCommodityRateBoard } from "./DailyCommodityRateBoard";
import { BazaarChannelComparison } from "./BazaarChannelComparison";
import { MarketInflationAdvisor } from "./MarketInflationAdvisor";

type ListEntry = { key: string; name: string; qty: number; card: PriceCard };

const starters = [
  "Atta",
  "Sugar",
  "Tomatoes",
  "Dahi (Yogurt)",
  "Cooking Oil",
  "Daal Chana",
  "Chicken",
  "Milk",
];

export function MarketFinder() {
  const [city, setCity] = useState<City>("Karachi");
  const [view, setView] = useState<"rate_board" | "bazaar_comparison" | "advisor" | "search_route">(
    "rate_board",
  );
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<PriceCard[]>([]);
  const [list, setList] = useState<ListEntry[]>([]);
  const [reported, setReported] = useState<Record<string, string>>({});

  const search = (raw: string) => {
    const term = raw.trim();
    if (!term) return;
    const card = buildPriceCard(term, city);
    setCards((c) => [card, ...c.filter((x) => x.id !== card.id)]);
    setQuery("");
  };

  const addToList = (card: PriceCard) => {
    setList((l) => {
      const found = l.find((e) => e.key === card.id);
      if (found) return l.map((e) => (e.key === card.id ? { ...e, qty: e.qty + 1 } : e));
      return [...l, { key: card.id, name: card.name, qty: 1, card }];
    });
  };

  const setQty = (key: string, delta: number) =>
    setList((l) =>
      l.map((e) => (e.key === key ? { ...e, qty: e.qty + delta } : e)).filter((e) => e.qty > 0),
    );

  const reset = () => {
    setCity("Karachi");
    setQuery("");
    setCards([]);
    setList([]);
    setReported({});
  };

  const report = (card: PriceCard) =>
    setReported((r) => ({
      ...r,
      [card.id]: `Shukriya! Your price update for ${card.name} in ${city} is queued for community review.`,
    }));

  // Shopping list calculations
  const bestTotal = list.reduce((s, e) => s + e.card.options[0]!.price * e.qty, 0);
  const worstTotal = list.reduce(
    (s, e) => s + e.card.options[e.card.options.length - 1]!.price * e.qty,
    0,
  );
  const stops: Record<string, { items: ListEntry[]; total: number; km: number }> = {};
  list.forEach((e) => {
    const best = e.card.options[0]!;
    const stop = (stops[best.market] ??= { items: [], total: 0, km: best.distanceKm });
    stop.items.push(e);
    stop.total += best.price * e.qty;
  });

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<ShoppingBasket className="h-5 w-5" />}
        title="Hyperlocal Grocery & Inflation Intelligence Dashboard"
        subtitle="Track daily DC official vs open market essentials, compare Sunday Bazaars vs Supermarkets, and receive AI inflation surge & seasonal substitution advice."
      />

      {/* Main View Navigation Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-2 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgb(0,0,0,0.4)]">
        {(
          [
            {
              id: "rate_board",
              label: "Daily Rate Board",
              icon: Scale,
              badge: "DC vs Market",
            },
            {
              id: "bazaar_comparison",
              label: "Bazaar vs Superstore",
              icon: ShoppingBag,
              badge: "Weekly Basket",
            },
            {
              id: "advisor",
              label: "AI Inflation Advisor",
              icon: Sparkles,
              badge: "Seasonal Swaps",
            },
            {
              id: "search_route",
              label: `Search & Route${list.length ? ` (${list.length})` : ""}`,
              icon: Search,
              badge: "Item Lookup",
            },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] sm:text-sm ${
                active
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "border border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-slate-900/60 hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400 animate-pulse" : ""}`}
              />
              <div className="flex flex-col items-start text-left">
                <span className="leading-tight">{t.label}</span>
                <span
                  className={`text-[9px] font-semibold leading-none ${
                    active ? "text-emerald-400/90" : "text-slate-500"
                  }`}
                >
                  {t.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tab View 1: Daily Essential Commodity Rate Board ────── */}
      {view === "rate_board" && <DailyCommodityRateBoard city={city} onCityChange={setCity} />}

      {/* ── Tab View 2: Bazaar vs Superstore Price Comparison ─── */}
      {view === "bazaar_comparison" && <BazaarChannelComparison city={city} />}

      {/* ── Tab View 3: AI Inflation Surge & Seasonal Advisor ──── */}
      {view === "advisor" && <MarketInflationAdvisor city={city} />}

      {/* ── Tab View 4: Grocery Search & Shopping Route Planner ─ */}
      {view === "search_route" && (
        <div className="tab-enter space-y-6">
          <div className="dashboard-card p-6">
            <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">City</span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={city}
                    onChange={(e) => {
                      const c = e.target.value as City;
                      setCity(c);
                      setCards((prev) => prev.map((p) => buildPriceCard(p.name, c)));
                    }}
                    className="input-base min-h-11 pl-9"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  search(query);
                }}
                className="block"
              >
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Search any grocery item across all local points
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Dahi, sarson oil, daal chana, basmati rice…"
                      className="input-base min-h-11 pl-9"
                    />
                  </div>
                  <button type="submit" className="btn-primary min-h-11 shrink-0 px-4">
                    Check
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => search(s)}
                  className="min-h-9 rounded-full border bg-surface px-3.5 py-1.5 text-xs transition-all hover:bg-secondary active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={reset} className="btn-ghost min-h-11">
                <RotateCcw className="h-4 w-4" /> Reset Search
              </button>
            </div>
          </div>

          {cards.length === 0 ? (
            <EmptyState
              icon={<ShoppingBasket className="h-6 w-6" />}
              title="Nothing searched yet"
              text="Type any item — yogurt, sarson ka tel, daal moong — and we'll build a price breakdown for your city."
            />
          ) : (
            <div className="space-y-4">
              {cards.map((card) => {
                const best = card.options[0]!;
                const worst = card.options[card.options.length - 1]!;
                const inList = list.some((e) => e.key === card.id);
                return (
                  <div key={card.id} className="tab-enter rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold tracking-tight">
                          {card.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {card.urdu !== "—" ? `${card.urdu} · ` : ""}
                          {card.unit} · {city}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        saves {pkr(worst.price - best.price)}
                      </span>
                    </div>

                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified {card.verifiedMinutesAgo} minutes ago by {card.verifierName} in{" "}
                      {city}
                    </p>

                    <div className="mt-3 space-y-2">
                      {card.options.map((o, i) => (
                        <div
                          key={o.market}
                          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 transition-colors ${
                            i === 0 ? "border-primary/50 bg-primary/5" : "bg-surface/50"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                              {i === 0 && <Award className="h-4 w-4 shrink-0 text-saffron" />}
                              <span className="truncate">{o.market}</span>
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {o.distanceKm} km away · {o.note}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold">{pkr(o.price)}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-xs">
                      {routingAdvice(card.category)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => addToList(card)} className="btn-primary min-h-11">
                        {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {inList ? "Added — add one more" : "Add to Shopping List"}
                      </button>
                      <button onClick={() => report(card)} className="btn-ghost min-h-11">
                        <Flag className="h-4 w-4" /> Report Local Price Change
                      </button>
                    </div>

                    {reported[card.id] && (
                      <p className="tab-enter mt-3 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                        {reported[card.id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Shopping Trip Summary if items in list */}
          {list.length > 0 && (
            <div className="tab-enter space-y-4 rounded-2xl border border-primary/30 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <h4 className="text-base font-bold text-foreground">
                    Custom Shopping Trip Optimizer ({list.length} items)
                  </h4>
                </div>
                <button
                  onClick={() => setList([])}
                  className="text-xs text-muted-foreground hover:text-rose-500 transition"
                >
                  Clear Trip List
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Smart basket total" value={pkr(bestTotal)} />
                <Stat label="If bought nearby" value={pkr(worstTotal)} />
                <Stat label="You save" value={pkr(worstTotal - bestTotal)} accent />
                <Stat label="Stops needed" value={String(Object.keys(stops).length)} />
              </div>

              <div className="space-y-2">
                {list.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-surface/50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Best at {entry.card.options[0]!.market} ·{" "}
                        {pkr(entry.card.options[0]!.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(entry.key, -1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border bg-surface hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{entry.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(entry.key, 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border bg-surface hover:bg-secondary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Route className="h-4 w-4" /> Recommended Multi-Stop Trip
                </div>
                <div className="mt-3 space-y-2">
                  {Object.entries(stops).map(([marketName, s], i) => (
                    <div key={marketName} className="rounded-lg bg-card/60 p-2.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>
                          Stop {i + 1}: {marketName}
                        </span>
                        <span className="text-primary">{pkr(s.total)}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {s.km} km away · {s.items.map((it) => `${it.name} (${it.qty})`).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
