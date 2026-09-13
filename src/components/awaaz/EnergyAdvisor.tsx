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
  mode: "floating" | "embedded";
};

export function EnergyAdvisor({ context, mode }: EnergyAdvisorProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: INITIAL_GREETING,
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const chatContent = (
    <div className="flex h-full flex-col bg-slate-950/90 backdrop-blur-xl">
      {/* Fintech Card Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-slate-900/80 px-5 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)] neon-ring-emerald">
            <Zap className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 neon-pulse-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">AI Energy Advisor</h3>
              <span className="terminal-badge text-[9px] py-0.5 px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE CO-PILOT
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              Real-time NEPRA & Slab Advisor · Urdu & Roman Urdu
            </p>
          </div>
        </div>
        {mode === "floating" && (
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-slate-950/60 text-muted-foreground transition-all hover:border-emerald-500/50 hover:bg-slate-900 hover:text-white"
            aria-label="Close advisor"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Context status banner */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-emerald-950/25 px-5 py-2 text-xs text-emerald-300">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span className="truncate font-medium">{contextSummary}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                msg.role === "user"
                  ? "rounded-br-xs border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                  : "rounded-bl-xs border border-white/[0.09] bg-slate-900/80 backdrop-blur-md"
              }`}
            >
              {msg.role === "assistant" && msg.parsed ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/[0.06] pb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        msg.parsed.tag === "warning"
                          ? "badge-warning"
                          : msg.parsed.tag === "saving"
                            ? "badge-safe"
                            : "badge-safe"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {msg.parsed.tagLabel}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">AI Insight</span>
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
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] bg-slate-900/40 px-4 py-2.5">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => send(chip)}
            disabled={isTyping}
            className="group flex items-center gap-1 rounded-full border border-white/[0.08] bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:opacity-50"
          >
            <span>{chip}</span>
            <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="flex gap-2 border-t border-white/[0.08] bg-slate-900/70 p-3.5 backdrop-blur-md">
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

  if (mode === "embedded") {
    return <div className="advisor-fintech-card h-[540px] overflow-hidden">{chatContent}</div>;
  }

  return (
    <>
      {/* Floating launcher button with glowing pulse */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-emerald-400/50 bg-slate-950/90 p-2 pr-5 shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] active:scale-95 ${
          !open ? "animate-none" : ""
        }`}
        aria-label="Open AI Energy Advisor"
        style={{ display: open ? "none" : "flex" }}
      >
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.7)] neon-ring-emerald">
          <Zap className="h-5 w-5 fill-current" />
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-35" />
        </span>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-bold leading-tight text-white flex items-center gap-1.5">
            AI Energy Advisor
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">
            Live Copilot · اردو / Roman
          </span>
        </div>
      </button>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-white/[0.1] bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {chatContent}
      </div>
    </>
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
