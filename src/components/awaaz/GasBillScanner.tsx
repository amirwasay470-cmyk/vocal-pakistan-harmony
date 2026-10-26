import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Camera,
  Upload,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
  X,
  FileText,
  Sparkles,
  RefreshCw,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  Info,
  Calendar,
  Hash,
  Flame,
  ArrowDownToLine,
  Check,
} from "lucide-react";
import { scanGasBill, type GasBillScan } from "@/lib/bill-scan.functions";

export type GasBillParseResult = {
  company: string;
  consumerNumber: string;
  month: string;
  unitsMmbtu: number;
  unitsHm3: number;
  category: "Protected" | "Non-protected";
  slabId: "protectedLow" | "protectedHigh" | "nonProtectedMid" | "nonProtectedHigh";
  fixedCharges: number;
  totalAmount: number;
  gcv: string;
  notes?: string;
  dueDate?: string;
  isDemo?: boolean;
};

type GasBillScannerProps = {
  onApplyBill: (result: GasBillParseResult) => void;
};

type ReviewFormData = {
  provider: string;
  consumerNumber: string;
  billingMonth: string;
  dueDate: string;
  consumptionValue: string;
  consumptionUnit: "hm³" | "MMBTU" | "m³";
  category: "Protected" | "Non-protected" | "Unknown";
  fixedCharges: string;
  totalAmount: string;
  notes: string;
  source: "live_ai" | "demo_preset";
  detectedFlags: {
    provider: boolean;
    consumerNumber: boolean;
    billingMonth: boolean;
    consumption: boolean;
    category: boolean;
    fixedCharges: boolean;
    totalAmount: boolean;
    dueDate: boolean;
  };
};

const SAMPLE_BILLS: { label: string; data: GasBillParseResult }[] = [
  {
    label: "[DEMO] SNGPL Protected (3.2 MMBTU)",
    data: {
      company: "SNGPL (Sui Northern)",
      consumerNumber: "0429-8734-129",
      month: "August 2026",
      unitsMmbtu: 3.2,
      unitsHm3: 0.9,
      category: "Protected",
      slabId: "protectedHigh",
      fixedCharges: 10,
      totalAmount: 1130,
      gcv: "1015 BTU/Scf",
      dueDate: "20-Aug-2026",
      notes: "DEMO PRESET: Domestic protected consumer with average consumption under 0.9 hm³.",
      isDemo: true,
    },
  },
  {
    label: "[DEMO] SSGC Non-Protected (5.8 MMBTU)",
    data: {
      company: "SSGC (Sui Southern)",
      consumerNumber: "2981-4402-911",
      month: "August 2026",
      unitsMmbtu: 5.8,
      unitsHm3: 1.63,
      category: "Non-protected",
      slabId: "nonProtectedMid",
      fixedCharges: 460,
      totalAmount: 9160,
      gcv: "980 BTU/Scf",
      dueDate: "25-Aug-2026",
      notes: "DEMO PRESET: Domestic non-protected consumer tariff with Rs 460 fixed meter rent.",
      isDemo: true,
    },
  },
];

async function toCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image on canvas.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

const computeSlabId = (
  category: "Protected" | "Non-protected",
  mmbtu: number,
): "protectedLow" | "protectedHigh" | "nonProtectedMid" | "nonProtectedHigh" => {
  if (category === "Protected") {
    return mmbtu <= 1.8 ? "protectedLow" : "protectedHigh";
  }
  return mmbtu <= 7.0 ? "nonProtectedMid" : "nonProtectedHigh";
};

