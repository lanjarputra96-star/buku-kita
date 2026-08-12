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

export type SiswaAkun = Siswa & { password?: string; setupDone?: boolean };

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
  status: "Dipinjam" | "Dikembalikan" | "Diajukan" | "Ditolak";
  catatan?: string;
  diterima?: boolean;
  nisn?: string;
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
  siswa: SiswaAkun[];
  guru: GuruAkun[];
  distribusi: TransaksiItem[];
  pengembalian: TransaksiItem[];
  riwayat: LogItem[];
  notifikasi: Notif[];
  pengaturan: Pengaturan;
  adminLoggedIn: boolean;
  guruLoggedIn: string | null;
  ortuLoggedIn: string | null;

};

const KEY = "sibudi-state-v1";

const initialState: SibudiState = {
  buku: seedBuku,
  siswa: seedSiswa.map((s) => ({ ...s, password: "ortu123" })),
  guru: seedGuru.map((g, i) => ({
    ...g,
    username: g.email.split("@")[0] ?? `guru${i + 1}`,
    password: "guru123",
    wa: "",
    waSynced: false,
  })),
  notifikasi: [],
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
  guruLoggedIn: null,
  ortuLoggedIn: null,
};

type Ctx = {
  state: SibudiState;
  ready: boolean;
  update: (fn: (s: SibudiState) => SibudiState) => void;
  log: (aksi: string, tipe: string) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  loginGuru: (user: string, pass: string) => boolean;
  logoutGuru: () => void;
  guruAktif: GuruAkun | null;
  loginOrtu: (nisn: string, pass: string) => boolean;
  logoutOrtu: () => void;
  setupOrtu: (password: string, wa: string) => void;
  siswaAktif: SiswaAkun | null;
  kirimNotif: (n: Omit<Notif, "id" | "waktu">) => void;
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

  const loginGuru = useCallback((user: string, pass: string) => {
    let ok = false;
    setState((s) => {
      const g = s.guru.find((x) => x.username.toLowerCase() === user.trim().toLowerCase() && x.password === pass);
      ok = Boolean(g);
      return g ? { ...s, guruLoggedIn: g.username } : s;
    });
    return ok;
  }, []);

  const logoutGuru = useCallback(() => setState((s) => ({ ...s, guruLoggedIn: null })), []);

  const loginOrtu = useCallback((nisn: string, pass: string) => {
    let ok = false;
    setState((s) => {
      const siswa = s.siswa.find((x) => x.nisn.trim() === nisn.trim() && (x.password ?? "ortu123") === pass);
      ok = Boolean(siswa);
      return siswa ? { ...s, ortuLoggedIn: siswa.nisn } : s;
    });
    return ok;
  }, []);

  const logoutOrtu = useCallback(() => setState((s) => ({ ...s, ortuLoggedIn: null })), []);

  const setupOrtu = useCallback((password: string, wa: string) => {
    setState((s) => ({
      ...s,
      siswa: s.siswa.map((x) => (x.nisn === s.ortuLoggedIn ? { ...x, password, wa, setupDone: true } : x)),
    }));
  }, []);

  const kirimNotif = useCallback((n: Omit<Notif, "id" | "waktu">) => {
    const waktu = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    setState((s) => ({
      ...s,
      notifikasi: [{ ...n, id: `NT-${Math.random().toString(36).slice(2, 8)}`, waktu }, ...s.notifikasi],
    }));
  }, []);

  const guruAktif = useMemo(
    () => state.guru.find((g) => g.username === state.guruLoggedIn) ?? null,
    [state.guru, state.guruLoggedIn],
  );

  const siswaAktif = useMemo(
    () => state.siswa.find((s) => s.nisn === state.ortuLoggedIn) ?? null,
    [state.siswa, state.ortuLoggedIn],
  );

  const value = useMemo(
    () => ({
      state, ready, update, log, login, logout, loginGuru, logoutGuru, guruAktif,
      loginOrtu, logoutOrtu, setupOrtu, siswaAktif, kirimNotif,
    }),
    [state, ready, update, log, login, logout, loginGuru, logoutGuru, guruAktif, loginOrtu, logoutOrtu, setupOrtu, siswaAktif, kirimNotif],
  );


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

export function waNumber(no: string) {
  const digits = (no || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

export function waLink(no: string, pesan: string) {
  return `https://wa.me/${waNumber(no)}?text=${encodeURIComponent(pesan)}`;
}
