import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Send,
  MessageCircle,
  Zap,
} from "lucide-react";
import {
  generateAdvice,
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

  function send(text: string) {
    if (!text.trim() || isTyping || !context) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAdvice(text, context);
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
    }, 500 + Math.random() * 400);
  }

  const contextSummary = context ? buildSummary(context) : "No audit yet";

  const chatContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold">AI Energy Advisor</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Online · Urdu & Roman Urdu
            </p>
          </div>
        </div>
        {mode === "floating" && (
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close advisor"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Context banner */}
      <div className="flex items-center gap-2 border-b bg-primary/8 px-4 py-2 text-xs text-primary">
        <Sparkles className="h-3 w-3 shrink-0" />
        <span className="truncate">{contextSummary}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm border bg-card"
              }`}
            >
              {msg.role === "assistant" && msg.parsed ? (
                <div>
                  <span
                    className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      msg.parsed.tag === "warning"
                        ? "bg-destructive/15 text-destructive"
                        : msg.parsed.tag === "saving"
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {msg.parsed.tagLabel}
                  </span>
                  <p className="font-urdu text-right leading-8" dir="rtl" lang="ur">
                    {msg.parsed.urdu}
                  </p>
                  <p className="mt-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                    {msg.parsed.romanUrdu}
                  </p>
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border bg-card px-4 py-3">
              <Dot delay="0s" />
              <Dot delay="0.2s" />
              <Dot delay="0.4s" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => send(chip)}
            disabled={isTyping}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          placeholder="اپنا سوال پوچھیں... (Ask your question)"
          disabled={isTyping}
          className="flex-1 rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isTyping}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (mode === "embedded") {
    return (
      <div className="h-[520px] overflow-hidden rounded-2xl border bg-card shadow-sm">
        {chatContent}
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
          !open ? "animate-pulse" : ""
        }`}
        aria-label="Open AI Energy Advisor"
        style={{ display: open ? "none" : "grid" }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm transform border-l bg-background shadow-2xl transition-transform duration-300 ${
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
      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
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
    parts.push(ctx.unprotected ? "Unprotected" : "Protected");
  }
  parts.push(`${ctx.appliances.length} appliances`);
  return parts.join(" · ");
}

function pkr(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}
