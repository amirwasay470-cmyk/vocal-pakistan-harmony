export interface SlabMarker {
  units: number;
  label: string;
  isBoundary?: boolean;
}

export interface CyberProgressBarProps {
  currentUnits: number;
  maxUnits?: number;
  markers?: SlabMarker[];
  showHeadroom?: boolean;
  label?: string;
}

export function CyberProgressBar({
  currentUnits,
  maxUnits = 700,
  markers = [
    { units: 100, label: "100U" },
    { units: 200, label: "200U (Protected)", isBoundary: true },
    { units: 300, label: "300U" },
    { units: 700, label: "700U (Peak)", isBoundary: true },
  ],
  showHeadroom = true,
  label = "Slab Capacity & Protection Bar",
}: CyberProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentUnits / maxUnits) * 100));

  // Determine urgency state based on 200U protected threshold
  let urgency: "emerald" | "amber" | "crimson" = "emerald";
  let statusText = "Protected Slab Active";

  if (currentUnits > 300) {
    urgency = "crimson";
    statusText = "Unprotected Heavy Tariff Slab";
  } else if (currentUnits > 180) {
    urgency = "amber";
    statusText = "Near Protected Slab Limit (200U)";
  } else {
    urgency = "emerald";
    statusText = "Protected Low Tariff Active";
  }

  const fillClass =
    urgency === "crimson"
      ? "progress-fill-danger"
      : urgency === "amber"
        ? "progress-fill-amber"
        : "progress-fill-emerald";

  const glowColor =
    urgency === "crimson"
      ? "shadow-[0_0_20px_rgba(239,68,68,0.7)]"
      : urgency === "amber"
        ? "shadow-[0_0_20px_rgba(245,158,11,0.7)]"
        : "shadow-[0_0_20px_rgba(16,185,129,0.7)]";

  const headroom = 200 - currentUnits;

  return (
    <div className="w-full space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold ${
              urgency === "crimson"
                ? "text-rose-400"
                : urgency === "amber"
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          >
            {currentUnits} kWh
          </span>
          <span
            className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 border ${
              urgency === "crimson"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                : urgency === "amber"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            }`}
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* Progress Track with Glowing Neon Pin */}
      <div className="relative pt-1 pb-2">
        <div className="relative h-3 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${fillClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Glowing Head Marker */}
        <div
          className="absolute top-1 -translate-x-1/2 transition-all duration-700 ease-out pointer-events-none"
          style={{ left: `${percentage}%` }}
        >
          <div className={`h-5 w-2 rounded-full bg-white ${glowColor} -mt-1`} />
        </div>

        {/* Milestone Notches */}
        <div className="relative mt-2 w-full flex justify-between text-[10px] font-mono text-slate-400">
          <span>0U</span>
          {markers.map((m) => {
            const posPct = (m.units / maxUnits) * 100;
            return (
              <div
                key={m.units}
                className="absolute flex flex-col items-center -translate-x-1/2"
                style={{ left: `${posPct}%` }}
              >
                <div
                  className={`h-1.5 w-0.5 mb-0.5 ${
                    m.isBoundary ? "bg-amber-400 h-2" : "bg-slate-600"
                  }`}
                />
                <span
                  className={`${
                    m.isBoundary
                      ? "text-amber-400 font-bold tracking-tight"
                      : "text-slate-500 hidden sm:inline"
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
          <span>{maxUnits}U+</span>
        </div>
      </div>

      {showHeadroom && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono border-t border-white/[0.06]">
          <span className="text-slate-400">Lifeline Surcharge Guard:</span>
          {headroom > 0 ? (
            <span className="text-emerald-400 font-bold">
              +{Math.round(headroom)} units buffer remaining to keep protected rate
            </span>
          ) : (
            <span className="text-rose-400 font-bold">
              Breached by {Math.abs(Math.round(headroom))} units — standard commercial slab applied
            </span>
          )}
        </div>
      )}
    </div>
  );
}
