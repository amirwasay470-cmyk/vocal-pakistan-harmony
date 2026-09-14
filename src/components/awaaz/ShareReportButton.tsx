import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

export interface ShareReportProps {
  title: string;
  urduTitle: string;
  category: "bill" | "fuel" | "bazaar" | "gas" | "recipe";
  totalCostLabel: string;
  totalCostValue: string;
  dailyBurnValue?: string;
  savingsValue?: string;
  breakdown: { label: string; value: string }[];
  advice?: string;
  compact?: boolean;
}

export function ShareReportButton({
  title,
  urduTitle,
  category,
  totalCostLabel,
  totalCostValue,
  dailyBurnValue,
  savingsValue,
  breakdown,
  advice,
  compact = false,
}: ShareReportProps) {
  const [copied, setCopied] = useState(false);

  const buildFormattedMessage = () => {
    const divider = "━━━━━━━━━━━━━━━━━━━━━";
    const header = `🇵🇰 *Awaaz-e-Pakistan — Awami Bachat Report*\n📌 *${title}* (${urduTitle})\n${divider}`;

    let costSection = `💰 *${totalCostLabel}:* ${totalCostValue}`;
    if (dailyBurnValue) {
      costSection += `\n🔥 *Daily Burn Rate (روزانہ خرچ):* ${dailyBurnValue}`;
    }
    if (savingsValue) {
      costSection += `\n✨ *Estimated Bachat:* ${savingsValue}`;
    }

    const breakdownLines = breakdown.map((item) => `• ${item.label}: *${item.value}*`).join("\n");

    let adviceSection = "";
    if (advice) {
      adviceSection = `\n💡 *Awami Bachat Tip (عوامی بچت مشورہ):*\n${advice}`;
    }

    const footer = `${divider}\n📲 *Shared via Awaaz-e-Pakistan*\n_Bachat Portal for Electricity, Fuel, Gas & Bazaar_`;

    return `${header}\n\n${costSection}\n\n📊 *Tafseelat / Breakdown:*\n${breakdownLines}\n${adviceSection}\n\n${footer}`;
  };

  const handleCopy = async () => {
    try {
      const text = buildFormattedMessage();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error("Clipboard copy error:", e);
    }
  };

  const handleWhatsApp = () => {
    const text = buildFormattedMessage();
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/70 px-2.5 py-1 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900 hover:text-white"
          title="Share to WhatsApp Family Group"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp</span>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
          title="Copy formatted text report"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 px-3.5 py-2 text-xs font-bold text-emerald-200 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-600/40 hover:text-white"
      >
        <MessageCircle className="h-4 w-4 text-emerald-400" />
        <span>Share to WhatsApp / واٹس ایپ شیئر</span>
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-300 shadow-sm transition hover:border-white/30 hover:bg-slate-800 hover:text-white"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400">Copied to Clipboard! (کاپی ہو گیا)</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 text-slate-400" />
            <span>Copy Text Report / رپورٹ کاپی کریں</span>
          </>
        )}
      </button>
    </div>
  );
}
