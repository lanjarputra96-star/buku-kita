import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Book, GraduationCap, PackagePlus, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, StatCard, DataTable, Td, Badge, statusTone } from "@/components/sibudi/ui-kit";
import { useSibudi, fmtTanggal, hariTelat } from "@/lib/sibudi-store";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function AdminDashboard() {
  const { state } = useSibudi();

  const totalBuku = state.buku.reduce((a, b) => a + b.stok, 0);
  const dipinjam = state.distribusi.filter((d) => d.status === "Dipinjam");
  const belumKembali = dipinjam.map((d) => ({ ...d, telat: hariTelat(d.jatuhTempo) }));
  const telat = belumKembali.filter((b) => b.telat > 0).length;

  const grafik = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        bulan: BULAN[d.getMonth()] ?? "",
        distribusi: state.distribusi.filter((x) => x.tanggal.startsWith(key)).reduce((a, x) => a + x.jumlah, 0),
        pengembalian: state.pengembalian
          .filter((x) => x.tanggal.startsWith(key) && x.status === "Dikembalikan")
          .reduce((a, x) => a + x.jumlah, 0),
      };
    });
  }, [state.distribusi, state.pengembalian]);

  return (
    <>
      <PageHeader title="Dashboard" desc="Ringkasan distribusi buku sekolah." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Buku" value={totalBuku} hint={`${state.buku.length} judul terdaftar`} icon={<Book className="size-5" />} />
        <StatCard label="Total Siswa" value={state.siswa.length} hint={`${new Set(state.siswa.map((s) => s.kelas)).size} rombongan belajar`} icon={<GraduationCap className="size-5" />} tone="info" />
        <StatCard label="Buku Terdistribusi" value={state.distribusi.reduce((a, d) => a + d.jumlah, 0)} hint={`${state.distribusi.length} transaksi`} icon={<PackagePlus className="size-5" />} tone="success" />
        <StatCard label="Belum Kembali" value={belumKembali.length} hint={`${telat} di antaranya terlambat`} icon={<AlertTriangle className="size-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Grafik Distribusi & Pengembalian" desc="6 bulan terakhir" className="xl:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafik}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="distribusi" name="Distribusi" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pengembalian" name="Pengembalian" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Perlu Perhatian" desc="Buku melewati atau mendekati jatuh tempo">
          {belumKembali.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada buku yang dipinjam.</p>
          ) : (
            <ul className="space-y-3">
              {belumKembali.slice(0, 6).map((b) => (
                <li key={b.id} className="rounded-2xl border border-border p-3.5">
                  <p className="text-sm font-semibold">{b.penerima}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.buku} • Kelas {b.kelas}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Tempo {b.jatuhTempo ? fmtTanggal(b.jatuhTempo) : "-"}
                    </span>
                    <Badge tone={b.telat > 0 ? "danger" : "warning"}>
                      {b.telat > 0 ? `Telat ${b.telat} hari` : "Aktif"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Aktivitas Distribusi Terbaru">
        <DataTable head={["ID", "Tanggal", "Penerima", "Kelas", "Buku", "Jumlah", "Status"]}>
          {state.distribusi.slice(0, 10).map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td className="text-muted-foreground">{fmtTanggal(d.tanggal)}</Td>
              <Td>{d.penerima}</Td>
              <Td>{d.kelas}</Td>
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
