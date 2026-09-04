import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Download, Search, FileText, Trash2, IdCard } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, KELAS_LIST } from "@/lib/sibudi-store";
import { exportExcel, exportKartuPdf, exportPdfTable, importExcel } from "@/lib/export-utils";
import type { Siswa } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/data-siswa")({
  component: DataSiswa,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function DataSiswa() {
  const { state, update, log } = useSibudi();
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<Siswa>({ nisn: "", nama: "", kelas: "", wali: "", wa: "", dipinjam: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState("");

  const kelasOptions = useMemo(
    () => Array.from(new Set([...KELAS_LIST, ...state.siswa.map((s) => s.kelas)])).sort(),
    [state.siswa],
  );

  const rows = useMemo(
    () =>
      state.siswa.filter(
        (s) =>
          (!q || `${s.nama} ${s.nisn}`.toLowerCase().includes(q.toLowerCase())) && (!kelas || s.kelas === kelas),
      ),
    [state.siswa, q, kelas],
  );

  async function onImport(file: File) {
    const data = await importExcel(file);
    const imported: Siswa[] = data.map((r, i) => ({
      nisn: String(r["nisn"] ?? r["NISN"] ?? `IMP-${i + 1}`),
      nama: String(r["nama"] ?? r["Nama"] ?? "-"),
      kelas: String(r["kelas"] ?? r["Kelas"] ?? "-"),
      wali: String(r["wali"] ?? r["Wali"] ?? "-"),
      wa: String(r["wa"] ?? r["WhatsApp"] ?? "-"),
      dipinjam: Number(r["dipinjam"] ?? 0),
    }));
    update((s) => ({ ...s, siswa: [...imported, ...s.siswa] }));
    log(`Import ${imported.length} data siswa`, "Data Siswa");
    setInfo(`${imported.length} siswa berhasil diimport.`);
  }

  return (
    <>
      <PageHeader
        title="Data Siswa"
        desc="Data induk siswa beserta wali murid dan jumlah buku pinjaman."
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
              onClick={() => void exportExcel(rows as unknown as Record<string, string | number>[], "data-siswa.xlsx", "Siswa")}
            >
              <Download className="size-4" /> Export Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: `Data Siswa ${kelas ? `Kelas ${kelas}` : ""}`.trim(),
                  subtitle: state.pengaturan.namaSekolah,
                  head: ["NISN", "Nama", "Kelas", "Wali Murid", "No. WA", "Dipinjam"],
                  body: rows.map((s) => [s.nisn, s.nama, s.kelas, s.wali, s.wa, s.dipinjam]),
                  filename: "data-siswa.pdf",
                })
              }
            >
              <FileText className="size-4" /> Export PDF
            </button>
            <button
              className={btnGhost}
              onClick={() => {
                if (rows.length === 0) {
                  setInfo("Tidak ada siswa untuk dicetak.");
                  return;
                }
                void exportKartuPdf({
                  sekolah: state.pengaturan.namaSekolah,
                  penanggungJawab: state.pengaturan.penanggungJawab,
                  siswa: rows.map((s) => ({ nisn: s.nisn, nama: s.nama, kelas: s.kelas })),
                  filename: `kartu-perpustakaan-${kelas || "semua"}.pdf`,
                });
                setInfo(`${rows.length} kartu perpustakaan diunduh (PDF).`);
              }}
            >
              <IdCard className="size-4" /> Cetak Kartu
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-card px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (state.siswa.length === 0) return;
                if (!confirm(`Hapus SEMUA ${state.siswa.length} data siswa? Tindakan ini tidak bisa dibatalkan.`)) return;
                update((s) => ({ ...s, siswa: [] }));
                log("Menghapus semua data siswa", "Data Siswa");
                setInfo("Semua data siswa telah dihapus.");
              }}
            >
              <Trash2 className="size-4" /> Hapus Semua
            </button>
            <button className={btnPrimary} onClick={() => setOpenForm((v) => !v)}>
              <Plus className="size-4" /> Tambah Siswa
            </button>
          </>
        }
      />

      {info ? <p className="rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">{info}</p> : null}

      {openForm ? (
        <Panel title="Tambah Siswa">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="NISN">
              <input className={input} value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} />
            </Field>
            <Field label="Nama Siswa">
              <input className={input} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Field>
            <Field label="Kelas">
              <input
                className={input}
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                placeholder="Contoh: 5A"
              />
            </Field>
            <Field label="Wali Murid">
              <input className={input} value={form.wali} onChange={(e) => setForm({ ...form, wali: e.target.value })} />
            </Field>
            <Field label="No. WhatsApp">
              <input className={input} value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className={btnPrimary}
              onClick={() => {
                if (!form.nama.trim()) return;
                update((s) => ({ ...s, siswa: [form, ...s.siswa] }));
                log(`Menambah siswa ${form.nama}`, "Data Siswa");
                setForm({ nisn: "", nama: "", kelas: "", wali: "", wa: "", dipinjam: 0 });
                setOpenForm(false);
              }}
            >
              Simpan
            </button>
            <button className={btnGhost} onClick={() => setOpenForm(false)}>
              Batal
            </button>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau NISN..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className={input + " w-auto"} value={kelas} onChange={(e) => setKelas(e.target.value)}>
            <option value="">Semua Kelas</option>
            {kelasOptions.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>

        <DataTable head={["NISN", "Nama Siswa", "Kelas", "Wali Murid", "No. WhatsApp", "Buku Dipinjam", ""]}>
          {rows.map((s) => (
            <tr key={s.nisn}>
              <Td className="font-semibold">{s.nisn}</Td>
              <Td>{s.nama}</Td>
              <Td>{s.kelas}</Td>
              <Td className="text-muted-foreground">{s.wali}</Td>
              <Td className="text-muted-foreground">{s.wa}</Td>
              <Td>
                <Badge tone={s.dipinjam > 3 ? "warning" : "primary"}>{s.dipinjam} buku</Badge>
              </Td>
              <Td>
                <div className="flex gap-3">
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={() =>
                      void exportKartuPdf({
                        sekolah: state.pengaturan.namaSekolah,
                        penanggungJawab: state.pengaturan.penanggungJawab,
                        siswa: [{ nisn: s.nisn, nama: s.nama, kelas: s.kelas }],
                        filename: `kartu-${s.nisn}.pdf`,
                      })
                    }
                  >
                    <IdCard className="size-3.5" /> Kartu
                  </button>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                    onClick={() => update((st) => ({ ...st, siswa: st.siswa.filter((x) => x.nisn !== s.nisn) }))}
                  >
                    <Trash2 className="size-3.5" /> Hapus
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
