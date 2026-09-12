import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gauge, Sliders, Swords, Megaphone } from "lucide-react";
import { DashboardTab } from "@/components/awaaz/DashboardTab";
import { ApplianceBudgeter } from "@/components/awaaz/ApplianceBudgeter";
import { TariffWarRoom } from "@/components/awaaz/TariffWarRoom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Awaaz-e-Pakistan — Utility Bill Audit & Energy Optimization" },
      {
        name: "description",
        content:
          "Audit your electricity bill, monitor slab danger zones, compare appliance costs, budget your usage, and demystify hidden tariff charges across Pakistani DISCOs.",
      },
      { property: "og:title", content: "Awaaz-e-Pakistan — Bill Audit & Energy Optimizer" },
      {
        property: "og:description",
        content:
          "A household energy toolkit for Pakistan: dual-bar appliance comparison, slab danger meter, appliance budgeter, and tariff war room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tabs = [
  { id: "dashboard", label: "Dashboard", short: "Dashboard", icon: Gauge },
  { id: "budgeter", label: "Appliance Budgeter", short: "Budgeter", icon: Sliders },
  { id: "warroom", label: "Tariff War Room", short: "Tariff", icon: Swords },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Megaphone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">Awaaz-e-Pakistan</h1>
              <p className="truncate text-xs text-muted-foreground">
                Har ghar ki bachat — bill audit & energy optimizer
              </p>
            </div>
          </div>

          <nav className="hidden shrink-0 items-center gap-1 md:flex">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flag-accent h-1 w-full" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "dashboard" && <DashboardTab key="dashboard" onNavigate={(t) => setTab(t as TabId)} />}
        {tab === "budgeter" && <ApplianceBudgeter key="budgeter" />}
        {tab === "warroom" && <TariffWarRoom key="warroom" />}
      </main>

      <footer className="hidden border-t py-6 text-center text-xs text-muted-foreground md:block">
        Awaaz-e-Pakistan · Sample rates and tariffs are indicative and for guidance only.
      </footer>

      <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
        <div className="floating-nav grid w-full max-w-md grid-cols-3 gap-1 p-1.5">
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
