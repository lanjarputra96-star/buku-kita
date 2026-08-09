import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Search } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge } from "@/components/sibudi/ui-kit";
import { siswaList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/guru/siswa")({
  component: SiswaGuru,
});

function SiswaGuru() {
  return (
    <>
      <PageHeader
        title="Manajemen Data Siswa Kelas 1A"
        desc="Kelola data siswa dan kontak wali murid kelas Anda."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted">
              <Upload className="size-4" /> Import Excel
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="size-4" /> Tambah Siswa
            </button>
          </>
        }
      />

      <Panel>
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Cari siswa..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <DataTable head={["NISN", "Nama Siswa", "Wali Murid", "No. WhatsApp", "Buku Dipinjam", ""]}>
          {siswaList.map((s) => (
            <tr key={s.nisn}>
              <Td className="font-semibold">{s.nisn}</Td>
              <Td>{s.nama}</Td>
              <Td className="text-muted-foreground">{s.wali}</Td>
              <Td className="text-muted-foreground">{s.wa}</Td>
              <Td>
                <Badge tone={s.dipinjam > 3 ? "warning" : "primary"}>{s.dipinjam} buku</Badge>
              </Td>
              <Td>
                <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
