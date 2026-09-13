import { type LucideIcon } from "lucide-react";

export interface CyberProgressRingProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  thresholds?: {
    warning: number; // percentage, e.g. 65
    critical: number; // percentage, e.g. 90
  };
  icon?: LucideIcon;
  subtext?: string;
  showPercentage?: boolean;
  formatValue?: (val: number) => string;
  inverseUrgency?: boolean; // if true, higher is better (e.g. solar offset)
}

export function CyberProgressRing({
  value,
  max,
  label,
  unit = "",
  size = 140,
  strokeWidth = 10,
  thresholds = { warning: 65, critical: 90 },
  icon: Icon,
  subtext,
  showPercentage = true,
  formatValue,
  inverseUrgency = false,
}: CyberProgressRingProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  // Determine urgency state
  let urgency: "emerald" | "amber" | "crimson" = "emerald";

  if (!inverseUrgency) {
    // Normal: higher percentage means closer to breach (e.g. bill or units)
    if (percentage >= thresholds.critical) {
      urgency = "crimson";
    } else if (percentage >= thresholds.warning) {
      urgency = "amber";
    } else {
      urgency = "emerald";
    }
  } else {
    // Inverse: higher percentage is better (e.g. solar offset)
    if (percentage >= thresholds.critical) {
      urgency = "emerald";
    } else if (percentage >= thresholds.warning) {
      urgency = "amber";
    } else {
      urgency = "crimson";
    }
  }

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Unique gradient and filter IDs to prevent SVG DOM collision
  const ringId = label.toLowerCase().replace(/[^a-z0-9]/g, "-");

  const colors = {
    emerald: {
      stop1: "#059669",
      stop2: "#10b981",
      stop3: "#34d399",
      glow: "rgba(16, 185, 129, 0.4)",
      badgeClass: "badge-safe",
      urgencyClass: "urgency-emerald",
      textColor: "text-emerald-400",
      statusText: "OPTIMAL RANGE",
    },
    amber: {
      stop1: "#d97706",
      stop2: "#f59e0b",
      stop3: "#fbbf24",
      glow: "rgba(245, 158, 11, 0.4)",
      badgeClass: "badge-warning",
      urgencyClass: "urgency-amber",
      textColor: "text-amber-400",
      statusText: "WARNING THRESHOLD",
    },
    crimson: {
      stop1: "#b91c1c",
      stop2: "#ef4444",
      stop3: "#f87171",
      glow: "rgba(239, 68, 68, 0.5)",
      badgeClass: "badge-critical",
      urgencyClass: "urgency-crimson",
      textColor: "text-rose-400",
      statusText: "CRITICAL BREACH",
    },
  }[urgency];

  const displayVal = formatValue ? formatValue(value) : Math.round(value).toLocaleString();

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border p-4.5 transition-all duration-300 hover:scale-[1.02] ${colors.urgencyClass} bg-slate-950/85 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_12px_36px_-6px_rgba(0,0,0,0.7)]`}
    >
      {/* Label and Status */}
      <div className="mb-2.5 flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
          {Icon && <Icon className={`h-3.5 w-3.5 ${colors.textColor}`} />}
          {label}
        </span>
        <span className={`${colors.badgeClass} text-[10px]`}>{colors.statusText}</span>
      </div>

      {/* SVG Progress Ring */}
      <div className="relative my-2 grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform overflow-visible">
          <defs>
            <linearGradient id={`grad-${ringId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.stop1} />
              <stop offset="50%" stopColor={colors.stop2} />
              <stop offset="100%" stopColor={colors.stop3} />
            </linearGradient>
            <filter id={`glow-${ringId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glow Behind Main Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#grad-${ringId})`}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter={`url(#glow-${ringId})`}
            opacity={0.7}
            className="transition-all duration-700 ease-out"
          />

          {/* Foreground Animated Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#grad-${ringId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {showPercentage ? (
            <span className={`font-mono text-2xl font-black tracking-tight ${colors.textColor}`}>
              {Math.round(percentage)}%
            </span>
          ) : (
            <span className={`font-mono text-xl font-black tracking-tight ${colors.textColor}`}>
              {displayVal}
            </span>
          )}
          <span className="font-mono text-[10px] font-semibold text-slate-400">
            {displayVal} {unit}
          </span>
        </div>
      </div>

      {/* Subtext and Max Reference */}
      <div className="mt-1 text-center">
        <p className="text-[11px] font-mono font-medium text-slate-400">
          Target Cap:{" "}
          <span className="font-bold text-slate-200">
            {max.toLocaleString()} {unit}
          </span>
        </p>
        {subtext && (
          <p className="mt-1 text-[11px] leading-tight text-slate-400 max-w-[200px]">{subtext}</p>
        )}
      </div>
    </div>
  );
}
