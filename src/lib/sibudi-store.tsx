import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Buku, Siswa, Guru } from "@/lib/sibudi-data";

export type GuruAkun = Guru & { username: string; password: string; wa?: string; waSynced?: boolean };

export type SiswaAkun = Siswa & {
  password?: string;
  setupDone?: boolean;
  hubungan?: string;
  email?: string;
  alamat?: string;
};

export type Notif = {
  id: string;
  nisn: string;
  judul: string;
  isi: string;
  waktu: string;
  tipe: "warning" | "success" | "info";
  kanal: string;
};

export type PesanWa = {
  id: string;
  waktu: string;
  tujuan: string;
  nama: string;
  pesan: string;
  status: "Terkirim" | "Antre";
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
  jatuhTempo?: string;
};

export type LogItem = { waktu: string; aktor: string; aksi: string; tipe: string };

export type Kunjungan = {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  tanggal: string; // yyyy-mm-dd
  jam: string; // HH:MM
  keperluan: string;
};

export type Ebook = {
  id: string;
  judul: string;
  penulis: string;
  kategori: string;
  kelas: string;
  deskripsi: string;
  path: string; // path di storage bucket "ebooks"
  ukuran: number; // bytes
  tanggal: string; // ISO
};

export type KartuSetting = {
  judul: string;
  subjudul: string;
  warnaHeader: string; // hex
  logo: string; // data URL, kosong = tanpa logo
  tampilkanFoto: boolean;
  tampilkanBarcode: boolean;
  tampilkanKelas: boolean;
  tampilkanPenanggung: boolean;
  catatan: string;
  kolom: number;
  baris: number;
};

export type Pengaturan = {
  adminUser: string;
  adminPass: string;
  namaSekolah: string;
  kepalaSekolah: string;
  nipKepala: string;
  penanggungJawab: string;
  nipPenanggung: string;
  botNama: string;
  botWa: string;
  kartu: KartuSetting;
};

export const defaultKartu: KartuSetting = {
  judul: "KARTU ANGGOTA PERPUSTAKAAN",
  subjudul: "",
  warnaHeader: "#486E58",
  logo: "",
  tampilkanFoto: true,
  tampilkanBarcode: true,
  tampilkanKelas: true,
  tampilkanPenanggung: true,
  catatan: "Kartu ini wajib dibawa saat meminjam buku.",
  kolom: 2,
  baris: 5,
};


export type SibudiState = {
  buku: Buku[];
  siswa: SiswaAkun[];
  guru: GuruAkun[];
  distribusi: TransaksiItem[];
  pengembalian: TransaksiItem[];
  riwayat: LogItem[];
  notifikasi: Notif[];
  pesanWa: PesanWa[];
  kunjungan: Kunjungan[];
  ebook: Ebook[];
  pengaturan: Pengaturan;
  adminLoggedIn: boolean;
  guruLoggedIn: string | null;
  ortuLoggedIn: string | null;
};

const KEY = "sibudi-state-v2";
const ROW_ID = "main";

const initialState: SibudiState = {
  buku: [],
  siswa: [],
  guru: [],
  notifikasi: [],
  pesanWa: [],
  kunjungan: [],
  ebook: [],
  distribusi: [],
  pengembalian: [],
  riwayat: [],
  pengaturan: {
    adminUser: "admin",
    adminPass: "admin123",
    namaSekolah: "SD Negeri 1 Palapa",
    kepalaSekolah: "",
    nipKepala: "",
    penanggungJawab: "",
    nipPenanggung: "",
    botNama: "Chatbot SIBUDI",
    botWa: "",
    kartu: defaultKartu,
  },
  adminLoggedIn: false,
  guruLoggedIn: null,
  ortuLoggedIn: null,
};

/** Bagian data yang disimpan di cloud (tanpa status login perangkat). */
type SharedState = Omit<SibudiState, "adminLoggedIn" | "guruLoggedIn" | "ortuLoggedIn">;

function shared(s: SibudiState): SharedState {
  const { adminLoggedIn: _a, guruLoggedIn: _g, ortuLoggedIn: _o, ...rest } = s;
  return rest;
}

