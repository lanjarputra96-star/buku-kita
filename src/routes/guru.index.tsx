import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlus, RefreshCw, Users, BarChart3, BookOpen, AlertTriangle } from "lucide-react";
import { Panel, StatCard, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { distribusiList, belumKembaliList } from "@/lib/sibudi-data";
import { useSibudi } from "@/lib/sibudi-store";

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
  const { guruAktif } = useSibudi();
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
        <StatCard label="Siswa Kelas 1A" value="32" icon={<Users className="size-5" />} tone="info" />
        <StatCard label="Judul Buku Kelas" value="8" icon={<BookOpen className="size-5" />} />
        <StatCard label="Buku Terdistribusi" value="248" icon={<PackagePlus className="size-5" />} tone="success" />
        <StatCard label="Belum Kembali" value="12" icon={<AlertTriangle className="size-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Distribusi Terbaru">
          <DataTable head={["Tanggal", "Siswa", "Buku", "Status"]}>
            {distribusiList.slice(0, 4).map((d) => (
              <tr key={d.id}>
                <Td className="text-muted-foreground">{d.tanggal}</Td>
                <Td>{d.siswa}</Td>
                <Td>{d.buku}</Td>
                <Td>
                  <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Perlu Diingatkan" desc="Kirim pengingat ke wali murid">
          <ul className="space-y-3">
            {belumKembaliList.map((b) => (
              <li key={b.siswa + b.buku} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3.5">
                <div>
                  <p className="text-sm font-semibold">{b.siswa}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.buku} • Tempo {b.jatuhTempo}
                  </p>
                </div>
                <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
                  Ingatkan
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
