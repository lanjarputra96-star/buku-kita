import { useMemo, useState } from "react";
import { Search, BookOpen, Library } from "lucide-react";
import { PageHeader, Panel, Badge } from "@/components/sibudi/ui-kit";
import { EbookReader } from "@/components/sibudi/ebook-reader";
import { useSibudi, type Ebook } from "@/lib/sibudi-store";

/** Rak e-book bersama untuk portal guru dan orang tua. */
export function EbookLibrary({ desc }: { desc: string }) {
  const { state } = useSibudi();
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [aktif, setAktif] = useState<Ebook | null>(null);

  const kategori = useMemo(
    () => ["Semua", ...Array.from(new Set(state.ebook.map((e) => e.kategori).filter(Boolean)))],
    [state.ebook],
  );

  const hasil = useMemo(() => {
    const key = q.trim().toLowerCase();
    return state.ebook.filter((e) => {
      const cocokKat = kat === "Semua" || e.kategori === kat;
      const cocokKey =
        !key ||
        [e.judul, e.penulis, e.kategori, e.kelas, e.deskripsi].some((v) => (v ?? "").toLowerCase().includes(key));
      return cocokKat && cocokKey;
    });
  }, [state.ebook, q, kat]);

  return (
    <>
      <PageHeader title="Baca E-Book" desc={desc} />

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, penulis, atau kategori…"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {kategori.map((k) => (
              <button
                key={k}
                onClick={() => setKat(k)}
                className={[
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  k === kat ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-muted",
                ].join(" ")}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {hasil.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Library className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold">Belum ada buku digital</p>
            <p className="text-xs text-muted-foreground">
              {state.ebook.length === 0 ? "Petugas perpustakaan belum mengunggah buku." : "Tidak ada buku yang cocok dengan pencarian."}
            </p>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {hasil.map((e) => (
            <article key={e.id} className="card-surface flex flex-col overflow-hidden p-0">
              <div className="relative flex h-40 items-end bg-primary/90 p-4 text-primary-foreground">
                <span className="absolute inset-y-0 left-0 w-2.5 bg-black/25" />
                <div>
                  <p className="line-clamp-2 text-sm font-bold leading-snug">{e.judul}</p>
                  <p className="mt-1 text-[11px] opacity-90">{e.penulis || "Tanpa penulis"}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {e.kategori ? <Badge tone="info">{e.kategori}</Badge> : null}
                  {e.kelas ? <Badge tone="primary">Kelas {e.kelas}</Badge> : null}
                </div>
                {e.deskripsi ? <p className="line-clamp-3 text-xs text-muted-foreground">{e.deskripsi}</p> : null}
                <button
                  onClick={() => setAktif(e)}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <BookOpen className="size-4" /> Baca Buku
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {aktif ? <EbookReader ebook={aktif} onClose={() => setAktif(null)} /> : null}
    </>
  );
}