export function GasBillScanner({ onApplyBill }: GasBillScannerProps) {
  const runScanGasBill = useServerFn(scanGasBill);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData | null>(null);
  const [appliedBillResult, setAppliedBillResult] = useState<GasBillParseResult | null>(null);
  const [applied, setApplied] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setReviewForm(null);
    setAppliedBillResult(null);
    setApplied(false);
    setBusy(true);
    setFileName(file.name);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Please upload an image file (PNG, JPG, WebP) or camera photo of your SNGPL / SSGC bill.",
        );
      }

      const dataUrl = await toCompressedDataUrl(file);
      setPreview(dataUrl);

      // Invoke server-side Gemini Vision OCR
      const scan: GasBillScan = await runScanGasBill({ data: { imageDataUrl: dataUrl } });

      if (!scan.isGasBill) {
        setError(
          scan.notes ||
            "Could not identify a valid Pakistani gas bill (SNGPL or SSGC) from this image. Please ensure the bill is well-lit, clearly legible, and shows the header and readings.",
        );
        return;
      }

      // Check if all critical fields are completely absent
      const hasConsumption =
        scan.consumptionValue !== null || scan.mmbtu !== null || scan.hm3 !== null;
      const hasPayable = scan.totalAmount !== null;

      const detectedUnit: "hm³" | "MMBTU" | "m³" = scan.consumptionUnit
        ?.toLowerCase()
        .includes("mmbtu")
        ? "MMBTU"
        : scan.consumptionUnit?.toLowerCase().includes("m3") ||
            scan.consumptionUnit?.toLowerCase().includes("m³")
          ? "m³"
          : "hm³";

      const initialVal =
        scan.consumptionValue !== null
          ? String(scan.consumptionValue)
          : scan.mmbtu !== null
            ? String(scan.mmbtu)
            : scan.hm3 !== null
              ? String(scan.hm3)
              : "";

      const detectedCat = scan.category || "Unknown";
      const initialFixed =
        scan.fixedCharges !== null
          ? String(scan.fixedCharges)
          : detectedCat === "Protected"
            ? "10"
            : detectedCat === "Non-protected"
              ? "460"
              : "";

      setReviewForm({
        provider: scan.provider || "SNGPL (Sui Northern)",
        consumerNumber: scan.consumerNumber || "",
        billingMonth: scan.billingMonth || "",
        dueDate: scan.dueDate || "",
        consumptionValue: initialVal,
        consumptionUnit: detectedUnit,
        category: detectedCat,
        fixedCharges: initialFixed,
        totalAmount: scan.totalAmount !== null ? String(scan.totalAmount) : "",
        notes: scan.notes || "",
        source: "live_ai",
        detectedFlags: {
          provider: scan.provider !== null,
          consumerNumber: scan.consumerNumber !== null,
          billingMonth: scan.billingMonth !== null,
          consumption: hasConsumption,
          category: scan.category !== null,
          fixedCharges: scan.fixedCharges !== null,
          totalAmount: hasPayable,
          dueDate: scan.dueDate !== null,
        },
      });

      if (!hasConsumption && !hasPayable) {
        setError(
          "Scan partially completed, but key readings (consumption volume or payable amount) were missing or unreadable on the bill. Please enter them in the review form below.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse gas bill. Please try again with a clearer photo.",
      );
    } finally {
      setBusy(false);
      if (uploadRef.current) uploadRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const clear = () => {
    setPreview(null);
    setFileName(null);
    setReviewForm(null);
    setAppliedBillResult(null);
    setError(null);
    setApplied(false);
  };

  const applySample = (sample: (typeof SAMPLE_BILLS)[number]) => {
    setError(null);
    setPreview(null);
    setFileName(`${sample.data.company} [DEMO DATA RECORD]`);
    setApplied(false);

    setReviewForm({
      provider: sample.data.company,
      consumerNumber: sample.data.consumerNumber,
      billingMonth: sample.data.month,
      dueDate: sample.data.dueDate || "20-Aug-2026",
      consumptionValue: String(sample.data.unitsMmbtu),
      consumptionUnit: "MMBTU",
      category: sample.data.category,
      fixedCharges: String(sample.data.fixedCharges),
      totalAmount: String(sample.data.totalAmount),
      notes: sample.data.notes || "DEMO preset record for simulation and testing.",
      source: "demo_preset",
      detectedFlags: {
        provider: true,
        consumerNumber: true,
        billingMonth: true,
        consumption: true,
        category: true,
        fixedCharges: true,
        totalAmount: true,
        dueDate: true,
      },
    });
  };

  // Convert review form readings to standard MMBTU & hm3
  const getComputedTelemetry = (form: ReviewFormData) => {
    const rawVal = parseFloat(form.consumptionValue) || 0;
    let mmbtu = 0;
    let hm3 = 0;

    if (form.consumptionUnit === "hm³") {
      hm3 = rawVal;
      mmbtu = parseFloat((hm3 * 3.56).toFixed(2));
    } else if (form.consumptionUnit === "MMBTU") {
      mmbtu = rawVal;
      hm3 = parseFloat((mmbtu / 3.56).toFixed(2));
    } else {
      // m³: 1 hm³ = 100 m³
      hm3 = parseFloat((rawVal / 100).toFixed(2));
      mmbtu = parseFloat((hm3 * 3.56).toFixed(2));
    }

    const finalCategory: "Protected" | "Non-protected" =
      form.category === "Non-protected"
        ? "Non-protected"
        : form.category === "Protected"
          ? "Protected"
          : hm3 <= 0.9 || mmbtu <= 3.2
            ? "Protected"
            : "Non-protected";

    const slabId = computeSlabId(finalCategory, mmbtu);
    const fixed = parseFloat(form.fixedCharges) || (finalCategory === "Protected" ? 10 : 460);
    const totalAmount = Math.round(parseFloat(form.totalAmount) || 0);

    return { mmbtu, hm3, finalCategory, slabId, fixed, totalAmount };
  };

  const handleConfirmAndApply = () => {
    if (!reviewForm) return;

    const { mmbtu, hm3, finalCategory, slabId, fixed, totalAmount } =
      getComputedTelemetry(reviewForm);

    const result: GasBillParseResult = {
      company: reviewForm.provider || "SNGPL (Sui Northern)",
      consumerNumber: reviewForm.consumerNumber || "N/A",
      month: reviewForm.billingMonth || "Current Billing Cycle",
      unitsMmbtu: mmbtu,
      unitsHm3: hm3,
      category: finalCategory,
      slabId,
      fixedCharges: fixed,
      totalAmount,
      gcv: "1015 BTU/Scf",
      notes: reviewForm.notes || undefined,
      dueDate: reviewForm.dueDate || undefined,
      isDemo: reviewForm.source === "demo_preset",
    };

    onApplyBill(result);
    setAppliedBillResult(result);
    setApplied(true);
  };

  return (
    <div className="dashboard-card p-5 sm:p-6 border-emerald-500/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Upload or Snap Gas Bill</h4>
            <p className="text-xs text-muted-foreground">
              Real AI extraction for SNGPL & SSGC Sui Gas bills with user review & confirmation
            </p>
          </div>
        </div>
        <span className="badge-safe">Gemini Vision OCR</span>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void processFile(f);
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void processFile(f);
        }}
      />

      {/* Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadRef.current?.click()}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragActive
            ? "border-emerald-500 bg-emerald-500/15 scale-[1.01] shadow-[0_0_25px_rgba(16,185,129,0.25)]"
            : "border-white/[0.12] bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-900/80"
        }`}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          {busy ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>
        <p className="mt-3 text-sm font-bold text-white">
          {busy
            ? "Analyzing Bill with Gemini Vision…"
            : "Drag & drop your Sui Gas bill photo, or tap to browse"}
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Supports PNG, JPG, WebP camera snaps from SNGPL (Punjab/KP/AJK) & SSGC (Sindh/Balochistan).
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraRef.current?.click();
            }}
            disabled={busy}
            className="btn-primary py-2 px-4 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Camera className="h-3.5 w-3.5" /> Snap Bill with Camera
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              uploadRef.current?.click();
            }}
            disabled={busy}
            className="rounded-xl border border-white/[0.1] bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-white/[0.2] hover:text-white active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 inline mr-1" /> Browse Photos
          </button>
        </div>
      </div>

      {/* Manual sample DEMO chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Demo Test Records (No physical bill needed):
        </span>
        {SAMPLE_BILLS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applySample(s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-950/20 px-2.5 py-1 text-xs font-medium text-amber-200 transition hover:border-amber-500/40 hover:text-white"
          >
            <Sparkles className="h-3 w-3 text-amber-400" /> {s.label}
          </button>
        ))}
      </div>

      {/* Preview if uploaded */}
      {preview && (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-white/[0.1] bg-black/60">
          <img
            src={preview}
            alt="Gas bill preview"
            className="max-h-48 w-full object-contain p-2"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-slate-900/90 text-white shadow backdrop-blur transition hover:bg-black"
            aria-label="Remove preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {fileName && !preview && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-slate-900/60 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="truncate font-semibold text-white">{fileName}</span>
          </div>
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/25 p-3.5 text-xs text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Extraction Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Editable Review Form (Users must confirm before applying) */}
      {reviewForm && (
        <div className="tab-enter mt-5 rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Edit3 className="h-4 w-4" />
              </span>
              <div>
                <h5 className="font-bold text-white text-sm">
                  {reviewForm.source === "demo_preset"
                    ? "Review Demo Bill Data (Preset)"
                    : "Review AI Extracted Bill Details"}
                </h5>
                <p className="text-[11px] text-muted-foreground">
                  Verify or edit these values against your paper bill before applying to the
                  calculator.
                </p>
              </div>
            </div>
            <span
              className={
                reviewForm.source === "demo_preset"
                  ? "rounded-md border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-300"
                  : "rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
              }
            >
              {reviewForm.source === "demo_preset" ? "DEMO DATA" : "AI SCAN REVIEW"}
            </span>
          </div>

          {/* Review Form Fields Grid */}
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Provider */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Gas Provider</span>
                {reviewForm.detectedFlags.provider ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-amber-400">Not detected</span>
                )}
              </label>
              <select
                value={reviewForm.provider}
                onChange={(e) => setReviewForm({ ...reviewForm, provider: e.target.value })}
                className="w-full rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="SNGPL (Sui Northern)">SNGPL (Sui Northern Gas)</option>
                <option value="SSGC (Sui Southern)">SSGC (Sui Southern Gas)</option>
                <option value="Sui Gas (Other)">Other Sui Gas Connection</option>
              </select>
            </div>

            {/* 2. Consumer Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-muted-foreground" /> Consumer / Account #
                </span>
                {reviewForm.detectedFlags.consumerNumber ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Optional</span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. 0429-8734-129"
                value={reviewForm.consumerNumber}
                onChange={(e) => setReviewForm({ ...reviewForm, consumerNumber: e.target.value })}
                className="w-full rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* 3. Billing Month */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" /> Billing Month
                </span>
                {reviewForm.detectedFlags.billingMonth ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-amber-400">Missing</span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. August 2026"
                value={reviewForm.billingMonth}
                onChange={(e) => setReviewForm({ ...reviewForm, billingMonth: e.target.value })}
                className="w-full rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* 4. Consumption Value & Unit */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-emerald-400" /> Gas Consumption
                </span>
                {reviewForm.detectedFlags.consumption ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold">⚠️ Required</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.2"
                  value={reviewForm.consumptionValue}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, consumptionValue: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-bold text-emerald-300 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={reviewForm.consumptionUnit}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      consumptionUnit: e.target.value as "hm³" | "MMBTU" | "m³",
                    })
                  }
                  className="w-24 rounded-xl border border-white/[0.12] bg-slate-900 px-2 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="MMBTU">MMBTU</option>
                  <option value="hm³">hm³</option>
                  <option value="m³">m³</option>
                </select>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Equivalent: ≈ {getComputedTelemetry(reviewForm).mmbtu} MMBTU (
                {getComputedTelemetry(reviewForm).hm3} hm³)
              </p>
            </div>

            {/* 5. Tariff Category (Protected / Non-Protected) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Tariff Status (OGRA)</span>
                {reviewForm.detectedFlags.category ? (
                  <span className="text-[10px] text-emerald-400">✓ Stated on Bill</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Auto / Select</span>
                )}
              </label>
              <select
                value={reviewForm.category}
                onChange={(e) => {
                  const newCat = e.target.value as "Protected" | "Non-protected" | "Unknown";
                  const newFixed =
                    newCat === "Protected"
                      ? "10"
                      : newCat === "Non-protected"
                        ? "460"
                        : reviewForm.fixedCharges;
                  setReviewForm({
                    ...reviewForm,
                    category: newCat,
                    fixedCharges: newFixed,
                  });
                }}
                className="w-full rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Protected">Protected (Domestic &lt; 0.9 hm³ avg)</option>
                <option value="Non-protected">Non-Protected (Regular / Higher Tier)</option>
                <option value="Unknown">Not Explicitly Shown (Auto-select by usage)</option>
              </select>
              <p className="text-[10px] text-muted-foreground">
                Resolved:{" "}
                <strong className="text-white">
                  {getComputedTelemetry(reviewForm).finalCategory}
                </strong>
              </p>
            </div>

            {/* 6. Total Amount Payable */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Total Payable (PKR)</span>
                {reviewForm.detectedFlags.totalAmount ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold">⚠️ Required</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-muted-foreground font-semibold">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="e.g. 1850"
                  value={reviewForm.totalAmount}
                  onChange={(e) => setReviewForm({ ...reviewForm, totalAmount: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-slate-900 pl-9 pr-3 py-2 text-xs font-bold text-amber-300 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 7. Fixed Charges */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Fixed Meter Rent (PKR)</span>
                {reviewForm.detectedFlags.fixedCharges ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Slab default</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-muted-foreground font-semibold">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="10 or 460"
                  value={reviewForm.fixedCharges}
                  onChange={(e) => setReviewForm({ ...reviewForm, fixedCharges: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-slate-900 pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 8. Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Payment Due Date</span>
                {reviewForm.detectedFlags.dueDate ? (
                  <span className="text-[10px] text-emerald-400">✓ Detected</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Optional</span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. 18-Sep-2026"
                value={reviewForm.dueDate}
                onChange={(e) => setReviewForm({ ...reviewForm, dueDate: e.target.value })}
                className="w-full rounded-xl border border-white/[0.12] bg-slate-900 px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes display */}
          {reviewForm.notes && (
            <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-white/[0.08] bg-slate-900/60 p-2.5 text-xs text-slate-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-white">Scan Note:</strong> {reviewForm.notes}
              </p>
            </div>
          )}

          {/* Confirmation & Apply Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Only verified figures will be synced to the kitchen gas calculator.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="rounded-xl border border-white/[0.1] bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel / Reset
              </button>
              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Confirm & Apply to Gas Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applied Confirmation Banner */}
      {applied && appliedBillResult && (
        <div className="tab-enter mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Gas Bill Verified & Applied to Calculator
            </p>
            <span
              className={
                appliedBillResult.category === "Protected" ? "badge-safe" : "badge-warning"
              }
            >
              {appliedBillResult.category.toUpperCase()} SLAB
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Provider & Consumer</span>
              <p className="font-bold text-white truncate">{appliedBillResult.company}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {appliedBillResult.consumerNumber}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Consumption Volume</span>
              <p className="text-base font-extrabold text-emerald-400 font-mono">
                {appliedBillResult.unitsMmbtu} MMBTU
              </p>
              <p className="text-[10px] text-muted-foreground">
                ≈ {appliedBillResult.unitsHm3} hm³ volume
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Tariff & Fixed Charge</span>
              <p className="font-bold text-white">
                {appliedBillResult.category === "Protected"
                  ? "Protected Slab"
                  : "Non-Protected Slab"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Fixed meter rent: Rs {appliedBillResult.fixedCharges}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Current Billing Payable</span>
              <p className="text-base font-extrabold text-amber-400 font-mono">
                Rs {appliedBillResult.totalAmount.toLocaleString("en-PK")}
              </p>
              <p className="text-[10px] text-muted-foreground">Month: {appliedBillResult.month}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-emerald-500/20 pt-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Check className="h-3.5 w-3.5" /> Pipeline gas values are active in cooking
              calculator below
            </span>
            <button
              type="button"
              onClick={handleConfirmAndApply}
              className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300"
            >
              <RefreshCw className="h-3 w-3" /> Re-sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
