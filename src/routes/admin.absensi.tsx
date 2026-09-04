import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, Trash2, Download, FileText, CheckCircle2 } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, StatCard, Badge } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, newId } from "@/lib/sibudi-store";
import { exportExcel, exportPdfTable } from "@/lib/export-utils";

export const Route = createFileRoute("/admin/absensi")({
  component: AbsensiPage,
});

const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted";
const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function AbsensiPage() {
  const { state, update, log } = useSibudi();
  const [keperluan, setKeperluan] = useState("Membaca");
  const [last, setLast] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState(todayISO());
  const boxRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef("");
  const timeRef = useRef(0);
  const keperluanRef = useRef(keperluan);
  keperluanRef.current = keperluan;

  const rekam = useRef<(kode: string) => void>(() => {});
  rekam.current = (kodeRaw: string) => {
    const kode = kodeRaw.trim();
    if (!kode) return;
    const siswa = state.siswa.find((s) => s.nisn.trim() === kode || s.nama.toLowerCase() === kode.toLowerCase());
    if (!siswa) {
      setErr(`Kartu ${kode} tidak dikenali. Pastikan siswa sudah terdaftar.`);
      setLast(null);
      return;
    }
    const now = new Date();
    const jam = now.toTimeString().slice(0, 5);
    const hariIni = todayISO();
    const sudah = state.kunjungan.some(
      (k) => k.nisn === siswa.nisn && k.tanggal === hariIni && Math.abs(toMin(k.jam) - toMin(jam)) < 5,
    );
    if (sudah) {
      setErr(`${siswa.nama} baru saja tercatat (kurang dari 5 menit).`);
      return;
    }
    update((s) => ({
      ...s,
      kunjungan: [
        {
          id: newId("KJ"),
          nisn: siswa.nisn,
          nama: siswa.nama,
          kelas: siswa.kelas,
          tanggal: hariIni,
          jam,
          keperluan: keperluanRef.current,
        },
        ...s.kunjungan,
      ],
    }));
    log(`Absensi pengunjung: ${siswa.nama}`, "Absensi");
    setErr(null);
    setLast(`${siswa.nama} (${siswa.kelas}) tercatat pukul ${jam}`);
  };

  // Barcode scanner eksternal bekerja seperti keyboard: ketikan cepat lalu Enter.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const now = Date.now();
      if (now - timeRef.current > 300) bufferRef.current = "";
      timeRef.current = now;
      if (e.key === "Enter") {
        const val = bufferRef.current;
        bufferRef.current = "";
        if (val.length >= 3) {
          e.preventDefault();
          rekam.current(val);
        }
        return;
      }
      if (e.key.length === 1) bufferRef.current += e.key;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    boxRef.current?.focus();
  }, []);

  const rows = useMemo(
    () => state.kunjungan.filter((k) => k.tanggal === tanggal),
    [state.kunjungan, tanggal],
  );

  return (
    <>
      <PageHeader
        title="Absensi Pengunjung"
        desc="Scan kartu perpustakaan dengan barcode scanner eksternal — data langsung terekam otomatis."
        actions={
          <>
            <button
              className={btnGhost}
              onClick={() =>
                void exportExcel(
                  rows.map((k) => ({ Tanggal: k.tanggal, Jam: k.jam, NISN: k.nisn, Nama: k.nama, Kelas: k.kelas, Keperluan: k.keperluan })),
                  `absensi-${tanggal}.xlsx`,
                  "Kunjungan",
                )
              }
            >
              <Download className="size-4" /> Export Excel
            </button>
            <button
              className={btnGhost}
              onClick={() =>
                void exportPdfTable({
                  title: "Daftar Kunjungan Perpustakaan",
                  subtitle: `${state.pengaturan.namaSekolah} — ${fmtTanggal(tanggal)}`,
                  head: ["Jam", "NISN", "Nama", "Kelas", "Keperluan"],
                  body: rows.map((k) => [k.jam, k.nisn, k.nama, k.kelas, k.keperluan]),
                  filename: `absensi-${tanggal}.pdf`,
                })
              }
            >
              <FileText className="size-4" /> Export PDF
            </button>
          </>
        }
      />

      <Panel title="Scan Kartu" desc="Arahkan scanner ke barcode kartu perpustakaan. Tidak perlu klik tombol apa pun.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Kode Barcode / NISN</label>
            <div className="relative">
              <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <input
                ref={boxRef}
                autoFocus
                placeholder="Menunggu scan..."
                className="w-full rounded-xl border-2 border-dashed border-primary/50 bg-background py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    rekam.current((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Keperluan</label>
            <select className={input} value={keperluan} onChange={(e) => setKeperluan(e.target.value)}>
              <option>Membaca</option>
              <option>Pinjam Buku</option>
              <option>Kembalikan Buku</option>
              <option>Tugas Sekolah</option>
              <option>Lainnya</option>
            </select>
          </div>
        </div>
        {last ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">
            <CheckCircle2 className="size-4" /> {last}
          </p>
        ) : null}
        {err ? <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">{err}</p> : null}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Kunjungan Hari Ini" value={state.kunjungan.filter((k) => k.tanggal === todayISO()).length} hint="siswa" />
        <StatCard label="Kunjungan Tanggal Dipilih" value={rows.length} hint={fmtTanggal(tanggal)} tone="success" />
        <StatCard label="Total Kunjungan" value={state.kunjungan.length} hint="sepanjang waktu" tone="warning" />
      </div>

      <Panel title="Daftar Kunjungan">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input type="date" className={input + " w-auto"} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          <button
            className={btnGhost}
            onClick={() => {
              if (!confirm(`Hapus semua kunjungan tanggal ${tanggal}?`)) return;
              update((s) => ({ ...s, kunjungan: s.kunjungan.filter((k) => k.tanggal !== tanggal) }));
            }}
          >
            <Trash2 className="size-4" /> Hapus Data Tanggal Ini
          </button>
        </div>
        <DataTable head={["Jam", "NISN", "Nama Siswa", "Kelas", "Keperluan", ""]}>
          {rows.map((k) => (
            <tr key={k.id}>
              <Td className="font-semibold">{k.jam}</Td>
              <Td>{k.nisn}</Td>
              <Td>{k.nama}</Td>
              <Td>
                <Badge tone="primary">{k.kelas}</Badge>
              </Td>
              <Td className="text-muted-foreground">{k.keperluan}</Td>
              <Td>
                <button
                  className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
                  onClick={() => update((s) => ({ ...s, kunjungan: s.kunjungan.filter((x) => x.id !== k.id) }))}
                >
                  <Trash2 className="size-3.5" /> Hapus
                </button>
              </Td>
            </tr>
          ))}
        </DataTable>
        {rows.length === 0 ? <p className="pt-4 text-xs text-muted-foreground">Belum ada kunjungan pada tanggal ini.</p> : null}
      </Panel>
    </>
  );
}

function toMin(jam: string) {
  const [h, m] = jam.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
}
