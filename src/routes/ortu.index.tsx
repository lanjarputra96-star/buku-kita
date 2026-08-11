import { createFileRoute } from "@tanstack/react-router";
import { Package, BookMarked, AlertTriangle, BookOpen } from "lucide-react";
import { Panel, StatCard, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { distribusiList, notifikasiList } from "@/lib/sibudi-data";
import { useSibudi } from "@/lib/sibudi-store";

export const Route = createFileRoute("/ortu/")({
  component: OrtuDashboard,
});

function OrtuDashboard() {
  const { state } = useSibudi();
  const notifs = [
    ...state.notifikasi.map((n) => ({ judul: n.judul, isi: n.isi, waktu: `${n.waktu} • ${n.kanal}`, tipe: n.tipe, key: n.id })),
    ...notifikasiList.map((n) => ({ ...n, key: n.judul })),
  ].slice(0, 6);
  return (
    <>
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft md:p-8">
        <p className="text-xs opacity-90">Portal Orang Tua</p>
        <h1 className="mt-1 text-xl font-bold md:text-2xl">Selamat Datang, Siti Nurhaliza! 👋</h1>
        <p className="mt-1 text-sm opacity-90">Kelas 3A • NISN 0081234567</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Buku Dipinjam" value="3" icon={<Package className="size-5" />} />
        <StatCard label="Sudah Dikembalikan" value="2" icon={<BookMarked className="size-5" />} tone="success" />
        <StatCard label="Menunggu Verifikasi" value="1" icon={<BookOpen className="size-5" />} tone="warning" />
        <StatCard label="Terlambat" value="0" icon={<AlertTriangle className="size-5" />} tone="info" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Buku Ananda Saat Ini">
          <DataTable head={["Buku", "Tanggal Pinjam", "Status"]}>
            {distribusiList.slice(0, 3).map((d) => (
              <tr key={d.id}>
                <Td>{d.buku}</Td>
                <Td className="text-muted-foreground">{d.tanggal}</Td>
                <Td>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Notifikasi Terbaru">
          <ul className="space-y-3">
            {notifs.map((n) => (
              <li key={n.key} className="rounded-2xl border border-border p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{n.judul}</p>
                  <Badge tone={n.tipe === "warning" ? "warning" : n.tipe === "success" ? "success" : "info"}>
                    {n.waktu}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{n.isi}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
