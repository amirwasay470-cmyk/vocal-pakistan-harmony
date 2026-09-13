import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Zap, ChefHat, ShoppingBasket, Megaphone, Sun, Route as RouteIcon } from "lucide-react";
import { BillAudit } from "@/components/awaaz/BillAudit";
import { RecipeMaker } from "@/components/awaaz/RecipeMaker";
import { MarketFinder } from "@/components/awaaz/MarketFinder";
import { EnergyAdvisor } from "@/components/awaaz/EnergyAdvisor";
import { SolarCalculator } from "@/components/awaaz/SolarCalculator";
import { VampireDetector } from "@/components/awaaz/VampireDetector";
import { CommuteCalculator } from "@/components/awaaz/CommuteCalculator";
import type { AdvisorContext } from "@/lib/advisor-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Awaaz-e-Pakistan — Bills, Solar & Energy Optimizer, Market Prices" },
      {
        name: "description",
        content:
          "Audit your electricity bill, size a solar system, detect vampire power drain and meter anomalies, cook smart meals from leftovers, and compare local market grocery prices across Pakistani cities.",
      },
      { property: "og:title", content: "Awaaz-e-Pakistan — Save on bills, solar, food and groceries" },
      {
        property: "og:description",
        content:
          "A household toolkit for Pakistan: bill audit, solar & energy optimizer with vampire load detector, leftover recipe maker, and market grocery value finder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tabs = [
  { id: "bills", label: "Bill Audit", short: "Bills", icon: Zap },
  { id: "optimizer", label: "Solar & Energy Optimizer", short: "Optimizer", icon: Sun },
  { id: "commute", label: "Commute & Fuel", short: "Commute", icon: RouteIcon },
  { id: "recipes", label: "Leftover Recipes", short: "Recipes", icon: ChefHat },
  { id: "market", label: "Market Value", short: "Market", icon: ShoppingBasket },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("bills");
  const [advisorCtx, setAdvisorCtx] = useState<AdvisorContext | null>(null);
  const [advisorMode, setAdvisorMode] = useState<"floating" | "embedded">("floating");

  const liveUnits = advisorCtx?.billedUnits ?? 412;
  const liveDiscoId = advisorCtx?.disco.id ?? "k-electric";
  const liveEstimatedUnits = advisorCtx?.estimatedUnits ?? 0;
  const liveAppliances = advisorCtx?.appliances ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Megaphone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">Awaaz-e-Pakistan</h1>
              <p className="truncate text-xs text-muted-foreground">
                Har ghar ki bachat — bills, solar, bazaar
              </p>
            </div>
          </div>

          <nav className="flex shrink-0 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flag-accent h-1 w-full" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "bills" && (
          <div className="space-y-6">
            <BillAudit key="bills" onContextChange={setAdvisorCtx} />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">AI Energy Advisor</h2>
              <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                <button
                  onClick={() => setAdvisorMode("floating")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${advisorMode === "floating" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Floating
                </button>
                <button
                  onClick={() => setAdvisorMode("embedded")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${advisorMode === "embedded" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Embedded
                </button>
              </div>
            </div>
            {advisorMode === "embedded" && (
              <EnergyAdvisor context={advisorCtx} mode="embedded" />
            )}
          </div>
        )}
        {tab === "optimizer" && (
          <div key="optimizer" className="space-y-8">
            <SolarCalculator monthlyUnits={liveUnits} discoId={liveDiscoId} />
            <div className="border-t border-border/60" />
            <VampireDetector
              billedUnits={liveUnits}
              estimatedUnits={liveEstimatedUnits}
              discoId={liveDiscoId}
              appliances={liveAppliances}
            />
          </div>
        )}
        {tab === "commute" && <CommuteCalculator key="commute" />}
        {tab === "recipes" && <RecipeMaker key="recipes" />}
        {tab === "market" && <MarketFinder key="market" />}
      </main>

      <footer className="hidden border-t py-6 text-center text-xs text-muted-foreground md:block">
        Awaaz-e-Pakistan · Sample rates and tariffs are indicative and for guidance only.
      </footer>

      {advisorMode === "floating" && tab === "bills" && (
        <EnergyAdvisor context={advisorCtx} mode="floating" />
      )}

      <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
        <div className="floating-nav grid w-full max-w-md grid-cols-5 gap-1 p-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-all active:scale-95 ${
                  active ? "nav-pill-active" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.short}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
