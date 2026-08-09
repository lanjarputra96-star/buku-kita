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
import { distribusiList, grafikBulanan, belumKembaliList } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <PageHeader title="Dashboard" desc="Ringkasan distribusi buku sekolah tahun ajaran 2026/2027." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Buku" value="1.248" hint="42 judul terdaftar" icon={<Book className="size-5" />} />
        <StatCard label="Total Siswa" value="386" hint="12 rombongan belajar" icon={<GraduationCap className="size-5" />} tone="info" />
        <StatCard label="Buku Terdistribusi" value="1.032" hint="Bulan ini +232" icon={<PackagePlus className="size-5" />} tone="success" />
        <StatCard label="Belum Kembali" value="74" hint="9 di antaranya terlambat" icon={<AlertTriangle className="size-5" />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Grafik Distribusi & Pengembalian" desc="6 bulan terakhir" className="xl:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafikBulanan}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
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
          <ul className="space-y-3">
            {belumKembaliList.map((b) => (
              <li key={b.siswa + b.buku} className="rounded-2xl border border-border p-3.5">
                <p className="text-sm font-semibold">{b.siswa}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {b.buku} • Kelas {b.kelas}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Tempo {b.jatuhTempo}</span>
                  <Badge tone={b.telat > 0 ? "danger" : "warning"}>
                    {b.telat > 0 ? `Telat ${b.telat} hari` : "Aktif"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Aktivitas Distribusi Terbaru">
        <DataTable head={["ID", "Tanggal", "Siswa", "Kelas", "Buku", "Jumlah", "Status"]}>
          {distribusiList.map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td className="text-muted-foreground">{d.tanggal}</Td>
              <Td>{d.siswa}</Td>
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
