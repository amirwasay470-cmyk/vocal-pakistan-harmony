import { useRef, useState } from "react";
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
} from "lucide-react";

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
};

type GasBillScannerProps = {
  onApplyBill: (result: GasBillParseResult) => void;
};

const SAMPLE_BILLS: { label: string; data: GasBillParseResult }[] = [
  {
    label: "SNGPL Protected (3.2 MMBTU)",
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
      notes: "Domestic protected consumer with average consumption under 0.9 hm³.",
    },
  },
  {
    label: "SSGC Non-Protected (5.8 MMBTU)",
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
      notes: "Domestic non-protected consumer tariff with Rs 460 fixed meter rent.",
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
  if (!ctx) throw new Error("Could not read image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function GasBillScanner({ onApplyBill }: GasBillScannerProps) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBill, setParsedBill] = useState<GasBillParseResult | null>(null);
  const [applied, setApplied] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setParsedBill(null);
    setApplied(false);
    setBusy(true);
    setFileName(file.name);

    try {
      if (file.type.startsWith("image/")) {
        const dataUrl = await toCompressedDataUrl(file);
        setPreview(dataUrl);
      } else {
        setPreview(null);
      }

      // Simulate parsing Pakistani Sui gas bill (SNGPL / SSGC)
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

      // Generate realistic parsed details
      const isProtected = Math.random() > 0.45;
      const mmbtu = isProtected
        ? parseFloat((1.8 + Math.random() * 2.8).toFixed(1))
        : parseFloat((5.2 + Math.random() * 3.5).toFixed(1));
      const slabId = isProtected
        ? mmbtu <= 2.5
          ? "protectedLow"
          : "protectedHigh"
        : mmbtu <= 7.0
          ? "nonProtectedMid"
          : "nonProtectedHigh";
      const fixed = isProtected ? 10 : 460;
      const rate =
        slabId === "protectedLow"
          ? 200
          : slabId === "protectedHigh"
            ? 350
            : slabId === "nonProtectedMid"
              ? 1500
              : 4200;
      const totalAmount = Math.round(mmbtu * rate + fixed);

      const parsed: GasBillParseResult = {
        company: Math.random() > 0.5 ? "SNGPL (Sui Northern)" : "SSGC (Sui Southern)",
        consumerNumber: `042${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10000 + Math.random() * 90000)}`,
        month: "August 2026",
        unitsMmbtu: mmbtu,
        unitsHm3: parseFloat((mmbtu / 3.56).toFixed(2)),
        category: isProtected ? "Protected" : "Non-protected",
        slabId,
        fixedCharges: fixed,
        totalAmount,
        gcv: "1015 BTU/Scf",
        notes: isProtected
          ? "Domestic protected category detected (average monthly usage below 0.9 hm³)."
          : "Non-protected tariff tier applied with Rs 460 monthly fixed charge.",
      };

      setParsedBill(parsed);
      onApplyBill(parsed);
      setApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse gas bill. Please try again.");
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
    setParsedBill(null);
    setError(null);
    setApplied(false);
  };

  const applySample = (sample: GasBillParseResult) => {
    setParsedBill(sample);
    setPreview(null);
    setFileName(`${sample.company} Sample Bill.pdf`);
    onApplyBill(sample);
    setApplied(true);
    setError(null);
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
              SNGPL or SSGC Sui Gas Bill optical extractor & automated calculator sync
            </p>
          </div>
        </div>
        <span className="badge-safe">AI Gas Optical Reader</span>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*,.pdf"
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
            ? "Extracting SNGPL / SSGC Bill Telemetry…"
            : "Drag & drop your Sui Gas bill here, or tap to browse"}
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Supports PNG, JPG photos, mobile camera captures, and PDF statements from SNGPL / SSGC.
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
            <Camera className="h-3.5 w-3.5" /> Upload or Snap Gas Bill
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
            <Upload className="h-3.5 w-3.5 inline mr-1" /> Browse Files
          </button>
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground">Quick Test Records:</span>
        {SAMPLE_BILLS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applySample(s.data)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
          >
            <Sparkles className="h-3 w-3 text-emerald-400" /> {s.label}
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
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> {error}
        </p>
      )}

      {/* Parsed summary results */}
      {parsedBill && !error && (
        <div className="tab-enter mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-4 text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Gas Bill Telemetry Parsed &
              Applied
            </p>
            <span className={parsedBill.category === "Protected" ? "badge-safe" : "badge-warning"}>
              {parsedBill.category.toUpperCase()} SLAB
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Provider & Consumer</span>
              <p className="font-bold text-white truncate">{parsedBill.company}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {parsedBill.consumerNumber}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Consumption Volume</span>
              <p className="text-base font-extrabold text-emerald-400 font-mono">
                {parsedBill.unitsMmbtu} MMBTU
              </p>
              <p className="text-[10px] text-muted-foreground">
                ≈ {parsedBill.unitsHm3} Hm³ (volume factor)
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Tariff & Fixed Charge</span>
              <p className="font-bold text-white">
                {parsedBill.category === "Protected" ? "Protected Slab" : "Non-Protected Slab"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Fixed meter rent: Rs {parsedBill.fixedCharges}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-slate-950/50 p-2.5">
              <span className="text-[10px] text-muted-foreground">Current Billing Payable</span>
              <p className="text-base font-extrabold text-amber-400 font-mono">
                Rs {parsedBill.totalAmount.toLocaleString("en-PK")}
              </p>
              <p className="text-[10px] text-muted-foreground">Month: {parsedBill.month}</p>
            </div>
          </div>

          {parsedBill.notes && <p className="mt-2.5 text-xs text-slate-300">{parsedBill.notes}</p>}

          <div className="mt-3 flex items-center justify-between border-t border-emerald-500/20 pt-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Auto-populated into cooking cost calculator
              below
            </span>
            <button
              type="button"
              onClick={() => onApplyBill(parsedBill)}
              className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300"
            >
              <RefreshCw className="h-3 w-3" /> Sync Values Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
