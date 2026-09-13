import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Zap,
  DollarSign,
  Activity,
  Sun,
  Flame,
  Info,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface TickerItem {
  id: string;
  category: "fx" | "fuel" | "inflation" | "power" | "market" | "solar";
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  impact: string;
  details: string;
  icon: typeof DollarSign;
  accent: "emerald" | "amber" | "crimson" | "cyan";
}

export const TICKER_DATA: TickerItem[] = [
  {
    id: "usd-pkr",
    category: "fx",
    label: "USD / PKR Interbank",
    value: "Rs. 278.45",
    change: "+0.15% (▲)",
    trend: "up",
    impact: "Drives import fuel and solar panel component prices.",
    details:
      "State Bank interbank benchmark. Directly influences fuel import parity pricing and imported grocery landed costs.",
    icon: DollarSign,
    accent: "amber",
  },
  {
    id: "petrol-rate",
    category: "fuel",
    label: "Petrol (Super)",
    value: "Rs. 373.00 / L",
    change: "Current OGRA Fix",
    trend: "neutral",
    impact: "High fuel levy + customs surcharge in effect.",
    details:
      "Includes Petroleum Development Levy (PDL) and dealer margins. Crucial threshold for motorcycle and car commute budgeting.",
    icon: Fuel,
    accent: "crimson",
  },
  {
    id: "diesel-rate",
    category: "fuel",
    label: "High-Speed Diesel (HSD)",
    value: "Rs. 384.50 / L",
    change: "+Rs. 4.20 (▲)",
    trend: "up",
    impact: "Directly escalates city logistics & mandi freight transport rates.",
    details:
      "Used by heavy transport and farm generators. Any rise triggers an immediate ripple across wholesale mandi vegetable & grain delivery costs.",
    icon: Fuel,
    accent: "crimson",
  },
  {
    id: "spi-inflation",
    category: "inflation",
    label: "PBS Weekly SPI Inflation",
    value: "28.40%",
    change: "-0.32% WoW (▼)",
    trend: "down",
    impact: "Sensitive Price Indicator for essential food & utility basket.",
    details:
      "Tracks 51 essential items across 17 urban centres weekly. Moderating slightly due to seasonal onion and tomato mandi arrivals.",
    icon: Activity,
    accent: "emerald",
  },
  {
    id: "protected-slab",
    category: "power",
    label: "Protected 200U Slab Status",
    value: "Active · Rs. 7.74 / U",
    change: "Protected Threshold",
    trend: "neutral",
    impact: "Breaching 200 units for 6 months permanently cancels protected status.",
    details:
      "Subsidized consumer slab under NEPRA tariff framework. Consumers crossing 200 units jump to Rs. 22.98/U base plus extra capacity surcharges.",
    icon: Zap,
    accent: "emerald",
  },
  {
    id: "unprotected-peak",
    category: "power",
    label: "Peak Tariff Rate (>700U)",
    value: "Rs. 48.84 / U",
    change: "+FPA & Taxes (~Rs 65)",
    trend: "up",
    impact: "Applies to peak hours (6 PM – 10 PM) and high-consumption consumers.",
    details:
      "Includes variable base tariff, Quartely Tariff Adjustment (QTA), Fuel Price Adjustment (FPA), and 18% General Sales Tax.",
    icon: Zap,
    accent: "amber",
  },
  {
    id: "nepra-solar",
    category: "solar",
    label: "NEPRA Net-Metering Buyback",
    value: "Rs. 11.50 / kWh",
    change: "Active Buyback",
    trend: "neutral",
    impact: "Credit rate for rooftop solar surplus exported back into the grid.",
    details:
      "Credited against off-peak import units on bidirectional three-phase meters during monthly utility billing reconciliations.",
    icon: Sun,
    accent: "cyan",
  },
  {
    id: "gold-rate",
    category: "market",
    label: "Gold 24K (All Pakistan)",
    value: "Rs. 284,500 / tola",
    change: "+1.1% (▲)",
    trend: "up",
    impact: "Hedge asset benchmark tracking international ounce spot rates.",
    details:
      "Karachi Sarafa Bazaar official quotation for 24K 11.66g tola, benchmark for domestic household savings.",
    icon: Sparkles,
    accent: "amber",
  },
  {
    id: "gas-tariff",
    category: "power",
    label: "SNGPL / SSGC Protected Gas",
    value: "Rs. 200 / MMBTU",
    change: "0.9 hm³ Slab",
    trend: "neutral",
    impact: "Protected winter baseline before aggressive non-protected multiplier jumps.",
    details:
      "Monthly fixed meter rent of Rs. 400 plus slab tariffs apply. Crossing 0.9 hm³ escalates cost steeply to Rs. 1,650/MMBTU.",
    icon: Flame,
    accent: "emerald",
  },
];

