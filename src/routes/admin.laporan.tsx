import { createFileRoute } from "@tanstack/react-router";
import { Printer, Download } from "lucide-react";
import { PageHeader, Panel, DataTable, Td, StatCard } from "@/components/sibudi/ui-kit";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { grafikBulanan, distribusiList, SCHOOL } from "@/lib/sibudi-data";

export const Route = createFileRoute("/admin/laporan")({
  component: LaporanAdmin,
});

function LaporanAdmin() {
  return (
    <>
      <PageHeader
        title="Laporan"
        desc="Rekapitulasi peminjaman dan pengembalian buku sekolah."
        actions={
          <>
            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <Printer className="size-4" /> Cetak
            </button>
            <button className="no-print inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              <Download className="size-4" /> Export Excel
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Distribusi" value="971" hint="Semester ini" />
        <StatCard label="Total Pengembalian" value="811" tone="success" />
        <StatCard label="Rasio Kembali" value="83,5%" tone="info" />
        <StatCard label="Buku Rusak/Hilang" value="17" tone="danger" />
      </div>

      <Panel title="Tren Peminjaman">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grafikBulanan}>
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
              <Line type="monotone" dataKey="distribusi" name="Distribusi" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="pengembalian" name="Pengembalian" stroke="var(--chart-4)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel id="print-area" title="Rekapitulasi Transaksi">
        <div className="mb-4 border-b border-border pb-4 text-center">
          <p className="text-xs font-semibold uppercase">Pemerintah Kota {SCHOOL.city}</p>
          <p className="text-sm font-bold uppercase">Dinas Pendidikan dan Kebudayaan</p>
          <p className="text-base font-extrabold uppercase">{SCHOOL.name}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Laporan Distribusi & Pengembalian Buku — Tahun Ajaran 2026/2027
          </p>
        </div>
        <DataTable head={["ID", "Tanggal", "Siswa", "Kelas", "Buku", "Jumlah", "Status"]}>
          {distribusiList.map((d) => (
            <tr key={d.id}>
              <Td className="font-semibold">{d.id}</Td>
              <Td>{d.tanggal}</Td>
              <Td>{d.siswa}</Td>
              <Td>{d.kelas}</Td>
              <Td>{d.buku}</Td>
              <Td>{d.jumlah}</Td>
              <Td>{d.status}</Td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
