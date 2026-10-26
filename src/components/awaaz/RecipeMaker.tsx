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
  Utensils,
  CookingPot,
  HeartHandshake,
} from "lucide-react";
import { recipes, pkr, type Recipe } from "@/lib/awaaz-data";
import { SectionHead, EmptyState } from "./BillAudit";
import { pantryGrid, remixFor, weeklySavings } from "@/lib/awaaz-remix";
import { Button } from "@/components/ui/button";
import { usePersistentState } from "@/lib/use-persistent-state";
import { ShareReportButton } from "@/components/awaaz/ShareReportButton";

type Match = Recipe & { matched: string[]; missing: string[]; score: number };

const defaultPantry = ["salan", "rice", "roti", "daal"];
const defaultSelected = ["Leftover Salan", "Cooked Rice", "Roti / Naan", "Daal"];

const simulatedHeard = ["Baqiya Chawal", "Leftover Salan", "Daal", "Aloo", "Roti"];

const titleCase = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const isIngredientPresent = (recipeItem: string, userSelected: string[]): boolean => {
  const normR = normalize(recipeItem);
  return userSelected.some((u) => {
    const normU = normalize(u);
    if (normR === normU) return true;
    if (
      (normR.includes("salan") || normR.includes("qorma")) &&
      (normU.includes("salan") || normU.includes("qorma"))
    )
      return true;
    if (
      (normR.includes("roti") || normR.includes("naan") || normR.includes("chapati")) &&
      (normU.includes("roti") || normU.includes("naan") || normU.includes("chapati"))
    )
      return true;
    if (
      (normR.includes("rice") || normR.includes("chawal")) &&
      (normU.includes("rice") || normU.includes("chawal"))
    )
      return true;
    if (normR.includes("daal") && normU.includes("daal")) return true;
    if (
      (normR.includes("aloo") || normR.includes("potato")) &&
      (normU.includes("aloo") || normU.includes("potato"))
    )
      return true;
    if (
      (normR.includes("anda") || normR.includes("egg")) &&
      (normU.includes("anda") || normU.includes("egg"))
    )
      return true;
    return normR.includes(normU) || normU.includes(normR);
  });
};

export function formatCookingTime(minutes: number): string {
  if (minutes >= 330) {
    const hrs = (minutes / 60).toFixed(1).replace(/\.0$/, "");
    return `${minutes} min (${hrs} Hours · Slow Degh / Haleem Dum)`;
  }
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0
      ? `${minutes} min (${hrs}h ${rem}m · Traditional Slow Simmer)`
      : `${minutes} min (${hrs} Hours · Handi / Dum)`;
  }
  return `${minutes} min (Quick Stovetop)`;
}