export function LiveFinancialTicker() {
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " PKT",
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative z-30 border-b border-emerald-500/20 bg-[#030712] text-xs shadow-[0_4px_24px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center">
          {/* Static Live Feed Badge */}
          <div className="relative z-20 flex shrink-0 items-center gap-2 border-r border-emerald-500/20 bg-[#030712] px-3.5 py-2 font-mono text-[11px] font-bold text-emerald-400">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="tracking-wider uppercase">ECONOMIC TICKER</span>
            <span className="hidden text-[10px] text-slate-500 sm:inline">| {currentTime}</span>
          </div>

          {/* Marquee Track */}
          <div className="relative flex-1 overflow-hidden py-1.5">
            <div className="ticker-track flex items-center gap-6">
              {/* Duplicate array for seamless infinite looping */}
              {[...TICKER_DATA, ...TICKER_DATA].map((item, index) => {
                const Icon = item.icon;
                const isUp = item.trend === "up";
                const isDown = item.trend === "down";

                const accentColor =
                  item.accent === "crimson"
                    ? "text-rose-400"
                    : item.accent === "amber"
                      ? "text-amber-400"
                      : item.accent === "cyan"
                        ? "text-cyan-400"
                        : "text-emerald-400";

                const badgeBg =
                  item.accent === "crimson"
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    : item.accent === "amber"
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : item.accent === "cyan"
                        ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";

                return (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2.5 py-1 text-left transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/40 hover:bg-slate-900/80 active:scale-95"
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${accentColor}`} />
                    <span className="font-semibold text-slate-300 group-hover:text-white">
                      {item.label}:
                    </span>
                    <span className="font-mono font-extrabold text-white group-hover:text-emerald-300">
                      {item.value}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold border ${badgeBg}`}
                    >
                      {isUp && <TrendingUp className="h-2.5 w-2.5" />}
                      {isDown && <TrendingDown className="h-2.5 w-2.5" />}
                      {item.change}
                    </span>
                    <span className="text-slate-700 select-none">/</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Trigger */}
          <div className="hidden shrink-0 items-center border-l border-emerald-500/20 px-3 md:flex">
            <span className="text-[10px] font-medium text-slate-500">
              Hover to pause · Tap to audit
            </span>
          </div>
        </div>
      </div>

      {/* Ticker Item Detail Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg cyber-gradient-border p-6 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                  <selectedItem.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="terminal-badge text-[10px] uppercase">
                      {selectedItem.category} BENCHMARK
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{currentTime}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-white tracking-tight">
                    {selectedItem.label}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-white/30 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Benchmark Value
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-3xl font-black tracking-tight text-emerald-400">
                  {selectedItem.value}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {selectedItem.change}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Direct Household Impact:
                </p>
                <p>{selectedItem.impact}</p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                  <Info className="h-3.5 w-3.5 text-cyan-400" /> Economic & Regulatory Background:
                </p>
                <p>{selectedItem.details}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-primary w-full sm:w-auto haptic-btn"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
