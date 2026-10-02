import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Loader2, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Ebook } from "@/lib/sibudi-store";

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number };
    render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void>; cancel: () => void };
  }>;
};

/** Pembaca e-book bergaya buku: dua halaman berdampingan + efek membuka halaman. */
export function EbookReader({ ebook, onClose }: { ebook: Ebook; onClose: () => void }) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [spread, setSpread] = useState(true);
  const [err, setErr] = useState("");
  const [flip, setFlip] = useState<"next" | "prev" | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [pseudoFull, setPseudoFull] = useState(false);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setSpread(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
          (worker as { default: string }).default;
        const { data, error } = await supabase.storage.from("ebooks").createSignedUrl(ebook.path, 3600);
        if (error || !data?.signedUrl) throw new Error("Berkas buku tidak dapat dibuka.");
        const loaded = await (pdfjs as unknown as { getDocument: (o: { url: string }) => { promise: Promise<PdfDoc> } })
          .getDocument({ url: data.signedUrl }).promise;
        if (!alive) return;
        setDoc(loaded);
        setTotal(loaded.numPages);
        setPage(1);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Gagal memuat buku.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [ebook.path]);

  const draw = useCallback(
    async (n: number, canvas: HTMLCanvasElement | null) => {
      if (!doc || !canvas) return;
      if (n < 1 || n > doc.numPages) {
        const ctx = canvas.getContext("2d");
        canvas.width = 0;
        canvas.height = 0;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const p = await doc.getPage(n);
      const base = p.getViewport({ scale: 1 });
      const maxH = Math.min(window.innerHeight - (immersive ? 110 : 210), 1400);
      const displayScale = (maxH / base.height) * zoom;
      // Render pada resolusi layar asli (HD/retina) lalu tampilkan pada ukuran CSS.
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const viewport = p.getViewport({ scale: displayScale * dpr });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${Math.round(base.width * displayScale)}px`;
      canvas.style.height = `${Math.round(base.height * displayScale)}px`;
      await p.render({ canvasContext: ctx, viewport }).promise;
    },
    [doc, zoom, immersive],
  );

  useEffect(() => {
    if (!doc) return;
    void draw(page, leftRef.current);
    if (spread) void draw(page + 1, rightRef.current);
  }, [doc, page, spread, zoom, draw]);

  const immersive = isFull || pseudoFull;

  const toggleFull = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      // Layar penuh browser diblokir (mis. di dalam iframe preview): pakai mode penuh CSS.
      setPseudoFull((f) => !f);
    }
  }, []);

  useEffect(() => {
    const h = () => {
      setIsFull(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement) setPseudoFull(false);
    };
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const step = spread ? 2 : 1;
  const canPrev = page > 1;
  const canNext = page + step <= total;

  const go = useCallback(
    (dir: "next" | "prev") => {
      setFlip(dir);
      setTimeout(() => setFlip(null), 320);
      setPage((p) => {
        const next = dir === "next" ? p + step : p - step;
        return Math.min(Math.max(next, 1), Math.max(total - (spread ? 1 : 0), 1));
      });
    },
    [step, total, spread],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canNext) go("next");
      if (e.key === "ArrowLeft" && canPrev) go("prev");
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canNext, canPrev, go, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/90 backdrop-blur-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-background">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{ebook.judul}</p>
          <p className="truncate text-[11px] opacity-80">
            {ebook.penulis || "Tanpa penulis"} • {ebook.kategori}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} className={ctrl} aria-label="Perkecil">
            <ZoomOut className="size-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))} className={ctrl} aria-label="Perbesar">
            <ZoomIn className="size-4" />
          </button>
          <button onClick={onClose} className={ctrl} aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center gap-3 overflow-auto px-3 pb-2">
        <button onClick={() => go("prev")} disabled={!canPrev} className={navBtn} aria-label="Halaman sebelumnya">
          <ChevronLeft className="size-5" />
        </button>

        {err ? (
          <p className="rounded-2xl bg-background px-6 py-8 text-sm text-destructive">{err}</p>
        ) : !doc ? (
          <p className="flex items-center gap-2 rounded-2xl bg-background px-6 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" /> Membuka buku…
          </p>
        ) : (
          <div
            className={[
              "flex origin-center rounded-md bg-[#efe7d8] p-2 shadow-2xl transition-transform duration-300",
              flip === "next" ? "-rotate-y-2 scale-[0.985]" : flip === "prev" ? "scale-[0.985]" : "",
            ].join(" ")}
            style={{ perspective: "1600px" }}
          >
            <div className="relative bg-white shadow-inner">
              <canvas ref={leftRef} className="block max-h-[76vh]" />
              {spread ? <span className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/20 to-transparent" /> : null}
            </div>
            {spread ? (
              <div className="relative bg-white shadow-inner">
                <canvas ref={rightRef} className="block max-h-[76vh]" />
                <span className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent" />
              </div>
            ) : null}
          </div>
        )}

        <button onClick={() => go("next")} disabled={!canNext} className={navBtn} aria-label="Halaman berikutnya">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <footer className="flex items-center justify-center gap-3 px-4 pb-4 text-background">
        <span className="text-xs">
          Halaman {page}
          {spread && page + 1 <= total ? `–${page + 1}` : ""} dari {total || "?"}
        </span>
        <input
          type="range"
          min={1}
          max={Math.max(total, 1)}
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
          className="h-1 w-64 max-w-[50vw] accent-background"
          aria-label="Geser halaman"
        />
      </footer>
    </div>
  );
}

const ctrl = "inline-flex size-9 items-center justify-center rounded-xl bg-background/15 hover:bg-background/25";
const navBtn =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg disabled:opacity-30";
