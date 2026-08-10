import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, FileType2, BarChart3 } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, StatCard, Field } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal } from "@/lib/sibudi-store";
import { exportPdfTable, exportWordReport } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/laporan")({
  component: LaporanPage,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

type Jenis = "distribusi" | "kerusakan" | "rekap";

function LaporanPage() {
  const { state } = useSibudi();
  const [dari, setDari] = useState("2026-01-01");
  const [sampai, setSampai] = useState(new Date().toISOString().slice(0, 10));
  const [jenis, setJenis] = useState<Jenis>("distribusi");

  const inRange = (t: string) => t >= dari && t <= sampai;

  const distribusi = useMemo(() => state.distribusi.filter((d) => inRange(d.tanggal)), [state.distribusi, dari, sampai]);
  const pengembalian = useMemo(() => state.pengembalian.filter((p) => inRange(p.tanggal)), [state.pengembalian, dari, sampai]);
  const rusak = useMemo(
    () => pengembalian.filter((p) => p.kondisi && p.kondisi !== "Baik"),
    [pengembalian],
  );

  const sections = useMemo(() => {
    if (jenis === "distribusi") {
      return [
        {
          heading: "Laporan Distribusi Buku",
          head: ["ID", "Tanggal", "Tipe", "Penerima", "Kelas", "Buku", "Jumlah", "Status"],
          body: distribusi.map((d) => [d.id, fmtTanggal(d.tanggal), d.tipe, d.penerima, d.kelas, d.buku, d.jumlah, d.status]),
        },
      ];
    }
    if (jenis === "kerusakan") {
      return [
        {
          heading: "Laporan Buku Rusak / Hilang",
          head: ["ID", "Tanggal", "Nama", "Kelas", "Buku", "Jumlah", "Kondisi"],
          body: rusak.map((p) => [p.id, fmtTanggal(p.tanggal), p.penerima, p.kelas, p.buku, p.jumlah, p.kondisi ?? "-"]),
        },
      ];
    }
    return [
      {
        heading: "Rekapitulasi Akhir",
        head: ["Uraian", "Jumlah"],
        body: [
          ["Judul buku terdata", state.buku.length],
          ["Total stok buku", state.buku.reduce((a, b) => a + b.stok, 0)],
          ["Transaksi distribusi", distribusi.length],
          ["Eksemplar didistribusikan", distribusi.reduce((a, d) => a + d.jumlah, 0)],
          ["Transaksi pengembalian", pengembalian.length],
          ["Buku rusak / hilang", rusak.reduce((a, p) => a + p.jumlah, 0)],
          ["Masih dipinjam", distribusi.filter((d) => d.status === "Dipinjam").reduce((a, d) => a + d.jumlah, 0)],
        ] as (string | number)[][],
      },
    ];
  }, [jenis, distribusi, pengembalian, rusak, state.buku]);

  const judul =
    jenis === "distribusi" ? "Laporan Distribusi Buku" : jenis === "kerusakan" ? "Laporan Buku Rusak / Hilang" : "Rekapitulasi Akhir";
  const subtitle = `${state.pengaturan.namaSekolah} — Periode ${fmtTanggal(dari)} s.d. ${fmtTanggal(sampai)}`;
  const signatures = {
    kepalaSekolah: state.pengaturan.kepalaSekolah,
    nipKepala: state.pengaturan.nipKepala,
    penanggungJawab: state.pengaturan.penanggungJawab,
    nipPenanggung: state.pengaturan.nipPenanggung,
    kota: "Bandar Lampung",
  };

  return (
    <>
      <PageHeader
        title="Laporan"
        desc="Laporan distribusi, buku rusak/hilang, dan rekapitulasi lengkap dengan tanda tangan."
        actions={
          <>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: judul,
                  subtitle,
                  head: sections[0]!.head,
                  body: sections[0]!.body,
                  filename: `${jenis}-${dari}-${sampai}.pdf`,
                  signatures,
                })
              }
            >
              <FileText className="size-4" /> Cetak PDF
            </button>
            <button
              className={btnPrimary}
              onClick={() =>
                exportWordReport({
                  title: judul,
                  subtitle,
                  sections,
                  filename: `${jenis}-${dari}-${sampai}.doc`,
                  signatures,
                })
              }
            >
              <FileType2 className="size-4" /> Cetak Word
            </button>
          </>
        }
      />

      <Panel title="Filter Laporan">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tanggal Mulai">
            <input type="date" className={input} value={dari} onChange={(e) => setDari(e.target.value)} />
          </Field>
          <Field label="Tanggal Selesai">
            <input type="date" className={input} value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </Field>
          <Field label="Jenis Laporan">
            <select className={input} value={jenis} onChange={(e) => setJenis(e.target.value as Jenis)}>
              <option value="distribusi">Laporan Distribusi</option>
              <option value="kerusakan">Laporan Buku Rusak / Hilang</option>
              <option value="rekap">Rekapitulasi Akhir</option>
            </select>
          </Field>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Distribusi" value={distribusi.length} hint="transaksi pada periode" icon={<BarChart3 className="size-5" />} />
        <StatCard label="Pengembalian" value={pengembalian.length} hint="transaksi pada periode" tone="success" />
        <StatCard label="Rusak / Hilang" value={rusak.reduce((a, p) => a + p.jumlah, 0)} hint="eksemplar" tone="danger" />
        <StatCard
          label="Masih Dipinjam"
          value={distribusi.filter((d) => d.status === "Dipinjam").reduce((a, d) => a + d.jumlah, 0)}
          hint="eksemplar"
          tone="warning"
        />
      </div>

      <Panel title={judul} desc={subtitle}>
        <DataTable head={sections[0]!.head}>
          {sections[0]!.body.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <Td key={j} className={j === 0 ? "font-semibold" : undefined}>
                  {cell}
                </Td>
              ))}
            </tr>
          ))}
        </DataTable>
        {sections[0]!.body.length === 0 ? (
          <p className="pt-4 text-xs text-muted-foreground">Tidak ada data pada rentang tanggal ini.</p>
        ) : null}

        <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Mengetahui,</p>
            <p className="text-muted-foreground">Kepala Sekolah</p>
            <p className="mt-16 font-bold">{state.pengaturan.kepalaSekolah}</p>
            <p className="text-xs text-muted-foreground">NIP. {state.pengaturan.nipKepala}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bandar Lampung, {fmtTanggal(sampai)}</p>
            <p className="text-muted-foreground">Penanggung Jawab Perpustakaan</p>
            <p className="mt-16 font-bold">{state.pengaturan.penanggungJawab}</p>
            <p className="text-xs text-muted-foreground">NIP. {state.pengaturan.nipPenanggung}</p>
          </div>
        </div>
      </Panel>
    </>
  );
}