export function RecipeMaker() {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [servings, setServings] = usePersistentState<number>("awaaz_recipe_servings", 6);
  const [maxMinutes, setMaxMinutes] = usePersistentState<number>("awaaz_recipe_max_minutes", 360);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pantry, setPantry] = usePersistentState<string[]>("awaaz_pantry_items", defaultPantry);
  const [cooked, setCooked] = usePersistentState<string[]>("awaaz_cooked_remixes", []);
  const [hasSuggested, setHasSuggested] = useState(false);

  const remixMatches = remixFor(pantry);
  const savings = weeklySavings(pantry, cooked);

  const togglePantry = (id: string) => {
    const item = pantryGrid.find((p) => p.id === id);
    if (!item) return;
    const isCurrentlyInPantry = pantry.includes(id);
    setPantry((p) => (isCurrentlyInPantry ? p.filter((x) => x !== id) : [...p, id]));
    setSelected((s) => {
      if (isCurrentlyInPantry) {
        return s.filter((x) => x !== item.match && !isIngredientPresent(item.match, [x]));
      } else {
        return isIngredientPresent(item.match, s) ? s : [...s, item.match];
      }
    });
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
        const matched = r.uses.filter((u) => isIngredientPresent(u, selected));
        const missing = r.uses.filter((u) => !isIngredientPresent(u, selected));
        return { ...r, matched, missing, score: matched.length / r.uses.length };
      })
      // STRICT ZERO-EXTRA-GROCERY CONSTRAINT:
      // MUST ONLY use items already present in user's leftovers (missing.length === 0).
      // If ANY item is missing, DO NOT suggest that recipe. Banned need tags.
      .filter((r) => r.missing.length === 0 && r.minutes <= maxMinutes)
      .sort((a, b) => b.uses.length - a.uses.length || b.minutes - a.minutes);
    setMatches(scored);
  };

  const reset = () => {
    setHasSuggested(false);
    setSelected(defaultSelected);
    setCustom([]);
    setDraft("");
    setVoiceNote(null);
    setServings(6);
    setMaxMinutes(360);
    setMatches(null);
    setPantry(defaultPantry);
    setCooked([]);
  };

  return (
    <div className="tab-enter space-y-6">
      {/* Terracotta Themed Section Header */}
      <SectionHead
        icon={<ChefHat className="h-5 w-5 text-[#ffaa88]" />}
        title="Jugaad Kitchen & Recipe Hub"
        subtitle="Terracotta Kitchen Engine: Authentic family-sized Pakistani cuisine (4-6 persons) from 30-min highway karahi to slow-cooked 5.5-hour shahi haleem."
      />

      {/* Main Terracotta Card */}
      <div className="terracotta-card p-5 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="terracotta-badge">
                🏺 مٹی کی ہانڈی و روایتی کچن · Terracotta Kitchen Engine
              </span>
              <span className="badge-safe text-[11px] font-semibold">
                🛡️ Strict Zero-Extra-Grocery Engine Active
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold text-white tracking-tight sm:text-xl flex items-center gap-2">
              <CookingPot className="h-5 w-5 text-[#ffaa88] inline shrink-0" />
              Tap What's Lying in the Kitchen & Fridge
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Roti, daal, chawal, salan — tap the earthen pantry tiles to transform yesterday's food
              into rich family-sized Pakistani feasts (4-6 persons). Every suggested recipe uses
              <strong> 100% existing leftovers + basic home spices</strong> — zero extra grocery
              store purchases!
            </p>
          </div>
          <span className="terracotta-badge shrink-0 font-mono">
            <Flame className="h-3.5 w-3.5 text-amber-400 inline mr-1" /> {pantry.length} items
            logged
          </span>
        </div>

        {/* Earthen Pantry Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-8">
          {pantryGrid.map((p) => {
            const on = pantry.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePantry(p.id)}
                aria-pressed={on}
                className={`pantry-tile transition-all ${
                  on
                    ? "terracotta-tile-active border-[#d45d33] shadow-[0_0_15px_rgba(212,93,51,0.35)]"
                    : "hover:border-[#c85a32]/40"
                }`}
              >
                <span className="text-2xl leading-none">{p.emoji}</span>
                <span className="text-xs font-bold text-white">{p.name}</span>
                <span className="text-[10px] text-slate-400">{p.urdu}</span>
              </button>
            );
          })}
        </div>

        {/* Financial & Rescued Batch Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#c85a32]/30 bg-[#25140d]/70 p-3.5 shadow-sm">
            <p className="text-[11px] font-semibold text-[#ffaa88]">Food Rescued / Week</p>
            <p className="mt-1 text-lg font-extrabold text-white font-mono">
              {pkr(savings.potential)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Value of salvaged baqiya staples</p>
          </div>
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-3.5 shadow-sm">
            <p className="text-[11px] font-semibold text-emerald-400">Banked From Cooked Feasts</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-400 font-mono">
              {pkr(savings.banked)}
            </p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">
              Direct household grocery savings
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 shadow-sm">
            <p className="text-[11px] font-semibold text-amber-300">Projected Monthly Retained</p>
            <p className="mt-1 text-lg font-extrabold text-amber-400 font-mono">
              {pkr(savings.monthly)}
            </p>
            <p className="text-[10px] text-amber-300/80 mt-0.5">4-week multi-meal family budget</p>
          </div>
        </div>

        {/* Custom Ingredient Entry */}
        <div className="mt-6 border-t border-white/[0.08] pt-5">
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
              placeholder="Add custom leftover or spice (e.g., Gosht, Kheera, Paneer, Daal Maash) +"
              aria-label="Add a custom ingredient"
              className="input-base min-h-11 flex-1 basis-52 border-[#c85a32]/25 focus:border-[#d45d33]"
            />
            <Button type="submit" className="terracotta-btn min-h-11 px-4">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={startVoice}
              aria-label={listening ? "Listening for an ingredient" : "Add ingredient by voice"}
              aria-pressed={listening}
              title="Add ingredient by voice"
              className={`h-11 w-11 shrink-0 rounded-xl border-white/[0.1] bg-slate-900/70 text-slate-300 transition-all active:scale-95 hover:border-[#d45d33]/50 hover:text-white ${
                listening ? "animate-pulse border-[#d45d33] bg-[#d45d33]/25 text-[#ffaa88]" : ""
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </form>

          {custom.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Custom ingredients">
              {custom.map((item) => (
                <span key={item} className="terracotta-badge">
                  <Plus className="h-3 w-3" /> {item}
                </span>
              ))}
            </div>
          )}

          {(listening || voiceNote) && (
            <p className="tab-enter mt-2 text-xs text-[#ffaa88]" aria-live="polite">
              {listening ? "Listening… say one item, e.g. “dahi” or “gosht”." : voiceNote}
            </p>
          )}

          {/* UPGRADED: Cooking Time Filter (Expanded to 6 Hours with Step Slider & Presets) */}
          <div className="mt-6 rounded-2xl border border-[#c85a32]/30 bg-slate-950/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ffaa88] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#ffaa88]" />
                  Cooking Time Filter (30 min to 6 Hours)
                </span>
                <h4 className="mt-1 text-sm sm:text-base font-bold text-white">
                  Max Cooking Time:{" "}
                  <span className="font-mono text-[#ffaa88] text-base">
                    {formatCookingTime(maxMinutes)}
                  </span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Custom min:</span>
                <input
                  type="number"
                  min={15}
                  max={360}
                  step={15}
                  value={maxMinutes}
                  onChange={(e) =>
                    setMaxMinutes(Math.max(15, Math.min(360, Number(e.target.value) || 15)))
                  }
                  className="w-20 rounded-lg border border-white/[0.1] bg-slate-900 px-2.5 py-1 text-xs font-mono text-[#ffaa88] font-bold text-center focus:border-[#d45d33] focus:outline-none"
                  aria-label="Direct custom minutes input"
                />
              </div>
            </div>

            {/* Smooth Step Slider up to 360 Minutes (6 Hours) */}
            <input
              type="range"
              min={30}
              max={360}
              step={15}
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(Number(e.target.value))}
              aria-label="Max cooking time slider up to 6 hours"
              className="w-full accent-[#d45d33] h-2.5 bg-slate-800 rounded-lg cursor-pointer transition-all"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
              <span>30m (Quick)</span>
              <span>75m (Karahi)</span>
              <span>2h (Handi/Daal)</span>
              <span>3h (Yakhni Pulao)</span>
              <span>4.5h (Kunna)</span>
              <span className="text-[#ffaa88] font-bold">6h (Slow Degh & Haleem)</span>
            </div>

            {/* Quick Preset Filter Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
                Quick Presets:
              </span>
              {[
                { label: "🔥 All Delicacies (≤ 6h)", val: 360 },
                { label: "🍲 5.5h Shahi Haleem", val: 330 },
                { label: "🏺 4.5h Kunna Matka", val: 270 },
                { label: "🥘 3h Yakhni Pulao & Kadhi", val: 180 },
                { label: "🍛 2h Dhaba Daal & Shami", val: 120 },
                { label: "🍗 1.25h Highway Karahi", val: 75 },
                { label: "⚡ 30m Quick Stovetop", val: 30 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setMaxMinutes(preset.val)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    maxMinutes === preset.val
                      ? "border border-[#d45d33] bg-[#d45d33]/25 text-[#ffaa88] font-bold shadow-sm"
                      : "border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:border-white/[0.2] hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Authentic Desi Family Portion Sizing (4-6 Persons Batch) */}
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  Authentic Desi Family Portion Sizing (4–6 Persons)
                </span>
                <h4 className="mt-0.5 text-sm font-bold text-white">
                  Portioned for:{" "}
                  <span className="font-mono text-emerald-400 text-base">{servings} persons</span>
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (Portioned for 1-2 meals: dinner + lunch leftovers)
                  </span>
                </h4>
              </div>
              <span className="badge-safe text-xs font-mono">
                {servings <= 4
                  ? "Standard 4 Persons"
                  : servings <= 6
                    ? "✨ Optimal 4–6 Family Batch (1–2 Meals)"
                    : "Large Family / Dawat Pack"}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              aria-label="Family portion size slider"
              className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5 px-0.5">
              <span>2 persons</span>
              <span className="text-emerald-400 font-bold">4–6 Persons (Family Batch)</span>
              <span>8 persons</span>
              <span>12 persons (Dawat)</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={cook} className="terracotta-btn">
              <Sparkles className="h-4 w-4" /> Suggest Authentic Desi Recipes
            </Button>
            <Button type="button" variant="outline" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Reset Pantry & Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Desi Remix Transformations */}
      {hasSuggested && remixMatches.length > 0 && (
        <div className="glass-card p-5 sm:p-6 shadow-sm border-[#c85a32]/25">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                <PiggyBank className="h-4 w-4 text-[#ffaa88]" /> Jugaad Desi Transformations
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Authentic Pakistani kitchen transformations for your pantry. Tap “I cooked this” to
                bank your grocery savings.
              </p>
            </div>
            <span className="terracotta-badge text-xs font-mono">
              {remixMatches.length} smart transformations found
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {remixMatches.slice(0, 6).map((r) => {
              const done = cooked.includes(r.id);

              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-5 transition-all duration-200 ${
                    done
                      ? "border-emerald-500/40 bg-emerald-950/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/[0.08] bg-slate-900/70 hover:border-[#c85a32]/40"
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
                    <span className="inline-flex items-center gap-1 text-slate-300 font-mono bg-slate-950/60 border border-white/[0.06] px-2 py-0.5 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-amber-400" /> {r.minutes} min
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-300 font-mono bg-slate-950/60 border border-white/[0.06] px-2 py-0.5 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-emerald-400" /> {r.servings}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                      ✓ 100% Home Leftovers
                    </span>
                    {r.pantryExtras?.map((pe) => (
                      <span
                        key={pe}
                        className="rounded-lg bg-slate-800/60 border border-white/[0.08] px-2 py-0.5 font-normal text-[10px] text-slate-300"
                      >
                        + {pe}
                      </span>
                    ))}
                  </div>

                  {/* Estimated Budget Breakdown Box for Remix */}
                  <div className="mt-3.5 rounded-xl border border-white/[0.08] bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                      <span className="flex items-center gap-1.5 text-[#ffaa88]">
                        <Wallet className="h-3.5 w-3.5 text-[#ffaa88]" />
                        Family Budget Breakdown ({r.servings})
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        +{pkr(r.savesPkr)} saved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                        <p className="text-muted-foreground text-[10px]">Leftovers Salvaged</p>
                        <p className="font-mono font-bold text-[#ffaa88]">+{pkr(r.savesPkr)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                        <p className="text-muted-foreground text-[10px]">Extra Grocery</p>
                        <p className="font-mono font-bold text-emerald-400">PKR 0</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                        <p className="text-muted-foreground text-[10px]">Home Staples/Ghee</p>
                        <p className="font-mono font-bold text-slate-300">~PKR 40</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                        <p className="text-muted-foreground text-[10px]">Family Yield</p>
                        <p className="font-bold text-amber-300 truncate">1–2 Full Meals</p>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Step-by-Step Cooking Method Section (Right Below Budget Breakdown) */}
                  <div className="mt-3.5 rounded-xl border border-[#c85a32]/35 bg-slate-950/70 p-3.5">
                    <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.08] pb-2">
                      <span className="text-xs font-bold text-[#ffaa88] flex items-center gap-1.5">
                        <ChefHat className="h-3.5 w-3.5 text-[#ffaa88]" />
                        Step-by-Step Cooking Method ({r.steps.length} Steps)
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400">
                        ✓ 100% Home Leftovers
                      </span>
                    </div>

                    <ol className="space-y-2 text-xs">
                      {r.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-slate-900/85 p-2.5 leading-relaxed text-slate-200"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[#c85a32]/25 text-[10px] font-bold text-[#ffaa88] font-mono border border-[#c85a32]/40 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-200 text-xs leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>

                    {r.proTip && (
                      <div className="mt-2.5 rounded-lg border border-amber-500/25 bg-amber-950/20 p-2.5 text-[11px] text-amber-200/90 leading-relaxed">
                        <span className="font-bold text-amber-300">💡 Kitchen Pro Tip: </span>
                        {r.proTip}
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
                          label: "Extra Grocery Needed",
                          value: "Zero (100% Leftovers + Home Staples)",
                        },
                        { label: "Servings", value: r.servings },
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

      {/* Suggested Authentic Desi Family-Sized Recipes List */}
      {!matches ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6 text-[#ffaa88]" />}
          title="Authentic Desi Cuisine Awaiting Your Leftovers"
          text="Select what leftovers are in your fridge above and tap “Suggest Authentic Desi Recipes”. Our strict engine only suggests dishes made 100% from your selected leftovers + kitchen staples — zero extra grocery purchases required."
        />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="h-6 w-6 text-amber-400" />}
          title="No Dishes Match That Exact Combination & Time Limit"
          text={`None of the authentic slow-cooked or traditional delicacies fit under ${maxMinutes} minutes with zero extra groceries. Try selecting additional leftovers from your fridge (e.g. Salan + Rice, Roti + Salan, Daal + Aloo) or moving the cooking time slider up.`}
        />
      ) : (
        <div className="tab-enter space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Utensils className="h-4 w-4 text-[#ffaa88]" />
                Authentic Family-Sized Desi Recipes ({matches.length} Available)
              </h3>
              <p className="text-xs text-slate-400">
                Portioned for a family of {servings} (ensuring generous 1-2 meal batches with
                leftover repurposing).
              </p>
            </div>
            <span className="terracotta-badge font-mono">Max cooking limit: {maxMinutes} min</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {matches.map((r) => {
              const cost = (r.costPkr / r.serves) * servings;
              const costPerHead = Math.round(cost / servings);

              return (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-2xl border border-[#c85a32]/35 bg-slate-900/85 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-[#e07a5f]/60 hover:shadow-[0_10px_35px_rgba(200,90,50,0.22)]"
                >
                  <div className="p-5 sm:p-6">
                    {/* Header: Title, Urdu, Match Badge & Cooking Style Pill */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <span className="terracotta-badge text-[10px] mb-1.5">
                          {r.cookingStyle}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                          {r.name}
                        </h3>
                        <p className="text-xs text-[#ffaa88]/90 font-medium font-urdu mt-0.5">
                          {r.urdu}
                        </p>
                      </div>
                      <span className="shrink-0 badge-safe font-mono text-xs">
                        100% Leftover Match
                      </span>
                    </div>

                    {/* Meta Info: Time, Portion, Batch Cost */}
                    <div className="mt-3.5 flex flex-wrap gap-2.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-slate-200 font-mono bg-slate-950/60 border border-white/[0.06] px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-[#ffaa88]" />
                        <span>
                          Prep {r.prepMinutes}m · Cook {r.cookTimeFormatted}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-200 font-mono bg-slate-950/60 border border-white/[0.06] px-2.5 py-1 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{r.portionSize}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-bold font-mono bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                        <span>~{pkr(cost)} total</span>
                      </span>
                    </div>

                    {/* Matched Leftovers & Strict Zero-Grocery Guarantee */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                      {r.matched.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300"
                        >
                          ✓ Using Leftover: {m}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#c85a32]/50 bg-[#c85a32]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#ffaa88]">
                        🛡️ Zero Extra Grocery Needed
                      </span>
                    </div>

                    {/* Estimated Budget Breakdown Box */}
                    <div className="mt-4 rounded-xl border border-white/[0.08] bg-slate-950/60 p-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                        <span className="flex items-center gap-1.5 text-[#ffaa88]">
                          <Wallet className="h-3.5 w-3.5 text-[#ffaa88]" />
                          Family Budget Breakdown ({servings} Persons)
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ~{pkr(costPerHead)} / person
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
                        <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                          <p className="text-muted-foreground text-[10px]">Leftovers Salvaged</p>
                          <p className="font-mono font-bold text-[#ffaa88]">
                            +{pkr(r.budgetBreakdown.leftoverRescuePkr)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                          <p className="text-muted-foreground text-[10px]">Fresh Staples/Ghee</p>
                          <p className="font-mono font-bold text-slate-300">
                            ~{pkr(r.budgetBreakdown.freshStaplesPkr)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                          <p className="text-muted-foreground text-[10px]">Total Family Batch</p>
                          <p className="font-mono font-bold text-emerald-400">~{pkr(cost)}</p>
                        </div>
                        <div className="rounded-lg bg-slate-900/80 p-2 border border-white/[0.05]">
                          <p className="text-muted-foreground text-[10px]">Family Yield</p>
                          <p className="font-bold text-amber-300 truncate">1–2 Full Meals</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400 italic leading-relaxed">
                        {r.budgetBreakdown.notes}
                      </p>
                    </div>

                    {/* Mandatory Step-by-Step Cooking Method Section (Directly Below Budget Breakdown) */}
                    <div className="mt-4 rounded-xl border border-[#c85a32]/35 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2.5">
                        <span className="text-xs font-bold text-[#ffaa88] flex items-center gap-2">
                          <ChefHat className="h-4 w-4 text-[#ffaa88]" />
                          Step-by-Step Cooking Method ({r.steps.length} Steps)
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400">
                          ✓ Authentic Desi Family Recipe
                        </span>
                      </div>

                      <ol className="space-y-2.5 text-xs">
                        {r.steps.map((step, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-slate-900/85 p-3 leading-relaxed text-slate-200"
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#c85a32]/25 text-[11px] font-bold text-[#ffaa88] font-mono border border-[#c85a32]/45 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-slate-200 text-xs leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>

                      {/* Home Pantry Staples & Aromatics */}
                      <div className="mt-3 rounded-lg bg-slate-900/70 p-2.5 border border-white/[0.06] text-[11px] text-slate-300">
                        <span className="font-semibold text-[#ffaa88]">
                          Pantry Staples & Aromatics:{" "}
                        </span>
                        {r.pantry.join(" · ")}
                      </div>
                    </div>

                    {/* Leftover Repurposing & Multi-Meal Guide */}
                    <div className="mt-3.5 rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs leading-relaxed text-amber-200/90">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        Leftover Repurposing & Multi-Meal Guide:
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-100/90">
                        {r.repurposingTip}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center border-t border-white/[0.08] pt-3.5">
                      <button
                        type="button"
                        onClick={() => toggleCooked(r.id)}
                        className={`min-h-10 flex-1 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                          cooked.includes(r.id)
                            ? "btn-primary shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            : "border border-white/[0.1] bg-slate-900/80 text-slate-300 hover:border-white/[0.2] hover:text-white"
                        }`}
                      >
                        {cooked.includes(r.id)
                          ? "✓ Cooked — Saving Banked"
                          : "Mark as Cooked (Bank Saving)"}
                      </button>
                      <ShareReportButton
                        title={`Authentic Desi Recipe: ${r.name}`}
                        urduTitle={r.urdu}
                        category="recipe"
                        totalCostLabel="Family Batch Cost"
                        totalCostValue={`~${pkr(cost)} (${servings} persons)`}
                        savingsValue={`+${pkr(r.budgetBreakdown.leftoverRescuePkr)} Salvaged`}
                        breakdown={[
                          { label: "Cooking Time", value: r.cookTimeFormatted },
                          { label: "Portion Size", value: r.portionSize },
                          { label: "Cost Per Person", value: `~${pkr(costPerHead)} / plate` },
                          { label: "Leftovers Used", value: r.matched.join(", ") },
                          { label: "Steps Count", value: `${r.steps.length} detailed steps` },
                        ]}
                        advice={r.repurposingTip}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
