import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Package, BookMarked, Bell, User } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/sibudi/dashboard-shell";
import { OrtuLoginGate } from "@/components/sibudi/ortu-login";
import { useSibudi } from "@/lib/sibudi-store";


export const Route = createFileRoute("/ortu")({
  head: () => ({
    meta: [
      { title: "Portal Orang Tua SIBUDI — SDN 1 Palapa" },
      { name: "description", content: "Pantau buku pinjaman ananda, ajukan pengembalian, dan terima notifikasi sekolah." },
      { property: "og:title", content: "Portal Orang Tua SIBUDI" },
      { property: "og:description", content: "Transparansi buku pinjaman siswa untuk wali murid." },
    ],
  }),
  component: OrtuLayout,
});

const items: NavItem[] = [
  { to: "/ortu", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/ortu/peminjaman", label: "Peminjaman Buku", icon: Package },
  { to: "/ortu/pengembalian", label: "Pengembalian Buku", icon: BookMarked },
  { to: "/ortu/notifikasi", label: "Notifikasi", icon: Bell },
  { to: "/ortu/profil", label: "Profil", icon: User },
];

function OrtuLayout() {
  const { siswaAktif, logoutOrtu } = useSibudi();
  const nama = siswaAktif?.nama ?? "Orang Tua";
  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <OrtuLoginGate>
      <DashboardShell
        portal="Portal Orang Tua"
        items={items}
        notifNisn={siswaAktif?.nisn}
        onLogout={logoutOrtu}
        user={{
          name: nama,
          meta: `Kelas ${siswaAktif?.kelas ?? "-"} • NISN ${siswaAktif?.nisn ?? "-"}`,
          initials: initials || "OT",
        }}
      />
    </OrtuLoginGate>
  );
}

