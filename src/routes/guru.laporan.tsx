import { createFileRoute } from "@tanstack/react-router";
import { Printer, Download } from "lucide-react";
import { PageHeader, Panel, DataTable, Td } from "@/components/sibudi/ui-kit";
import { distribusiList, SCHOOL } from "@/lib/sibudi-data";

export const Route = createFileRoute("/guru/laporan")({
  component: LaporanGuru,
});

function LaporanGuru() {
  return (
    <>
      <PageHeader
        title="Laporan Rekapitulasi Peminjaman & Pengembalian"
        desc="Rekap Kelas 1A — siap dicetak dan ditandatangani."
        actions={
          <>
            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <Printer className="size-4" /> Cetak
            </button>
            <button className="no-print inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Download className="size-4" /> Download Excel
            </button>
          </>
        }
      />

      <Panel id="print-area">
        <div className="border-b border-border pb-4 text-center">
          <p className="text-xs font-semibold uppercase">Pemerintah Kota {SCHOOL.city}</p>
          <p className="text-sm font-bold uppercase">Dinas Pendidikan dan Kebudayaan</p>
          <p className="text-base font-extrabold uppercase">{SCHOOL.name}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Laporan Peminjaman Buku Kelas 1A — Semester Ganjil 2026/2027
          </p>
        </div>

        <div className="mt-4">
          <DataTable head={["No", "Tanggal", "Siswa", "Buku", "Jumlah", "Status"]}>
            {distribusiList.map((d, i) => (
              <tr key={d.id}>
                <Td>{i + 1}</Td>
                <Td>{d.tanggal}</Td>
                <Td>{d.siswa}</Td>
                <Td>{d.buku}</Td>
                <Td>{d.jumlah}</Td>
                <Td>{d.status}</Td>
              </tr>
            ))}
          </DataTable>
        </div>

        <div className="mt-10 flex justify-end">
          <div className="text-center text-xs">
            <p>{SCHOOL.city}, 14 Juli 2026</p>
            <p className="mt-1">Wali Kelas 1A</p>
            <p className="mt-16 font-semibold underline">Siti Aminah, S.Pd</p>
            <p>NIP. 19780512 200604 2 001</p>
          </div>
        </div>
      </Panel>
    </>
  );
}
