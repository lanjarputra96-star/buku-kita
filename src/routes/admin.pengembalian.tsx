import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, Badge, statusTone, StatCard } from "@/components/sibudi/ui-kit";
import { pengembalianList, belumKembaliList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/pengembalian")({
  component: PengembalianAdmin,
});

function PengembalianAdmin() {
  return (
    <>
      <PageHeader title="Pengembalian" desc="Verifikasi pengajuan pengembalian buku dari wali kelas dan orang tua." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu Verifikasi" value="2" tone="warning" />
        <StatCard label="Disetujui Bulan Ini" value="180" tone="success" />
        <StatCard label="Belum Kembali" value={belumKembaliList.length} tone="danger" />
      </div>

      <Panel title="Pengajuan Pengembalian">
        <DataTable head={["ID", "Tanggal", "Siswa", "Kelas", "Buku", "Kondisi", "Status", "Aksi"]}>
          {pengembalianList.map((p) => (
            <tr key={p.id}>
              <Td className="font-semibold">{p.id}</Td>
              <Td className="text-muted-foreground">{p.tanggal}</Td>
              <Td>{p.siswa}</Td>
              <Td>{p.kelas}</Td>
              <Td>{p.buku}</Td>
              <Td>
                <Badge tone={statusTone(p.kondisi)}>{p.kondisi}</Badge>
              </Td>
              <Td>
                <Badge tone={statusTone(p.status)}>{p.status}</Badge>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1.5 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="size-3.5" /> Setujui
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[11px] font-semibold text-destructive">
                    <XCircle className="size-3.5" /> Tolak
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Panel title="Buku Belum Kembali">
        <DataTable head={["Siswa", "Kelas", "Buku", "Jatuh Tempo", "Keterlambatan"]}>
          {belumKembaliList.map((b) => (
            <tr key={b.siswa + b.buku}>
              <Td>{b.siswa}</Td>
              <Td>{b.kelas}</Td>
              <Td>{b.buku}</Td>
              <Td className="text-muted-foreground">{b.jatuhTempo}</Td>
              <Td>
                <Badge tone={b.telat > 0 ? "danger" : "success"}>
                  {b.telat > 0 ? `${b.telat} hari` : "Tepat waktu"}
                </Badge>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
