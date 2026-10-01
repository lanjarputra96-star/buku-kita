import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Trash2, BookOpen, Image } from "lucide-react";
import { PageHeader, Panel, Badge, Field } from "@/components/sibudi/ui-kit";
import { EbookReader } from "@/components/sibudi/ebook-reader";
import { useSibudi, newId, fmtTanggal, type Ebook } from "@/lib/sibudi-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/ebook")({
  ssr: false,
  component: AdminEbook,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const empty = { judul: "", penulis: "", kategori: "", kelas: "", deskripsi: "" };

function AdminEbook() {
  const { state, update, log } = useSibudi();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [aktif, setAktif] = useState<Ebook | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const simpan = async () => {
    setMsg("");
    if (!file) return setMsg("Pilih file PDF terlebih dahulu.");
    if (file.type !== "application/pdf") return setMsg("File harus berformat PDF.");
    if (file.size > 50 * 1024 * 1024) return setMsg("Ukuran file maksimal 50 MB.");
    if (!cover) return setMsg("Pilih gambar sampul terlebih dahulu.");
    if (!cover.type.startsWith("image/")) return setMsg("Sampul harus berupa gambar JPG, PNG, atau WEBP.");
    if (cover.size > 5 * 1024 * 1024) return setMsg("Ukuran gambar sampul maksimal 5 MB.");
    const judul = form.judul.trim() || file.name.replace(/\.pdf$/i, "");
    setBusy(true);
    const id = newId("EB");
    const path = `${id}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("ebooks").upload(path, file, { contentType: "application/pdf" });
    if (error) {
      setBusy(false);
      return setMsg("Gagal mengunggah: " + error.message);
    }
    const ext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
    const coverPath = `covers/${id}-${Date.now()}.${ext}`;
    const { error: coverError } = await supabase.storage.from("ebooks").upload(coverPath, cover, { contentType: cover.type });
    setBusy(false);
    if (coverError) {
      await supabase.storage.from("ebooks").remove([path]);
      return setMsg("Gagal mengunggah sampul: " + coverError.message);
    }
    const eb: Ebook = { id, ...form, judul, path, coverPath, ukuran: file.size, tanggal: new Date().toISOString() };
    update((s) => ({ ...s, ebook: [eb, ...s.ebook] }));
    log(`Mengunggah e-book "${judul}"`, "E-Book");
    setForm(empty);
    setFile(null);
    setCover(null);
    setInputKey((k) => k + 1);
    setMsg("E-book berhasil diunggah.");
  };

  const hapus = async (e: Ebook) => {
    if (!confirm(`Hapus e-book "${e.judul}"?`)) return;
    await supabase.storage.from("ebooks").remove([e.path, ...(e.coverPath ? [e.coverPath] : [])]);
    update((s) => ({ ...s, ebook: s.ebook.filter((x) => x.id !== e.id) }));
    log(`Menghapus e-book "${e.judul}"`, "E-Book");
  };

  return (
    <>
      <PageHeader title="E-Book" desc="Unggah buku digital (PDF) yang dapat dibaca di portal guru dan orang tua." />

      <Panel title="Unggah E-Book">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="File PDF">
            <input key={inputKey} type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inputCls} />
          </Field>
          <Field label="Gambar Sampul">
            <input key={`cover-${inputKey}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className={inputCls} />
          </Field>
          <Field label="Judul">
            <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className={inputCls} placeholder="Judul buku" />
          </Field>
          <Field label="Penulis">
            <input value={form.penulis} onChange={(e) => setForm({ ...form, penulis: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Kategori">
            <input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className={inputCls} placeholder="Contoh: Cerita Anak" list="eb-kat" />
            <datalist id="eb-kat">
              {Array.from(new Set(state.ebook.map((e) => e.kategori).filter(Boolean))).map((k) => <option key={k} value={k} />)}
            </datalist>
          </Field>
          <Field label="Kelas">
            <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} className={inputCls} placeholder="Contoh: 5A" />
          </Field>
          <Field label="Deskripsi">
            <input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button disabled={busy} onClick={simpan} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Upload className="size-4" /> {busy ? "Mengunggah…" : "Unggah E-Book"}
          </button>
          {msg ? <span className="text-xs text-muted-foreground">{msg}</span> : null}
        </div>
      </Panel>

      <Panel title={`Daftar E-Book (${state.ebook.length})`}>
        {state.ebook.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada e-book.</p>
        ) : (
          <div className="divide-y divide-border">
            {state.ebook.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Image className="size-5" />
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-semibold">{e.judul}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.penulis || "Tanpa penulis"} • {(e.ukuran / 1024 / 1024).toFixed(1)} MB • {fmtTanggal(e.tanggal)}
                  </p>
                </div>
                {e.kategori ? <Badge tone="info">{e.kategori}</Badge> : null}
                {e.kelas ? <Badge tone="primary">Kelas {e.kelas}</Badge> : null}
                <button onClick={() => setAktif(e)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  <BookOpen className="size-3.5" /> Baca
                </button>
                <button onClick={() => hapus(e)} className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">
                  <Trash2 className="size-3.5" /> Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {aktif ? <EbookReader ebook={aktif} onClose={() => setAktif(null)} /> : null}
    </>
  );
}
