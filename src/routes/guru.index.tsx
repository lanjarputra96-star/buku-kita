import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlus, RefreshCw, Users, BarChart3, BookOpen, AlertTriangle } from "lucide-react";
import { Panel, StatCard, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, hariTelat } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru/")({
  component: GuruDashboard,
});

const aksi = [
  { to: "/guru/distribusi", label: "Distribusi Buku", icon: PackagePlus },
  { to: "/guru/pengembalian", label: "Input Pengembalian", icon: RefreshCw },
  { to: "/guru/siswa", label: "Data Siswa", icon: Users },
  { to: "/guru/laporan", label: "Cetak Laporan", icon: BarChart3 },
];

function GuruDashboard() {
  const { state, guruAktif } = useSibudi();
  const kelas = guruAktif?.kelas ?? "";
  const siswaKelas = state.siswa.filter((s) => !kelas || s.kelas === kelas);
  const bukuKelas = state.buku.filter((b) => !kelas || b.kelas === kelas);
  const distribusiKelas = state.distribusi.filter((d) => !kelas || d.kelas === kelas);
  const belumKembali = distribusiKelas
    .filter((d) => d.status === "Dipinjam")
    .map((d) => ({ ...d, telat: hariTelat(d.jatuhTempo) }));

  return (
    <>
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft md:p-8">
        <h1 className="text-xl font-bold md:text-2xl">Selamat Datang, {guruAktif?.nama ?? "Guru"}! 👋</h1>
        <p className="mt-1 text-sm opacity-90">
          Berikut ringkasan pengelolaan buku Kelas {guruAktif?.kelas ?? "-"} hari ini.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {aksi.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-primary-foreground/20"
            >
              <a.icon className="size-5" /> {a.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Siswa Kelas ${kelas || "-"}`} value={siswaKelas.length} icon={<Users className="size-5" />} tone="info" />
        <StatCard label="Judul Buku Kelas" value={bukuKelas.length} icon={<BookOpen className="size-5" />} />
        <StatCard label="Buku Terdistribusi" value={distribusiKelas.reduce((a, d) => a + d.jumlah, 0)} icon={<PackagePlus className="size-5" />} tone="success" />
        <StatCard label="Belum Kembali" value={belumKembali.length} icon={<AlertTriangle className="size-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Distribusi Terbaru">
          <DataTable head={["Tanggal", "Penerima", "Buku", "Status"]}>
            {distribusiKelas.slice(0, 5).map((d) => (
              <tr key={d.id}>
                <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
                <Td>{d.penerima}</Td>
                <Td>{d.buku}</Td>
                <Td>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Perlu Diingatkan" desc="Kirim pengingat lewat menu Belum Kembali">
          {belumKembali.length === 0 ? (
            <p className="text-xs text-muted-foreground">Tidak ada buku yang perlu diingatkan.</p>
          ) : (
            <ul className="space-y-3">
              {belumKembali.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3.5">
                  <div>
                    <p className="text-sm font-semibold">{b.penerima}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.buku} • Tempo {b.jatuhTempo ? fmtTanggal(b.jatuhTempo) : "-"}
                    </p>
                  </div>
                  <Badge tone={b.telat > 0 ? "danger" : "warning"}>{b.telat > 0 ? `Telat ${b.telat} hari` : "Aktif"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
