import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Zap, Bot, ArrowUpRight } from "lucide-react";
import {
  generateAdvice,
  createDefaultAdvisorContext,
  SUGGESTION_CHIPS,
  INITIAL_GREETING,
  type AdvisorContext,
  type AdvisorResponse,
} from "@/lib/advisor-engine";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  parsed?: AdvisorResponse;
};

type EnergyAdvisorProps = {
  context: AdvisorContext | null;
  mode?: "embedded" | "floating"; // kept optional for backwards compatibility
};

export function EnergyAdvisor({ context }: EnergyAdvisorProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "greeting",
      role: "assistant",
      content: INITIAL_GREETING,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only scroll the internal chat container, never the window
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const effectiveContext = context ?? createDefaultAdvisorContext();

  function send(text: string) {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(
      () => {
        const response = generateAdvice(text, effectiveContext);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.urdu,
            parsed: response,
          },
        ]);
        setIsTyping(false);
      },
      450 + Math.random() * 300,
    );
  }

  const contextSummary = buildSummary(effectiveContext);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/80 shadow-md backdrop-blur-md overflow-hidden">
      {/* Clean Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-slate-900/90 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-sm">
            <Zap className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white">AI Energy Advisor</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                LIVE COPILOT
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              NEPRA Tariffs, Slab Protection & Energy Optimization · Urdu & Roman Urdu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium">Active Household Context</span>
        </div>
      </div>

      {/* Context status summary banner */}
      <div className="border-b border-white/[0.06] bg-slate-950/60 px-5 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Current Status:</span>
          <span className="font-semibold text-white">{contextSummary}</span>
        </div>
        <span className="badge-safe text-[10px] font-mono">
          {effectiveContext.unprotected ? "⚠️ 200+ Unit Unprotected" : "✓ Lifeline Protected"}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={containerRef}
        className="h-[320px] sm:h-[360px] space-y-3.5 overflow-y-auto p-4 sm:p-5"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                msg.role === "user"
                  ? "rounded-br-xs border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                  : "rounded-bl-xs border border-white/[0.09] bg-slate-900/90 backdrop-blur-md"
              }`}
            >
              {msg.role === "assistant" && msg.parsed ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/[0.06] pb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        msg.parsed.tag === "warning" ? "badge-warning" : "badge-safe"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {msg.parsed.tagLabel}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Tariff Advisor
                    </span>
                  </div>
                  <p
                    className="font-urdu text-right text-sm leading-8 text-slate-100 sm:text-base sm:leading-9"
                    dir="rtl"
                    lang="ur"
                  >
                    {msg.parsed.urdu}
                  </p>
                  <div className="mt-2.5 rounded-xl border border-white/[0.05] bg-black/25 p-2.5">
                    <p className="text-xs font-normal leading-relaxed text-slate-300">
                      {msg.parsed.romanUrdu}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="leading-relaxed text-slate-100">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-white/[0.08] bg-slate-900/80 px-4 py-3">
              <span className="text-xs font-medium text-emerald-400">Analyzing tariffs</span>
              <div className="flex gap-1.5">
                <Dot delay="0s" />
                <Dot delay="0.2s" />
                <Dot delay="0.4s" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] bg-slate-900/50 px-4 py-2.5">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(chip)}
            disabled={isTyping}
            className="group flex items-center gap-1 rounded-full border border-white/[0.08] bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:opacity-50"
          >
            <span>{chip}</span>
            <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="flex gap-2 border-t border-white/[0.08] bg-slate-900/80 p-3.5 backdrop-blur-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder="اپنا سوال پوچھیں... (e.g. Slab bachao, AC tips, Gas rate)"
          disabled={isTyping}
          className="flex-1 rounded-xl border border-white/[0.10] bg-slate-950/80 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={!input.trim() || isTyping}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/40 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

function buildSummary(ctx: AdvisorContext): string {
  const parts: string[] = [];
  parts.push(ctx.disco.name);
  parts.push(`${ctx.billedUnits} units`);
  if (ctx.hasResult) {
    parts.push(pkr(ctx.totalBill));
    parts.push(ctx.unprotected ? "Unprotected Slab" : "Protected Lifeline");
  }
  parts.push(`${ctx.appliances.length} tracked appliances`);
  return parts.join(" · ");
}

function pkr(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}
