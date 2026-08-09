import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Search } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { bukuList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/master-buku")({
  component: MasterBuku,
});

function MasterBuku() {
  return (
    <>
      <PageHeader
        title="Master Buku"
        desc="Katalog seluruh buku pelajaran milik sekolah."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted">
              <Download className="size-4" /> Export Excel
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Plus className="size-4" /> Tambah Buku
            </button>
          </>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Cari judul atau kode buku..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option>Semua Kelas</option>
            {["1A", "3A", "5B", "6A"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <select className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option>Semua Kondisi</option>
            <option>Baik</option>
            <option>Rusak Ringan</option>
            <option>Rusak Berat</option>
          </select>
        </div>

        <DataTable head={["Kode", "Judul Buku", "Mapel", "Kelas", "Penerbit", "Stok", "Dipinjam", "Kondisi", ""]}>
          {bukuList.map((b) => (
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
                <button className="text-xs font-semibold text-primary hover:underline">Detail</button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
