import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Upload, ScanLine, LoaderCircle, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, X } from "lucide-react";
import { scanBill, type BillScan } from "@/lib/bill-scan.functions";

async function toCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function BillScanner({ onExtract }: { onExtract: (scan: BillScan) => void }) {
  const run = useServerFn(scanBill);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<BillScan | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setScan(null);
    setBusy(true);
    try {
      const dataUrl = await toCompressedDataUrl(file);
      setPreview(dataUrl);
      const result = await run({ data: { imageDataUrl: dataUrl } });
      setScan(result);
      onExtract(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that bill. Try a clearer photo.");
    } finally {
      setBusy(false);
      if (uploadRef.current) uploadRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  const clear = () => {
    setPreview(null);
    setScan(null);
    setError(null);
  };

  return (
    <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ScanLine className="h-4 w-4 text-primary" /> Scan your bill photo
        </p>
        <span className="status-badge">AI reader</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Take a photo or upload your electricity bill — the units, taxes and slab fill in
        automatically.
      </p>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          className="btn-primary disabled:opacity-60"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {busy ? "Reading bill…" : "Take photo"}
        </button>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          disabled={busy}
          className="btn-ghost disabled:opacity-60"
        >
          <Upload className="h-4 w-4" /> Upload image
        </button>
        {preview && (
          <button type="button" onClick={clear} className="btn-ghost">
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {preview && (
        <img
          src={preview}
          alt="Uploaded utility bill preview"
          className="mt-3 max-h-56 w-full rounded-xl border object-contain"
        />
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {scan && !error && (
        <div className="tab-enter mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" /> Bill read successfully
          </p>
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            <li>Units: {scan.units ?? "not found"}</li>
            <li>Amount: {scan.billAmount ?? "not found"}</li>
            <li>Taxes: {scan.taxes ?? "not found"}</li>
            <li>Slab: {scan.slab ?? "not found"}</li>
            <li>Company: {scan.disco ?? "not found"}</li>
            <li>Month: {scan.month ?? "not found"}</li>
          </ul>
          {scan.notes && <p className="mt-2 text-xs text-muted-foreground">{scan.notes}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            Please double-check the filled numbers against your paper bill.
          </p>
        </div>
      )}
    </div>
  );
}
