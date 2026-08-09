import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { guruList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/data-guru")({
  component: DataGuru,
});

function DataGuru() {
  return (
    <>
      <PageHeader
        title="Data Guru"
        desc="Daftar wali kelas dan pengampu yang memiliki akses portal guru."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
            <Plus className="size-4" /> Tambah Guru
          </button>
        }
      />

      <Panel>
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Cari nama atau NIP..."
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <DataTable head={["NIP", "Nama Guru", "Wali Kelas", "Email", "Status", ""]}>
          {guruList.map((g) => (
            <tr key={g.nip}>
              <Td className="font-semibold">{g.nip}</Td>
              <Td>{g.nama}</Td>
              <Td>{g.kelas}</Td>
              <Td className="text-muted-foreground">{g.email}</Td>
              <Td>
                <Badge tone={statusTone(g.status)}>{g.status}</Badge>
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
