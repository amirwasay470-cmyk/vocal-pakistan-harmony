import { useRef, useState } from "react";
import {
  ChefHat,
  Clock,
  Users,
  Sparkles,
  RotateCcw,
  Wallet,
  Plus,
  Mic,
  MicOff,
  Flame,
  PiggyBank,
} from "lucide-react";
import { recipes, pkr, type Recipe } from "@/lib/awaaz-data";
import { SectionHead, EmptyState, Stat } from "./BillAudit";
import { pantryGrid, remixFor, weeklySavings } from "@/lib/awaaz-remix";
import { Button } from "@/components/ui/button";

type Match = Recipe & { matched: string[]; missing: string[]; score: number };

const defaultPantry = ["roti", "daal", "rice", "salan"];
const defaultSelected = ["Roti / Naan", "Daal", "Cooked Rice", "Chicken Qorma"];

const simulatedHeard = [
  "Baqiya Chawal",
  "Bhindi",
  "Qeema",
  "Dahi",
  "Aloo",
  "Shimla Mirch",
];

const titleCase = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());

export function RecipeMaker() {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [maxMinutes, setMaxMinutes] = useState(30);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pantry, setPantry] = useState<string[]>(defaultPantry);
  const [cooked, setCooked] = useState<string[]>([]);

  const remixMatches = remixFor(pantry);
  const savings = weeklySavings(pantry, cooked);

  const togglePantry = (id: string) => {
    const item = pantryGrid.find((p) => p.id === id);
    if (!item) return;
    setPantry((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setSelected((s) =>
      s.includes(item.match) ? s.filter((x) => x !== item.match) : [...s, item.match],
    );
  };

  const toggleCooked = (id: string) =>
    setCooked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const addItem = (raw: string, note?: string) => {
    const item = titleCase(raw);
    if (!item) return;
    setCustom((c) => (c.includes(item) ? c : [...c, item]));
    setSelected((s) => (s.includes(item) ? s : [...s, item]));
    setDraft("");
    if (note) setVoiceNote(note);
  };

  const startVoice = () => {
    if (listening) return;
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setVoiceNote(null);
    setListening(true);

    if (SR) {
      try {
        const rec = new SR();
        rec.lang = "ur-PK";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e: any) => {
          const text = e.results?.[0]?.[0]?.transcript ?? "";
          if (text) addItem(text, `Heard “${titleCase(text)}” and added it to your fridge.`);
        };
        rec.onerror = () => {
          setVoiceNote("Microphone unavailable — type the item instead.");
        };
        rec.onend = () => setListening(false);
        rec.start();
        return;
      } catch {
        /* fall through to simulation */
      }
    }

    timer.current = setTimeout(() => {
      const guess = simulatedHeard[Math.floor(Math.random() * simulatedHeard.length)]!;
      addItem(guess, `Voice input isn't supported here, so we added a sample: “${guess}”.`);
      setListening(false);
    }, 1400);
  };

  const cook = () => {
    const scored = recipes
      .map((r) => {
        const matched = r.uses.filter((u) => selected.includes(u));
        const missing = r.uses.filter((u) => !selected.includes(u));
        return { ...r, matched, missing, score: matched.length / r.uses.length };
      })
      .filter((r) => r.matched.length > 0 && r.minutes <= maxMinutes)
      .sort((a, b) => b.score - a.score || a.minutes - b.minutes);
    setMatches(scored);
    setOpenId(scored[0]?.id ?? null);
  };

  const reset = () => {
    setSelected(defaultSelected);
    setCustom([]);
    setDraft("");
    setVoiceNote(null);
    setServings(4);
    setMaxMinutes(30);
    setMatches(null);
    setOpenId(null);
    setPantry(defaultPantry);
    setCooked([]);
  };

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<ChefHat className="h-5 w-5" />}
        title="Leftover Recipe Maker"
        subtitle="Turn last night's baqiya khana into a fresh meal instead of throwing it away."
      />

      <div className="neon-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Jugaad Kitchen</p>
            <h3 className="text-base font-semibold">Tap what's lying in the pantry</h3>
            <p className="text-xs text-muted-foreground">
              Roti, daal, chawal, salan — tap the tiles and we'll remix them into a new meal.
            </p>
          </div>
          <span className="status-badge shrink-0">
            <Flame className="h-3.5 w-3.5" /> {pantry.length} selected
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-8">
          {pantryGrid.map((p) => {
            const on = pantry.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePantry(p.id)}
                aria-pressed={on}
                className={`pantry-tile ${on ? "pantry-tile-active" : ""}`}
              >
                <span className="text-2xl leading-none">{p.emoji}</span>
                <span className="text-xs font-semibold">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.urdu}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Food rescued / week" value={pkr(savings.potential)} />
          <Stat label="Banked from remixes" value={pkr(savings.banked)} accent />
          <Stat label="That's a month" value={pkr(savings.monthly)} />
        </div>

        <div className="mt-5 border-t pt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem(draft);
            }}
            className="flex flex-wrap gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add item +"
              aria-label="Add a custom ingredient"
              className="input-base min-h-11 flex-1 basis-52"
            />
            <Button type="submit" className="btn-primary min-h-11 px-4">
              <Plus className="h-4 w-4" /> Add item
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={startVoice}
              aria-label={listening ? "Listening for an ingredient" : "Add ingredient by voice"}
              aria-pressed={listening}
              title="Add ingredient by voice"
              className={`h-11 w-11 shrink-0 rounded-xl transition-all active:scale-95 ${
                listening ? "animate-pulse border-primary bg-primary text-primary-foreground" : ""
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </form>

          {custom.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Custom ingredients">
              {custom.map((item) => (
                <span key={item} className="status-badge">
                  <Plus className="h-3 w-3" /> {item}
                </span>
              ))}
            </div>
          )}

          {(listening || voiceNote) && (
            <p className="tab-enter mt-2 text-xs text-muted-foreground" aria-live="polite">
              {listening ? "Listening… say one item, e.g. “dahi”." : voiceNote}
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Serving for {servings} people
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Max cooking time: {maxMinutes} min
              </span>
              <input
                type="range"
                min={10}
                max={45}
                step={5}
                value={maxMinutes}
                onChange={(e) => setMaxMinutes(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={cook} className="btn-primary">
              <Sparkles className="h-4 w-4" /> Suggest recipes
            </Button>
            <Button type="button" variant="outline" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {remixMatches.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
            <PiggyBank className="h-4 w-4 text-primary" /> Desi Remix
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Second-life ideas for exactly what you tapped. Mark one “cooked” to bank the saving.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {remixMatches.slice(0, 6).map((r) => {
              const done = cooked.includes(r.id);
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border p-4 transition-all ${
                    done ? "border-primary/60 bg-primary/8" : "bg-surface/50"
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {r.emoji} {r.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{r.urdu}</p>
                    </div>
                    <span className="status-badge shrink-0">saves {pkr(r.savesPkr)}</span>
                  </div>
                  <p className="mt-2 text-sm">{r.idea}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {r.minutes} min
                    </span>
                    {r.missing.map((m) => (
                      <span key={m} className="warn-badge">
                        need: {m}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleCooked(r.id)}
                    className={`mt-3 min-h-10 w-full rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : "border bg-card hover:bg-secondary"
                    }`}
                  >
                    {done ? "Cooked — saving banked" : "I cooked this"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!matches ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6" />}
          title="No suggestions yet"
          text="Pick your leftovers above and tap “Suggest recipes” for step-by-step desi dishes with cost per serving."
        />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6" />}
          title="Nothing matches those limits"
          text="Try selecting a few more leftovers or increasing the maximum cooking time."
        />
      ) : (
        <div className="tab-enter grid gap-4 md:grid-cols-2">
          {matches.map((r) => {
            const open = openId === r.id;
            const cost = (r.costPkr / r.serves) * servings;
            return (
              <article
                key={r.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">{r.urdu}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {Math.round(r.score * 100)}% match
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {r.minutes} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {servings} servings
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" /> ~{pkr(cost)} total
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.matched.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {m}
                      </span>
                    ))}
                    {r.missing.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        need: {m}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    {open ? "Hide method" : "Show method"}
                  </button>

                  {open && (
                    <div className="tab-enter mt-3 space-y-3 border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        Pantry needed: {r.pantry.join(", ")}
                      </p>
                      <ol className="space-y-2 text-sm">
                        {r.steps.map((s, i) => (
                          <li key={s} className="flex gap-3">
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                              {i + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