function mergeShared(base: SibudiState, data: Partial<SharedState> | null): SibudiState {
  if (!data || Object.keys(data).length === 0) return base;
  return {
    ...base,
    ...data,
    pengaturan: {
      ...base.pengaturan,
      ...(data.pengaturan ?? {}),
      kartu: { ...defaultKartu, ...(data.pengaturan?.kartu ?? {}) },
    },
    buku: data.buku ?? base.buku,
    siswa: data.siswa ?? base.siswa,
    guru: data.guru ?? base.guru,
    distribusi: data.distribusi ?? base.distribusi,
    pengembalian: data.pengembalian ?? base.pengembalian,
    riwayat: data.riwayat ?? base.riwayat,
    notifikasi: data.notifikasi ?? base.notifikasi,
    pesanWa: data.pesanWa ?? base.pesanWa,
    kunjungan: data.kunjungan ?? base.kunjungan,
    ebook: data.ebook ?? base.ebook,
  };
}

type Ctx = {
  state: SibudiState;
  ready: boolean;
  syncing: boolean;
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
  kirimWa: (tujuan: string, nama: string, pesan: string) => void;
};

const SibudiContext = createContext<Ctx | null>(null);

export function SibudiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SibudiState>(initialState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Muat data: cache lokal dulu, lalu cloud (agar bisa dibuka di perangkat lain).
  useEffect(() => {
    let alive = true;
    (async () => {
      let local: SibudiState = initialState;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) local = mergeShared(initialState, JSON.parse(raw) as Partial<SharedState>);
      } catch {
        /* ignore */
      }
      if (alive) setState(local);

      try {
        const { data } = await supabase.from("sibudi_state").select("data").eq("id", ROW_ID).maybeSingle();
        const remote = (data?.data ?? null) as Partial<SharedState> | null;
        if (alive && remote && Object.keys(remote).length > 0) setState(mergeShared(initialState, remote));
      } catch {
        /* offline: pakai cache lokal */
      }
      if (!alive) return;
      loaded.current = true;
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Simpan ke cache lokal + cloud (debounce).
  useEffect(() => {
    if (!ready || !loaded.current) return;
    const payload = shared(state);
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        await supabase
          .from("sibudi_state")
          .upsert({ id: ROW_ID, data: payload as never, updated_at: new Date().toISOString() });
      } catch {
        /* ignore */
      }
      setSyncing(false);
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, ready]);

  const update = useCallback((fn: (s: SibudiState) => SibudiState) => setState((s) => fn(s)), []);

  const log = useCallback((aksi: string, tipe: string, aktor = "Administrator") => {
    const waktu = new Date().toISOString().slice(0, 16).replace("T", " ");
    setState((s) => ({ ...s, riwayat: [{ waktu, aktor, aksi, tipe }, ...s.riwayat] }));
  }, []);

  const login = useCallback((user: string, pass: string) => {
    let ok = false;
    setState((s) => {
      ok = user.trim() === s.pengaturan.adminUser && pass === s.pengaturan.adminPass;
      return ok ? { ...s, adminLoggedIn: true } : s;
    });
    return ok;
  }, []);

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

  /** Kirim pesan lewat chatbot sekolah (bukan WhatsApp pribadi guru). */
  const kirimWa = useCallback((tujuan: string, nama: string, pesan: string) => {
    const waktu = new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    setState((s) => ({
      ...s,
      pesanWa: [
        {
          id: `WA-${Math.random().toString(36).slice(2, 8)}`,
          waktu,
          tujuan: waNumber(tujuan),
          nama,
          pesan,
          status: (s.pengaturan.botWa ? "Terkirim" : "Antre") as PesanWa["status"],
        },
        ...s.pesanWa,
      ].slice(0, 200),
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
      state, ready, syncing, update, log, login, logout, loginGuru, logoutGuru, guruAktif,
      loginOrtu, logoutOrtu, setupOrtu, siswaAktif, kirimNotif, kirimWa,
    }),
    [state, ready, syncing, update, log, login, logout, loginGuru, logoutGuru, guruAktif, loginOrtu, logoutOrtu, setupOrtu, siswaAktif, kirimNotif, kirimWa],
  );

  return <SibudiContext.Provider value={value}>{children}</SibudiContext.Provider>;
}

export function useSibudi() {
  const ctx = useContext(SibudiContext);
  if (!ctx) throw new Error("useSibudi must be used inside SibudiProvider");
  return ctx;
}

export const KELAS_LIST = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function fmtTanggal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function hariTelat(jatuhTempo?: string) {
  if (!jatuhTempo) return 0;
  const d = new Date(jatuhTempo);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
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
