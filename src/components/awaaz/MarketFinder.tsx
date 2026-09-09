import { useState } from "react";
import {
  ShoppingBasket,
  MapPin,
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
} from "lucide-react";
import { cities, groceries, pkr, type City } from "@/lib/awaaz-data";
import { buildPriceCard, routingAdvice, type PriceCard } from "@/lib/awaaz-market";
import { SectionHead, EmptyState, Stat } from "./BillAudit";

type ListEntry = { key: string; name: string; qty: number; card: PriceCard };

const starters = ["Atta", "Sugar", "Tomatoes", "Dahi (Yogurt)", "Cooking Oil", "Daal Chana", "Chicken", "Milk"];

export function MarketFinder() {
  const [city, setCity] = useState<City>("Karachi");
  const [view, setView] = useState<"compare" | "list">("compare");
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
      if (found)
        return l.map((e) => (e.key === card.id ? { ...e, qty: e.qty + 1 } : e));
      return [...l, { key: card.id, name: card.name, qty: 1, card }];
    });
  };

  const setQty = (key: string, delta: number) =>
    setList((l) =>
      l
        .map((e) => (e.key === key ? { ...e, qty: e.qty + delta } : e))
        .filter((e) => e.qty > 0),
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

  // Shopping list maths
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
        title="Local Market Grocery Value Finder"
        subtitle="Search any grocery item and compare mandi, khula bazaar, utility store, kiryana and supermarket rates."
      />

      <div className="flex gap-2 rounded-2xl border bg-card p-1.5 shadow-sm">
        {(
          [
            { id: "compare", label: "Compare Prices", icon: Search },
            { id: "list", label: `My Shopping List${list.length ? ` (${list.length})` : ""}`, icon: ListChecks },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {view === "compare" ? (
        <div className="tab-enter space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
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
                  Search any grocery
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Dahi, sarson oil, daal chana…"
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
                  className="min-h-9 rounded-full border bg-surface px-3.5 py-1.5 text-sm transition-all hover:bg-secondary active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={reset} className="btn-ghost min-h-11">
                <RotateCcw className="h-4 w-4" /> Reset
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
                        <h4 className="truncate text-base font-semibold tracking-tight">{card.name}</h4>
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
                      Verified {card.verifiedMinutesAgo} minutes ago by {card.verifierName} in {city}
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
                      <button
                        onClick={() => addToList(card)}
                        className="btn-primary min-h-11"
                      >
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
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Your shopping list is empty"
          text="Search an item under “Compare Prices” and tap “Add to Shopping List” to build your trip plan."
        />
      ) : (
        <div className="tab-enter space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Smart basket total" value={pkr(bestTotal)} />
            <Stat label="If bought nearby" value={pkr(worstTotal)} />
            <Stat label="You save" value={pkr(worstTotal - bestTotal)} accent />
            <Stat label="Stops needed" value={String(Object.keys(stops).length)} />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">Items</h3>
            <div className="space-y-2">
              {list.map((e) => (
                <div
                  key={e.key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-surface/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.card.options[0]!.market} · {pkr(e.card.options[0]!.price)} / {e.card.unit}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setQty(e.key, -1)}
                      aria-label={`Reduce ${e.name}`}
                      className="grid h-11 w-11 place-items-center rounded-lg border transition-all hover:bg-secondary active:scale-95"
                    >
                      {e.qty === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{e.qty}</span>
                    <button
                      onClick={() => setQty(e.key, 1)}
                      aria-label={`Add ${e.name}`}
                      className="grid h-11 w-11 place-items-center rounded-lg border transition-all hover:bg-secondary active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <Route className="h-4 w-4 text-primary" /> Your cheapest route in {city}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Staples at the utility store or sasta bazaar, fresh produce at the khula bazaar.
            </p>
            <div className="space-y-3">
              {Object.entries(stops)
                .sort((a, b) => a[1].km - b[1].km)
                .map(([market, s], i) => (
                  <div key={market} className="rounded-xl border bg-surface/50 p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold">
                        Stop {i + 1}: {market}
                      </p>
                      <p className="shrink-0 text-sm font-bold">{pkr(s.total)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.km} km away</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.items.map((e) => (
                        <span
                          key={e.key}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {e.name} × {e.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <p className="rounded-2xl bg-primary/10 p-4 text-sm">
            Shopping this route saves <strong>{pkr(worstTotal - bestTotal)}</strong> this trip — about{" "}
            <strong>{pkr((worstTotal - bestTotal) * 4)}</strong> a month. Rates are community-shared
            sample prices for {city}, meant for comparison rather than live billing.
          </p>

          <button onClick={reset} className="btn-ghost min-h-11">
            <RotateCcw className="h-4 w-4" /> Clear everything
          </button>
        </div>
      )}
    </div>
  );
}

export const knownGroceryNames = groceries.map((g) => g.name);
