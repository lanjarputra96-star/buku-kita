import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Download, Search } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge } from "@/components/sibudi/ui-kit";
import { siswaList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/data-siswa")({
  component: DataSiswa,
});

function DataSiswa() {
  return (
    <>
      <PageHeader
        title="Data Siswa"
        desc="Data induk siswa beserta wali murid dan jumlah buku pinjaman."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted">
              <Upload className="size-4" /> Import Excel
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted">
              <Download className="size-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="size-4" /> Tambah Siswa
            </button>
          </>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Cari nama atau NISN..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option>Semua Kelas</option>
            {["1A", "3A", "5B", "6A"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>

        <DataTable head={["NISN", "Nama Siswa", "Kelas", "Wali Murid", "No. WhatsApp", "Buku Dipinjam", ""]}>
          {siswaList.map((s) => (
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
                <button className="text-xs font-semibold text-primary hover:underline">Kelola</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
