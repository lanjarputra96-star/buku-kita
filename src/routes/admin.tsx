import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Book,
  GraduationCap,
  Users,
  PackagePlus,
  RefreshCw,
  History,
  BarChart3,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/sibudi/dashboard-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Portal Admin SIBUDI — SDN 1 Palapa" },
      { name: "description", content: "Kelola master buku, data siswa dan guru, distribusi, pengembalian, riwayat, serta laporan buku sekolah." },
      { property: "og:title", content: "Portal Admin SIBUDI" },
      { property: "og:description", content: "Pusat kendali distribusi buku SD Negeri 1 Palapa." },
    ],
  }),
  component: AdminLayout,
});

const items: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/master-buku", label: "Master Buku", icon: Book },
  { to: "/admin/data-siswa", label: "Data Siswa", icon: GraduationCap },
  { to: "/admin/data-guru", label: "Data Guru", icon: Users },
  { to: "/admin/distribusi", label: "Distribusi Buku", icon: PackagePlus },
  { to: "/admin/pengembalian", label: "Pengembalian", icon: RefreshCw },
  { to: "/admin/riwayat", label: "Riwayat", icon: History },
  { to: "/admin/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

function AdminLayout() {
  return (
    <DashboardShell
      portal="Portal Admin"
      items={items}
      user={{ name: "Administrator", meta: "admin@sdn1palapa.sch.id", initials: "AD" }}
    />
  );
}
