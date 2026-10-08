import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Search, Upload, ScanLine, Trash2, FileText } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, Field } from "@/components/sibudi/ui-kit";
import { BarcodeScanner } from "@/components/sibudi/barcode-scanner";
import { useSibudi, KELAS_LIST } from "@/lib/sibudi-store";
import { exportExcel, exportPdfTable, importExcel } from "@/lib/export-utils";
import type { Buku } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/master-buku")({
  component: MasterBuku,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function MasterBuku() {
  const { state, update, log } = useSibudi();
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [scan, setScan] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<Buku>({
    kode: "",
    judul: "",
    mapel: "",
    kelas: "",
    penerbit: "",
    stok: 0,
    dipinjam: 0,
    kondisi: "Baik",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState("");

  const rows = useMemo(
    () =>
      state.buku.filter(
        (b) =>
          (!q || `${b.judul} ${b.kode}`.toLowerCase().includes(q.toLowerCase())) &&
          (!kelas || b.kelas === kelas) &&
          (!kondisi || b.kondisi === kondisi),
      ),
    [state.buku, q, kelas, kondisi],
  );

  function simpan() {
    if (!form.kode.trim() || !form.judul.trim()) {
      setInfo("Kode dan judul buku wajib diisi.");
      return;
    }
    update((s) => ({ ...s, buku: [{ ...form, stok: Number(form.stok) || 0 }, ...s.buku] }));
    log(`Menambah buku ${form.kode} — ${form.judul}`, "Master Buku");
    setInfo(`Buku ${form.judul} berhasil ditambahkan.`);
    setOpenForm(false);
    setForm({ kode: "", judul: "", mapel: "", kelas: "", penerbit: "", stok: 0, dipinjam: 0, kondisi: "Baik" });
  }

  async function onImport(file: File) {
    const data = await importExcel(file);
    const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");
    const pick = (r: Record<string, unknown>, keys: string[]) => {
      const wanted = keys.map(norm);
      for (const [k, v] of Object.entries(r)) {
        if (wanted.includes(norm(k)) && String(v ?? "").trim() !== "") return v;
      }
      for (const [k, v] of Object.entries(r)) {
        const nk = norm(k);
        if (wanted.some((w) => nk.includes(w)) && String(v ?? "").trim() !== "") return v;
      }
      return undefined;
    };
    const imported: Buku[] = data.map((r, i) => ({
      kode: String(pick(r, ["kode", "kodebuku", "barcode", "isbn"]) ?? `BK-IMP${i + 1}`).trim(),
      judul: String(pick(r, ["judul", "judulbuku", "namabuku", "title", "buku"]) ?? "-").trim(),
      mapel: String(pick(r, ["mapel", "matapelajaran", "pelajaran"]) ?? "-").trim(),
      kelas: String(pick(r, ["kelas"]) ?? "-").trim(),
      penerbit: String(pick(r, ["penerbit", "publisher"]) ?? "-").trim(),
      stok: Number(pick(r, ["stok", "jumlah", "stock"]) ?? 0) || 0,
      dipinjam: Number(pick(r, ["dipinjam"]) ?? 0) || 0,
      kondisi: "Baik",
    }));
    update((s) => ({ ...s, buku: [...imported, ...s.buku] }));
    log(`Import ${imported.length} buku dari Excel`, "Master Buku");
    setInfo(`${imported.length} baris buku berhasil diimport.`);
  }

  return (
    <>
      <PageHeader
        title="Master Buku"
        desc="Katalog seluruh buku pelajaran milik sekolah."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = "";
              }}
            />
            <button className={btnGhost} onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Import Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportExcel(rows as unknown as Record<string, string | number>[], "master-buku.xlsx", "Buku")
              }
            >
              <Download className="size-4" /> Export Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: "Daftar Master Buku",
                  subtitle: state.pengaturan.namaSekolah,
                  head: ["Kode", "Judul", "Mapel", "Kelas", "Penerbit", "Stok", "Dipinjam", "Kondisi"],
                  body: rows.map((b) => [b.kode, b.judul, b.mapel, b.kelas, b.penerbit, b.stok, b.dipinjam, b.kondisi]),
                  filename: "master-buku.pdf",
                })
              }
            >
              <FileText className="size-4" /> Export PDF
            </button>
            <button
              className={btnGhost}
              onClick={() => {
                if (state.buku.length === 0) {
                  setInfo("Tidak ada buku untuk dihapus.");
                  return;
                }
                if (window.confirm(`Hapus SELURUH ${state.buku.length} buku? Tindakan ini tidak bisa dibatalkan.`)) {
                  update((s) => ({ ...s, buku: [] }));
                  log(`Menghapus seluruh ${state.buku.length} buku`, "Master Buku");
                  setInfo("Seluruh buku berhasil dihapus.");
                }
              }}
            >
              <Trash2 className="size-4" /> Hapus Semua
            </button>
            <button className={btnPrimary} onClick={() => setOpenForm((v) => !v)}>
              <Plus className="size-4" /> Tambah Buku
            </button>
          </>
        }
      />

      {info ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p>
      ) : null}

      {openForm ? (
        <Panel title="Tambah Buku Manual" desc="Isi kode secara manual atau pindai barcode buku.">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Kode / Barcode">
              <div className="flex gap-2">
                <input className={input} value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
                <button className={btnGhost} onClick={() => setScan(true)} type="button">
                  <ScanLine className="size-4" /> Scan
                </button>
              </div>
            </Field>
            <Field label="Judul Buku">
              <input className={input} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
            </Field>
            <Field label="Stok">
              <input
                type="number"
                className={input}
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
              />
            </Field>
            <Field label="Mata Pelajaran">
              <input className={input} value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} />
            </Field>
            <Field label="Kelas">
              <input
                className={input}
                placeholder="Contoh: 5A"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              />
            </Field>
            <Field label="Penerbit">
              <input className={input} value={form.penerbit} onChange={(e) => setForm({ ...form, penerbit: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={btnPrimary} onClick={simpan}>
              Simpan Buku
            </button>
            <button className={btnGhost} onClick={() => setOpenForm(false)}>
              Batal
            </button>
          </div>
        </Panel>
      ) : null}

      {scan ? (
        <BarcodeScanner
          onClose={() => setScan(false)}
          onDetected={(text) => {
            setForm((f) => ({ ...f, kode: text }));
            setScan(false);
          }}
        />
      ) : null}

      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul atau kode buku..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className={input + " w-auto"} value={kelas} onChange={(e) => setKelas(e.target.value)}>
            <option value="">Semua Kelas</option>
            {KELAS_LIST.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <select className={input + " w-auto"} value={kondisi} onChange={(e) => setKondisi(e.target.value)}>
            <option value="">Semua Kondisi</option>
            <option>Baik</option>
            <option>Rusak Ringan</option>
            <option>Rusak Berat</option>
          </select>
        </div>

        <DataTable head={["Kode", "Judul Buku", "Mapel", "Kelas", "Penerbit", "Stok", "Dipinjam", "Kondisi", ""]}>
          {rows.map((b) => (
            <tr key={b.kode}>
              <Td className="font-semibold">{b.kode}</Td>
              <Td>{b.judul}</Td>
              <Td className="text-muted-foreground">{b.mapel}</Td>
              <Td>{b.kelas}</Td>
              <Td className="text-muted-foreground">{b.penerbit}</Td>
              <Td>{b.stok}</Td>
              <Td>{b.dipinjam}</Td>
              <Td>
                <Badge tone={statusTone(b.kondisi)}>{b.kondisi}</Badge>
              </Td>
              <Td>
                <button
                  className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                  onClick={() => {
                    if (window.confirm(`Hapus buku ${b.kode} — ${b.judul}?`)) {
                      update((s) => ({ ...s, buku: s.buku.filter((x) => x.kode !== b.kode) }));
                      log(`Menghapus buku ${b.kode}`, "Master Buku");
                    }
                  }}
                >
                  <Trash2 className="size-3.5" /> Hapus
                </button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
