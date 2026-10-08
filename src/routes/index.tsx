import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Users,
  PackageCheck,
  RefreshCw,
  BarChart3,
  Bell,
  ArrowRight,
} from "lucide-react";
import { SCHOOL } from "@/lib/sibudi-data";
import { useSibudi } from "@/lib/sibudi-store";
import { useMemo } from "react";
import { BrandLogo } from "@/components/sibudi/brand-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIBUDI — Sistem Informasi Buku Digital SDN 1 Palapa" },
      {
        name: "description",
        content:
          "SIBUDI mengelola distribusi dan pengembalian buku sekolah SD Negeri 1 Palapa untuk admin, guru, dan orang tua dalam satu portal.",
      },
      { property: "og:title", content: "SIBUDI — Sistem Informasi Buku Digital SDN 1 Palapa" },
      {
        property: "og:description",
        content: "Portal distribusi buku sekolah: admin, guru wali kelas, dan orang tua siswa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const fitur = [
  { icon: PackageCheck, judul: "Distribusi Terkontrol", isi: "Catat penyerahan buku per siswa, per kelas, atau serentak satu rombel." },
  { icon: RefreshCw, judul: "Pengembalian Rapi", isi: "Ajukan, verifikasi, dan catat kondisi buku saat dikembalikan." },
  { icon: BarChart3, judul: "Laporan Instan", isi: "Rekap peminjaman siap cetak dan ekspor Excel kapan saja." },
  { icon: Bell, judul: "Pengingat Otomatis", isi: "Notifikasi jatuh tempo langsung ke wali murid via WhatsApp." },
];

const portals = [
  {
    to: "/admin",
    icon: ShieldCheck,
    nama: "Portal Admin",
    isi: "Master buku, data siswa & guru, distribusi, riwayat, laporan, pengaturan.",
  },
  {
    to: "/guru",
    icon: GraduationCap,
    nama: "Portal Guru",
    isi: "Inventaris kelas, distribusi, pengembalian, data siswa, buku belum kembali.",
  },
  {
    to: "/ortu",
    icon: Users,
    nama: "Portal Siswa",
    isi: "Pantau buku pinjaman ananda, status pengembalian, dan notifikasi sekolah.",
  },
];

function Landing() {
  const { state, ready } = useSibudi();

  const stats = useMemo(() => {
    const bukuTersedia = state.buku.reduce((sum, b) => sum + Math.max(0, b.stok - (b.dipinjam ?? 0)), 0);
    const siswaAktif = state.siswa.length;
    const totalPinjam = state.distribusi.filter((d) => d.status === "Dipinjam").length;
    const totalKembali = state.pengembalian.filter((p) => p.status === "Dikembalikan").length;
    const tingkatKembali = totalPinjam > 0 ? Math.round((totalKembali / totalPinjam) * 100) : 0;
    return [
      [bukuTersedia.toLocaleString("id-ID"), "Buku tersedia"],
      [siswaAktif.toLocaleString("id-ID"), "Siswa aktif"],
      [`${tingkatKembali}%`, "Tingkat kembali"],
    ] as [string, string][];
  }, [state.buku, state.siswa, state.distribusi, state.pengembalian]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-soft via-background to-accent">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <BrandLogo className="size-6" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-tight tracking-tight">{SCHOOL.app}</p>
            <p className="text-[11px] text-muted-foreground">{SCHOOL.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <BookOpen className="size-4" /> {SCHOOL.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Distribusi buku sekolah, <span className="text-primary">tertib dan terlacak</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              SIBUDI menyatukan pekerjaan admin, wali kelas, dan orang tua dalam satu sistem: dari
              pendataan buku, penyerahan ke siswa, sampai pengembalian dan laporan akhir semester.
            </p>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
              {stats.map(([v, l]) => (
                <div key={l} className="card-surface p-4">
                  <dt className="text-lg font-bold text-primary">{ready ? v : "—"}</dt>
                  <dd className="text-[11px] text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-surface space-y-4 p-6">
            <p className="text-sm font-bold">Pilih portal Anda</p>
            {portals.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="group flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors hover:border-primary hover:bg-accent"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {p.nama}
                    <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {p.isi}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-2xl font-bold tracking-tight">Fitur utama</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Semua kebutuhan pengelolaan buku sekolah dalam satu aplikasi.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fitur.map((f) => (
              <div key={f.judul} className="card-surface p-5">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold">{f.judul}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.isi}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/60 px-5 py-6 text-center text-xs text-muted-foreground">
        © 2026 {SCHOOL.app} — {SCHOOL.name}, {SCHOOL.city}.
      </footer>
    </div>
  );
}
