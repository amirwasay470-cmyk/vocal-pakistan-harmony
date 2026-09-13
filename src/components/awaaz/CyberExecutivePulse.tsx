import { useState } from "react";
import { Zap, Wallet, Fuel, ShieldAlert, Sparkles, ChevronRight, Gauge } from "lucide-react";
import { CyberProgressRing } from "./CyberProgressRing";
import type { AdvisorContext } from "@/lib/advisor-engine";

export interface CyberExecutivePulseProps {
  advisorCtx: AdvisorContext | null;
  onNavigateTab?: (
    tabId: "bills" | "optimizer" | "commute" | "cooking" | "recipes" | "market",
  ) => void;
}

export function CyberExecutivePulse({ advisorCtx, onNavigateTab }: CyberExecutivePulseProps) {
  const billedUnits = advisorCtx?.billedUnits ?? 310;
  const estimatedBill = advisorCtx?.monthlyBill ?? 26800;
  const [budgetCap, setBudgetCap] = useState<number>(30000);
  const fuelBudget = 15000;
  const simulatedFuelSpent = 11800; // e.g., 31.6 Litres @ Rs. 373/L

  return (
    <section className="relative overflow-hidden cyber-gradient-border p-5 sm:p-6 mb-8">
      {/* Background Decorative Grid and Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Gauge className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase">
                Household Financial Command Pulse
              </h2>
              <span className="terminal-badge text-[10px]">REAL-TIME HUD</span>
            </div>
            <p className="text-xs text-slate-400">
              Active NEPRA energy slab safeguards, monthly inflation telemetry & fuel velocity
            </p>
          </div>
        </div>

        {/* Quick Budget Adjuster / Indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
          <span className="text-[11px] font-mono text-slate-400">Monthly Utility Cap:</span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            Rs. {budgetCap.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Interactive Cyber Progress Rings Grid */}
      <div className="relative z-10 mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Ring 1: 200U Protected Slab Shield */}
        <div className="group relative">
          <CyberProgressRing
            value={billedUnits}
            max={200}
            label="Slab Shield"
            unit="kWh"
            icon={Zap}
            thresholds={{ warning: 75, critical: 100 }}
            subtext={
              billedUnits <= 200
                ? "Protected low-tariff status active (Rs. 7.74/U)"
                : "Slab jump active (>200U). Commercial surcharge applies."
            }
          />
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("bills")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-all group-hover:underline"
            >
              Audit Detailed Slab <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Ring 2: Monthly Energy Budget Exhaustion */}
        <div className="group relative">
          <CyberProgressRing
            value={estimatedBill}
            max={budgetCap}
            label="Power Budget"
            unit="PKR"
            icon={Wallet}
            thresholds={{ warning: 70, critical: 90 }}
            formatValue={(val) => `Rs. ${Math.round(val).toLocaleString()}`}
            subtext={
              estimatedBill > budgetCap
                ? `Exceeded limit by Rs. ${(estimatedBill - budgetCap).toLocaleString()}`
                : `Rs. ${(budgetCap - estimatedBill).toLocaleString()} cushion before breach`
            }
          />
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("optimizer")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-all group-hover:underline"
            >
              Simulate Solar Offset <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Ring 3: Fuel & Commute Velocity */}
        <div className="group relative">
          <CyberProgressRing
            value={simulatedFuelSpent}
            max={fuelBudget}
            label="Fuel Velocity"
            unit="PKR"
            icon={Fuel}
            thresholds={{ warning: 65, critical: 85 }}
            formatValue={(val) => `Rs. ${Math.round(val).toLocaleString()}`}
            subtext="Tracked @ Rs. 373/L Super Petrol baseline"
          />
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("commute")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-all group-hover:underline"
            >
              Optimize Fuel Route <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
