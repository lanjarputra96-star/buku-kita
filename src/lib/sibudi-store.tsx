import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bukuList as seedBuku,
  siswaList as seedSiswa,
  guruList as seedGuru,
  type Buku,
  type Siswa,
  type Guru,
} from "@/lib/sibudi-data";

export type GuruAkun = Guru & { username: string; password: string; wa?: string; waSynced?: boolean };

export type SiswaAkun = Siswa & { password?: string };

export type Notif = {
  id: string;
  nisn: string;
  judul: string;
  isi: string;
  waktu: string;
  tipe: "warning" | "success" | "info";
  kanal: string;
};

export type TransaksiItem = {
  id: string;
  tanggal: string; // ISO yyyy-mm-dd
  tipe: "Siswa" | "Guru";
  penerima: string;
  kelas: string;
  bukuKode: string;
  buku: string;
  jumlah: number;
  kondisi?: "Baik" | "Rusak Ringan" | "Rusak Berat" | "Hilang";
  status: "Dipinjam" | "Dikembalikan";
  catatan?: string;
};

export type LogItem = { waktu: string; aktor: string; aksi: string; tipe: string };

export type Pengaturan = {
  adminUser: string;
  adminPass: string;
  namaSekolah: string;
  kepalaSekolah: string;
  nipKepala: string;
  penanggungJawab: string;
  nipPenanggung: string;
};

export type SibudiState = {
  buku: Buku[];
  siswa: Siswa[];
  guru: GuruAkun[];
  distribusi: TransaksiItem[];
  pengembalian: TransaksiItem[];
  riwayat: LogItem[];
  pengaturan: Pengaturan;
  adminLoggedIn: boolean;
};

const KEY = "sibudi-state-v1";

const initialState: SibudiState = {
  buku: seedBuku,
  siswa: seedSiswa,
  guru: seedGuru.map((g, i) => ({
    ...g,
    username: g.email.split("@")[0] ?? `guru${i + 1}`,
    password: "guru123",
  })),
  distribusi: [
    { id: "DS-2401", tanggal: "2026-07-12", tipe: "Siswa", penerima: "Siti Nurhaliza", kelas: "3A", bukuKode: "BK-003", buku: "IPAS Kelas 3", jumlah: 1, status: "Dipinjam" },
    { id: "DS-2402", tanggal: "2026-07-12", tipe: "Siswa", penerima: "Ahmad Rizky Pratama", kelas: "1A", bukuKode: "BK-001", buku: "Matematika Kelas 1", jumlah: 1, status: "Dipinjam" },
    { id: "DS-2403", tanggal: "2026-07-10", tipe: "Guru", penerima: "Rina Kartika, S.Pd", kelas: "5B", bukuKode: "BK-005", buku: "Bahasa Inggris Kelas 5", jumlah: 2, status: "Dipinjam" },
    { id: "DS-2404", tanggal: "2026-07-05", tipe: "Siswa", penerima: "Dewi Lestari", kelas: "1A", bukuKode: "BK-002", buku: "Bahasa Indonesia Kelas 1", jumlah: 1, status: "Dikembalikan" },
  ],
  pengembalian: [
    { id: "PB-1201", tanggal: "2026-07-14", tipe: "Siswa", penerima: "Dewi Lestari", kelas: "1A", bukuKode: "BK-002", buku: "Bahasa Indonesia Kelas 1", jumlah: 1, kondisi: "Baik", status: "Dikembalikan" },
    { id: "PB-1202", tanggal: "2026-07-14", tipe: "Siswa", penerima: "Nabila Az-Zahra", kelas: "6A", bukuKode: "BK-006", buku: "Seni Budaya Kelas 6", jumlah: 1, kondisi: "Rusak Ringan", status: "Dikembalikan" },
  ],
  riwayat: [
    { waktu: "2026-07-14 09:12", aktor: "Administrator", aksi: "Menyetujui pengembalian PB-1201", tipe: "Pengembalian" },
    { waktu: "2026-07-12 07:45", aktor: "Administrator", aksi: "Menambah stok buku BK-003 (+10)", tipe: "Master Buku" },
  ],
  pengaturan: {
    adminUser: "admin",
    adminPass: "admin123",
    namaSekolah: "SD Negeri 1 Palapa",
    kepalaSekolah: "Drs. Sukarno, M.Pd",
    nipKepala: "19650312 198903 1 004",
    penanggungJawab: "Siti Aminah, S.Pd",
    nipPenanggung: "19780512 200604 2 001",
  },
  adminLoggedIn: false,
};

type Ctx = {
  state: SibudiState;
  ready: boolean;
  update: (fn: (s: SibudiState) => SibudiState) => void;
  log: (aksi: string, tipe: string) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
};

const SibudiContext = createContext<Ctx | null>(null);

export function SibudiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SibudiState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as SibudiState) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const update = useCallback((fn: (s: SibudiState) => SibudiState) => setState((s) => fn(s)), []);

  const log = useCallback((aksi: string, tipe: string) => {
    const waktu = new Date().toISOString().slice(0, 16).replace("T", " ");
    setState((s) => ({ ...s, riwayat: [{ waktu, aktor: "Administrator", aksi, tipe }, ...s.riwayat] }));
  }, []);

  const login = useCallback(
    (user: string, pass: string) => {
      let ok = false;
      setState((s) => {
        ok = user.trim() === s.pengaturan.adminUser && pass === s.pengaturan.adminPass;
        return ok ? { ...s, adminLoggedIn: true } : s;
      });
      return ok;
    },
    [],
  );

  const logout = useCallback(() => setState((s) => ({ ...s, adminLoggedIn: false })), []);

  const value = useMemo(() => ({ state, ready, update, log, login, logout }), [state, ready, update, log, login, logout]);

  return <SibudiContext.Provider value={value}>{children}</SibudiContext.Provider>;
}

export function useSibudi() {
  const ctx = useContext(SibudiContext);
  if (!ctx) throw new Error("useSibudi must be used inside SibudiProvider");
  return ctx;
}

export const KELAS_LIST = ["1A", "1B", "2A", "3A", "4A", "5B", "6A"];

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function fmtTanggal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
