import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export function BarcodeScanner({ onDetected, onClose }: { onDetected: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
          if (result && !cancelled) {
            cancelled = true;
            onDetected(result.getText());
          }
        });
        stop = () => controls.stop();
      } catch {
        setError("Kamera tidak dapat diakses. Gunakan input manual di bawah.");
      }
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/60 p-4">
      <div className="card-surface w-full max-w-md p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Camera className="size-4" /> Scan Barcode Buku
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl bg-muted">
          <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
        </div>
        {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
        <ManualEntry onSubmit={onDetected} />
      </div>
    </div>
  );
}

function ManualEntry({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) onSubmit(v.trim());
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Atau ketik/tempel kode barcode"
        className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Gunakan</button>
    </form>
  );
}
