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
import { usePersistentState } from "@/lib/use-persistent-state";
import { ShareReportButton } from "@/components/awaaz/ShareReportButton";

type Match = Recipe & { matched: string[]; missing: string[]; score: number };

const defaultPantry = ["roti", "daal", "rice", "salan"];
const defaultSelected = ["Roti / Naan", "Daal", "Cooked Rice", "Chicken Qorma"];

const simulatedHeard = ["Baqiya Chawal", "Bhindi", "Qeema", "Dahi", "Aloo", "Shimla Mirch"];

const titleCase = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());

export function RecipeMaker() {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [servings, setServings] = usePersistentState<number>("awaaz_recipe_servings", 4);
  const [maxMinutes, setMaxMinutes] = usePersistentState<number>("awaaz_recipe_max_minutes", 30);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pantry, setPantry] = usePersistentState<string[]>("awaaz_pantry_items", defaultPantry);
  const [cooked, setCooked] = usePersistentState<string[]>("awaaz_cooked_remixes", []);
  const [hasSuggested, setHasSuggested] = useState(false);
  const [openRemixId, setOpenRemixId] = useState<string | null>(null);

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
    interface SpeechRecognitionEventLike {
      results?: Array<Array<{ transcript?: string }>>;
    }
    type SpeechRecognitionConstructor = new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: ((e: SpeechRecognitionEventLike) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    const win =
      typeof window !== "undefined"
        ? (window as unknown as {
            SpeechRecognition?: SpeechRecognitionConstructor;
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
          })
        : undefined;
    const SR = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    setVoiceNote(null);
    setListening(true);

    if (SR) {
      try {
        const rec = new SR();
        rec.lang = "ur-PK";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e: SpeechRecognitionEventLike) => {
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
    setHasSuggested(true);
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
    setHasSuggested(false);
    setOpenRemixId(null);
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

      <div className="dashboard-card border-emerald-500/30 p-5 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <span className="badge-safe">Jugaad Kitchen Engine</span>
            <h3 className="mt-1.5 text-base font-bold text-white tracking-tight sm:text-lg">
              Tap What's Lying in the Pantry
            </h3>
            <p className="text-xs text-muted-foreground">
              Roti, daal, chawal, salan — tap the tiles to remix them into a high-protein,
              zero-waste meal.
            </p>
          </div>
          <span className="badge-warning shrink-0 font-mono">
            <Flame className="h-3.5 w-3.5 text-amber-400 inline mr-1" /> {pantry.length} items
            logged
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
                <span className="text-xs font-bold text-white">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.urdu}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">Food Rescued / Week</p>
            <p className="mt-1 text-lg font-extrabold text-white font-mono">
              {pkr(savings.potential)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
            <p className="text-[11px] font-semibold text-emerald-400">Banked From Cooked Remixes</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-400 font-mono">
              {pkr(savings.banked)}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Projected Monthly Retained
            </p>
            <p className="mt-1 text-lg font-extrabold text-amber-400 font-mono">
              {pkr(savings.monthly)}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/[0.08] pt-5">
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
              placeholder="Add custom ingredient (e.g., Aloo, Kheera, Paneer) +"
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
              className={`h-11 w-11 shrink-0 rounded-xl border-white/[0.1] bg-slate-900/70 text-slate-300 transition-all active:scale-95 hover:border-emerald-500/40 hover:text-white ${
                listening
                  ? "animate-pulse border-emerald-500 bg-emerald-500/20 text-emerald-400"
                  : ""
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </form>

          {custom.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Custom ingredients">
              {custom.map((item) => (
                <span key={item} className="badge-safe">
                  <Plus className="h-3 w-3" /> {item}
                </span>
              ))}
            </div>
          )}

          {(listening || voiceNote) && (
            <p className="tab-enter mt-2 text-xs text-emerald-400/90" aria-live="polite">
              {listening ? "Listening… say one item, e.g. “dahi”." : voiceNote}
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
              <span className="mb-1 block text-xs font-semibold text-slate-300">
                Serving size: {servings} people
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </label>
            <label className="block rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
              <span className="mb-1 block text-xs font-semibold text-slate-300">
                Max stove cooking time: {maxMinutes} min
              </span>
              <input
                type="range"
                min={10}
                max={45}
                step={5}
                value={maxMinutes}
                onChange={(e) => setMaxMinutes(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={cook} className="btn-primary">
              <Sparkles className="h-4 w-4" /> Suggest Desi Recipes
            </Button>
            <Button type="button" variant="outline" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset Pantry
            </Button>
          </div>
        </div>
      </div>

      {hasSuggested && remixMatches.length > 0 && (
        <div className="glass-card p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                <PiggyBank className="h-4 w-4 text-emerald-400" /> Desi Remix Ideas
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Authentic step-by-step Pakistani kitchen transformations for your pantry. Tap “I
                cooked this” to bank your grocery savings.
              </p>
            </div>
            <span className="badge-safe text-xs font-mono">
              {remixMatches.length} smart transformations found
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {remixMatches.slice(0, 6).map((r) => {
              const done = cooked.includes(r.id);
              const isTutorialOpen = openRemixId === r.id || openRemixId === null; // open by default for effortless reading

              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-5 transition-all duration-200 ${
                    done
                      ? "border-emerald-500/40 bg-emerald-950/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/[0.08] bg-slate-900/70 hover:border-white/[0.15]"
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">
                        {r.emoji} {r.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{r.urdu}</p>
                    </div>
                    <span className="badge-safe shrink-0 font-mono">saves {pkr(r.savesPkr)}</span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{r.idea}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
                      <Clock className="h-3.5 w-3.5 text-amber-400" /> {r.minutes} min
                    </span>
                    {r.missing.map((m) => (
                      <span key={m} className="badge-warning font-normal">
                        need: {m}
                      </span>
                    ))}
                    {r.pantryExtras?.map((pe) => (
                      <span key={pe} className="badge-safe font-normal text-[10px]">
                        + {pe}
                      </span>
                    ))}
                  </div>

                  {/* Comprehensive Step-by-Step Cooking Instructions Tutorial */}
                  <div className="mt-4 border-t border-white/[0.08] pt-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        Step-by-Step Cooking Tutorial ({r.steps.length} Steps)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenRemixId((cur) => (cur === r.id ? "__closed__" : r.id))
                        }
                        className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        {openRemixId === "__closed__" && openRemixId !== r.id
                          ? "▼ Show Steps"
                          : openRemixId === r.id || openRemixId === null
                            ? "▲ Collapse Steps"
                            : "▼ View Steps"}
                      </button>
                    </div>

                    {(openRemixId === null || openRemixId === r.id) && (
                      <div className="mt-3 space-y-2.5 tab-enter">
                        <ol className="space-y-2 text-xs">
                          {r.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-slate-950/60 p-2.5 leading-relaxed text-slate-200"
                            >
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono border border-emerald-500/30 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-slate-200 text-xs">{step}</span>
                            </li>
                          ))}
                        </ol>

                        {r.proTip && (
                          <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-2.5 text-[11px] text-amber-200/90 leading-relaxed">
                            <span className="font-bold text-amber-300">💡 Kitchen Pro Tip: </span>
                            {r.proTip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => toggleCooked(r.id)}
                      className={`min-h-10 flex-1 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                        done
                          ? "btn-primary shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "border border-white/[0.1] bg-slate-900/80 text-slate-300 hover:border-white/[0.2] hover:text-white"
                      }`}
                    >
                      {done ? "✓ Cooked — Saving Banked" : "Mark as Cooked (Bank Saving)"}
                    </button>
                    <ShareReportButton
                      title={`Desi Remix: ${r.title}`}
                      urduTitle={r.urdu}
                      category="recipe"
                      totalCostLabel="Cooking Time"
                      totalCostValue={`${r.minutes} minutes`}
                      savingsValue={`${pkr(r.savesPkr)} Bachat`}
                      breakdown={[
                        { label: "Leftovers Used", value: r.needs.join(", ") },
                        {
                          label: "Additional Ingredients",
                          value: r.missing.length ? r.missing.join(", ") : "None required",
                        },
                        { label: "Servings", value: `${servings} persons` },
                        { label: "Steps Count", value: `${r.steps.length} steps` },
                      ]}
                      advice={r.proTip ?? r.idea}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!matches ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6 text-emerald-400" />}
          title="No Recipe Suggestions Yet"
          text="Pick your leftovers above and tap “Suggest Desi Recipes” for step-by-step authentic dishes with calculated ingredient cost per serving."
        />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6 text-amber-400" />}
          title="No Dishes Match Those Limits"
          text="Try selecting a few more leftovers or increasing the maximum cooking time threshold."
        />
      ) : (
        <div className="tab-enter grid gap-4 md:grid-cols-2">
          {matches.map((r) => {
            const open = openId === r.id;
            const cost = (r.costPkr / r.serves) * servings;
            return (
              <article
                key={r.id}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/70 shadow-md backdrop-blur-md transition-all duration-200 hover:border-emerald-500/30"
              >
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-white tracking-tight">
                        {r.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{r.urdu}</p>
                    </div>
                    <span className="shrink-0 badge-safe font-mono">
                      {Math.round(r.score * 100)}% match
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
                      <Clock className="h-3.5 w-3.5 text-amber-400" /> {r.minutes} min
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
                      <Users className="h-3.5 w-3.5 text-emerald-400" /> {servings} servings
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
                      <Wallet className="h-3.5 w-3.5 text-emerald-400" /> ~{pkr(cost)} total
                    </span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {r.matched.map((m) => (
                      <span key={m} className="badge-safe">
                        {m}
                      </span>
                    ))}
                    {r.missing.map((m) => (
                      <span key={m} className="badge-warning">
                        need: {m}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {open ? "▲ Hide cooking method" : "▼ Show step-by-step method"}
                  </button>

                  {open && (
                    <div className="tab-enter mt-3 space-y-3 border-t border-white/[0.08] pt-3">
                      <p className="text-xs text-slate-300">
                        <span className="font-bold text-white">Pantry staples needed:</span>{" "}
                        {r.pantry.join(", ")}
                      </p>
                      <ol className="space-y-2 text-xs">
                        {r.steps.map((s, i) => (
                          <li
                            key={s}
                            className="flex gap-2.5 rounded-lg border border-white/[0.05] bg-slate-950/40 p-2.5"
                          >
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono border border-emerald-500/30">
                              {i + 1}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{s}</span>
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
