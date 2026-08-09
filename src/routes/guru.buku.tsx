import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { bukuList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/guru/buku")({
  component: InventarisBuku,
});

function InventarisBuku() {
  return (
    <>
      <PageHeader
        title="Inventaris Buku Kelas 1A"
        desc="Stok buku yang menjadi tanggung jawab wali kelas."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted">
            <Download className="size-4" /> Download Excel
          </button>
        }
      />

      <Panel>
        <DataTable head={["Kode", "Judul Buku", "Mapel", "Stok", "Dipinjam", "Sisa", "Kondisi"]}>
          {bukuList.map((b) => (
            <tr key={b.kode}>
              <Td className="font-semibold">{b.kode}</Td>
              <Td>{b.judul}</Td>
              <Td className="text-muted-foreground">{b.mapel}</Td>
              <Td>{b.stok}</Td>
              <Td>{b.dipinjam}</Td>
              <Td>
                <Badge tone={b.stok - b.dipinjam < 5 ? "warning" : "primary"}>{b.stok - b.dipinjam}</Badge>
              </Td>
              <Td>
                <Badge tone={statusTone(b.kondisi)}>{b.kondisi}</Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
