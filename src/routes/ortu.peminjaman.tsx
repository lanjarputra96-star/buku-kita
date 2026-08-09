import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { distribusiList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/ortu/peminjaman")({
  component: PeminjamanOrtu,
});

function PeminjamanOrtu() {
  return (
    <>
      <PageHeader
        title="Peminjaman Buku"
        desc="Riwayat buku yang diterima ananda dari sekolah."
        actions={
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted"
          >
            <Download className="size-4" /> Unduh Bukti
          </button>
        }
      />

      <Panel id="print-area">
        <DataTable head={["ID", "Tanggal", "Buku", "Jumlah", "Status"]}>
          {distribusiList.map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td className="text-muted-foreground">{d.tanggal}</Td>
              <Td>{d.buku}</Td>
              <Td>{d.jumlah}</Td>
              <Td>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
