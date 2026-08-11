import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  PackagePlus,
  RefreshCw,
  Users,
  AlertTriangle,
  BarChart3,
  User,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/sibudi/dashboard-shell";
import { GuruLoginGate } from "@/components/sibudi/guru-login";
import { useSibudi } from "@/lib/sibudi-store";

export const Route = createFileRoute("/guru")({
  head: () => ({
    meta: [
      { title: "Portal Guru SIBUDI — Wali Kelas SDN 1 Palapa" },
      { name: "description", content: "Inventaris buku kelas, distribusi, pengembalian, data siswa, buku belum kembali, dan laporan wali kelas." },
      { property: "og:title", content: "Portal Guru SIBUDI" },
      { property: "og:description", content: "Kelola buku kelas Anda: distribusi, pengembalian, dan laporan." },
    ],
  }),
  component: GuruLayout,
});

const items: NavItem[] = [
  { to: "/guru", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/guru/buku", label: "Inventaris Buku", icon: BookOpen },
  { to: "/guru/distribusi", label: "Distribusi", icon: PackagePlus },
  { to: "/guru/pengembalian", label: "Pengembalian", icon: RefreshCw },
  { to: "/guru/siswa", label: "Data Siswa", icon: Users },
  { to: "/guru/belum-kembali", label: "Belum Kembali", icon: AlertTriangle },
  { to: "/guru/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/guru/profil", label: "Profil", icon: User },
];

function GuruLayout() {
  return (
    <GuruLoginGate>
      <GuruShell />
    </GuruLoginGate>
  );
}

function GuruShell() {
  const { guruAktif, logoutGuru } = useSibudi();
  const nama = guruAktif?.nama ?? "Guru";
  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardShell
      portal="Portal Guru"
      items={items}
      onLogout={logoutGuru}
      user={{ name: nama, meta: `Wali Kelas ${guruAktif?.kelas ?? "-"}`, initials }}
    />
  );
}
