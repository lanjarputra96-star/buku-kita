import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, StatCard } from "@/components/sibudi/ui-kit";
import { belumKembaliList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/guru/belum-kembali")({
  component: BelumKembali,
});

function BelumKembali() {
  const telat = belumKembaliList.filter((b) => b.telat > 0).length;
  return (
    <>
      <PageHeader
        title="Daftar Buku Belum Kembali"
        desc="Pantau buku yang masih dipinjam siswa dan kirim pengingat."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
            <MessageCircle className="size-4" /> Ingatkan Semua
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Belum Kembali" value={belumKembaliList.length} tone="warning" />
        <StatCard label="Melewati Tempo" value={telat} tone="danger" />
        <StatCard label="Masih Dalam Tempo" value={belumKembaliList.length - telat} tone="success" />
      </div>

      <Panel>
        <DataTable head={["Siswa", "Kelas", "Buku", "Jatuh Tempo", "Status", "Aksi"]}>
          {belumKembaliList.map((b) => (
            <tr key={b.siswa + b.buku}>
              <Td>{b.siswa}</Td>
              <Td>{b.kelas}</Td>
              <Td>{b.buku}</Td>
              <Td className="text-muted-foreground">{b.jatuhTempo}</Td>
              <Td>
                <Badge tone={b.telat > 0 ? "danger" : "success"}>
                  {b.telat > 0 ? `Telat ${b.telat} hari` : "Tepat waktu"}
                </Badge>
              </Td>
              <Td>
                <button className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
                  <MessageCircle className="size-3.5" /> Ingatkan
                </button>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
