import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Package, BookMarked, AlertTriangle, BookOpen } from "lucide-react";
import { Panel, StatCard, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, hariTelat } from "@/lib/sibudi-store";

export const Route = createFileRoute("/ortu/")({
  component: OrtuDashboard,
});

function OrtuDashboard() {
  const { state, siswaAktif } = useSibudi();

  const rows = useMemo(
    () => state.distribusi.filter((d) => d.tipe === "Siswa" && (d.nisn === siswaAktif?.nisn || d.penerima === siswaAktif?.nama)),
    [state.distribusi, siswaAktif],
  );
  const dipinjam = rows.filter((d) => d.status === "Dipinjam");
  const dikembalikan = rows.filter((d) => d.status === "Dikembalikan");
  const menunggu = state.pengembalian.filter(
    (p) => p.status === "Diajukan" && (p.nisn === siswaAktif?.nisn || p.penerima === siswaAktif?.nama),
  );
  const telat = dipinjam.filter((d) => hariTelat(d.jatuhTempo) > 0).length;

  const notifs = state.notifikasi
    .filter((n) => !siswaAktif || n.nisn === siswaAktif.nisn || n.nisn === siswaAktif.nama)
    .slice(0, 6);

  return (
    <>
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft md:p-8">
        <p className="text-xs opacity-90">Portal Siswa</p>
        <h1 className="mt-1 text-xl font-bold md:text-2xl">Selamat Datang, {siswaAktif?.nama || "Siswa"}! 👋</h1>
        <p className="mt-1 text-sm opacity-90">
          Ananda {siswaAktif?.nama ?? "-"} • Kelas {siswaAktif?.kelas ?? "-"} • NISN {siswaAktif?.nisn ?? "-"}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Buku Dipinjam" value={dipinjam.length} icon={<Package className="size-5" />} />
        <StatCard label="Sudah Dikembalikan" value={dikembalikan.length} icon={<BookMarked className="size-5" />} tone="success" />
        <StatCard label="Menunggu Verifikasi" value={menunggu.length} icon={<BookOpen className="size-5" />} tone="warning" />
        <StatCard label="Terlambat" value={telat} icon={<AlertTriangle className="size-5" />} tone="info" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Buku Ananda Saat Ini">
          {dipinjam.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada buku yang sedang dipinjam.</p>
          ) : (
            <DataTable head={["Buku", "Tanggal Pinjam", "Status"]}>
              {dipinjam.slice(0, 5).map((d) => (
                <tr key={d.id}>
                  <Td>{d.buku}</Td>
                  <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
                  <Td>
                    <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <Panel title="Notifikasi Terbaru">
          {notifs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada notifikasi.</p>
          ) : (
            <ul className="space-y-3">
              {notifs.map((n) => (
                <li key={n.id} className="rounded-2xl border border-border p-3.5">
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
          )}
        </Panel>
      </div>
    </>
  );
}
