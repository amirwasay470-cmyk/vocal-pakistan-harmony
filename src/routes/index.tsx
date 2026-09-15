import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Zap,
  ChefHat,
  ShoppingBasket,
  Megaphone,
  Sun,
  Route as RouteIcon,
  Flame,
  Sparkles,
  Glasses,
} from "lucide-react";
import { BillAudit } from "@/components/awaaz/BillAudit";
import { RecipeMaker } from "@/components/awaaz/RecipeMaker";
import { MarketFinder } from "@/components/awaaz/MarketFinder";
import { EnergyAdvisor } from "@/components/awaaz/EnergyAdvisor";
import { SolarCalculator } from "@/components/awaaz/SolarCalculator";
import { VampireDetector } from "@/components/awaaz/VampireDetector";
import { CommuteCalculator } from "@/components/awaaz/CommuteCalculator";
import { GasCookingCalculator } from "@/components/awaaz/GasCookingCalculator";
import { LiveFinancialTicker } from "@/components/awaaz/LiveFinancialTicker";
import { usePersistentState } from "@/lib/use-persistent-state";
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
      {
        property: "og:title",
        content: "Awaaz-e-Pakistan — Save on bills, solar, food and groceries",
      },
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
  { id: "cooking", label: "Cooking Energy Management", short: "Cooking Gas", icon: Flame },
  { id: "recipes", label: "Leftover Recipes", short: "Recipes", icon: ChefHat },
  { id: "market", label: "Market Value", short: "Market", icon: ShoppingBasket },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("bills");
  const [advisorCtx, setAdvisorCtx] = useState<AdvisorContext | null>(null);
  const [eyeglassMode, setEyeglassMode] = usePersistentState<boolean>("awaaz_eyeglass_mode", false);

  const liveUnits = advisorCtx?.billedUnits ?? 412;
  const liveDiscoId = advisorCtx?.disco.id ?? "k-electric";
  const liveEstimatedUnits = advisorCtx?.estimatedUnits ?? 0;
  const liveAppliances = advisorCtx?.appliances ?? [];

  return (
    <div
      className={`relative min-h-screen bg-[#030712] text-foreground pb-24 md:pb-0 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden ${
        eyeglassMode ? "awaaz-eyeglass-mode" : ""
      }`}
    >
      {/* Live Financial Ticker & Inflation Marquee */}
      <LiveFinancialTicker />

      {/* Ambient Atmospheric Radial Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[15%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-[60%] left-[15%] h-[650px] w-[650px] rounded-full bg-emerald-500/8 blur-[150px]" />
        <div className="absolute -bottom-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[140px]" />
      </div>

      {/* Awami Bachat Navigation Bar */}
      <header className="relative z-40 sticky top-0 border-b border-white/[0.08] bg-slate-950/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-md sm:h-11 sm:w-11">
                <Megaphone className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <h1 className="max-w-full truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                    Awaaz-e-Pakistan
                  </h1>
                  <span className="shrink-0 rounded-md border border-emerald-500/40 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 sm:text-[11px]">
                    Awami Bachat Portal
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  Har Pakistani ghar ki bachat — Bijli, Solar, Petrol, Gas & Bazaar
                </p>
              </div>
            </div>

            {/* High-Contrast "Eyeglass" Text Scaling Toggle */}
            <button
              type="button"
              onClick={() => setEyeglassMode(!eyeglassMode)}
              aria-label="Toggle Eyeglass Mode"
              title="Toggle Eyeglass Mode (عینک موڈ - بڑا فونٹ اور ہائی کنٹراسٹ)"
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition-all active:scale-95 sm:px-3 ${
                eyeglassMode
                  ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                  : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              <Glasses className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="hidden sm:inline">
                {eyeglassMode ? "عینک موڈ (On)" : "عینک موڈ (Bara Font)"}
              </span>
            </button>
          </div>

          <div className="border-t border-white/[0.06] px-2 sm:px-4">
            <nav
              aria-label="Main tools"
              className="flex min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain whitespace-nowrap py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm lg:flex-1 lg:justify-center ${
                      active
                        ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm"
                        : "border border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-slate-900/60 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : ""}`} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flag-accent h-1 w-full" />
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        {tab === "bills" && (
          <div key="bills" className="space-y-8 tab-enter">
            <BillAudit key="bills" onContextChange={setAdvisorCtx} />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
        {tab === "optimizer" && (
          <div key="optimizer" className="space-y-8 tab-enter">
            <SolarCalculator monthlyUnits={liveUnits} discoId={liveDiscoId} />
            <div className="border-t border-white/[0.08]" />
            <VampireDetector
              billedUnits={liveUnits}
              estimatedUnits={liveEstimatedUnits}
              discoId={liveDiscoId}
              appliances={liveAppliances}
            />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
        {tab === "commute" && (
          <div key="commute" className="space-y-8 tab-enter">
            <CommuteCalculator />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
        {tab === "cooking" && (
          <div key="cooking" className="space-y-8 tab-enter">
            <GasCookingCalculator />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
        {tab === "recipes" && (
          <div key="recipes" className="space-y-8 tab-enter">
            <RecipeMaker />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
        {tab === "market" && (
          <div key="market" className="space-y-8 tab-enter">
            <MarketFinder />
            <AdvisorCardSection advisorCtx={advisorCtx} />
          </div>
        )}
      </main>

      <footer className="hidden border-t border-white/[0.08] py-7 text-center text-xs text-muted-foreground md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <p>Awaaz-e-Pakistan · Real-time household energy & economic empowerment platform</p>
          <p className="flex items-center gap-1.5 font-medium text-emerald-400/90">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            NEPRA & PBS Tariff Engine Synced
          </p>
        </div>
      </footer>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
        <div className="floating-nav grid w-full max-w-md grid-cols-6 gap-1 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-white/[0.12] bg-slate-950/85 backdrop-blur-2xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-bold transition-all active:scale-95 ${
                  active
                    ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                    : "text-slate-400 hover:text-white"
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

function AdvisorCardSection({ advisorCtx }: { advisorCtx: AdvisorContext | null }) {
  return (
    <div className="pt-8 border-t border-white/[0.08]">
      <EnergyAdvisor context={advisorCtx} />
    </div>
  );
}
