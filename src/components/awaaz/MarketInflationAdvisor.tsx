import { useState } from "react";
import {
  Sparkles,
  Flame,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ChefHat,
  Calendar,
  Send,
  Languages,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { pkr, type City } from "@/lib/awaaz-data";
import {
  INFLATION_ALERTS,
  SEASONAL_PRODUCE_CALENDAR,
  getMarketAdvisorAdvice,
  type MarketAdvisorResponse,
} from "@/lib/awaaz-market-intel";

type Props = {
  city: City;
};

const SUGGESTED_QUERIES = [
  "Tomatoes are 150/kg, what to substitute?",
  "How to cut poultry cost without losing protein?",
  "Where should I buy this week's ration in " + "my city?",
  "Cooking oil conservation tips",
  "Cheapest seasonal sabzi this month",
];

export function MarketInflationAdvisor({ city }: Props) {
  const [lang, setLang] = useState<"urdu" | "roman">("roman");
  const [inputQuery, setInputQuery] = useState("");
  const [activeAdvice, setActiveAdvice] = useState<MarketAdvisorResponse>(() =>
    getMarketAdvisorAdvice("general", city),
  );
  const [selectedAlertId, setSelectedAlertId] = useState<string>("tomato-surge");

  const handleQuery = (queryText: string) => {
    const res = getMarketAdvisorAdvice(queryText, city);
    setActiveAdvice(res);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    handleQuery(inputQuery);
    setInputQuery("");
  };

  const activeAlert =
    INFLATION_ALERTS.find((a) => a.id === selectedAlertId) ?? INFLATION_ALERTS[0]!;

  return (
    <div className="tab-enter space-y-6">
      {/* ── Interactive AI Market Advisor Card ────────────────── */}
      <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  AI Inflation Surge & Seasonal Substitution Advisor
                </h3>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  Live Intelligence · {city}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Algorithmic detection of wholesale supply bottlenecks, inflation spikes, and kitchen
                hacks
              </p>
            </div>
          </div>

          {/* Bilingual Toggle */}
          <button
            type="button"
            onClick={() => setLang((l) => (l === "urdu" ? "roman" : "urdu"))}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition"
          >
            <Languages className="h-3.5 w-3.5 text-primary" />
            <span>{lang === "urdu" ? "اردو (Urdu Script)" : "Roman Urdu / English"}</span>
          </button>
        </div>

        {/* Advisor Response Display Area */}
        <div className="mt-4 rounded-xl border border-primary/30 bg-surface/60 p-4">
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  activeAdvice.tag === "substitution"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : activeAdvice.tag === "surge"
                      ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                      : "bg-primary/20 text-primary"
                }`}
              >
                {activeAdvice.tagLabel}
              </span>
              <span className="text-xs text-muted-foreground">Tailored for {city}</span>
            </div>
          </div>

          <p
            className={`mt-3 text-sm leading-relaxed text-foreground ${
              lang === "urdu" ? "text-right font-urdu text-base leading-loose" : ""
            }`}
          >
            {lang === "urdu" ? activeAdvice.urdu : activeAdvice.romanUrdu}
          </p>

          {/* Key Bullet Takeaways */}
          <div className="mt-4 space-y-1.5 border-t border-border/40 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Key Actionable Takeaways:
            </span>
            {activeAdvice.keyPoints.map((pt, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
            Ask the AI Advisor:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((query, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuery(query)}
                className="rounded-xl border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition active:scale-95"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question Input */}
        <form onSubmit={handleFormSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your market question (e.g. 'Tomatoes are costly, what to use?', 'Chicken alternative')..."
            className="input-base min-h-10 flex-1 text-xs"
          />
          <button type="submit" className="btn-primary min-h-10 px-4 text-xs">
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask Advisor</span>
          </button>
        </form>
      </div>

      {/* ── Active Weekly Inflation Spike Alerts ──────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--warning)]/15 text-[var(--warning)]">
              <Flame className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Weekly Inflation Surge & Supply Chain Pinches
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Monitored price shocks across provincial wholesale mandis
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[var(--warning)]">
            {INFLATION_ALERTS.length} Alerts Active
          </span>
        </div>

        {/* Alert Selector Tabs */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {INFLATION_ALERTS.map((alert) => {
            const isSelected = selectedAlertId === alert.id;
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => setSelectedAlertId(alert.id)}
                className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-[var(--warning)] bg-[var(--warning)]/10 ring-1 ring-[var(--warning)]/30"
                    : "border-border/70 bg-surface/60 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-foreground">{alert.item}</span>
                  {alert.severity === "high" ? (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">
                      HIGH
                    </span>
                  ) : (
                    <span className="rounded bg-[var(--warning)]/20 px-1.5 py-0.5 text-[9px] font-bold text-[var(--warning)]">
                      MODERATE
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">{alert.urdu}</span>
                <span className="text-[11px] font-semibold text-[var(--warning)] mt-2">
                  {alert.weeklySurge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Alert & Substitution Playbook Card */}
        {activeAlert && (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldAlert className="h-4 w-4 text-[var(--warning)]" />
                  <span>Why it's surging:</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{activeAlert.driverReason}</p>
                <div className="pt-1">
                  <span className="font-semibold text-foreground">Recommended Procurement:</span>
                  <p className="text-muted-foreground">{activeAlert.recommendedAction}</p>
                </div>
              </div>

              {/* Culinary Substitution Box */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <ChefHat className="h-4 w-4" />
                    <span>{activeAlert.culinarySubstitution.title}</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    Save ~{pkr(activeAlert.culinarySubstitution.estimatedSavingsMonthly)}/mo
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  {activeAlert.culinarySubstitution.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Seasonal Produce Calendar ─────────────────────────── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">
            Seasonal Sabzi Calendar & Smart Timing Advice
          </h4>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Peak Season Bargains */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>In-Season Bargains (Buy Generously)</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {SEASONAL_PRODUCE_CALENDAR.peakSeasonBargains.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg bg-card/60 p-2 text-xs border border-border/40"
                >
                  <div>
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{p.urdu}</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-right max-w-[160px]">
                    {p.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Off-Season Premiums to Avoid */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="flex items-center gap-1.5 font-bold text-rose-500 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Off-Season Premiums (Avoid or Substitute)</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {SEASONAL_PRODUCE_CALENDAR.offSeasonPremiumsToAvoid.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg bg-card/60 p-2 text-xs border border-border/40"
                >
                  <div>
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{p.urdu}</span>
                  </div>
                  <span className="text-[11px] text-rose-500 font-medium text-right max-w-[160px]">
                    {p.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
