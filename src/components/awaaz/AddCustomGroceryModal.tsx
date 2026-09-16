import { useState } from "react";
import { Plus, X, Sparkles, Scale, Building2, Store } from "lucide-react";
import { type City } from "@/lib/awaaz-data";
import { type EssentialCommodity } from "@/lib/awaaz-market-intel";

export type CustomItemPayload = {
  name: string;
  urdu: string;
  category: "staple" | "vegetable" | "poultry" | "oil";
  unit: "kg" | "liter" | "dozen" | "packet" | "10 kg bag" | "pau (250g)";
  customQty?: number;
  dcOfficial: number;
  openMarket: number;
  marketNote?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  city: City;
  onAddItem: (item: EssentialCommodity, initialQty?: number) => void;
};

const UNIT_OPTIONS = [
  { value: "kg", label: "kg (کلو)" },
  { value: "liter", label: "liter (لیٹر)" },
  { value: "dozen", label: "dozen (درجن / 12 pcs)" },
  { value: "packet", label: "packet / pack (پیکٹ)" },
  { value: "10 kg bag", label: "10 kg bag (10 کلو تھیلا)" },
  { value: "pau (250g)", label: "Pau / 250g (پاؤ)" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "staple", label: "Grains, Flour & Sugar (اناج / دالیں / چینی)" },
  { value: "vegetable", label: "Vegetables & Produce (سبزیاں / پھل)" },
  { value: "poultry", label: "Meat, Poultry & Eggs (گوشت / مرغی / انڈے)" },
  { value: "oil", label: "Cooking Oil & Ghee (تیل و گھی)" },
] as const;

export function AddCustomGroceryModal({ isOpen, onClose, city, onAddItem }: Props) {
  const [name, setName] = useState("");
  const [urdu, setUrdu] = useState("");
  const [category, setCategory] = useState<"staple" | "vegetable" | "poultry" | "oil">("staple");
  const [unit, setUnit] = useState<string>("kg");
  const [quantity, setQuantity] = useState<number>(1);
  const [dcOfficial, setDcOfficial] = useState<string>("");
  const [openMarket, setOpenMarket] = useState<string>("");
  const [marketNote, setMarketNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter the item name (e.g. Basmati Rice, Eggs, Daal Mash).");
      return;
    }

    const dc = parseFloat(dcOfficial) || 0;
    const market = parseFloat(openMarket) || 0;

    if (dc <= 0 && market <= 0) {
      setError("Please enter at least an official DC rate or Open Market retail price.");
      return;
    }

    const effectiveDc = dc > 0 ? dc : Math.round(market * 0.85);
    const effectiveMarket = market > 0 ? market : Math.round(dc * 1.18);
    const id = `custom-${Date.now()}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const newCommodity: EssentialCommodity = {
      id,
      name: cleanName,
      urdu: urdu.trim() || cleanName,
      category,
      unit,
      rates: {
        Karachi: {
          dcOfficial: effectiveDc,
          openMarket: effectiveMarket,
          weeklyChangePct: 0.0,
          supplyStatus: "stable",
          dcNote: `User logged DC rate for ${city}`,
          marketNote: marketNote.trim() || `Verified locally in ${city}`,
        },
        Lahore: {
          dcOfficial: Math.round(effectiveDc * 0.98),
          openMarket: Math.round(effectiveMarket * 0.98),
          weeklyChangePct: 0.0,
          supplyStatus: "stable",
          dcNote: `User logged DC rate`,
          marketNote: marketNote.trim() || `Verified rate`,
        },
        Islamabad: {
          dcOfficial: Math.round(effectiveDc * 1.02),
          openMarket: Math.round(effectiveMarket * 1.02),
          weeklyChangePct: 0.0,
          supplyStatus: "stable",
          dcNote: `User logged DC rate`,
          marketNote: marketNote.trim() || `Verified rate`,
        },
      },
    };

    onAddItem(newCommodity, quantity > 0 ? quantity : 1);
    onClose();

    // Reset form
    setName("");
    setUrdu("");
    setDcOfficial("");
    setOpenMarket("");
    setMarketNote("");
    setError(null);
  };

  return (
    <div
      id="custom-grocery-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="custom-grocery-modal-card"
        className="relative w-full max-w-lg rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl transition-all sm:p-7"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Close custom grocery modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Add Custom Grocery / Item</h3>
            <p className="text-xs text-muted-foreground">
              Add your custom household item, DC price ceiling & open market rate for {city}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Item Name (English & Urdu) */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1">
                Item Name (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daal Moong, Farm Eggs, Shan Masala"
                className="input-base w-full min-h-10 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1">
                Urdu Title (اردو نام)
              </label>
              <input
                type="text"
                dir="rtl"
                value={urdu}
                onChange={(e) => setUrdu(e.target.value)}
                placeholder="مثلاً: دال مونگ، فارمی انڈے"
                className="input-base w-full min-h-10 text-xs font-medium"
              />
            </div>
          </div>

          {/* Category & Unit Selection */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="input-base w-full min-h-10 text-xs"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-base w-full min-h-10 text-xs"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity for Basket (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Default Household Basket Quantity ({unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="input-base w-32 min-h-10 text-xs font-semibold"
              />
              <span className="text-[11px] text-muted-foreground">
                Automatically included in weekly basket calculation
              </span>
            </div>
          </div>

          {/* Pricing Row: DC Official Rate vs Open Market Retail Rate */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border/70 bg-surface/60 p-3">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <Building2 className="h-3 w-3" /> DC Official Rate (PKR / {unit})
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rs.
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dcOfficial}
                  onChange={(e) => setDcOfficial(e.target.value)}
                  placeholder="e.g. 260"
                  className="input-base w-full min-h-10 pl-10 text-xs font-bold"
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Government notified rate ceiling
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-[var(--warning)] mb-1">
                <Store className="h-3 w-3" /> Open Market Retail (PKR / {unit})
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rs.
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={openMarket}
                  onChange={(e) => setOpenMarket(e.target.value)}
                  placeholder="e.g. 310"
                  className="input-base w-full min-h-10 pl-10 text-xs font-bold"
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Corner kiryana or local retail rate
              </p>
            </div>
          </div>

          {/* Sourcing / Market Notes */}
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Market Notes or Store Reference (Optional)
            </label>
            <input
              type="text"
              value={marketNote}
              onChange={(e) => setMarketNote(e.target.value)}
              placeholder="e.g. Available at Empress Market / Jodia Bazaar, loose packing"
              className="input-base w-full min-h-10 text-xs"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border/60 pt-4">
            <button type="button" onClick={onClose} className="btn-ghost py-2 px-4 text-xs">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-2 px-5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add to Rate Board & Basket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
